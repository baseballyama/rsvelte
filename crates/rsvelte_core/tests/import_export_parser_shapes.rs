//! acorn and acorn-typescript disagree on the ESTree shape of an import or
//! export, so which fields `parse()` emits is a fact about which parser
//! upstream ran, not about the statement. One test per rule: a single
//! "all shapes agree" assertion is satisfied by every rule but the broken one.
//! The TypeScript declaration shapes at the end are here for the same reason —
//! a node emitted as a bare envelope passes every "it parsed" check there is.
//!
//! Two of these rules have no carrier in any collected corpus. `export default`
//! is illegal in every script a Svelte component can hold, so `compile()`
//! rejects the only source that reaches `ExportDefaultDeclaration.exportKind` —
//! `parse()` accepts it, and this file is where that half is pinned.

use rsvelte_core::ast::arena::CommentCaptureGuard;
use rsvelte_core::{ParseOptions, convert_to_legacy, parse};
use serde_json::Value;

fn modern_ast(source: &str) -> Value {
    let _capture = CommentCaptureGuard::new();
    let ast = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions {
            modern: true,
            skip_expression_loc: true,
            capture_comments: true,
            ..Default::default()
        },
    )
    .expect("parse should succeed");
    convert_to_legacy(source, ast)
}

/// The legacy conversion keeps a component's scripts under `instance`/`module`
/// in both AST modes; `convert_to_legacy` is what the public `parse()` calls.
fn instance_body(source: &str) -> Value {
    modern_ast(source)["instance"]["content"]["body"].clone()
}

fn module_body(source: &str) -> Value {
    modern_ast(source)["module"]["content"]["body"].clone()
}

fn js(body: &str) -> String {
    format!("<script>\n{body}\n</script>\n<div></div>\n")
}

fn ts(body: &str) -> String {
    format!("<script lang=\"ts\">\n{body}\n</script>\n<div></div>\n")
}

#[test]
fn an_import_attribute_is_parsed_rather_than_assumed_empty() {
    let body = instance_body(&js(
        "import a from './m.js' with { type: 'json' };\nlet b = a;",
    ));
    let attrs = &body[0]["attributes"];
    assert_eq!(attrs.as_array().map(Vec::len), Some(1), "{attrs}");
    assert_eq!(attrs[0]["type"], "ImportAttribute");
    assert_eq!(attrs[0]["key"]["type"], "Identifier");
    assert_eq!(attrs[0]["key"]["name"], "type");
    assert_eq!(attrs[0]["value"]["type"], "Literal");
    assert_eq!(attrs[0]["value"]["raw"], "'json'");
}

#[test]
fn a_string_attribute_key_is_a_literal() {
    let body = instance_body(&js(
        "import a from './m.js' with { 'type': \"json\" };\nlet b = a;",
    ));
    let key = &body[0]["attributes"][0]["key"];
    assert_eq!(key["type"], "Literal", "{key}");
    assert_eq!(key["raw"], "'type'");
}

#[test]
fn an_attribute_span_stops_at_the_value_not_the_brace() {
    let source = js("import a from './m.js' with { type: 'json' };\nlet b = a;");
    let attr = instance_body(&source)[0]["attributes"][0].clone();
    let key_at = source.find("type: 'json'").unwrap();
    assert_eq!(attr["start"], key_at, "{attr}");
    assert_eq!(attr["end"], key_at + "type: 'json'".len());
}

#[test]
fn an_export_from_carries_its_attributes() {
    let body = module_body(
        "<script module>\nexport { a } from './m.js' with { type: 'json' };\n</script>\n<div></div>\n",
    );
    assert_eq!(body[0]["attributes"].as_array().map(Vec::len), Some(1));
}

#[test]
fn javascript_always_writes_an_empty_attributes_array() {
    let body = instance_body(&js("import a from './m.js';\nlet b = a;"));
    assert_eq!(
        body[0]["attributes"].as_array().map(Vec::len),
        Some(0),
        "acorn writes `attributes: []`: {}",
        body[0]
    );
}

#[test]
fn typescript_omits_an_empty_attributes_array() {
    let body = instance_body(&ts("import a from './m.js';\nlet b = a;"));
    assert!(
        body[0].get("attributes").is_none(),
        "acorn-typescript omits the field entirely: {}",
        body[0]
    );
}

#[test]
fn typescript_keeps_attributes_it_was_given() {
    let body = instance_body(&ts(
        "import a from './m.js' with { type: 'json' };\nlet b = a;",
    ));
    assert_eq!(body[0]["attributes"].as_array().map(Vec::len), Some(1));
}

#[test]
fn typescript_omits_an_empty_export_attributes_array() {
    let body = instance_body(&ts("export let a = 1;"));
    assert!(body[0].get("attributes").is_none(), "{}", body[0]);
}

#[test]
fn javascript_writes_the_dynamic_import_options() {
    let body = instance_body(&js(
        "const p = import('./m.js', { with: { type: 'json' } });\nlet q = p;",
    ));
    let init = &body[0]["declarations"][0]["init"];
    assert_eq!(init["type"], "ImportExpression", "{init}");
    assert_eq!(init["options"]["type"], "ObjectExpression", "{init}");
    assert!(init.get("arguments").is_none(), "{init}");
}

#[test]
fn javascript_writes_a_null_for_a_bare_dynamic_import() {
    let body = instance_body(&js("const p = import('./m.js');\nlet q = p;"));
    let init = &body[0]["declarations"][0]["init"];
    assert_eq!(init["options"], Value::Null, "{init}");
}

#[test]
fn typescript_spells_the_dynamic_import_options_as_arguments() {
    let body = instance_body(&ts(
        "const p = import('./m.js', { with: { type: 'json' } });\nlet q = p;",
    ));
    let init = &body[0]["declarations"][0]["init"];
    assert_eq!(
        init["arguments"].as_array().map(Vec::len),
        Some(1),
        "{init}"
    );
    assert_eq!(init["arguments"][0]["type"], "ObjectExpression");
    assert!(
        init.get("options").is_none(),
        "acorn-typescript has no `options` key: {init}"
    );
}

#[test]
fn typescript_omits_both_keys_for_a_bare_dynamic_import() {
    let body = instance_body(&ts("const p = import('./m.js');\nlet q = p;"));
    let init = &body[0]["declarations"][0]["init"];
    assert!(init.get("options").is_none(), "{init}");
    assert!(init.get("arguments").is_none(), "{init}");
}

#[test]
fn typescript_stamps_an_export_kind_on_a_default_export() {
    let body =
        module_body("<script module lang=\"ts\">\nexport default 1;\n</script>\n<div></div>\n");
    assert_eq!(body[0]["type"], "ExportDefaultDeclaration", "{}", body[0]);
    assert_eq!(body[0]["exportKind"], "value", "{}", body[0]);
}

#[test]
fn javascript_stamps_no_export_kind_on_a_default_export() {
    let body = module_body("<script module>\nexport default 1;\n</script>\n<div></div>\n");
    assert_eq!(body[0]["type"], "ExportDefaultDeclaration", "{}", body[0]);
    assert!(body[0].get("exportKind").is_none(), "{}", body[0]);
}

#[test]
fn an_export_star_reaches_the_program_body() {
    let body = module_body("<script module>\nexport * from './m.js';\n</script>\n<div></div>\n");
    assert_eq!(body.as_array().map(Vec::len), Some(1), "{body}");
    assert_eq!(body[0]["type"], "ExportAllDeclaration", "{}", body[0]);
    assert_eq!(body[0]["exported"], Value::Null);
    assert_eq!(body[0]["source"]["raw"], "'./m.js'");
    assert_eq!(body[0]["attributes"].as_array().map(Vec::len), Some(0));
}

#[test]
fn an_export_star_names_its_namespace() {
    let body =
        module_body("<script module>\nexport * as ns from './m.js';\n</script>\n<div></div>\n");
    assert_eq!(body[0]["exported"]["type"], "Identifier", "{}", body[0]);
    assert_eq!(body[0]["exported"]["name"], "ns");
}

#[test]
fn an_export_star_carries_its_attributes() {
    let body = module_body(
        "<script module>\nexport * from './m.js' with { type: 'json' };\n</script>\n<div></div>\n",
    );
    assert_eq!(body[0]["attributes"].as_array().map(Vec::len), Some(1));
}

#[test]
fn typescript_stamps_an_export_kind_on_an_export_star() {
    let body = module_body(
        "<script module lang=\"ts\">\nexport * from './m.js';\n</script>\n<div></div>\n",
    );
    assert_eq!(body[0]["exportKind"], "value", "{}", body[0]);
    assert!(body[0].get("attributes").is_none(), "{}", body[0]);
}

#[test]
fn an_index_signature_carries_its_parameter() {
    let body = instance_body(&ts(
        "interface I { [k: string]: number; }\nlet a: I = {} as I;",
    ));
    let sig = &body[0]["body"]["body"][0];
    assert_eq!(sig["type"], "TSIndexSignature", "{sig}");
    let params = &sig["parameters"];
    assert_eq!(params.as_array().map(Vec::len), Some(1), "{sig}");
    assert_eq!(params[0]["type"], "Identifier");
    assert_eq!(params[0]["name"], "k");
    // acorn-typescript spans the parameter, not the name: `k: string`.
    assert_eq!(params[0]["typeAnnotation"]["type"], "TSTypeAnnotation");
    assert_eq!(
        params[0]["typeAnnotation"]["typeAnnotation"]["type"],
        "TSStringKeyword"
    );
    assert_eq!(
        params[0]["end"], params[0]["typeAnnotation"]["end"],
        "{}",
        params[0]
    );
}

#[test]
fn an_index_signature_carries_its_value_type() {
    let body = instance_body(&ts(
        "interface I { [k: string]: number; }\nlet a: I = {} as I;",
    ));
    let sig = &body[0]["body"]["body"][0];
    assert_eq!(sig["typeAnnotation"]["type"], "TSTypeAnnotation", "{sig}");
    assert_eq!(
        sig["typeAnnotation"]["typeAnnotation"]["type"],
        "TSNumberKeyword"
    );
}

#[test]
fn a_readonly_index_signature_says_so() {
    let body = instance_body(&ts(
        "interface I { readonly [k: string]: number; }\nlet a: I = {} as I;",
    ));
    let sig = &body[0]["body"]["body"][0];
    assert_eq!(sig["readonly"], true, "{sig}");
}

#[test]
fn a_writable_index_signature_omits_the_flag() {
    let body = instance_body(&ts(
        "interface I { [k: string]: number; }\nlet a: I = {} as I;",
    ));
    let sig = &body[0]["body"]["body"][0];
    assert!(sig.get("readonly").is_none(), "{sig}");
    assert!(sig.get("static").is_none(), "{sig}");
}

#[test]
fn an_enum_declaration_carries_its_id() {
    let body = instance_body(&ts("enum E { A }\nlet a = E.A;"));
    assert_eq!(body[0]["type"], "TSEnumDeclaration", "{}", body[0]);
    assert_eq!(body[0]["id"]["type"], "Identifier", "{}", body[0]);
    assert_eq!(body[0]["id"]["name"], "E", "{}", body[0]);
}

#[test]
fn an_enum_member_carries_its_name_and_initializer() {
    let body = instance_body(&ts("enum E { A = 1, B }\nlet a = E.A;"));
    let members = &body[0]["members"];
    assert_eq!(members.as_array().map(Vec::len), Some(2), "{}", body[0]);
    assert_eq!(members[0]["type"], "TSEnumMember", "{members}");
    assert_eq!(members[0]["id"]["name"], "A", "{members}");
    assert_eq!(members[0]["initializer"]["type"], "Literal", "{members}");
    assert_eq!(members[0]["initializer"]["value"], 1, "{members}");
    // An implicit value has no `initializer` key at all.
    assert!(members[1].get("initializer").is_none(), "{members}");
}

#[test]
fn a_quoted_enum_member_name_is_a_literal() {
    let body = instance_body(&ts("enum E { 'A-b' = 'x' }\nlet a = E['A-b'];"));
    let member = &body[0]["members"][0];
    assert_eq!(member["id"]["type"], "Literal", "{member}");
    assert_eq!(member["id"]["value"], "A-b", "{member}");
    assert_eq!(member["id"]["raw"], "'A-b'", "{member}");
}

#[test]
fn a_const_enum_says_so() {
    let body = instance_body(&ts("const enum E { A }\nlet a = E.A;"));
    assert_eq!(body[0]["const"], true, "{}", body[0]);
    assert!(body[0].get("declare").is_none(), "{}", body[0]);
}

#[test]
fn a_declared_enum_says_so() {
    let body = instance_body(&ts("declare enum E { A }\nlet a = E.A;"));
    assert_eq!(body[0]["declare"], true, "{}", body[0]);
    assert!(body[0].get("const").is_none(), "{}", body[0]);
}

#[test]
fn a_plain_enum_omits_both_modifier_flags() {
    let body = instance_body(&ts("enum E { A }\nlet a = E.A;"));
    assert!(body[0].get("const").is_none(), "{}", body[0]);
    assert!(body[0].get("declare").is_none(), "{}", body[0]);
}

/// The exported form reaches a second emitter — the declaration path — which
/// had its own bare-envelope shape. Both must go through the one builder.
#[test]
fn an_exported_enum_carries_the_same_shape() {
    let body = instance_body(&ts("export enum E { A = 1 }\nlet a = E.A;"));
    let decl = &body[0]["declaration"];
    assert_eq!(decl["type"], "TSEnumDeclaration", "{}", body[0]);
    assert_eq!(decl["id"]["name"], "E", "{decl}");
    assert_eq!(decl["members"][0]["id"]["name"], "A", "{decl}");
    assert_eq!(decl["members"][0]["initializer"]["value"], 1, "{decl}");
}
