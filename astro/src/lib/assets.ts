import { fileCache } from "./cache";

import path from "path";

export const getFonts = async (url: string): Promise<Buffer> => {
  const name = path.basename(new URL(url).pathname);
  return fileCache(`fonts/${name}`, async () => {
    const res = await fetch(url);
    return Buffer.from(await res.arrayBuffer());
  });
};

export const getJson = async <T>(url: string): Promise<T> => {
  const name = path.basename(new URL(url).pathname);
  const content = await fileCache(name, async () => {
    const res = await fetch(url);
    return Buffer.from(await res.arrayBuffer());
  });
  return JSON.parse(content.toString());
};

export const getBuffer = async (url: string): Promise<Buffer> => {
  const name = path.basename(new URL(url).pathname);
  return fileCache(name, async () => {
    const res = await fetch(url);
    return Buffer.from(await res.arrayBuffer());
  });
};
