module.exports = {
  root: true,
  env: {
    node: true,
  },
  plugins: ['vue'],
  extends: ['plugin:vue/essential', '@vue/prettier'],
  env: {
    browser: true,
    node: true,
  },
  globals: {
    document: true,
    foo: true,
    window: true,
  },
  rules: {
    'no-console': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'comma-dangle': [2, 'always-multiline'],
    'space-before-function-paren': [2, 'never'],
    'generator-star-spacing': 'off',
    'arrow-parens': 0,
    'one-var': 0,
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
}
