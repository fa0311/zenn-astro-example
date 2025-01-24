import fs from "node:fs/promises";

const cacheData: Record<string, any> = {};
export const cache = <T>(key: string, callback: () => T) => {
  if (!cacheData[key]) {
    cacheData[key] = callback();
  }

  return cacheData[key] as T;
};

type WritableType = Parameters<typeof fs.writeFile>[1];
export const fileCache = async <T extends WritableType>(key: string, callback: () => Promise<T>) => {
  try {
    return await fs.readFile(`.cache/${key}`);
  } catch (e) {
    const res = await callback();
    const dir = key.split("/").slice(0, -1).join("/");
    await fs.mkdir(`.cache/${dir}`, { recursive: true });
    await fs.writeFile(`.cache/${key}`, res);
    return res;
  }
};
