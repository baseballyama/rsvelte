//! A rebuilt declaration prints its comment between the keyword and the first
//! declarator, so the text the async-body transform receives reads
//! `const /* c */ a = await …`. Nothing there may treat that comment as part of
//! the declarator's NAME: the hoist happens to look right either way, while the
//! thunk repeats the comment and the blocker map keys on a name no template read
//! can match — which silently drops `$.template_effect`'s promise dependency.
//!
//! Every expectation below is the official compiler's bytes (5.56.10,
//! `experimental: { async: true }`).

use rsvelte_core::compiler::ExperimentalOptions;
use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(body: &str) -> String {
    let src = format!(
        "<script>\n\tlet {{ p, q }} = $props();\n\t{body}\n</script>\n\n<p>{{typeof a}}</p>\n"
    );
    compile(
        &src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const MULTI: &str = "const a = $derived(await p), b = $derived(await q);";

const RUN: &str = "\tvar $$promises = $.run([\n\
                   \t\tasync () => a = await $.async_derived(() => $$props.p),\n\
                   \t\tasync () => b = await $.async_derived(() => $$props.q)\n\
                   \t]);";

/// The blocker that `$.template_effect` waits on. Its absence is the reactivity
/// loss this file exists for, and the output still parses without it.
const BLOCKED: &str =
    "$.template_effect(() => $.set_text(text, typeof $.get(a)), void 0, void 0, [$$promises[0]]);";

#[test]
fn an_own_line_comment_prints_once_and_only_on_the_hoist() {
    let out = client(&format!("// svelte-ignore await_waterfall\n\t{MULTI}"));
    assert!(
        out.contains("\tvar // svelte-ignore await_waterfall\n\t\ta,\n\t\tb;"),
        "{out}"
    );
    assert!(out.contains(RUN), "{out}");
    assert_eq!(
        out.matches("svelte-ignore await_waterfall").count(),
        1,
        "{out}"
    );
}

#[test]
fn an_own_line_comment_leaves_the_blocker_on_the_declarator() {
    let out = client(&format!("// svelte-ignore await_waterfall\n\t{MULTI}"));
    assert!(out.contains(BLOCKED), "{out}");
}

#[test]
fn an_own_line_block_comment_breaks_the_hoist_the_same_way() {
    let out = client(&format!("/* svelte-ignore await_waterfall */\n\t{MULTI}"));
    assert!(
        out.contains("\tvar /* svelte-ignore await_waterfall */\n\t\ta,\n\t\tb;"),
        "{out}"
    );
    assert!(out.contains(RUN), "{out}");
    assert!(out.contains(BLOCKED), "{out}");
}

/// The discriminating row: the same block comment on the declaration's own line
/// keeps the hoist on ONE line, so the rule cannot be "a comment always breaks".
#[test]
fn a_same_line_block_comment_keeps_the_hoist_on_one_line() {
    let out = client(&format!("/* svelte-ignore await_waterfall */ {MULTI}"));
    assert!(
        out.contains("\tvar /* svelte-ignore await_waterfall */ a, b;"),
        "{out}"
    );
    assert!(out.contains(RUN), "{out}");
    assert!(out.contains(BLOCKED), "{out}");
}

/// A comment naming a different code reaches the same path, so the rule is the
/// comment's POSITION and never its text.
#[test]
fn an_unrelated_ignore_comment_takes_the_same_path() {
    let out = client(&format!(
        "// svelte-ignore state_referenced_locally\n\t{MULTI}"
    ));
    assert!(
        out.contains("\tvar // svelte-ignore state_referenced_locally\n\t\ta,\n\t\tb;"),
        "{out}"
    );
    assert!(out.contains(RUN), "{out}");
    assert!(out.contains(BLOCKED), "{out}");
}

/// CONTROL — no comment at all. The hoist and the blocker must be unchanged, so
/// a fix that repairs the commented rows by disturbing this one is visible.
#[test]
fn an_uncommented_declaration_is_unchanged() {
    let out = client(MULTI);
    assert!(out.contains("\tvar a, b;"), "{out}");
    assert!(out.contains(RUN), "{out}");
    assert!(out.contains(BLOCKED), "{out}");
}

/// CONTROL — one declarator takes the same hoist path, and every property this
/// file is about must hold there too. The byte string is the full upstream
/// shape again: the continuation line used to sit at column 0 while upstream
/// indents it, which was pinned as its own test here until the restore-side
/// insertion started reading the `var` line's own indent.
#[test]
fn a_single_declarator_keeps_its_own_hoist_shape() {
    let out = client("// svelte-ignore await_waterfall\n\tconst a = $derived(await p);");
    assert!(
        out.contains("\tvar // svelte-ignore await_waterfall\n\ta;"),
        "{out}"
    );
    assert!(
        out.contains(
            "\tvar $$promises = $.run([async () => a = await $.async_derived(() => $$props.p)]);"
        ),
        "{out}"
    );
    assert!(out.contains(BLOCKED), "{out}");
    assert_eq!(
        out.matches("svelte-ignore await_waterfall").count(),
        1,
        "{out}"
    );
}
