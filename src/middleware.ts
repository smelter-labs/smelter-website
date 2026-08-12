import { defineMiddleware } from "astro:middleware";

export const versionRegex = /(?:ts-sdk|http-api)\/\d+(\.(\d+|x))?(\.(\d+|x))?/;
export const versionedSectionRegex = /(?:ts-sdk|http-api)\//;

export const onRequest = defineMiddleware((context, next) => {
  const pathname = context.url.pathname.toString();
  const selectedVersion = context.cookies.get("selectedVersion");

  const isPathVersionless = !versionRegex.test(pathname) && versionedSectionRegex.test(pathname);

  if (context.url.searchParams.has("bannerRedirect")) {
    context.cookies.delete("selectedVersion");
    context.cookies.set("selectedVersion", "current", {
      sameSite: "strict",
      secure: true,
      path: "/",
    });
    const cleanedPath = `${pathname.replace("?bannerRedirect", "")}`;
    return context.redirect(cleanedPath);
  }

  if (isPathVersionless && selectedVersion && selectedVersion.value !== "current") {
    context.cookies.delete("selectedVersion");
    context.cookies.set("selectedVersion", "current", {
      sameSite: "strict",
      secure: true,
      path: "/",
    });

    return next();
  }

  if (versionRegex.test(pathname)) {
    const pathnameVersion = pathname.match(versionRegex);
    context.cookies.delete("selectedVersion");
    if (pathnameVersion) {
      context.cookies.set("selectedVersion", pathnameVersion[0], {
        sameSite: "strict",
        secure: true,
        path: "/",
      });
    }
  }

  return next();
});
