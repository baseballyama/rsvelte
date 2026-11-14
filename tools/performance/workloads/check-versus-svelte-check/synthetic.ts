// A synthetic Svelte 5 + TypeScript project of N components. Each has typed `$props()`, `$state`,
// `$derived`, an `{#each}` and an import of a sibling, so the checker works in both the script and
// the template. Every ERROR_EVERY-th component holds one TS2322: the expected errors are known in
// advance, and every arm must report exactly them, so an arm that checked nothing cannot look fast.
import fs from 'node:fs';
import path from 'node:path';

const ERROR_EVERY = 50;
const PER_DIRECTORY = 50;

const SVELTE_VERSION = '5.57.3';

const componentPath = (i: number) =>
	`src/lib/components/group${Math.floor(i / PER_DIRECTORY)}/Comp${i}.svelte`;

/** The files that hold the injected error, relative to the project. */
export function expectedErrors(components: number): string[] {
	const files: string[] = [];
	for (let i = ERROR_EVERY; i < components; i += ERROR_EVERY) files.push(componentPath(i));
	return files;
}

function component(i: number): string {
	const first = i % PER_DIRECTORY === 0;
	const child = first ? '' : `\n\timport Child from './Comp${i - 1}.svelte';`;
	const wrong = i > 0 && i % ERROR_EVERY === 0 ? '\n\tconst wrong: number = title;' : '';
	const nested = first
		? ''
		: `\n{#if count > 0}\n\t<Child items={filtered.slice(1)} title="nested ${i}" {onselect} />\n{/if}`;
	return `<script lang="ts">
	import type { Item } from '$lib/types';
	import { format, score } from '$lib/util';${child}

	interface Props {
		items: Item[];
		title: string;
		onselect?: (item: Item) => void;
	}

	let { items, title, onselect }: Props = $props();
	let query = $state('');
	let filtered = $derived(items.filter((item) => item.name.includes(query)));
	let count = $derived(filtered.length);
	let best = $derived(filtered.reduce((max, item) => Math.max(max, score(item)), 0));${wrong}
</script>

<h2>{title} ({count}, best {best.toFixed(2)})</h2>
<input bind:value={query} placeholder="filter" />
<ul>
	{#each filtered as item (item.id)}
		<li><button onclick={() => onselect?.(item)}>{format(item)}</button></li>
	{/each}
</ul>${nested}
`;
}

const json = (value: unknown) => JSON.stringify(value, null, '\t') + '\n';

export function writeSynthetic(directory: string, components: number): void {
	fs.rmSync(directory, { recursive: true, force: true });
	fs.mkdirSync(path.join(directory, 'src/lib'), { recursive: true });
	fs.writeFileSync(
		path.join(directory, 'package.json'),
		json({
			name: `synthetic-${components}`,
			private: true,
			type: 'module',
			devDependencies: { svelte: SVELTE_VERSION, typescript: '6.0.3' },
		}),
	);
	fs.writeFileSync(
		path.join(directory, 'tsconfig.json'),
		json({
			compilerOptions: {
				target: 'ES2022',
				module: 'ESNext',
				moduleResolution: 'bundler',
				lib: ['ES2022', 'DOM'],
				strict: true,
				skipLibCheck: true,
				isolatedModules: true,
				verbatimModuleSyntax: true,
				noEmit: true,
				types: [],
				paths: { '$lib': ['./src/lib'], '$lib/*': ['./src/lib/*'] },
			},
			include: ['src/**/*.ts', 'src/**/*.svelte'],
		}),
	);
	fs.writeFileSync(
		path.join(directory, 'src/lib/types.ts'),
		'export interface Item {\n\tid: number;\n\tname: string;\n\ttags: string[];\n\tweight: number;\n}\n',
	);
	fs.writeFileSync(
		path.join(directory, 'src/lib/util.ts'),
		"import type { Item } from './types';\n\n" +
			"export function format(item: Item): string {\n\treturn `${item.name} [${item.tags.join(', ')}]`;\n}\n\n" +
			'export function score(item: Item): number {\n\treturn item.weight * item.tags.length;\n}\n',
	);
	for (let i = 0; i < components; i++) {
		const file = path.join(directory, componentPath(i));
		fs.mkdirSync(path.dirname(file), { recursive: true });
		fs.writeFileSync(file, component(i));
	}
}
