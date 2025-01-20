import lib from "zenn-markdown-html";

const markdownToHtml: typeof lib = (lib as any).default
  ? (lib as any).default
  : lib;

export default markdownToHtml;
