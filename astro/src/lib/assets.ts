import * as zlib from "zlib";
import { fileCache } from "./cache";

export const getFonts = async (url: string): Promise<Buffer> => {
  const name = new URL(url).pathname.split("/").pop();
  return fileCache(`fonts/${name}`, async () => {
    const res = await fetch(url);
    return Buffer.from(await res.arrayBuffer());
  });
};

export const getGzip = async (url: string): Promise<Buffer> => {
  const name = new URL(url).pathname.split("/").pop();

  const content = await fileCache(`gzip/${name}`, async () => {
    const res = await fetch(url);
    return Buffer.from(await res.arrayBuffer());
  });

  return await new Promise((resolve, reject) => {
    zlib.gzip(content, (err, binary) => (err ? reject(err) : resolve(binary)));
  });
};
