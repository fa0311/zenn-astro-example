import type { MarkdownHeading, MarkdownInstance } from "astro";
import Path from "node:path";
import "zenn-content-css";
import markdownToHtml from "./markdownToHtml";

import * as cheerio from "cheerio";
import "zenn-content-css";
import { getJson } from "./assets";
import { cache } from "./cache";
import { getLatestCommitTime } from "./git";
import { astroBaseURL } from "./url";

type Frontmatter = {
  title: string;
  emoji: string;
  type: "tech" | "idea";
  topics: string[];
  published: boolean;
  static?: boolean;
};

type ArticleListRawResponse = {
  file: string;
  contents: MarkdownInstance<Frontmatter>;
};

type ArticleListResponse = {
  file: string;
  contents: MarkdownInstance<Frontmatter>;
  lastCommit?: Date;
  topics: Topic[];
};

const getArticleListRaw = async (): Promise<ArticleListRawResponse[]> => {
  const slugs = import.meta.glob<MarkdownInstance<Frontmatter>>("../../../articles/*.md");
  const article = Object.entries(slugs).map(async ([file, contents]) => {
    return { file: file, contents: await contents() };
  });
  return await Promise.all(article);
};

const getArticleList = async (): Promise<ArticleListResponse[]> => {
  const raw = await getArticleListRaw();
  const icons = await getTopicsMetadata();
  const enable = raw.filter((article) => article.contents.frontmatter.static === true);
  const article = enable.map(async (article) => {
    const lastCommit = await getLatestCommitTime(Path.relative("../../", article.file));
    const top = [...article.contents.frontmatter.topics, article.contents.frontmatter.type];
    const topics = await Promise.all(top.map(async (name) => await icons(name)));
    return { ...article, lastCommit, topics };
  });
  return await Promise.all(article);
};

export const getArticleData = async () => {
  return cache("getArticleData", async () => {
    const data = await getArticleList();
    return getArticleDataRecursive(data.sort((a, b) => timeSort(a.lastCommit, b.lastCommit)));
  });
};

export type Topic = {
  name: string;
  displayName: string;
  path: string;
};

const getTopicsMetadata = async () => {
  const base = "https://cdn.jsdelivr.net/gh/fa0311/zenn-icons@main/metadata.json";
  const metadata = await getJson<Record<string, { imageUrl: string; displayName: string }>>(base);
  return async (name: string) => {
    const id = name.toLowerCase().trim();
    if (id === "idea") {
      return { name: id, displayName: "Idea", path: new URL(`dist/zenn/idea.svg`, base).href };
    } else if (id === "tech") {
      return { name: id, displayName: "Tech", path: new URL(`dist/zenn/tech.svg`, base).href };
    } else if (metadata[id] == undefined) {
      return { name: id, displayName: name, path: new URL("dist/zenn/topic.webp", base).href };
    } else if (new URL(metadata[id].imageUrl).pathname === "/images/topic.png") {
      return { name: id, displayName: metadata[id].displayName, path: new URL("dist/zenn/topic.webp", base).href };
    } else {
      return { name: id, displayName: metadata[id].displayName, path: new URL(`dist/images/${id}.webp`, base).href };
    }
  };
};

const unique = <T1, T2>(array: T1[], callback: (item: T1) => T2) => {
  const u = Array.from(new Set(array.map(callback)));
  return u.map((name) => array.find((item) => callback(item) === name)!);
};

export const getTopics = async () => {
  return await cache("getTopicsName", async () => {
    const articles = await getArticleData();
    const topics = articles.flatMap((article) => article.topics);
    return unique(topics, (topic) => topic.name);
  });
};

export const pageSplit = <T1>(data: T1[]) => {
  const length = Math.max(Math.ceil(data.length / 48), 1);
  return Array.from({ length }).map((_, i) => {
    return { data: data.slice(i * 48, (i + 1) * 48), index: i + 1, length: length };
  });
};

export const getZennUrl = (slug: string) => {
  return new URL(`https://zenn.dev/${import.meta.env.ZENN_USER_NAME}/articles/${slug}`);
};

const getArticleDataRecursive = (articles: ArticleListResponse[]) => {
  return articles.map((article) => {
    return {
      slug: Path.basename(article.file, ".md"),
      lastCommit: article.lastCommit,
      frontmatter: article.contents.frontmatter,
      topics: article.topics,
      getContent: () => markdownToHtmlNormalized(article.contents.rawContent()),
      getRelatedArticles: () => getArticleDataRecursive(getRelatedArticles(articles, article)),
    };
  });
};

const getRelatedArticles = (articles: ArticleListResponse[], current: ArticleListResponse) => {
  const relatedArticles = articles
    .filter((article) => article.file !== current.file)
    .map((article) => {
      const a = article.contents.frontmatter.topics;
      const b = current.contents.frontmatter.topics;
      const similarity = calculateSimilarity(a, b);
      return { ...article, similarity };
    })
    .sort((a, b) => {
      if (a.similarity !== b.similarity) {
        return b.similarity - a.similarity;
      } else {
        return timeSort(a.lastCommit, b.lastCommit);
      }
    });
  return relatedArticles;
};

const timeSort = (a: Date | undefined, b: Date | undefined) => {
  if (a == null && b == null) {
    return 0;
  } else if (a == null) {
    return -1;
  } else if (b == null) {
    return 1;
  } else {
    return b.getTime() - a.getTime();
  }
};

const calculateSimilarity = (a: string[], b: string[]) => {
  const intersection = a.filter((value) => b.includes(value));
  const union = [...new Set([...a, ...b])];
  return intersection.length / union.length;
};

export const markdownToHtmlNormalized = (raw: string) => {
  const embedOrigin = "https://embed.zenn.studio";
  const html = markdownToHtml(raw, { embedOrigin });
  const $ = cheerio.load(html);

  $(`img`).each((i, el) => {
    $(el).attr("src", `${astroBaseURL()}/assets${$(el).attr("src")}`);
  });

  const headings = Array.from($("h1, h2, h3, h4, h5, h6")).map((el) => {
    const $el = $(el);
    return {
      depth: parseInt($el.prop("tagName").slice(1)),
      slug: $el.attr("id")!,
      text: $el.text(),
    };
  });

  $(`.header-anchor-link`).remove();
  $(`iframe`).each((i, el) => {
    $(el).attr("title", "embed");
  });
  return {
    append: (data: string) => $("body").append(data),
    prepend: (data: string) => $("body").prepend(data),
    contents: () => $("body").html()!,
    description: () => $("p").first().text().replaceAll("\n", ""),
    headings: () => headingsNormalize(headings),
  };
};

const headingsNormalize = (headings: MarkdownHeading[]) => {
  if (headings.length === 0) {
    return [];
  } else if (headings.length === 1) {
    return [{ ...headings[0], level: 1 }];
  } else {
    const [top, ...rest] = headings;
    const minDepth = Math.min(...rest.map((heading) => heading.depth));
    const restLevel = (() => {
      if (top.depth == minDepth) {
        return rest.map((heading) => ({ ...heading, level: heading.depth - top.depth + 1 }));
      } else if (top.depth < minDepth) {
        return rest.map((heading) => ({ ...heading, level: heading.depth - top.depth }));
      } else {
        throw new Error("Invalid heading depth");
      }
    })();
    return [{ ...top, level: 1 }, ...restLevel];
  }
};
