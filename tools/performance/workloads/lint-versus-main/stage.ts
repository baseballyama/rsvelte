// `stage.ts <output directory>`: writes every Svelte component of the corpus to
// `<output>/files/<source>/<path>`, and their paths, sorted, to `<output>/inputs.txt`. Both arms
// read these files, so a rule that looks at the path or the files around it sees the same tree.
import fs from 'node:fs';
import path from 'node:path';
import { readPack } from '../../../oracle/pack.ts';

const root = path.resolve(import.meta.dirname, '../../../..');
const [outputDirectory] = process.argv.slice(2);
if (!outputDirectory) throw new Error('expected <output directory>');
const output = path.resolve(outputDirectory);
const corpus = path.join(root, 'corpus/svelte');

const inputs: string[] = [];
const sources: Record<string, number> = {};
for (const source of fs.readdirSync(corpus).toSorted()) {
	const pack = path.join(corpus, source, 'inputs.pack');
	if (!fs.existsSync(pack)) continue;
	for (const entry of readPack(pack)) {
		if (entry.attributes[0] !== 'svelte') continue;
		const file = path.join(output, 'files', source, entry.path);
		fs.mkdirSync(path.dirname(file), { recursive: true });
		fs.writeFileSync(file, entry.body);
		inputs.push(file);
		sources[source] = (sources[source] ?? 0) + 1;
	}
}
if (inputs.length === 0) throw new Error(`no component under ${corpus}`);
inputs.sort();
fs.writeFileSync(path.join(output, 'inputs.txt'), inputs.join('\n') + '\n');
const bytes = inputs.reduce((sum, file) => sum + fs.statSync(file).size, 0);
process.stdout.write(
	JSON.stringify({ components: inputs.length, bytes, sources }, null, '\t') + '\n',
);
