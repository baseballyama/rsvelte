#!/usr/bin/env node
// ecosystem-ci runner.
//
// Verifies rsvelte against real-world Svelte projects by cloning each target,
// running its own test/build suite under the official `svelte/compiler` as a
// baseline, then re-running it with `svelte/compiler` swapped for the rsvelte
// NAPI binding. Modeled after vite-ecosystem-ci.
//
// Usage:
//   node scripts/ecosystem-ci.mjs list
//   node scripts/ecosystem-ci.mjs run <target>
//   node scripts/ecosystem-ci.mjs run-all [--tag <tag>]
//   node scripts/ecosystem-ci.mjs report
//   node scripts/ecosystem-ci.mjs poll              # update state/, print targets whose upstream HEAD changed
//
// Target schema: see ecosystem-ci/README.md.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const ECO_DIR = path.join(ROOT, 'ecosystem-ci');
const TARGETS_DIR = path.join(ECO_DIR, 'targets');
const CHECKOUT_DIR = path.join(ECO_DIR, 'checkout');
const RESULTS_DIR = path.join(ECO_DIR, 'results');
const CACHE_DIR = path.join(ECO_DIR, '.cache');
const STATE_DIR = path.join(ECO_DIR, 'state');
const SKILL_SCRIPTS = path.join(
	ROOT,
	'.claude/skills/verify-svelte-compat/scripts',
);
const VPS_FORK = path.join(
	ROOT,
	'submodules/vite-plugin-svelte/packages/vite-plugin-svelte',
);

function log(msg) {
	console.log(`[ecosystem-ci] ${msg}`);
}

function ensureDirs() {
	for (const d of [CHECKOUT_DIR, RESULTS_DIR, CACHE_DIR, STATE_DIR]) {
		fs.mkdirSync(d, { recursive: true });
	}
}

function listTargets() {
	if (!fs.existsSync(TARGETS_DIR)) return [];
	return fs
		.readdirSync(TARGETS_DIR)
		.filter((f) => f.endsWith('.json'))
		.map((f) => f.slice(0, -'.json'.length))
		.sort();
}

function loadTarget(name) {
	const p = path.join(TARGETS_DIR, `${name}.json`);
	if (!fs.existsSync(p)) {
		console.error(`[ecosystem-ci] target not found: ${p}`);
		process.exit(2);
	}
	const target = JSON.parse(fs.readFileSync(p, 'utf8'));
	if (!target.commands?.build && !target.commands?.test) {
		console.error(
			`[ecosystem-ci] target ${name}: commands.build or commands.test is required`,
		);
		process.exit(2);
	}
	if (target.license && target.license !== 'MIT') {
		log(`WARNING: target ${name} license is ${target.license} (not MIT)`);
	}
	return target;
}

function runCapture(cmd, args, opts = {}) {
	return spawnSync(cmd, args, { encoding: 'utf8', ...opts });
}

function runInteractive(cmd, args, opts = {}) {
	return spawnSync(cmd, args, { stdio: 'inherit', ...opts });
}

function runPhase(target, phaseName, command, env = {}, timeoutMinutes) {
	// Always run at the repo root. If a target needs to scope work to a
	// sub-package, encode that in the command itself (`pnpm -F <pkg> build`,
	// `cd packages/foo && pnpm test`, etc.). Per-phase cwd switching turned
	// out to break install for monorepos, which always installs at the root.
	const cwd = path.join(CHECKOUT_DIR, target.name);
	const logFile = path.join(CACHE_DIR, `${target.name}-${phaseName}.log`);
	fs.mkdirSync(CACHE_DIR, { recursive: true });
	log(`[${target.name}] ${phaseName}: ${command}`);
	log(`  cwd: ${cwd}`);
	const start = Date.now();
	const child = spawnSync('sh', ['-c', command], {
		cwd,
		env: { ...process.env, ...env },
		stdio: ['inherit', 'pipe', 'pipe'],
		encoding: 'utf8',
		maxBuffer: 200 * 1024 * 1024,
		timeout: timeoutMinutes ? timeoutMinutes * 60 * 1000 : undefined,
	});
	const durationMs = Date.now() - start;
	const combined = (child.stdout ?? '') + (child.stderr ?? '');
	fs.writeFileSync(logFile, combined);
	const tail = combined.split('\n').slice(-20).join('\n');
	// child.status === null means the process didn't exit cleanly (signal /
	// timeout / spawn error). Surface child.error so the result JSON
	// records *why* — otherwise it just looks like "exit null".
	const exitCode = child.status ?? -1;
	if (exitCode !== 0) {
		log(`[${target.name}] ${phaseName} FAILED (exit ${exitCode}${child.signal ? `, signal ${child.signal}` : ''}${child.error ? `, ${child.error.code ?? child.error.message}` : ''}) — tail:`);
		console.log(tail);
	} else {
		log(`[${target.name}] ${phaseName} ok (${(durationMs / 1000).toFixed(1)}s)`);
	}
	return {
		exitCode,
		signal: child.signal ?? null,
		spawnError: child.error?.code ?? child.error?.message ?? null,
		durationMs,
		logFile: path.relative(ROOT, logFile),
	};
}

function cloneOrUpdate(target) {
	const dest = path.join(CHECKOUT_DIR, target.name);
	if (!fs.existsSync(dest)) {
		log(`cloning ${target.repo} -> ${dest}`);
		const r = runInteractive('git', [
			'clone',
			'--branch',
			target.branch,
			'--depth',
			'1',
			target.repo,
			dest,
		]);
		if (r.status !== 0) throw new Error(`clone failed: ${target.repo}`);
	} else {
		log(`updating ${dest} (branch ${target.branch})`);
		const fetch = runInteractive(
			'git',
			['fetch', '--depth', '1', 'origin', target.branch],
			{ cwd: dest },
		);
		if (fetch.status !== 0) throw new Error(`fetch failed: ${target.repo}`);
		runInteractive('git', ['reset', '--hard', `origin/${target.branch}`], {
			cwd: dest,
		});
		// Preserve .rsvelte (NAPI binding + loader) and node_modules across runs to
		// avoid re-downloading on every iteration.
		runInteractive(
			'git',
			['clean', '-fdx', '-e', '.rsvelte', '-e', 'node_modules'],
			{ cwd: dest },
		);
	}
	const sha = runCapture('git', ['rev-parse', 'HEAD'], { cwd: dest }).stdout
		?.trim();
	return { path: dest, sha };
}

function rsvelteNodeName() {
	const platform = process.platform;
	const arch = process.arch;
	if (platform === 'darwin' && arch === 'arm64')
		return { ext: 'dylib', node: 'rsvelte.darwin-arm64.node', triple: 'darwin-arm64' };
	if (platform === 'darwin' && arch === 'x64')
		return { ext: 'dylib', node: 'rsvelte.darwin-x64.node', triple: 'darwin-x64' };
	if (platform === 'linux' && arch === 'x64')
		return { ext: 'so', node: 'rsvelte.linux-x64-gnu.node', triple: 'linux-x64-gnu' };
	if (platform === 'linux' && arch === 'arm64')
		return { ext: 'so', node: 'rsvelte.linux-arm64-gnu.node', triple: 'linux-arm64-gnu' };
	throw new Error(`unsupported platform: ${platform}-${arch}`);
}

function buildRsvelte(checkoutPath) {
	const { ext, node: nodeName, triple } = rsvelteNodeName();
	log(`building rsvelte NAPI (triple=${triple})`);
	// We bypass build-rsvelte.sh because that script also copies into ./svelte/
	// (the svelte submodule), which we don't need here and isn't always
	// initialized in every worktree.
	const r = spawnSync(
		'cargo',
		['build', '--release', '--features', 'napi', '--lib'],
		{ stdio: 'inherit', cwd: ROOT },
	);
	if (r.status !== 0) throw new Error('cargo build failed');
	const srcPath = path.join(ROOT, 'target', 'release', `libsvelte_compiler_rust.${ext}`);
	if (!fs.existsSync(srcPath)) throw new Error(`cargo output missing: ${srcPath}`);

	// Stage A: drop a copy under checkout/<name>/.rsvelte/ for the loader-hook
	// path (used by the verify-svelte-compat swap script).
	const stageADir = path.join(checkoutPath, '.rsvelte');
	fs.mkdirSync(stageADir, { recursive: true });
	const stageAPath = path.join(stageADir, nodeName);
	fs.copyFileSync(srcPath, stageAPath);

	// Stage B: drop the *same* binary into npm/vite-plugin-svelte-native-<triple>/
	// so the vps-shim swap can point pnpm at our local rsvelte rather than the
	// last npm-published version. Without this, ecosystem-ci would verify
	// whatever version was published to npm, not the rsvelte at HEAD.
	const platformPkg = path.join(ROOT, 'npm', `vite-plugin-svelte-native-${triple}`);
	if (!fs.existsSync(platformPkg)) {
		throw new Error(`platform npm package missing: ${platformPkg}`);
	}
	const stageBPath = path.join(platformPkg, 'rsvelte.node');
	fs.copyFileSync(srcPath, stageBPath);
	log(`staged NAPI -> ${path.relative(ROOT, stageAPath)} + ${path.relative(ROOT, stageBPath)}`);
	return { nodeName, bindingPath: stageAPath, triple };
}

function applySwap(target, checkoutPath, bindingPath, triple) {
	const strategy = target.swap?.strategy ?? 'loader-hook';

	if (strategy === 'loader-hook') {
		const r = runInteractive('node', [
			path.join(SKILL_SCRIPTS, 'swap-compiler.mjs'),
			'--target',
			checkoutPath,
			'--rsvelte-binding',
			bindingPath,
		]);
		if (r.status !== 0) throw new Error('loader-hook swap failed');
		return {
			strategy,
			env: {
				NODE_OPTIONS: `--import ${path.join(checkoutPath, '.rsvelte/loader.mjs')}`,
			},
			needsReinstall: false,
		};
	}

	if (strategy === 'vps-shim') {
		if (!fs.existsSync(VPS_FORK)) {
			throw new Error(
				`vps-shim swap requested but fork not found: ${VPS_FORK}\n  hint: \`git submodule update --init submodules/vite-plugin-svelte\``,
			);
		}

		// pnpm's aliased file: dep syntax (npm:@rsvelte/...@file:...) produces
		// a broken symlink in node_modules because the encoded version string
		// contains "npm:" and "file:" verbatim. Workaround: stage a renamed
		// copy of the fork whose package.json#name is @sveltejs/vite-plugin-svelte,
		// then use a plain file: override.
		const forkStage = path.join(CACHE_DIR, 'vite-plugin-svelte-stage');
		fs.rmSync(forkStage, { recursive: true, force: true });
		fs.mkdirSync(forkStage, { recursive: true });
		const copyR = spawnSync(
			'rsync',
			['-a', '--exclude=node_modules', '--exclude=.git', `${VPS_FORK}/`, `${forkStage}/`],
			{ stdio: 'inherit' },
		);
		if (copyR.status !== 0) throw new Error('failed to stage fork copy');
		const stagedPkgPath = path.join(forkStage, 'package.json');
		const stagedPkg = JSON.parse(fs.readFileSync(stagedPkgPath, 'utf8'));
		stagedPkg.name = '@sveltejs/vite-plugin-svelte';
		fs.writeFileSync(stagedPkgPath, JSON.stringify(stagedPkg, null, 2) + '\n');

		const pkgPath = path.join(checkoutPath, 'package.json');
		const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
		pkg.pnpm = pkg.pnpm ?? {};
		pkg.pnpm.overrides = pkg.pnpm.overrides ?? {};
		// All three overrides use plain file: refs (package.json#name matches
		// the override key in each case).
		pkg.pnpm.overrides['@sveltejs/vite-plugin-svelte'] = `file:${forkStage}`;
		pkg.pnpm.overrides['@rsvelte/vite-plugin-svelte-native'] =
			`file:${path.join(ROOT, 'npm', 'vite-plugin-svelte-native')}`;
		pkg.pnpm.overrides[`@rsvelte/vite-plugin-svelte-native-${triple}`] =
			`file:${path.join(ROOT, 'npm', `vite-plugin-svelte-native-${triple}`)}`;
		fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
		log(`vps-shim: staged fork -> ${path.relative(ROOT, forkStage)} and injected 3 pnpm.overrides`);
		return { strategy, env: {}, needsReinstall: true };
	}

	if (strategy === 'pnpm-override') {
		// Target already imports @rsvelte/compiler — point that package at our
		// local wrapper around the NAPI binding.
		const r = runInteractive('node', [
			path.join(SKILL_SCRIPTS, 'provide-rsvelte-compiler.mjs'),
			'--target',
			checkoutPath,
			'--rsvelte-binding',
			bindingPath,
		]);
		if (r.status !== 0) throw new Error('pnpm-override swap failed');
		return { strategy, env: {}, needsReinstall: true };
	}

	throw new Error(`unknown swap.strategy: ${strategy}`);
}

function restoreTarget(target) {
	const dest = path.join(CHECKOUT_DIR, target.name);
	for (const f of ['package.json', 'pnpm-lock.yaml']) {
		spawnSync('git', ['checkout', '--', f], { cwd: dest, stdio: 'ignore' });
	}
	fs.rmSync(path.join(dest, '.rsvelte'), { recursive: true, force: true });
}

function writeResult(target, targetSha, extra) {
	const rsvelteSha = runCapture('git', ['rev-parse', 'HEAD'], { cwd: ROOT })
		.stdout?.trim();
	const out = path.join(RESULTS_DIR, `${target.name}.json`);
	const payload = {
		name: target.name,
		targetSha,
		rsvelteSha,
		verifiedAt: new Date().toISOString(),
		...extra,
	};
	fs.writeFileSync(out, JSON.stringify(payload, null, 2));
	log(`wrote ${path.relative(ROOT, out)} -> ${payload.result}`);
}

async function runTarget(name) {
	ensureDirs();
	const target = loadTarget(name);
	log(`=== ${target.name} (${target.type}, swap=${target.swap?.strategy ?? 'loader-hook'}) ===`);

	const { sha: targetSha } = cloneOrUpdate(target);

	const baseline = {};
	baseline.install = runPhase(
		target,
		'baseline-install',
		target.commands.install,
		{},
		target.timeoutMinutes,
	);
	if (baseline.install.exitCode !== 0) {
		writeResult(target, targetSha, { result: 'baseline-failure', baseline });
		return;
	}
	if (target.commands.build) {
		baseline.build = runPhase(
			target,
			'baseline-build',
			target.commands.build,
			{},
			target.timeoutMinutes,
		);
	}
	if (target.commands.test) {
		baseline.test = runPhase(
			target,
			'baseline-test',
			target.commands.test,
			{},
			target.timeoutMinutes,
		);
	}
	const baselineFailed = ['install', 'build', 'test'].some(
		(k) => baseline[k] && baseline[k].exitCode !== 0,
	);
	if (baselineFailed) {
		writeResult(target, targetSha, { result: 'baseline-failure', baseline });
		return;
	}

	// Build rsvelte NAPI and stage it under the target's .rsvelte/
	const checkoutPath = path.join(CHECKOUT_DIR, target.name);
	const { bindingPath, triple } = buildRsvelte(checkoutPath);

	let swap;
	try {
		swap = applySwap(target, checkoutPath, bindingPath, triple);
	} catch (e) {
		writeResult(target, targetSha, {
			result: 'swap-failure',
			baseline,
			error: e.message,
		});
		restoreTarget(target);
		return;
	}

	const rsvelte = {};
	if (swap.needsReinstall) {
		rsvelte.install = runPhase(
			target,
			'rsvelte-install',
			target.commands.install,
			swap.env,
			target.timeoutMinutes,
		);
		if (rsvelte.install.exitCode !== 0) {
			writeResult(target, targetSha, {
				result: 'rsvelte-install-failure',
				baseline,
				rsvelte,
				swap: { strategy: swap.strategy },
			});
			restoreTarget(target);
			return;
		}
	}
	if (target.commands.build) {
		rsvelte.build = runPhase(
			target,
			'rsvelte-build',
			target.commands.build,
			swap.env,
			target.timeoutMinutes,
		);
	}
	if (target.commands.test) {
		rsvelte.test = runPhase(
			target,
			'rsvelte-test',
			target.commands.test,
			swap.env,
			target.timeoutMinutes,
		);
	}

	const rsvelteFailed = ['build', 'test'].some(
		(k) => rsvelte[k] && rsvelte[k].exitCode !== 0,
	);
	const result = rsvelteFailed ? 'regression' : 'pass';
	writeResult(target, targetSha, {
		result,
		baseline,
		rsvelte,
		swap: { strategy: swap.strategy },
	});
	restoreTarget(target);
}

async function runAll(filterTag) {
	const targets = listTargets();
	for (const name of targets) {
		const t = loadTarget(name);
		if (filterTag && !(t.tags ?? []).includes(filterTag)) continue;
		await runTarget(name);
	}
}

function cmdList() {
	for (const name of listTargets()) {
		const t = loadTarget(name);
		const tags = (t.tags ?? []).join(',');
		console.log(`${name.padEnd(28)} ${t.type.padEnd(6)} [${tags}]`);
	}
}

function cmdReport() {
	if (!fs.existsSync(RESULTS_DIR)) {
		console.log('No results yet.');
		return;
	}
	const files = fs.readdirSync(RESULTS_DIR).filter((f) => f.endsWith('.json'));
	const rows = files.map((f) => JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, f), 'utf8')));
	console.log('# ecosystem-ci summary');
	console.log('');
	console.log('| Target | Result | Target SHA | rsvelte SHA | Verified |');
	console.log('|---|---|---|---|---|');
	for (const r of rows) {
		console.log(
			`| ${r.name} | ${r.result} | ${(r.targetSha ?? '').slice(0, 8)} | ${(r.rsvelteSha ?? '').slice(0, 8)} | ${r.verifiedAt ?? ''} |`,
		);
	}
}

async function cmdPoll() {
	// Print one line per target whose upstream HEAD changed since the last run.
	// Intended for the GitHub Actions polling workflow to feed downstream
	// workflow_dispatch invocations.
	ensureDirs();
	const changed = [];
	for (const name of listTargets()) {
		const t = loadTarget(name);
		const m = /github\.com[:/](.+?)\/(.+?)(?:\.git)?$/.exec(t.repo);
		if (!m) {
			log(`poll: cannot parse repo url: ${t.repo}`);
			continue;
		}
		const owner = m[1];
		const repo = m[2];
		const r = runCapture('gh', [
			'api',
			`repos/${owner}/${repo}/commits/${t.branch}`,
			'--jq',
			'.sha',
		]);
		if (r.status !== 0) {
			log(`poll: gh api failed for ${name}: ${r.stderr?.trim()}`);
			continue;
		}
		const currentSha = (r.stdout ?? '').trim();
		const stateFile = path.join(STATE_DIR, `${name}.json`);
		const prev = fs.existsSync(stateFile)
			? JSON.parse(fs.readFileSync(stateFile, 'utf8'))
			: { sha: null };
		if (prev.sha !== currentSha) {
			log(`poll: ${name} changed ${prev.sha?.slice(0, 8) ?? '(new)'} -> ${currentSha.slice(0, 8)}`);
			changed.push(name);
			fs.writeFileSync(
				stateFile,
				JSON.stringify({ sha: currentSha, at: new Date().toISOString() }, null, 2),
			);
		}
	}
	// Output changed target names (one per line) for downstream consumption.
	for (const name of changed) {
		console.log(name);
	}
}

async function main() {
	const [, , cmd, ...rest] = process.argv;
	switch (cmd) {
		case 'list':
			return cmdList();
		case 'run': {
			const name = rest[0];
			if (!name) {
				console.error('usage: ecosystem-ci run <target>');
				process.exit(64);
			}
			return runTarget(name);
		}
		case 'run-all': {
			let tag = null;
			const i = rest.indexOf('--tag');
			if (i >= 0) tag = rest[i + 1];
			return runAll(tag);
		}
		case 'report':
			return cmdReport();
		case 'poll':
			return cmdPoll();
		default:
			console.error(
				'usage: ecosystem-ci [list | run <target> | run-all [--tag T] | report | poll]',
			);
			process.exit(64);
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
