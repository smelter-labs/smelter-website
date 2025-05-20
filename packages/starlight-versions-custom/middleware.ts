import starlightVersionsConfig from 'virtual:starlight-versions-config'
import starlightConfig from 'virtual:starlight/user-config'
import { type StarlightRouteData, defineRouteMiddleware } from '@astrojs/starlight/route-data'

import { type Version, getVersionFromPaginationLink, getVersionFromSlug, getVersionSidebar } from './libs/versions'

const versionRegex = /(?:ts-sdk|http-api)\/\d+(\.\d+)*/;
const versionedSectionRegex = /(?:ts-sdk|http-api)\//;

function containsHref(entries: any[], regex: RegExp): boolean {
    return entries.some(entry => {
        if (entry.type === 'link' && entry.href && regex.test(entry.href)) {
            return true;
        }
        if (entry.type === 'group' && entry.entries) {
            return containsHref(entry.entries, regex); // Recursive search in the case of nested groups
        }
        return false;
    });
}

function filterGroups(groups: any[], regex: RegExp): any[] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return groups.filter(group => !containsHref(group.entries, regex));
}

export const onRequest = defineRouteMiddleware(async (context, next) => {
  const { starlightRoute } = context.locals
  const { entry, locale, pagination, sidebar } = starlightRoute

  const uriVersion = entry.slug.split('/').splice(0,2).join('/')
  const selectedVersion = context.cookies.get('selectedVersion')
  
  const version = versionRegex.test(uriVersion) ? uriVersion : selectedVersion?.value

  const currentSidebarEntries = filterGroups(getVersionSidebar(
    getVersionFromSlug(starlightVersionsConfig, starlightConfig, ''),
    sidebar,
  ), versionRegex)

  const baseSidebarEntries = filterGroups(currentSidebarEntries, versionedSectionRegex)

  const versionSidebarEntries = version ? getVersionSidebar(
    getVersionFromSlug(starlightVersionsConfig, starlightConfig, version),
    sidebar,
  ) : []

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  starlightRoute.sidebar =  version && getVersionFromSlug(starlightVersionsConfig, starlightConfig, version) ? [...baseSidebarEntries, ...versionSidebarEntries] : currentSidebarEntries
  
  const pageVersion = getVersionFromSlug(starlightVersionsConfig, starlightConfig, entry.slug)

  starlightRoute.pagination.prev = getPaginationLink(locale, pageVersion, pagination.prev)
  starlightRoute.pagination.next = getPaginationLink(locale, pageVersion, pagination.next)


  const isPathVersionless = !versionRegex.test(entry.slug) && versionedSectionRegex.test(entry.slug);

  console.log('IS PATH VERSIONLESS ', isPathVersionless)
  // console.log('SELECTED VERSION ', selectedVersion)
  if(versionRegex.test(entry.slug) && (!selectedVersion || selectedVersion.value === 'current') ) {
    context.cookies.delete('selectedVersion')
    context.cookies.set('selectedVersion', uriVersion, { sameSite: 'strict', secure: true, path: '/'})
  }
  if(isPathVersionless) {
    context.cookies.delete('selectedVersion')
    context.cookies.set('selectedVersion', 'current', { sameSite: 'strict', secure: true, path: '/'})
  }

  return next()
})

function getPaginationLink(locale: string | undefined, currentVersion: Version | undefined, link: PaginationLink) {
  if (!link) return undefined

  const linkVersion = getVersionFromPaginationLink(starlightVersionsConfig, link.href, locale)

  // If the current version is not the same as the link version, remove the link.
  return (currentVersion === undefined && linkVersion === undefined) || currentVersion?.slug === linkVersion?.slug
    ? link
    : undefined
}

type PaginationLink = StarlightRouteData['pagination']['next']
