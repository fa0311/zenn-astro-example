export const astroBaseURL = () => {
  if (import.meta.env.BASE_URL.endsWith("/")) {
    return import.meta.env.BASE_URL.slice(0, -1);
  } else {
    return import.meta.env.BASE_URL;
  }
};

export const astroURL = (astro: AstroType) => {
  const origin = `${astro.url.origin}${astroBaseURL()}`;
  const slice = (url: string) => url.slice(astroBaseURL().length + 1);
  const slash = !import.meta.env.DEV && import.meta.env.TRAILING_SLASH === "true";
  return urlResolve(slice(astro.url.pathname), origin, slash);
};
export type AstroType = { url: URL };
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
    slash: slash,
    pathname: pathname,
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

export const getZennArticleUrl = (slug: string) => {
  if (import.meta.env.ZENN_USER_NAME !== undefined) {
    return new URL(`https://zenn.dev/${import.meta.env.ZENN_USER_NAME}/articles/${slug}`);
  }
};

export const getZennUrl = () => {
  if (import.meta.env.ZENN_USER_NAME !== undefined) {
    return new URL(`https://zenn.dev/${import.meta.env.ZENN_USER_NAME}`);
  }
};
