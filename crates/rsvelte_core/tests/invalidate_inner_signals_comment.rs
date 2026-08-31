//! A mutation of a binding that backs a legacy `<select bind:value>` grows
//! `$.invalidate_inner_signals(() => { … })`, and `b.arrow([], b.block([…]))`
//! builds that block with no `loc` — so printing it parks esrap's comment
//! cursor past the end of the list, exactly as an unlocated rune accessor or
//! reactive-destructure IIFE does. `dead_comments` models the other two and
//! not this one, so every comment between such a mutation and the next
//! source-located body survived here and not upstream.
//!
//! Only the client is affected: the server never builds the thunk.
//!
//! Every expectation below is the official compiler's bytes (5.56.10).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(script: &str, markup: &str) -> String {
    compile(
        &format!("<script>\n{script}\n</script>\n\n{markup}\n"),
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// `<option>{bar}</option>` under the bound `<select>` is what puts `bar` in
/// `obj.legacy_indirect_bindings`, so the mutation grows the thunk.
const INDIRECT: &str = "<select bind:value={obj.v}><option>{bar}</option></select>\n<button onclick={bump}>{after()}</button>";
/// CONTROL markup — the same binding with nothing indirect under it.
const PLAIN: &str =
    "<select bind:value={obj.v}></select>\n<button onclick={bump}>{after()}{bar}</button>";

const SCRIPT: &str = "\tlet obj = { v: 1 };\n\tlet bar = 2;\n\n\tfunction bump() {\n\t\tobj.v = 3;\n\t}\n\n\t// lead\n\tfunction after() {\n\t\treturn 1;\n\t}";

#[test]
fn the_thunk_swallows_a_comment_that_follows_the_mutation() {
    let out = client(SCRIPT, INDIRECT);
    assert!(out.contains("$.invalidate_inner_signals"), "{out}");
    assert!(!out.contains("// lead"), "{out}");
}

/// CONTROL — the same script with no indirect binding builds no thunk, so the
/// cursor never dies and the comment stays. A kill keyed on the mutation alone
/// rather than on the binding breaks this row.
#[test]
fn a_mutation_with_no_indirect_bindings_keeps_the_comment() {
    let out = client(SCRIPT, PLAIN);
    assert!(!out.contains("$.invalidate_inner_signals"), "{out}");
    assert!(out.contains("// lead"), "{out}");
}

/// The kill starts on the line after the mutation, so a comment on its own
/// line between two mutations of the same binding is swallowed by the first.
#[test]
fn a_comment_between_two_mutations_is_swallowed() {
    let script = "\tlet obj = { v: 1 };\n\tlet bar = 2;\n\n\tfunction bump() {\n\t\tobj.v = 3;\n\t\t// gone\n\t\tobj.v = 4;\n\t}\n\n\tfunction after() {\n\t\treturn 1;\n\t}";
    let out = client(script, INDIRECT);
    assert!(!out.contains("// gone"), "{out}");
}

/// A source-located body printed after the mutation resets the cursor to its
/// own `{`, so a comment inside it survives while one before it does not.
#[test]
fn a_later_located_body_revives_the_cursor() {
    let script = "\tlet obj = { v: 1 };\n\tlet bar = 2;\n\n\tfunction bump() {\n\t\tobj.v = 3;\n\t}\n\n\t// gone\n\tfunction after() {\n\t\t// kept\n\t\treturn 1;\n\t}";
    let out = client(script, INDIRECT);
    assert!(!out.contains("// gone"), "{out}");
    assert!(out.contains("// kept"), "{out}");
}

/// The server builds no thunk at all, so its cursor is untouched — the fix
/// must not reach it.
#[test]
fn the_server_keeps_every_comment() {
    let out = compile(
        &format!("<script>\n{SCRIPT}\n</script>\n\n{INDIRECT}\n"),
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    assert!(out.contains("// lead"), "{out}");
}
