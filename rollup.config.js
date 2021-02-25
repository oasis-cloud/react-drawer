import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.ts',
  external:['react','react-dom'],
  output: [
    {
      file: 'lib/index.js',
      format: 'cjs'
    },
    {
      file: 'es/index.js',
      format: 'esm'
    }
  ],
  plugins: [
    commonjs(),
    typescript({
      typescript: require("typescript"),
    }),
  ]
};