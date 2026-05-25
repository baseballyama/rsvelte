/**
 * Generate HTML for the preview iframe that runs compiled Svelte components.
 *
 * Uses import maps to resolve Svelte runtime dependencies from esm.sh CDN,
 * allowing our compiled code to run directly in the browser.
 */

const IMPORT_MAP = {
	imports: {
		svelte: 'https://esm.sh/svelte@5.53.6',
		'svelte/internal/disclose-version': 'https://esm.sh/svelte@5.53.6/internal/disclose-version',
		'svelte/internal/client': 'https://esm.sh/svelte@5.53.6/internal/client'
	}
};

const BASE_STYLES = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 1rem; background: white; color: #333; }
`.trim();

/**
 * Transform the compiled JS to make it usable in the browser.
 * Converts `export default function` to a named const for mounting.
 */
function transformCompiledJs(js: string): string {
	return js.replace(/export\s+default\s+function/, 'const Component = function');
}

/**
 * Generate the complete HTML document for the preview iframe.
 */
export function generatePreviewHtml(js: string, css: string): string {
	const transformedJs = transformCompiledJs(js);
	const componentCss = css || '';

	return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<script type="importmap">
${JSON.stringify(IMPORT_MAP, null, 2)}
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
${transformedJs}
const target = document.getElementById("app");
mount(Component, { target });
</script>
</body>
</html>`;
}
