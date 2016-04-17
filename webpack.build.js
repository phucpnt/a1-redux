var WebpackDevServer = require("webpack-dev-server");
var webpack = require("webpack");
var path = require('path');

var compiler = webpack({
  // configuration
  devtool: 'source-map',
  entry: './src',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'a1-redux.js',
    sourceMapFilename: 'a1-redux.map',
    library: 'a1Redux',
    libraryTarget: 'umd',
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
      },
    ],
  },
  externals: [
    {
      'angular': 'angular',
      'redux': 'redux',
    }
  ],
});

compiler.run(function (err, stats) {
  if (err) {
    console.error(err);
  }
})
