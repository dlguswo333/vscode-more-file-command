/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', '@stylistic'],
  root: true,
  ignorePatterns: ['out', 'dist', '**/*.d.ts', '.eslintrc.cjs'],
  rules: {
    'indent': ['error', 2, {SwitchCase: 2}],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'jsx-quotes': ['error', 'prefer-single'],
    'space-infix-ops': 'error',
    'keyword-spacing': 'error',
    'eol-last': 'error',
    'comma-dangle': ['error', {
      'arrays': 'never',
      'objects': 'always-multiline',
      'imports': 'never',
      'exports': 'never',
      'functions': 'never'
    }],
    'object-curly-spacing': 'error',
    'space-before-function-paren': ['error', 'always'],
    'space-before-blocks': ['error', 'always'],
    'arrow-spacing': 'error',
    '@stylistic/type-annotation-spacing': ['error', {
      before: false,
      after: true,
      overrides: {
        arrow: {before: true, after: true}
      }
    }]
  }
};
