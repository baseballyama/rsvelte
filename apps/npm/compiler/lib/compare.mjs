import { lstat, readFile, readdir } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';

const SKIPPED_DIRECTORIES = new Set(['.git', 'node_modules', 'target']);
const MAGIC = /[*?]/;
const REGEXP_SPECIAL = new Set('\\^$+?.()|{}[]');

export const HELP = `Usage: rsvelte compare [OPTIONS] [PATH...]

Compare official Svelte and rsvelte generated JavaScript/CSS byte-for-byte.

Arguments:
  PATH                    .svelte file, directory, or glob (default: .)

Options:
  --generate <target>     client, server, or both (default: client)
  --dev                   compile both sides with dev: true
  --options <file>        merge JSON compiler options (filename/generate are set per file)
  --json                  print a machine-readable report
  -h, --help              show this help

Exit codes: 0 all match, 1 differences or compile failures, 2 usage/setup error.`;

export function parseArgs(argv) {
	const parsed = {
		dev: false,
		generate: 'client',
		help: false,
		json: false,
		optionsPath: null,
		paths: [],
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === '--') {
			parsed.paths.push(...argv.slice(index + 1));
			break;
		}
		if (arg === '-h' || arg === '--help') parsed.help = true;
		else if (arg === '--json') parsed.json = true;
		else if (arg === '--dev') parsed.dev = true;
		else if (arg === '--generate') parsed.generate = takeValue(argv, ++index, arg);
		else if (arg.startsWith('--generate=')) parsed.generate = arg.slice('--generate='.length);
		else if (arg === '--options') parsed.optionsPath = takeValue(argv, ++index, arg);
		else if (arg.startsWith('--options=')) parsed.optionsPath = arg.slice('--options='.length);
		else if (arg.startsWith('-')) throw new UsageError(`Unknown option: ${arg}`);
		else parsed.paths.push(arg);
	}

	if (!['client', 'server', 'both'].includes(parsed.generate)) {
		throw new UsageError(`Invalid --generate value: ${parsed.generate}`);
	}
	if (parsed.paths.length === 0) parsed.paths.push('.');
	return parsed;
}

function takeValue(argv, index, option) {
	const value = argv[index];
	if (!value || value.startsWith('-')) throw new UsageError(`${option} requires a value`);
	return value;
}

export class UsageError extends Error {}

export async function collectSvelteFiles(inputs, cwd = process.cwd()) {
	const found = new Set();
	for (const input of inputs) {
		if (MAGIC.test(input)) {
			await collectGlob(input, cwd, found);
			continue;
		}

		const path = resolve(cwd, input);
		let stat;
		try {
			stat = await lstat(path);
		} catch (error) {
			if (error?.code === 'ENOENT') throw new UsageError(`Path does not exist: ${input}`);
			throw error;
		}
		if (stat.isDirectory()) await walk(path, found);
		else if (stat.isFile() && path.endsWith('.svelte')) found.add(path);
		else throw new UsageError(`Not a .svelte file or directory: ${input}`);
	}
	return [...found].sort((a, b) => a.localeCompare(b));
}

async function collectGlob(pattern, cwd, found) {
	const absolutePattern = slash(isAbsolute(pattern) ? pattern : resolve(cwd, pattern));
	const firstMagic = absolutePattern.search(MAGIC);
	const slashBeforeMagic = absolutePattern.lastIndexOf('/', firstMagic);
	const root = slashBeforeMagic <= 0 ? '/' : absolutePattern.slice(0, slashBeforeMagic);
	const matcher = globRegExp(absolutePattern);
	let stat;
	try {
		stat = await lstat(root);
	} catch (error) {
		if (error?.code === 'ENOENT') return;
		throw error;
	}
	if (!stat.isDirectory()) return;
	await walk(root, found, (path) => matcher.test(slash(path)));
}

async function walk(directory, found, accept = (path) => path.endsWith('.svelte')) {
	const entries = await readdir(directory, { withFileTypes: true });
	for (const entry of entries) {
		const path = resolve(directory, entry.name);
		if (entry.isDirectory()) {
			if (!SKIPPED_DIRECTORIES.has(entry.name)) await walk(path, found, accept);
		} else if (entry.isFile() && path.endsWith('.svelte') && accept(path)) {
			found.add(path);
		}
	}
}

function globRegExp(pattern) {
	let expression = '^';
	for (let index = 0; index < pattern.length; index += 1) {
		const char = pattern[index];
		if (char === '*') {
			if (pattern[index + 1] === '*') {
				index += 1;
				if (pattern[index + 1] === '/') {
					index += 1;
					expression += '(?:.*/)?';
				} else expression += '.*';
			} else expression += '[^/]*';
		} else if (char === '?') expression += '[^/]';
		else expression += REGEXP_SPECIAL.has(char) ? `\\${char}` : char;
	}
	return new RegExp(`${expression}$`);
}

const slash = (path) => path.split(sep).join('/');

export async function readCompilerOptions(path, cwd = process.cwd()) {
	if (!path) return {};
	let value;
	try {
		value = JSON.parse(await readFile(resolve(cwd, path), 'utf8'));
	} catch (error) {
		throw new UsageError(`Cannot read compiler options from ${path}: ${error.message}`);
	}
	if (!value || Array.isArray(value) || typeof value !== 'object') {
		throw new UsageError(`Compiler options in ${path} must be a JSON object`);
	}
	delete value.filename;
	delete value.generate;
	return value;
}

export async function compareFiles({ files, cwd, targets, options, officialCompile, rsvelteCompile }) {
	const results = [];
	for (const file of files) {
		const source = await readFile(file, 'utf8');
		const displayPath = slash(relative(cwd, file)) || slash(file);
		const comparisons = targets.map((target) =>
			compareSource({
				source,
				filename: displayPath,
				target,
				options,
				officialCompile,
				rsvelteCompile,
			}),
		);
		results.push({ file: displayPath, match: comparisons.every((item) => item.match), comparisons });
	}
	return results;
}

export function compareSource({ source, filename, target, options, officialCompile, rsvelteCompile }) {
	const compileOptions = { ...options, filename, generate: target };
	let official;
	let actual;
	try {
		official = normalizeResult(officialCompile(source, compileOptions));
	} catch (error) {
		return compileFailure(target, 'official', error);
	}
	try {
		actual = normalizeResult(rsvelteCompile(source, compileOptions));
	} catch (error) {
		return compileFailure(target, 'rsvelte', error);
	}

	const differences = [];
	compareArtifact(differences, 'js.code', official?.js?.code, actual?.js?.code);
	compareArtifact(differences, 'css.code', official?.css?.code ?? null, actual?.css?.code ?? null);
	return { target, match: differences.length === 0, differences };
}

function normalizeResult(result) {
	return typeof result === 'string' ? JSON.parse(result) : result;
}

function compileFailure(target, side, error) {
	return {
		target,
		match: false,
		differences: [],
		error: { side, code: error?.code ?? null, message: error?.message ?? String(error) },
	};
}

function compareArtifact(differences, artifact, official, actual) {
	if (official === actual) return;
	const expected = official == null ? String(official) : String(official);
	const received = actual == null ? String(actual) : String(actual);
	const offset = firstDifference(expected, received);
	const before = expected.slice(0, offset);
	const line = before.split('\n').length;
	const lastNewline = before.lastIndexOf('\n');
	const column = offset - lastNewline;
	differences.push({
		artifact,
		line,
		column,
		official: lineAt(expected, line),
		rsvelte: lineAt(received, line),
	});
}

function firstDifference(left, right) {
	const length = Math.min(left.length, right.length);
	let index = 0;
	while (index < length && left[index] === right[index]) index += 1;
	return index;
}

function lineAt(value, line) {
	const text = value.split('\n')[line - 1] ?? '';
	return text.length > 240 ? `${text.slice(0, 237)}...` : text;
}

export function buildReport(results) {
	const differences = results.filter((result) => !result.match);
	return {
		scanned: results.length,
		matched: results.length - differences.length,
		different: differences.length,
		files: results,
	};
}

export function formatHumanReport(report) {
	const noun = report.scanned === 1 ? 'file' : 'files';
	const differenceNoun = report.different === 1 ? 'difference' : 'differences';
	let output = `${report.files.map((file) => (file.match ? '.' : 'X')).join('')}\n\n`;
	output += `${report.scanned} ${noun} scanned, ${report.matched} match, ${report.different} ${differenceNoun}\n`;
	if (report.different === 0) return output;
	output += '\nDifferences:\n';
	for (const file of report.files.filter((item) => !item.match)) {
		output += `* ${file.file}\n`;
		for (const comparison of file.comparisons.filter((item) => !item.match)) {
			if (comparison.error) {
				output += `  [${comparison.target}] ${comparison.error.side} failed`;
				if (comparison.error.code) output += ` (${comparison.error.code})`;
				output += `: ${comparison.error.message}\n`;
				continue;
			}
			for (const difference of comparison.differences) {
				output += `  [${comparison.target} ${difference.artifact}] line ${difference.line}, column ${difference.column}\n`;
				output += `    official: ${JSON.stringify(difference.official)}\n`;
				output += `    rsvelte:  ${JSON.stringify(difference.rsvelte)}\n`;
			}
		}
	}
	return output;
}
