//! A name declared INSIDE a `$:` statement is a different binding from the
//! instance-level one that shares its spelling (#3197).
//!
//! The cycle detector walked the reactive body with no notion of scope, so a
//! `catch (e)` parameter or a block `let e` was attributed to the instance `e`
//! and a second `$:` that assigns `e` closed a cycle that does not exist.
//! Upstream never has to say any of this: it resolves through the scope tree.
//!
//! A function parameter was already handled, which is what makes this a scoping
//! gap rather than a missing feature — and why the population below has to
//! carry the shapes that were NOT handled, not the one that was.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

/// Two reactive statements. The first is `body`; the second assigns `e`, so any
/// spurious `e` in the first statement's dependency set closes a cycle.
fn two_statements(body: &str) -> String {
    format!(
        "<script>\n\texport let a = 1;\n\tlet d = 0;\n\tlet e = 0;\n\t{body}\n\t$: e = d + 1;\n</script>\n\n<b>{{d}}{{e}}</b>\n"
    )
}

fn compile_both(src: &str) -> Result<(), String> {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        compile(
            src,
            CompileOptions {
                filename: Some("Test.svelte".to_string()),
                generate,
                dev: false,
                css: CssMode::External,
                ..Default::default()
            },
        )
        .map_err(|e| format!("{generate:?}: {e:?}"))?;
    }
    Ok(())
}

/// Every one of these compiles upstream. Each declares `e` in a scope inside the
/// `$:` body, and none of them reads the instance `e`.
const SCOPED_LOCALS: &[&str] = &[
    "$: try { d = a; } catch (e) { d = 0; }",
    "$: { let e = a; d = e; }",
    "$: { const e = a; d = e; }",
    "$: for (let e = 0; e < a; e++) { d = e; }",
    "$: for (const e of [a]) { d = e; }",
    // Already correct before the fix — the control that makes this a scoping
    // gap rather than a missing feature.
    "$: d = ((e) => e)(a);",
];

#[test]
fn a_name_declared_inside_a_reactive_statement_is_not_the_outer_one() {
    for body in SCOPED_LOCALS {
        compile_both(&two_statements(body)).unwrap_or_else(|err| {
            panic!("{body:?} must compile; got: {err}");
        });
    }
}

/// The other direction, and the row that separates a scope stack from a flat
/// "any name declared anywhere inside the body is local" list: the inner block
/// shadows `e` for itself only, so the outer `d = e` still reads the instance
/// `e` and the cycle is real. Upstream rejects all three.
#[test]
fn a_real_cycle_is_still_a_cycle() {
    for body in [
        "$: d = e;",
        "$: { d = e; }",
        "$: { d = e; { let e = 1; d = e; } }",
    ] {
        let err = compile(
            &two_statements(body),
            CompileOptions {
                filename: Some("Test.svelte".to_string()),
                generate: GenerateMode::Server,
                dev: false,
                css: CssMode::External,
                ..Default::default()
            },
        )
        .map_err(|e| format!("{e:?}"))
        .err()
        .unwrap_or_else(|| panic!("{body:?} is a real cycle and must not compile"));
        assert!(
            err.contains("reactive_declaration_cycle"),
            "expected a cycle for {body:?}, got: {err}"
        );
    }
}
