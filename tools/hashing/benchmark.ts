import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = path.resolve(process.argv[2] ?? 'target/hashing-report');
const baselineRev = process.argv[3] ?? 'a25573c64087dd1f417321f19139b3edd709bf03';
fs.mkdirSync(output, { recursive: true });
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-hashing-'));
fs.mkdirSync(path.join(scratch, 'src'));
const run = (command: string, args: string[], options = {}) =>
    execFileSync(command, args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...options });
const baseline = run('git', ['show', `${baselineRev}:crates/kernel/src/source/hashing.rs`]);
const sourcePath = path.join(root, 'crates/kernel/src/source/hashing.rs');
const measuredSource = fs.readFileSync(sourcePath);
fs.writeFileSync(path.join(scratch, 'src/baseline.rs'), baseline);
fs.copyFileSync(path.join(root, 'tools/hashing/benchmark.rs'), path.join(scratch, 'src/main.rs'));
fs.writeFileSync(path.join(scratch, 'Cargo.toml'), `[package]
name = "rsvelte-hashing-comparison"
version = "0.0.0"
edition = "2024"
[dependencies]
rsvelte_kernel = { path = ${JSON.stringify(path.join(root, 'crates/kernel'))} }
sha2 = { version = "=0.11.0", default-features = false }
ring = "=0.17.14"
[profile.release]
lto = "thin"
codegen-units = 1
`);
const paths = run('rg', ['--files', 'crates', '-g', '*.vue']).trim().split('\n').sort();
fs.writeFileSync(path.join(output, 'paths.txt'), paths.join('\n') + '\n');
const env = { ...process.env, CARGO_TARGET_DIR: path.join(root, 'target/hashing-comparison') };
console.error(`Benchmark manifest: ${path.join(scratch, 'Cargo.toml')}`);
run('cargo', ['build', '--offline', '--release', '--manifest-path', path.join(scratch, 'Cargo.toml')], { env, stdio: 'inherit' });
fs.copyFileSync(path.join(scratch, 'Cargo.lock'), path.join(output, 'Cargo.lock'));
const binary = path.join(env.CARGO_TARGET_DIR, 'release/rsvelte-hashing-comparison');
const verification = run(binary, ['verify']);
fs.writeFileSync(path.join(output, 'verification.csv'), verification);
const verify = (actual: string, expected: string) => assert.equal(actual, expected);
assert.throws(() => verify('00'.repeat(32), createHash('sha256').update('').digest('hex')));
const populations = new Map<string, Set<number>>();
for (const line of verification.trim().split('\n')) {
    const [length, arm, digest] = line.split(',');
    const len = Number(length);
    assert(Number.isSafeInteger(len) && len >= 0, `${arm}: invalid length`);
    const input = Buffer.allocUnsafe(len);
    for (let i = 0; i < len; i++) input[i] = (i * 37 + len) & 255;
    verify(digest, createHash('sha256').update(input).digest('hex'));
    const lengths = populations.get(arm) ?? new Set<number>();
    assert(!lengths.has(len), `${arm}: duplicate length`);
    lengths.add(len);
    populations.set(arm, lengths);
}
assert.equal(populations.size, 5);
for (const [arm, lengths] of populations) assert.equal(lengths.size, 4099, arm);
const stdout = fs.openSync(path.join(output, 'timings.csv'), 'w');
const stderr = fs.openSync(path.join(output, 'allocations.log'), 'w');
try {
    run(binary, ['measure', path.join(output, 'paths.txt')], { stdio: ['ignore', stdout, stderr] });
} finally {
    fs.closeSync(stdout);
    fs.closeSync(stderr);
}
const median = (values: number[]) => {
    const sorted = values.toSorted((a, b) => a - b);
    return (sorted[Math.floor((sorted.length - 1) / 2)] + sorted[Math.floor(sorted.length / 2)]) / 2;
};
const groups = new Map<string, number[]>();
for (const line of fs.readFileSync(path.join(output, 'timings.csv'), 'utf8').trim().split('\n').slice(1)) {
    const [group, arm, , ns] = line.split(',');
    const value = Number(ns);
    assert(Number.isFinite(value) && value > 0);
    const key = `${group},${arm}`;
    const values = groups.get(key) ?? [];
    values.push(value);
    groups.set(key, values);
}
const summary = [...groups].map(([key, values]) => {
    assert.equal(values.length, 16, key);
    return `${key},${median(values).toFixed(3)},${Math.min(...values).toFixed(3)},${Math.max(...values).toFixed(3)}`;
});
fs.writeFileSync(path.join(output, 'summary.csv'), 'group,arm,median_ns,min_ns,max_ns\n' + summary.join('\n') + '\n');
const oracleRows = ['group,arm,round,ns_per_hash,iterations,population'];
let sink = 0;
const oracleGroups: [string, Buffer[]][] = [['paths', paths.map(p => Buffer.from(p))]];
for (const len of [32, 1024, 1048576]) oracleGroups.push([`bytes-${len}`, [Buffer.alloc(len, 'x')]]);
for (const [group, inputs] of oracleGroups) {
    const repeats = Math.max(1, Math.min(Math.floor(10000 / inputs.length), Math.floor(64000000 / inputs.reduce((sum, p) => sum + p.length, 0))));
    for (let round = 0; round < 16; round++) {
        const start = process.hrtime.bigint();
        for (let repeat = 0; repeat < repeats; repeat++) {
            for (const input of inputs) sink ^= createHash('sha256').update(input).digest()[0];
        }
        const ns = Number(process.hrtime.bigint() - start) / (repeats * inputs.length);
        oracleRows.push(`${group},node-crypto,${round},${ns},${repeats * inputs.length},${inputs.length}`);
    }
}
for (let round = 0; round < 16; round++) {
    const repeats = Math.max(1, Math.floor(10000 / paths.length));
    const start = process.hrtime.bigint();
    for (let repeat = 0; repeat < repeats; repeat++) {
        for (const input of paths) sink ^= createHash('sha256').update(input).digest('hex').slice(0, 8).charCodeAt(0);
    }
    const ns = Number(process.hrtime.bigint() - start) / (repeats * paths.length);
    oracleRows.push(`paths,node-scope-id,${round},${ns},${repeats * paths.length},${paths.length}`);
}
fs.writeFileSync(path.join(output, 'oracle.csv'), oracleRows.join('\n') + '\n');
assert(measuredSource.equals(fs.readFileSync(sourcePath)), 'the measured source changed during the run');
fs.writeFileSync(path.join(output, 'metadata.json'), JSON.stringify({
    head: run('git', ['rev-parse', 'HEAD']).trim(),
    baselineRev,
    baselineSha256: createHash('sha256').update(baseline).digest('hex'),
    currentSha256: createHash('sha256').update(measuredSource).digest('hex'),
    binarySha256: createHash('sha256').update(fs.readFileSync(binary)).digest('hex'),
    benchmarkSha256: createHash('sha256').update(fs.readFileSync(path.join(scratch, 'src/main.rs'))).digest('hex'),
    diffSha256: createHash('sha256').update(run('git', ['diff', '--binary'])).digest('hex'),
    paths: paths.length, rustc: run('rustc', ['--version']).trim(),
    node: process.version, openssl: process.versions.openssl,
    arch: process.arch, platform: process.platform, cpu: os.cpus()[0]?.model ?? 'UNMEASURED',
    measuredAt: new Date().toISOString(), rustflags: process.env.RUSTFLAGS ?? '',
    verifiedInputs: 4099, verifierPositiveControl: true, allocationCounterPositiveControl: true,
    instructionCount: 'UNMEASURED', oracleSink: sink,
}, null, 2) + '\n');
console.log(`Verified 4099 inputs for all five arms with Node crypto. Results: ${output}`);
