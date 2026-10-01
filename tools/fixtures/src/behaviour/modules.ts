// Loading an emitted component module. Emitted modules live under fixtures/, which has no
// node_modules: their runtime imports resolve from this package, the one copy of each runtime the
// expected side uses too. Only `svelte`, `vue` and `@vue/*` are provided, so an emitted module
// may import its runtime and nothing else.
import crypto from 'node:crypto';
import fs from 'node:fs';
import module from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export type Target = 'client' | 'server';

const TOOLS = pathToFileURL(path.resolve(import.meta.dirname, '../../package.json')).href;
const RUNTIME_PACKAGE = /^(svelte|vue|@vue\/[^/]+)(\/|$)/;

/**
 * Resolves the runtimes for one build target in this thread. `svelte` exports its client entry
 * only under the `browser` condition, which a bundler's client build sets and its server build
 * does not; Vue's Node entry serves both.
 */
export function provideRuntimes(target: Target): void {
	module.registerHooks({
		resolve(specifier, context, nextResolve) {
			const parent = context.parentURL ? new URL(context.parentURL).pathname : '';
			if (!RUNTIME_PACKAGE.test(specifier) || parent.includes('/node_modules/')) return nextResolve(specifier, context);
			const conditions = target === 'client' && specifier.startsWith('svelte') ? [...context.conditions, 'browser'] : context.conditions;
			return nextResolve(specifier, { ...context, parentURL: TOOLS, conditions });
		}
	});
}

let scratch: string | undefined;

/** A module given as text, written to a file so it loads like an emitted one. */
export function moduleFile(code: string, target: Target): string {
	scratch ??= fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-behaviour-'));
	const file = path.join(scratch, `${crypto.createHash('sha256').update(code).digest('hex').slice(0, 16)}.${target}.js`);
	if (!fs.existsSync(file)) fs.writeFileSync(file, code);
	return file;
}

/** The default export of the module in `file`. */
export async function loadComponent(file: string): Promise<unknown> {
	const code = fs.readFileSync(file);
	// The module cache is keyed by URL; the content hash makes a rewritten file a new module.
	const url = `${pathToFileURL(file).href}?${crypto.createHash('sha256').update(code).digest('hex').slice(0, 16)}`;
	const m = (await import(url)) as { default?: unknown };
	if (m.default === undefined) throw new Error('the module has no default export');
	return m.default;
}

export const message = (e: unknown): string => (e instanceof Error ? e.message : String(e));
