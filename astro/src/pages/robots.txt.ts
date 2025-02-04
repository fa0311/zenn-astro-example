import type { APIRoute } from "astro";
import { astroURL } from "../lib/url";

type RobotsKey = "User-agent" | "Disallow" | "Allow" | "Sitemap" | "Host" | "Crawl-delay";

const robots = (directives: [RobotsKey, string][][]) => {
  return directives.map((data) => data.map(([key, value]) => `${key}: ${value}`).join("\n")).join("\n\n");
};

export const GET: APIRoute = ({ url }) => {
  const sitemapURL = astroURL({ url }).file("/sitemap-index.xml");
  const robotsTxt = robots([
    [
      ["User-agent", "*"],
      ["Allow", "/"],
    ],
    [["Sitemap", sitemapURL.href]],
  ]);
  return new Response(robotsTxt, { headers: { "Content-Type": "text/plain" } });
};
