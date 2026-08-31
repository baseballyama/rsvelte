// A source repo's build artifacts are not its published source, and whether
// they exist depends on whether the runner's dependency cache hit — so
// collecting them makes the corpus population non-deterministic across runs.
// Measured: `svelte/playgrounds/sandbox/src/main.svelte` made the compile
// corpus 34796 on one CI run and 34795 on the next with no repository change,
// and the lint corpus carries the same file.
//
// One `git ls-files` per repo, not one `check-ignore` per file. The `.git`
// probe is load-bearing: `git -C` searches UPWARD, so a directory that is not
// a repository would answer with the parent's ignore list, whose paths are
// relative to the parent and would match nothing here — a silent no-op that
// reads exactly like a clean repo.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

/** Repo-relative POSIX paths that `dir`'s own `.gitignore` excludes. */
export function ignoredPaths(dir) {
	if (!fs.existsSync(path.join(dir, '.git'))) return new Set();
	try {
		const out = execFileSync('git', ['-C', dir, 'ls-files', '--others', '--ignored', '--exclude-standard'], {
			encoding: 'utf8',
			maxBuffer: 256 * 1024 * 1024,
		});
		return new Set(out.split('\n').filter(Boolean));
	} catch {
		return new Set();
	}
}
