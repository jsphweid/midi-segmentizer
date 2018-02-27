const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
	entry: {
		library: './src/main.ts',
		render: './render/render.ts'
	},
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: '[name].js'
	},
	resolve: {
		extensions: ['.ts', '.js', '.json']
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loaders: ['awesome-typescript-loader']
			}
		]
	},
	plugins: [
		new CleanWebpackPlugin(['./build']),
		new HtmlWebpackPlugin({ template: './render/index.html' }),
		new CopyWebpackPlugin([{ from: './render/xmls', to: './xmls' }])
	]
}
