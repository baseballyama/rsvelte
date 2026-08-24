/**
 * Generate HTML for the preview iframe that runs compiled Svelte components.
 *
 * Uses import maps to resolve Svelte runtime dependencies from esm.sh CDN,
 * allowing our compiled code to run directly in the browser.
 */

const IMPORT_MAP = {
  imports: {
    svelte: "https://esm.sh/svelte@5.56.10",
    "svelte/internal/disclose-version": "https://esm.sh/svelte@5.56.10/internal/disclose-version",
    "svelte/internal/client": "https://esm.sh/svelte@5.56.10/internal/client",
  },
};

const BASE_STYLES = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 1rem; background: white; color: #333; }
`.trim();

export interface PreviewModule {
  filename: string;
  js: string;
  css: string;
}

function toDataUrl(source: string): string {
  const bytes = new TextEncoder().encode(source);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return `data:text/javascript;base64,${btoa(binary)}`;
}

function resolveModule(
  from: string,
  specifier: string,
  modules: Map<string, PreviewModule>,
): string {
  const base = new URL(from, "https://playground.rsvelte.local/");
  const resolved = new URL(specifier, base).pathname.replace(/^\//, "");
  for (const candidate of [resolved, `${resolved}.svelte`, `${resolved}/index.svelte`]) {
    if (modules.has(candidate)) return candidate;
  }
  throw new Error(`${from}: Cannot resolve ${specifier}`);
}

function moduleSpecifier(filename: string): string {
  return `@rsvelte/playground/${encodeURIComponent(filename)}`;
}

function buildModuleUrls(modules: PreviewModule[]): Map<string, string> {
  const byName = new Map(modules.map((module) => [module.filename, module]));
  const urls = new Map<string, string>();
  const relativeImport = /((?:from\s*|import\s*\(\s*|import\s*)['"])(\.{1,2}\/[^'"]+)(['"])/g;

  for (const module of modules) {
    const js = module.js.replace(relativeImport, (_match, before, specifier, after) => {
      const dependency = resolveModule(module.filename, specifier, byName);
      return `${before}${moduleSpecifier(dependency)}${after}`;
    });
    urls.set(module.filename, toDataUrl(js));
  }
  return urls;
}

/**
 * Generate the complete HTML document for the preview iframe.
 */
export function generatePreviewHtml(js: string, css: string): string {
  return generateProjectPreviewHtml("App.svelte", [{ filename: "App.svelte", js, css }]);
}

/** Generate a preview for a virtual project of compiled Svelte components. */
export function generateProjectPreviewHtml(entry: string, modules: PreviewModule[]): string {
  const urls = buildModuleUrls(modules);
  if (!urls.has(entry)) throw new Error(`Missing entry component: ${entry}`);
  const importMap = {
    imports: {
      ...IMPORT_MAP.imports,
      ...Object.fromEntries([...urls].map(([filename, url]) => [moduleSpecifier(filename), url])),
    },
  };
  const componentCss = modules
    .map((module) => module.css)
    .filter(Boolean)
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<script type="importmap">
${JSON.stringify(importMap, null, 2)}
</script>
<style>
${BASE_STYLES}
${componentCss}
</style>
</head>
<body>
<div id="app"></div>
<script type="module">
import { mount } from "svelte";
import Component from ${JSON.stringify(moduleSpecifier(entry))};
const target = document.getElementById("app");
mount(Component, { target });
</script>
</body>
</html>`;
}
