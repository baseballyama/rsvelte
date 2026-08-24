//! The client instance script located its non-dev `$inspect(` with a raw byte
//! scan, so the same bytes inside a string literal or a comment were rewritten
//! as if they were the rune — silently deleting user source. The module path
//! already reads code bytes only (#2987 / #2988); this is its instance twin.
//!
//! Both outputs PARSE, so no parse gate can see either one; only output equality
//! against the official compiler can.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

#[test]
fn a_string_literal_spelling_the_rune_is_not_a_call() {
    let out = client(
        "<script>\n\tlet a = $state(1);\n\tconst s = \"$inspect(a)\";\n\tconsole.log(s);\n</script>\n<b>{a}</b>\n",
    );
    assert!(
        out.contains(r#"const s = "$inspect(a)";"#),
        "the literal's contents were rewritten:\n{out}"
    );
}

#[test]
fn a_comment_spelling_the_rune_is_not_a_call() {
    let out = client(
        "<script>\n\tlet a = $state(1);\n\t// $inspect(a)\n\tlet z = 1;\n\tconsole.log(z);\n</script>\n<b>{a}</b>\n",
    );
    assert!(
        out.contains("// $inspect(a)"),
        "the comment's contents were rewritten:\n{out}"
    );
}

#[test]
fn a_real_rune_call_is_still_removed() {
    let out = client("<script>\n\tlet a = $state(1);\n\t$inspect(a);\n</script>\n<b>{a}</b>\n");
    assert!(
        !out.contains("$inspect("),
        "the rune call survived into the output:\n{out}"
    );
    assert!(out.contains(";;"), "the `;;` residue is missing:\n{out}");
}
