// Bundles the extension into one CommonJS file, because the extension host loads neither
// TypeScript nor the packages it imports from node_modules.
import path from 'node:path';
import { build } from 'esbuild';

const here = import.meta.dirname;

/** Bundles `entry` into `outfile`, below this directory. */
export async function bundle(entry: string, outfile: string): Promise<void> {
	await build({
		entryPoints: [path.join(here, entry)],
		outfile: path.join(here, outfile),
		bundle: true,
		platform: 'node',
		format: 'cjs',
		target: 'node20',
		// The extension host provides it.
		external: ['vscode'],
		// A project's ES module is imported as it is, not turned into a `require`.
		supported: { 'dynamic-import': true },
		// The workspace's tsconfig targets a newer language than esbuild knows.
		tsconfigRaw: {},
		logLevel: 'warning',
	});
}

if (import.meta.main) await bundle('src/extension.ts', 'dist/extension.cjs');
