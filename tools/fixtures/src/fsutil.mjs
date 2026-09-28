import fs from 'node:fs';
import path from 'node:path';

/** Writes only when the bytes differ, so a regeneration that changes nothing leaves mtimes alone. */
export function writeIfChanged(file, content) {
	try {
		if (fs.readFileSync(file, 'utf8') === content) return false;
	} catch {}
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, content);
	return true;
}

export function listFiles(dir, out = []) {
	let entries;
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return out;
	}
	for (const e of entries) {
		const full = path.join(dir, e.name);
		if (e.isDirectory()) listFiles(full, out);
		else if (e.isFile()) out.push(full);
	}
	return out;
}

/** JSON with object keys sorted (`type` first), the canonical serialization every tool shares. */
export function stableStringify(value, indent = '\t') {
	return JSON.stringify(sortKeys(value), null, indent);
}

export function sortKeys(value) {
	if (Array.isArray(value)) return value.map(sortKeys);
	if (value && typeof value === 'object') {
		const keys = Object.keys(value).sort((a, b) =>
			a === 'type' ? -1 : b === 'type' ? 1 : a < b ? -1 : a > b ? 1 : 0
		);
		const out = {};
		for (const k of keys) out[k] = sortKeys(value[k]);
		return out;
	}
	return value;
}
