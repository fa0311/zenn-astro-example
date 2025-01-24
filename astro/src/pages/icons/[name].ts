import type { APIRoute } from "astro";
import { getGzip } from "../../lib/assets";

export const GET: APIRoute = async () => {
  await getGzip("https://github.com/fa0311/zenn-icons/releases/download/latest/zenn-icons.gz");
  return new Response("body", {
    headers: {
      "Content-Type": "image/png",
    },
  });
};

export const getStaticPaths = () => {
  return [{ params: { name: "zenn-icons" } }];
};
