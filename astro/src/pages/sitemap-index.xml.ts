import type { APIRoute } from "astro";
import { SitemapStream, streamToPromise } from "sitemap";
import { getArticleData, getTopics, pageSplit } from "../lib/zenn";

export const GET: APIRoute = async ({ url }) => {
  const sitemap = new SitemapStream({ hostname: url.origin });
  const articles = await getArticleData();
  sitemap.write({ url: "/", changefreq: "daily", priority: 1 });

  articles.forEach((article) => {
    sitemap.write({ url: `/articles/${article.slug}`, changefreq: "monthly", priority: 0.7 });
  });

  pageSplit(articles).forEach(({ index }) => {
    sitemap.write({ url: `/${index}`, changefreq: "monthly", priority: 0.5 });
  });

  getTopics(articles).forEach((topic) => {
    sitemap.write({ url: `/topics/${topic}`, changefreq: "monthly", priority: 0.5 });
    const data = articles.filter((article) => {
      const articleTopics = article.frontmatter.topics;
      return articleTopics.includes(topic) || article.frontmatter.type === topic;
    });
    pageSplit(articles).forEach(({ index }) => {
      sitemap.write({ url: `/topics/${topic}/${index}`, changefreq: "monthly", priority: 0.5 });
    });
  });

  const data = streamToPromise(sitemap).then((data) => data.toString());
  sitemap.end();
  return new Response(await data, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
};
