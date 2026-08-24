//! A bare `{@debug}` inside a regular element shipped a `debugger;` to
//! production: rsvelte emitted `$.template_effect(() => { console.log({});
//! debugger; })` where official emits nothing, in **non-dev** client output
//! (#3376).
//!
//! Upstream's `RegularElement.js` flushes `child_state.init` only when the
//! element has declarations or `node.fragment.metadata.dynamic` is set, and
//! that flag comes from the `Identifier` visitor — so a `{@debug}` with no
//! identifiers leaves the fragment static and its effect is discarded. rsvelte
//! reconstructs the flag from the fragment's children and counted *any*
//! `{@debug}` as a producer.
//!
//! Every cell below is the `console.log` argument official emits for that
//! (case, target), measured against `svelte.compile`. The whole 17-case client
//! output is byte-identical to official's, so the arguments are a readable
//! index into that rather than the property being asserted.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const PRE: &str = "<script>\n\tlet items = $state([1]);\n\tlet flag = $state(true);\n\tlet str = $state('x');\n</script>\n";

fn logged(body: &str, generate: GenerateMode, dev: bool) -> String {
    let code = compile(
        &format!("{PRE}{body}"),
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate,
            dev,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .unwrap_or_else(|e| panic!("must compile: {body:?}: {e:?}"))
    .js
    .code;

    match code.find("console.log(") {
        Some(i) => {
            let rest = &code[i + "console.log(".len()..];
            let end = rest.find(");").unwrap_or(rest.len());
            rest[..end].replace('\n', " ")
        }
        None => "NO".to_string(),
    }
}

fn assert_all_targets(body: &str, client: &str, server: &str) {
    assert_eq!(
        logged(body, GenerateMode::Client, false),
        client,
        "client {body:?}"
    );
    assert_eq!(
        logged(body, GenerateMode::Client, true),
        client,
        "client-dev {body:?}"
    );
    assert_eq!(
        logged(body, GenerateMode::Server, false),
        server,
        "server {body:?}"
    );
    assert_eq!(
        logged(body, GenerateMode::Server, true),
        server,
        "server-dev {body:?}"
    );
}

/// The nine shapes that shipped a `debugger;`. All are a bare `{@debug}` whose
/// nearest ancestor is a regular element.
#[test]
fn a_bare_debug_in_a_regular_element_is_dropped_from_client_output() {
    for body in [
        "<div>{@debug}</div>",
        "<div>{@debug}<b>x</b></div>",
        "<div><b>x</b>{@debug}</div>",
        "<p>{@debug}</p>",
        "<section>{@debug}</section>",
        "<div id=\"i\">{@debug}</div>",
        "<div>t{@debug}</div>",
        "{#if flag}<div>{@debug}</div>{/if}",
        "{#each items as it}<div>{@debug}</div>{/each}",
    ] {
        assert_all_targets(body, "NO", "{}");
    }
}

/// `debugger` is the half that made this a production defect rather than a
/// formatting one, so it gets its own assertion on the raw text.
#[test]
fn no_debugger_statement_reaches_production_client_output() {
    for body in ["<div>{@debug}</div>", "{#if flag}<div>{@debug}</div>{/if}"] {
        let code = compile(
            &format!("{PRE}{body}"),
            CompileOptions {
                filename: Some("T.svelte".to_string()),
                generate: GenerateMode::Client,
                dev: false,
                css: CssMode::External,
                ..Default::default()
            },
        )
        .unwrap()
        .js
        .code;
        assert!(!code.contains("debugger"), "for {body:?}:\n{code}");
    }
}

/// The other half of the rule: a `{@debug}` that is *not* discarded. Without
/// these the fix reads as "drop every bare `{@debug}`", which is a different
/// and wrong rule — the fragment root and `<svelte:element>` keep theirs.
#[test]
fn a_bare_debug_outside_a_regular_element_still_emits() {
    assert_all_targets("{@debug}", "{}", "{}");
    assert_all_targets("{@debug}<b>x</b>", "{}", "{}");
    assert_all_targets(
        "<svelte:element this={\"div\"}>{@debug}</svelte:element>",
        "{}",
        "{}",
    );
}

/// And the axis that decides it is the identifier list, not the position: the
/// same slot keeps its effect as soon as `{@debug}` names something, because
/// that is what makes upstream's fragment dynamic.
#[test]
fn a_debug_with_identifiers_still_emits_in_the_same_slot() {
    assert_all_targets(
        "<div>{@debug str}</div>",
        "{ str: $.snapshot(str) }",
        "{ str }",
    );
    assert_all_targets(
        "<div>{@debug items}</div>",
        "{ items: $.snapshot(items) }",
        "{ items }",
    );
}

/// Already-correct neighbours, kept so a fix that widened the drop by one level
/// would be visible.
#[test]
fn nested_regular_elements_were_already_dropping_it() {
    for body in [
        "<div><span>{@debug}</span></div>",
        "<div><div>{@debug}</div></div>",
        "<b>y</b><div>{@debug}</div>",
    ] {
        assert_all_targets(body, "NO", "{}");
    }
}
