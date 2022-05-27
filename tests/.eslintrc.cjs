module.exports = {
  extends: '@funboxteam/eslint-config/.eslintrc.tests.js',
  plugins: ['jest'],
  env: {
    node: true,
    'jest/globals': true,
  },
  rules: {
    'import/extensions': [2, 'always'],
  },
};
