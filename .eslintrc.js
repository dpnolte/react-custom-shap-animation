const OFF = 0,
  WARN = 1,
  ERROR = 2

const config = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    jsx: true,
    useJSXTextNode: true,
  },
  extends: [
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/react',
  ],
  plugins: ['@typescript-eslint', 'react-hooks', 'jest'],
  rules: {
    ['@typescript-eslint/explicit-function-return-type']: 'off',
    ['react-hooks/rules-of-hooks']: 'error',
    ['react-hooks/exhaustive-deps']: 'warn',
    ['prettier/prettier']: 'error', // indicate prettier error as well
    semi: [ERROR, 'never'], // I prefer to turn off semicolons
    '@typescript-eslint/interface-name-prefix': [ERROR, 'always'], // I prefix interface prefix with I
    'import/prefer-default-export': [OFF], // I always prefer named exports, even if there is one export
    'no-use-before-define': ['error', { variables: false }], // Need this off for variable so that we can use styles before Stylesheet.create
    '@typescript-eslint/no-use-before-define': ['error', { variables: false }], // Need this off for variable so that we can use styles before Stylesheet.create
    '@typescript-eslint/explicit-member-accessibility': 'off',
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
  },
  env: {
    'jest/globals': true,
  },
}

module.exports = config
