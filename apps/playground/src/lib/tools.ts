// Single source of truth for the toolchain entries surfaced by the docs
// guides (`/docs`) and the multi-tool playground (`/playground?tool=…`).
//
// `runnable` marks the tools that can execute entirely in the browser on
// WebAssembly. The two that can't — svelte-check (drives the native `tsgo`
// type-checker) and vite-plugin-svelte (needs a running Vite / Node dev
// server) — still get a playground entry, but it explains the limitation
// and links the guide instead of running.

export type ToolId =
	| 'compiler'
	| 'svelte2tsx'
	| 'fmt'
	| 'lint'
	| 'svelte-check'
	| 'vite-plugin-svelte';

export interface Tool {
	/** Stable id, also the `?tool=` value and the `/docs/[slug]`. */
	id: ToolId;
	/** Short switcher label, e.g. "Compiler". */
	label: string;
	/** Published package / tool name, e.g. "@rsvelte/compiler". */
	pkg: string;
	/** One-line description for switcher tooltips and guide headers. */
	tagline: string;
	/** Whether the tool runs in-browser on WASM. */
	runnable: boolean;
	/** When not runnable, why — shown in the playground panel. */
	cantRunReason?: string;
}

export const TOOLS: Tool[] = [
	{
		id: 'compiler',
		label: 'Compiler',
		pkg: '@rsvelte/compiler',
		tagline: 'Compile a .svelte component to client / SSR JavaScript, CSS and AST.',
		runnable: true
	},
	{
		id: 'svelte2tsx',
		label: 'svelte2tsx',
		pkg: '@rsvelte/svelte2tsx',
		tagline: 'Turn a component into the TSX shadow file the TypeScript checker reads.',
		runnable: true
	},
	{
		id: 'fmt',
		label: 'format',
		pkg: '@rsvelte/fmt',
		tagline: 'Format a .svelte file with the Rust-native formatter built on oxc.',
		runnable: true
	},
	{
		id: 'lint',
		label: 'lint',
		pkg: '@rsvelte/lint',
		tagline: 'Lint a .svelte component with the Rust-native linter (compiler warnings + a11y + native rules).',
		runnable: true
	},
	{
		id: 'svelte-check',
		label: 'svelte-check',
		pkg: '@rsvelte/svelte-check',
		tagline: 'Project type-checker CLI — a Rust walker + overlay driving tsgo.',
		runnable: false,
		cantRunReason:
			'svelte-check type-checks a whole project through the native tsgo backend, which has no WebAssembly build — so it cannot run in a browser. Use the CLI; the guide shows how.'
	},
	{
		id: 'vite-plugin-svelte',
		label: 'vite-plugin-svelte',
		pkg: '@rsvelte/vite-plugin-svelte',
		tagline: 'Drop-in Vite plugin routing every transform / HMR call through rsvelte.',
		runnable: false,
		cantRunReason:
			'The Vite plugin only has meaning inside a running Vite / Node dev server (it hooks transform & HMR), so there is nothing to run in a browser. Use it in your project; the guide shows the config.'
	}
];

export const toolById = (id: string): Tool | undefined => TOOLS.find((t) => t.id === id);

export const isToolId = (v: string): v is ToolId => TOOLS.some((t) => t.id === v);
