#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { comparePopulation } from '../src/semantic/run.ts';

const { values } = parseArgs({ options: {
	inputs: { type: 'string' }, projector: { type: 'string' }, report: { type: 'string' },
	filter: { type: 'string' }, limit: { type: 'string' }
} });
const tools = path.resolve(import.meta.dirname, '..');
if (!values.report) throw new Error('--report <file> is required');
const report = await comparePopulation({
	tools,
	inputs: path.resolve(values.inputs ?? path.join(tools, '../../crates/languages/svelte/compile/tests/fixtures')),
	projector: path.resolve(values.projector ?? path.join(tools, '../../target/debug/examples/semantic')),
	onProgress: (count, input) => { if (count % 100 === 0) console.error(`${count} units: ${input}`); },
	...(values.filter === undefined ? {} : { filter: values.filter }),
	...(values.limit === undefined ? {} : { limit: Number(values.limit) })
});
fs.writeFileSync(values.report, JSON.stringify(report, null, '\t') + '\n');
const { rows, ...summary } = report;
console.log(JSON.stringify(summary, null, '\t'));
console.log(`report: ${path.resolve(values.report)} (${rows.length} units)`);
process.exitCode = report.units.mismatch > 0 ? 1 : report.queries.match === 0 ? 2 : 0;
