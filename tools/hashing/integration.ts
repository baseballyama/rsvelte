import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import task from '../fixtures/src/tasks/vue-compile.ts';
import type { Unit } from '../fixtures/src/types.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const [before, after, output] = process.argv.slice(2).map(p => path.resolve(p));
assert(before && after && output, 'usage: integration.ts <before binary> <after binary> <output directory>');
fs.mkdirSync(output, { recursive: true });
const population = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-hashing-vue-'));
const cases = path.join(root, 'crates/languages/vue/compile/tests/fixtures');
const units: { unit: Unit; src: string }[] = [];
for (const name of fs.readdirSync(cases).sort()) {
    const input = path.join(cases, name, 'input.vue');
    if (!fs.existsSync(input)) continue;
    const src = fs.readFileSync(input, 'utf8');
    const filename = `${name}.vue`;
    fs.mkdirSync(path.join(population, filename));
    fs.writeFileSync(path.join(population, filename, 'input.vue'), src);
    units.push({ src, unit: {
        family: 'vue', source: 'crate-tests', path: filename, lang: 'vue', ext: '.vue',
        sha256: createHash('sha256').update(src).digest('hex'), mode: '', fixture: {},
    } });
}
assert(units.length > 0, 'the population must not be empty');
const binaries = { before, after };
const records: { round: number; arm: string; serial_ms: number[]; shared_ms: number[] }[] = [];
let outputBytes: number | undefined;
for (let round = 0; round < 12; round++) {
    const order: ('before' | 'after')[] = round % 4 === 0 || round % 4 === 3 ? ['before', 'after'] : ['after', 'before'];
    for (const arm of order) {
        const file = path.join(output, `${arm}-${round}.json`);
        execFileSync(binaries[arm], ['benchmark', population, '--task', 'vue.compile/default', 'rounds=64', `json=${file}`], { stdio: 'pipe' });
        const report = JSON.parse(fs.readFileSync(file, 'utf8'));
        const counts = report.population.tasks['vue.compile/default'];
        assert.equal(counts.ran, units.length);
        assert.equal(counts.clean, units.length);
        assert.equal(report.population.panicked.length, 0);
        assert.equal(report.population.skipped, 0);
        assert(report.population.output_bytes > 0);
        outputBytes ??= report.population.output_bytes;
        assert.equal(report.population.output_bytes, outputBytes);
        records.push({ round, arm,
            serial_ms: report.arms.find((a: { name: string }) => a.name === 'serial').wall_ms,
            shared_ms: report.arms.find((a: { name: string }) => a.name === 'shared').wall_ms,
        });
    }
}
let sink = 0;
const run = async () => {
    for (const { unit, src } of units) {
        const out = await task.run(unit, src, task.variants[0]);
        assert(out.js.text.length > 0);
        sink += out.js.text.length;
    }
};
for (let i = 0; i < 8; i++) await run();
const officialMs: number[] = [];
for (let i = 0; i < 64; i++) {
    const start = performance.now();
    await run();
    officialMs.push(performance.now() - start);
}
const hashes = Object.fromEntries(Object.entries(binaries).map(([arm, binary]) =>
    [arm, createHash('sha256').update(fs.readFileSync(binary)).digest('hex')]));
fs.writeFileSync(path.join(output, 'integration.json'), JSON.stringify({
    head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    population: units.length, inputBytes: units.reduce((sum, u) => sum + Buffer.byteLength(u.src), 0), outputBytes,
    rounds: 12, innerRounds: 64, binarySha256: hashes, records,
    cpu: os.cpus()[0]?.model ?? 'UNMEASURED', node: process.version,
    official: {
        compilerSfc: JSON.parse(fs.readFileSync(path.join(root, 'tools/fixtures/node_modules/@vue/compiler-sfc/package.json'), 'utf8')).version,
        typescript: JSON.parse(fs.readFileSync(path.join(root, 'tools/fixtures/node_modules/typescript/package.json'), 'utf8')).version,
        timesMs: officialMs, sink,
    },
}, null, 2) + '\n');
console.log(`Measured ${units.length} units. Results: ${output}`);
