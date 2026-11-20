// The layout that tools/README.md sets for every tool, checked against each tool's tracked files.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

type Manifest = {
	name?: unknown;
	description?: unknown;
	exports?: unknown;
	scripts?: Record<string, string>;
};

type Tool = { name: string; files: string[]; read(file: string): string };

const root = resolve(import.meta.dirname, '../..');

function tools(): Tool[] {
	const paths = execFileSync('git', ['ls-files', '-z', '--', 'tools'], {
		cwd: root,
		encoding: 'utf8',
	})
		.split('\0')
		.flatMap((file) => {
			const [, name, rest] = /^tools\/([^/]+)\/(.+)$/.exec(file) ?? [];
			return name === undefined || rest === undefined ? [] : [{ name, rest }];
		});
	return [...Map.groupBy(paths, (entry) => entry.name)].map(([name, files]) => ({
		name,
		files: files.map((file) => file.rest),
		read: (file) => readFileSync(resolve(root, 'tools', name, file), 'utf8'),
	}));
}

/** Every rule a tool breaks, as one line each. */
function violations(tool: Tool): string[] {
	const failures: string[] = [];
	const fail = (rule: string) => failures.push(`tools/${tool.name}: ${rule}`);
	const entry = `${tool.name}.ts`;
	for (const file of ['README.md', 'package.json', 'tsconfig.json', entry]) {
		if (!tool.files.includes(file)) fail(`Files: ${file} is missing`);
	}
	if (!tool.files.includes('package.json')) return failures;
	const manifest = JSON.parse(tool.read('package.json')) as Manifest;
	const scripts = manifest.scripts ?? {};
	if (manifest.name !== `@rsvelte-experimental/${tool.name}`)
		fail(`Package: the name is not @rsvelte-experimental/${tool.name}`);
	if (typeof manifest.description !== 'string' || !manifest.description.trim())
		fail('Package: the description is missing');
	const library = manifest.exports !== undefined;
	if (library && manifest.exports !== `./${entry}`) fail(`Commands: a library exports ./${entry}`);
	if (library && Object.hasOwn(scripts, tool.name)) fail('Commands: a library has no commands');
	if (!library && scripts[tool.name] !== `node ${entry}`)
		fail(`Scripts: "${tool.name}" is not "node ${entry}"`);
	if (scripts.typecheck !== 'node ../../node_modules/typescript-7/bin/tsc -p .')
		fail('Scripts: "typecheck" is not the shared tsc command');
	const tests = tool.files.some((file) => file.endsWith('.test.ts'));
	if (tests !== (scripts.test === "node --test '*.test.ts' '*/*.test.ts'"))
		fail(tests ? 'Scripts: "test" is not the shared command' : 'Scripts: "test" runs no test');
	for (const file of tool.files) {
		const name = file.split('/').at(-1) ?? file;
		if (
			name.endsWith('.ts') &&
			!file.split('/').includes('tests') &&
			!/^[a-z0-9]+(-[a-z0-9]+)*(\.test|\.d)?\.ts$/.test(name)
		)
			fail(`Names: ${file} is not kebab-case`);
	}
	if (!library && tool.files.includes(entry)) {
		const source = tool.read(entry);
		if (!source.startsWith(`// ${tool.name}`))
			fail(`Entry: ${entry} does not start with its usage`);
		for (const [, command, module] of source.matchAll(
			/^\t'?([a-z-]+)'?: \(\) => import\('\.\/([^']+)'\)/gm,
		)) {
			if (module !== `${command}.ts`) fail(`Commands: ${command} is not ${command}.ts`);
			if (!new RegExp(`^//   ${command}\\b`, 'm').test(source))
				fail(`Entry: the header does not list ${command}`);
		}
	}
	return failures;
}

test('every tool follows the layout in tools/README.md', () => {
	const all = tools();
	assert.ok(all.length >= 8, `found only ${all.length} tools`);
	assert.deepEqual(all.flatMap(violations), []);
	const tsconfigs = new Set(all.map((tool) => tool.read('tsconfig.json')));
	assert.equal(tsconfigs.size, 1, 'Files: every tsconfig.json is the same');
});
