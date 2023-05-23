const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

const envPlugin = new webpack.EnvironmentPlugin({
  NODE_ENV: process.env.NODE_ENV,
  TARGET: "chrome",
  CRYPTKEEPER_DEBUG: false,
  RANDOM_IDENTITY: false,
  BACKUP: false,
  METAMASK_EXTENSION_ID: "",
  INFURA_API_KEY: "",
  ALCHEMY_API_KEY: "",
  FREIGHT_TRUST_NETWORK: "",
  PULSECHAIN_API_KEY: "",
});

const TARGET = process.env.TARGET || "chrome";

module.exports = {
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
  },
  plugins: [
    envPlugin,
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
    new webpack.IgnorePlugin({
      checkResource(resource) {
        return /.*\/wordlists\/(?!english).*\.json/.test(resource);
      },
    }),
  ],
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
        },
      }
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".png", ".svg"],
    alias: {
      "@src": path.resolve(__dirname, "src/"),
      // snarkjs uses ejs which has unsafe-eval function constructor
      ejs: path.resolve(__dirname, "src/config/mock/ejsMock.js"),
      buffer: "buffer",
    },
    fallback: {
      stream: require.resolve("stream-browserify"),
      crypto: require.resolve("crypto-browserify"),
      https: false,
      http: false,
      net: false,
      tls: false,
      path: false,
      os: false,
      fs: false,
      assert: false,
      zlib: false,
      constants: false,
    },
  },
};
