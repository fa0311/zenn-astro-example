import type { APIRoute } from "astro";
import { astroURL } from "../lib/url";

const getRobotsTxt = (sitemapURL: URL) => `
User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ url }) => {
  const sitemapURL = astroURL({ url }).file("/sitemap-index.xml");
  return new Response(getRobotsTxt(sitemapURL));
};
