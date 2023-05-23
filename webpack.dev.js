const { merge } = require("webpack-merge");
const path = require("path");

const common = require("@cryptkeeper/config/webpack-extension");

module.exports = merge(common, {
  entry: {
    injected: path.resolve(__dirname, "src/background/injectedScript.ts"),
    content: path.resolve(__dirname, "src/background/contentScript.ts"),
    backgroundPage: path.resolve(__dirname, "src/background/backgroundPage.ts"),
    popup: path.resolve(__dirname, "src/ui/popup.tsx"),
  },
  mode: "development",
  devtool: "cheap-module-source-map",
});
