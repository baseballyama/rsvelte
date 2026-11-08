import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { TSCONFIG_FILE } from '../paths.ts';
import type { Artifact, Task, Unit } from '../types.ts';

const NODE_MODULES = path.resolve(import.meta.dirname, '../node_modules');
const SVELTE_CHECK = path.join(NODE_MODULES, 'svelte-check/bin/svelte-check');

interface Finding {
	filename: string;
	code: unknown;
	message: string;
	start: unknown;
	end: unknown;
}

/** One svelte-check run over a workspace holding every unit of a source at its own path. */
function check(units: Unit[]): Map<string, Record<string, Artifact>> {
	const ws = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'svelte-check-')));
	try {
		fs.copyFileSync(TSCONFIG_FILE, path.join(ws, 'tsconfig.json'));
		// Only `svelte` resolves, as for rsvelte, which is given the same package.
		fs.mkdirSync(path.join(ws, 'node_modules'));
		fs.symlinkSync(path.join(NODE_MODULES, 'svelte'), path.join(ws, 'node_modules/svelte'));
		for (const unit of units) {
			const file = path.join(ws, unit.path);
			fs.mkdirSync(path.dirname(file), { recursive: true });
			fs.writeFileSync(file, unit.src);
		}
		let stdout: string;
		try {
			stdout = execFileSync(
				process.execPath,
				[
					SVELTE_CHECK,
					'--workspace',
					ws,
					'--output',
					'machine-verbose',
					'--diagnostic-sources',
					'js',
				],
				{ encoding: 'utf8', maxBuffer: 1 << 30 },
			);
		} catch (e) {
			// Exit code 1 means "diagnostics found"; anything else is a failed run.
			const err = e as { status?: number; stdout?: string };
			if (err.status !== 1 || err.stdout === undefined) throw e;
			stdout = err.stdout;
		}
		const lines = stdout.split('\n').filter((l) => l.trim() !== '');
		if (!lines.some((l) => / COMPLETED /.test(l)))
			throw new Error(`svelte-check did not complete:\n${stdout}`);
		const byFile = new Map<string, Omit<Finding, 'filename'>[]>(
			units.filter((u) => u.lang === 'svelte').map((u) => [u.path, []]),
		);
		for (const line of lines) {
			const json = line.slice(line.indexOf(' ') + 1);
			if (!json.startsWith('{')) continue;
			const d = JSON.parse(json) as Finding;
			byFile
				.get(d.filename)
				?.push({ code: d.code, message: d.message, start: d.start, end: d.end });
		}
		return new Map(
			[...byFile].map(([file, findings]) => [
				file,
				{
					findings: {
						text: JSON.stringify(findings, null, '\t') + '\n',
						ext: 'json',
						compare: 'json',
					},
				},
			]),
		);
	} finally {
		fs.rmSync(ws, { recursive: true, force: true });
	}
}

// TypeScript diagnostics only (`--diagnostic-sources js`): compiler warnings belong to svelte.compile.
// A source is one project: a component sees the other units it imports.
const task: Task = {
	id: 'svelte.check',
	oracles: ['svelte-check', 'typescript', 'svelte'],
	variants: [{ id: 'default', options: {} }],
	appliesTo: (unit) => unit.lang === 'svelte',
	run: (unit) => check([unit]).get(unit.path)!,
	runSource: async (units) => check(units),
};
export default task;
