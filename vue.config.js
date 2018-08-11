module.exports = {
  devServer: {
    open: true,
    host: '0.0.0.0',
    port: 3000,
  },
  configureWebpack: {
    output: {
      globalObject: 'this',
    },
  },
}
