import removeUnknownsAndDefaults from '../svgo/removeUnknownsAndDefaults.cjs';

export default function prepareConfig(configData) {
  const svgoPlugins = configData.default.optimize?.svg?.plugins;

  if (svgoPlugins) {
    const indexOfRemoveUnknownsAndDefaults = svgoPlugins.indexOf('removeUnknownsAndDefaultsPATCHED');

    if (indexOfRemoveUnknownsAndDefaults !== -1) {
      svgoPlugins[indexOfRemoveUnknownsAndDefaults] = {
        name: 'removeUnknownsAndDefaults',
        ...removeUnknownsAndDefaults,
      };
    }
  }

  return configData.default;
}
