// `prepare.ts <lint-workload binary> <output-directory> [corpus source …]`: writes the populations,
// the rules and a `macos-cycles` configuration for each population.
//
// - `real.txt`: the hand-written compile cases; `corpus.txt`: every component of the named corpus
//   sources. A file that ESLint cannot parse is left out and named.
// - `rules.txt`: every eslint-plugin-svelte rule but the type-aware one, less the rules that throw
//   on one of the files and those that `lint-workload rules` says this crate does not implement.
// - `cycles-<population>.json`: the `rsvelte` and `eslint` arms over one population.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { configuration, linter, plugin, type Message } from './oracle.ts';

const root = path.resolve(import.meta.dirname, '../../../..');
const [binary, outputDirectory, ...sources] = process.argv.slice(2);
if (!binary || !outputDirectory)
	throw new Error('expected <lint-workload binary> <output-directory> [corpus source …]');
const workload = path.resolve(binary);
const output = path.resolve(outputDirectory);
fs.mkdirSync(output, { recursive: true });

function components(directory: string): string[] {
	return fs
		.readdirSync(directory, { withFileTypes: true })
		.toSorted((a, b) => (a.name < b.name ? -1 : 1))
		.flatMap((entry) => {
			const file = path.join(directory, entry.name);
			if (entry.isDirectory()) return components(file);
			return entry.name === 'input.svelte' ? [file] : [];
		});
}

const rules = Object.keys(plugin.rules)
	.filter((name) => !name.startsWith('@'))
	.map((name) => `svelte/${name}`);
const read = (file: string) => fs.readFileSync(file, 'utf8');
const populations: Record<string, string[]> = {
	real: components(path.join(root, 'crates/languages/svelte/compile/tests/fixtures/rsvelte')),
	corpus: sources.flatMap((source) => components(path.join(root, 'corpus/svelte', source))),
};
const unparsed: string[] = [];
for (const [name, files] of Object.entries(populations)) {
	populations[name] = files.filter((file) => {
		const fatal = linter
			.verify(read(file), configuration([]), { filename: file })
			.find((message: Message) => message.fatal);
		if (fatal) unparsed.push(`${file}: ${fatal.message}`);
		return !fatal;
	});
	fs.writeFileSync(path.join(output, `${name}.txt`), populations[name].join('\n') + '\n');
}
const throwing: string[] = [];
const all = Object.values(populations).flat();
let candidates = rules;
// One run of every candidate per file; a rule is looked for alone only on a file that throws.
for (const file of all) {
	const throws = (list: string[]) => {
		try {
			linter.verify(read(file), configuration(list), { filename: file });
			return undefined;
		} catch (error) {
			return (error as Error).message.split('\n')[0];
		}
	};
	if (throws(candidates) === undefined) continue;
	candidates = candidates.filter((rule) => {
		const message = throws([rule]);
		if (message !== undefined) throwing.push(`${rule} on ${path.relative(root, file)}: ${message}`);
		return message === undefined;
	});
}
const candidatesFile = path.join(output, 'candidates.txt');
fs.writeFileSync(candidatesFile, candidates.join('\n') + '\n');
const implemented = execFileSync(workload, ['rules', candidatesFile], { encoding: 'utf8' });
const rulesFile = path.join(output, 'rules.txt');
fs.writeFileSync(rulesFile, implemented);
const ruleCount = implemented.split('\n').filter(Boolean).length;
const oracle = path.join(import.meta.dirname, 'oracle.ts');
for (const [name, files] of Object.entries(populations)) {
	const inputs = path.join(output, `${name}.txt`);
	const rounds = 3;
	const config = {
		rounds,
		repetitions: 5,
		arms: [
			{ name: 'rsvelte', command: [workload, 'lint', rulesFile, inputs, String(rounds)] },
			{ name: 'eslint', command: [process.execPath, oracle, rulesFile, inputs, String(rounds)] },
		],
		expect_stdout: { documents: files.length, rules: ruleCount, rounds },
		minimum_output_bytes: 1,
	};
	fs.writeFileSync(
		path.join(output, `cycles-${name}.json`),
		JSON.stringify(config, null, '\t') + '\n',
	);
}
process.stdout.write(
	JSON.stringify(
		{
			real: populations.real!.length,
			corpus: populations.corpus!.length,
			sources,
			unparsed,
			candidates: candidates.length,
			rules: ruleCount,
			throwing,
			not_implemented: candidates.filter((rule) => !implemented.split('\n').includes(rule)),
		},
		null,
		'\t',
	) + '\n',
);
