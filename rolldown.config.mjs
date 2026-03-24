import { createRequire } from "node:module";
import { defineConfig } from "rolldown";
import serve from "rollup-plugin-serve";
import ignore from "./build-plugins/ignore-plugin.mjs";

const require = createRequire(import.meta.url);

const IGNORED_FILES = [
  "@material/mwc-notched-outline/mwc-notched-outline.js",
  "@material/mwc-ripple/mwc-ripple.js",
  "@material/mwc-list/mwc-list.js",
  "@material/mwc-list/mwc-list-item.js",
  "@material/mwc-menu/mwc-menu.js",
  "@material/mwc-menu/mwc-menu-surface.js",
  "@material/mwc-icon/mwc-icon.js",
];

const dev = process.env.ROLLDOWN_WATCH || process.env.ROLLUP_WATCH;

const serveOptions = {
  contentBase: ["./", "./dist"],
  host: "0.0.0.0",
  port: 4000,
  allowCrossOrigin: true,
  headers: {
    "Access-Control-Allow-Origin": "*",
  },
};

const thisAsWindowForModules = [
  "node_modules/@formatjs/intl-utils/lib/src/diff.js",
  "node_modules/@formatjs/intl-utils/lib/src/resolve-locale.js",
];

export default defineConfig({
  input: "src/card/energy-breakdown-card.ts",
  output: {
    dir: "dist",
    format: "es",
    codeSplitting: false,
    minify: !dev,
  },
  platform: "browser",
  tsconfig: "./tsconfig.json",
  transform: {
    target: "es2017",
  },
  plugins: [
    ignore({
      files: IGNORED_FILES.map((file) => require.resolve(file)),
    }),
    ...(dev ? [serve(serveOptions)] : []),
  ],
  moduleContext: (id) => {
    if (thisAsWindowForModules.some((id_) => id.trimEnd().endsWith(id_))) {
      return "window";
    }
  },
});
