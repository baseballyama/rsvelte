// Data-driven per-library usage guides rendered by `Guide.svelte`. One entry
// per shipped package, keyed by the same slug as `tools.ts` and the
// `/docs/[slug]` route. Keep prose terse and code copy-pasteable; these are
// drop-in replacements, so the APIs mirror the upstream tools they replace.
//
// `GUIDES` is a `Record<ToolId, Guide>`, so a tool added to `tools.ts` without
// a page here fails to type-check instead of 404ing at `/docs/<slug>`.

import { TOOLS, type ToolId } from './tools';

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
	/** One line for the "choosing a package" table on the overview page. */
	useFor: string;
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
	useFor: 'Compile Svelte components for client and server.',
	install: 'pnpm add @rsvelte/compiler',
	runnable: true,
	sections: [
		{
			title: 'Compile a component',
			body: [
				'The package ships a browser-oriented WebAssembly API. Initialise it once, then compile for the client or the server. Its exported names are specific to this package; use the native binding for Node build tooling.'
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
			body: ['`parse_svelte` is the WASM package AST API. It returns JSON describing the Svelte AST.'],
			code: {
				lang: 'js',
				code: `import init, { parse_svelte } from '@rsvelte/compiler';

await init();
const ast = JSON.parse(parse_svelte(source).ast);
// walk ast.fragment / ast.instance / ast.module / ast.css`
			}
		},
		{
			title: 'Node, not the browser',
			body: [
				'The same compiler core also ships as a native NAPI addon inside `@rsvelte/vite-plugin-svelte-native`, with `compile`, `compileModule`, `parse`, and `preprocess` APIs used by the Vite plugin. Reach for it directly when you are writing your own build step.'
			]
		},
		{
			title: 'Why it is fast',
			list: [
				'Written in Rust, with a memory-efficient AST (u32 spans, compact strings) and direct phase-to-phase AST passing — no re-parse between phases.',
				'The parser and the whole pipeline are parallel over files, so a project build scales with cores.',
				'Numbers move with every release, so they live on the benchmark page rather than in this prose — it is regenerated from a recorded run.'
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
	useFor: 'Generate TypeScript shadow files from Svelte components.',
	install: 'pnpm add @rsvelte/svelte2tsx',
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
		'A Rust-native formatter for .svelte files — in-process, with no Node startup and no Prettier doc-IR round-trip. Embedded JS / TS / CSS go through the same oxc engines oxfmt uses.',
	useFor: 'Format .svelte files, and the JS / TS / CSS / JSON around them.',
	install: 'pnpm add -D @rsvelte/fmt',
	runnable: true,
	sections: [
		{
			title: 'Format files',
			body: [
				'`.svelte` files are formatted in process. Any other path is handed to `oxfmt`, so a directory covers the whole set it formats — `.ts` / `.js` / `.css` / `.json`, and `.md` / `.yaml` / `.toml` / `.html` too. With no path at all, the current directory is formatted.'
			],
			code: {
				lang: 'bash',
				code: `# Check formatting (non-zero exit if any file would change)
rsvelte-fmt --check "src/**/*.svelte"

# Rewrite files in place
rsvelte-fmt --write src

# Format a buffer from an editor
rsvelte-fmt --stdin --stdin-filepath src/App.svelte < App.svelte`
			}
		},
		{
			title: 'Flags',
			table: {
				head: ['Flag', 'Default', 'Meaning'],
				rows: [
					['--check', '—', 'Exit non-zero if any file is unformatted'],
					['--write', '—', 'Rewrite files in place (implied for a directory)'],
					['--stdin --stdin-filepath <path>', '—', 'Format stdin; the path picks the engine'],
					['-c, --config <path>', 'discovered', 'Explicit `.oxfmtrc`; otherwise found upward'],
					['--print-width <n>', '80', 'Target line width'],
					['--tab-width <n>', '2', 'Spaces per indent level'],
					['--use-tabs', 'false', 'Indent with tabs instead of spaces'],
					['--no-native-js / --no-native-css', 'false', 'Delegate JS / CSS back to an `oxfmt` subprocess']
				]
			}
		},
		{
			title: 'Configuration',
			body: [
				'JS / TS keys (quotes, semicolons, trailing commas, …) are read from an `.oxfmtrc` so inline `<script>` blocks format identically to standalone files. The nearest `.oxfmtrc.json` / `.oxfmtrc.jsonc` is discovered upward from the working directory, matching oxfmt.'
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
			title: 'CSS is formatted in process too',
			body: [
				'Embedded `<style>` blocks and standalone `.css` / `.scss` / `.less` files go through the Rust `oxc_formatter_css` crate — the same engine `oxfmt` runs, byte-identical, without a subprocess. That is why the playground can format a full component in the browser, `<style>` included. `--no-native-css` reverts to the old `oxfmt`-subprocess path if a divergence is ever found.'
			]
		},
		{
			title: 'Embedding it',
			body: [
				'`rsvelte_fmt::FormatSession` is the CLI pipeline — config discovery, option layering, extension dispatch — exposed as a library, so an editor integration resolves a buffer exactly the way `rsvelte-fmt --stdin --stdin-filepath` would. The language server uses it.'
			]
		}
	]
};

const lint: Guide = {
	id: 'lint',
	title: 'lint',
	pkg: '@rsvelte/lint',
	dropInFor: 'eslint-plugin-svelte',
	tagline:
		"A native Svelte linter built on the compiler itself — no second ESTree parse, no Node in the hot path. The compiler's own validator and a11y diagnostics and the ported eslint-plugin-svelte rules run in one shared AST walk.",
	useFor: 'Lint .svelte components and .svelte.js/.ts modules.',
	install: 'pnpm add -D @rsvelte/lint',
	runnable: true,
	sections: [
		{
			title: 'Lint a project',
			code: {
				lang: 'bash',
				code: `npx rsvelte-lint src/                 # recurse a directory
npx rsvelte-lint src/App.svelte       # a single file
npx rsvelte-lint --fix src/           # apply autofixes in place
npx rsvelte-lint --format sarif src/  # SARIF for CI code scanning
npx rsvelte-lint --list-rules         # every rule + default severity`
			}
		},
		{
			title: 'Flags',
			table: {
				head: ['Flag', 'Meaning'],
				rows: [
					['--format <f>', 'human | human-verbose | machine | machine-verbose | github-actions | sarif'],
					['--config <file>', '`rsvelte-lint.json`; discovered upward when omitted'],
					['--config-from-eslint <file>', 'Import `svelte/*` severities from an ESLint flat config'],
					['--off <rule> / --error <rule>', 'Override one rule (repeatable)'],
					['--fix', 'Apply autofixes in place before reporting'],
					['--max-warnings <n>', 'Exit non-zero above this many warnings'],
					['--list-rules', 'Print the native rule set and exit'],
					['--print-eslint-config', 'Print a flat-config snippet disabling the rules this owns']
				]
			}
		},
		{
			title: 'Configuration',
			body: [
				'Severities and rule options come from a `rsvelte-lint.json` (or `.rsvelte-lintrc.json`), found by walking up from the file being linted. With no config every rule runs at its default severity — the `recommended` preset. Use `"extends": ["none"]` to start from nothing and opt in.'
			],
			code: {
				lang: 'json',
				caption: 'rsvelte-lint.json',
				code: `{
  "extends": ["recommended"],
  "rules": {
    "svelte/no-at-html-tags": "error",
    "svelte/no-unused-class-name": "off",
    "svelte/button-has-type": ["warn", { "submit": true, "reset": false }]
  }
}`
			}
		},
		{
			title: 'Running it inside oxlint',
			body: [
				'`@rsvelte/oxlint-plugin` exposes the same rules as oxlint rules, so JS / TS and Svelte diagnostics come out of a single pass and a single report. It loads the native addon where one exists and falls back to the WebAssembly engine everywhere else, with identical output.'
			],
			code: {
				lang: 'json',
				caption: '.oxlintrc.json',
				code: `{
  "jsPlugins": ["@rsvelte/oxlint-plugin"],
  "extends": ["./node_modules/@rsvelte/oxlint-plugin/recommended.json"]
}`
			}
		},
		{
			title: 'Notes',
			list: [
				"All 80 upstream `eslint-plugin-svelte` rules are ported and checked against the plugin's own fixtures.",
				"The compiler's ~70 warning codes, ~145 error codes and 42 `a11y_*` rules surface as diagnostics from the same run.",
				'This is the engine behind the language server’s editor diagnostics.'
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
		'The project type-checker CLI. A Rust walker + svelte2tsx overlay drives tsc — or the TypeScript 7 native compiler with --tsgo — for the TypeScript half; diagnostics map back to .svelte positions. Watch + incremental cache included.',
	useFor: 'Type-check Svelte projects from the command line.',
	install: 'pnpm add -D @rsvelte/svelte-check',
	runnable: false,
	sections: [
		{
			title: 'Run a check',
			code: {
				lang: 'bash',
				code: `# Type-check the current project
rsvelte-check

# Use the TypeScript 7 native compiler
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
					['--no-tsconfig', 'Ignore any project tsconfig/jsconfig entirely'],
					['--config <path>', 'A `svelte.config.*` / `vite.config.*` under a non-standard name'],
					['--tsgo', 'Type-check with the TypeScript 7 native compiler'],
					['--no-type-check', 'Svelte diagnostics only, skip TypeScript'],
					['--diagnostic-sources <list>', 'Any subset of `svelte`, `ts`/`js`, `css`'],
					['--compiler-warnings <list>', '`code:error|ignore` overrides, comma-separated'],
					['--threshold <level>', '`warning` (default) or `error` — filters printing, not counts'],
					['--ignore <list>', 'Path components to skip while walking'],
					['--watch', 'Watch and re-check on change'],
					['--incremental', 'Reuse the cached overlay between runs'],
					['--fail-on-warnings', 'Exit non-zero when warnings exist'],
					['--emit-overlay', 'Keep the generated `.tsx` overlay on disk for inspection'],
					['--output <format>', 'human | human-verbose | machine | machine-verbose | github-actions']
				]
			}
		},
		{
			title: 'Reading project config',
			body: [
				'The diagnostic-relevant `compilerOptions` are read statically from `svelte.config.*` and from a `svelte()` / `sveltekit()` plugin call in `vite.config.*`, merged the way vite-plugin-svelte merges them. That is what keeps `experimental.async` projects from being told their top-level `await` is an error.',
				'`--config` names one of those files under a non-standard name or location. A file named `svelte.config.*` is read as a Svelte config; anything else is read as a Vite config when it actually declares a Svelte plugin, matching upstream `load-config`.'
			]
		},
		{
			title: 'Why it cannot run in the playground',
			body: [
				'svelte-check type-checks an entire project through a native TypeScript backend (`tsc` or the TypeScript 7 native compiler), which cannot run in a browser. The Rust walker discovers files, generates a TSX overlay per component, runs the type-checker, then maps diagnostics back to `.svelte` positions — none of which works in a browser sandbox. Run the CLI in your project instead.'
			]
		},
		{
			title: 'Notes',
			list: [
				'Incremental cache (incl. a per-file warning cache) keeps re-checks fast.',
				'Parallel compile + hi-res svelte2tsx source maps for column-accurate diagnostics.',
				'SvelteKit generated kit-files are augmented so `$app/*` / route types resolve.',
				'`--tsgo` is a hard error when TypeScript 7 is not installed, never a silent downgrade to `tsc`.'
			]
		}
	]
};

const languageServer: Guide = {
	id: 'language-server',
	title: 'language-server',
	pkg: '@rsvelte/language-server',
	dropInFor: 'svelte-language-server',
	tagline:
		'A native LSP server for Svelte, HTML and CSS with the full TypeScript surface proxied through a supervised tsgo child.',
	useFor: 'Power editor diagnostics, formatting and completions over LSP.',
	install: 'pnpm add -D @rsvelte/language-server',
	runnable: false,
	sections: [
		{
			title: 'What it answers',
			list: [
				'`textDocument/publishDiagnostics` — the `rsvelte_lint` engine, on open, on change (debounced) and on save.',
				'`textDocument/formatting` — the `rsvelte-fmt` pipeline in process, no subprocess.',
				'`completion`, `hover`, definitions, references, rename and signature help — mapped between `.svelte` and diskless `.svelte.tsx` shadows.',
				'Pull diagnostics, semantic tokens, inlay hints, call hierarchy, workspace symbols and TypeScript code actions.',
				'Component props, events and slot-let completions, SvelteKit `$types` imports, source actions and reference code lenses.',
				'Plain `.ts` and `.js` proxying replaces the upstream TypeScript plugin.'
			]
		},
		{
			title: 'Wire it into an editor',
			body: [
				'The binary speaks LSP over stdio, so any client can launch it. In VS Code, install the `rsvelte` extension instead — it bundles the server, a TextMate grammar and the `svelte.*` settings.'
			],
			code: {
				lang: 'bash',
				code: `# Neovim, Helix, Emacs, … — launch over stdio
rsvelte-language-server`
			}
		},
		{
			title: 'Settings',
			table: {
				head: ['Key', 'Default', 'Meaning'],
				rows: [
					['rsvelte.format.enable', 'true', 'Enable formatting'],
					['rsvelte.lint.enable', 'true', 'Enable diagnostics'],
					['rsvelte.rsvelteFmtPath', '""', 'Explicit `rsvelte-fmt` binary path']
				]
			}
		},
		{
			title: 'TypeScript backend',
			body: [
				'TypeScript features require TypeScript 7 (`@typescript/native` or `@typescript/native-preview`) in the workspace, or an explicit `TSGO_BIN`. The native providers remain available when tsgo is absent.'
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
	useFor: 'Compile Svelte applications with Vite.',
	install: 'pnpm add -D @rsvelte/vite-plugin-svelte',
	runnable: false,
	sections: [
		{
			title: 'Use it in vite.config',
			body: [
				'Swap the import — the plugin API matches upstream, so the rest of your config is unchanged. Vite 6, 7 and 8 are supported.'
			],
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

/** Every tool in `tools.ts` must have a page; the `Record` is what enforces it. */
export const GUIDES: Record<ToolId, Guide> = {
	compiler,
	svelte2tsx,
	fmt,
	lint,
	'svelte-check': svelteCheck,
	'language-server': languageServer,
	'vite-plugin-svelte': vitePlugin
};

/** Guides in the order the toolchain is presented, i.e. `TOOLS` order. */
export const GUIDE_LIST: Guide[] = TOOLS.map((tool) => GUIDES[tool.id]);

export const guideById = (id: string): Guide | undefined =>
	Object.hasOwn(GUIDES, id) ? GUIDES[id as ToolId] : undefined;
