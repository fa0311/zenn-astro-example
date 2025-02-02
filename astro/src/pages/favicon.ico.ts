import type { APIRoute } from "astro";

import { ImageResponse } from "@vercel/og";
import SiteIcon from "../components/tsx/SiteIcon";

export const GET: APIRoute = async () => {
  const body = new ImageResponse(SiteIcon({ text: import.meta.env.SITE_ICON }), {
    width: 64,
    height: 64,
  });
  return new Response(await body.arrayBuffer(), {
    headers: {
      "Content-Type": "image/png",
    },
  });
};
