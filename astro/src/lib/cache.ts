const cacheData: Record<string, any> = {};
export const cache = <T>(key: string, callback: () => T) => {
  if (!cacheData[key]) {
    cacheData[key] = callback();
  }

  return cacheData[key] as T;
};
