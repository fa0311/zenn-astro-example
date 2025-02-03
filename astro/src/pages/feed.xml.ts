import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { astroURL } from "../lib/url";
import { getArticleData } from "../lib/zenn";

export const GET: APIRoute = async ({ url }) => {
  const data = await getArticleData();
  return rss({
    title: `${import.meta.env.SITE_NAME} - ${import.meta.env.SITE_CAPTION}`,
    description: import.meta.env.SITE_DESCRIPTION,
    site: astroURL({ url }).dir("/"),
    trailingSlash: astroURL({ url }).slash,
    items: data
      .map((article) => ({
        link: astroURL({ url }).dir(`/articles/${article.slug}`).href,
        title: article.frontmatter.title,
        description: article.getContent().description(),
        pubDate: article.firstCommit,
        categories: article.topics.map((topic) => topic.name),
        trailingSlash: astroURL({ url }).slash,
      }))
      .slice(0, 10),
  });
};
