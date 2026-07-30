module.exports = function (api) {
  api.cache(true);
  return {
    // nativewind v4 is a JSX transform, not a Babel plugin: babel-preset-expo
    // rewrites the JSX import source, and nativewind/babel supplies the runtime.
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
