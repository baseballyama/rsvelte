//! TypeScript's module syntax at the top level, which svelte 5.57.3 and 5.59.1 print into output
//! that does not parse: an import equals or an export assignment is refused, and a namespace export
//! erased, on purpose (`DIVERGENCES.md#typescript-module-syntax`). Inside a namespace both refuse
//! the namespace, which `namespaces.rs` pins.

use rsvelte_svelte_compile::Target;

use super::outcomes::{Outcome, assert_component_outcomes};

const IMPORT_EQUALS: &str = "`import name = …` is not supported yet";
const EXPORT_ASSIGNMENT: &str = "`export = …` is not supported yet";

#[test]
fn typescript_module_syntax_is_refused_where_svelte_prints_it_as_typescript() {
    let cases: &[(&str, Outcome<'_>)] = &[
        (
            "<script lang=\"ts\">import A = B.C;</script>",
            Some(("unsupported", IMPORT_EQUALS, 18)),
        ),
        (
            "<script lang=\"ts\">export import A = B.C;</script>",
            Some(("unsupported", IMPORT_EQUALS, 25)),
        ),
        (
            "<script lang=\"ts\">import A = require(\"x\");</script>",
            Some(("unsupported", IMPORT_EQUALS, 18)),
        ),
        (
            "<script lang=\"ts\">import type A = require(\"x\");</script>",
            Some(("unsupported", IMPORT_EQUALS, 18)),
        ),
        (
            "<script lang=\"ts\">export = foo;</script>",
            Some(("unsupported", EXPORT_ASSIGNMENT, 18)),
        ),
        (
            "<script lang=\"ts\">const foo = 1; export = foo;</script>",
            Some(("unsupported", EXPORT_ASSIGNMENT, 33)),
        ),
    ];
    assert_component_outcomes(cases);
}

#[test]
fn a_namespace_export_is_erased_where_svelte_prints_it() {
    for script in [
        "export as namespace N;",
        "let a = 1; export as namespace N;",
    ] {
        let source = format!("<script lang=\"ts\">{script}</script>");
        for target in [Target::Client, Target::Server] {
            let output =
                super::compile(&source, target).unwrap_or_else(|code| panic!("{source}: {code}"));
            assert!(!output.contains("namespace"), "{source}: {output}");
        }
    }
}
