import type { Artifact } from '../types.ts';

export interface Position {
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

/** Where a position of the compiled text is in the source, when the compiler read a derived text. */
type Locate = (p: Position) => Position;

const position = (p: Position | undefined, locate: Locate) => {
	if (!p) return null;
	const { line, column, character } = locate(p);
	return { line, column, character };
};

/** Warnings and errors keep what a user sees and drop the rendered frame. */
function diagnostic(d: Diagnostic, locate: Locate) {
	return {
		code: d.code,
		message: d.message,
		start: position(d.start, locate),
		end: position(d.end, locate),
	};
}

interface CompileLike {
	js: { code: string };
	css: { code: string } | null;
	warnings: Diagnostic[];
}

/** The oracle's output for one variant, as artifacts. A thrown compile error is itself the expected result. */
export function compileArtifacts(
	fn: () => CompileLike,
	locate: Locate = (p) => p,
): Record<string, Artifact> {
	let result: CompileLike;
	try {
		result = fn();
	} catch (e) {
		if (!(e as Diagnostic).code) throw e;
		return {
			error: {
				text: JSON.stringify(diagnostic(e as Diagnostic, locate), null, '\t') + '\n',
				ext: 'error.json',
				compare: 'json',
			},
		};
	}
	const out: Record<string, Artifact> = {
		js: { text: result.js.code, ext: 'js', compare: 'js-ast' },
	};
	if (result.css?.code) out.css = { text: result.css.code, ext: 'css', compare: 'text' };
	if (result.warnings.length) {
		out.warnings = {
			text:
				JSON.stringify(
					result.warnings.map((w) => diagnostic(w, locate)),
					null,
					'\t',
				) + '\n',
			ext: 'warnings.json',
			compare: 'json',
		};
	}
	return out;
}
