const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/', // 确保正确设置 publicPath
  },
  mode: 'development',
  devtool: 'cheap-module-source-map', // 修改这里以避免使用 eval
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html', // 确保生成的 HTML 文件名
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),  // 确保指向 public 目录
      publicPath: '/', // 确保静态文件的 publicPath
    },
    compress: true,
    port: 9089,
    hot: true,
  },
};