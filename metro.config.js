const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Fix for Firebase SDK's package.json "exports" field not resolving in Metro
config.resolver.unstable_enablePackageExports = true;

module.exports = config;