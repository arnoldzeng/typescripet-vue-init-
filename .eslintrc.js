module.exports ={
  parser: "vue-eslint-parser",
  parserOptions:  {
    ecmaVersion:  2018,  // Allows for the parsing of modern ECMAScript features
    sourceType:  'module',  // Allows for the use of imports
    parser: '@typescript-eslint/parser',
  },
  env: {
    browser: true,
    node: true
  },
  plugins: ['@typescript-eslint'],
  extends:  [
    'prettier',
    'plugin:vue/recommended',// This plugin allows us to check the <template> and <script> of .vue files with ESLint.
    'plugin:@typescript-eslint/recommended',  // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:prettier/recommended',  // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    'prettier/vue',
    'prettier/@typescript-eslint',  // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
  ],
  // 下面de规则应该应该删除，兼容旧项目而已
  rules: {
    '@typescript-eslint/camelcase':0,
    '@typescript-eslint/no-explicit-any':0,
    '@typescript-eslint/no-unused-vars':0,
    '@typescript-eslint/explicit-function-return-type':0
  }
}
