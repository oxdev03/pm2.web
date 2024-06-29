/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  root: true,
  extends: ["next", "plugin:@typescript-eslint/recommended", "plugin:unicorn/recommended", "prettier"],
  plugins: ["simple-import-sort", "import"],
  ignorePatterns: ["node_modules", "dist"],
  rules: {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
    "unicorn/prevent-abbreviations": "off",
    "unicorn/catch-error-name": "off",
    "unicorn/no-null": "off",
    "unicorn/prefer-module": "off",
    "unicorn/filename-case": [
      "error",
      {
        "cases": {
          "kebabCase": true,
          "pascalCase": true
        }
      }
    ]
  },
  parserOptions: {
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
  },
};
