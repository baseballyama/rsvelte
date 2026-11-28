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
export function diagnostic(d: Diagnostic, locate: Locate = (p) => p) {
	return {
		code: d.code,
		message: d.message,
		start: position(d.start, locate),
		end: position(d.end, locate),
	};
}

/**
 * `code` with each lone surrogate written as its `\u` escape. A file holds UTF-8, where a lone
 * surrogate would become U+FFFD; the compiler writes one only inside a string or template literal,
 * where the escape is the same value.
 */
export const escapeLoneSurrogates = (code: string) =>
	code.replace(
		/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g,
		(unit) => `\\u${unit.charCodeAt(0).toString(16).toUpperCase()}`,
	);

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
		js: { text: escapeLoneSurrogates(result.js.code), ext: 'js', compare: 'js-ast' },
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
