// Finds the rsvelte program of a workspace folder: the folder's @rsvelte/cli knows where npm put
// the program of this machine, and its bin/program.js says so.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** The program, or why the installed @rsvelte/cli cannot serve the folder. */
export type Found = { program: string } | { problem: string };

/** What `folder` installs, or `undefined` when it installs no @rsvelte/cli. */
export async function findProgram(folder: string): Promise<Found | undefined> {
	let manifest: string;
	try {
		// Resolved as the folder's own code resolves it, through parent node_modules too.
		manifest = createRequire(path.join(folder, 'package.json')).resolve(
			'@rsvelte/cli/package.json',
		);
	} catch {
		return undefined;
	}
	let root: string;
	let stat: fs.Stats | undefined;
	try {
		root = path.dirname(fs.realpathSync(manifest));
		stat = fs.statSync(path.join(root, 'bin/program.js'), { throwIfNoEntry: false });
		if (stat === undefined) {
			const { version } = JSON.parse(fs.readFileSync(manifest, 'utf8')) as { version?: string };
			return {
				problem: `@rsvelte/cli ${version ?? ''} in ${root} has no language server; install a newer one`,
			};
		}
	} catch (error) {
		return { problem: `@rsvelte/cli at ${manifest}: ${(error as Error).message}` };
	}
	const lookup = path.join(root, 'bin/program.js');
	// A new query after an upgrade, so the module the host cached is not reused.
	const url = `${pathToFileURL(lookup).href}?${stat.mtimeMs}`;
	try {
		const { program } = (await import(url)) as { program: () => string };
		return { program: program() };
	} catch (error) {
		return { problem: `@rsvelte/cli in ${root}: ${(error as Error).message}` };
	}
}
