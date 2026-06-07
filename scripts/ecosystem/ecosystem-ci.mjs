#!/usr/bin/env node
// ecosystem-ci runner.
//
// Verifies rsvelte against real-world Svelte projects by cloning each target,
// running its own test/build suite under the official `svelte/compiler` as a
// baseline, then re-running it with `svelte/compiler` swapped for the rsvelte
// NAPI binding. Modeled after vite-ecosystem-ci.
//
// Usage:
//   node scripts/ecosystem/ecosystem-ci.mjs list
//   node scripts/ecosystem/ecosystem-ci.mjs run <target>
//   node scripts/ecosystem/ecosystem-ci.mjs run-all [--tag <tag>]
//   node scripts/ecosystem/ecosystem-ci.mjs report
//   node scripts/ecosystem/ecosystem-ci.mjs poll              # update state/, print targets whose upstream HEAD changed
//
// Target schema: see compat/ecosystem-ci/README.md.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const ECO_DIR = path.join(ROOT, 'compat', 'ecosystem-ci');
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
	// Diagnostics go to stderr so that machine-readable stdout (notably the
	// `poll` command, whose stdout is captured into `changed.txt` and fed
	// line-by-line to `gh workflow run -f target=...`) stays free of noise.
	// Letting log lines leak onto stdout previously caused spurious dispatches
	// with garbage target names (see issue #729).
	console.error(`[ecosystem-ci] ${msg}`);
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

// Active targets (non-disabled). Disabled targets stay tracked in the
// repo for visibility but are filtered out of dispatch / run-all so a
// known rsvelte regression doesn't keep the whole matrix red.
function activeTargets() {
	return listTargets().filter((name) => !loadTarget(name).disabled);
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
	// Print last 50 lines after every phase (not just failures) so CI logs
	// show what each step actually did. The full output is always written
	// to the log file for artifact upload.
	const lines = combined.split('\n');
	const tail = lines.slice(-50).join('\n');
	// child.status === null means the process didn't exit cleanly (signal /
	// timeout / spawn error). Surface child.error so the result JSON
	// records *why* — otherwise it just looks like "exit null".
	const exitCode = child.status ?? -1;
	if (exitCode !== 0) {
		log(`[${target.name}] ${phaseName} FAILED (exit ${exitCode}${child.signal ? `, signal ${child.signal}` : ''}${child.error ? `, ${child.error.code ?? child.error.message}` : ''}) — tail:`);
		console.log(tail);
	} else {
		log(`[${target.name}] ${phaseName} ok (${(durationMs / 1000).toFixed(1)}s, ${lines.length} log lines) — tail:`);
		console.log(tail);
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
	// Bound pnpm's upward workspace search at the target's checkout root.
	// Without this, pnpm walking up from `compat/ecosystem-ci/checkout/<name>/`
	// finds rsvelte's own `pnpm-workspace.yaml` at the repo root and
	// installs rsvelte's workspace members instead of the target's deps —
	// "Scope: all 15 workspace projects" while the target's `node_modules`
	// stays empty. Drop a marker only when the target itself doesn't ship
	// `pnpm-workspace.yaml` (monorepos already define their own boundary).
	const targetHasWorkspace = ['pnpm-workspace.yaml', 'pnpm-workspace.yml'].some(
		(f) => fs.existsSync(path.join(dest, f)),
	);
	if (!targetHasWorkspace) {
		fs.writeFileSync(
			path.join(dest, 'pnpm-workspace.yaml'),
			'# Sentinel: bounds pnpm\'s upward workspace search at this target\n' +
				'# root so pnpm doesn\'t walk into rsvelte\'s own workspace.\n' +
				'packages: []\n',
		);
		log(`bound workspace search: dropped pnpm-workspace.yaml in ${path.relative(ROOT, dest)}`);
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
	const srcPath = path.join(ROOT, 'target', 'release', `librsvelte_core.${ext}`);
	if (!fs.existsSync(srcPath)) throw new Error(`cargo output missing: ${srcPath}`);

	// Stage A: drop a copy under checkout/<name>/.rsvelte/ for the loader-hook
	// path (used by the verify-svelte-compat swap script).
	const stageADir = path.join(checkoutPath, '.rsvelte');
	fs.mkdirSync(stageADir, { recursive: true });
	const stageAPath = path.join(stageADir, nodeName);
	fs.copyFileSync(srcPath, stageAPath);

	// Stage B: drop the *same* binary into apps/npm/vite-plugin-svelte-native-<triple>/
	// so the vps-shim swap can point pnpm at our local rsvelte rather than the
	// last npm-published version. Without this, ecosystem-ci would verify
	// whatever version was published to npm, not the rsvelte at HEAD.
	const platformPkg = path.join(ROOT, 'apps', 'npm', `vite-plugin-svelte-native-${triple}`);
	if (!fs.existsSync(platformPkg)) {
		throw new Error(`platform npm package missing: ${platformPkg}`);
	}
	const stageBPath = path.join(platformPkg, 'rsvelte.node');
	fs.copyFileSync(srcPath, stageBPath);
	log(`staged NAPI -> ${path.relative(ROOT, stageAPath)} + ${path.relative(ROOT, stageBPath)}`);
	return { nodeName, bindingPath: stageAPath, triple };
}

// Build the rsvelte `svelte-check` CLI binary and stage it into the matching
// apps/npm/svelte-check-<triple>/ package, mirroring buildRsvelte's stage B for
// the NAPI binding. Used by the svelte-check swap so pnpm picks up the local
// rsvelte at HEAD, not the last npm-published version. The cargo invocation
// mirrors the release workflow's `build-svelte-check` job.
function buildSvelteCheck(triple) {
	const ext = process.platform === 'win32' ? '.exe' : '';
	log(`building rsvelte svelte-check binary (triple=${triple})`);
	// No `--features napi`: the napi feature links against node's runtime, which a
	// standalone binary can't satisfy (linker error). Mirrors release.yml's
	// `build-svelte-check` job. This means rsvelte_core compiles a second time
	// under the default feature set (buildRsvelte built it with `napi`), which is
	// an acceptable one-off cost for the (single, opt-in) svelte-check target.
	const r = spawnSync('cargo', ['build', '--release', '--bin', 'svelte_check'], {
		stdio: 'inherit',
		cwd: ROOT,
	});
	if (r.status !== 0) throw new Error('cargo build --bin svelte_check failed');
	const srcPath = path.join(ROOT, 'target', 'release', `svelte_check${ext}`);
	if (!fs.existsSync(srcPath)) throw new Error(`cargo output missing: ${srcPath}`);
	const platformPkg = path.join(ROOT, 'apps', 'npm', `svelte-check-${triple}`);
	if (!fs.existsSync(platformPkg)) {
		throw new Error(`platform npm package missing: ${platformPkg}`);
	}
	// cargo names the binary after the bin's `name` field (`svelte_check`); the
	// user-facing package ships it as `svelte-check` (see release.yml).
	const destPath = path.join(platformPkg, `svelte-check${ext}`);
	fs.copyFileSync(srcPath, destPath);
	if (ext !== '.exe') fs.chmodSync(destPath, 0o755);
	log(`staged svelte-check -> ${path.relative(ROOT, destPath)}`);
}

// pnpm 11 no longer reads the `pnpm` field from package.json (overrides,
// onlyBuiltDependencies, supportedArchitectures, ... were all moved to
// pnpm-workspace.yaml). Merge a small, controlled set of top-level keys into the
// target's pnpm-workspace.yaml (creating it if absent) without a YAML dependency:
//
//   - dangerouslyAllowAllBuilds: true   — build native deps (esbuild, ...) during
//     install instead of failing with ERR_PNPM_IGNORED_BUILDS. Targets that keep
//     `pnpm.onlyBuiltDependencies` in package.json (e.g. flowbite-svelte) rely on
//     this since pnpm 11 silently ignores that field.
//   - overrides: { name: spec, ... }    — the swap. In pnpm 10 this used to be
//     injected into package.json#pnpm.overrides; pnpm 11 ignores it there, so the
//     swap was silently a no-op (the matrix verified official svelte, not rsvelte).
//
// The merge preserves existing content (packages, catalog, the target's own
// overrides). Our override keys are namespaced (@sveltejs/..., @rsvelte/...,
// svelte-check) and don't collide with a target's overrides in practice.
function mergeWorkspaceYaml(
	checkoutPath,
	{ dangerouslyAllowAllBuilds = false, overrides = null } = {},
) {
	let wsPath = null;
	for (const f of ['pnpm-workspace.yaml', 'pnpm-workspace.yml']) {
		const p = path.join(checkoutPath, f);
		if (fs.existsSync(p)) {
			wsPath = p;
			break;
		}
	}
	if (!wsPath) wsPath = path.join(checkoutPath, 'pnpm-workspace.yaml');
	let content = fs.existsSync(wsPath) ? fs.readFileSync(wsPath, 'utf8') : '';
	if (content && !content.endsWith('\n')) content += '\n';

	if (dangerouslyAllowAllBuilds && !/^dangerouslyAllowAllBuilds:/m.test(content)) {
		content += 'dangerouslyAllowAllBuilds: true\n';
	}

	if (overrides && Object.keys(overrides).length > 0) {
		const entryLines = Object.entries(overrides).map(
			([k, v]) => `  '${k}': '${v}'`,
		);
		if (/^overrides:/m.test(content)) {
			// Insert our entries right after the existing `overrides:` line.
			content = content.replace(
				/^(overrides:[^\n]*\n)/m,
				(_m, head) => head + entryLines.join('\n') + '\n',
			);
		} else {
			content += 'overrides:\n' + entryLines.join('\n') + '\n';
		}
	}

	fs.writeFileSync(wsPath, content);
	return wsPath;
}

// Remove a top-level YAML key and its indented block (or inline value) from
// `content`. Used to drop a target's build-approval lists so they don't clash
// with `dangerouslyAllowAllBuilds`.
function removeYamlTopLevelKey(content, key) {
	const lines = content.split('\n');
	const out = [];
	let skipping = false;
	for (const line of lines) {
		if (skipping) {
			// Keep skipping the key's indented children; stop at the next
			// top-level (non-indented) line or a blank line.
			if (/^\s/.test(line) && line.trim() !== '') continue;
			skipping = false;
		}
		if (new RegExp(`^${key}\\s*:`).test(line)) {
			skipping = true;
			continue;
		}
		out.push(line);
	}
	return out.join('\n');
}

// Make `pnpm install` build every dependency's install/postinstall script for
// both the baseline and rsvelte runs, the way each target's own CI does.
//
// pnpm 10+ aborts with ERR_PNPM_IGNORED_BUILDS when a dependency ships an
// unapproved build script, and `dangerouslyAllowAllBuilds: true` (set in
// pnpm-workspace.yaml) lifts that. But it conflicts with a target's own
// `onlyBuiltDependencies` / `neverBuiltDependencies` lists
// (ERR_PNPM_CONFIG_CONFLICT_BUILT_DEPENDENCIES), so we strip those from both
// package.json#pnpm (where pnpm 9/10 read them) and pnpm-workspace.yaml (pnpm
// 11) first. pnpm 9 builds everything by default and ignores the workspace key.
function prepareBuildApproval(checkoutPath) {
	const pkgPath = path.join(checkoutPath, 'package.json');
	if (fs.existsSync(pkgPath)) {
		const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
		if (pkg.pnpm) {
			delete pkg.pnpm.onlyBuiltDependencies;
			delete pkg.pnpm.neverBuiltDependencies;
			fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
		}
	}
	for (const f of ['pnpm-workspace.yaml', 'pnpm-workspace.yml']) {
		const p = path.join(checkoutPath, f);
		if (!fs.existsSync(p)) continue;
		let content = fs.readFileSync(p, 'utf8');
		content = removeYamlTopLevelKey(content, 'onlyBuiltDependencies');
		content = removeYamlTopLevelKey(content, 'neverBuiltDependencies');
		fs.writeFileSync(p, content);
	}
	return mergeWorkspaceYaml(checkoutPath, { dangerouslyAllowAllBuilds: true });
}

// Guard against a silent swap no-op: after the rsvelte install, confirm the
// rsvelte vite-plugin-svelte NAPI wrapper actually landed in the target's
// node_modules. It only gets installed when the `@sveltejs/vite-plugin-svelte`
// override resolved to our staged fork (which depends on it). If the override
// were ignored — as it was under pnpm 11 with the old package.json injection —
// the official plugin (no rsvelte dep) is installed and this returns false.
function assertVpsSwapApplied(checkoutPath) {
	const pnpmDir = path.join(checkoutPath, 'node_modules', '.pnpm');
	if (!fs.existsSync(pnpmDir)) return false;
	return fs
		.readdirSync(pnpmDir)
		.some((e) => e.startsWith('@rsvelte+vite-plugin-svelte-native@'));
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
		// Marker so assertVpsSwapApplied / debugging can tell our fork apart from
		// the official plugin once pnpm has installed it.
		stagedPkg._rsvelteShim = true;
		fs.writeFileSync(stagedPkgPath, JSON.stringify(stagedPkg, null, 2) + '\n');

		// All file: refs use plain paths (each staged/local package's name matches
		// the override key).
		const overrides = {
			'@sveltejs/vite-plugin-svelte': `file:${forkStage}`,
			'@rsvelte/vite-plugin-svelte-native': `file:${path.join(ROOT, 'apps', 'npm', 'vite-plugin-svelte-native')}`,
			[`@rsvelte/vite-plugin-svelte-native-${triple}`]: `file:${path.join(ROOT, 'apps', 'npm', `vite-plugin-svelte-native-${triple}`)}`,
		};
		// Targets that also verify svelte-check get the rsvelte svelte-check CLI
		// swapped in too (loader wrapper + platform binary, same two-package shape
		// as the NAPI native packages). Only injected when commands.check is set so
		// a target's own svelte-check usage isn't disturbed otherwise.
		if (target.commands?.check) {
			overrides['svelte-check'] = `file:${path.join(ROOT, 'apps', 'npm', 'svelte-check')}`;
			overrides[`@rsvelte/svelte-check-${triple}`] =
				`file:${path.join(ROOT, 'apps', 'npm', `svelte-check-${triple}`)}`;
		}

		// Write the overrides to BOTH places because each target pins its own pnpm
		// (via package.json#packageManager / corepack), and where pnpm looks for
		// overrides changed across majors:
		//   - pnpm 9  reads package.json#pnpm.overrides; it ignores overrides in
		//             pnpm-workspace.yaml (added in pnpm 10).
		//   - pnpm 11 ignores the package.json `pnpm` field entirely; overrides
		//             must be in pnpm-workspace.yaml.
		//   - pnpm 10 reads pnpm-workspace.yaml (and warns about package.json#pnpm).
		// e.g. melt-ui pins pnpm@9, flowbite-svelte uses the ambient pnpm 11.
		const pkgPath = path.join(checkoutPath, 'package.json');
		const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
		pkg.pnpm = pkg.pnpm ?? {};
		pkg.pnpm.overrides = { ...(pkg.pnpm.overrides ?? {}), ...overrides };
		fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
		const wsPath = mergeWorkspaceYaml(checkoutPath, { overrides });
		log(
			`vps-shim: staged fork -> ${path.relative(ROOT, forkStage)} and injected ${Object.keys(overrides).length} overrides into package.json + ${path.relative(ROOT, wsPath)}`,
		);
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
	// pnpm-workspace.yaml: restores the target's own file when it ships one; a
	// no-op for the untracked sentinel we drop for non-monorepo targets (that
	// gets recreated/cleaned on the next run).
	for (const f of ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml']) {
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
	const checkoutPath = path.join(CHECKOUT_DIR, target.name);

	// Allow all dependency build scripts for both baseline and rsvelte installs —
	// matches what each target's own CI does, and keeps pnpm 10+ from aborting
	// with ERR_PNPM_IGNORED_BUILDS on targets whose build approvals live in the
	// (pnpm-11-ignored) package.json#pnpm.onlyBuiltDependencies, e.g. flowbite.
	prepareBuildApproval(checkoutPath);

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
		return 'baseline-failure';
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
	// svelte-check verification (Wave 2). Gated by the baseline: if the official
	// svelte-check already reports problems on this target, that's the target's
	// issue, not a rsvelte regression — classify as baseline-failure and skip the
	// rsvelte run. We only proceed to compare rsvelte's svelte-check on a target
	// the official one passes cleanly.
	if (target.commands.check) {
		baseline.check = runPhase(
			target,
			'baseline-check',
			target.commands.check,
			{},
			target.timeoutMinutes,
		);
	}
	const baselineFailed = ['install', 'build', 'test', 'check'].some(
		(k) => baseline[k] && baseline[k].exitCode !== 0,
	);
	if (baselineFailed) {
		writeResult(target, targetSha, { result: 'baseline-failure', baseline });
		return 'baseline-failure';
	}

	// Build rsvelte NAPI (and the svelte-check binary when this target verifies
	// it) and stage them under the target's .rsvelte/ + apps/npm.
	const { bindingPath, triple } = buildRsvelte(checkoutPath);
	if (target.commands.check) buildSvelteCheck(triple);

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
		return 'swap-failure';
	}

	const rsvelte = {};
	if (swap.needsReinstall) {
		// Force a fresh resolution so the swap overrides actually apply. pnpm 11
		// does NOT invalidate an existing install when pnpm-workspace.yaml
		// `overrides` change (even `--force` reports "Already up to date"), so a
		// plain reinstall keeps the baseline's official packages and the swap is a
		// silent no-op. Removing node_modules + the lockfile makes pnpm re-resolve
		// against the overrides; the warm store keeps it fast.
		fs.rmSync(path.join(checkoutPath, 'node_modules'), {
			recursive: true,
			force: true,
		});
		fs.rmSync(path.join(checkoutPath, 'pnpm-lock.yaml'), { force: true });
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
			return 'rsvelte-install-failure';
		}
		// Fail loudly instead of silently verifying official svelte: if the
		// override didn't take, the rsvelte plugin never got installed and any
		// "pass" below would be meaningless.
		if (swap.strategy === 'vps-shim' && !assertVpsSwapApplied(checkoutPath)) {
			writeResult(target, targetSha, {
				result: 'swap-noop',
				baseline,
				rsvelte,
				swap: { strategy: swap.strategy },
				error:
					'rsvelte vite-plugin-svelte NAPI wrapper not found in node_modules after install — the override did not take effect (the run would have verified official svelte, not rsvelte)',
			});
			restoreTarget(target);
			return 'swap-noop';
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
	if (target.commands.check) {
		rsvelte.check = runPhase(
			target,
			'rsvelte-check',
			target.commands.check,
			swap.env,
			target.timeoutMinutes,
		);
	}

	const rsvelteFailed = ['build', 'test', 'check'].some(
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
	return result;
}

// Map a result classification to a process exit code.
// 0 = pass. Anything non-zero surfaces as a job failure in CI so an
// operator looking at the matrix doesn't see misleading green.
function exitCodeForResult(result) {
	switch (result) {
		case 'pass':
			return 0;
		case 'regression':
			return 2;
		case 'baseline-failure':
			return 3;
		case 'rsvelte-install-failure':
			return 4;
		case 'swap-failure':
			return 5;
		case 'swap-noop':
			return 6;
		default:
			return 1;
	}
}

async function runAll(filterTag) {
	const targets = activeTargets();
	const results = [];
	for (const name of targets) {
		const t = loadTarget(name);
		if (filterTag && !(t.tags ?? []).includes(filterTag)) continue;
		const r = await runTarget(name);
		results.push(r);
	}
	return results;
}

function cmdList() {
	for (const name of listTargets()) {
		const t = loadTarget(name);
		const tags = (t.tags ?? []).join(',');
		const flag = t.disabled ? ' [disabled]' : '';
		console.log(`${name.padEnd(28)} ${t.type.padEnd(6)} [${tags}]${flag}`);
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
	for (const name of activeTargets()) {
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
			cmdList();
			return 0;
		case 'run': {
			const name = rest[0];
			if (!name) {
				console.error('usage: ecosystem-ci run <target>');
				return 64;
			}
			const result = await runTarget(name);
			return exitCodeForResult(result);
		}
		case 'run-all': {
			let tag = null;
			const i = rest.indexOf('--tag');
			if (i >= 0) tag = rest[i + 1];
			const results = await runAll(tag);
			// run-all surfaces non-zero exit if any target wasn't a clean pass.
			const worst = (results ?? []).reduce(
				(acc, r) => Math.max(acc, exitCodeForResult(r)),
				0,
			);
			return worst;
		}
		case 'report':
			cmdReport();
			return 0;
		case 'poll':
			await cmdPoll();
			return 0;
		default:
			console.error(
				'usage: ecosystem-ci [list | run <target> | run-all [--tag T] | report | poll]',
			);
			return 64;
	}
}

main().then(
	(code) => process.exit(code ?? 0),
	(e) => {
		console.error(e);
		process.exit(1);
	},
);
