// Fixture directories have no node_modules, so runtimes resolve from this package.
import crypto from 'node:crypto';
import fs from 'node:fs';
import module from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { svelteModule } from './official.ts';

export type Target = 'client' | 'server';

const TOOLS = pathToFileURL(
	path.resolve(import.meta.dirname, '../../package.json'),
).href;
const RUNTIME_PACKAGE = /^(svelte|vue|@vue\/[^/]+)(\/|$)/;
const MAX_MODULE_METADATA = 131_072;
const sources = new Map<
	string,
	{
		sourceFile?: string;
		vapor: boolean;
		translated: boolean;
		experimentalAsync?: boolean;
	}
>();
const remember = (
	file: string,
	info: {
		sourceFile?: string;
		vapor: boolean;
		translated: boolean;
		experimentalAsync?: boolean;
	},
) => {
	if (!sources.has(file) && sources.size === MAX_MODULE_METADATA)
		throw new Error('behaviour module metadata limit reached');
	sources.set(file, info);
};
const VAPOR_RUNTIME =
	'vue-vapor/dist/vue.runtime-with-vapor.esm-browser.prod.js';

/**
 * Resolves the runtimes for one build target in this thread. `svelte` exports its client entry
 * only under the `browser` condition, which a bundler's client build sets and its server build
 * does not; Vue's Node entry serves both.
 */
export function provideRuntimes(target: Target): void {
	module.registerHooks({
		resolve(specifier, context, nextResolve) {
			const parent = context.parentURL?.startsWith('file:')
				? fileURLToPath(context.parentURL)
				: '';
			const info = sources.get(parent);
			if (specifier.endsWith('.svelte') && info?.sourceFile) {
				const input = path.resolve(path.dirname(info.sourceFile), specifier);
				const file = info.translated
					? path.join(path.dirname(input), 'expected', `${target}.js`)
					: input;
				const resolved = fs.realpathSync(file);
				remember(resolved, { ...info, sourceFile: input });
				return { url: pathToFileURL(resolved).href, shortCircuit: true };
			}
			if (specifier === 'vue-vapor' || (specifier === 'vue' && info?.vapor))
				return nextResolve(VAPOR_RUNTIME, { ...context, parentURL: TOOLS });
			if (!RUNTIME_PACKAGE.test(specifier) || parent.includes('/node_modules/'))
				return nextResolve(specifier, context);
			const conditions =
				target === 'client' && specifier.startsWith('svelte')
					? [...context.conditions, 'browser']
					: context.conditions;
			return nextResolve(specifier, {
				...context,
				parentURL: TOOLS,
				conditions,
			});
		},
		load(url, context, nextLoad) {
			if (url.startsWith('file:') && fileURLToPath(url).endsWith('.svelte')) {
				const file = fileURLToPath(url);
				return {
					format: 'module',
					source: svelteModule(
						fs.readFileSync(file, 'utf8'),
						file,
						target,
						false,
						sources.get(file)?.experimentalAsync,
					),
					shortCircuit: true,
				};
			}
			return nextLoad(url, context);
		},
	});
}

let scratch: string | undefined;

/** A module given as text, written to a file so it loads like an emitted one. */
export function moduleFile(
	code: string,
	target: Target,
	identity = '',
): string {
	scratch ??= fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-behaviour-'));
	const file = path.join(
		scratch,
		`${crypto.createHash('sha256').update(identity).update('\0').update(code).digest('hex').slice(0, 16)}.${target}.js`,
	);
	if (!fs.existsSync(file)) fs.writeFileSync(file, code);
	return file;
}

/** The default export of the module in `file`. */
export async function loadComponent(
	file: string,
	vapor = false,
	sourceFile?: string,
	translated = vapor,
	experimentalAsync = false,
): Promise<unknown> {
	const resolved = fs.realpathSync(file);
	remember(resolved, { sourceFile, vapor, translated, experimentalAsync });
	const code = fs.readFileSync(file);
	// The module cache is keyed by URL; the content hash makes a rewritten file a new module.
	const url = `${pathToFileURL(file).href}?${crypto.createHash('sha256').update(code).digest('hex').slice(0, 16)}`;
	const m: { default?: unknown } = await import(url);
	if (m.default === undefined)
		throw new Error('the module has no default export');
	return m.default;
}

export const message = (e: unknown): string =>
	e instanceof Error ? e.message : String(e);
