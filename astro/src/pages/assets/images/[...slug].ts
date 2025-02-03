import type { APIRoute } from "astro";
import imagemin from "imagemin";
import imageminWebp from "imagemin-webp";
import { promises as fs } from "node:fs";
import Path, { sep } from "node:path";
import { cache, getCached } from "../../../lib/cache";
import { convertExt, pathSplit } from "../../../lib/path";

export const GET: APIRoute = async ({ params, props }) => {
  const path = new URL(`../../../../../images/${params.slug}`, import.meta.url);
  const [baseDir] = pathSplit(path.pathname);
  const [dir, name, ext] = pathSplit(params.slug!);
  try {
    const body = await fs.readFile(path);
    return new Response(body, {
      headers: {
        "Content-Type": `image/${ext.slice(1)}`,
      },
    });
  } catch (e) {
    const cacheDir = await getCached(`images/${dir}`);
    const convertedImagePath = await cache(`webp/${dir}/${name}`, async () => {
      const files = await imagemin([`${baseDir}/${name}.*`], {
        destination: cacheDir.pathname,
        plugins: [imageminWebp({ quality: 50 })],
      });
      return files[0].destinationPath;
    });

    const body = await fs.readFile(convertedImagePath);
    return new Response(body, {
      headers: {
        "Content-Type": "image/webp",
      },
    });
  }
};

export const getStaticPaths = () => {
  const slugs = import.meta.glob("../../../../../images/**/*.{png,jpg,jpeg,webp,gif}");
  return Object.entries(slugs).map(([file]) => {
    const slug = Path.relative("../../../../../images", file).replaceAll(sep, "/");
    return { params: { slug: convertExt(slug) } };
  });
};
