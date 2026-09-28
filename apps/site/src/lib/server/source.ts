import { clean, crates, modules, rev } from 'virtual:rsvelte-source';
import type { HighlightedItem, HighlightedModule } from '$lib/build/source-plugin';

const byKey = new Map<string, HighlightedItem>();
const moduleByKey = new Map<string, HighlightedModule>();
for (const m of modules) {
	moduleByKey.set(m.key, m);
	for (const it of m.items) byKey.set(it.key, it);
}

/** A quoted item. Throws on an unknown key, so renaming code without updating a page fails the build. */
export function excerpt(key: string): HighlightedItem & { path: string } {
	const it = byKey.get(key);
	if (!it) throw new Error(`no Rust item ${key}; the page quotes code that no longer exists`);
	const mod = key.slice(0, key.indexOf('/', key.indexOf('/') + 1));
	return { ...it, path: moduleByKey.get(mod)!.path };
}

export function sourceModule(key: string): HighlightedModule {
	const m = moduleByKey.get(key);
	if (!m) throw new Error(`no Rust module ${key}`);
	return m;
}

export function allModules(): HighlightedModule[] {
	return modules;
}

export function buildInfo(): { rev: string; clean: boolean } {
	return { rev, clean };
}

/** Several excerpts at once, keyed by the name a page uses for them. */
export function excerpts<K extends string>(keys: Record<K, string>): Record<K, ReturnType<typeof excerpt>> {
	return Object.fromEntries(Object.entries<string>(keys).map(([k, v]) => [k, excerpt(v)])) as Record<
		K,
		ReturnType<typeof excerpt>
	>;
}

export function crateSizes() {
	return crates;
}
