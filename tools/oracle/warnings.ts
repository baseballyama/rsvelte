import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

type Schema = { name: string; attributes?: { name: string; value?: string }[] };

const version = (installed: string): string =>
	JSON.parse(readFileSync(path.join(installed, 'package.json'), 'utf8')).version;

const string = (text: string): string => {
	assert.match(text, /^[\w:-]*$/);
	return `"${text}"`;
};

const strings = (name: string, type: string, values: string[]): string =>
	`pub(super) static ${name}: ${type} = &[\n${values.map((value) => `    ${string(value)},\n`).join('')}];\n`;

// `match_schema` compares a value only when it is truthy, so an empty one means "present".
const schemas = (name: string, values: Schema[]): string =>
	`pub(super) static ${name}: &[Schema] = &[\n${values
		.map(
			(schema) =>
				`    (${string(schema.name)}, &[${(schema.attributes ?? [])
					.map(
						(attribute) =>
							`(${string(attribute.name)}, ${attribute.value ? `Some(${string(attribute.value)})` : 'None'})`,
					)
					.join(', ')}]),\n`,
		)
		.join('')}];\n`;

// `oracle warnings`: vendor the warning codes `svelte-ignore` accepts and the a11y tables that
// Svelte derives from aria-query and axobject-query, from the svelte this package installs.
export async function main(): Promise<void> {
	const require = createRequire(path.join(import.meta.dirname, 'package.json'));
	const root = fileURLToPath(new URL('../../', import.meta.url));
	const directory = path.join(root, 'crates/languages/svelte/core/src/warnings/vendor');
	const svelte = path.dirname(realpathSync(require.resolve('svelte/package.json')));
	const from = createRequire(path.join(svelte, 'package.json'));
	const aria = path.dirname(from.resolve('aria-query/package.json'));
	const axobject = path.dirname(from.resolve('axobject-query/package.json'));
	const load = (file: string): Promise<Record<string, unknown>> =>
		import(pathToFileURL(path.join(svelte, 'src', file)).href);

	const warnings = await load('compiler/warnings.js');
	const constants = await load('constants.js');
	// `extract_svelte_ignore` accepts exactly this concatenation.
	const codes = [
		...(warnings.codes as string[]),
		...(constants.IGNORABLE_RUNTIME_WARNINGS as string[]),
	];
	const a11y = await load('compiler/phases/2-analyze/visitors/shared/a11y/constants.js');

	mkdirSync(directory, { recursive: true });
	writeFileSync(
		path.join(directory, 'codes.rs'),
		`// svelte ${version(svelte)}\n[\n${codes.map((code) => `    ${string(code)},\n`).join('')}]\n`,
	);
	writeFileSync(
		path.join(directory, 'a11y.rs'),
		[
			`// svelte ${version(svelte)}, aria-query ${version(aria)}, axobject-query ${version(axobject)}\n`,
			strings('INTERACTIVE_ROLES', '&[&str]', a11y.interactive_roles as string[]),
			schemas('INTERACTIVE_ELEMENT_ROLES', a11y.interactive_element_role_schemas as Schema[]),
			schemas(
				'NON_INTERACTIVE_ELEMENT_ROLES',
				a11y.non_interactive_element_role_schemas as Schema[],
			),
			schemas(
				'INTERACTIVE_ELEMENT_AX_OBJECTS',
				a11y.interactive_element_ax_object_schemas as Schema[],
			),
			schemas(
				'NON_INTERACTIVE_ELEMENT_AX_OBJECTS',
				a11y.non_interactive_element_ax_object_schemas as Schema[],
			),
		].join('\n'),
	);
	copyFileSync(path.join(svelte, 'LICENSE.md'), path.join(directory, 'LICENSE.svelte.md'));
	copyFileSync(path.join(aria, 'LICENSE'), path.join(directory, 'LICENSE.aria-query.md'));
	copyFileSync(path.join(axobject, 'LICENSE'), path.join(directory, 'LICENSE.axobject-query.md'));
	writeFileSync(
		path.join(directory, 'README.md'),
		[
			'Data printed from the MIT-licensed Svelte compiler. `codes.rs` lists the warning codes',
			'`svelte-ignore` accepts (`compiler/warnings.js` `codes`, then `IGNORABLE_RUNTIME_WARNINGS`).',
			'`a11y.rs` holds the tables `a11y/constants.js` derives from the Apache-2.0-licensed',
			'aria-query and axobject-query. The first line of each file names the versions, which a test',
			'compares with `tools/oracle/package.json`.',
			'',
			'Regenerate with `mise exec -- node tools/oracle/oracle.ts warnings`.',
			'',
		].join('\n'),
	);
	console.log(`Wrote ${codes.length} warning codes and the a11y tables`);
}
