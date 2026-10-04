import fs from 'node:fs';
import path from 'node:path';
import compiler from '../../fixtures/node_modules/svelte/compiler/index.js';

const rounds = Number(process.argv[2]);
const root = path.resolve(process.argv[3]);
if (!Number.isSafeInteger(rounds) || rounds < 1) throw new Error('rounds must be a positive integer');
const cases = fs.readdirSync(root).sort().map(name => {
	const filename = path.join(root, name, 'input.svelte');
	return { filename, source: fs.readFileSync(filename, 'utf8') };
});
if (!cases.length) throw new Error('the input population is empty');
let bytes = 0;
let outputs = 0;
for (let round = 0; round < rounds; round++) {
	for (const { filename, source } of cases) {
		for (const generate of ['client', 'server']) {
			const result = compiler.compile(source, { filename, generate, runes: true });
			if (typeof result.js.code !== 'string') throw new TypeError('compiler output must be text');
			bytes += Buffer.byteLength(result.js.code, 'utf8');
			outputs++;
		}
	}
}
process.stdout.write(JSON.stringify({ oracle: compiler.VERSION, documents: cases.length, outputs, bytes }) + '\n');
