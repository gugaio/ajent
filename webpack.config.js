// webpack.config.js
const { NODE_ENV } = process.env;
const isProduction = NODE_ENV === 'production';

export default [{
  entry: './src/index.js', 
  output: {
    filename: 'ajent.esm.js',  
    path: new URL('./dist', import.meta.url).pathname,
    library: {
      type: "module",
    },
    module: true
  },
  experiments: {
    outputModule: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  mode: isProduction ? 'production' : 'development', // Set mode
  resolve: {
    preferRelative: true, // Prefer relative paths
  },
  optimization: {
    minimize: false // Optional: prevents minification for clearer output
  },
  devtool : 'source-map'
},
{
  entry: './src/index.js', // Entry point
  output: {
    filename: 'ajent.cls',  // Output file
    path: new URL('./dist', import.meta.url).pathname,
    library: {
      type: "commonjs2", 
    }
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
  },
  optimization: {
    minimize: false // Optional: prevents minification for clearer output
  },
  devtool : 'source-map'
},
{
  entry: './src/app.js', // Entry point
  output: {
    filename: 'app.js',  // Output file
    path: new URL('./dist', import.meta.url).pathname,
    library: {
      type: "module", // Specify ESM
    },
    module: true
  },
  experiments: {
    outputModule: true, // Enable module output
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
  },
  optimization: {
    minimize: false // Optional: prevents minification for clearer output
  },
  devtool : 'source-map'
},
];