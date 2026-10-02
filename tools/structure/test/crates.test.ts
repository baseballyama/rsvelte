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
		if (pkg.name !== 'rsvelte_kernel' && !pkg.manifest_path.includes('/core/')) continue;
		for (const dependency of pkg.dependencies) {
			if (/_(compile|format|lint|check)$/.test(dependency.name)) {
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
