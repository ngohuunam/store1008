module.exports = {
  devServer: {
    // open: true,
    host: '0.0.0.0',
    port: 3000,
  },
  configureWebpack: {
    // module: {
    //   rules: [
    //     {
    //       test: /\.worker\.js$/,
    //       use: { loader: 'worker-loader' },
    //     },
    //   ],
    // },
    output: {
      globalObject: 'this',
    },
  },
}
