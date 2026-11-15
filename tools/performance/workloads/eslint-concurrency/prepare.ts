// `prepare.ts <stage>`: turns a stage of lint-versus-main's `stage.ts` into an ESLint project.
// It keeps the components the ESLint arm of that workload linted (every staged one but those in
// `excluded.tsv`), and writes `<stage>/eslint.config.mjs` with the arm's rules and parsers.
import fs from 'node:fs';
import path from 'node:path';

const here = import.meta.dirname;
const root = path.resolve(here, '../../../..');
const [stageArgument] = process.argv.slice(2);
if (!stageArgument) throw new Error('expected <stage>');
const stage = path.resolve(stageArgument);
const files = path.join(stage, 'files');

const lines = (file: string) =>
	fs
		.readFileSync(file, 'utf8')
		.split('\n')
		.filter((line) => line !== '');

// The ESLint run that `excluded.tsv` and `rules.txt` come from staged under this directory.
const recorded = '/home/runner/work/_temp/stage/files/';
const excluded = lines(path.join(here, 'excluded.tsv')).map((row) => {
	const file = row.split('\t')[0]!;
	if (!file.startsWith(recorded)) throw new Error(`unexpected path ${file}`);
	return path.join(files, file.slice(recorded.length));
});
for (const file of excluded) {
	if (!fs.existsSync(file)) throw new Error(`excluded ${file} is not staged`);
	fs.rmSync(file);
}
const inputs = lines(path.join(stage, 'inputs.txt')).filter((file) => fs.existsSync(file));
fs.writeFileSync(path.join(stage, 'linted.txt'), inputs.join('\n') + '\n');

const rules = lines(path.join(here, 'rules.txt'));
const oracle = path.join(root, 'tools/oracle/package.json');
const config = `import { createRequire } from 'node:module';
const require = createRequire(${JSON.stringify(oracle)});
const plugin = require('eslint-plugin-svelte').default;
export default [
	{
		files: ['**/*.svelte'],
		plugins: { svelte: plugin },
		linterOptions: { reportUnusedDisableDirectives: 'off' },
		rules: ${JSON.stringify(Object.fromEntries(rules.map((rule) => [rule, 'error'])))},
		languageOptions: {
			parser: require('svelte-eslint-parser'),
			parserOptions: { parser: require('@typescript-eslint/parser'), svelteFeatures: { runes: true } },
		},
	},
];
`;
fs.writeFileSync(path.join(stage, 'eslint.config.mjs'), config);
process.stdout.write(
	JSON.stringify({
		staged: inputs.length + excluded.length,
		excluded: excluded.length,
		linted: inputs.length,
		rules: rules.length,
	}) + '\n',
);
