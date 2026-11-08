// Runs every rsvelte task over every fixture unit, the check tasks with the oracle's own TypeScript 7
// and packages, for inspecting every task's output at once. `--binary` defaults to the release build.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import module from 'node:module';
import path from 'node:path';
import url from 'node:url';
import { parseArgs } from 'node:util';
import getExePath from './node_modules/typescript-7/lib/getExePath.js';
import { CORPUS, ROOT } from './paths.ts';

const options = (plugin: string, value: object) => ['--options', plugin, JSON.stringify(value)];
const pkg = (name: string) => fs.realpathSync(path.join(import.meta.dirname, 'node_modules', name));

export async function main(args: string[]): Promise<void> {
	const { values } = parseArgs({
		args,
		options: { binary: { type: 'string', default: path.join(ROOT, 'target/release/rsvelte') } },
	});
	const families = fs
		.readdirSync(CORPUS)
		.filter((d) => !d.startsWith('_') && fs.statSync(path.join(CORPUS, d)).isDirectory());
	const command = [
		'corpus',
		...families.map((f) => path.join(CORPUS, f)),
		...options('typescript.check', { command: [getExePath({ fs, module, path, url })] }),
		...options('svelte.check', { svelte: pkg('svelte') }),
		...options('vue.check', { vue: pkg('vue') }),
	];
	const r = spawnSync(values.binary, command, { stdio: 'inherit' });
	process.exit(r.status ?? 1);
}
