var WebpackDevServer = require("webpack-dev-server");
var webpack = require("webpack");
var path = require('path');

var compiler = webpack({
  // configuration
  devtool: 'source-map',
  entry: {
    test: ["webpack-dev-server/client?http://localhost:8080/", "webpack/hot/dev-server", "./test"],
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js"
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        // query: {
        //   presets: ['es2015'],
        // },
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
});

var server = new WebpackDevServer(compiler, {
  // webpack-dev-server options

  contentBase: "/dev",
  // or: contentBase: "http://localhost/",

  hot: true,
  inline: true,
  // Enable special support for Hot Module Replacement
  // Page is no longer updated, but a "webpackHotUpdate" message is send to the content
  // Use "webpack/hot/dev-server" as additional module in your entry point
  // Note: this does _not_ add the `HotModuleReplacementPlugin` like the CLI option does.

  // Set this as true if you want to access dev server from arbitrary url.
  // This is handy if you are using a html5 router.
  historyApiFallback: false,

  // Set this if you want webpack-dev-server to delegate a single path to an arbitrary server.
  // Use "*" to proxy all paths to the specified server.
  // This is useful if you want to get rid of 'http://localhost:8080/' in script[src],
  // and has many other use cases (see https://github.com/webpack/webpack-dev-server/pull/127 ).
  // proxy: {
  //   "*": "http://localhost:9090"
  // },

  // pass [static options](http://expressjs.com/en/4x/api.html#express.static) to inner express server
  staticOptions: {},

  // webpack-dev-middleware options
  quiet: false,
  noInfo: false,
  lazy: false,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  publicPath: "/dev/",
  headers: {
    "X-Custom-Header": "yes"
  },
  stats: {
    colors: true
  },
});
server.listen(8080, "localhost", function () {});
// server.close();
