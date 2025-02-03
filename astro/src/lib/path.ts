import * as Path from "path";

export const pathSplit = (path: string) => {
  const ext = Path.extname(path);
  const name = Path.basename(path);
  const dir = Path.dirname(path);
  return [dir === "." ? "" : dir, name.slice(0, -ext.length), ext];
};

export const convertableExt = [".png", ".jpg", ".jpeg"];

export const convertExt = (path: string) => {
  const [dir, name, ext] = pathSplit(path);
  if (convertableExt.includes(ext.toLowerCase())) {
    return `${dir}/${name}.webp`;
  } else {
    return path;
  }
};
