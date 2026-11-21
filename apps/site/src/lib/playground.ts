// Runs the Svelte tasks of the browser host's WebAssembly build on one component.

/** A 1-based line and column, in UTF-16 code units. */
type Position = { line: number; column: number };
type Diagnostic = {
	code: string;
	message: string;
	severity: string;
	start: Position;
	end: Position;
};
export type Step = {
	id: string;
	files: { name: string; text: string }[];
	diagnostics: Diagnostic[];
};
export type Result = { ok: true; steps: Step[] } | { ok: false; message: string };

export const operations = [
	{ id: 'lint', label: 'Lint' },
	{ id: 'format', label: 'Format' },
	{ id: 'compile-client', label: 'Compile for the client' },
	{ id: 'compile-server', label: 'Compile for the server' },
] as const;
export type Operation = (typeof operations)[number]['id'];

export const example = `<script>
  let count = $state(0);
  let unused = 1;
</script>

<button onclick={() => count++}>
  Count: {count}
</button>
`;

/** One problem, from a diagnostic or from a finding in a lint task's `lint.json`. */
export type Problem = {
	start: Position;
	end: Position;
	rule: string | null;
	message: string;
	severity: 'error' | 'warning';
};
/** What a step shows: the files it wrote and the problems it found. */
export type View = { files: { name: string; text: string }[]; problems: Problem[] };

type LintFile = {
	// A finding of no rule is a parse error or an unused directive comment.
	findings: { rule: string | null; message: string; start: Position; end: Position }[];
};

export function view(step: Step): View {
	const problems: Problem[] = step.diagnostics.map((d) => ({
		start: d.start,
		end: d.end,
		rule: d.code,
		message: d.message,
		severity: d.severity === 'error' ? 'error' : 'warning',
	}));
	const files = [];
	for (const file of step.files) {
		if (file.name !== 'lint.json') {
			files.push(file);
			continue;
		}
		const lint: LintFile = JSON.parse(file.text);
		for (const finding of lint.findings)
			// `lint.json` has no severity; a finding reads as a warning, a source error as an error.
			problems.push({ ...finding, severity: 'warning' });
	}
	return { files, problems };
}

/** Loads the WebAssembly build; call it in the browser only. */
export async function load(): Promise<(source: string, operation: Operation) => Result> {
	const wasm = await import('#generated/wasm/rsvelte_browser.js');
	await wasm.default();
	return (source, operation) => {
		try {
			return JSON.parse(wasm.runPipeline(source, 'App.svelte', 'svelte', operation, true));
		} catch (error) {
			// A panic traps the WebAssembly instance, which may not run correctly again.
			return { ok: false, message: `${String(error)} (reload the page)` };
		}
	};
}
