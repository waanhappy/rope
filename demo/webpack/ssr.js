const nodeExternals = require('webpack-node-externals');
const pathConfig = require('./default-config');

const babel = {
  loader: 'babel-loader',

  options: {
    presets: ['@babel/react'],
    sourceType: 'unambiguous',
    plugins: [
      'react-loadable/babel',
      './configs/router-wrapper-babel-plugin',
      '@babel/plugin-transform-modules-commonjs',
      '@babel/plugin-syntax-dynamic-import',
      'babel-plugin-dynamic-import-node',
      '@babel/plugin-proposal-class-properties',
      ['import', { libraryName: 'antd-mobile', libraryDirectory: 'lib', style: false }, 'antd-mobile'],
    ],
  },
};

module.exports = {
  mode: 'production',
  target: 'node',
  context: pathConfig.basePath,
  entry: { index: pathConfig.ssrEntryPath },
  resolve: {
    modules: [ './src', 'node_modules',],
    alias: {
      'utils/ssr': 'utils/ssr-for-ssr.tsx',
      'utils/link': 'utils/link-for-ssr.tsx',
      'utils/is-browser': 'utils/is-browser-for-ssr.ts',
    },
    extensions: [ '.js', '.json', '.jsx', '.ts', '.tsx', '.html', '.es6', '.ts', '.tsx', '.scss', '.less'],
  },
  externals: [
    nodeExternals(),
    (context, request, callback) => {
      if (/react-loadable-chunk-map$/.test(request)) {
        return callback(null, `commonjs ${request}`);
      }
      return callback();
    },
  ],
  output: {
    // 为了以 CommonJS2 规范导出渲染函数，以给采用 Node.js 编写的 HTTP 服务调用
    libraryTarget: 'commonjs',
    // 把最终可在 Node.js 中运行的代码输出到一个 app/index.js 文件
    filename: '[name].js',
    // 输出文件都放到 lib/app 目录下
    path: pathConfig.resolve('lib/app'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|es6)$/,
        use: [babel],
        include: [pathConfig.resolve('src')],
        // exclude: pathConfig.resolve('node_modules'),
      },
      {
        test: /\.tsx?$/,
        include: [pathConfig.resolve('src')],
        // exclude: pathConfig.resolve('node_modules'),
        use: [
          babel,
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              allowTsInNodeModules: true,
            },
          },
        ],
      },
      {
        // CSS 代码不能被打包进用于服务端的代码中去，忽略掉 CSS 文件
        test: /\.(css|scss|less)$/,
        use: ['ignore-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 2048,
              outputPath: 'assets/images',
              publicPath: `${pathConfig.publicPath || ''}assets/images`,
            },
          },
        ],
      },
    ],
  },
  plugins: [pathConfig.EnvironmentPlugin()],
};
