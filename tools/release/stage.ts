// Writes the npm packages of a release: one per platform with the programs its build made, and
// `rsvelte`, which depends on all of them and starts the one npm installed for the machine.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const ROOT = path.resolve(import.meta.dirname, '../..');

/** Each platform a release builds, by its Rust target, and the npm package that carries it. */
export const PLATFORMS = [
	{ target: 'aarch64-apple-darwin', os: 'darwin', cpu: 'arm64', suffix: 'darwin-arm64' },
	{ target: 'x86_64-apple-darwin', os: 'darwin', cpu: 'x64', suffix: 'darwin-x64' },
	{ target: 'aarch64-unknown-linux-gnu', os: 'linux', cpu: 'arm64', suffix: 'linux-arm64-gnu' },
	{ target: 'x86_64-unknown-linux-gnu', os: 'linux', cpu: 'x64', suffix: 'linux-x64-gnu' },
	{ target: 'x86_64-pc-windows-msvc', os: 'win32', cpu: 'x64', suffix: 'win32-x64-msvc' },
] as const;

/** The programs each platform package holds: the command, and the content mapper it starts. */
export const PROGRAMS = ['rsvelte', 'rsvelte-svelte-content-mapper'] as const;

/** The tsrs releases `rsvelte typecheck` is tested with. */
export const TSRS = '>=7.1.0-beta.tsrs2 <7.2.0';

const REPOSITORY = { type: 'git', url: 'git+https://github.com/baseballyama/rsvelte.git' };
const DESCRIPTION = 'Lint, format and type check Svelte and TypeScript, fast';

/** The package people install; npm refuses `rsvelte` as too close to `svelte`. */
export const COMMAND_PACKAGE = '@rsvelte/cli';

/** Turns off in ESLint the rules `rsvelte lint` runs; npm refuses `eslint-plugin-rsvelte` as too close to `eslint-plugin-svelte`. */
export const ESLINT_PLUGIN_PACKAGE = '@rsvelte/eslint-plugin';

const ESLINT_PLUGIN = path.join(ROOT, 'apps/eslint-plugin');

export const packageName = (platform: (typeof PLATFORMS)[number]) =>
	`@rsvelte/cli-${platform.suffix}`;

/** The version in `[workspace.package]` of a Cargo.toml. */
export function cargoVersion(manifest: string): string {
	const section = /^\[workspace\.package\]$([\s\S]*?)(?=^\[|$(?![\s\S]))/m.exec(manifest)?.[1];
	const version = section && /^version = "([^"]+)"$/m.exec(section)?.[1];
	if (!version) throw new Error('Cargo.toml has no [workspace.package] version');
	return version;
}

/**
 * Writes every package below `out`, and returns their directories in the order to publish them:
 * the command package last, so it never names a package that is not there yet.
 */
export function stage(artifacts: string, out: string, version: string): string[] {
	fs.mkdirSync(out, { recursive: true });
	const license = fs.readFileSync(path.join(ROOT, 'LICENSE'));
	const write = (directory: string, manifest: object) => {
		fs.mkdirSync(directory, { recursive: true });
		fs.writeFileSync(
			path.join(directory, 'package.json'),
			`${JSON.stringify(manifest, null, '\t')}\n`,
		);
		fs.writeFileSync(path.join(directory, 'LICENSE'), license);
	};
	const order: string[] = [];
	const eslintPlugin = path.join(out, 'eslint-plugin');
	// The workspace manifest names what ships; its dependencies are the tests'.
	const workspace = JSON.parse(fs.readFileSync(path.join(ESLINT_PLUGIN, 'package.json'), 'utf8'));
	write(eslintPlugin, {
		name: ESLINT_PLUGIN_PACKAGE,
		version,
		description: 'Turn off all rules already supported by rsvelte',
		keywords: ['eslint', 'eslintplugin', 'eslint-plugin', 'svelte', 'rsvelte', 'rules'],
		license: 'MIT',
		repository: { ...REPOSITORY, directory: 'apps/eslint-plugin' },
		type: 'module',
		exports: workspace.exports,
		files: workspace.files,
		engines: { node: '>=18.18' },
	});
	for (const file of [...workspace.files, 'README.md'])
		fs.copyFileSync(path.join(ESLINT_PLUGIN, file), path.join(eslintPlugin, file));
	order.push(eslintPlugin);
	for (const platform of PLATFORMS) {
		const directory = path.join(out, `cli-${platform.suffix}`);
		const extension = platform.os === 'win32' ? '.exe' : '';
		const files = PROGRAMS.map((program) => `${program}${extension}`);
		write(directory, {
			name: packageName(platform),
			version,
			description: `The ${platform.suffix} build of rsvelte`,
			license: 'MIT',
			repository: REPOSITORY,
			os: [platform.os],
			cpu: [platform.cpu],
			...(platform.os === 'linux' ? { libc: ['glibc'] } : {}),
			files,
			preferUnplugged: true,
		});
		for (const file of files) {
			const built = path.join(artifacts, platform.target, file);
			if (!fs.existsSync(built)) throw new Error(`${built} is missing`);
			fs.copyFileSync(built, path.join(directory, file));
			fs.chmodSync(path.join(directory, file), 0o755);
		}
		order.push(directory);
	}
	const command = path.join(out, 'cli');
	write(command, {
		name: COMMAND_PACKAGE,
		version,
		description: DESCRIPTION,
		keywords: ['svelte', 'lint', 'format', 'typecheck', 'typescript'],
		license: 'MIT',
		repository: REPOSITORY,
		type: 'module',
		bin: { rsvelte: 'bin/rsvelte.js' },
		files: ['bin', 'platforms.json', 'CHANGELOG.md'],
		engines: { node: '>=18' },
		optionalDependencies: Object.fromEntries(PLATFORMS.map((p) => [packageName(p), version])),
		peerDependencies: { tsrs: TSRS },
		peerDependenciesMeta: { tsrs: { optional: true } },
	});
	fs.mkdirSync(path.join(command, 'bin'), { recursive: true });
	const cli = path.join(ROOT, 'apps/cli');
	fs.copyFileSync(path.join(cli, 'launcher.js'), path.join(command, 'bin/rsvelte.js'));
	fs.chmodSync(path.join(command, 'bin/rsvelte.js'), 0o755);
	fs.copyFileSync(path.join(cli, 'README.md'), path.join(command, 'README.md'));
	fs.copyFileSync(path.join(cli, 'CHANGELOG.md'), path.join(command, 'CHANGELOG.md'));
	const platforms = Object.fromEntries(PLATFORMS.map((p) => [`${p.os}-${p.cpu}`, packageName(p)]));
	fs.writeFileSync(
		path.join(command, 'platforms.json'),
		`${JSON.stringify(platforms, null, '\t')}\n`,
	);
	order.push(command);
	return order;
}

export async function main(args: string[]): Promise<void> {
	const { values } = parseArgs({
		args,
		options: {
			artifacts: { type: 'string' },
			out: { type: 'string' },
		},
	});
	if (!values.artifacts || !values.out) throw new Error('stage needs --artifacts and --out');
	const version = cargoVersion(fs.readFileSync(path.join(ROOT, 'Cargo.toml'), 'utf8'));
	const versioned = JSON.parse(fs.readFileSync(path.join(ROOT, 'apps/cli/package.json'), 'utf8'));
	if (versioned.version !== version)
		throw new Error(
			`apps/cli/package.json is ${versioned.version} but Cargo.toml is ${version}; run node tools/release/release.ts version`,
		);
	for (const directory of stage(values.artifacts, values.out, version)) console.log(directory);
}
