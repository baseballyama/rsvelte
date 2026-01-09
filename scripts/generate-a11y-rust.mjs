#!/usr/bin/env node

/**
 * Generate Rust code for a11y constants from extracted JSON.
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const jsonPath = join(__dirname, '../a11y-constants.json');
const data = JSON.parse(readFileSync(jsonPath, 'utf-8'));

// Generate constants.rs
function generateConstants() {
	let code = `//! A11y constants.
//!
//! Valid ARIA attributes, roles, and other accessibility-related constants.
//!
//! Corresponds to Svelte's \`2-analyze/visitors/shared/a11y/constants.js\`.
//!
//! This file is auto-generated from the official Svelte compiler.
//! Do not edit manually.

use std::collections::{HashMap, HashSet};
use std::sync::LazyLock;

/// ARIA attributes list.
pub const ARIA_ATTRIBUTES: &[&str] = &[
${data.aria_attributes.map((a) => `    "${a}"`).join(',\n')}
];

/// Required attributes for specific elements.
pub static A11Y_REQUIRED_ATTRIBUTES: LazyLock<HashMap<&'static str, &'static [&'static str]>> = LazyLock::new(|| {
    let mut m = HashMap::new();
${Object.entries(data.a11y_required_attributes)
	.map(
		([element, attrs]) =>
			`    m.insert("${element}", &[${attrs.map((a) => `"${a}"`).join(', ')}] as &[&str]);`
	)
	.join('\n')}
    m
});

/// Distracting elements.
pub const A11Y_DISTRACTING_ELEMENTS: &[&str] = &[
${data.a11y_distracting_elements.map((e) => `    "${e}"`).join(',\n')}
];

/// Elements that require content.
pub const A11Y_REQUIRED_CONTENT: &[&str] = &[
${data.a11y_required_content.map((e) => `    "${e}"`).join(',\n')}
];

/// Labelable elements.
pub const A11Y_LABELABLE: &[&str] = &[
${data.a11y_labelable.map((e) => `    "${e}"`).join(',\n')}
];

/// Interactive event handlers.
pub const A11Y_INTERACTIVE_HANDLERS: &[&str] = &[
${data.a11y_interactive_handlers.map((h) => `    "${h}"`).join(',\n')}
];

/// Recommended interactive event handlers.
pub const A11Y_RECOMMENDED_INTERACTIVE_HANDLERS: &[&str] = &[
${data.a11y_recommended_interactive_handlers.map((h) => `    "${h}"`).join(',\n')}
];

/// Nested implicit semantics map.
pub static A11Y_NESTED_IMPLICIT_SEMANTICS: LazyLock<HashMap<&'static str, &'static str>> = LazyLock::new(|| {
    let mut m = HashMap::new();
${data.a11y_nested_implicit_semantics.map(([k, v]) => `    m.insert("${k}", "${v}");`).join('\n')}
    m
});

/// Implicit semantics map.
pub static A11Y_IMPLICIT_SEMANTICS: LazyLock<HashMap<&'static str, &'static str>> = LazyLock::new(|| {
    let mut m = HashMap::new();
${data.a11y_implicit_semantics.map(([k, v]) => `    m.insert("${k}", "${v}");`).join('\n')}
    m
});

/// Menuitem type to implicit role map.
pub static MENUITEM_TYPE_TO_IMPLICIT_ROLE: LazyLock<HashMap<&'static str, &'static str>> = LazyLock::new(|| {
    let mut m = HashMap::new();
${data.menuitem_type_to_implicit_role.map(([k, v]) => `    m.insert("${k}", "${v}");`).join('\n')}
    m
});

/// Input type to implicit role map.
pub static INPUT_TYPE_TO_IMPLICIT_ROLE: LazyLock<HashMap<&'static str, &'static str>> = LazyLock::new(|| {
    let mut m = HashMap::new();
${data.input_type_to_implicit_role.map(([k, v]) => `    m.insert("${k}", "${v}");`).join('\n')}
    m
});

/// Non-interactive element to interactive role exceptions.
pub static A11Y_NON_INTERACTIVE_ELEMENT_TO_INTERACTIVE_ROLE_EXCEPTIONS: LazyLock<HashMap<&'static str, &'static [&'static str]>> = LazyLock::new(|| {
    let mut m = HashMap::new();
${Object.entries(data.a11y_non_interactive_element_to_interactive_role_exceptions)
	.map(
		([element, roles]) =>
			`    m.insert("${element}", &[${roles.map((r) => `"${r}"`).join(', ')}] as &[&str]);`
	)
	.join('\n')}
    m
});

/// Combobox if list.
pub const COMBOBOX_IF_LIST: &[&str] = &[
${data.combobox_if_list.map((t) => `    "${t}"`).join(',\n')}
];

/// Address type tokens.
pub const ADDRESS_TYPE_TOKENS: &[&str] = &[
${data.address_type_tokens.map((t) => `    "${t}"`).join(',\n')}
];

/// Autofill field name tokens.
pub const AUTOFILL_FIELD_NAME_TOKENS: &[&str] = &[
${data.autofill_field_name_tokens.map((t) => `    "${t}"`).join(',\n')}
];

/// Contact type tokens.
pub const CONTACT_TYPE_TOKENS: &[&str] = &[
${data.contact_type_tokens.map((t) => `    "${t}"`).join(',\n')}
];

/// Autofill contact field name tokens.
pub const AUTOFILL_CONTACT_FIELD_NAME_TOKENS: &[&str] = &[
${data.autofill_contact_field_name_tokens.map((t) => `    "${t}"`).join(',\n')}
];

/// Element interactivity enum values.
pub mod element_interactivity {
    pub const INTERACTIVE: &str = "${data.ElementInteractivity.Interactive}";
    pub const NON_INTERACTIVE: &str = "${data.ElementInteractivity.NonInteractive}";
    pub const STATIC: &str = "${data.ElementInteractivity.Static}";
}

/// Invisible elements.
pub const INVISIBLE_ELEMENTS: &[&str] = &[
${data.invisible_elements.map((e) => `    "${e}"`).join(',\n')}
];

/// All ARIA roles.
pub static ARIA_ROLES: LazyLock<HashSet<&'static str>> = LazyLock::new(|| {
    let mut s = HashSet::new();
${data.aria_roles.map((r) => `    s.insert("${r}");`).join('\n')}
    s
});

/// Abstract ARIA roles.
pub static ABSTRACT_ROLES: LazyLock<HashSet<&'static str>> = LazyLock::new(|| {
    let mut s = HashSet::new();
${data.abstract_roles.map((r) => `    s.insert("${r}");`).join('\n')}
    s
});

/// Non-interactive roles.
pub const NON_INTERACTIVE_ROLES: &[&str] = &[
${data.non_interactive_roles.map((r) => `    "${r}"`).join(',\n')}
];

/// Interactive roles.
pub const INTERACTIVE_ROLES: &[&str] = &[
${data.interactive_roles.map((r) => `    "${r}"`).join(',\n')}
];

/// Presentation roles.
pub const PRESENTATION_ROLES: &[&str] = &[
${data.presentation_roles.map((r) => `    "${r}"`).join(',\n')}
];

/// Schema for role relation concept.
#[derive(Debug, Clone)]
pub struct RoleRelationConcept {
    pub name: String,
    pub attributes: Option<Vec<RoleRelationConceptAttribute>>,
}

/// Schema attribute for role relation concept.
#[derive(Debug, Clone)]
pub struct RoleRelationConceptAttribute {
    pub name: String,
    pub value: Option<String>,
}

/// Non-interactive element role schemas.
pub static NON_INTERACTIVE_ELEMENT_ROLE_SCHEMAS: LazyLock<Vec<RoleRelationConcept>> = LazyLock::new(|| {
    vec![
${data.non_interactive_element_role_schemas
	.map((schema) => {
		const attrs = schema.attributes
			? `Some(vec![${schema.attributes
					.map(
						(attr) =>
							`RoleRelationConceptAttribute { name: "${attr.name}".to_string(), value: ${attr.value ? `Some("${attr.value}".to_string())` : 'None'} }`
					)
					.join(', ')}])`
			: 'None';
		return `        RoleRelationConcept { name: "${schema.name}".to_string(), attributes: ${attrs} }`;
	})
	.join(',\n')}
    ]
});

/// Interactive element role schemas.
pub static INTERACTIVE_ELEMENT_ROLE_SCHEMAS: LazyLock<Vec<RoleRelationConcept>> = LazyLock::new(|| {
    vec![
${data.interactive_element_role_schemas
	.map((schema) => {
		const attrs = schema.attributes
			? `Some(vec![${schema.attributes
					.map(
						(attr) =>
							`RoleRelationConceptAttribute { name: "${attr.name}".to_string(), value: ${attr.value ? `Some("${attr.value}".to_string())` : 'None'} }`
					)
					.join(', ')}])`
			: 'None';
		return `        RoleRelationConcept { name: "${schema.name}".to_string(), attributes: ${attrs} }`;
	})
	.join(',\n')}
    ]
});

/// Interactive element AX object schemas.
pub static INTERACTIVE_ELEMENT_AX_OBJECT_SCHEMAS: LazyLock<Vec<RoleRelationConcept>> = LazyLock::new(|| {
    vec![
${data.interactive_element_ax_object_schemas
	.map((schema) => {
		const attrs = schema.attributes
			? `Some(vec![${schema.attributes
					.map(
						(attr) =>
							`RoleRelationConceptAttribute { name: "${attr.name}".to_string(), value: ${attr.value ? `Some("${attr.value}".to_string())` : 'None'} }`
					)
					.join(', ')}])`
			: 'None';
		return `        RoleRelationConcept { name: "${schema.name}".to_string(), attributes: ${attrs} }`;
	})
	.join(',\n')}
    ]
});

/// Non-interactive element AX object schemas.
pub static NON_INTERACTIVE_ELEMENT_AX_OBJECT_SCHEMAS: LazyLock<Vec<RoleRelationConcept>> = LazyLock::new(|| {
    vec![
${data.non_interactive_element_ax_object_schemas
	.map((schema) => {
		const attrs = schema.attributes
			? `Some(vec![${schema.attributes
					.map(
						(attr) =>
							`RoleRelationConceptAttribute { name: "${attr.name}".to_string(), value: ${attr.value ? `Some("${attr.value}".to_string())` : 'None'} }`
					)
					.join(', ')}])`
			: 'None';
		return `        RoleRelationConcept { name: "${schema.name}".to_string(), attributes: ${attrs} }`;
	})
	.join(',\n')}
    ]
});
`;

	return code;
}

const constantsRs = generateConstants();
const outputPath = join(
	__dirname,
	'../src/compiler/phases/2_analyze/visitors/shared/a11y/constants.rs'
);
writeFileSync(outputPath, constantsRs);

console.log(`Generated ${outputPath}`);
