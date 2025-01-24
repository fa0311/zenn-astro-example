import { fileCache, getCached } from "./cache";

import fs from "node:fs/promises";
import path from "path";
import * as tar from "tar";
import * as zlib from "zlib";

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

export const getGzip = async (url: string) => {
  const basename = path.basename(new URL(url).pathname);
  const name = basename.split(".")[0];

  const content = await fileCache(basename, async () => {
    const res = await fetch(url);
    return Buffer.from(await res.arrayBuffer());
  });

  const cache = await getCached(name, true);
  if ((await fs.readdir(cache.pathname)).length === 0) {
    await new Promise(async (resolve, reject) => {
      const gunzip = zlib.createGunzip();
      const extractor = tar.extract({
        cwd: cache.pathname,
      });
      extractor.on("error", reject);
      extractor.on("finish", resolve);
      gunzip.pipe(extractor);
      gunzip.end(content);
    });
  }
  return {
    read: async (read: string) => await fs.readFile(`${cache.pathname}/${read}`),
    access: async (access: string) => {
      const p = fs.access(`${cache.pathname}/${access}`);
      return p.then(() => true).catch(() => false);
    },
    list: async () => await fs.readdir(cache.pathname),
  };
};
