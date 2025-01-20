// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [],
  output: "static",
  site: "https://example.com",
  trailingSlash: "never",
});
