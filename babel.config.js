module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // babel-preset-expo Reanimated 4 ke liye plugin khud add kar deta hai.
    // Agar pehle se "react-native-reanimated/plugin" likha hai, to usse HATA dein.
  };
};
