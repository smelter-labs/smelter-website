// Dependencies of the /playground worker. They live in a separate workspace
// package because the playground talks to the demo backend, which runs a
// newer Smelter than the one the WASM demos on the site are pinned to.
// Both versions can't coexist as root dependencies: the web-client resolves
// its `@swmansion/smelter` peer dependency to whatever the root has.
//
// The SDK is imported through the `smelter-sdk` alias (same package and
// version as `@swmansion/smelter` here). Vite's dev dependency optimizer keys
// pre-bundled packages by name, so `@swmansion/smelter` would resolve to the
// root's older version.
//
// React is imported before re-exporting: `export * as X from "react"` skips
// Vite's CommonJS interop in dev and yields an empty namespace.
import * as React from "react";
import * as ReactJsxRuntime from "react/jsx-runtime";
import * as SmelterSdk from "smelter-sdk";

export { default as Smelter } from "@swmansion/smelter-web-client";
export { transform } from "sucrase";
export { React, ReactJsxRuntime, SmelterSdk };
