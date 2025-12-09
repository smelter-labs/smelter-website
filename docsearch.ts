import type { DocSearchClientOptions } from "@astrojs/starlight-docsearch";
import { versionRegex } from "src/middleware";

export default {
  appId: "RQGSDUI2B0",
  apiKey: "401cb98bf67c11c44695d30bbba97794",
  indexName: "smelter",
  // hitComponent: ({ hit, children }) => {
  //   return {
  //     type: 'a',
  //     constructor: undefined,
  //     __v: 1,
  //     title: 'test1234',
  //     props: {
  //       children,
  //     }
  //   }
  // },
  transformItems: (items) => {
    console.log('ITEM ', items)
    const test = items.map((item) => {
      const snippetResult = item._snippetResult;
      const urlObject = new URL(item.url);
      const purgedUrl = `${urlObject.pathname + urlObject.search + urlObject.hash}`.replace('#_top','');

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
            const newValue = version ? `${val.value} <span class="test">${version}</span>` : val.value;
            return [key, { ...val, value: newValue }];
          }
          return [key, val];
        })
      );

      return {
        ...item,
        content: purgedUrl,
        _snippetResult: { ...snippetResult, hierarchy: newHierarchy },
      };
    });

    // console.log('TEST ', test )
    return test;
  },
} satisfies DocSearchClientOptions;
