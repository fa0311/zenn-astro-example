import type { APIRoute } from "astro";
import { getGzip } from "../../../lib/assets";
import { getTopics } from "../../../lib/zenn";

export const GET: APIRoute = async ({ params }) => {
  const content = await getGzip("https://github.com/fa0311/zenn-icons/releases/download/latest/zenn-icons.tar.gz");

  return new Response(await content.read(`${params.name}.png`), {
    headers: {
      "Content-Type": "image/png",
    },
  });
};

export const getStaticPaths = async () => {
  const topics = await getTopics();

  return topics
    .filter((topic) => topic.image)
    .map((topic) => {
      return { params: { name: topic.name } };
    });
};
