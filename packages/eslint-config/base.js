const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

module.exports = {
  extends: [
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "eslint-config-turbo",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prettier"],
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
