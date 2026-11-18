import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { cargoVersion, packageName, PLATFORMS, PROGRAMS, stage } from './stage.ts';

test('the version is the workspace package version, not a dependency version', () => {
	const manifest = [
		'[workspace]',
		'[workspace.package]',
		'edition = "2024"',
		'version = "1.2.3"',
		'[workspace.dependencies]',
		'serde = { version = "9.9.9" }',
	].join('\n');
	assert.equal(cargoVersion(manifest), '1.2.3');
	assert.throws(() => cargoVersion('[workspace.dependencies]\nversion = "9"\n'));
});

test(
	'the staged rsvelte starts the platform package installed beside it and passes its exit code',
	{
		skip: process.platform === 'win32' && 'the stand-in program is a shell script',
	},
	() => {
		const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-stage-'));
		try {
			const artifacts = path.join(root, 'artifacts');
			for (const platform of PLATFORMS)
				for (const program of PROGRAMS) {
					const file = path.join(
						artifacts,
						platform.target,
						`${program}${platform.os === 'win32' ? '.exe' : ''}`,
					);
					fs.mkdirSync(path.dirname(file), { recursive: true });
					fs.writeFileSync(file, '#!/bin/sh\necho "$0 $*"\nexit 3\n');
				}
			const order = stage(artifacts, path.join(root, 'out'), '1.2.3');
			assert.equal(order.length, PLATFORMS.length + 1);
			assert.equal(path.basename(order.at(-1)!), 'rsvelte', 'rsvelte is published last');
			const manifest = JSON.parse(
				fs.readFileSync(path.join(order.at(-1)!, 'package.json'), 'utf8'),
			);
			assert.deepEqual(
				Object.keys(manifest.optionalDependencies).toSorted(),
				PLATFORMS.map(packageName).toSorted(),
			);
			assert.ok(Object.values(manifest.optionalDependencies).every((v) => v === '1.2.3'));

			// Lay the packages out as npm installs them, with this machine's platform package only.
			const here = PLATFORMS.find((p) => p.os === process.platform && p.cpu === process.arch);
			assert.ok(here, `no platform package for ${process.platform}-${process.arch}`);
			const modules = path.join(root, 'project/node_modules');
			fs.mkdirSync(path.join(modules, '@rsvelte'), { recursive: true });
			fs.cpSync(order.at(-1)!, path.join(modules, 'rsvelte'), { recursive: true });
			fs.cpSync(
				path.join(root, 'out', `cli-${here.suffix}`),
				path.join(modules, packageName(here)),
				{
					recursive: true,
				},
			);
			const run = spawnSync(
				process.execPath,
				[path.join(modules, 'rsvelte/bin/rsvelte.js'), 'lint', 'a b'],
				{ encoding: 'utf8' },
			);
			assert.equal(run.status, 3, run.stderr);
			assert.equal(
				run.stdout.trim(),
				`${fs.realpathSync(path.join(modules, packageName(here), 'rsvelte'))} lint a b`,
			);
			fs.rmSync(path.join(modules, packageName(here)), { recursive: true });
			const missing = spawnSync(process.execPath, [path.join(modules, 'rsvelte/bin/rsvelte.js')], {
				encoding: 'utf8',
			});
			assert.equal(missing.status, 1);
			assert.match(missing.stderr, /is not installed/);
		} finally {
			fs.rmSync(root, { recursive: true, force: true });
		}
	},
);
