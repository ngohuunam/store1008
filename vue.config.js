const CompressionPlugin = require('compression-webpack-plugin')

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
    plugins: [
      new CompressionPlugin({
        filename: '[path].gz[query]',
        algorithm: 'gzip',
        test: /\.vue$|\.js$|\.css$|\.html$/,
        cache: true,
        minRatio: 0.8,
        compressionOptions: { level: 9 },
      }),
    ],
    output: {
      globalObject: 'this',
    },
  },
}
