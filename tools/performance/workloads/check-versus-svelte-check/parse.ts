// The findings each arm prints, as one shape the report compares.

import path from 'node:path';

export const TASK = 'ts.check/default';

export type Diagnostic = {
	file: string;
	line: number;
	column: number;
	code: string;
	message: string;
};
export type Parsed = {
	diagnostics: Diagnostic[];
	files: number | null;
	problem: string | null;
	/** Failures the checker reported instead of findings, by code. */
	failures: Record<string, number>;
};

/** The parsers of each arm's output, and how they name a file: relative to `workspace`. */
export function parsers(workspace: string) {
	const relative = (file: string) => path.relative(workspace, path.resolve(workspace, file));

	/** svelte-check's `machine-verbose` output: its TypeScript errors. */
	function parseSvelteCheck(stdout: string): Parsed {
		const diagnostics: Diagnostic[] = [];
		let completed: number | null = null;
		let problem: string | null = 'no COMPLETED line';
		for (const line of stdout.split('\n')) {
			const content = line.replace(/^\d+ /, '');
			const done = /^COMPLETED (\d+) FILES/.exec(content);
			if (done) {
				completed = Number(done[1]);
				problem = null;
			} else if (content.startsWith('FAILURE '))
				return { diagnostics, files: null, problem: content, failures: {} };
			else if (content.startsWith('{')) {
				const d = JSON.parse(content);
				if ((d.source === 'js' || d.source === 'ts') && d.type === 'ERROR')
					diagnostics.push({
						file: relative(d.filename),
						line: d.start?.line,
						column: d.start?.character,
						code: String(d.code),
						message: String(d.message).split('\n')[0]!,
					});
			}
		}
		return { diagnostics, files: completed, problem, failures: {} };
	}

	/** `rsvelte check`'s output: each document's findings under `// <file> <task> json`. */
	function parseRsvelte(stdout: string): Parsed {
		const diagnostics: Diagnostic[] = [];
		const failures: Record<string, number> = {};
		let documents = 0;
		let problem: string | null = null;
		const blocks = stdout.split(/^\/\/ /m).slice(1);
		for (const block of blocks) {
			const newline = block.indexOf('\n');
			const header = block.slice(0, newline);
			const body = block.slice(newline + 1);
			if (header.endsWith(' panic')) {
				problem = `panic: ${body.slice(0, 500)}`;
				continue;
			}
			const match = /^(.*) (\S+) (\S+)$/.exec(header);
			if (!match || match[2] !== TASK) throw new Error(`unexpected output header ${header}`);
			const [, file, , name] = match;
			const items = JSON.parse(body);
			if (name === 'json') {
				documents++;
				for (const f of items)
					diagnostics.push({
						file: relative(file!),
						line: f.start.line,
						column: f.start.character,
						code: String(f.code),
						message: String(f.message).split('\n')[0]!,
					});
			} else if (name === 'diagnostics') {
				for (const d of items) failures[d.code] = (failures[d.code] ?? 0) + 1;
			} else throw new Error(`unexpected output ${header}`);
		}
		for (const code of ['check_failed', 'check_unconfigured'])
			if (failures[code]) problem ??= `${code} on ${failures[code]} document(s)`;
		if (documents === 0) problem ??= 'no document was checked';
		return { diagnostics, files: documents, problem, failures };
	}

	return { parseRsvelte, parseSvelteCheck, relative };
}
