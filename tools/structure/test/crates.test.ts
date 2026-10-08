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

type Role = 'kernel' | 'core' | 'support' | 'host' | 'capability';

// Crate names do not follow paths (`rsvelte_svue`, `rsvelte_markup`), so the role comes from the path.
function role(manifestPath: string): Role | undefined {
	const path = /\/crates\/(.+)\/Cargo\.toml$/.exec(manifestPath)?.[1];
	if (path === undefined) return undefined;
	if (path === 'kernel') return 'kernel';
	if (path === 'fixture_test' || path === 'hosts/config' || path.startsWith('tooling/') ||
		path === 'languages/typescript/content_mapper') return 'support';
	if (path.startsWith('hosts/')) return 'host';
	if (/^languages\/[^/]+\/core$/.test(path) || /^languages\/svelte\/(syntax|parser|compiler_syntax_tree|semantic)$/.test(path)) {
		return 'core';
	}
	if (/^languages\/[^/]+\/[^/]+$/.test(path)) return 'capability';
	return undefined;
}

const roles = new Map(metadata.packages.map(pkg => [pkg.name, role(pkg.manifest_path)]));

const allowed: Record<Role, readonly Role[]> = {
	kernel: [],
	core: ['kernel', 'core'],
	support: ['kernel'],
	capability: ['kernel', 'core', 'support', 'capability'],
	host: ['kernel', 'core', 'support', 'capability'],
};

function toolDependencies(packages: Package[]): string[] {
	const failures: string[] = [];
	for (const pkg of packages) {
		const own = role(pkg.manifest_path);
		const accepts = own === undefined ? [] : allowed[own];
		for (const dependency of pkg.dependencies) {
			const target = roles.get(dependency.name);
			if (target !== undefined && !accepts.includes(target)) {
				failures.push(`${pkg.name} depends on ${dependency.name}`);
			}
		}
	}
	return failures;
}

function named(target: Role): string[] {
	return [...roles].filter(([, r]) => r === target).map(([name]) => name).sort();
}

test('every workspace crate has a role from its path', () => {
	assert.deepEqual([...roles].filter(([, r]) => r === undefined).map(([name]) => name), []);
	assert.deepEqual(named('kernel'), ['rsvelte_kernel']);
	assert.deepEqual(named('core'), [
		'rsvelte_markup', 'rsvelte_stylesheet', 'rsvelte_svelte', 'rsvelte_svelte_compiler_syntax_tree', 'rsvelte_svelte_parser',
		'rsvelte_svelte_semantic', 'rsvelte_svelte_syntax', 'rsvelte_typescript', 'rsvelte_vue',
	]);
	assert.deepEqual(named('support'), [
		'rsvelte_config', 'rsvelte_fixture_test', 'rsvelte_lint', 'rsvelte_typescript_content_mapper',
	]);
	assert.deepEqual(named('host'), ['rsvelte_command_line', 'rsvelte_kernel_browser']);
	assert.ok(named('capability').length > 0);
});

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
	rsvelte_svelte_compiler_syntax_tree: ['rsvelte_svelte_syntax'],
	rsvelte_svelte_semantic: ['rsvelte_svelte_compiler_syntax_tree'],
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
		['rsvelte_svelte_compiler_syntax_tree', 'rsvelte_svelte_parser'],
		['rsvelte_svelte_semantic', 'rsvelte_svelte_parser'],
		['rsvelte_svelte_compiler_syntax_tree', 'rsvelte_svelte'],
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
		const injected: Package = { ...kernel, dependencies: [...kernel.dependencies, { name }] };
		assert.deepEqual(toolDependencies([injected]), [`rsvelte_kernel depends on ${name}`]);
	}
	for (const pkg of metadata.packages.filter(pkg => pkg.manifest_path.includes('/core/'))) {
		const injected = { ...pkg, dependencies: [...pkg.dependencies, { name: 'rsvelte_lint' }] };
		assert.deepEqual(toolDependencies([injected]), [`${pkg.name} depends on rsvelte_lint`]);
	}
});

test('cores reject tools and hosts whatever their names end with', () => {
	const core = metadata.packages.find(pkg => pkg.name === 'rsvelte_svelte');
	assert.ok(core);
	for (const name of [
		'rsvelte_svue', 'rsvelte_svelte_lint_typed', 'rsvelte_svelte_typecheck',
		'rsvelte_svelte_typescript_projection', 'rsvelte_svelte_compile_vapor', 'rsvelte_command_line',
	]) {
		assert.ok(metadata.packages.some(pkg => pkg.name === name), `${name} exists`);
		const injected: Package = { ...core, dependencies: [...core.dependencies, { name }] };
		assert.deepEqual(toolDependencies([injected]), [`rsvelte_svelte depends on ${name}`]);
	}
});

test('new crates get a role from where they are placed', () => {
	for (const [path, expected] of [
		['/r/crates/languages/rust/core/Cargo.toml', 'core'],
		['/r/crates/languages/rust/lint/Cargo.toml', 'capability'],
		['/r/crates/hosts/editor/Cargo.toml', 'host'],
		['/r/crates/tooling/format/Cargo.toml', 'support'],
		['/r/crates/misc/thing/Cargo.toml', undefined],
		['/r/crates/languages/rust/lint/nested/Cargo.toml', undefined],
	] as const) {
		assert.equal(role(path), expected, path);
	}
});

test('support, plugin and host boundaries reject injected dependencies', () => {
	for (const [from, to] of [
		['rsvelte_lint', 'rsvelte_svelte'],
		['rsvelte_config', 'rsvelte_svelte_compile'],
		['rsvelte_typescript_content_mapper', 'rsvelte_typescript'],
		['rsvelte_svelte_lint', 'rsvelte_command_line'],
		['rsvelte_svue', 'rsvelte_kernel_browser'],
		['rsvelte_command_line', 'rsvelte_kernel_browser'],
	] as const) {
		const pkg = metadata.packages.find(pkg => pkg.name === from);
		assert.ok(pkg, from);
		assert.ok(roles.has(to), to);
		const injected = { ...pkg, dependencies: [...pkg.dependencies, { name: to }] };
		assert.deepEqual(toolDependencies([injected]), [`${from} depends on ${to}`]);
	}
});

test('a crate outside the known places cannot depend on workspace crates', () => {
	const injected = { name: 'rsvelte_new', manifest_path: '/r/crates/misc/new/Cargo.toml', dependencies: [{ name: 'rsvelte_kernel' }] };
	assert.deepEqual(toolDependencies([injected]), ['rsvelte_new depends on rsvelte_kernel']);
});
