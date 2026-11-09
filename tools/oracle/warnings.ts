import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

type Schema = { name: string; attributes?: { name: string; value?: string }[] };
type Lookup<K, V> = { keys(): K[]; get(key: K): V | undefined; entries(): [K, V][] };
type Role = { abstract: boolean; props: object; requiredProps: object };
type Property = { type: string; values?: unknown[] };

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

const list = (values: string[]): string => `&[${values.map(string).join(', ')}]`;

// One `(key, &[…])` row per entry, for a map from a name to names.
const lists = (name: string, entries: [string, string[]][]): string =>
	`pub(super) static ${name}: &[(&str, &[&str])] = &[\n${entries
		.map(([key, values]) => `    (${string(key)}, ${list(values)}),\n`)
		.join('')}];\n`;

const pairs = (name: string, entries: [string, string][]): string =>
	`pub(super) static ${name}: &[(&str, &str)] = &[\n${entries
		.map(([key, value]) => `    (${string(key)}, ${string(value)}),\n`)
		.join('')}];\n`;

const record = (value: unknown): [string, string[]][] =>
	Object.entries(value as Record<string, string[]>);

const map = (value: unknown): [string, string][] => [...(value as Map<string, string>)];

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
	// The packages `a11y/index.js` reads directly, as the svelte above resolves them.
	const { roles, aria: properties } = from('aria-query') as {
		roles: Lookup<string, Role>;
		aria: Lookup<string, Property>;
	};
	const { AXObjectRoles, elementAXObjects } = from('axobject-query') as {
		AXObjectRoles: Lookup<string, Set<{ name: string }>>;
		elementAXObjects: Lookup<Schema, Set<string>>;
	};
	// `is_semantic_role_element`: each element schema with every role its AX objects map to.
	const semantic: [Schema, string[]][] = elementAXObjects
		.entries()
		.map(([schema, objects]) => [
			schema,
			[...objects].flatMap((object) => [...(AXObjectRoles.get(object) ?? [])].map((r) => r.name)),
		]);

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
			strings('NON_INTERACTIVE_ROLES', '&[&str]', a11y.non_interactive_roles as string[]),
			strings('ARIA_ROLES', '&[&str]', a11y.aria_roles as string[]),
			strings('ABSTRACT_ROLES', '&[&str]', a11y.abstract_roles as string[]),
			strings('PRESENTATION_ROLES', '&[&str]', a11y.presentation_roles as string[]),
			strings('ARIA_ATTRIBUTES', '&[&str]', a11y.aria_attributes as string[]),
			strings('INVISIBLE_ELEMENTS', '&[&str]', a11y.invisible_elements as string[]),
			strings('DISTRACTING_ELEMENTS', '&[&str]', a11y.a11y_distracting_elements as string[]),
			strings('REQUIRED_CONTENT', '&[&str]', a11y.a11y_required_content as string[]),
			strings('LABELABLE', '&[&str]', a11y.a11y_labelable as string[]),
			strings('INTERACTIVE_HANDLERS', '&[&str]', a11y.a11y_interactive_handlers as string[]),
			strings(
				'RECOMMENDED_INTERACTIVE_HANDLERS',
				'&[&str]',
				a11y.a11y_recommended_interactive_handlers as string[],
			),
			strings('COMBOBOX_IF_LIST', '&[&str]', a11y.combobox_if_list as string[]),
			strings('ADDRESS_TYPE_TOKENS', '&[&str]', a11y.address_type_tokens as string[]),
			strings('AUTOFILL_FIELD_NAME_TOKENS', '&[&str]', a11y.autofill_field_name_tokens as string[]),
			strings('CONTACT_TYPE_TOKENS', '&[&str]', a11y.contact_type_tokens as string[]),
			strings(
				'AUTOFILL_CONTACT_FIELD_NAME_TOKENS',
				'&[&str]',
				a11y.autofill_contact_field_name_tokens as string[],
			),
			lists('REQUIRED_ATTRIBUTES', record(a11y.a11y_required_attributes)),
			lists(
				'NON_INTERACTIVE_ELEMENT_TO_INTERACTIVE_ROLE_EXCEPTIONS',
				record(a11y.a11y_non_interactive_element_to_interactive_role_exceptions),
			),
			pairs('IMPLICIT_SEMANTICS', map(a11y.a11y_implicit_semantics)),
			pairs('NESTED_IMPLICIT_SEMANTICS', map(a11y.a11y_nested_implicit_semantics)),
			pairs('MENUITEM_TYPE_TO_IMPLICIT_ROLE', map(a11y.menuitem_type_to_implicit_role)),
			pairs('INPUT_TYPE_TO_IMPLICIT_ROLE', map(a11y.input_type_to_implicit_role)),
			'/// aria-query `roles`: each role with its `props` and `requiredProps` keys.\n' +
				`pub(super) static ROLES: &[(&str, &[&str], &[&str])] = &[\n${roles
					.entries()
					.map(
						([name, role]) =>
							`    (${string(name)}, ${list(Object.keys(role.props))}, ${list(Object.keys(role.requiredProps))}),\n`,
					)
					.join('')}];\n`,
			'/// aria-query `aria`: each property with its type and allowed values.\n' +
				`pub(super) static PROPERTIES: &[(&str, &str, &[&str])] = &[\n${properties
					.entries()
					.map(
						([name, property]) =>
							`    (${string(name)}, ${string(property.type)}, ${list((property.values ?? []).map(String))}),\n`,
					)
					.join('')}];\n`,
			"/// axobject-query `elementAXObjects` with the roles of each schema's AX objects.\n" +
				`pub(super) static SEMANTIC_ROLE_ELEMENTS: &[(Schema, &[&str])] = &[\n${semantic
					.map(
						([schema, names]) =>
							`    ((${string(schema.name)}, &[${(schema.attributes ?? [])
								.map(
									(attribute) =>
										`(${string(attribute.name)}, ${attribute.value === undefined ? 'None' : `Some(${string(attribute.value)})`})`,
								)
								.join(', ')}]), ${list(names)}),\n`,
					)
					.join('')}];\n`,
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
