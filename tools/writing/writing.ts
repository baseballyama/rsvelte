// The English prose check: which Markdown files it reads, and the linter it runs on them.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createLinter, loadTextlintrc } from 'textlint';
import { rules } from './rules.ts';

export const root = path.resolve(import.meta.dirname, '../..');

/** Text written by others: test inputs, copied upstream files, and licenses. */
const thirdParty = [/^corpus\//, /^submodules\//, /\/fixtures\//, /\/vendor\//, /(^|\/)LICENSE/];

export function markdownFiles(): string[] {
	const tracked = execFileSync('git', ['-C', root, 'ls-files', '-z', '--', '*.md'], {
		encoding: 'utf8',
	});
	return (
		tracked
			.split('\0')
			.filter((file) => file && !thirdParty.some((pattern) => pattern.test(file)))
			// Below the root, a directory with its own license holds text copied from another project.
			.filter((file) => {
				for (
					let directory = path.dirname(file);
					directory !== '.';
					directory = path.dirname(directory)
				) {
					if (existsSync(path.join(root, directory, 'LICENSE'))) return false;
				}
				return true;
			})
	);
}

/** A linter with every English rule. With no config file, the loader gives only the built-in Markdown and text plugins. */
export async function englishLinter() {
	const plugins = await loadTextlintrc();
	return createLinter({ descriptor: plugins.shallowMerge({ rules }) });
}
