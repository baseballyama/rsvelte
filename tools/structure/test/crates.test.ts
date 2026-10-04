import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { test } from 'node:test';

type Package = {
	name: string;
	manifest_path: string;
	dependencies: { name: string }[];
};

const root = resolve(import.meta.dirname, '../../..');
const metadata = JSON.parse(execFileSync('cargo', ['metadata', '--offline', '--no-deps', '--format-version', '1'],
	{ cwd: root, encoding: 'utf8' })) as { packages: Package[] };

function toolDependencies(packages: Package[]): string[] {
	const failures: string[] = [];
	for (const pkg of packages) {
		if (pkg.name !== 'rsvelte_kernel' &&
			!pkg.manifest_path.includes('/core/') &&
			!/^rsvelte_svelte_(syntax|parser|hir|semantic)$/.test(pkg.name)) continue;
		for (const dependency of pkg.dependencies) {
			if (/_(compile|format|lint|check)$/.test(dependency.name) ||
				(pkg.name === 'rsvelte_kernel' && dependency.name.startsWith('rsvelte_'))) {
				failures.push(`${pkg.name} depends on ${dependency.name}`);
			}
		}
	}
	return failures;
}

test('kernel and language cores do not depend on tools', () => {
	assert.deepEqual(toolDependencies(metadata.packages), []);
	assert.ok(metadata.packages.some(pkg => pkg.name === 'rsvelte_kernel'));
	assert.ok(metadata.packages.some(pkg => pkg.manifest_path.includes('/core/')));
});

test('the dependency check rejects an injected formatter dependency', () => {
	const core = metadata.packages.find(pkg => pkg.name === 'rsvelte_svelte');
	assert.ok(core);
	const injected = { ...core, dependencies: [...core.dependencies, { name: 'rsvelte_svelte_format' }] };
	assert.deepEqual(toolDependencies([injected]), ['rsvelte_svelte depends on rsvelte_svelte_format']);
});

const svelteLayers: Record<string, readonly string[]> = {
	rsvelte_svelte_syntax: [],
	rsvelte_svelte_parser: ['rsvelte_svelte_syntax'],
	rsvelte_svelte_hir: ['rsvelte_svelte_syntax'],
	rsvelte_svelte_semantic: ['rsvelte_svelte_hir'],
};

function svelteDependencies(packages: Package[]): string[] {
	return packages.flatMap(pkg => {
		const allowed = svelteLayers[pkg.name];
		if (!allowed) return [];
		return pkg.dependencies.filter(dependency =>
			(dependency.name === 'rsvelte_svelte' || dependency.name.startsWith('rsvelte_svelte_')) &&
			!allowed.includes(dependency.name)
		).map(dependency => `${pkg.name} depends on ${dependency.name}`);
	});
}

test('Svelte shared crates keep their dependency boundaries', () => {
	for (const name of Object.keys(svelteLayers)) {
		assert.ok(metadata.packages.some(pkg => pkg.name === name), `${name} is measured`);
	}
	assert.deepEqual(svelteDependencies(metadata.packages), []);
});

test('Svelte boundaries reject injected dependencies on parsing, normalization, and tools', () => {
	for (const [name, forbidden] of [
		['rsvelte_svelte_syntax', 'rsvelte_svelte_parser'],
		['rsvelte_svelte_hir', 'rsvelte_svelte_parser'],
		['rsvelte_svelte_semantic', 'rsvelte_svelte_parser'],
		['rsvelte_svelte_hir', 'rsvelte_svelte'],
		['rsvelte_svelte_semantic', 'rsvelte_svelte_compile'],
	] as const) {
		const pkg = metadata.packages.find(pkg => pkg.name === name);
		assert.ok(pkg);
		const injected = { ...pkg, dependencies: [...pkg.dependencies, { name: forbidden }] };
		assert.deepEqual(svelteDependencies([injected]), [`${name} depends on ${forbidden}`]);
	}
	for (const name of Object.keys(svelteLayers)) {
		const pkg = metadata.packages.find(pkg => pkg.name === name);
		assert.ok(pkg);
		const injected = { ...pkg, dependencies: [...pkg.dependencies, { name: 'rsvelte_svelte_format' }] };
		assert.deepEqual(toolDependencies([injected]), [`${name} depends on rsvelte_svelte_format`]);
	}
});

test('the kernel rejects language data and shared task contracts', () => {
	const kernel = metadata.packages.find(pkg => pkg.name === 'rsvelte_kernel');
	assert.ok(kernel);
	for (const name of ['rsvelte_svelte', 'rsvelte_typescript', 'rsvelte_lint']) {
		const injected = { ...kernel, dependencies: [...kernel.dependencies, { name }] };
		assert.deepEqual(toolDependencies([injected]), [`rsvelte_kernel depends on ${name}`]);
	}
	for (const pkg of metadata.packages.filter(pkg => pkg.manifest_path.includes('/core/'))) {
		const injected = { ...pkg, dependencies: [...pkg.dependencies, { name: 'rsvelte_lint' }] };
		assert.deepEqual(toolDependencies([injected]), [`${pkg.name} depends on rsvelte_lint`]);
	}
});
