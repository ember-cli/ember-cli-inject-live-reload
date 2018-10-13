module.exports = {
  env: {
    node: true,
  },
  plugins: ['node'], 
  extends: ['eslint:recommended', 'plugin:node/recommended'], 
  parserOptions: {
    ecmaVersion: 2017
  },
  overrides: [
    {
      files: ['tests/**/*-test.js'],
      env: {
        qunit: true,
      }
    }
  ],
};
