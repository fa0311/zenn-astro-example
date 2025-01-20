import type { MarkdownHeading, MarkdownInstance } from "astro";
import Path from "node:path";
import "zenn-content-css";
import markdownToHtml from "./markdownToHtml";

import * as cheerio from "cheerio";
import "zenn-content-css";
import { getLatestCommitTime } from "./git";

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

const getArticleListRaw = async (): Promise<ArticleListRawResponse[]> => {
  const slugs = import.meta.glob<MarkdownInstance<Frontmatter>>("../../../articles/*.md");
  const article = Object.entries(slugs).map(async ([file, contents]) => {
    return { file: file, contents: await contents() };
  });
  return await Promise.all(article);
};

type ArticleListResponse = {
  file: string;
  contents: MarkdownInstance<Frontmatter>;
  lastCommit?: Date;
};

const getArticleList = async (): Promise<ArticleListResponse[]> => {
  const raw = await getArticleListRaw();
  const enable = raw.filter((article) => article.contents.frontmatter.static === true);
  const article = enable.map(async (article) => {
    const lastCommit = await getLatestCommitTime(Path.relative("../../", article.file));
    return { ...article, lastCommit };
  });
  return await Promise.all(article);
};

export const getArticleData = async () => {
  const data = await getArticleList();
  return getArticleDataRecursive(data.sort((a, b) => timeSort(a.lastCommit, b.lastCommit)));
};

export const getTopics = (articles: ReturnType<typeof getArticleDataRecursive>) => {
  const topics = articles.flatMap((article) => article.frontmatter.topics);
  const types = articles.map((article) => article.frontmatter.type);
  return [...new Set([...topics, ...types])];
};

export const pageSplit = <T1>(data: T1[]) => {
  const length = Math.max(Math.ceil(data.length / 48), 1);
  return Array.from({ length }).map((_, i) => {
    return { data: data.slice(i * 48, (i + 1) * 48), index: i + 1, length: length };
  });
};

const getArticleDataRecursive = (articles: ArticleListResponse[]) => {
  return articles.map((article) => {
    return {
      slug: Path.basename(article.file, ".md"),
      lastCommit: article.lastCommit,
      frontmatter: article.contents.frontmatter,
      getContent: () => markdownToHtmlNormalized(article.contents.rawContent()),
      getRelatedArticles: () => getArticleDataRecursive(getRelatedArticles(articles, article)),
      getNavigation: () => headingsNormalize(article.contents.getHeadings()),
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

const headingsNormalize = (headings: MarkdownHeading[]) => {
  if (headings.length === 0) {
    return [];
  } else if (headings.length === 1) {
    return [{ ...headings[0], level: 1 }];
  } else {
    const [top, ...rest] = headings;
    const minDepth = Math.min(...rest.map((heading) => heading.depth));
    console.log(minDepth, top.depth);
    const restLevel = (() => {
      if (top.depth == minDepth) {
        return rest.map((heading) => ({ ...heading, level: heading.depth - top.depth + 1 }));
      } else if (top.depth < minDepth) {
        const a = rest.map((heading) => ({ ...heading, level: heading.depth - top.depth }));
        console.log(a);
        return a;
      } else {
        throw new Error("Invalid heading depth");
      }
    })();
    return [{ ...top, level: 1 }, ...restLevel];
  }
};

const calculateSimilarity = (a: string[], b: string[]) => {
  const intersection = a.filter((value) => b.includes(value));
  const union = [...new Set([...a, ...b])];
  return intersection.length / union.length;
};

export const markdownToHtmlNormalized = (raw: string) => {
  const html = markdownToHtml(raw, {
    embedOrigin: "https://embed.zenn.studio",
  });

  const $ = cheerio.load(html);

  // $(`img`).each((i, el) => {
  //   const src = $(el).attr("src")!.slice("images/".length);
  //   $(el).attr("src", src);
  // });

  // Array.from([5, 4, 3, 2, 1]).forEach((i) => {
  //   $(`h${i}`).each((_, el) => {
  //     console.log($(`h${i}`).html());
  //     $(el).replaceWith(`<h${i + 1}>${$(el).html()}</h${i + 1}>`);
  //   });
  // });

  $(`.header-anchor-link`).remove();
  $(`iframe`).each((i, el) => {
    $(el).attr("title", "embed");
  });
  return {
    contents: () => $("body").html()!,
    description: () => $("p").first().text(),
  };
};
