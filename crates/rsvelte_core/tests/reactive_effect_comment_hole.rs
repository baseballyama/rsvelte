//! A legacy `$:` is a HOLE in the comment cursor's first walk, not an event on
//! it.
//!
//! `LabeledStatement.js` returns `b.empty` and `transform-client.js` appends
//! every `$.legacy_pre_effect` after the whole instance body, so esrap prints
//! the instance twice: the surviving statements in source order, then the
//! effects. `body()` skips the `EmptyStatement` left behind, so nothing in a
//! `$:` subtree moves the cursor while the statements around it are printed —
//! neither the revive a source-located block inside it gives, nor the kill an
//! unlocated thunk inside it gives.
//!
//! `dead_comments` walked the subtree like any other, so both leaked. What it
//! must NOT do is treat the effects as absent: past the last `$:` the effects'
//! own order decides, and a block in the last-printed one leaves the cursor
//! alive for the first located template node — `rehome_reactive_statement_comments`
//! owns that region and the effect bodies themselves.
//!
//! Every expectation below is the official compiler's bytes (5.56.10).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn code(script: &str, generate: GenerateMode) -> String {
    compile(
        &format!(
            "<script>\n{script}\n</script>\n\n<select bind:value={{obj.v}}><option>{{bar}}</option></select>\n<button onclick={{bump}}>{{after()}}</button>\n"
        ),
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// `bump` mutates a `<select bind:value>` binding, so its unlocated
/// `$.invalidate_inner_signals` thunk kills the cursor before `// between` and
/// `// tail` are reached — and the block inside the first `$:` cannot revive
/// it, because that block is printed in the second pass.
const KILL_OUTSIDE: &str = "\tlet obj = { v: 1 };\n\tlet bar = 2;\n\n\tfunction bump() {\n\t\tobj.v = 3;\n\t}\n\n\t$: if (obj.v) {\n\t\t// inside\n\t\tbar = 5;\n\t}\n\n\t// between\n\t$: obj.n = bar;\n\n\t// tail\n\tfunction after() {\n\t\treturn 1;\n\t}";

/// CONTROL — byte-identical but for `bump`'s body, which now mutates nothing
/// indirect and so builds no thunk. Every comment survives.
const NO_KILL: &str = "\tlet obj = { v: 1 };\n\tlet bar = 2;\n\n\tfunction bump() {\n\t\tbar = 9;\n\t}\n\n\t$: if (obj.v) {\n\t\t// inside\n\t\tbar = 5;\n\t}\n\n\t// between\n\t$: obj.n = bar;\n\n\t// tail\n\tfunction after() {\n\t\treturn 1;\n\t}";

/// Only the mutation is INSIDE the `$:`, so its thunk is printed in the second
/// pass and never reaches the comments after it.
const KILL_INSIDE: &str = "\tlet obj = { v: 1 };\n\tlet bar = 2;\n\n\tfunction bump() {\n\t\tbar = 9;\n\t}\n\n\t$: if (obj.v) {\n\t\t// inside\n\t\tobj.w = 5;\n\t}\n\n\t// tail\n\tfunction after() {\n\t\treturn 1;\n\t}";

#[test]
fn a_block_inside_a_reactive_statement_does_not_revive_the_comment_between_two() {
    let out = code(KILL_OUTSIDE, GenerateMode::Client);
    assert!(!out.contains("// between"), "{out}");
}

#[test]
fn a_mutation_inside_a_reactive_statement_does_not_kill_what_follows_it() {
    let out = code(KILL_INSIDE, GenerateMode::Client);
    assert!(out.contains("// tail"), "{out}");
}

/// CONTROL — the same three comments with no kill at all.
#[test]
fn nothing_is_dropped_without_a_kill() {
    let out = code(NO_KILL, GenerateMode::Client);
    assert!(out.contains("// inside"), "{out}");
    assert!(out.contains("// between"), "{out}");
    assert!(out.contains("// tail"), "{out}");
}

/// The effect body's own comment is re-emitted with the body either way — the
/// hole is about what leaks out of a `$:`, not about its inside.
#[test]
fn the_comment_inside_the_reactive_body_survives_either_way() {
    assert!(code(KILL_OUTSIDE, GenerateMode::Client).contains("// inside"));
    assert!(code(KILL_INSIDE, GenerateMode::Client).contains("// inside"));
}

/// The server builds no effect and no thunk, so nothing is dropped there.
#[test]
fn the_server_keeps_every_comment() {
    let out = code(KILL_OUTSIDE, GenerateMode::Server);
    assert!(out.contains("// inside"), "{out}");
    assert!(out.contains("// between"), "{out}");
    assert!(out.contains("// tail"), "{out}");
}
