//! A `$:`'s comments re-home onto the statement that follows it only while
//! esrap's cursor is still ALIVE there.
//!
//! Upstream leaves a `$:`'s comments with nothing to attach to, so a surviving
//! statement after it flushes them as its own leading trivia — and a
//! source-located block inside the effect body prints them a second time, in
//! place. `rehome_reactive_statement_comments` reproduces both by copying the
//! run past the statement. But the copy only lands if the cursor is alive when
//! that statement prints: an unlocated `$.invalidate_inner_signals` thunk
//! earlier in the script kills it, and upstream then flushes nothing there
//! while rsvelte emitted the comment twice.
//!
//! Counting occurrences is the point — both sides agree on presence either
//! way, so a presence-only comparison cannot see this.
//!
//! Every expectation below is the official compiler's bytes (5.56.10).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn occurrences(bump_body: &str, generate: GenerateMode) -> usize {
    let source = format!(
        "<script>\n\tlet obj = {{ v: 1 }};\n\tlet bar = 2;\n\n\tfunction bump() {{\n\t\t{bump_body}\n\t}}\n\n\t$: if (obj.v) {{\n\t\t// dup\n\t\tbar = 5;\n\t}}\n\n\tlet z = 1;\n</script>\n\n<select bind:value={{obj.v}}><option>{{bar}}</option></select>\n<button onclick={{bump}}>{{z}}</button>\n"
    );
    compile(
        &source,
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
    .matches("// dup")
    .count()
}

/// `obj.v = 3` mutates a `<select bind:value>` binding, so its thunk kills the
/// cursor before `let z = 1;` prints: only the in-place copy survives.
#[test]
fn a_dead_cursor_at_the_successor_drops_the_rehomed_copy() {
    assert_eq!(occurrences("obj.v = 3;", GenerateMode::Client), 1);
}

/// CONTROL — byte-identical but for `bump`'s body, which now builds no thunk.
/// The cursor is alive at `let z = 1;`, so the comment is printed twice.
#[test]
fn a_live_cursor_at_the_successor_keeps_both_copies() {
    assert_eq!(occurrences("bar = 9;", GenerateMode::Client), 2);
}

/// The server builds no effect and no thunk, so neither arm loses a copy.
#[test]
fn the_server_prints_both_copies_either_way() {
    assert_eq!(occurrences("obj.v = 3;", GenerateMode::Server), 2);
    assert_eq!(occurrences("bar = 9;", GenerateMode::Server), 2);
}
