// Runs the extension in a real VS Code, against the rsvelte of this repository's debug build:
// `cargo build -p rsvelte_command_line --bin rsvelte`, then `node --run test:editor`.
// VSCODE_VERSION picks the version, by default the oldest one package.json accepts.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runTests } from '@vscode/test-electron';
import { bundle } from '../../build.ts';

const here = import.meta.dirname;
const extension = path.resolve(here, '../..');
const repository = path.resolve(extension, '../..');
const generated = path.join(extension, 'generated');
const executable = `rsvelte${process.platform === 'win32' ? '.exe' : ''}`;
const built = path.join(repository, 'target/debug', executable);
if (!fs.existsSync(built)) throw new Error(`${built} is missing; build it with cargo first`);

// A project that installs @rsvelte/cli, whose platform package holds the debug build. Outside
// this repository, whose oxfmt configuration would otherwise format it.
const scratch = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-vscode-')));
const workspace = path.join(scratch, 'workspace');
const files: Record<string, string> = {
	'package.json': '{ "private": true }',
	'.oxlintrc.json': fs.readFileSync(path.join(here, 'oxlintrc.json'), 'utf8'),
	'src/Lint.svelte': fs.readFileSync(path.join(here, 'Lint.svelte'), 'utf8'),
	'src/Format.svelte': fs.readFileSync(path.join(here, 'Format.svelte'), 'utf8'),
	'node_modules/@rsvelte/cli/package.json': '{ "name": "@rsvelte/cli", "type": "module" }',
	'node_modules/@rsvelte/cli/platforms.json': JSON.stringify({
		[`${process.platform}-${process.arch}`]: 'rsvelte-debug',
	}),
	'node_modules/@rsvelte/cli/bin/program.js': fs.readFileSync(
		path.join(repository, 'apps/cli/program.js'),
		'utf8',
	),
	'node_modules/rsvelte-debug/package.json': '{ "name": "rsvelte-debug" }',
};
for (const [file, text] of Object.entries(files)) {
	fs.mkdirSync(path.dirname(path.join(workspace, file)), { recursive: true });
	fs.writeFileSync(path.join(workspace, file), text);
}
fs.symlinkSync(built, path.join(workspace, 'node_modules/rsvelte-debug', executable));

await bundle('test/editor/suite.ts', 'generated/suite.cjs');
try {
	await runTests({
		version: process.env.VSCODE_VERSION ?? '1.91.0',
		cachePath: path.join(generated, 'vscode'),
		extensionDevelopmentPath: extension,
		extensionTestsPath: path.join(generated, 'suite.cjs'),
		launchArgs: [
			workspace,
			'--disable-extensions',
			'--disable-workspace-trust',
			'--skip-welcome',
			// Short, since a socket's path has at most 103 bytes on macOS.
			`--user-data-dir=${path.join(scratch, 'user')}`,
			`--extensions-dir=${path.join(scratch, 'extensions')}`,
		],
	});
} finally {
	fs.rmSync(scratch, { recursive: true, force: true });
}
