/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  root: true,
  extends: ["next", "plugin:@typescript-eslint/recommended", "plugin:unicorn/recommended", "prettier"],
  plugins: ["simple-import-sort", "import"],
  ignorePatterns: ["node_modules", "dist"],
  rules: {
    "simple-import-sort/imports": "off",
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "off",
    "unicorn/prevent-abbreviations": "off",
    "unicorn/catch-error-name": "off",
    "unicorn/no-null": "off",
    "unicorn/prefer-module": "off",
    "unicorn/no-array-reduce": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "unicorn/no-negated-condition": "off",
    "unicorn/no-array-for-each": "off",
    "react-hooks/exhaustive-deps": "off",
    "unicorn/filename-case": [
      "error",
      {
        cases: {
          kebabCase: true,
          pascalCase: true,
        },
      },
    ],
  },
  parserOptions: {
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
  },
};
