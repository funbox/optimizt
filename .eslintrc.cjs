module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
  },
  extends: '@funboxteam',
  env: {
    node: true,
  },
  rules: {
    'import/extensions': [2, 'always'],
  },
};
