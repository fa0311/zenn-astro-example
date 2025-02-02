import fs from "node:fs/promises";
import * as path from "path";

const cacheData: Record<string, any> = {};
export const cache = <T>(key: string, callback: () => T) => {
  if (import.meta.env.DEV) {
    return callback();
  }
  if (!cacheData[key]) {
    cacheData[key] = callback();
  }

  return cacheData[key] as T;
};

export const getCached = async (key: string, isDir: boolean = false) => {
  const dir = import.meta.env.DEV ? "../../.cache" : "../../.cache";
  try {
    await fs.access(new URL(`${dir}/${key}`, import.meta.url));
  } catch {
    if (isDir) {
      await fs.mkdir(new URL(`${dir}/${key}`, import.meta.url), { recursive: true });
    } else {
      await fs.mkdir(new URL(`${dir}/${path.dirname(key)}`, import.meta.url), { recursive: true });
    }
  }
  return new URL(`${dir}/${key}`, import.meta.url);
};

export const fileCache = async (
  key: string,
  callback: () => Promise<Buffer<ArrayBufferLike>>,
): Promise<Buffer<ArrayBufferLike>> => {
  const path = await getCached(key);
  try {
    return await fs.readFile(path);
  } catch (e) {
    const res = await callback();
    await fs.writeFile(path, res);
    return res;
  }
};
