const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
	target: 'node',

	entry: {
		app: './src/main.ts'
	},

	output: {
		path: path.resolve(__dirname, 'dist'),
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
	plugins: [new CleanWebpackPlugin('./dist')]
}
