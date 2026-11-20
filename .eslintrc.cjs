// max-lines: warn at 200; the 350 hard limit is enforced by scripts/checkFileSize.js
module.exports = {
  root: true,
  env: { node: true, es2023: true, browser: true },
  parserOptions: { ecmaVersion: 2023, sourceType: 'module' },
  extends: ['eslint:recommended'],
  rules: {
    'max-lines': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': ['warn', 40],
    'max-params': ['warn', 4],
  },
  overrides: [{ files: ['migrations/**', '**/*.test.js'], rules: { 'max-lines': 'off' } }],
};
