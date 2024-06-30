const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:unicorn/recommended",
    "prettier",
    "eslint-config-turbo",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
  },
  plugins: ["simple-import-sort", "import", "@typescript-eslint", "prettier"],
  rules: {
    "@typescript-eslint/naming-convention": [
      "warn",
      {
        selector: "import",
        format: ["camelCase", "PascalCase"],
      },
    ],
    "@typescript-eslint/semi": "off",
    curly: "off",
    eqeqeq: "warn",
    "no-throw-literal": "warn",
    semi: "off",
    "prettier/prettier": "error",
    "@typescript-eslint/no-var-requires": "off",
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
          "camelCase": true
        }
      }
    ]
  },
  env: {
    node: true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: ["dist", "node_modules/", "**/*.d.ts"],
};
