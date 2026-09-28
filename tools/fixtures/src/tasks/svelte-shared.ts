import type { Artifact } from '../types.ts';

interface Position {
	line: number;
	column: number;
	character: number;
}

interface Diagnostic {
	code: string;
	message: string;
	start?: Position;
	end?: Position;
}

const position = (p?: Position) => (p ? { line: p.line, column: p.column, character: p.character } : null);

/** Warnings and errors keep what a user sees and drop the rendered frame. */
export function diagnostic(d: Diagnostic) {
	return { code: d.code, message: d.message, start: position(d.start), end: position(d.end) };
}

interface CompileLike {
	js: { code: string };
	css: { code: string } | null;
	warnings: Diagnostic[];
}

/** The oracle's output for one variant, as artifacts. A thrown compile error is itself the expected result. */
export function compileArtifacts(fn: () => CompileLike): Record<string, Artifact> {
	let result: CompileLike;
	try {
		result = fn();
	} catch (e) {
		if (!(e as Diagnostic).code) throw e;
		return { error: { text: JSON.stringify(diagnostic(e as Diagnostic), null, '\t') + '\n', ext: 'error.json', compare: 'json' } };
	}
	const out: Record<string, Artifact> = { js: { text: result.js.code, ext: 'js', compare: 'js-ast' } };
	if (result.css?.code) out.css = { text: result.css.code, ext: 'css', compare: 'text' };
	if (result.warnings.length) {
		out.warnings = { text: JSON.stringify(result.warnings.map(diagnostic), null, '\t') + '\n', ext: 'warnings.json', compare: 'json' };
	}
	return out;
}
