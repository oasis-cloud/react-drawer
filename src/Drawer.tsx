import React, {
  createRef,
  CSSProperties,
  isValidElement,
  PureComponent,
  ReactNode,
} from "react";
import { defaultProps } from "./defaults";
import ReactDOM from "react-dom";

export interface PushState {
  distance: string | number;
}

interface DrawerProps {
  close: boolean | string | ReactNode;
  footer: ReactNode;
  footerStyle: CSSProperties;
  bodyStyle: CSSProperties;
  maskStyle: CSSProperties;
  style: CSSProperties;
  title: ReactNode;
  titleStyle: CSSProperties;
  visible: boolean;
  mask: boolean;
  maskClosable: boolean;
  width: number;
  zIndex: number;
  height: number;
  push: boolean | PushState;
  onClose: () => {};
  afterVisibleChange: (e) => {};
  getContainer: HTMLElement | false;
  placement: "top" | "right" | "bottom" | "left";
}

interface DrawerState {
  visible: boolean;
  push: boolean;
}

let bodyOverFlowCounter = 0;
const DrawerContext = React.createContext<Drawer | null>(null);

export class Drawer extends PureComponent<DrawerProps, DrawerState> {
  static NAME = "drawer";
  private divRef = createRef<HTMLDivElement>();
  static defaultProps = defaultProps;
  parentDrawer: Drawer | null;
  opened: boolean;

  constructor(props) {
    super(props);
    this.state = { visible: props.visible, push: false };
  }

  handleTransitionEnd = (e) => {
    if (e.propertyName == "transform") {
      this.props.afterVisibleChange && this.props.afterVisibleChange(e);
    }
  };

  componentWillReceiveProps(nextProps: Readonly<any>, nextContext: any) {
    if (nextProps.visible) {
      this.opened = true;
    }
    this.setState({
      visible: nextProps.visible,
    });
  }

  componentDidUpdate(prevProps) {
    const { visible, getContainer } = this.props;

    let container = getContainer || document.body;
    if (container == document.body) {
      if (this.state.visible == true) {
        document.body.classList.add("overflow-hidden");
      } else {
        --bodyOverFlowCounter;
        if (bodyOverFlowCounter == 0) {
          document.body.classList.remove("overflow-hidden");
        }
      }
    }

    if (visible !== prevProps.visible && this.parentDrawer) {
      if (visible) {
        this.parentDrawer.push();
      } else {
        this.parentDrawer.pull();
      }
    }
    if (this.state.visible) {
      setTimeout(() => {
        this.divRef.current?.classList.add("drawer-open");
      }, 0);
    } else {
      this.divRef.current?.classList.remove("drawer-open");
    }
  }

  componentWillUnmount() {
    if (this.parentDrawer) {
      this.parentDrawer.pull();
      this.parentDrawer = null;
    }
  }

  close = () => {
    this.setState(
      {
        visible: false,
      },
      () => {
        this.props.onClose && this.props.onClose();
        document.body.classList.remove("overflow-hidden");
      }
    );
  };
  handleMaskClose = () => {
    this.props.maskClosable && this.close();
  };
  handleCloseIcon = () => {
    this.close();
  };

  push() {
    this.setState({
      push: true,
    });
  }

  pull() {
    this.setState({
      push: false,
    });
  }

  renderCloseIcon() {
    // const iconAtomics = ['w-2', 'h-2', 'fill-gray-400', 'ml-1', '-mt-px-2']
    return this.props.close === false ? null : (
      <span
        className="drawer-close"
        onClick={this.handleCloseIcon}
        // atomics={['cursor-pointer', 'text-sm', 'absolute']}
      >
        <span
          // atomics={iconAtomics}
          className="drawer-close-icon"
        >
          {this.props.close === true ? "X" : null}
          {isValidElement(this.props.close) && this.props.close}
        </span>
      </span>
    );
  }

  renderTitle() {
    const { titleStyle, title } = this.props;
    return title ? (
      <div
        className="drawer-header"
        style={titleStyle}
        // atomics={[
        //     'w-full',
        //     'h-px-56',
        //     'border-b',
        //     'border-gray-200',
        //     'text-black',
        //     'bg-white',
        //     'py-px-16',
        //     'px-px-24',
        // ]}
      >
        <div className="drawer-title">{title}</div>
        {this.renderCloseIcon()}
      </div>
    ) : null;
  }

  renderFooter() {
    const { footer, footerStyle } = this.props;
    return footer ? (
      <div
        className="drawer-footer"
        style={footerStyle}
        // atomics={[
        //     'w-full',
        //     'h-px-56',
        //     'border-t',
        //     'border-gray-200',
        //     'w-full',
        //     'py-px-16',
        //     'px-px-24',
        // ]}
      >
        Footer
      </div>
    ) : null;
  }

  getPushDistance = () => {
    const { push } = this.props;
    let distance: number | string;
    if (typeof push === "boolean") {
      distance = push ? 180 : 0;
    } else {
      distance = push!.distance;
    }
    return parseFloat(String(distance || 0));
  };

  getPushTransform(placement) {
    const distance = this.getPushDistance();

    if (placement === "left" || placement === "right") {
      return `translateX(${placement === "left" ? distance : -distance}px)`;
    }
    if (placement === "top" || placement === "bottom") {
      return `translateY(${placement === "top" ? distance : -distance}px)`;
    }
  }

  getParentDrawerStyle() {
    const { push } = this.state;
    const { placement } = this.props;
    return {
      transform: push ? this.getPushTransform(placement) : undefined,
    };
  }

  renderWraper() {
    let wrapperStyle = {};
    const {
      maskStyle,
      placement,
      bodyStyle,
      style,
      zIndex,
      width,
      height,
      ...rest
    } = this.props;

    switch (placement) {
      case "bottom":
      case "top":
        wrapperStyle = { height: `${height}px` };
        break;
      case "right":
      case "left":
        wrapperStyle = { width: `${width}px` };
        break;
    }
    let position = {};
    if (this.props.getContainer === false) {
      position = {
        position: "absolute",
      };
    }
    const parentDrawerStyle = this.getParentDrawerStyle();
    return this.opened ? (
      <div
        ref={this.divRef}
        // atomics={['h-full']}
        onTransitionEnd={this.handleTransitionEnd}
        style={{ zIndex: zIndex, ...style, ...position }}
        className={`oasis-drawer drawer-portal drawer-${placement} `}
      >
        {this.props.mask ? (
          <div
            className="drawer-mask"
            style={maskStyle}
            onClick={this.handleMaskClose}
            // atomics={['absolute', 'w-full', 'h-full', 'top-0', 'left-0']}
          ></div>
        ) : null}
        <div
          className="drawer-content-wrapper"
          // atomics={['absolute']}
          style={{ ...wrapperStyle, ...parentDrawerStyle }}
        >
          <div
            className="drawer-content"
            // atomics={['h-full', 'w-full']}
          >
            <div
              className="drawer-wrapper-body"
              style={bodyStyle}
              // atomics={['flex', 'flex-col', 'w-full', 'h-full', 'bg-white']}
            >
              {this.renderTitle()}
              <div
                className="drawer-body"
                // atomics={['w-full', 'py-px-16', 'px-px-24']}
              >
                {this.props.children}
              </div>
              {this.renderFooter()}
            </div>
          </div>
        </div>
      </div>
    ) : null;
  }

  renderProvider = (value: Drawer) => {
    this.parentDrawer = value;

    const { getContainer } = this.props;
    let container = getContainer || document.body;
    return (
      <DrawerContext.Provider value={this}>
        {getContainer === false
          ? this.renderWraper()
          : ReactDOM.createPortal(this.renderWraper(), container)}
      </DrawerContext.Provider>
    );
  };

  render() {
    return (
      <DrawerContext.Consumer>{this.renderProvider}</DrawerContext.Consumer>
    );
  }
}

Drawer.contextType = DrawerContext;
