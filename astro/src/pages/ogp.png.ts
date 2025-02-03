import type { APIRoute } from "astro";

import { ImageResponse } from "@vercel/og";
import Favicon from "../components/tsx/Favicon";

export const GET: APIRoute = async () => {
  const body = new ImageResponse(Favicon(import.meta.env.SITE_ICON_OGP), {
    width: 400,
    height: 400,
  });
  return new Response(await body.arrayBuffer(), {
    headers: {
      "Content-Type": "image/png",
    },
  });
};
