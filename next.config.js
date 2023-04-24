const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'export',
  // images: {
  //   unoptimized: true
  // },

  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },

  webpack: (config) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          { from: "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js", to: "../public" },
          { from: "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map", to: "../public" }, // TODO: Remove this for production deployment.
        ],
      }),
    )

    // Important: return the modified config
    return config;
  }
}

module.exports = nextConfig
