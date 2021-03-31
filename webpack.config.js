module.exports = {
  entry: {
    app: [
      "./front.js",
    ]
  },
  mode: 'production',
  target: 'web',
  optimization: {
    minimize: false
  },
  output: {
    filename: 'orange-charts.js',
  }
};