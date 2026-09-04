#!/usr/bin/env node
/**
 * After a release, comment on every PR whose changeset shipped in it, and on
 * the issues that PR closed, naming the exact `package@version` it went out in.
 *
 * The mapping is taken from the CHANGELOGs rather than from the commit range:
 * `@changesets/cli/changelog` prefixes each entry with the short hash of the
 * commit that ADDED the changeset, so a CHANGELOG section answers "which PR is
 * in which package at which version" directly. A commit range cannot — it lists
 * every merge, including the ones that changed no published package.
 *
 * Usage:
 *   node scripts/release/comment-released-versions.mjs [--base <ref>] [--dry-run]
 *
 * Environment: GITHUB_TOKEN (issues: write), GITHUB_REPOSITORY (owner/name).
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

/** Marker that makes a comment ours, so a re-run does not duplicate it. */
export const MARKER = '<!-- rsvelte-released-in -->';

/** Platform sidecar packages: they carry no changelog entry of their own. */
const PLATFORM_PACKAGE = /-(darwin|linux|win32)-(arm64|x64)(-gnu|-msvc)?$/;

// ---------------------------------------------------------------------------
// Pure parsing (exported for scripts/dev/test-release-comment.mjs)
// ---------------------------------------------------------------------------

/** Body of the `## <version>` section of a changeset CHANGELOG, or null. */
export function sectionFor(changelog, version) {
	const lines = changelog.split('\n');
	const start = lines.findIndex((line) => line.trim() === `## ${version}`);
	if (start === -1) return null;
	const rest = lines.slice(start + 1);
	const end = rest.findIndex((line) => line.startsWith('## '));
	return (end === -1 ? rest : rest.slice(0, end)).join('\n');
}

/**
 * Short commit hashes of the changesets listed directly in a section.
 *
 * Anchored at column 0 so an indented continuation of a changeset body cannot
 * match, and requires the `<hash>: ` shape so `- Updated dependencies [hash]`
 * — a bump propagated from a dependency, not this package's own change — is
 * left to the package that actually carries the entry.
 */
export function changesetHashesIn(section) {
	const seen = new Set();
	for (const line of section.split('\n')) {
		const match = /^- ([0-9a-f]{7,40}): /.exec(line);
		if (match) seen.add(match[1]);
	}
	return [...seen];
}

/** PR number from a squash-merge subject, e.g. `fix: x (#123) (#456)` -> 456. */
export function prNumberFromSubject(subject) {
	const match = /\(#(\d+)\)\s*$/.exec(subject.split('\n')[0]);
	return match ? Number(match[1]) : null;
}

/** Where a released package can be read about. */
export function packageUrl(name, version, isPrivate) {
	if (isPrivate) {
		return name === 'rsvelte'
			? `https://marketplace.visualstudio.com/items?itemName=baseballyama.${name}`
			: null;
	}
	return `https://www.npmjs.com/package/${name}/v/${version}`;
}

/** Renders the comment body. `prNumber` is null when commenting on the PR itself. */
export function commentBody(releases, prNumber) {
	const lines = releases.map((r) => {
		const label = `\`${r.name}@${r.version}\``;
		const url = packageUrl(r.name, r.version, r.private);
		return `- ${url ? `[${label}](${url})` : label}`;
	});
	const lead =
		prNumber === null
			? 'The change in this pull request has been released in:'
			: `Fixed by #${prNumber}, released in:`;
	return [MARKER, '🚀 **Released**', '', lead, '', ...lines, ''].join('\n');
}

// ---------------------------------------------------------------------------
// Repository state
// ---------------------------------------------------------------------------

const gitIn = (root, ...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();

function readJsonAt(root, ref, relPath) {
	try {
		return JSON.parse(gitIn(root, 'show', `${ref}:${relPath}`));
	} catch {
		return null;
	}
}

/**
 * Packages whose version changed between `base` and the working tree, with the
 * changeset hashes their new CHANGELOG section lists.
 */
export function collectReleases(base, root = ROOT) {
	const npmDir = path.join(root, 'apps/npm');
	const releases = [];
	for (const entry of fs.readdirSync(npmDir, { withFileTypes: true })) {
		if (!entry.isDirectory() || PLATFORM_PACKAGE.test(entry.name)) continue;

		const rel = `apps/npm/${entry.name}/package.json`;
		const pkgPath = path.join(root, rel);
		if (!fs.existsSync(pkgPath)) continue;

		const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
		const previous = readJsonAt(root, base, rel);
		if (previous && previous.version === pkg.version) continue;

		const changelogPath = path.join(npmDir, entry.name, 'CHANGELOG.md');
		if (!fs.existsSync(changelogPath)) continue;
		const section = sectionFor(fs.readFileSync(changelogPath, 'utf8'), pkg.version);
		if (section === null) continue;

		releases.push({
			name: pkg.name,
			version: pkg.version,
			private: Boolean(pkg.private),
			hashes: changesetHashesIn(section),
		});
	}
	return releases;
}

// ---------------------------------------------------------------------------
// GitHub
// ---------------------------------------------------------------------------

class GitHub {
	constructor(repo, token) {
		this.repo = repo;
		this.token = token;
	}

	async #request(url, init = {}) {
		const response = await fetch(url, {
			...init,
			headers: {
				accept: 'application/vnd.github+json',
				authorization: `Bearer ${this.token}`,
				'x-github-api-version': '2022-11-28',
				...(init.body ? { 'content-type': 'application/json' } : {}),
				...init.headers,
			},
		});
		if (!response.ok) {
			throw new Error(`${init.method ?? 'GET'} ${url} -> ${response.status} ${await response.text()}`);
		}
		return response.json();
	}

	/** The PR a commit was merged through, or null when it was pushed directly. */
	async pullRequestForCommit(sha) {
		const prs = await this.#request(`https://api.github.com/repos/${this.repo}/commits/${sha}/pulls?per_page=100`);
		const merged = prs.filter((pr) => pr.merged_at);
		return (merged[0] ?? prs[0])?.number ?? null;
	}

	/** Issues the PR closes via a `Fixes #N` style reference. */
	async closingIssues(prNumber) {
		const [owner, name] = this.repo.split('/');
		const query = `query($owner:String!,$name:String!,$number:Int!){
			repository(owner:$owner,name:$name){
				pullRequest(number:$number){
					closingIssuesReferences(first:50){nodes{number}}
				}
			}
		}`;
		const body = JSON.stringify({ query, variables: { owner, name, number: prNumber } });
		const result = await this.#request('https://api.github.com/graphql', { method: 'POST', body });
		if (result.errors) throw new Error(`graphql: ${JSON.stringify(result.errors)}`);
		const pr = result.data?.repository?.pullRequest;
		return (pr?.closingIssuesReferences?.nodes ?? []).map((node) => node.number);
	}

	async #comments(issueNumber) {
		const out = [];
		for (let page = 1; ; page++) {
			const batch = await this.#request(
				`https://api.github.com/repos/${this.repo}/issues/${issueNumber}/comments?per_page=100&page=${page}`,
			);
			out.push(...batch);
			if (batch.length < 100) return out;
		}
	}

	/** True when we already said exactly this, so a workflow re-run stays quiet. */
	async alreadyCommented(issueNumber, versionLabels) {
		const existing = await this.#comments(issueNumber);
		return existing.some(
			(comment) =>
				comment.body?.includes(MARKER) && versionLabels.every((label) => comment.body.includes(label)),
		);
	}

	async comment(issueNumber, body) {
		await this.#request(`https://api.github.com/repos/${this.repo}/issues/${issueNumber}/comments`, {
			method: 'POST',
			body: JSON.stringify({ body }),
		});
	}
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(argv) {
	const dryRun = argv.includes('--dry-run') || process.env.DRY_RUN === '1';
	const baseIndex = argv.indexOf('--base');
	const base = baseIndex === -1 ? 'HEAD^' : argv[baseIndex + 1];
	// An unresolvable base makes every package look newly bumped, which would
	// comment the whole history onto every PR.
	if (!base) throw new Error('--base needs a ref.');
	gitIn(ROOT, 'rev-parse', '--verify', `${base}^{commit}`);

	const releases = collectReleases(base);
	if (releases.length === 0) {
		console.log(`No package version changed since ${base}; nothing to comment.`);
		return 0;
	}
	for (const release of releases) {
		console.log(`${release.name}@${release.version}: ${release.hashes.length} changeset(s)`);
	}

	const repo = process.env.GITHUB_REPOSITORY ?? 'baseballyama/rsvelte';
	const token = process.env.GITHUB_TOKEN;
	if (!token && !dryRun) throw new Error('GITHUB_TOKEN is required (use --dry-run to preview).');
	const api = token ? new GitHub(repo, token) : null;

	// hash -> the packages it shipped in. A single changeset can appear in more
	// than one CHANGELOG when it names more than one package.
	const byHash = new Map();
	for (const release of releases) {
		for (const hash of release.hashes) {
			if (!byHash.has(hash)) byHash.set(hash, []);
			byHash.get(hash).push(release);
		}
	}

	// PR -> packages, so a PR carrying two changesets gets one comment.
	const byPr = new Map();
	for (const [hash, packages] of byHash) {
		let sha;
		try {
			sha = gitIn(ROOT, 'rev-parse', '--verify', `${hash}^{commit}`);
		} catch {
			console.warn(`warn: changeset hash ${hash} is not a commit in this checkout; skipping.`);
			continue;
		}
		let pr = api ? await api.pullRequestForCommit(sha) : null;
		if (pr === null) pr = prNumberFromSubject(gitIn(ROOT, 'log', '-1', '--format=%s', sha));
		if (pr === null) {
			console.warn(`warn: no pull request found for ${hash}; skipping.`);
			continue;
		}
		if (!byPr.has(pr)) byPr.set(pr, new Map());
		for (const pkg of packages) byPr.get(pr).set(`${pkg.name}@${pkg.version}`, pkg);
	}

	let failures = 0;
	for (const [pr, packages] of byPr) {
		const list = [...packages.values()].sort((a, b) => a.name.localeCompare(b.name));
		const labels = list.map((pkg) => `${pkg.name}@${pkg.version}`);

		const targets = [{ number: pr, body: commentBody(list, null) }];
		if (api) {
			for (const issue of await api.closingIssues(pr)) {
				targets.push({ number: issue, body: commentBody(list, pr) });
			}
		}

		for (const target of targets) {
			try {
				// Checked in a dry run too: a dedupe that silently never matches
				// only shows up as a duplicate comment on a workflow re-run.
				const already = api ? await api.alreadyCommented(target.number, labels) : false;
				if (dryRun) {
					const prefix = already ? `(already commented) ` : '';
					console.log(`\n--- ${prefix}#${target.number} ---\n${target.body}`);
					continue;
				}
				if (already) {
					console.log(`#${target.number}: already commented; skipping.`);
					continue;
				}
				await api.comment(target.number, target.body);
				console.log(`#${target.number}: commented (${labels.join(', ')}).`);
			} catch (error) {
				console.error(`#${target.number}: ${error.message}`);
				failures++;
			}
		}
	}
	return failures === 0 ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main(process.argv.slice(2)).then(
		(code) => process.exit(code),
		(error) => {
			console.error(error);
			process.exit(1);
		},
	);
}
