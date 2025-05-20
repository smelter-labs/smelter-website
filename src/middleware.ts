import { defineMiddleware } from "astro:middleware";

export const versionRegex = /(?:ts-sdk|http-api)\/\d+(\.\d+)*/;
export const versionedSectionRegex = /(?:ts-sdk|http-api)\//;

export const onRequest = defineMiddleware((context, next) => {
    const pathname = context.url.pathname.toString()
    const selectedVersion = context.cookies.get('selectedVersion')

    const isPathVersionless = !versionRegex.test(pathname) && versionedSectionRegex.test(pathname)
    if(isPathVersionless && (selectedVersion && selectedVersion.value !== 'current') && selectedVersion) {
        const [versionName] = selectedVersion.value.split('/')
        const test = `${pathname.replace(versionName, selectedVersion.value)}`
        return context.redirect(test)
      }

    return next()
});