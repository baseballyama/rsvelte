// Expected = oracle snapshot + per-unit adjustments.
//
// Adjustments live in the unit's fixture.toml. Each rewrites one node of one artifact (the canonical
// AST of a `js` artifact, the parsed value of a `.json` one), pinned by a path and guarded by the
// node the oracle had there, so it can be re-validated when the oracle changes:
//
//   [[adjust]]
//   task = "svelte.compile"
//   variant = "client"          # optional: omitted = every variant of the task
//   artifact = "js"             # optional, default "js"
//   at = "body.3.declarations.0.init"
//   expect = "void 0"           # what the oracle has at `at`
//   replace = "undefined"       # what we accept instead
//   reason = "…"
//
// For a JSON artifact, `expect` and `replace` are JSON values (`artifact = "json"`, `at = "3"`).
//
// Status after applying to the current snapshot:
//   ok         `expect` found at `at`, replaced
//   redundant  `replace` already at `at` — the oracle now agrees, delete the entry
//   rebased    `expect` found at exactly one other path — the snapshot moved; `--write` updates `at`
//   stale      `expect` not found once — needs a human
import fs from 'node:fs';
import { expectedFile, fixtureFile } from './paths.ts';
import { parseJs, parseSnippet, getAt, setAt, findAll, same, type Node } from './canonical.ts';
import { taskById } from './tasks/index.ts';
import { allUnits } from './manifest.ts';
import type { Adjustment, Task, Unit } from './types.ts';

type Loaded = Adjustment & { artifact: string; index: number };
type Status = 'ok' | 'redundant' | 'rebased' | 'stale';
interface Applied {
	adj: Loaded;
	status: Status;
	at?: string;
	detail?: string;
}

export function loadAdjustments(unit: Unit): Loaded[] {
	return (unit.fixture.adjust ?? []).map((a, index) => ({ ...a, artifact: a.artifact ?? 'js', index }));
}

const appliesTo = (adj: Loaded, taskId: string, variantId: string, artifact: string): boolean =>
	adj.task === taskId && (adj.variant === undefined || adj.variant === variantId) && adj.artifact === artifact;

const isJson = (artifact: string): boolean => artifact.endsWith('json');

/** An artifact's text as the tree adjustments apply to. */
function parseArtifact(text: string, artifact: string): Node {
	return isJson(artifact) ? (JSON.parse(text) as Node) : parseJs(text);
}

/** Applies adjustments to a canonical tree in place and returns one status per adjustment. */
export function applyAdjustments(tree: Node, adjustments: Loaded[]): Applied[] {
	return adjustments.map((adj): Applied => {
		if (!adj.at) return { adj, status: 'stale', detail: 'empty `at`' };
		const target = getAt(tree, adj.at) as Node | undefined;
		const value = (snippet: string) => (isJson(adj.artifact) ? (JSON.parse(snippet) as Node) : parseSnippet(snippet, target?.type));
		const expect = value(adj.expect);
		const replace = value(adj.replace);
		if (target !== undefined && same(target, expect)) {
			setAt(tree, adj.at, structuredClone(replace));
			return { adj, status: 'ok' };
		}
		if (target !== undefined && same(target, replace)) return { adj, status: 'redundant' };
		const hits = findAll(tree, expect);
		if (hits.length === 1) {
			setAt(tree, hits[0]!, structuredClone(replace));
			return { adj, status: 'rebased', at: hits[0] };
		}
		return { adj, status: 'stale', detail: `expect found at ${hits.length} paths` };
	});
}

/** The tree an implementation's output must equal, plus how each adjustment applied. */
export function expectedTree(unit: Unit, task: Task, variantId: string, artifact = 'js'): { tree: Node; statuses: Applied[] } {
	const tree = parseArtifact(fs.readFileSync(expectedFile(task, variantId, unit, artifact), 'utf8'), artifact);
	const statuses = applyAdjustments(tree, loadAdjustments(unit).filter((a) => appliesTo(a, task.id, variantId, artifact)));
	return { tree, statuses };
}

/** Re-validates every adjustment against the current snapshots. */
export function verifyAdjustments({ write }: { write: boolean }) {
	const units = allUnits().filter((u) => (u.fixture.adjust ?? []).length);
	const counts: Record<Status, number> = { ok: 0, redundant: 0, rebased: 0, stale: 0 };
	const problems: string[] = [];
	for (const unit of units) {
		const rebases: { index: number; at: string }[] = [];
		for (const adj of loadAdjustments(unit)) {
			const task = taskById(adj.task);
			const variants = adj.variant ? [adj.variant] : task.variants.map((v) => v.id);
			for (const variantId of variants) {
				let st: Applied;
				try {
					const text = fs.readFileSync(expectedFile(task, variantId, unit, adj.artifact), 'utf8');
					st = applyAdjustments(parseArtifact(text, adj.artifact), [adj])[0]!;
				} catch (e) {
					st = { adj, status: 'stale', detail: (e as Error).message };
				}
				counts[st.status]++;
				// An entry shared by several variants is only rewritten by hand: each variant may have moved differently.
				if (st.status === 'rebased' && adj.variant) rebases.push({ index: adj.index, at: st.at! });
				if (st.status !== 'ok') {
					problems.push(
						`${st.status.padEnd(9)} ${unit.family}/${unit.source}/${unit.path} #${adj.index} ${adj.task}/${variantId} at=${adj.at}` +
							(st.at ? ` -> ${st.at}` : '') +
							(st.detail ? ` (${st.detail})` : '')
					);
				}
			}
		}
		if (write && rebases.length) rewriteAt(fixtureFile(unit), rebases);
	}
	return { units: units.length, counts, problems };
}

/** Rewrites `at` inside the n-th `[[adjust]]` block, keeping the rest of the file (comments included) as written. */
function rewriteAt(file: string, rebases: { index: number; at: string }[]): void {
	const blocks = fs.readFileSync(file, 'utf8').split(/^(?=\[\[adjust\]\])/m);
	const offset = blocks[0]!.startsWith('[[adjust]]') ? 0 : 1;
	for (const { index, at } of rebases) {
		const b = offset + index;
		blocks[b] = blocks[b]!.replace(/^at\s*=\s*".*"$/m, `at = "${at}"`);
	}
	fs.writeFileSync(file, blocks.join(''));
}
