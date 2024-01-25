/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  coverageProvider: "v8",

  transformIgnorePatterns: ["/node_modules/(?!@azns/resolver-core).+\\.js$"],
}

module.exports = config
