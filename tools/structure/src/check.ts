import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type Limits = {
	maxLines: number;
	exceptions: Record<string, { maxLines: number; reason: string }>;
};

export function parseLimits(value: unknown): Limits {
	if (typeof value !== 'object' || value === null || !('maxLines' in value) ||
		!Number.isSafeInteger(value.maxLines) || (value.maxLines as number) <= 0 ||
		!('exceptions' in value) || typeof value.exceptions !== 'object' ||
		value.exceptions === null || Array.isArray(value.exceptions)) {
		throw new Error('Limits need a positive maxLines and an exceptions object');
	}
	const maxLines = value.maxLines as number;
	const exceptions: Limits['exceptions'] = {};
	for (const [file, entry] of Object.entries(value.exceptions)) {
		if (typeof entry !== 'object' || entry === null || !('maxLines' in entry) ||
			!Number.isSafeInteger(entry.maxLines) || (entry.maxLines as number) <= maxLines ||
			!('reason' in entry) || typeof entry.reason !== 'string' || !entry.reason.trim()) {
			throw new Error(`Invalid exception for ${file}: give a larger limit and a reason`);
		}
		exceptions[file] = { maxLines: entry.maxLines as number, reason: entry.reason };
	}
	return { maxLines, exceptions };
}

export function lineCount(text: string): number {
	if (text.length === 0) return 0;
	let count = text.endsWith('\n') ? 0 : 1;
	for (const character of text) if (character === '\n') count++;
	return count;
}

export function isSource(file: string): boolean {
	return /^(crates|tools|apps)\//.test(file) && /\.(rs|ts|tsx|mts|cts|js|jsx|mjs|cjs|svelte|vue|css|scss)$/.test(file) &&
		!file.split('/').includes('vendor') &&
		!file.startsWith('apps/site/src/lib/wasm/') &&
		!file.startsWith('tools/fixtures/test/behaviour/wrong/');
}

export function checkFiles(root: string, files: string[], limits: Limits): {
	measured: number;
	largest: number;
	failures: string[];
} {
	const failures: string[] = [];
	const remaining = new Set(Object.keys(limits.exceptions));
	let measured = 0;
	let largest = 0;
	for (const file of [...new Set(files)].filter(isSource).sort()) {
		const count = lineCount(readFileSync(resolve(root, file), 'utf8'));
		const exception = limits.exceptions[file];
		const limit = exception?.maxLines ?? limits.maxLines;
		measured++;
		largest = Math.max(largest, count);
		remaining.delete(file);
		if (count > limit) failures.push(`${file}: ${count} lines exceeds ${limit}`);
		if (exception && count <= limits.maxLines) {
			failures.push(`${file}: remove the exception; it now fits ${limits.maxLines} lines`);
		}
	}
	for (const file of [...remaining].sort()) failures.push(`${file}: exception has no measured source file`);
	if (measured === 0) failures.push('UNMEASURED: no source files found');
	return { measured, largest, failures };
}
