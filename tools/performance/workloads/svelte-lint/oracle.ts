// `oracle.ts <rules.txt> <inputs.txt> <rounds>`: ESLint with eslint-plugin-svelte, every rule in
// rules.txt on with its default options, over every input for `rounds` rounds. It prints the same
// summary fields as the Rust workload.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '../../../..');
const require = createRequire(path.join(root, 'tools/oracle/package.json'));
const { Linter } = require('eslint');
export const plugin = require('eslint-plugin-svelte').default;
const svelteParser = require('svelte-eslint-parser');
const globals = require('globals');

const lines = (file: string) =>
	fs
		.readFileSync(file, 'utf8')
		.split('\n')
		.filter((line) => line !== '');

// The configuration `oracle lint-cases` gives the lint crate's own cases.
export function configuration(rules: string[]): object[] {
	return [
		{
			files: ['**'],
			plugins: { svelte: plugin },
			rules: Object.fromEntries(rules.map((rule) => [rule, 'error'])),
			languageOptions: {
				globals: globals.browser,
				ecmaVersion: 'latest',
				sourceType: 'module',
				parser: svelteParser,
				parserOptions: { parser: { ts: '@typescript-eslint/parser', js: 'espree' } },
			},
		},
	];
}

export const linter = new Linter({ cwd: root });

export type Message = { fatal?: boolean; ruleId: string | null; message: string };

if (import.meta.main) {
	const [rulesFile, inputsFile, count] = process.argv.slice(2);
	if (!rulesFile || !inputsFile || !count)
		throw new Error('expected <rules.txt> <inputs.txt> <rounds>');
	const rounds = Number(count);
	if (!Number.isSafeInteger(rounds) || rounds <= 0) throw new Error('invalid rounds');
	const rules = lines(rulesFile);
	const config = configuration(rules);
	const documents = lines(inputsFile).map((filename) => ({
		filename,
		source: fs.readFileSync(filename, 'utf8'),
	}));
	const verify = (source: string, filename: string) => {
		const messages: Message[] = linter.verify(source, config, { filename });
		const fatal = messages.find((message: Message) => message.fatal);
		if (fatal) throw new Error(`${filename}: ${fatal.message}`);
		return messages;
	};
	if (
		!verify('<button></button>', path.join(root, 'control.svelte')).some(
			(message: Message) => message.ruleId === 'svelte/button-has-type',
		)
	)
		throw new Error('the missing type positive control did not report');
	let outputBytes = 0;
	let findings = 0;
	for (let round = 0; round < rounds; round++) {
		for (const document of documents) {
			const messages = verify(document.source, document.filename);
			findings += messages.length;
			outputBytes += Buffer.byteLength(JSON.stringify({ rules, findings: messages }));
		}
	}
	process.stdout.write(
		JSON.stringify({
			documents: documents.length,
			rules: rules.length,
			rounds,
			findings,
			output_bytes: outputBytes,
		}) + '\n',
	);
}
