import type { DocSearchClientOptions } from "@astrojs/starlight-docsearch";
import { versionRegex } from "src/middleware";

export default {
  appId: "RQGSDUI2B0",
  apiKey: "401cb98bf67c11c44695d30bbba97794",
  indexName: "smelter",
  transformItems: (items) => {
    const test = items.map((item) => {
      const snippetResult = item._snippetResult;
      const urlObject = new URL(item.url);
      const purgedUrl = `${urlObject.pathname + urlObject.search + urlObject.hash}`.replace(
        "#_top",
        ""
      );

      const newHierarchy = Object.fromEntries(
        Object.entries(snippetResult.hierarchy).map(([key, val]) => {
          if (snippetResult.hierarchy.lvl2 && key === "lvl1") {
            const version = item.url.match(versionRegex)?.[0];
            const newValue = version ? `${val.value} - ${version}` : val.value;
            return [key, { ...val, value: newValue }];
          }

          // Page entry
          if (!snippetResult.hierarchy.lvl2 && key === "lvl1") {
            const version = item.url.match(versionRegex)?.[0];
            const newValue = version
              ? `${val.value} <span class="algolia-search-hit-version">${version}</span>`
              : val.value;
            return [key, { ...val, value: newValue }];
          }
          return [key, val];
        })
      );

      return {
        ...item,
        content: purgedUrl,
        _snippetResult: {
          ...snippetResult,
          // biome-ignore lint: Allow any
          hierarchy: newHierarchy as any,
        },
      };
    });

    return test;
  },
} satisfies DocSearchClientOptions;
