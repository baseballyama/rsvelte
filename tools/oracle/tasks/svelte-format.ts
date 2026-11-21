import path from 'node:path';
import * as prettier from 'prettier';
import * as sveltePlugin from 'prettier-plugin-svelte';
import * as tailwindPlugin from 'prettier-plugin-tailwindcss';
import type { Task } from '../types.ts';

// Written out so the snapshot does not depend on a prettier default changing.
export const FORMAT_OPTIONS = {
	parser: 'svelte',
	printWidth: 80,
	tabWidth: 2,
	useTabs: false,
	semi: true,
	singleQuote: false,
	trailingComma: 'all',
	bracketSpacing: true,
	svelteSortOrder: 'options-scripts-markup-styles',
	svelteIndentScriptAndStyle: true,
} as const;

const ORACLE = path.dirname(import.meta.dirname);

// Tailwind's default theme, from the pinned `tailwindcss` in tools/oracle: the plugin finds
// Tailwind from the file's directory, so a unit is formatted as if it were in tools/oracle.
const TAILWIND_OPTIONS = {
	tailwindStylesheet: new URL('tailwind.css', import.meta.url).pathname,
	tailwindFunctions: ['clsx', 'cn', 'cva', 'tv'],
} as const;

const task: Task = {
	id: 'svelte.format',
	oracles: ['prettier', 'prettier-plugin-svelte', 'prettier-plugin-tailwindcss', 'tailwindcss'],
	variants: [
		{ id: 'default', options: {} },
		{ id: 'tailwind', options: TAILWIND_OPTIONS },
	],
	appliesTo: (unit) => unit.lang === 'svelte',
	async run(unit, src, variant) {
		const tailwind = variant.id === 'tailwind';
		const text = await prettier.format(src, {
			...FORMAT_OPTIONS,
			...variant.options,
			filepath: tailwind ? path.join(ORACLE, unit.path) : unit.path,
			plugins: [sveltePlugin, ...(tailwind ? [tailwindPlugin] : [])] as prettier.Plugin[],
		});
		return { svelte: { text, ext: 'svelte', compare: 'text' } };
	},
};
export default task;
