//! A `<script>`'s directive prologue survives `compile()` on both targets (#4133).
//!
//! OXC lifts a directive prologue out of `Program::body` into
//! `Program::directives`. Phase 3 re-parses generated text in several places and
//! rebuilds each result from `body` alone, so `"use strict"` was deleted from the
//! generated module. The two targets lost it through different re-parses, and the
//! server's is wider than the client's: `reparse_statement` parses ONE statement,
//! which makes any top-level string-literal statement the whole prologue of its
//! own parse — so the server dropped `"use strict"` even when it was not first,
//! and the client did not. That asymmetry is what the `not first` cells pin.
//!
//! Every expectation here is read from the oracle (`submodules/svelte`, 5.57.0):
//! official keeps the statement in all six directive cells and in both `not
//! first` cells, and emits no such text for the control with no string statement
//! at all.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn code(source: &str, generate: GenerateMode) -> String {
    compile(
        source,
        CompileOptions {
            generate,
            ..Default::default()
        },
    )
    .unwrap_or_else(|e| panic!("compile failed: {e:?}"))
    .js
    .code
}

fn has_directive(source: &str, generate: GenerateMode) -> bool {
    code(source, generate).contains("\"use strict\"")
}

const PROLOGUE: &str = "<script>\n\t\"use strict\";\n\tlet a = 1;\n</script>\n<p>{a}</p>\n";
const TWO: &str =
    "<script>\n\t\"use strict\";\n\t\"use asm\";\n\tlet a = 1;\n</script>\n<p>{a}</p>\n";
const MODULE: &str =
    "<script module>\n\t\"use strict\";\n\texport const x = 1;\n</script>\n<p>{x}</p>\n";
const NOT_FIRST: &str = "<script>\n\tlet a = 1;\n\t\"use strict\";\n</script>\n<p>{a}</p>\n";
const NONE: &str = "<script>\n\tlet a = 1;\n</script>\n<p>{a}</p>\n";

#[test]
fn a_client_directive_prologue_reaches_the_generated_module() {
    assert!(has_directive(PROLOGUE, GenerateMode::Client));
}

#[test]
fn a_server_directive_prologue_reaches_the_generated_module() {
    assert!(has_directive(PROLOGUE, GenerateMode::Server));
}

#[test]
fn every_statement_of_a_multi_directive_prologue_survives() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = code(TWO, generate);
        assert!(
            out.contains("\"use strict\""),
            "{generate:?}: lost `use strict`"
        );
        assert!(out.contains("\"use asm\""), "{generate:?}: lost `use asm`");
    }
}

#[test]
fn a_module_script_prologue_survives_too() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        assert!(has_directive(MODULE, generate), "{generate:?}");
    }
}

/// The client never lost this one; the server did, through the per-statement
/// re-parse. Both must keep it, as official does.
#[test]
fn a_string_statement_that_is_not_first_survives_on_both_targets() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        assert!(has_directive(NOT_FIRST, generate), "{generate:?}");
    }
}

/// The async instance body takes its own re-parse (`reparse_program`). The grid
/// cannot separate that site from the classification one — both were fixed in the
/// same change and either alone would leave this cell diverging — so this pins the
/// shape rather than claiming an independently measured carrier.
#[test]
fn a_prologue_survives_a_top_level_await_instance_body() {
    let source = "<script>\n\t\"use strict\";\n\tconst a = await Promise.resolve(1);\n</script>\n<p>{a}</p>\n";
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = compile(
            source,
            CompileOptions {
                generate,
                experimental: rsvelte_core::ExperimentalOptions { r#async: true },
                ..Default::default()
            },
        )
        .unwrap_or_else(|e| panic!("compile failed: {e:?}"))
        .js
        .code;
        assert!(out.contains("\"use strict\""), "{generate:?}");
    }
}

/// Negative control: nothing invents the text. Without it every assertion above
/// would also pass against a compiler that emitted `"use strict"` unconditionally.
#[test]
fn a_script_with_no_string_statement_emits_no_directive() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        assert!(!has_directive(NONE, generate), "{generate:?}");
    }
}
