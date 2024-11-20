// webpack.config.js
const path = require('path');

const { NODE_ENV } = process.env;
const isProduction = NODE_ENV === 'production';

const config = {
  entry: './src/app.js', // Entry point
  output: {
    filename: 'bundle.js',  // Output file
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Apply Babel to all .js files
        exclude: /node_modules/, // Don't apply Babel to node_modules
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'], // Use Babel's preset-env for modern JS
          },
        },
      },
    ],
  },
  mode: isProduction ? 'production' : 'development', // Set mode
  resolve: {
    preferRelative: true, // Prefer relative paths
  }
};

if(!isProduction) {
  config.devtool = 'source-map'; // Generate source maps in development
}


module.exports = config;
