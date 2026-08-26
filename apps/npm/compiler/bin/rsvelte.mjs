#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
	HELP,
	UsageError,
	buildReport,
	collectSvelteFiles,
	compareFiles,
	formatHumanReport,
	parseArgs,
	readCompilerOptions,
} from '../lib/compare.mjs';

async function main() {
	if (process.argv[2] !== 'compare') {
		if (process.argv[2] === '-h' || process.argv[2] === '--help') {
			process.stdout.write(`Usage: rsvelte <command>\n\nCommands:\n  compare   compare official and rsvelte compiler output\n`);
			return 0;
		}
		throw new UsageError(process.argv[2] ? `Unknown command: ${process.argv[2]}` : 'Missing command');
	}

	const args = parseArgs(process.argv.slice(3));
	if (args.help) {
		process.stdout.write(`${HELP}\n`);
		return 0;
	}
	const files = await collectSvelteFiles(args.paths, process.cwd());
	if (files.length === 0) throw new UsageError('No .svelte files matched');
	const compilerOptions = await readCompilerOptions(args.optionsPath, process.cwd());
	if (args.dev) compilerOptions.dev = true;
	const targets = args.generate === 'both' ? ['client', 'server'] : [args.generate];
	const { officialCompile, rsvelteCompile } = await loadCompilers();
	const results = await compareFiles({
		files,
		cwd: process.cwd(),
		targets,
		options: compilerOptions,
		officialCompile,
		rsvelteCompile,
	});
	const report = buildReport(results);
	process.stdout.write(args.json ? `${JSON.stringify(report, null, 2)}\n` : formatHumanReport(report));
	return report.different === 0 ? 0 : 1;
}

async function loadCompilers() {
	let official;
	try {
		const projectRequire = createRequire(resolve(process.cwd(), 'package.json'));
		official = await import(pathToFileURL(projectRequire.resolve('svelte/compiler')).href);
	} catch {
		throw new UsageError('Cannot load svelte/compiler; install Svelte in the project being compared');
	}

	const rsvelte = await import('@rsvelte/compiler');
	const require = createRequire(import.meta.url);
	const wasmPath = require.resolve('@rsvelte/compiler/wasm');
	rsvelte.initSync({ module: readFileSync(wasmPath) });
	const officialCompile = official.compile ?? official.default?.compile;
	if (typeof officialCompile !== 'function') {
		throw new UsageError('Loaded svelte/compiler does not export compile()');
	}
	return { officialCompile, rsvelteCompile: rsvelte.compile };
}

try {
	process.exitCode = await main();
} catch (error) {
	if (error instanceof UsageError) {
		process.stderr.write(`rsvelte: ${error.message}\n\n${HELP}\n`);
		process.exitCode = 2;
	} else {
		process.stderr.write(`rsvelte: ${error?.stack ?? error}\n`);
		process.exitCode = 2;
	}
}
