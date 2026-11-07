// `oracle upstream <name> <checkout>`: copy an upstream project's own test fixtures, byte for
// byte, into tests/upstream/ of the crate that ports it, which reads them the way the
// project's test runner does. UPSTREAM.json records the commit, and the oracle versions that
// the fixtures' requirements files are checked against.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

interface Upstream {
	repository: string;
	/** Where the copy goes, from the repository root. */
	target: string;
	/** The fixture directory inside the checkout. */
	fixtures: string;
	/** The package whose version the checkout must have: the oracle's. */
	package: { name: string; manifest: string };
	license: { file: string; spdx: string };
	/** Packages the fixtures' requirements files name. */
	versions: string[];
}

const UPSTREAMS: Record<string, Upstream> = {
	'eslint-plugin-svelte': {
		repository: 'https://github.com/sveltejs/eslint-plugin-svelte',
		target: 'crates/languages/svelte/lint/tests/upstream/eslint-plugin-svelte',
		fixtures: 'packages/eslint-plugin-svelte/tests/fixtures/rules',
		package: {
			name: 'eslint-plugin-svelte',
			manifest: 'packages/eslint-plugin-svelte/package.json',
		},
		license: { file: 'LICENSE', spdx: 'MIT' },
		versions: ['svelte', 'eslint', 'typescript', '@typescript-eslint/parser'],
	},
};

export async function main(args: string[]): Promise<void> {
	const [name = '', checkoutArgument] = args;
	const upstream = UPSTREAMS[name];
	if (!upstream || !checkoutArgument)
		throw new Error(`usage: oracle upstream <${Object.keys(UPSTREAMS).join('|')}> <checkout>`);
	const root = path.resolve(import.meta.dirname, '../..');
	const checkout = fs.realpathSync(checkoutArgument);
	const require = createRequire(path.join(import.meta.dirname, 'package.json'));
	const version = (pkg: string): string => require(`${pkg}/package.json`).version;
	const checkoutVersion = JSON.parse(
		fs.readFileSync(path.join(checkout, upstream.package.manifest), 'utf8'),
	).version;
	if (checkoutVersion !== version(upstream.package.name))
		throw new Error(
			`the checkout is ${upstream.package.name} ${checkoutVersion}, the oracle ${version(upstream.package.name)}: check out the oracle's tag`,
		);
	const git = (...argv: string[]) =>
		execFileSync('git', ['-C', checkout, ...argv], { encoding: 'utf8' }).trim();
	if (git('status', '--porcelain', '--', upstream.fixtures) !== '')
		throw new Error(`${upstream.fixtures} has local changes in the checkout`);

	const target = path.join(root, upstream.target);
	fs.rmSync(target, { recursive: true, force: true });
	fs.mkdirSync(target, { recursive: true });
	// Only tracked files: a test run in the checkout may have left output next to them.
	const files = git('ls-files', '-z', '--', upstream.fixtures).split('\0').filter(Boolean);
	for (const file of files) {
		const to = path.join(target, path.relative(upstream.fixtures, file));
		fs.mkdirSync(path.dirname(to), { recursive: true });
		fs.copyFileSync(path.join(checkout, file), to);
	}
	fs.copyFileSync(path.join(checkout, upstream.license.file), path.join(target, 'LICENSE'));
	const record = {
		repository: upstream.repository,
		commit: git('rev-parse', 'HEAD'),
		fixtures: upstream.fixtures,
		license: upstream.license.spdx,
		versions: Object.fromEntries(
			[upstream.package.name, ...upstream.versions].map((pkg) => [pkg, version(pkg)]),
		),
	};
	fs.writeFileSync(path.join(target, 'UPSTREAM.json'), JSON.stringify(record, null, '\t') + '\n');
	console.log(
		`copied ${files.length} files from ${name} ${record.commit} to ${path.relative(root, target)}`,
	);
}
