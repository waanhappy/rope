/* eslint-disable @typescript-eslint/no-var-requires */
const commonjs = require('rollup-plugin-commonjs');
const rollupTypescript = require('rollup-plugin-typescript2');
const autoExternal = require('rollup-plugin-auto-external');
const resolve = require('rollup-plugin-node-resolve');
const packageJson = require('./package.json');
// const babel = require('rollup-plugin-babel');

const name = process.env.npm_package_name;
const version = process.env.npm_package_version;
// const moduleFile = packageJson.module;
const mainFile = packageJson.main;

// 如果后期遇到
// babel({
//   exclude: '**/node_modules/**',
//   extensions: ['.js', '.ts'], // 让babel能对ts解析过的代码编译
//   runtimeHelpers: false,
//   babelrc: false,
//   presets: [['@babel/env', { targets: { node: '8.9.4' } }]],
// }),
// babel({
//   exclude: '**/node_modules/**',
//   extensions: ['.js', '.ts'], // 让babel能对ts解析过的代码编译
//   runtimeHelpers: false,
// }),
module.exports = [
  {
    input: 'src/index.ts',
    output: [
      // commonjs，给node用，仅需编译ts
      {
        file: mainFile,
        format: 'cjs',
        banner: `/*!
* Rope V${version}
* written by Waanhappy/waanhappy@163.com
* Released under the MIT License.
*/`,
      },
    ],
    external: ['react-dom/server'],
    plugins: [
      autoExternal({ preferBuiltins: true, builtins: false, dependencies: true, peerDependencies: true }),
      resolve({
        extensions: [
          '.node.mjs',
          '.node.ts',
          '.node.tsx',
          '.node.js',
          '.node.jsx',
          '.node.json',
          '.mjs',
          '.ts',
          '.tsx',
          '.js',
          '.jsx',
          '.json',
        ],
      }),
      rollupTypescript({
        noEmit: false,
        removeComments: true,
        tsconfig: 'tsconfig.json',
        clean: true,
      }),
      commonjs(),
      // babel({
      //   exclude: '**/node_modules/**',
      //   extensions: ['.js', '.ts', '.tsx', '.jsx'], // 让babel能对ts解析过的代码编译
      //   runtimeHelpers: false,
      //   babelrc: false,
      //   presets: [['@babel/env', { targets: { node: '8.9.4' } }], '@babel/react'],
      // }),
    ],
  },
];
