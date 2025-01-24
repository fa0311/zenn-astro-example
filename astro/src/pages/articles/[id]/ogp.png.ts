import type { APIRoute } from "astro";
import { getArticleData } from "../../../lib/zenn";

import { ImageResponse } from "@vercel/og";
import Ogp from "../../../components/tsx/Ogp";
import { getFonts } from "../../../lib/assets";

export const GET: APIRoute = async ({ params }) => {
  const articles = await getArticleData();
  const article = articles.find((article) => article.slug === params.id)!;
  const font = await getFonts(
    "https://github.com/fa0311/zenn-astro-example/releases/download/assets/NotoSansJP-Bold.ttf",
  );

  const body = new ImageResponse(Ogp(article.frontmatter.title), {
    fonts: [
      {
        name: "Noto Sans JP",
        data: font,
      },
    ],
    width: 1200,
    height: 630,
  });
  return new Response(await body.arrayBuffer(), {
    headers: {
      "Content-Type": "image/png",
    },
  });
};

export const getStaticPaths = async () => {
  const articles = await getArticleData();

  return articles.map((article) => {
    return { params: { id: article.slug } };
  });
};
