// Data-driven per-library usage guides rendered by `Guide.svelte`. One entry
// per shipped package, keyed by the same slug as `tools.ts` and the
// `/docs/[slug]` route. Keep prose terse and code copy-pasteable; these are
// drop-in replacements, so the APIs mirror the upstream tools they replace.

import { type ToolId } from "./tools";

export interface GuideCode {
  lang: string;
  code: string;
  /** Optional caption shown above the block. */
  caption?: string;
}

export interface GuideSection {
  title: string;
  /** Paragraphs of body copy. */
  body?: string[];
  /** A bullet list. */
  list?: string[];
  /** A code block. */
  code?: GuideCode;
  /** A small reference table (e.g. CLI flags). */
  table?: { head: string[]; rows: string[][] };
}

export interface Guide {
  id: ToolId;
  title: string;
  pkg: string;
  dropInFor: string;
  tagline: string;
  /** Install command. */
  install: string;
  /** Whether the playground can run this tool in-browser. */
  runnable: boolean;
  sections: GuideSection[];
}

const compiler: Guide = {
  id: "compiler",
  title: "Compiler",
  pkg: "@rsvelte/compiler",
  dropInFor: "svelte/compiler",
  tagline:
    "The whole compile pipeline — parse, analyze, transform — for client, SSR and hydration, with output that matches the official compiler across the in-scope test suite.",
  install: "npm i @rsvelte/compiler",
  runnable: true,
  sections: [
    {
      title: "Compile a component",
      body: [
        "The API mirrors `svelte/compiler`, so most code can switch import paths and keep working. `compile` returns the generated `js` and `css` plus warnings.",
      ],
      code: {
        lang: "js",
        code: `import { compile } from '@rsvelte/compiler';

const { js, css, warnings } = compile(source, {
  name: 'App',
  generate: 'client', // 'client' | 'server'
  css: 'external'     // 'injected' | 'external'
});

console.log(js.code);   // generated JavaScript
console.log(css?.code); // scoped styles, when external`,
      },
    },
    {
      title: "Parse to an AST",
      body: ["`parse` returns the Svelte AST — the same shape the official parser produces."],
      code: {
        lang: "js",
        code: `import { parse } from '@rsvelte/compiler';

const ast = parse(source, { modern: true });
// walk ast.fragment / ast.instance / ast.module / ast.css`,
      },
    },
    {
      title: "Why it is fast",
      list: [
        "Written in Rust, shipped as a native NAPI addon — no per-call JS ↔ engine round-trips.",
        "Memory-efficient AST (u32 spans, compact strings) and direct phase-to-phase AST passing.",
        "Parser alone runs ~96× the JavaScript parser; the full pipeline ~13×.",
      ],
    },
  ],
};

const svelte2tsx: Guide = {
  id: "svelte2tsx",
  title: "svelte2tsx",
  pkg: "@rsvelte/svelte2tsx",
  dropInFor: "svelte2tsx",
  tagline:
    "Turns a .svelte component into the TSX shadow file the TypeScript checker reads, with column-accurate source maps.",
  install: "npm i @rsvelte/svelte2tsx",
  runnable: true,
  sections: [
    {
      title: "Generate a TSX shadow file",
      body: [
        "Pass the component source and a filename. You get back the generated `code`, a source `map`, and the exported prop names the type-checker needs.",
      ],
      code: {
        lang: "ts",
        code: `import { svelte2tsx } from '@rsvelte/svelte2tsx';

const { code, map, exportedNames } = svelte2tsx(source, {
  filename: 'App.svelte',
  isTsFile: true,
  mode: 'ts' // 'ts' | 'dts'
});

console.log(exportedNames.props); // ['count', 'label', …]`,
      },
    },
    {
      title: "Options",
      table: {
        head: ["Option", "Type", "Meaning"],
        rows: [
          ["filename", "string", "Source filename, used in diagnostics & maps"],
          ["isTsFile", "boolean", "Treat `<script>` as TypeScript"],
          ["mode", "'ts' | 'dts'", "Emit a checking shadow or a `.d.ts`"],
          ["namespace", "'html' | 'svg' | 'mathml'", "Element namespace for the template"],
        ],
      },
    },
    {
      title: "Notes",
      list: [
        "100% of the upstream svelte2tsx fixtures pass.",
        "Source maps are hi-res so diagnostics land on the exact column in the original `.svelte`.",
        "This is the engine `@rsvelte/svelte-check` drives for the TypeScript half.",
      ],
    },
  ],
};

const fmt: Guide = {
  id: "fmt",
  title: "fmt",
  pkg: "@rsvelte/fmt",
  dropInFor: "prettier-plugin-svelte",
  tagline:
    "A Rust-native formatter for .svelte files — in-process, with no Node startup and no Prettier doc-IR round-trip. JS / TS go through oxc_formatter; CSS routes to oxfmt.",
  install: "npm i -D @rsvelte/fmt",
  runnable: true,
  sections: [
    {
      title: "Format files",
      code: {
        lang: "bash",
        code: `# Check formatting (non-zero exit if any file would change)
rsvelte-fmt --check "src/**/*.svelte"

# Rewrite files in place
rsvelte-fmt --write "src/**/*.svelte"`,
      },
    },
    {
      title: "Flags",
      table: {
        head: ["Flag", "Default", "Meaning"],
        rows: [
          ["--check", "—", "Exit non-zero if any file is unformatted"],
          ["--write", "—", "Rewrite files in place"],
          ["--use-tabs", "false", "Indent with tabs instead of spaces"],
          ["--tab-width", "2", "Spaces per indent level"],
          ["--print-width", "80", "Target line width"],
        ],
      },
    },
    {
      title: "Configuration",
      body: [
        "JS / TS keys (quotes, semicolons, trailing commas, …) are read from an `.oxfmtrc` so inline `<script>` blocks format identically to standalone files.",
      ],
      code: {
        lang: "json",
        caption: ".oxfmtrc",
        code: `{
  "useTabs": true,
  "printWidth": 100,
  "semicolons": "always",
  "quoteStyle": "single"
}`,
      },
    },
    {
      title: "In the browser",
      body: [
        "The playground runs the formatter on WebAssembly. `<style>` bodies are left verbatim there — CSS formatting needs the native `oxfmt` subprocess, which the CLI uses but a browser cannot spawn.",
      ],
    },
  ],
};

const svelteCheck: Guide = {
  id: "svelte-check",
  title: "svelte-check",
  pkg: "@rsvelte/svelte-check",
  dropInFor: "svelte-check",
  tagline:
    "The project type-checker CLI. A Rust walker + svelte2tsx overlay drives tsgo for the TypeScript half; diagnostics map back to .svelte positions. Watch + incremental cache included.",
  install: "npm i -D @rsvelte/svelte-check",
  runnable: false,
  sections: [
    {
      title: "Run a check",
      code: {
        lang: "bash",
        code: `# Type-check the current project
rsvelte-check

# Point at a workspace folder and tsconfig
rsvelte-check --workspace . --tsconfig ./tsconfig.json

# Re-check on change
rsvelte-check --watch`,
      },
    },
    {
      title: "Flags",
      table: {
        head: ["Flag", "Meaning"],
        rows: [
          ["--workspace <dir>", "Root folder to discover `.svelte` files under"],
          ["--tsconfig <path>", "tsconfig to type-check against"],
          ["--watch", "Watch and re-check incrementally"],
          ["--threshold <level>", "Minimum severity to report (warning | error)"],
          ["--output <format>", "Reporter: human | machine | machine-verbose"],
        ],
      },
    },
    {
      title: "Why it cannot run in the playground",
      body: [
        "svelte-check type-checks an entire project through the native `tsgo` backend, which has no WebAssembly build. The Rust walker discovers files, generates a TSX overlay per component, runs `tsgo`, then maps diagnostics back to `.svelte` positions — none of which works in a browser sandbox. Run the CLI in your project instead.",
      ],
    },
    {
      title: "Notes",
      list: [
        "Incremental cache (incl. a per-file warning cache) keeps re-checks fast.",
        "Parallel compile + hi-res svelte2tsx source maps for column-accurate diagnostics.",
        "SvelteKit generated kit-files are augmented so `$app/*` / route types resolve.",
      ],
    },
  ],
};

const vitePlugin: Guide = {
  id: "vite-plugin-svelte",
  title: "vite-plugin-svelte",
  pkg: "@rsvelte/vite-plugin-svelte",
  dropInFor: "@sveltejs/vite-plugin-svelte",
  tagline:
    "A fork of the Vite plugin whose every transform / HMR / preprocess call routes through the rsvelte compiler over NAPI. Your vite.config.js does not change.",
  install: "npm i -D @rsvelte/vite-plugin-svelte",
  runnable: false,
  sections: [
    {
      title: "Use it in vite.config",
      body: [
        "Swap the import — the plugin API matches upstream, so the rest of your config is unchanged.",
      ],
      code: {
        lang: "js",
        caption: "vite.config.js",
        code: `import { defineConfig } from 'vite';
import { svelte } from '@rsvelte/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()]
});`,
      },
    },
    {
      title: "Why it cannot run in the playground",
      body: [
        'A Vite plugin only means anything inside a running Vite / Node dev server — it hooks `transform` and `hotUpdate` and talks to the rsvelte compiler over a native NAPI binding. There is no component to "run" in a browser tab. Install it in your project and your existing dev / build commands pick it up.',
      ],
    },
    {
      title: "Notes",
      list: [
        "Every `transform` / `hotUpdate` / preprocess call routes through the Rust NAPI binding.",
        "Public API matches `@sveltejs/vite-plugin-svelte`, so config and SvelteKit setups are unchanged.",
      ],
    },
  ],
};

export const GUIDES: Guide[] = [compiler, svelte2tsx, fmt, svelteCheck, vitePlugin];

export const guideById = (id: string): Guide | undefined => GUIDES.find((g) => g.id === id);
