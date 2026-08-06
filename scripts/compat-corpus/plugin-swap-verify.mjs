#!/usr/bin/env node
/**
 * Plugin-swap parity gate — the layer the output-equality corpus cannot see.
 *
 * The corpus proves rsvelte's compiler emits byte-identical code. It says
 * nothing about which files the *Vite plugin* decides to hand to the compiler,
 * so a plugin that silently skips a dependency's `.svelte.js` module is green
 * across every existing gate and still breaks every real app.
 *
 * This runs a pinned real project's own test suite twice against ONE dependency
 * tree — first with official `@sveltejs/vite-plugin-svelte`, then with
 * `@rsvelte/vite-plugin-svelte` swapped in — and requires the same tests to pass.
 *
 * Hermetic by construction, which is what makes it a per-PR gate rather than a
 * nightly one:
 *   - `--frozen-lockfile`, so upstream releases cannot turn a PR red
 *   - the swap replaces the resolved package directory with a symlink, so it
 *     triggers NO dependency re-resolution (an override + reinstall would
 *     re-float the whole tree — the failure mode that made the old
 *     ecosystem-ci unusable as a gate)
 *   - Playwright browsers are installed at the version the lockfile pins
 *
 * Residual, stated rather than left to be derived: Node resolves through the
 * swapped symlink's realpath, so the shim's own runtime deps
 * (`@rsvelte/vite-plugin-svelte-native`, `deepmerge`, `magic-string`, `obug`,
 * `vitefu`, …) come from the **rsvelte root** lockfile, not the target's. That
 * is intended — the point is to test the shim as shipped — and both lockfiles
 * are committed, so the run is still reproducible. But the two sides are pinned
 * by two different lockfiles, and a root-lockfile bump moves the swapped side
 * alone.
 *
 * Divergences ratchet shrink-only through
 * compatibility/plugin-swap-known-failures.json, justified per entry in the
 * paired `.md`. The ratchet is TWO-SIDED (#2287): an entry that starts passing
 * fails the gate just as a new divergence does, because a stale entry still
 * says "allowed to fail" and leaves the fix unprotected.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SHIM = path.join(ROOT, 'apps/npm/vite-plugin-svelte');
const TARGETS = JSON.parse(fs.readFileSync(path.join(__dirname, 'plugin-swap-targets.json'), 'utf8'));
const RATCHET = path.join(ROOT, 'compatibility/plugin-swap-known-failures.json');
const REPORT = path.join(ROOT, 'compatibility/plugin-swap-report.json');

const argv = process.argv.slice(2);
const UPDATE = argv.includes('--update');
const ALLOW_GROWTH = argv.includes('--allow-growth');
const SKIP_INSTALL = argv.includes('--skip-install');
const only = argv.find((a) => !a.startsWith('--'));

/**
 * The in-flight swap, so a signal handler can undo it. `process.exit()` does not
 * unwind `finally`, and neither does SIGINT — without this a cancelled CI job or
 * a local Ctrl-C leaves the store directory symlinked to the shim and the real
 * plugin parked at `*.official`, which silently poisons the NEXT run (it would
 * resolve rsvelte's shim as its "official" baseline).
 */
let pendingRestore = null;

function restorePending() {
	if (!pendingRestore) return;
	const { dir, stash } = pendingRestore;
	pendingRestore = null;
	try {
		if (fs.existsSync(stash)) {
			// The staged shim is a real directory (see stageShim), not a symlink —
			// `unlinkSync` only removes the latter and left the rename to fail
			// ENOTEMPTY, i.e. the restore silently did not happen.
			if (fs.existsSync(dir) || fs.lstatSync(dir, { throwIfNoEntry: false })) {
				fs.rmSync(dir, { recursive: true, force: true });
			}
			fs.renameSync(stash, dir);
			log(`restored ${path.basename(dir)}`);
		}
	} catch (e) {
		console.error(`[plugin-swap] RESTORE FAILED — ${e.message}`);
		console.error(`  restore by hand: rm "${dir}" && mv "${stash}" "${dir}"`);
	}
}

for (const sig of ['SIGINT', 'SIGTERM']) {
	process.on(sig, () => {
		restorePending();
		process.exit(130);
	});
}
process.on('exit', restorePending);

function log(msg) {
	console.log(`[plugin-swap] ${msg}`);
}

function die(msg, extra) {
	console.error(`[plugin-swap] ❌ ${msg}`);
	if (extra) console.error(`  ${extra}`);
	restorePending();
	process.exit(1);
}

/** @returns {boolean} whether the command exited 0 */
function run(cmd, cwd, { quiet = false, timeoutMinutes } = {}) {
	try {
		execSync(cmd, {
			cwd,
			stdio: quiet ? 'pipe' : 'inherit',
			env: process.env,
			timeout: timeoutMinutes ? timeoutMinutes * 60_000 : undefined,
		});
		return true;
	} catch {
		return false;
	}
}

/**
 * Resolve the real (symlink-followed) directory backing the target's
 * `@sveltejs/vite-plugin-svelte`. Every consumer in the workspace resolves
 * through this one directory, so replacing it swaps the plugin for all of them.
 */
function resolvePluginDir(fromDir) {
	const require_ = createRequire(path.join(fromDir, 'noop.js'));
	// Not `.../package.json` — the package's `exports` map does not expose it.
	const entry = require_.resolve('@sveltejs/vite-plugin-svelte');
	let dir = fs.realpathSync(path.dirname(entry));
	while (!fs.existsSync(path.join(dir, 'package.json'))) {
		const up = path.dirname(dir);
		if (up === dir) throw new Error(`no package.json above ${entry}`);
		dir = up;
	}
	return dir;
}

/** The svelte version rsvelte's compiler targets. */
function mirroredSvelteVersion() {
	try {
		return (
			createRequire(path.join(SHIM, 'src/index.js'))('@rsvelte/vite-plugin-svelte-native')
				.VERSION ?? null
		);
	} catch {
		return null;
	}
}

/** Version of a peer dependency as resolved *from* `fromDir`. */
function pluginPeerVersion(fromDir, name) {
	const req = createRequire(path.join(fromDir, 'noop.js'));
	let d = path.dirname(fs.realpathSync(req.resolve(name)));
	while (!fs.existsSync(path.join(d, 'package.json'))) {
		const up = path.dirname(d);
		if (up === d) return 'unknown';
		d = up;
	}
	return JSON.parse(fs.readFileSync(path.join(d, 'package.json'), 'utf8')).version;
}

function pluginIdentity(fromDir) {
	const dir = resolvePluginDir(fromDir);
	const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
	return { name: pkg.name, version: pkg.version, dir };
}

/**
 * Stage the shim INTO the target's store path so that its own imports resolve
 * against the target, not against the rsvelte root.
 *
 * The obvious swap — symlink the shim directory into place — is wrong, and
 * wrong in a way that silently fabricates failures. Node resolves a symlinked
 * package's imports from its **realpath**, so `import * as vite from 'vite'`
 * inside the shim resolved out of the rsvelte root: vite 8 (rolldown) driving a
 * vite 7 (esbuild) dev server. `setup-optimizer.js` branches on
 * `rolldownVersion`, so it registered its optimizer plugins on a path the
 * running vite never reads and every prebundled dependency `.svelte.js` reached
 * the browser uncompiled. That was #2299 — reported as an rsvelte bug, actually
 * this harness.
 *
 * So: copy the shim (a real directory resolves relative to where it sits), and
 * hand-build its `node_modules` — non-peer deps linked from the rsvelte root
 * (they are the shim's own, and testing the shipped shim is the point), peers
 * linked from the TARGET (`vite`, `svelte` — the whole question is how the shim
 * behaves against the target's versions). This is what a real install gives you,
 * without re-resolving anything.
 */
function stageShim(destDir, runDir) {
	fs.cpSync(SHIM, destDir, { recursive: true, dereference: false, filter: (src) => !src.includes(`${path.sep}node_modules${path.sep}`) && !src.endsWith(`${path.sep}node_modules`) });

	const shimReq = createRequire(path.join(SHIM, 'src/index.js'));
	const targetReq = createRequire(path.join(runDir, 'noop.js'));
	const pkg = JSON.parse(fs.readFileSync(path.join(SHIM, 'package.json'), 'utf8'));
	const nm = path.join(destDir, 'node_modules');
	fs.mkdirSync(nm, { recursive: true });

	/** Resolve a package's directory (not its entry) through `req`. */
	const dirOf = (req, name) => {
		let d = path.dirname(req.resolve(`${name}/package.json`));
		return fs.realpathSync(d);
	};
	const linked = [];
	for (const [name, req, from] of [
		...Object.keys(pkg.dependencies ?? {}).map((n) => [n, shimReq, 'rsvelte']),
		...Object.keys(pkg.peerDependencies ?? {}).map((n) => [n, targetReq, 'target']),
	]) {
		let real;
		try {
			real = dirOf(req, name);
		} catch {
			// `exports` may hide package.json (vite does): fall back to walking up
			// from the entry point.
			try {
				let d = path.dirname(fs.realpathSync(req.resolve(name)));
				while (!fs.existsSync(path.join(d, 'package.json'))) {
					const up = path.dirname(d);
					if (up === d) throw new Error('no package.json');
					d = up;
				}
				real = d;
			} catch {
				continue; // optional / unresolvable — let Node's own lookup handle it
			}
		}
		const dest = path.join(nm, name);
		fs.mkdirSync(path.dirname(dest), { recursive: true });
		fs.symlinkSync(real, dest);
		linked.push(`${name}<-${from}`);
	}
	return linked;
}

/**
 * Swapping the one copy `runDir` resolves is only equivalent to swapping "the"
 * plugin while there IS one copy. A pnpm store can legitimately hold several
 * (different versions, or one version under different peer hashes), and then
 * some other consumer — a workspace package's own vite config, say — would keep
 * loading official while the noop check still passes.
 */
function assertSinglePluginCopy(targetDir) {
	const store = path.join(targetDir, 'node_modules/.pnpm');
	if (!fs.existsSync(store)) return;
	const copies = fs
		.readdirSync(store)
		.filter((n) => n.startsWith('@sveltejs+vite-plugin-svelte@'));
	if (copies.length > 1) {
		die(
			`${copies.length} copies of @sveltejs/vite-plugin-svelte in the store — the swap would cover only one`,
			copies.join('\n  '),
		);
	}
}

/**
 * Collapse one vitest JSON report into `testId -> passed`.
 *
 * Read PER PROJECT. The reporter carries no project discriminator at vitest
 * 3.2.4 (a file run under N projects appears N times under the same `name`),
 * so merging them in one report hid a whole engine failing: summing assertion
 * counts across projects meant one surviving project masked another's dead
 * suite. Each project is therefore run and keyed separately.
 */
function readVitestReport(file, targetDir, project) {
	const empty = { tests: new Map(), files: new Map(), crashed: true };
	if (!fs.existsSync(file)) return empty;
	let json;
	try {
		json = JSON.parse(fs.readFileSync(file, 'utf8'));
	} catch {
		return empty;
	}
	const tests = new Map();
	const files = new Map();
	for (const suite of json.testResults ?? []) {
		const rel = `${project}|${path.relative(targetDir, suite.name)}`;
		files.set(rel, (files.get(rel) ?? 0) + (suite.assertionResults?.length ?? 0));
		for (const a of suite.assertionResults ?? []) {
			const id = `${rel} > ${[...(a.ancestorTitles ?? []), a.fullName].join(' > ')}`;
			const ok = a.status === 'passed' || a.status === 'pending' || a.status === 'todo';
			tests.set(id, tests.has(id) ? tests.get(id) && ok : ok);
		}
	}
	return { tests, files, crashed: false };
}

/**
 * Run every declared project once and merge the per-project keyspaces.
 *
 * A zero result is retried once: `prepare` rebuilds the target's package, which
 * invalidates vite's dependency-optimizer cache, and the run that re-optimizes
 * can come back with no tests at all. Retrying costs nothing on the happy path
 * and keeps a cold cache from reading as a dead suite — which now hard-fails.
 */
function runSuite(t, runDir, targetDir, label) {
	const tests = new Map();
	const files = new Map();
	let crashed = false;

	for (const project of t.projects) {
		const out = path.join(ROOT, `compatibility/.plugin-swap-${t.id}-${label}-${slug(project)}.json`);
		// Never compare against a report a previous invocation left behind.
		fs.rmSync(out, { force: true });

		let r;
		for (let attempt = 1; attempt <= 2; attempt++) {
			run(`${t.test} --project=${JSON.stringify(project)} --reporter=json --outputFile=${out}`, runDir, {
				timeoutMinutes: t.timeoutMinutes,
			});
			r = readVitestReport(out, targetDir, project);
			const passing = [...r.tests.values()].filter(Boolean).length;
			if (passing > 0 || attempt === 2) break;
			log(`${t.id}: ${label}/${project} produced 0 passing — retrying once (cold optimizer cache?)`);
			fs.rmSync(out, { force: true });
		}

		if (r.crashed) crashed = true;
		for (const [k, v] of r.tests) tests.set(k, v);
		for (const [k, v] of r.files) files.set(k, v);
	}
	return { tests, files, crashed };
}

const slug = (s) => s.replace(/[^a-z0-9]+/gi, '-').toLowerCase();

/**
 * Re-run only the files behind candidate `test-regression`s and let a second
 * pass clear them.
 *
 * A single run per side means one flaky test in the target reads as an rsvelte
 * regression — a red on someone else's PR with no obvious cause, which is
 * historically what got ecosystem-ci deleted. Confirming just these ids is
 * cheap because there are normally none. `suite-load-failure` deliberately does
 * NOT go through here: a dead module is deterministic, and it is the class that
 * found the real bug, so it stays single-run and fast.
 *
 * Runs inside the swap window — the caller must not have restored yet.
 */
function confirmTestRegressions(t, runDir, targetDir, base, swapped) {
	const candidates = diff(base, swapped).regressions.filter((r) => r.kind === 'test-regression');
	if (!candidates.length) return 0;

	const byProject = new Map();
	for (const c of candidates) {
		const key = c.id.slice(0, c.id.indexOf(' > '));
		const [project, rel] = [key.slice(0, key.indexOf('|')), key.slice(key.indexOf('|') + 1)];
		if (!byProject.has(project)) byProject.set(project, new Set());
		byProject.get(project).add(path.relative(runDir, path.join(targetDir, rel)));
	}

	log(`${t.id}: confirming ${candidates.length} candidate test-regression(s) with a second run`);
	let cleared = 0;
	for (const [project, files] of byProject) {
		const out = path.join(ROOT, `compatibility/.plugin-swap-${t.id}-confirm-${slug(project)}.json`);
		fs.rmSync(out, { force: true });
		run(
			`${t.test} --project=${JSON.stringify(project)} ${[...files].map((f) => JSON.stringify(f)).join(' ')} --reporter=json --outputFile=${out}`,
			runDir,
			{ timeoutMinutes: t.timeoutMinutes },
		);
		const again = readVitestReport(out, targetDir, project);
		for (const [id, ok] of again.tests) {
			if (ok && !swapped.tests.get(id)) {
				swapped.tests.set(id, true);
				cleared++;
			}
		}
	}
	if (cleared) log(`${t.id}: ${cleared} candidate(s) passed on re-run — treated as flakes, not regressions`);
	return cleared;
}

/**
 * Diff two runs. A file that produced assertions at baseline but none after the
 * swap is reported as ONE suite-load failure rather than as every test it
 * contains — a module-level crash is one defect, not N.
 */
function diff(base, swapped) {
	const regressions = [];
	const brokenFiles = new Set();

	for (const [file, count] of base.files) {
		if (count > 0 && (swapped.files.get(file) ?? 0) === 0) {
			brokenFiles.add(file);
			regressions.push({ id: `${file} :: <suite-load>`, kind: 'suite-load-failure' });
		}
	}
	for (const [id, ok] of base.tests) {
		if (!ok) continue;
		const file = id.slice(0, id.indexOf(' > '));
		if (brokenFiles.has(file)) continue;
		if (!swapped.tests.get(id)) regressions.push({ id, kind: 'test-regression' });
	}

	const fixed = [];
	for (const [id, ok] of swapped.tests) {
		if (ok && base.tests.has(id) && !base.tests.get(id)) fixed.push(id);
	}
	return { regressions, fixed };
}

function verifyTarget(t) {
	const targetDir = path.join(ROOT, t.path);
	const runDir = t.subPath ? path.join(targetDir, t.subPath) : targetDir;

	if (!fs.existsSync(targetDir) || fs.readdirSync(targetDir).length === 0) {
		die(`target ${t.id} missing at ${t.path}`, `run: git submodule update --init --depth 1 ${t.path}`);
	}

	if (!SKIP_INSTALL) {
		log(`${t.id}: install (${t.install})`);
		if (!run(t.install, targetDir)) die(`${t.id}: install failed — cannot gate`);

		if (t.playwright?.length) {
			// `--with-deps`: webkit will not launch on a bare ubuntu-latest without
			// its system libraries. Version comes from the lockfile-pinned
			// playwright, never the ambient one.
			log(`${t.id}: playwright browsers (${t.playwright.join(', ')})`);
			const withDeps = process.platform === 'linux' ? '--with-deps ' : '';
			if (!run(`pnpm exec playwright install ${withDeps}${t.playwright.join(' ')}`, runDir)) {
				// Silently ignoring this used to zero the baseline, which read as
				// `baseline-failure`, which exited 0. A green gate that never ran.
				die(`${t.id}: playwright install failed — the suite cannot run`);
			}
		}
	}

	assertSinglePluginCopy(targetDir);

	for (const cmd of t.prepare ?? []) {
		log(`${t.id}: prepare (${cmd})`);
		if (!run(cmd, targetDir)) die(`${t.id}: prepare step failed: ${cmd}`);
	}

	const official = pluginIdentity(runDir);
	log(`${t.id}: baseline plugin ${official.name}@${official.version}`);

	log(`${t.id}: baseline run (${t.projects.join(', ')})`);
	const base = runSuite(t, runDir, targetDir, 'baseline');
	const basePassing = [...base.tests.values()].filter(Boolean).length;
	log(`${t.id}: baseline ${basePassing} passing across ${base.files.size} project-file(s)`);

	// The baseline is the gate's own ground truth, and the target is a committed
	// pin: if the official plugin cannot pass its own suite there, the gate
	// cannot conclude anything and a human needs to look. Exiting 0 here would
	// make the gate loudest that all is well exactly when it verified nothing.
	if (base.crashed || basePassing === 0) {
		die(
			`${t.id}: BASELINE FAILURE — official plugin produced no passing tests`,
			'the gate verified nothing; fix the target/toolchain before trusting this job',
		);
	}

	const stash = `${official.dir}.official`;
	if (fs.existsSync(stash)) {
		die(
			`${t.id}: a previous run left ${path.basename(stash)} behind`,
			`restore by hand: rm -rf "${official.dir}" && mv "${stash}" "${official.dir}"`,
		);
	}

	let swapped;
	try {
		fs.renameSync(official.dir, stash);
		pendingRestore = { dir: official.dir, stash };
		const linked = stageShim(official.dir, runDir);
		log(`${t.id}: staged shim deps — ${linked.join(', ')}`);

		// The peer that made #2299: assert the shim sees the SAME vite the target
		// runs, or the plugin branches on the wrong one and every conclusion after
		// this point is about a configuration no user has.
		const shimVite = pluginPeerVersion(official.dir, 'vite');
		const targetVite = pluginPeerVersion(runDir, 'vite');
		if (shimVite !== targetVite) {
			throw new Error(
				`PEER MISMATCH — shim resolves vite@${shimVite}, target runs vite@${targetVite}; ` +
					'the plugin would branch on the wrong vite (this was #2299)',
			);
		}
		log(`${t.id}: shim and target agree on vite@${shimVite}`);

		// The other half of the same trap, and the harder one. Official's plugin
		// compiles with `svelte/compiler` resolved FROM THE TARGET, so its output
		// always matches the runtime the target ships. rsvelte's compiler is pinned
		// to the svelte it mirrors, so unless the two versions coincide the swapped
		// side emits code for a different runtime and every failure is version
		// skew, not an rsvelte defect.
		//
		// Measured: bits-ui@5.46.4 vs mirror@5.56.8 produced 2436 "regressions",
		// all from `rest_props`'s `exclude` changing Array (`.includes`) -> Set
		// (`.has`) between those versions.
		const targetSvelte = pluginPeerVersion(runDir, 'svelte');
		const mirrored = mirroredSvelteVersion();
		if (mirrored && targetSvelte !== mirrored) {
			throw new Error(
				`SVELTE VERSION SKEW — target runs svelte@${targetSvelte}, rsvelte's compiler mirrors svelte@${mirrored}. ` +
					'Official compiles with the target\'s own compiler, so the two sides would target different runtimes ' +
					'and the diff would measure the version gap, not rsvelte. Pin the target to the mirrored version, ' +
					'or enrol a target that already matches.',
			);
		}
		log(`${t.id}: shim and target agree on svelte@${targetSvelte}`);

		const now = pluginIdentity(runDir);
		if (!now.name.startsWith('@rsvelte/')) {
			// `throw`, not `process.exit`: exit skips `finally`, and swap-noop is
			// precisely the state where the next run most needs a clean tree.
			throw new Error(
				`SWAP NO-OP — still resolving ${now.name}@${now.version}; the run would have verified the official plugin`,
			);
		}
		log(`${t.id}: swapped in ${now.name}@${now.version}`);

		for (const cmd of t.prepare ?? []) run(cmd, targetDir, { quiet: true });

		log(`${t.id}: rsvelte run`);
		swapped = runSuite(t, runDir, targetDir, 'rsvelte');
		// Must happen before the restore below — it re-runs against the swap.
		confirmTestRegressions(t, runDir, targetDir, base, swapped);
	} finally {
		restorePending();
		// `prepare` builds the target's package, and the compile corpus walks the
		// same submodule: a leftover dist/ enters it as duplicated entries and
		// silently perturbs its ratchets. CI isolates the jobs, a local run does not.
		for (const dir of t.artifacts ?? []) {
			fs.rmSync(path.join(targetDir, dir), { recursive: true, force: true });
		}
	}

	const swapPassing = [...swapped.tests.values()].filter(Boolean).length;
	log(`${t.id}: rsvelte ${swapPassing} passing across ${swapped.files.size} project-file(s)`);

	// A swapped run that dies before writing any report yields empty maps, which
	// `diff` turns into one suite-load-failure per baseline project-file — i.e.
	// EXACTLY the shape of the currently-baselined defect, so it would match the
	// ratchet and report green. "vitest never ran" and "the plugin broke every
	// suite" have to be distinguishable, and only `crashed` distinguishes them.
	if (swapped.crashed) {
		die(
			`${t.id}: the swapped run produced no readable report`,
			'that is indistinguishable from a total plugin failure in the diff, so it cannot be scored',
		);
	}

	const { regressions, fixed } = diff(base, swapped);
	return {
		id: t.id,
		result: regressions.length ? 'regression' : 'pass',
		regressions,
		fixed,
		basePassing,
		swapPassing,
	};
}

const selected = only ? TARGETS.filter((t) => t.id === only) : TARGETS;
if (!selected.length) {
	die(`no target matched "${only}"`, `known: ${TARGETS.map((t) => t.id).join(', ')}`);
}

const results = selected.map(verifyTarget);

const known = fs.existsSync(RATCHET) ? JSON.parse(fs.readFileSync(RATCHET, 'utf8')) : [];
const knownSet = new Set(known.map((k) => `${k.target}|${k.id}`));
const seen = [];
const fresh = [];
for (const r of results) {
	for (const reg of r.regressions) {
		seen.push({ target: r.id, id: reg.id, kind: reg.kind });
		if (!knownSet.has(`${r.id}|${reg.id}`)) fresh.push({ target: r.id, ...reg });
	}
}

fs.writeFileSync(
	REPORT,
	JSON.stringify({ generatedAt: new Date().toISOString(), results, fresh }, null, '\t') + '\n',
);

const seenSet = new Set(seen.map((s) => `${s.target}|${s.id}`));
const stale = known.filter((k) => !seenSet.has(`${k.target}|${k.id}`));

if (UPDATE) {
	// Shrink-only is the house rule, so growing the baseline has to be deliberate:
	// after a bad run (a crashed suite, a half-applied swap) `--update` would
	// otherwise happily enshrine the wreckage as the new normal.
	if (seen.length > known.length && !ALLOW_GROWTH) {
		die(
			`--update would GROW the baseline ${known.length} -> ${seen.length}`,
			'if that is genuinely intended, re-run with --allow-growth',
		);
	}
	fs.writeFileSync(RATCHET, JSON.stringify(seen, null, '\t') + '\n');
	log(`baseline updated: ${seen.length} known failure(s) -> ${path.relative(ROOT, RATCHET)}`);
	process.exit(0);
}

let failed = false;

if (fresh.length) {
	console.error(`\n[plugin-swap] ❌ ${fresh.length} NEW divergence(s):`);
	for (const f of fresh) console.error(`    ${f.target}: [${f.kind}] ${f.id}`);
	failed = true;
}

// Two-sided (#2287): a baselined entry that now passes is also a failure. Left
// in place it keeps asserting "allowed to fail", so the fix it represents is
// unprotected and could regress with the gate still green.
if (stale.length) {
	console.error(`\n[plugin-swap] ❌ ${stale.length} known failure(s) now PASS — shrink the baseline:`);
	for (const s of stale) console.error(`    ${s.target}: ${s.id}`);
	console.error('  node scripts/compat-corpus/plugin-swap-verify.mjs --update');
	failed = true;
}

if (failed) {
	console.error(`\n  report: ${path.relative(ROOT, REPORT)}`);
	process.exit(1);
}

log(`✅ ${seen.length} known failure(s), no new divergences and none newly passing`);
