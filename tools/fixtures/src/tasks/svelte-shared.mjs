/** Warnings and errors keep what a user sees and drop the rendered frame. */
export function diagnostic(d) {
	return {
		code: d.code,
		message: d.message,
		start: d.start ? { line: d.start.line, column: d.start.column, character: d.start.character } : null,
		end: d.end ? { line: d.end.line, column: d.end.column, character: d.end.character } : null
	};
}

/** The oracle's output for one variant, as artifacts. A thrown compile error is itself the expected result. */
export function compileArtifacts(fn) {
	let result;
	try {
		result = fn();
	} catch (e) {
		if (!e.code) throw e;
		return { error: { text: JSON.stringify(diagnostic(e), null, '\t') + '\n', ext: 'error.json', compare: 'json' } };
	}
	const out = { js: { text: result.js.code, ext: 'js', compare: 'js-ast' } };
	if (result.css?.code) out.css = { text: result.css.code, ext: 'css', compare: 'text' };
	if (result.warnings.length) {
		out.warnings = {
			text: JSON.stringify(result.warnings.map(diagnostic), null, '\t') + '\n',
			ext: 'warnings.json',
			compare: 'json'
		};
	}
	return out;
}
