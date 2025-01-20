import eslintPluginAstro from "eslint-plugin-astro";
export default [
  ...eslintPluginAstro.configs.recommended,
  {
    parserOptions: {
      parser: "@typescript-eslint/parser",
    },
    rules: {},
  },
];
