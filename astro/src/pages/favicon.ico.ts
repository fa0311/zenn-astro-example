// import type { APIRoute } from "astro";

// import { ImageResponse } from "@vercel/og";
// import Favicon from "../components/tsx/Favicon";

// export const GET: APIRoute = async ({ params }) => {
//   const body = new ImageResponse(Favicon(import.meta.env.SITE_ICON), {
//     width: 16,
//     height: 16,
//   });
//   return new Response(await body.arrayBuffer(), {
//     headers: {
//       "Content-Type": "image/png",
//     },
//   });
// };
