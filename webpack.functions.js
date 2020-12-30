const webpack = require('webpack');
const Dotenv = require('dotenv-flow-webpack');

// @see https://github.com/netlify/netlify-lambda#webpack-configuration
module.exports = {
  plugins: [
    new Dotenv({default_node_env: 'development'}),
    new webpack.DefinePlugin({'global.GENTLY': false}),
  ],
};