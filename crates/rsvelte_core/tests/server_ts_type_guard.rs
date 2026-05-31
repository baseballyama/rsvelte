//! Regression test for `compile(generate:'server')` mangling TypeScript
//! user-defined type guard arrows (baseballyama/rsvelte#141).
//!
//! The TS-strip step in phase 2 correctly removes `): op is Op =>` to leave
//! `) =>`, but a later text-based pass — `fix_multiline_declaration_semicolons`
//! — terminated the declaration as soon as bracket depth hit zero. For a
//! multi-line arrow header like
//!
//! ```text
//! const isOp = (
//!     op,
//! ) =>
//!     op === 'A';
//! ```
//!
//! the closing `)` brought depth to 0 on the `) =>` line. The pass appended a
//! `;` after `=>`, severing the arrow function from its body and producing
//! invalid JS that rolldown/oxc rejected with `Unexpected token`.
//!
//! The fix teaches the pass to keep tracking when a line ends with a
//! continuation operator (the arrow `=>`, binary operators, `.`, etc.).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_server(src: &str) -> String {
    let result = compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile");
    result.js.code
}

#[test]
fn arrow_type_guard_keeps_arrow_attached_to_body() {
    let src = r#"<script lang="ts">
  type Op = 'EQUAL' | 'NOT_EQUAL';
  const isOp = (
    op: Op | 'OTHER',
  ): op is Op =>
    op === 'EQUAL' ||
    op === 'NOT_EQUAL';
</script>"#;
    let out = compile_server(src);
    // No stray `;` after `=>` — the arrow body must follow.
    assert!(
        !out.contains("=>;"),
        "found stray `=>;` — arrow body was severed:\n{out}"
    );
    // Arrow body must reach `op === 'EQUAL'`.
    assert!(
        out.contains("=> op === 'EQUAL'") || out.contains("=>\n\top === 'EQUAL'"),
        "arrow body should be reachable, got:\n{out}"
    );
}

#[test]
fn arrow_multiline_paren_close_with_no_type_predicate_still_works() {
    // Make sure the fix doesn't regress the normal "real end of declaration"
    // case where `)` ends both the paren and the statement (single-arg call).
    let src = r#"<script lang="ts">
  const x = doThing(
    'a',
    'b',
  );
</script>"#;
    let out = compile_server(src);
    assert!(out.contains("doThing("));
    assert!(out.contains("'a'"));
    assert!(out.contains("'b'"));
    // The original `;` after the closing `)` must be preserved.
    assert!(
        out.contains("'b',\n\t);") || out.contains("'b'\n\t);") || out.contains("'b');"),
        "expected the trailing `;` after `)` to remain. Got:\n{out}"
    );
}
