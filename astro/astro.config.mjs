// @ts-check
import { defineConfig } from "astro/config";

import partytown from "@astrojs/partytown";

export default defineConfig({
  integrations: [
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
  output: "static",
  trailingSlash: "never",
  site: "https://fa0311.github.io",
  base: "/zenn-astro-example",
});
