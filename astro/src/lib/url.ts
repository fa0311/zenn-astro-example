export const astroURL = (Astro: { url: URL }) => {
  const origin = `${Astro.url.origin}${import.meta.env.BASE_URL}`;
  const slice = (url: string) => url.slice(import.meta.env.BASE_URL.length + 1);
  const slash = !import.meta.env.DEV && import.meta.env.TRAILING_SLASH === "true";
  return urlResolve(slice(Astro.url.pathname), origin, slash);
};

export type FixAstroURL = ReturnType<typeof astroURL>;

const normalize = (url: URL, slash: boolean) => {
  if (url.pathname.endsWith("/") && !slash) {
    return new URL(url.pathname.slice(0, -1), url.origin);
  } else if (!url.pathname.endsWith("/") && slash) {
    return new URL(`${url.pathname}/`, url.origin);
  }
  return url;
};

const urlResolve = (pathname: string, origin: string, slash: boolean) => {
  return {
    url: new URL(`${origin}/${pathname}${slash ? "/" : ""}`),
    file: (path: string) => {
      if (path.startsWith("/")) {
        return normalize(new URL(`.${path}`, `${origin}/`), false);
      } else {
        return normalize(new URL(path, `${origin}/${pathname}/`), false);
      }
    },
    dir: (path: string) => {
      if (path.startsWith("/")) {
        return normalize(new URL(`.${path}`, `${origin}/`), slash);
      } else {
        return normalize(new URL(path, `${origin}/${pathname}/`), slash);
      }
    },
  };
};
