import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, it } from 'vitest';
import { crateSizes } from './source-plugin';

it('counts workspace crates in nested directories using their package names', () => {
	const root = mkdtempSync(path.join(tmpdir(), 'rsvelte-crate-sizes-'));
	try {
		writeFileSync(path.join(root, 'Cargo.toml'), '[workspace]\nmembers = ["crates/kernel", "crates/languages/svelte/core"]\nresolver = "3"\n');
		for (const [directory, name] of [
			['kernel', 'rsvelte_kernel'],
			['languages/svelte/core', 'rsvelte_svelte']
		]) {
			const crateDir = path.join(root, 'crates', directory);
			mkdirSync(path.join(crateDir, 'src', 'syntax'), { recursive: true });
			writeFileSync(path.join(crateDir, 'Cargo.toml'), `[package]\nname = "${name}"\nversion = "0.0.0"\nedition = "2024"\n`);
			writeFileSync(path.join(crateDir, 'src/lib.rs'), 'pub fn run() {}\n');
			writeFileSync(path.join(crateDir, 'src/syntax/tests.rs'), '#[test]\nfn works() {}\n');
			writeFileSync(path.join(crateDir, 'src/notes.txt'), 'not Rust\n');
		}
		mkdirSync(path.join(root, 'crates/apps/site'), { recursive: true });
		expect(crateSizes(path.join(root, 'crates'))).toEqual([
			{ name: 'rsvelte_kernel', files: 2, lines: 3 },
			{ name: 'rsvelte_svelte', files: 2, lines: 3 }
		]);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
