import "react-drawer/style/css/drawer.css";
import Drawer from "react-drawer";
import { useState } from "react";

function App() {
  const [visible, setVisible] = useState(false);
  return (
    <div className="App">
      <div
        onClick={() => {
          setVisible(true);
        }}
      >
        Click
      </div>
      <Drawer
        visible={visible}
        onClose={() => {
          setVisible(false);
        }}
        placement={"bottom"}
        title={<p>title</p>}
        titleStyle={{ background: "#FBB" }}
        bodyStyle={{ background: "#FCB" }}
        footer={<p>footer</p>}
        footerStyle={{ background: "#FCD" }}
        mask={true}
        maskClosable={true}
        zIndex={2000}
        afterVisibleChange={() => {}}
      >
        Test
      </Drawer>
    </div>
  );
}

export default App;
