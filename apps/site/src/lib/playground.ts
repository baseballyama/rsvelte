// Runs the Svelte tasks of the browser host's WebAssembly build on one component.

type Diagnostic = {
	code: string;
	message: string;
	severity: string;
	line: number;
	column: number;
};
export type Step = {
	id: string;
	files: { name: string; text: string }[];
	diagnostics: Diagnostic[];
};
export type Result = { ok: true; steps: Step[] } | { ok: false; message: string };

export const operations = [
	{ id: 'compile-client', label: 'クライアント向けコンパイル' },
	{ id: 'compile-server', label: 'サーバー向けコンパイル' },
	{ id: 'format', label: '整形' },
	{ id: 'lint', label: 'コード検査' },
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
type Problem = { line: number; column: number; rule: string; message: string };
/** What a step shows: the files it wrote and the problems it found. */
export type View = { files: { name: string; text: string }[]; problems: Problem[] };

type LintFile = {
	findings: { rule: string; message: string; start: { line: number; column: number } }[];
};

export function view(step: Step): View {
	const problems: Problem[] = step.diagnostics.map((d) => ({
		line: d.line,
		column: d.column,
		rule: d.code,
		message: d.message,
	}));
	const files = [];
	for (const file of step.files) {
		if (file.name !== 'lint.json') {
			files.push(file);
			continue;
		}
		const lint: LintFile = JSON.parse(file.text);
		for (const finding of lint.findings)
			problems.push({ ...finding.start, rule: finding.rule, message: finding.message });
	}
	return { files, problems };
}

type Run = (
	source: string,
	filename: string,
	plugins: string,
	tasks: string,
	shared: boolean,
) => string;

/** Loads the WebAssembly build; call it in the browser only. */
export async function load(): Promise<(source: string, operation: Operation) => Result> {
	const wasm = await import('#generated/wasm/rsvelte_browser.js');
	await wasm.default();
	const run: Run = wasm.runPipeline;
	return (source, operation) => JSON.parse(run(source, 'App.svelte', 'svelte', operation, true));
}
