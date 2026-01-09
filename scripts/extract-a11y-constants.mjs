#!/usr/bin/env node

/**
 * Extract a11y constants from Svelte compiler for Rust implementation.
 * This script imports the constants.js file and extracts all the values.
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import from the Svelte submodule
const constantsPath = join(
	__dirname,
	'../svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/shared/a11y/constants.js'
);

const constants = await import(constantsPath);

// Helper to convert Map to array of tuples
function mapToArray(map) {
	return Array.from(map.entries());
}

// Helper to convert Set to array
function setToArray(set) {
	return Array.from(set);
}

// Helper to serialize schema objects
function serializeSchema(schema) {
	return {
		name: schema.name,
		attributes: schema.attributes || null
	};
}

const output = {
	aria_attributes: constants.aria_attributes,
	a11y_required_attributes: constants.a11y_required_attributes,
	a11y_distracting_elements: constants.a11y_distracting_elements,
	a11y_required_content: constants.a11y_required_content,
	a11y_labelable: constants.a11y_labelable,
	a11y_interactive_handlers: constants.a11y_interactive_handlers,
	a11y_recommended_interactive_handlers: constants.a11y_recommended_interactive_handlers,
	a11y_nested_implicit_semantics: mapToArray(constants.a11y_nested_implicit_semantics),
	a11y_implicit_semantics: mapToArray(constants.a11y_implicit_semantics),
	menuitem_type_to_implicit_role: mapToArray(constants.menuitem_type_to_implicit_role),
	input_type_to_implicit_role: mapToArray(constants.input_type_to_implicit_role),
	a11y_non_interactive_element_to_interactive_role_exceptions:
		constants.a11y_non_interactive_element_to_interactive_role_exceptions,
	combobox_if_list: constants.combobox_if_list,
	address_type_tokens: constants.address_type_tokens,
	autofill_field_name_tokens: constants.autofill_field_name_tokens,
	contact_type_tokens: constants.contact_type_tokens,
	autofill_contact_field_name_tokens: constants.autofill_contact_field_name_tokens,
	ElementInteractivity: constants.ElementInteractivity,
	invisible_elements: constants.invisible_elements,
	aria_roles: setToArray(constants.aria_roles),
	abstract_roles: setToArray(constants.abstract_roles),
	non_interactive_roles: constants.non_interactive_roles,
	interactive_roles: constants.interactive_roles,
	presentation_roles: constants.presentation_roles,
	non_interactive_element_role_schemas: constants.non_interactive_element_role_schemas.map(
		serializeSchema
	),
	interactive_element_role_schemas:
		constants.interactive_element_role_schemas.map(serializeSchema),
	interactive_element_ax_object_schemas: constants.interactive_element_ax_object_schemas.map(
		serializeSchema
	),
	non_interactive_element_ax_object_schemas:
		constants.non_interactive_element_ax_object_schemas.map(serializeSchema)
};

const outputPath = join(__dirname, '../a11y-constants.json');
writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`Extracted a11y constants to ${outputPath}`);
