import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";
import unicornPlugin from "eslint-plugin-unicorn";
import tsEslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default tsEslint.config(
  js.configs.recommended,
  ...tsEslint.configs.recommended,
  unicornPlugin.configs["flat/recommended"],
  ...compat.extends("eslint-config-turbo", "prettier"),
  {
    plugins: {
      "simple-import-sort": simpleImportSortPlugin,
      "import": importPlugin,
      "prettier": prettierPlugin,
    },
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
      "unicorn/name-replacements": "off",
      "unicorn/no-this-outside-of-class": "off",
      "unicorn/prefer-await": "off",
      "unicorn/no-top-level-assignment-in-function": "off",
      "unicorn/no-top-level-side-effects": "off",
      "unicorn/prefer-export-from": "off",
      "import/newline-after-import": "off",
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            kebabCase: true,
            camelCase: true,
          },
        },
      ],
    },
    languageOptions: {
      ecmaVersion: 6,
      sourceType: "module",
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "tsconfig.json",
        },
      },
    },
  },
  {
    ignores: ["dist", "node_modules/", "**/*.d.ts", ".next/"],
  }
);
