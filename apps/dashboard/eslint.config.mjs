import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import importPlugin from "eslint-plugin-import";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";
import unicornPlugin from "eslint-plugin-unicorn";
import tsEslint from "typescript-eslint";

export default tsEslint.config(
  js.configs.recommended,
  ...tsEslint.configs.recommended,
  unicornPlugin.configs["flat/recommended"],
  {
    plugins: {
      "simple-import-sort": simpleImportSortPlugin,
      "import": importPlugin,
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
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
      "unicorn/prefer-export-from": "off",
      "unicorn/max-nested-calls": "off",
      "unicorn/consistent-boolean-name": "off",
      "unicorn/prefer-continue": "off",
      "unicorn/prefer-array-flat-map": "off",
      "unicorn/no-array-reverse": "off",
      "unicorn/no-useless-coercion": "off",
      "unicorn/prefer-boolean-return": "off",
      "unicorn/no-useless-else": "off",
      "unicorn/consistent-class-member-order": "off",
      "unicorn/no-negated-comparison": "off",
      "unicorn/no-nested-ternary": "off",
      "unicorn/no-negated-array-predicate": "off",
      "unicorn/no-useless-template-literals": "off",
      "unicorn/no-top-level-side-effects": "off",
      "unicorn/numeric-separators-style": "off",
      "unicorn/import-style": "off",
      "unicorn/prefer-global-this": "off",
      "unicorn/no-global-object-property-assignment": "off",
      "unicorn/no-declarations-before-early-exit": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-namespace": "off",
      "no-empty-pattern": "off",
      "no-useless-assignment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-undef": "off",
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
  },
  {
    ignores: ["node_modules/", "dist/", ".next/"],
  }
);
