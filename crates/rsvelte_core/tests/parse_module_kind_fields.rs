//! `importKind` / `exportKind` and `attributes` are decided by the PARSER.
//!
//! acorn-typescript stamps a kind on every import and export and emits
//! `attributes` only where the source wrote a clause; acorn does the exact
//! opposite. rsvelte emitted the kind only for a `type` form and `attributes`
//! unconditionally, so a `lang="ts"` script disagreed with official's `parse()`
//! on both fields at once. Both halves now match; the anchors below come from
//! the official compiler run on these exact sources.

use rsvelte_core::Allocator;
use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::compiler::phases::phase1_parse::{ParseOptions, parse};
use serde_json::Value;

fn ast(src: &str) -> Value {
    let allocator = Allocator::default();
    let parsed = parse(src, &allocator, ParseOptions::public_api()).expect("parses");
    with_serialize_arena(&parsed.arena, || {
        serde_json::to_value(&parsed).expect("serializes")
    })
}

/// Every node of `ty`, in document order.
fn nodes_of<'a>(value: &'a Value, ty: &str, out: &mut Vec<&'a Value>) {
    match value {
        Value::Object(map) => {
            if map.get("type").and_then(Value::as_str) == Some(ty) {
                out.push(value);
            }
            for v in map.values() {
                nodes_of(v, ty, out);
            }
        }
        Value::Array(items) => {
            for v in items {
                nodes_of(v, ty, out);
            }
        }
        _ => {}
    }
}

fn kinds(src: &str, ty: &str, field: &str) -> Vec<Option<String>> {
    let tree = ast(src);
    let mut found = Vec::new();
    nodes_of(&tree, ty, &mut found);
    assert!(!found.is_empty(), "no {ty} in the tree");
    found
        .iter()
        .map(|n| {
            n.get(field)
                .and_then(Value::as_str)
                .map(std::string::ToString::to_string)
        })
        .collect()
}

fn has_attributes(src: &str, ty: &str) -> Vec<bool> {
    let tree = ast(src);
    let mut found = Vec::new();
    nodes_of(&tree, ty, &mut found);
    assert!(!found.is_empty(), "no {ty} in the tree");
    found
        .iter()
        .map(|n| n.get("attributes").is_some())
        .collect()
}

const TS: &str = "<script lang=\"ts\">\n\timport { A } from './a';\n\timport type { B } from './b';\n\timport { type C, D } from './c';\n\texport const x = 1;\n\texport { x as y };\n\texport type { A };\n</script>\n";
const JS: &str = "<script>\n\timport { A } from './a';\n\texport const x = 1;\n\texport { x as y };\n</script>\n";
/// A TypeScript script that DOES write import attributes. The first version of
/// this fix suppressed `attributes` on every TS import and regressed here.
const TS_ATTRS: &str = "<script lang=\"ts\">\n\timport data from './d.json' assert { type: 'json' };\n\tconst held: unknown = data;\n</script>\n";

/// The anchors come from the official compiler on these exact sources.
#[test]
fn a_typescript_script_stamps_a_kind_on_every_import_and_export() {
    let v = |s: &str| Some(s.to_string());
    assert_eq!(
        kinds(TS, "ImportDeclaration", "importKind"),
        vec![v("value"), v("type"), v("value")]
    );
    assert_eq!(
        kinds(TS, "ImportSpecifier", "importKind"),
        vec![v("value"), v("value"), v("type"), v("value")]
    );
    assert_eq!(
        kinds(TS, "ExportNamedDeclaration", "exportKind"),
        vec![v("value"), v("value"), v("type")]
    );
    assert_eq!(
        kinds(TS, "ExportSpecifier", "exportKind"),
        vec![v("value"), v("value")]
    );
}

/// The control: a plain script must gain no kind at all. A fix that stamps one
/// unconditionally passes the test above and breaks every JavaScript component.
#[test]
fn a_plain_script_stamps_no_kind() {
    assert_eq!(kinds(JS, "ImportDeclaration", "importKind"), vec![None]);
    assert_eq!(kinds(JS, "ImportSpecifier", "importKind"), vec![None]);
    assert_eq!(
        kinds(JS, "ExportNamedDeclaration", "exportKind"),
        vec![None, None]
    );
    assert_eq!(kinds(JS, "ExportSpecifier", "exportKind"), vec![None]);
}

/// `attributes` is where the two parsers disagree in the other direction, and
/// **rsvelte now answers as acorn-typescript does**: the field's presence is a
/// fact about which parser ran, so a `lang="ts"` import carries it only where
/// the source wrote an `assert`/`with` clause, while every acorn import carries
/// it whether or not there is a clause. This test used to pin the third
/// answer — an always-present, always-empty list, matching neither parser —
/// and it went red on the commit that moved rsvelte onto acorn-typescript's
/// side, which is what it was pinned for.
///
/// Measured on these exact sources with the official compiler
/// (`OFFICIAL_COMPILER_REL`): TS `present [false, false, false]`, JS
/// `present [true]` `len 0`, TS_ATTRS `present [true]` `len 1`. The JS and
/// TS_ATTRS rows are the discriminating half — a fix that simply suppressed
/// `attributes` under `lang="ts"` passes the TS row and breaks both.
#[test]
fn attributes_presence_follows_the_parser_that_produced_it() {
    fn attribute_lengths(src: &str) -> Vec<Option<usize>> {
        let tree = ast(src);
        let mut found = Vec::new();
        nodes_of(&tree, "ImportDeclaration", &mut found);
        found
            .iter()
            .map(|n| n.get("attributes").and_then(Value::as_array).map(Vec::len))
            .collect()
    }

    // acorn-typescript, no clause written: the field is absent, not empty.
    assert_eq!(
        has_attributes(TS, "ImportDeclaration"),
        vec![false, false, false]
    );
    // acorn: always present, empty when the source wrote no clause.
    assert_eq!(has_attributes(JS, "ImportDeclaration"), vec![true]);
    assert_eq!(attribute_lengths(JS), vec![Some(0)]);
    // acorn-typescript with a clause: present, and carrying what was written.
    assert_eq!(has_attributes(TS_ATTRS, "ImportDeclaration"), vec![true]);
    assert_eq!(attribute_lengths(TS_ATTRS), vec![Some(1)]);
}
