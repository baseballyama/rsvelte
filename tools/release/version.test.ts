import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { cargoVersion } from './stage.ts';
import { lockPaths, withCargoVersion, withLockVersion } from './version.ts';

test('only the workspace package version moves, not a dependency at the same version', () => {
	const manifest = [
		'[workspace]',
		'[workspace.package]',
		'version = "0.1.0"',
		'[workspace.dependencies]',
		'serde = { version = "0.1.0" }',
		'[profile.dist]',
		'version = "0.1.0"',
		'',
	].join('\n');
	const updated = withCargoVersion(manifest, '0.2.0');
	assert.equal(cargoVersion(updated), '0.2.0');
	assert.equal(
		updated,
		manifest.replace(
			'[workspace.package]\nversion = "0.1.0"',
			'[workspace.package]\nversion = "0.2.0"',
		),
	);
	assert.throws(() => withCargoVersion('[workspace.package]\nedition = "2024"\n', '0.2.0'));
});

test('only local lock entries move, not a registry crate at the same version', () => {
	const lock = [
		'version = 4',
		'',
		'[[package]]',
		'name = "rsvelte_command_line"',
		'version = "0.1.0"',
		'dependencies = [',
		' "tiny",',
		']',
		'',
		'[[package]]',
		'name = "tiny"',
		'version = "0.1.0"',
		'source = "registry+https://github.com/rust-lang/crates.io-index"',
		'',
	].join('\n');
	const updated = withLockVersion(lock, '0.1.0', '0.2.0');
	assert.equal(
		updated,
		lock.replace(
			'name = "rsvelte_command_line"\nversion = "0.1.0"',
			'name = "rsvelte_command_line"\nversion = "0.2.0"',
		),
	);
});

test('the workload lockfiles move with the root one', () => {
	const locks = new Set(
		lockPaths().map((lock) => path.relative(path.resolve(import.meta.dirname, '../..'), lock)),
	);
	assert.ok(locks.has('Cargo.lock'));
	assert.ok(locks.has(path.join('tools/performance/workloads/svelte-lint/Cargo.lock')));
});
