import { defineMiddleware } from "astro:middleware";

export const versionRegex = /(?:ts-sdk|http-api)\/\d+(\.\d+)*/;
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
    const test = `${pathname.replace("?bannerRedirect", "")}`;
    return context.redirect(test);
  }

  if (isPathVersionless && selectedVersion && selectedVersion.value !== "current") {
    const [versionName] = selectedVersion.value.split("/");
    context.cookies.delete("selectedVersion");
    context.cookies.set("selectedVersion", selectedVersion.value, {
      sameSite: "strict",
      secure: true,
      path: "/",
    });
    const test = `${pathname.replace(versionName, selectedVersion.value)}`;
    return context.redirect(test);
  }

  return next();
});
