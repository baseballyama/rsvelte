// Components svelte rejects, made by breaking components it compiles, under `<source>/<mutation>/
// <code>/`: each mutation changes one node, and a mutant stays only when svelte rejects it, at most `PER_KEY` for each mutation, error
// code and kind of node. The corpus then compares rsvelte's rejection with svelte's.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { compile, parse } from 'svelte/compiler';
import { CORPUS } from './paths.ts';
import { readPack } from './pack.ts';
import type { Source } from './types.ts';

/** Where the mutants go. */
const OUT = path.join(CORPUS, '_own', 'mutants');
/** The sources whose compiled components are mutated: the external ones under MIT, as the mutants are. */
const SOURCES = (
	JSON.parse(fs.readFileSync(path.join(CORPUS, '_registry', 'sources.json'), 'utf8')) as Source[]
)
	.filter((s) => s.url && s.license?.spdx === 'MIT' && !s.excluded)
	.map((s) => s.id)
	.filter((id) => fs.existsSync(path.join(CORPUS, 'svelte', id, 'inputs.pack')))
	.toSorted();
const PER_KEY = 2;

interface Node {
	type: string;
	start: number;
	end: number;
	[key: string]: unknown;
}

/** One way to break a node: the mutated text, or nothing when the mutation does not apply. */
type Mutation = (src: string, node: Node) => string | undefined;

const CLOSERS: Record<string, string> = {
	IfBlock: '{/if}',
	EachBlock: '{/each}',
	AwaitBlock: '{/await}',
	KeyBlock: '{/key}',
	SnippetBlock: '{/snippet}',
};

const splice = (src: string, start: number, end: number, text = '') =>
	src.slice(0, start) + text + src.slice(end);

const closer = (src: string, node: Node) => {
	const text =
		node.type === 'RegularElement' || node.type === 'Component'
			? `</${node.name as string}>`
			: CLOSERS[node.type];
	if (!text || node.elseif || !src.slice(node.start, node.end).endsWith(text)) return undefined;
	return { text, at: node.end - text.length };
};

export const MUTATIONS: Record<string, Mutation> = {
	'drop-close': (src, node) => {
		const c = closer(src, node);
		return c && splice(src, c.at, node.end);
	},
	'swap-close': (src, node) => {
		const c = closer(src, node);
		if (!c || !CLOSERS[node.type]) return undefined;
		return splice(src, c.at, node.end, c.text === '{/if}' ? '{/each}' : '{/if}');
	},
	'duplicate-attribute': (src, node) => {
		const first = (node.attributes as Node[] | undefined)?.[0];
		return first && splice(src, first.end, first.end, ' ' + src.slice(first.start, first.end));
	},
	'open-expression': (src, node) =>
		node.type === 'ExpressionTag' && src[node.end - 1] === '}'
			? splice(src, node.end - 1, node.end)
			: undefined,
	'bind-sum': (src, node) => {
		const expression = node.expression as Node | undefined;
		if (node.type !== 'BindDirective' || !expression) return undefined;
		return splice(src, expression.end, expression.end, ' + 1');
	},
	'rune-in-template': (src, node) => {
		const expression = node.expression as Node | undefined;
		if (node.type !== 'ExpressionTag' || !expression) return undefined;
		return splice(src, expression.start, expression.end, `$state(${src.slice(expression.start, expression.end)})`);
	},
	'const-at-root': (src, node) =>
		node.type === 'ConstTag'
			? src.slice(node.start, node.end) + '\n' + splice(src, node.start, node.end)
			: undefined,
	'script-twice': (src, node) =>
		node.type === 'Script' ? splice(src, node.end, node.end, '\n' + src.slice(node.start, node.end)) : undefined,
};

/** Every node of the tree, in source order. */
export function* nodes(value: unknown): Generator<Node> {
	if (Array.isArray(value)) {
		for (const v of value) yield* nodes(v);
	} else if (value && typeof value === 'object') {
		const node = value as Node;
		if (typeof node.type === 'string' && typeof node.start === 'number') yield node;
		for (const [key, v] of Object.entries(node)) if (key !== 'metadata' && key !== 'loc') yield* nodes(v);
	}
}

/** The code svelte rejects `src` with, or nothing when it compiles. */
function rejection(src: string, filename: string): string | undefined {
	try {
		compile(src, { filename, runes: true });
		return undefined;
	} catch (e) {
		return (e as { code?: string }).code;
	}
}

/** The mutants of the compiled components of `sources`, by their path under `OUT`. */
export function mutants(sources: string[]): Map<string, string> {
	const kept = new Map<string, number>();
	const out = new Map<string, string>();
	for (const source of sources) {
		for (const entry of readPack(path.join(CORPUS, 'svelte', source, 'inputs.pack'))) {
			if (!entry.path.endsWith('.svelte') || entry.attributes.at(-1) === 'rejected') continue;
			let tree: unknown;
			try {
				tree = parse(entry.body, { modern: true });
			} catch {
				continue;
			}
			const all = [...nodes(tree)];
			for (const [name, mutate] of Object.entries(MUTATIONS)) {
				for (const node of all) {
					const mutant = mutate(entry.body, node);
					if (mutant === undefined) continue;
					const code = rejection(mutant, entry.path);
					// The first node a mutation applies to stands for the unit.
					if (code && code !== 'experimental_async') {
						const key = `${name}/${code}/${node.type}`;
						const count = kept.get(key) ?? 0;
						if (count < PER_KEY) {
							kept.set(key, count + 1);
							const hash = crypto.createHash('sha256').update(mutant).digest('hex').slice(0, 16);
							out.set(`${source}/${name}/${code}/${hash}.svelte`, mutant);
						}
					}
					break;
				}
			}
		}
	}
	return out;
}

if (import.meta.main) {
	fs.rmSync(OUT, { recursive: true, force: true });
	const made = mutants(SOURCES);
	for (const [file, text] of made) {
		fs.mkdirSync(path.dirname(path.join(OUT, file)), { recursive: true });
		fs.writeFileSync(path.join(OUT, file), text);
	}
	console.log(`${made.size} mutants`);
}
