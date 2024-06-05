const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  config.resolver = {
    ...config.resolver,
    extraNodeModules: {
      ...config.resolver.extraNodeModules,
      mqtt: require.resolve('mqtt/dist/mqtt'),
    },
  };

  return config;
})();
