const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const location = require('./oracle-location.json');
const hook = new Module(location.bundle, module);
hook.paths = Module._nodeModulePaths(location.directory);
hook._compile(fs.readFileSync(path.join(__dirname, 'oracle-bundle.cjs'), 'utf8'), location.bundle);
const project = hook.exports;
const [root, rawRounds] = process.argv.slice(2);
const rounds = Number(rawRounds);
if (!Number.isSafeInteger(rounds) || rounds < 1) throw new Error('rounds must be positive');
const sources = fs.readdirSync(root).sort().map(name => fs.readFileSync(path.join(root, name, 'input.svelte'), 'utf8'));
if (!sources.length) throw new Error('empty population');
let outputs = 0, output_bytes = 0;
for (let round = 0; round < rounds; round++) for (const source of sources) {
  const result = project(source, {isTsFile: true, filename: 'Input.svelte'});
  if (typeof result.code !== 'string' || !result.code.length) throw new Error('the oracle returned no code');
  outputs++;
  output_bytes += Buffer.byteLength(result.code, 'utf8');
}
process.stdout.write(JSON.stringify({documents: sources.length, rounds, outputs, output_bytes}) + '\n');
