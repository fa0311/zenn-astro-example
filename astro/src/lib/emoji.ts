import twemoji from "@twemoji/api";
import * as cheerio from "cheerio";

export const getEmojiUrl = (emoji: string): string => {
  const html = twemoji.parse(emoji, { folder: "svg", ext: ".svg" });
  const $ = cheerio.load(html);
  return $("img").attr("src")!;
};
