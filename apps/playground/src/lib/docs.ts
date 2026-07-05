// Data-driven per-library usage guides rendered by `Guide.svelte`. One entry
// per shipped package, keyed by the same slug as `tools.ts` and the
// `/docs/[slug]` route. Keep prose terse and code copy-pasteable; these are
// drop-in replacements, so the APIs mirror the upstream tools they replace.

import { type ToolId } from './tools';

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
	id: 'compiler',
	title: 'Compiler',
	pkg: '@rsvelte/compiler',
	dropInFor: 'svelte/compiler',
	tagline:
		'The whole compile pipeline — parse, analyze, transform — for client, SSR and hydration, with output that matches the official compiler across the in-scope test suite.',
	install: 'npm i @rsvelte/compiler',
	runnable: true,
	sections: [
		{
			title: 'Compile a component',
			body: [
				'The package ships the compiler as WebAssembly — initialise it once, then compile for the client or the server. Output matches the official compiler.'
			],
			code: {
				lang: 'js',
				code: `import init, { compile_client, compile_server } from '@rsvelte/compiler';

await init(); // once, before any other call

const { js, css } = compile_client(source, 'App');
console.log(js);  // generated JavaScript
console.log(css); // scoped styles

const ssr = compile_server(source, 'App');`
			}
		},
		{
			title: 'Parse to an AST',
			body: ['`parse_svelte` returns the Svelte AST — the same shape the official parser produces.'],
			code: {
				lang: 'js',
				code: `import init, { parse_svelte } from '@rsvelte/compiler';

await init();
const ast = JSON.parse(parse_svelte(source).ast);
// walk ast.fragment / ast.instance / ast.module / ast.css`
			}
		},
		{
			title: 'Why it is fast',
			list: [
				'Written in Rust — the same core also ships as a native NAPI addon (`@rsvelte/vite-plugin-svelte-native`) with the exact `svelte/compiler` surface.',
				'Memory-efficient AST (u32 spans, compact strings) and direct phase-to-phase AST passing.',
				'Parser alone runs ~113× the JavaScript parser; the full pipeline ~13×.'
			]
		}
	]
};

const svelte2tsx: Guide = {
	id: 'svelte2tsx',
	title: 'svelte2tsx',
	pkg: '@rsvelte/svelte2tsx',
	dropInFor: 'svelte2tsx',
	tagline:
		'Turns a .svelte component into the TSX shadow file the TypeScript checker reads, with column-accurate source maps.',
	install: 'npm i @rsvelte/svelte2tsx',
	runnable: true,
	sections: [
		{
			title: 'Generate a TSX shadow file',
			body: [
				'Pass the component source and a filename. You get back the generated `code`, a source `map`, and the exported prop names the type-checker needs.'
			],
			code: {
				lang: 'ts',
				code: `import { svelte2tsx } from '@rsvelte/svelte2tsx';

const { code, map, exportedNames } = await svelte2tsx(source, {
  filename: 'App.svelte',
  isTsFile: true,
  mode: 'ts' // 'ts' | 'dts'
});

console.log(exportedNames.props); // ['count', 'label', …]`
			}
		},
		{
			title: 'Options',
			table: {
				head: ['Option', 'Type', 'Meaning'],
				rows: [
					['filename', 'string', 'Source filename, used in diagnostics & maps'],
					['isTsFile', 'boolean', 'Treat `<script>` as TypeScript'],
					['mode', "'ts' | 'dts'", 'Emit a checking shadow or a `.d.ts`'],
					['namespace', "'html' | 'svg' | 'mathml'", 'Element namespace for the template']
				]
			}
		},
		{
			title: 'Notes',
			list: [
				'100% of the upstream svelte2tsx fixtures pass.',
				'Source maps are hi-res so diagnostics land on the exact column in the original `.svelte`.',
				'This is the engine `@rsvelte/svelte-check` drives for the TypeScript half.'
			]
		}
	]
};

const fmt: Guide = {
	id: 'fmt',
	title: 'fmt',
	pkg: '@rsvelte/fmt',
	dropInFor: 'prettier-plugin-svelte',
	tagline:
		'A Rust-native formatter for .svelte files — in-process, with no Node startup and no Prettier doc-IR round-trip. JS / TS go through oxc_formatter; CSS routes to oxfmt.',
	install: 'npm i -D @rsvelte/fmt',
	runnable: true,
	sections: [
		{
			title: 'Format files',
			code: {
				lang: 'bash',
				code: `# Check formatting (non-zero exit if any file would change)
rsvelte-fmt --check "src/**/*.svelte"

# Rewrite files in place
rsvelte-fmt --write "src/**/*.svelte"`
			}
		},
		{
			title: 'Flags',
			table: {
				head: ['Flag', 'Default', 'Meaning'],
				rows: [
					['--check', '—', 'Exit non-zero if any file is unformatted'],
					['--write', '—', 'Rewrite files in place'],
					['--use-tabs', 'false', 'Indent with tabs instead of spaces'],
					['--tab-width', '2', 'Spaces per indent level'],
					['--print-width', '80', 'Target line width']
				]
			}
		},
		{
			title: 'Configuration',
			body: [
				'JS / TS keys (quotes, semicolons, trailing commas, …) are read from an `.oxfmtrc` so inline `<script>` blocks format identically to standalone files.'
			],
			code: {
				lang: 'json',
				caption: '.oxfmtrc',
				code: `{
  "useTabs": true,
  "printWidth": 100,
  "semicolons": "always",
  "quoteStyle": "single"
}`
			}
		},
		{
			title: 'In the browser',
			body: [
				'The playground runs the formatter on WebAssembly. `<style>` bodies are left verbatim there — CSS formatting needs the native `oxfmt` subprocess, which the CLI uses but a browser cannot spawn.'
			]
		}
	]
};

const svelteCheck: Guide = {
	id: 'svelte-check',
	title: 'svelte-check',
	pkg: '@rsvelte/svelte-check',
	dropInFor: 'svelte-check',
	tagline:
		'The project type-checker CLI. A Rust walker + svelte2tsx overlay drives tsc — or Microsoft\'s native tsgo with --tsgo — for the TypeScript half; diagnostics map back to .svelte positions. Watch + incremental cache included.',
	install: 'npm i -D @rsvelte/svelte-check',
	runnable: false,
	sections: [
		{
			title: 'Run a check',
			code: {
				lang: 'bash',
				code: `# Type-check the current project
rsvelte-check

# Prefer the native tsgo backend (faster than tsc)
rsvelte-check --tsgo

# Point at a workspace folder and tsconfig
rsvelte-check --workspace . --tsconfig ./tsconfig.json

# Re-check on change
rsvelte-check --watch --incremental`
			}
		},
		{
			title: 'Flags',
			table: {
				head: ['Flag', 'Meaning'],
				rows: [
					['--workspace <dir>', 'Root folder to discover `.svelte` files under'],
					['--tsconfig <path>', 'tsconfig the generated overlay should extend'],
					['--tsgo', 'Prefer the native tsgo backend over tsc'],
					['--no-type-check', 'Svelte diagnostics only, skip TypeScript'],
					['--watch', 'Watch and re-check on change'],
					['--incremental', 'Reuse the cached overlay between runs'],
					['--fail-on-warnings', 'Exit non-zero when warnings exist'],
					['--output <format>', 'Reporter: human | human-verbose | machine | machine-verbose']
				]
			}
		},
		{
			title: 'Why it cannot run in the playground',
			body: [
				'svelte-check type-checks an entire project through a native TypeScript backend (`tsc` or `tsgo`), which cannot run in a browser. The Rust walker discovers files, generates a TSX overlay per component, runs the type-checker, then maps diagnostics back to `.svelte` positions — none of which works in a browser sandbox. Run the CLI in your project instead.'
			]
		},
		{
			title: 'Notes',
			list: [
				'Incremental cache (incl. a per-file warning cache) keeps re-checks fast.',
				'Parallel compile + hi-res svelte2tsx source maps for column-accurate diagnostics.',
				'SvelteKit generated kit-files are augmented so `$app/*` / route types resolve.'
			]
		}
	]
};

const vitePlugin: Guide = {
	id: 'vite-plugin-svelte',
	title: 'vite-plugin-svelte',
	pkg: '@rsvelte/vite-plugin-svelte',
	dropInFor: '@sveltejs/vite-plugin-svelte',
	tagline:
		'A fork of the Vite plugin whose every transform / HMR / preprocess call routes through the rsvelte compiler over NAPI. Your vite.config.js does not change.',
	install: 'npm i -D @rsvelte/vite-plugin-svelte',
	runnable: false,
	sections: [
		{
			title: 'Use it in vite.config',
			body: ['Swap the import — the plugin API matches upstream, so the rest of your config is unchanged.'],
			code: {
				lang: 'js',
				caption: 'vite.config.js',
				code: `import { defineConfig } from 'vite';
import { svelte } from '@rsvelte/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()]
});`
			}
		},
		{
			title: 'Why it cannot run in the playground',
			body: [
				'A Vite plugin only means anything inside a running Vite / Node dev server — it hooks `transform` and `hotUpdate` and talks to the rsvelte compiler over a native NAPI binding. There is no component to "run" in a browser tab. Install it in your project and your existing dev / build commands pick it up.'
			]
		},
		{
			title: 'Notes',
			list: [
				'Every `transform` / `hotUpdate` / preprocess call routes through the Rust NAPI binding.',
				'Public API matches `@sveltejs/vite-plugin-svelte`, so config and SvelteKit setups are unchanged.'
			]
		}
	]
};

export const GUIDES: Guide[] = [compiler, svelte2tsx, fmt, svelteCheck, vitePlugin];

export const guideById = (id: string): Guide | undefined => GUIDES.find((g) => g.id === id);
