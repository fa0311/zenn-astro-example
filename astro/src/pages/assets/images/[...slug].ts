import type { APIRoute } from "astro";
import { promises as fs } from "node:fs";
import Path, { sep } from "node:path";

export const GET: APIRoute = async ({ params, props }) => {
  const path = new URL(`../../../../../images/${params.slug}`, import.meta.url);
  const body = await fs.readFile(path);
  return new Response(body, {
    headers: {
      "Content-Type": "image/png",
    },
  });
};

export const getStaticPaths = () => {
  const slugs = import.meta.glob("../../../../../images/**/*.{png,jpg,jpeg,webp,gif}");
  return Object.entries(slugs).map(([file]) => {
    const slug = Path.relative("../../../../../images", file).replaceAll(sep, "/");
    return { params: { slug: slug } };
  });
};
