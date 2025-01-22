import fs from "node:fs/promises";

export const getFont = async (url: string): Promise<Buffer> => {
  const dir = import.meta.env.DEV ? "../../.fonts" : "../../../../.fonts";
  const name = new URL(url).pathname.split("/").pop();
  const path = new URL(`${dir}/${name}`, import.meta.url);
  try {
    return await fs.readFile(path);
  } catch (e) {
    const res = await fetch(url);
    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.mkdir(new URL(dir, import.meta.url), { recursive: true });
    await fs.writeFile(path, buffer);
    return buffer;
  }
};
