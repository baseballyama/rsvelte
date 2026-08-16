//! Regression tests for #2987 and #2988 — the `.svelte.(js|ts)` module path
//! decided where a `$state(` / `$derived(` call *starts* with a raw byte search.
//!
//! Both loops run as the fallback behind an AST rewrite that only reports the
//! calls it found, so the bytes left over are exactly the ones that are not
//! code — and the two issues are the two directions that scan can be wrong in:
//!
//! - #2987: `$derived(` inside a string / template / comment matched first, and
//!   its unbalanced parens made `find_matching_paren` fail, which `break`s the
//!   loop. The real `$derived(…)` further down was never lowered, so the module
//!   referenced a global `$derived` and threw at import. The output *parses*.
//! - #2988: a regex literal whose body carries the same text was rewritten as if
//!   it were a call — `/$derived(x)/` → `/$.derived(() => x)/`,
//!   `/$state(x)/` → `/$.state($.proxy(x))/` (client) or `/x/` (server). Three
//!   different regular expressions, all of which parse.
//!
//! Both scans now go through `shared::js_scan::find_code`, which yields only
//! occurrences outside every string, template, regex literal and comment.
//!
//! The server module path reuses the client module transform, so each case is
//! asserted on both targets rather than one standing in for the other.

use rsvelte_core::{GenerateMode, ModuleCompileOptions, compile_module};

fn compile_module_with(src: &str, generate: GenerateMode) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            generate,
            filename: Some("m.svelte.js".to_string()),
            ..Default::default()
        },
    )
    .expect("module should compile")
    .js
    .code
}

/// Every way of writing `$derived(` where it is text and not code.
const DERIVED_CARRIERS: &[(&str, &str)] = &[
    ("line comment", "// $derived("),
    ("block comment", "/* $derived( */"),
    ("string", "const label = '$derived(';"),
    ("template", "const label = `$derived(`;"),
];

/// A factory function with a local `$derived`, preceded by `%s`.
fn factory_after(carrier: &str) -> String {
    format!(
        "let a = 1;\nlet b = 2;\n{carrier}\nexport function make() {{\n\
         \tconst flag = $derived(a !== b);\n\
         \treturn {{ read: () => flag }};\n\
         }}\n"
    )
}

#[test]
fn an_opaque_derived_does_not_stop_the_real_one_from_being_lowered() {
    for (what, carrier) in DERIVED_CARRIERS {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let out = compile_module_with(&factory_after(carrier), generate);
            assert!(
                out.contains("$.derived("),
                "{what} ({generate:?}): the local derived was not lowered:\n{out}"
            );
            assert!(
                !out.contains("= $derived("),
                "{what} ({generate:?}): a rune call survived into the output:\n{out}"
            );
        }
    }
}

/// The negative control: without the carrier the same input already compiled
/// correctly, so a test that only ran this row would pass on the broken tree.
#[test]
fn a_factory_without_the_carrier_is_unchanged() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = compile_module_with(&factory_after("// nothing special"), generate);
        assert!(
            out.contains("$.derived(") && !out.contains("= $derived("),
            "control ({generate:?}): the local derived was not lowered:\n{out}"
        );
    }
}

/// `/$derived(x)/` and `/$state(x)/` are ordinary regexes — `$` anchors,
/// `derived` is literal, `(x)` captures — and must reach the output verbatim.
#[test]
fn a_regex_carrying_rune_call_text_is_not_rewritten() {
    for pattern in ["/$derived(x)/", "/$state(x)/"] {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let src = format!(
                "const pattern = {pattern};\nexport function f() {{\n\treturn pattern;\n}}\n"
            );
            let out = compile_module_with(&src, generate);
            assert!(
                out.contains(pattern),
                "{pattern} ({generate:?}): the regex literal was rewritten:\n{out}"
            );
        }
    }
}

/// A real rune call next to the carrier is still lowered — the scan was
/// narrowed, not disabled — and a division is not read as a regex.
#[test]
fn real_rune_calls_next_to_a_carrier_are_still_lowered() {
    let src = "const pattern = /$state(x)/;\nconst ratio = 8 / 2;\n\
               export function make() {\n\
               \tlet n = $state(ratio);\n\
               \tconst flag = $derived(n > 1);\n\
               \treturn { read: () => flag, bump: () => n++ };\n\
               }\n";
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = compile_module_with(src, generate);
        assert!(
            out.contains("$.derived("),
            "({generate:?}) the local derived was not lowered:\n{out}"
        );
        assert!(
            out.contains("/$state(x)/") && out.contains("8 / 2"),
            "({generate:?}) the regex or the division was rewritten:\n{out}"
        );
    }
}
