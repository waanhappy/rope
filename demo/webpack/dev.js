/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const open = require('open');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const flexibility = require('postcss-flexibility');
const WebpackDevServer = require('webpack-dev-server');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const contentBase = path.resolve(__dirname, '../../');

function resolve(...paths) {
	return path.resolve(contentBase, ...paths);
}

const port = 2333;

const config = {
	context: __dirname,
	entry: {
		app: resolve('demo/index.tsx'),
	},
	mode: 'development',
	devtool: 'cheap-eval-source-map',
	output: {
		path: resolve('public'),
		publicPath: '',
		filename: 'assets/js/[name]-[hash].js',
		chunkFilename: 'assets/js/chunk-[name]-[hash].js',
	},
	resolve: {
		extensions: ['.js', '.json', '.html', '.es6', '.ts', '.tsx', '.less'],
	},
	module: {
		rules: [
			{
				test: /\.less$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							// you can specify a publicPath here
							// by default it use publicPath in webpackOptions.output
							publicPath: '/assets/',
						},
					},
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							plugins: [autoprefixer(), flexibility()],
						},
					},
					'less-loader',
				],
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							// you can specify a publicPath here
							// by default it use publicPath in webpackOptions.output
							publicPath: '/assets/',
						},
					},
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							plugins: [autoprefixer(), flexibility()],
						},
					},
				],
			},
			{
				test: /\.tsx?$/,
				include: [resolve('demo'), resolve('node_modules/@webtanzhi')],
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [
								[
									'@babel/preset-env',
									{
										targets: {
											ie: '10',
											chrome: '58',
											browsers: ['ie >=9'],
										},
									},
								],
								'@babel/react',
							],
							plugins: ['@babel/plugin-transform-runtime', '@babel/plugin-proposal-class-properties'],
						},
					},
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
				test: /\.jsx?$/,
				include: [resolve('demo'), resolve('node_modules/@webtanzhi')],
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [
								[
									'@babel/preset-env',
									{
										targets: {
											ie: '10',
											chrome: '58',
											browsers: ['ie >=9'],
										},
									},
								],
								'@babel/react',
							],
							plugins: ['@babel/plugin-transform-runtime', '@babel/plugin-proposal-class-properties'],
						},
					},
				],
			},
		],
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'assets/styles/[name]-[hash].css',
		}),
		new HtmlWebpackPlugin({
			chunks: ['app'],
			title: '测试',
			filename: resolve('public/index.html'),
			template: resolve('demo/index.html'),
		}),
	],
};

const compile = webpack(config);

const server = new WebpackDevServer(compile, {
	contentBase,
	publicPath: '/',
	clientLogLevel: 'info',
	// inline: true,
	compress: true,
	watchContentBase: false,
	disableHostCheck: true,
	liveReload: true,
	// 配置404页面
	historyApiFallback: {
		rewrites: [{ from: /^\/api\/.*/, to: '/404.html' }],
	},
	host: '127.0.0.1', // 给ws用
	port,
	// 错误显示到页面上
	overlay: true,
	// 控制台不输出信息
	// quiet: true,
	// 控制台输出内容
	stats: {
		colors: true,
	},
	headers: {
		'Access-Control-Allow-Origin': '*',
	},
});

server.listen(port);
// 打开浏览器
setTimeout(() => {
	open('http://127.0.0.1:' + port);
}, 3000);
