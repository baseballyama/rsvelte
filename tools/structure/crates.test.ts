import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { test } from 'node:test';

type Package = {
	name: string;
	manifest_path: string;
	dependencies: { name: string }[];
};

const root = resolve(import.meta.dirname, '../..');
const metadata = JSON.parse(
	execFileSync('cargo', ['metadata', '--offline', '--no-deps', '--format-version', '1'], {
		cwd: root,
		encoding: 'utf8',
	}),
) as { packages: Package[] };

type Role =
	| 'kernel'
	| 'syntax'
	| 'semantic'
	| 'support'
	| 'host_library'
	| 'host'
	| 'capability'
	| 'example';

function role(manifestPath: string): Role | undefined {
	// No role accepts an example, so nothing can depend on code that exists to be read.
	if (/\/examples\/[^/]+\/Cargo\.toml$/.test(manifestPath) && !manifestPath.includes('/crates/'))
		return 'example';
	const path = /\/crates\/(.+)\/Cargo\.toml$/.exec(manifestPath)?.[1];
	if (path === undefined) return undefined;
	if (path === 'language_independent/kernel') return 'kernel';
	if (path.startsWith('language_independent/') || path === 'languages/typescript/content_mapper')
		return 'support';
	// Only hosts load configuration files; a plugin reads its options through the plugin interface.
	if (path === 'hosts/configuration_loading') return 'host_library';
	if (path.startsWith('hosts/')) return 'host';
	if (/^languages\/[^/]+\/syntax$/.test(path)) return 'syntax';
	if (/^languages\/[^/]+\/semantic$/.test(path)) return 'semantic';
	if (/^languages\/[^/]+\/[^/]+$/.test(path)) return 'capability';
	return undefined;
}

const roles = new Map(metadata.packages.map((pkg) => [pkg.name, role(pkg.manifest_path)]));

// Trees know no analysis, and analysis knows no tool.
const allowed: Record<Role, readonly Role[]> = {
	kernel: [],
	syntax: ['kernel', 'syntax'],
	semantic: ['kernel', 'syntax', 'semantic'],
	support: ['kernel'],
	host_library: ['kernel', 'support'],
	capability: ['kernel', 'syntax', 'semantic', 'support', 'capability'],
	host: ['kernel', 'syntax', 'semantic', 'support', 'host_library', 'capability'],
	example: ['kernel', 'syntax', 'semantic', 'support', 'capability'],
};

function forbiddenDependencies(packages: Package[]): string[] {
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
	return [...roles]
		.filter(([, r]) => r === target)
		.map(([name]) => name)
		.toSorted();
}

function inject(from: string, to: string): string[] {
	assert.ok(roles.has(to), `${to} exists`);
	const pkg = metadata.packages.find((candidate) => candidate.name === from);
	assert.ok(pkg, `${from} exists`);
	return forbiddenDependencies([{ ...pkg, dependencies: [...pkg.dependencies, { name: to }] }]);
}

// The name says the path, so a crate is found from either. Identifiers spell out `css` and `html`
// (apps/site/scripts/code-names.ts); only the language directories keep the short names.
const spelled: Record<string, string> = { css: 'stylesheet', html: 'markup' };
function expectedName(manifestPath: string): string | undefined {
	const [, language, directory] =
		/\/crates\/languages\/([^/]+)\/([^/]+)\/Cargo\.toml$/.exec(manifestPath) ?? [];
	if (language === undefined || directory === undefined) return undefined;
	return `rsvelte_${spelled[language] ?? language}_${directory}`;
}

test('every workspace crate has a role from its path', () => {
	assert.deepEqual(
		[...roles].filter(([, r]) => r === undefined).map(([name]) => name),
		[],
	);
	assert.deepEqual(named('kernel'), ['rsvelte_kernel']);
	assert.deepEqual(named('syntax'), [
		'rsvelte_markup_syntax',
		'rsvelte_stylesheet_syntax',
		'rsvelte_svelte_syntax',
		'rsvelte_typescript_syntax',
		'rsvelte_vue_syntax',
	]);
	assert.deepEqual(named('semantic'), [
		'rsvelte_stylesheet_semantic',
		'rsvelte_svelte_semantic',
		'rsvelte_typescript_semantic',
		'rsvelte_vue_semantic',
	]);
	assert.deepEqual(named('support'), [
		'rsvelte_corpus',
		'rsvelte_document_printer',
		'rsvelte_lint_runner',
		'rsvelte_plugin_interface',
		'rsvelte_test_harness',
		'rsvelte_typescript_content_mapper',
	]);
	assert.deepEqual(named('host_library'), ['rsvelte_configuration_loading']);
	assert.deepEqual(named('host'), [
		'rsvelte_command_line',
		'rsvelte_kernel_browser',
		'rsvelte_site',
	]);
	assert.ok(named('capability').length > 0);
	assert.deepEqual(named('example'), ['rsvelte_example_plugin']);
});

test('every language crate is named for its path', () => {
	const misnamed = metadata.packages
		.map((pkg) => [pkg.name, expectedName(pkg.manifest_path)] as const)
		.filter(([name, expected]) => expected !== undefined && name !== expected);
	assert.deepEqual(misnamed, []);
	assert.equal(
		expectedName('/r/crates/languages/vue/compile_svelte/Cargo.toml'),
		'rsvelte_vue_compile_svelte',
	);
	assert.equal(
		expectedName('/r/crates/languages/css/syntax/Cargo.toml'),
		'rsvelte_stylesheet_syntax',
	);
	assert.equal(expectedName('/r/crates/hosts/browser/Cargo.toml'), undefined);
});

test('no crate depends on a crate its role does not accept', () => {
	assert.deepEqual(forbiddenDependencies(metadata.packages), []);
});

test('syntax rejects analysis, tools and hosts', () => {
	for (const to of [
		'rsvelte_svelte_semantic',
		'rsvelte_typescript_semantic',
		'rsvelte_svelte_format',
		'rsvelte_stylesheet_compile',
		'rsvelte_lint_runner',
		'rsvelte_command_line',
	]) {
		assert.deepEqual(inject('rsvelte_svelte_syntax', to), [
			`rsvelte_svelte_syntax depends on ${to}`,
		]);
	}
	assert.deepEqual(inject('rsvelte_svelte_syntax', 'rsvelte_stylesheet_syntax'), []);
});

test('semantic rejects tools and hosts whatever their names end with', () => {
	for (const to of [
		'rsvelte_stylesheet_compile',
		'rsvelte_markup_lint',
		'rsvelte_svelte_compile',
		'rsvelte_svelte_lint_typed',
		'rsvelte_svelte_check',
		'rsvelte_svelte_typescript_projection',
		'rsvelte_vue_compile_svelte',
		'rsvelte_lint_runner',
		'rsvelte_command_line',
	]) {
		assert.deepEqual(inject('rsvelte_svelte_semantic', to), [
			`rsvelte_svelte_semantic depends on ${to}`,
		]);
	}
	assert.deepEqual(inject('rsvelte_vue_semantic', 'rsvelte_svelte_semantic'), []);
});

test('the kernel rejects language data and shared task contracts', () => {
	for (const to of [
		'rsvelte_svelte_syntax',
		'rsvelte_typescript_semantic',
		'rsvelte_lint_runner',
	]) {
		assert.deepEqual(inject('rsvelte_kernel', to), [`rsvelte_kernel depends on ${to}`]);
	}
});

test('new crates get a role from where they are placed', () => {
	for (const [path, expected] of [
		['/r/crates/languages/rust/syntax/Cargo.toml', 'syntax'],
		['/r/crates/languages/rust/semantic/Cargo.toml', 'semantic'],
		['/r/crates/languages/rust/lint/Cargo.toml', 'capability'],
		['/r/crates/languages/rust/core/Cargo.toml', 'capability'],
		['/r/crates/hosts/editor/Cargo.toml', 'host'],
		['/r/crates/language_independent/document_printer/Cargo.toml', 'support'],
		['/r/examples/plugin/Cargo.toml', 'example'],
		['/r/crates/misc/thing/Cargo.toml', undefined],
		['/r/crates/languages/rust/examples/thing/Cargo.toml', undefined],
		['/r/crates/languages/rust/lint/nested/Cargo.toml', undefined],
	] as const) {
		assert.equal(role(path), expected, path);
	}
});

test('support, plugin and host boundaries reject injected dependencies', () => {
	for (const [from, to] of [
		['rsvelte_lint_runner', 'rsvelte_svelte_syntax'],
		['rsvelte_plugin_interface', 'rsvelte_svelte_compile'],
		['rsvelte_svelte_compile', 'rsvelte_configuration_loading'],
		['rsvelte_svelte_compile', 'rsvelte_example_plugin'],
		['rsvelte_example_plugin', 'rsvelte_command_line'],
		['rsvelte_plugin_interface', 'rsvelte_configuration_loading'],
		['rsvelte_typescript_content_mapper', 'rsvelte_typescript_syntax'],
		['rsvelte_svelte_lint', 'rsvelte_command_line'],
		['rsvelte_vue_compile_svelte', 'rsvelte_kernel_browser'],
		['rsvelte_command_line', 'rsvelte_kernel_browser'],
	] as const) {
		assert.deepEqual(inject(from, to), [`${from} depends on ${to}`]);
	}
});

test('a crate outside the known places cannot depend on workspace crates', () => {
	const injected = {
		name: 'rsvelte_new',
		manifest_path: '/r/crates/misc/new/Cargo.toml',
		dependencies: [{ name: 'rsvelte_kernel' }],
	};
	assert.deepEqual(forbiddenDependencies([injected]), ['rsvelte_new depends on rsvelte_kernel']);
});
