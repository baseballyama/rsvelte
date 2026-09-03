#!/usr/bin/env node
// Positive and negative controls for `attribution-progress-check.mjs`. Each case
// differs from the passing tree by one edit, so a gate that cannot say "no" is
// visible here rather than in a green run six months from now.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CHECK = path.join(HERE, 'attribution-progress-check.mjs');

function run(files) {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'attr-progress-'));
	for (const [name, body] of Object.entries(files))
		fs.writeFileSync(path.join(dir, name), typeof body === 'string' ? body : JSON.stringify(body));
	try {
		const out = execFileSync(process.execPath, [CHECK], {
			env: { ...process.env, ATTRIBUTION_DIR: dir },
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'pipe'],
		});
		return { code: 0, out };
	} catch (error) {
		return { code: error.status, out: (error.stdout ?? '') + (error.stderr ?? '') };
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
}

const PASSING = {
	'attribution-pending.json': ['a-known-failures.json', 'b-known-failures.json'],
	'a-known-failures.json': ['one', 'two', 'three'],
	'b-known-failures.json': ['four'],
	'attribution-progress.json': {
		'a-known-failures.json': [
			{ id: 'one', issue: 1, port: 'module', mechanism: 'should_proxy allow-list' },
			{ id: 'two', issue: 1, port: 'module', mechanism: 'should_proxy allow-list' },
			{ id: 'three', issue: 2, port: 'component', mechanism: 'prop default is not resolved' },
		],
	},
};

let failures = 0;
const check = (name, condition, detail) => {
	if (condition) return;
	failures++;
	console.error(`FAIL ${name}\n${detail}`);
};

// Positive control: the gate can pass, and it reports a denominator.
{
	const r = run(PASSING);
	check('a well-formed progress file passes', r.code === 0, r.out);
	check(
		'coverage is printed against the ratchet, not against the record count',
		r.out.includes('a-known-failures.json: 3/3 listed entries located'),
		r.out,
	);
	check(
		'a pending ratchet with no records is reported as zero rather than omitted',
		r.out.includes('b-known-failures.json: 0 located'),
		r.out,
	);
}

// A progress file is optional: nothing located yet is a valid state.
{
	const files = { ...PASSING };
	delete files['attribution-progress.json'];
	const r = run(files);
	check('an absent progress file passes', r.code === 0, r.out);
	check('and both pending ratchets read as zero', r.out.includes('a-known-failures.json: 0 located'), r.out);
}

// The pending declaration is the precondition, not an optional input.
{
	const files = { ...PASSING };
	delete files['attribution-pending.json'];
	const r = run(files);
	check('an absent pending declaration fails', r.code !== 0, r.out);
}

// A record for a ratchet that already has an attribution table is meaningless.
{
	const r = run({ ...PASSING, 'attribution-pending.json': ['b-known-failures.json'] });
	check('a record outside the pending set fails', r.code === 1, r.out);
	check('and it names the file', r.out.includes('a-known-failures.json is not in'), r.out);
}

// The two-sided direction: a record whose entry has been eliminated describes
// nothing, and leaving it in place hides that the work is done.
{
	const r = run({ ...PASSING, 'a-known-failures.json': ['two', 'three'] });
	check('a record for an unlisted id fails', r.code === 1, r.out);
	check('and it names the id', r.out.includes('one has a progress record and is not listed'), r.out);
}

// One mechanism in one port is one defect.
{
	const progress = {
		'a-known-failures.json': [
			{ id: 'one', issue: 1, port: 'module', mechanism: 'should_proxy allow-list' },
			{ id: 'two', issue: 9, port: 'module', mechanism: 'should_proxy allow-list' },
		],
	};
	const r = run({ ...PASSING, 'attribution-progress.json': progress });
	check('one mechanism in one port cannot cite two issues', r.code === 1, r.out);
	check('and it names both ids', r.out.includes('two and one share port'), r.out);
}

// ... and the same mechanism in a different port legitimately does.
{
	const progress = {
		'a-known-failures.json': [
			{ id: 'one', issue: 1, port: 'module', mechanism: 'should_proxy allow-list' },
			{ id: 'two', issue: 9, port: 'component', mechanism: 'should_proxy allow-list' },
		],
	};
	const r = run({ ...PASSING, 'attribution-progress.json': progress });
	check('the same mechanism in two ports may cite two issues', r.code === 0, r.out);
}

// The key joins the two fields, and both are free text. Under a space these
// two records collapse onto one key and the run fails; under NUL they do not.
{
	const progress = {
		'a-known-failures.json': [
			{ id: 'one', issue: 1, port: 'client dev', mechanism: 'x' },
			{ id: 'two', issue: 9, port: 'client', mechanism: 'dev x' },
		],
	};
	const r = run({ ...PASSING, 'attribution-progress.json': progress });
	check('a separator inside a field does not collapse two pairs', r.code === 0, r.out);
}

for (const [field, value] of [
	['issue', '4211'],
	['issue', 0],
	['port', ''],
	['mechanism', ''],
]) {
	const record = { id: 'one', issue: 1, port: 'module', mechanism: 'm', [field]: value };
	const r = run({ ...PASSING, 'attribution-progress.json': { 'a-known-failures.json': [record] } });
	check(`${field}=${JSON.stringify(value)} fails`, r.code === 1, r.out);
}

// A duplicate record would let one id claim two mechanisms and pass either way.
{
	const progress = {
		'a-known-failures.json': [
			{ id: 'one', issue: 1, port: 'module', mechanism: 'm' },
			{ id: 'one', issue: 1, port: 'module', mechanism: 'm' },
		],
	};
	const r = run({ ...PASSING, 'attribution-progress.json': progress });
	check('a duplicate id fails', r.code === 1, r.out);
}

if (failures) {
	console.error(`\n${failures} failed`);
	process.exit(1);
}
console.log('all attribution-progress-check cases pass');
