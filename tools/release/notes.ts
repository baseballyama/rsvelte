// Prints the changelog entry of the version Changesets wrote, as the notes of the GitHub release.
import fs from 'node:fs';
import path from 'node:path';
import { VERSIONED } from './version.ts';

/** The entry of `version` in a CHANGELOG.md that Changesets writes. */
export function changelogEntry(changelog: string, version: string): string {
	const heading = `\n## ${version}\n`;
	const start = `\n${changelog}`.indexOf(heading);
	if (start < 0) throw new Error(`the changelog has no entry for ${version}`);
	const body = `\n${changelog}`.slice(start + heading.length);
	const end = body.search(/^## /m);
	return (end < 0 ? body : body.slice(0, end)).trim();
}

export async function main(): Promise<void> {
	const version: string = JSON.parse(fs.readFileSync(VERSIONED, 'utf8')).version;
	const changelog = fs.readFileSync(path.join(path.dirname(VERSIONED), 'CHANGELOG.md'), 'utf8');
	console.log(changelogEntry(changelog, version));
}
