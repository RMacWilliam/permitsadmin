const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');
const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

const nextConfig = (phase, { defaultConfig }) => {
  /** @type {import('next').NextConfig} */

  const nextConfigCommon = {
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
  };

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      ...nextConfigCommon,
      reactStrictMode: true,
    }
  } else {
    return {
      ...nextConfigCommon,
      output: 'export',
      basePath: '/permitsadmin',
      images: {
        unoptimized: true
      },
    }
  }
}

// /** @type {import('next').NextConfig} */
// const nextConfig2 = {
//   reactStrictMode: true,

//   output: 'export',
//   basePath: '/permitsadmin',
//   images: {
//     unoptimized: true
//   },

//   sassOptions: {
//     includePaths: [path.join(__dirname, 'styles')],
//   },

//   webpack: (config) => {
//     config.plugins.push(
//       new CopyPlugin({
//         patterns: [
//           { from: "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js", to: "../public" },
//           { from: "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map", to: "../public" }, // TODO: Remove this for production deployment.
//         ],
//       }),
//     )

//     // Important: return the modified config
//     return config;
//   }
// }

module.exports = nextConfig
