//! `=> (` inside a comment is text, and a pass that rewrites it corrupts the
//! comment body.
//!
//! `strip_unnecessary_arrow_body_parens` scanned the instance script for `=> (`
//! and dropped the parens. It skipped string and template literals but not
//! comments, so `// values.forEach((v) => (valueFilter[v] = true));` came out as
//! `// values.forEach((v) => valueFilter[v] = true);` — a comment body the
//! source never contained.
//!
//! The corpus gate cannot see this: a byte-different output falls back to an AST
//! comparison, and `ast_equiv_batch` applies `CommentPolicy::Ignore` unless
//! `--comments` is passed (`verify.mjs:470-474`). The divergence lived entirely
//! in a comment, so it scored `match` while diverging from official byte for
//! byte. It was in no ratchet.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_to(source: &str, generate: GenerateMode) -> String {
    compile_with(source, generate, false)
}

fn compile_with(source: &str, generate: GenerateMode, dev: bool) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate,
            dev,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

/// The shape from `svelte-pivottable/src/lib/UI/FilterBox.svelte`, which is
/// where this was found.
const COMMENTED_ARROW: &str = "<script>\n  let x = 1;\n  function go() {\n    // values.forEach((v) => (valueFilter[v] = true));\n    x = 2;\n  }\n</script>\n\n<p on:click={go}>{x}</p>\n";

#[test]
fn a_comment_body_containing_an_arrow_paren_survives_verbatim() {
    let out = compile_to(COMMENTED_ARROW, GenerateMode::Client);
    assert!(
        out.contains("// values.forEach((v) => (valueFilter[v] = true));"),
        "the comment body was rewritten:\n{out}"
    );
}

/// Dev mode reaches the same scan and diverged the same way in the corpus —
/// both client targets were among the eight affected outputs.
#[test]
fn the_same_comment_survives_in_dev_mode() {
    let out = compile_with(COMMENTED_ARROW, GenerateMode::Client, true);
    assert!(
        out.contains("// values.forEach((v) => (valueFilter[v] = true));"),
        "the comment body was rewritten in dev mode:\n{out}"
    );
}

/// The server target never ran this pass. It is the control: it was already
/// correct, and a change that reached beyond the client scan would move it.
#[test]
fn the_server_keeps_the_comment_too() {
    let out = compile_to(COMMENTED_ARROW, GenerateMode::Server);
    assert!(
        out.contains("(v) => (valueFilter[v] = true)"),
        "the server comment body changed:\n{out}"
    );
}
