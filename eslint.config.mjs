import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
export default [
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "@typescript-eslint": tseslint },
    languageOptions: { parser: tsParser },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },
  ...eslintPluginAstro.configs.recommended,
  eslintConfigPrettier,
  { ignores: ["dist/", "node_modules/", ".astro/"] },
];
