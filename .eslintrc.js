module.exports = {
  extends: ['alloy', 'alloy/react', 'alloy/typescript'],
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  globals: {},
  rules: {
    'no-return-await': 0,
    '@typescript-eslint/explicit-member-accessibility': 0,
  },
  overrides: [
    {
      // enable the rule specifically for TypeScript files
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-member-accessibility': ['error'],
      },
    },
  ],
};
