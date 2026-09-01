//! A destructured `$derived.by()` whose callback has a block body must still make
//! every later read of the destructured name a call.
//!
//! `post_process_for_server` decides `$.get(x)` → `x()` from a set of names it
//! scans out of the emitted declarators, and it located a comma-continued
//! declarator by walking back to the nearest `;`. A block body puts a `;` inside
//! the previous declarator, so the second name was dropped and its reads came out
//! bare — output that parses, runs, and is silently wrong. The concise-body row
//! and the client/component rows below are the controls.

use rsvelte_core::{GenerateMode, ModuleCompileOptions, compile_module};

fn emit(source: &str, generate: GenerateMode) -> String {
    compile_module(
        source,
        ModuleCompileOptions {
            filename: Some("X.svelte.js".to_string()),
            generate,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const BLOCK: &str = r#"export function f(o) {
	const { allItems } = $derived.by(() => { return o; });
	console.log(allItems);
}
"#;

const CONCISE: &str = r#"export function f(o) {
	const { allItems } = $derived.by(() => o);
	console.log(allItems);
}
"#;

#[test]
fn a_block_bodied_callback_still_makes_the_read_a_call() {
    let out = emit(BLOCK, GenerateMode::Server);
    assert!(
        out.contains("console.log(allItems())"),
        "the read must be a call:\n{out}"
    );
}

#[test]
fn a_concise_bodied_callback_is_unchanged() {
    let out = emit(CONCISE, GenerateMode::Server);
    assert!(
        out.contains("console.log(allItems())"),
        "the read must be a call:\n{out}"
    );
}

#[test]
fn the_client_target_reads_through_get() {
    let out = emit(BLOCK, GenerateMode::Client);
    assert!(
        out.contains("console.log($.get(allItems))"),
        "the client reads the signal:\n{out}"
    );
}
