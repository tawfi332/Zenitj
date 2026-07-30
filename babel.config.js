module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo already includes the expo-router plugin on SDK 50+.
    presets: ["babel-preset-expo"],
    // nativewind/babel (v2) is a Babel *plugin* — it enables Tailwind
    // `className` support in React Native.
    plugins: ["nativewind/babel"],
  };
};
