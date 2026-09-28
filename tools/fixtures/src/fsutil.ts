import fs from 'node:fs';
import path from 'node:path';

/** Writes only when the bytes differ, so a regeneration that changes nothing leaves mtimes alone. */
export function writeIfChanged(file: string, content: string): boolean {
	try {
		if (fs.readFileSync(file, 'utf8') === content) return false;
	} catch {}
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, content);
	return true;
}

/** JSON with object keys sorted (`type` first), the canonical serialization every tool shares. */
export function stableStringify(value: unknown, indent: string = '\t'): string {
	return JSON.stringify(sortKeys(value), null, indent);
}

export function sortKeys<T>(value: T): T {
	if (Array.isArray(value)) return value.map(sortKeys) as T;
	if (value && typeof value === 'object') {
		const keys = Object.keys(value).sort((a, b) => (a === 'type' ? -1 : b === 'type' ? 1 : a < b ? -1 : a > b ? 1 : 0));
		const out: Record<string, unknown> = {};
		for (const k of keys) out[k] = sortKeys((value as Record<string, unknown>)[k]);
		return out as T;
	}
	return value;
}

export function pruneEmptyDirs(dir: string): void {
	let entries: fs.Dirent[];
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return;
	}
	for (const e of entries) if (e.isDirectory()) pruneEmptyDirs(path.join(dir, e.name));
	if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
}
