#!/usr/bin/env node
// Publish the compiler entry and the separately loaded playground module.
import { chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const pkgDir = resolve(repoRoot, 'pkg');
const pkgJsonPath = resolve(repoRoot, 'pkg/package.json');
const sourceJsonPath = resolve(repoRoot, 'apps/npm/compiler/package.json');
const sourceReadmePath = resolve(repoRoot, 'apps/npm/compiler/README.md');
const pkgReadmePath = resolve(repoRoot, 'pkg/README.md');

const generated = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
const source = JSON.parse(readFileSync(sourceJsonPath, 'utf8'));

// Override the published identity. We don't carry the `publishConfig.directory`
// redirect into the published package — once pnpm packs from `pkg/`, that
// field would only confuse downstream consumers if it shipped to the registry.
generated.name = source.name;
// Surface any drift between the built crate's version and the release version
// so a future build-crate swap that desyncs `sync-version.mjs` is debuggable.
if (generated.version !== source.version) {
	console.warn(
		`finalize-pkg: overriding wasm-pack version ${generated.version} -> ${source.version} ` +
			`(from apps/npm/compiler/package.json). If unexpected, check sync-version.mjs covers the built crate.`,
	);
}
generated.version = source.version;
if (source.description) generated.description = source.description;
if (source.repository) generated.repository = source.repository;
if (source.homepage) generated.homepage = source.homepage;
if (source.bugs) generated.bugs = source.bugs;
if (source.keywords) generated.keywords = source.keywords;
if (source.bin) generated.bin = source.bin;
if (source.peerDependencies) generated.peerDependencies = source.peerDependencies;
if (source.peerDependenciesMeta) generated.peerDependenciesMeta = source.peerDependenciesMeta;

// wasm-pack regenerates pkg/ from scratch, so copy the npm-side runtime overlay
// named by the version anchor's `files` field. Keeping this list explicit makes
// a missing CLI entry fail the release instead of silently publishing metadata
// that points at a file absent from the tarball.
const overlayFiles = source.files ?? [];
generated.files = [...new Set([...(generated.files ?? []), ...overlayFiles])];
for (const file of overlayFiles) {
	const sourcePath = resolve(repoRoot, 'apps/npm/compiler', file);
	const targetPath = resolve(pkgDir, file);
	if (!existsSync(sourcePath)) {
		throw new Error(`finalize-pkg: npm overlay file ${file} is missing`);
	}
	mkdirSync(dirname(targetPath), { recursive: true });
	copyFileSync(sourcePath, targetPath);
}
for (const file of Object.values(source.bin ?? {})) {
	if (!overlayFiles.includes(file)) {
		throw new Error(`finalize-pkg: bin target ${file} must also be listed in "files"`);
	}
	chmodSync(resolve(pkgDir, file), 0o755);
}

// Keep public entry points independent of wasm-pack artifact filenames.
const withDot = (p) => (p.startsWith('./') ? p : `./${p}`);
const jsEntry = generated.main ?? generated.module;
if (!jsEntry) {
	throw new Error('finalize-pkg: wasm-pack pkg/package.json has neither "main" nor "module"');
}
const wasmFile = (generated.files ?? []).find((f) => f.endsWith('_bg.wasm'));
if (!wasmFile) {
	throw new Error('finalize-pkg: no `*_bg.wasm` entry in pkg/package.json "files"');
}
const playgroundDir = resolve(repoRoot, 'pkg-playground');
const playground = JSON.parse(readFileSync(resolve(playgroundDir, 'package.json'), 'utf8'));
const playgroundJs = playground.main ?? playground.module;
const playgroundWasm = playground.files.find((file) => file.endsWith('_bg.wasm'));
if (!playgroundJs || !playgroundWasm || !playground.types) {
	throw new Error('finalize-pkg: incomplete playground build');
}
mkdirSync(resolve(pkgDir, 'playground'), { recursive: true });
for (const file of playground.files) {
	copyFileSync(resolve(playgroundDir, file), resolve(pkgDir, 'playground', file));
}
generated.files = [...new Set([...generated.files, 'playground'])];
const dotExport = generated.types
	? { types: withDot(generated.types), default: withDot(jsEntry) }
	: withDot(jsEntry);
generated.exports = {
	'.': dotExport,
	'./wasm': withDot(wasmFile),
	'./playground': { types: `./playground/${playground.types}`, default: `./playground/${playgroundJs}` },
	'./playground/wasm': `./playground/${playgroundWasm}`,
	'./package.json': './package.json',
	'./*': './*',
};

// Verify every concrete export target actually shipped in `pkg/`, so a future
// crate rename or wasm-pack layout change fails the release loudly here rather
// than publishing an `exports` map that points at missing files. The `./*`
// passthrough is a wildcard with no single target, so it is not checked.
const shippedTargets = new Set(Object.values(generated.exports).flatMap((value) =>
	typeof value === 'string' ? [value] : Object.values(value),
).filter((value) => !value.includes('*')));
if (generated.types) shippedTargets.add(withDot(generated.types));
for (const file of overlayFiles) shippedTargets.add(withDot(file));
for (const target of shippedTargets) {
	if (!existsSync(resolve(pkgDir, target))) {
		throw new Error(`finalize-pkg: shipped target ${target} is missing from pkg/`);
	}
}

writeFileSync(pkgJsonPath, JSON.stringify(generated, null, 2) + '\n');
console.log(`Finalized pkg/package.json as ${generated.name}@${generated.version}`);

copyFileSync(sourceReadmePath, pkgReadmePath);
console.log(`Copied ${sourceReadmePath} -> pkg/README.md`);
