// Learn more: https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// nativewind v4 compiles global.css through Metro and injects the result.
module.exports = withNativeWind(config, { input: "./global.css" });
