import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import rollupTypescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import { uglify } from 'rollup-plugin-uglify';

export default [
  // browser-friendly UMD build
  {
    input: 'src/index.tsx',
    output: {
      name: 'rope',
      file: pkg.browser,
      format: 'umd',
    },
    plugins: [
      resolve(), // so Rollup can find `react` and `react-dom`
      rollupTypescript(),
      babel({
        exclude: '**/node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx'], // 让babel能对ts解析过的代码编译
      }),
      commonjs(), // so Rollup can convert `ms` to an ES module
      uglify({
        output: {
          comments: 'some',
        },
      }),
    ],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'src/index.tsx',
    external: ['react', 'react-dom'],
    output: [
      { file: pkg.main, format: 'cjs' }, // 转换给 node 使用
      { file: pkg.module, format: 'es' }, // 转换给 webpack 使用
    ],
    plugins: [
      rollupTypescript({
        noEmit: false,
      }),
      babel({
        exclude: '**/node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx'], // 让babel能对ts解析过的代码编译
      }),
    ],
  },
];
