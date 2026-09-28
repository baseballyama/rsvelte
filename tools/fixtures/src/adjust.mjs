// Expected = oracle snapshot + per-fixture adjustments.
//
// An adjustment rewrites one node of the canonical AST of one artifact, pinned by a path and guarded
// by the node the oracle had there, so it can be re-validated when the oracle changes:
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
// Status after applying to the current snapshot:
//   ok         `expect` found at `at`, replaced
//   redundant  `replace` already at `at` — the oracle now agrees, delete the entry
//   rebased    `expect` found at exactly one other path — the snapshot moved; `--write` updates `at`
//   stale      `expect` not found once — needs a human
import fs from 'node:fs';
import { parse as parseToml } from 'smol-toml';
import { adjustFile, expectedFile, FIXTURES, rel } from './paths.mjs';
import { parseJs, parseSnippet, getAt, setAt, findAll, same } from './canonical.mjs';
import { listFiles } from './fsutil.mjs';
import { taskById } from './tasks/index.mjs';
import path from 'node:path';

export function loadAdjustments(unit) {
	const file = adjustFile(unit);
	if (!fs.existsSync(file)) return [];
	const doc = parseToml(fs.readFileSync(file, 'utf8'));
	return (doc.adjust ?? []).map((a, index) => ({ artifact: 'js', ...a, index }));
}

export function appliesTo(adj, taskId, variantId, artifact) {
	return adj.task === taskId && (adj.variant === undefined || adj.variant === variantId) && adj.artifact === artifact;
}

/** Applies adjustments to a canonical tree in place and returns one status per adjustment. */
export function applyAdjustments(tree, adjustments) {
	return adjustments.map((adj) => {
		if (!adj.at) return { adj, status: 'stale', detail: 'empty `at`' };
		const target = getAt(tree, adj.at);
		const expect = parseSnippet(adj.expect, target?.type);
		const replace = parseSnippet(adj.replace, target?.type);
		if (target !== undefined && same(target, expect)) {
			setAt(tree, adj.at, structuredClone(replace));
			return { adj, status: 'ok' };
		}
		if (target !== undefined && same(target, replace)) return { adj, status: 'redundant' };
		const hits = findAll(tree, expect);
		if (hits.length === 1) {
			setAt(tree, hits[0], structuredClone(replace));
			return { adj, status: 'rebased', at: hits[0] };
		}
		return { adj, status: 'stale', detail: `expect found at ${hits.length} paths` };
	});
}

/** The tree an implementation's output must equal, plus how each adjustment applied. */
export function expectedTree(unit, task, variantId, artifact = 'js') {
	const text = fs.readFileSync(expectedFile(task, variantId, unit, artifact), 'utf8');
	const tree = parseJs(text);
	const statuses = applyAdjustments(
		tree,
		loadAdjustments(unit).filter((a) => appliesTo(a, task.id, variantId, artifact))
	);
	return { tree, statuses };
}

function unitFromAdjustFile(file) {
	const r = rel(path.join(FIXTURES, 'adjust'), file).replace(/\.toml$/, '');
	const slash = r.indexOf('/');
	return { source: r.slice(0, slash), path: r.slice(slash + 1) };
}

/** Re-validates every adjustment against the current snapshots. */
export function verifyAdjustments({ write }) {
	const files = listFiles(path.join(FIXTURES, 'adjust')).filter((f) => f.endsWith('.toml')).sort();
	const counts = { ok: 0, redundant: 0, rebased: 0, stale: 0 };
	const problems = [];
	for (const file of files) {
		const unit = unitFromAdjustFile(file);
		const adjustments = loadAdjustments(unit);
		const rebases = [];
		for (const adj of adjustments) {
			const task = taskById(adj.task);
			const variants = adj.variant ? [adj.variant] : task.variants.map((v) => v.id);
			for (const variantId of variants) {
				let st;
				try {
					const text = fs.readFileSync(expectedFile(task, variantId, unit, adj.artifact), 'utf8');
					[st] = applyAdjustments(parseJs(text), [adj]);
				} catch (e) {
					st = { adj, status: 'stale', detail: e.message };
				}
				counts[st.status]++;
				// An entry shared by several variants is only rewritten by hand: each variant may have moved differently.
				if (st.status === 'rebased' && adj.variant) rebases.push({ index: adj.index, at: st.at });
				if (st.status !== 'ok') {
					problems.push(`${st.status.padEnd(9)} ${unit.source}/${unit.path} #${adj.index} ${adj.task}/${variantId} at=${adj.at}${st.at ? ` -> ${st.at}` : ''}${st.detail ? ` (${st.detail})` : ''}`);
				}
			}
		}
		if (write && rebases.length) rewriteAt(file, rebases);
	}
	return { files: files.length, counts, problems };
}

/** Rewrites `at` inside the n-th `[[adjust]]` block, keeping the rest of the file (comments included) as written. */
function rewriteAt(file, rebases) {
	const blocks = fs.readFileSync(file, 'utf8').split(/^(?=\[\[adjust\]\])/m);
	const offset = blocks[0].startsWith('[[adjust]]') ? 0 : 1;
	for (const { index, at } of rebases) {
		const b = offset + index;
		blocks[b] = blocks[b].replace(/^at\s*=\s*".*"$/m, `at = "${at}"`);
	}
	fs.writeFileSync(file, blocks.join(''));
}
