//! A class field assigned a rune in the constructor is collected by scanning
//! the constructor body line by line, and `find_matching_paren_lexical` has no
//! closing paren to find when the call runs past the line end — so the whole
//! field was dropped: no `#name` backing, no getter, no setter, and output that
//! parses cleanly while the property no longer exists.
//!
//! The join loop that groups physical lines existed, but its condition asked
//! only whether the initializer had yet to START (`=` with nothing after it on
//! the line). `this.a = $state(` starts its initializer and does not finish it,
//! so it was never joined. The two conditions are `||`-ed and each row below
//! is the witness for exactly one of them: ablate the bracket-depth arm and
//! only the multi-line rows fail; ablate the other and only
//! `an_initializer_that_starts_on_the_next_line` fails.
//!
//! Every expected shape was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`).

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

/// The privatised backing fields, in order, for a class whose constructor
/// assigns `a` and then `b`.
fn backing_fields(constructor_body: &str) -> Vec<String> {
    let src = format!(
        "export class S {{\n  a;\n  b;\n  constructor() {{\n{constructor_body}\n    this.b = $state(2);\n  }}\n}}\n"
    );
    let js = compile_module(
        &src,
        ModuleCompileOptions {
            filename: Some("Test.svelte.js".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    js.lines()
        .filter(|l| l.starts_with('\t') && l.trim_start().starts_with('#'))
        .map(|l| l.trim().to_string())
        .collect()
}

fn both_fields() -> Vec<String> {
    vec!["#a;".to_string(), "#b;".to_string()]
}

#[test]
fn a_rune_call_that_spans_lines_still_declares_its_field() {
    for body in [
        "    this.a = $state(\n      1,\n    );",
        "    this.a = $state(\n      x ?? {\n        m: 1,\n      },\n    );",
        "    this.a = $state(\n      [1, 2],\n    );",
        "    this.a = $state( // why\n      1,\n    );",
        "    this.a = $state(\n      f(\n        1,\n      ),\n    );",
        // Both arms of the join condition at once: nothing after `=`, and then
        // a call that does not close on its own line either.
        "    this.a =\n      $state(\n        1,\n      );",
    ] {
        assert_eq!(backing_fields(body), both_fields(), "body:\n{body}");
    }
}

/// The rows the join already handled. `an initializer that starts on the next
/// line` is the witness for the pre-existing arm — its brackets are balanced on
/// every line, so the bracket-depth arm cannot carry it.
#[test]
fn an_initializer_that_starts_on_the_next_line_still_works() {
    for body in ["    this.a = $state(1);", "    this.a =\n      $state(1);"] {
        assert_eq!(backing_fields(body), both_fields(), "body:\n{body}");
    }
}
