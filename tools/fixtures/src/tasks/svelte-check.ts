import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { sourceDir } from '../paths.ts';
import type { Task } from '../types.ts';

const SVELTE_CHECK = path.resolve(import.meta.dirname, '../../node_modules/svelte-check/bin/svelte-check');

// TypeScript diagnostics only (`--diagnostic-sources js`): compiler warnings belong to svelte.compile.
// The project configuration is the source directory's tsconfig.json, the same file rsvelte reads.
const task: Task = {
	id: 'svelte.check',
	storage: 'committed',
	oracles: ['svelte-check', 'typescript', 'svelte'],
	variants: [{ id: 'default', options: {} }],
	appliesTo: (unit) => unit.lang === 'svelte' && unit.source === 'rsvelte',
	run(unit, src) {
		const tsconfig = path.join(sourceDir(unit.family, unit.source), 'tsconfig.json');
		const ws = fs.mkdtempSync(path.join(os.tmpdir(), 'svelte-check-'));
		try {
			fs.copyFileSync(tsconfig, path.join(ws, 'tsconfig.json'));
			const file = path.join(ws, unit.path);
			fs.mkdirSync(path.dirname(file), { recursive: true });
			fs.writeFileSync(file, src);
			let stdout: string;
			try {
				stdout = execFileSync(process.execPath, [SVELTE_CHECK, '--workspace', ws, '--output', 'machine-verbose', '--diagnostic-sources', 'js'], {
					encoding: 'utf8'
				});
			} catch (e) {
				// Exit code 1 means "diagnostics found"; anything else is a failed run.
				const err = e as { status?: number; stdout?: string };
				if (err.status !== 1 || err.stdout === undefined) throw e;
				stdout = err.stdout;
			}
			const lines = stdout.split('\n').filter((l) => l.trim() !== '');
			if (!lines.some((l) => / COMPLETED /.test(l))) throw new Error(`svelte-check did not complete:\n${stdout}`);
			const findings = lines
				.map((l) => l.slice(l.indexOf(' ') + 1))
				.filter((l) => l.startsWith('{'))
				.map((l) => JSON.parse(l))
				.map((d) => {
					if (d.filename !== unit.path) throw new Error(`diagnostic for another file: ${d.filename}`);
					return { code: d.code, message: d.message, start: d.start, end: d.end };
				});
			return { findings: { text: JSON.stringify(findings, null, '\t') + '\n', ext: 'json', compare: 'json' } };
		} finally {
			fs.rmSync(ws, { recursive: true, force: true });
		}
	}
};
export default task;
