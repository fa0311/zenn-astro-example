import type { APIRoute } from "astro";
import { gzipMarge } from "../../../lib/assets";
import { downloadIcon, getTopics } from "../../../lib/zenn";

export const GET: APIRoute = async ({ params }) => {
  const icons = await gzipMarge(await downloadIcon());

  return new Response(await icons.read(params.name!), {
    headers: {
      "Content-Type": params.name!.endsWith(".svg") ? "image/svg+xml" : "image/png",
    },
  });
};

export const getStaticPaths = async () => {
  const topics = await getTopics();

  return topics.map((topic) => {
    return { params: { name: topic.path } };
  });
};
