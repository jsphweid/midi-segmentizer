const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
	target: 'node',

	entry: {
		'midiSegmentizer-commandLine': './src/main-commandLine.ts',
		'midiSegmentizer-module': './src/main-module.ts'
	},

	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
		libraryTarget: 'commonjs'
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
