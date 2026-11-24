// The path of the rsvelte program that npm installed for this machine. The package of each
// platform is in platforms.json beside this directory. The VS Code extension imports it too.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** @returns {string} */
export function program() {
	const platforms = JSON.parse(readFileSync(new URL('../platforms.json', import.meta.url), 'utf8'));
	const platform = `${process.platform}-${process.arch}`;
	const name = platforms[platform];
	if (!name) throw new Error(`there is no build for ${platform}`);
	try {
		return require.resolve(`${name}/rsvelte${process.platform === 'win32' ? '.exe' : ''}`);
	} catch {
		throw new Error(
			`${name} is not installed; install @rsvelte/cli again, with optional dependencies`,
		);
	}
}
