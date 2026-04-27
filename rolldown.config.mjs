import { defineConfig } from "rolldown";
import serve from "rollup-plugin-serve";

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
  plugins: [...(dev ? [serve(serveOptions)] : [])],
  moduleContext: (id) => {
    if (thisAsWindowForModules.some((id_) => id.trimEnd().endsWith(id_))) {
      return "window";
    }
  },
});
