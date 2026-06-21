// Canonical inventory of the Svelte ecosystem ports.
//
// This is the single source of truth shared by the home page's ecosystem
// section and the dedicated /ecosystem inventory page. When a wave lands or a
// status changes, edit it here once.
//
// Status semantics:
//   - 'shipped'    : published under @rsvelte, drop-in usable today
//   - 'planned'    : on the roadmap but not yet usable (blocked / deferred)
//   - 'delegated'  : intentionally NOT ported — the Rust path runs through the
//                    wider OXC toolchain (oxlint / oxfmt / …) or stays in JS
//
// Speedups are multi-threaded rsvelte vs. the official JavaScript tool,
// measured on the same corpus/machine — see /benchmark for the live numbers.

export type EcoStatus = 'shipped' | 'planned' | 'delegated';

export interface EcoComponent {
	/** rsvelte package or tool name (e.g. `@rsvelte/compiler`). */
	name: string;
	/** The upstream tool this is a drop-in replacement for. */
	dropInFor: string;
	/** Link to the original library / docs. */
	originalUrl: string;
	/** Link to the rsvelte package source (optional). */
	pkgUrl?: string;
	/** npm install id, when published. */
	install?: string;
	status: EcoStatus;
	/** Short, plain-language description of what it does. */
	blurb: string;
	/** Measured multi-thread speedup vs. the JS tool, when benchmarked. */
	speedup?: { x: number; of: string };
	/** Compatibility / status footnote (e.g. "100% of fixtures"). */
	note?: string;
	/** For delegated tools: where the Rust path actually lives. */
	routesTo?: { label: string; url: string };
}

const STATUS_LABEL: Record<EcoStatus, string> = {
	shipped: 'Shipped',
	planned: 'Planned',
	delegated: 'Delegated'
};

export const statusLabel = (s: EcoStatus): string => STATUS_LABEL[s];

// ─── Ported / shipped ────────────────────────────────────────────────────────
export const shipped: EcoComponent[] = [
	{
		name: '@rsvelte/compiler',
		dropInFor: 'svelte/compiler',
		originalUrl: 'https://svelte.dev/docs/svelte/svelte-compiler',
		pkgUrl: 'https://github.com/baseballyama/rsvelte/tree/main/apps/npm/compiler',
		install: 'npm i @rsvelte/compiler',
		status: 'shipped',
		blurb:
			'The whole compile pipeline — parse, analyze, transform — for client, SSR and hydration. Output matches the official compiler across the in-scope test suite.',
		speedup: { x: 13, of: 'full pipeline' },
		note: 'Parser alone runs 96× · 99.8% of in-scope fixtures green'
	},
	{
		name: '@rsvelte/svelte2tsx',
		dropInFor: 'svelte2tsx',
		originalUrl: 'https://github.com/sveltejs/language-tools/tree/master/packages/svelte2tsx',
		pkgUrl: 'https://github.com/baseballyama/rsvelte/tree/main/apps/npm/svelte2tsx',
		install: 'npm i @rsvelte/svelte2tsx',
		status: 'shipped',
		blurb:
			'Turns a .svelte component into the TSX shadow file the TypeScript checker reads, with column-accurate source maps.',
		speedup: { x: 19, of: 'svelte2tsx' },
		note: 'Wave 1 · 100% of fixtures'
	},
	{
		name: '@rsvelte/svelte-check',
		dropInFor: 'svelte-check',
		originalUrl: 'https://github.com/sveltejs/language-tools/tree/master/packages/svelte-check',
		pkgUrl: 'https://github.com/baseballyama/rsvelte/tree/main/apps/npm/svelte-check',
		install: 'npm i -D @rsvelte/svelte-check',
		status: 'shipped',
		blurb:
			'The project type-checker CLI. A Rust walker + overlay drives tsgo for the TypeScript half; diagnostics map back to .svelte positions. Watch + incremental cache included.',
		speedup: { x: 145, of: 'svelte-check' },
		note: 'Rust walker + tsgo backend · 500-file workspace'
	},
	{
		name: '@rsvelte/fmt',
		dropInFor: 'prettier-plugin-svelte',
		originalUrl: 'https://github.com/sveltejs/prettier-plugin-svelte',
		pkgUrl: 'https://github.com/baseballyama/rsvelte/tree/main/apps/npm/fmt',
		install: 'npm i -D @rsvelte/fmt',
		status: 'shipped',
		blurb:
			'A Rust-native formatter for .svelte files — in-process, with no Node startup and no Prettier doc-IR round-trip. Routes .js / .ts / .css to oxfmt, with both pipelines running in parallel.',
		speedup: { x: 204, of: 'fmt' },
		note: 'Built on oxc_formatter · vs prettier-plugin-svelte'
	},
	{
		name: '@rsvelte/vite-plugin-svelte',
		dropInFor: '@sveltejs/vite-plugin-svelte',
		originalUrl: 'https://github.com/sveltejs/vite-plugin-svelte',
		pkgUrl: 'https://github.com/baseballyama/vite-plugin-svelte/tree/rsvelte',
		install: 'npm i -D @rsvelte/vite-plugin-svelte',
		status: 'shipped',
		blurb:
			'A fork of the Vite plugin whose every transform / HMR / preprocess call routes through the rsvelte compiler over NAPI. Your vite.config.js does not change.',
		note: 'NAPI shim · public API matches upstream'
	}
];

// ─── Planned / deferred ──────────────────────────────────────────────────────
export const planned: EcoComponent[] = [
	{
		name: 'svelte-language-server',
		dropInFor: 'svelte-language-server',
		originalUrl: 'https://github.com/sveltejs/language-tools/tree/master/packages/language-server',
		status: 'planned',
		blurb:
			'Editor hover / completion / rename. Deferred until tsgo ships a long-running tsserver-style daemon — sub-50 ms LSP latency needs it. CLI checking is already covered by svelte-check.',
		note: 'Blocked on tsgo tsserver mode'
	}
];

// ─── Delegated / out of scope ────────────────────────────────────────────────
// These are intentionally NOT ported. The Rust path runs through the wider OXC
// toolchain or stays in JS, so a rsvelte fork would only duplicate work.
export const delegated: EcoComponent[] = [
	{
		name: 'eslint-plugin-svelte',
		dropInFor: 'eslint-plugin-svelte',
		originalUrl: 'https://github.com/sveltejs/eslint-plugin-svelte',
		status: 'delegated',
		blurb: 'Linting belongs in oxlint — rsvelte gives it a Svelte surface to call into.',
		routesTo: { label: 'oxlint', url: 'https://oxc.rs/docs/guide/usage/linter.html' }
	},
	{
		name: 'svelte-preprocess',
		dropInFor: 'svelte-preprocess',
		originalUrl: 'https://github.com/sveltejs/svelte-preprocess',
		status: 'delegated',
		blurb: 'A thin wrapper around sass / postcss / ts — all JS-heavy. Nothing to gain by porting the wrapper itself.'
	},
	{
		name: 'mdsvex',
		dropInFor: 'mdsvex',
		originalUrl: 'https://github.com/pngwn/MDsveX',
		status: 'delegated',
		blurb: 'Built on the unified / remark markdown ecosystem, which is JS to the core.'
	},
	{
		name: 'SvelteKit',
		dropInFor: '@sveltejs/kit',
		originalUrl: 'https://github.com/sveltejs/kit',
		status: 'delegated',
		blurb: 'A whole framework, deeply coupled to Vite / Rollup. Out of scope — specific hot paths may be revisited later.'
	}
];

export const allComponents: EcoComponent[] = [...shipped, ...planned, ...delegated];

export const counts = {
	shipped: shipped.length,
	planned: planned.length,
	delegated: delegated.length
};
