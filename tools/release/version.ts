// Copies the version Changesets wrote for @rsvelte/cli into Cargo.toml and Cargo.lock, so
// `rsvelte --version` reports the version npm publishes.
import fs from 'node:fs';
import path from 'node:path';
import { cargoVersion } from './stage.ts';

const ROOT = path.resolve(import.meta.dirname, '../..');

/** The manifest Changesets versions; it is never published itself. */
export const VERSIONED = path.join(ROOT, 'apps/cli/package.json');

/** `manifest` with `version` as the `[workspace.package]` version. */
export function withCargoVersion(manifest: string, version: string): string {
	const section = /^\[workspace\.package\]$[\s\S]*?(?=^\[|$(?![\s\S]))/m.exec(manifest);
	if (!section) throw new Error('Cargo.toml has no [workspace.package]');
	const updated = section[0].replace(/^version = "[^"]+"$/m, `version = "${version}"`);
	if (updated === section[0]) throw new Error('Cargo.toml has no [workspace.package] version');
	return (
		manifest.slice(0, section.index) + updated + manifest.slice(section.index + section[0].length)
	);
}

/** `lock` with every local package (one with no `source`) at `from` moved to `to`. */
export function withLockVersion(lock: string, from: string, to: string): string {
	return lock
		.split('\n[[package]]\n')
		.map((block) =>
			/^source = /m.test(block)
				? block
				: block.replace(`\nversion = "${from}"\n`, `\nversion = "${to}"\n`),
		)
		.join('\n[[package]]\n');
}

export async function main(): Promise<void> {
	const version: string = JSON.parse(fs.readFileSync(VERSIONED, 'utf8')).version;
	const manifestPath = path.join(ROOT, 'Cargo.toml');
	const lockPath = path.join(ROOT, 'Cargo.lock');
	const manifest = fs.readFileSync(manifestPath, 'utf8');
	const current = cargoVersion(manifest);
	if (current === version) return;
	fs.writeFileSync(manifestPath, withCargoVersion(manifest, version));
	fs.writeFileSync(lockPath, withLockVersion(fs.readFileSync(lockPath, 'utf8'), current, version));
}
