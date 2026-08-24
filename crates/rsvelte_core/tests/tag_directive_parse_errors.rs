//! Parse-time errors for template tags and directives, measured against the
//! official compiler (issues #3202, #3246, #3247, #3280).
//!
//! Four defects of one shape — a check that exists somewhere else in the
//! parser, or a diagnostic that is thrown away before it can be raised:
//!
//! - `{@const}` / the `{#await}` head / `{@render}` / `{@debug}` routed their
//!   JS through a parse that turned **any** failure into an empty identifier,
//!   so ordinary broken JavaScript compiled (#3202).
//! - `{@const c}` with no `=` dropped the declaration and left the body
//!   referencing a name nothing declares — output that parses (#3246).
//! - An unterminated `{` unwound to the enclosing element or block and blamed
//!   that, and at the root of the template was not reported at all (#3247).
//! - `directive_missing_name` was raised per directive kind, so four kinds
//!   never raised it and a fifth raised `bind_invalid_name` instead; unknown
//!   `{@…}` tags were skipped verbatim rather than rejected (#3280).
//!
//! Every expectation below is the official compiler's `(code, line, column)`
//! for that exact source.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn try_compile(src: &str) -> Result<(), (String, usize, usize)> {
    match compile(
        src,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    ) {
        Ok(_) => Ok(()),
        Err(e) => {
            let d = e.diagnostic();
            let start = d
                .span
                .map(|(s, _)| rsvelte_core::compiler::source_position(src, s))
                .expect("a coded parse error carries a span");
            Err((
                d.code.unwrap_or_else(|| "<uncoded>".to_string()),
                start.line,
                start.column,
            ))
        }
    }
}

#[track_caller]
fn assert_error(src: &str, code: &str, line: usize, column: usize) {
    match try_compile(src) {
        Ok(()) => panic!("expected `{code}` for {src:?}, but it compiled"),
        Err(actual) => assert_eq!(
            (actual.0.as_str(), actual.1, actual.2),
            (code, line, column),
            "for {src:?}"
        ),
    }
}

#[track_caller]
fn assert_compiles(src: &str) {
    if let Err((code, line, column)) = try_compile(src) {
        panic!("expected {src:?} to compile, got `{code}` at {line}:{column}");
    }
}

// -- #3202 -------------------------------------------------------------------

#[test]
fn const_tag_propagates_js_parse_errors() {
    assert_error(
        "{#if true}{@const c = 1 +}<b>{c}</b>{/if}",
        "js_parse_error",
        1,
        25,
    );
    assert_error(
        "{#if true}{@const c = 42 = nope}<b>{c}</b>{/if}",
        "js_parse_error",
        1,
        22,
    );
}

#[test]
fn await_head_propagates_js_parse_errors() {
    // Acorn reads `1 + then` as one expression, so the leftover `v` is where
    // the `}` was expected — the head has to be classified as a whole.
    assert_error(
        "{#await 1 + then v}<b>{v}</b>{/await}",
        "expected_token",
        1,
        17,
    );
    assert_error(
        "{#await 42 = nope then v}<b>{v}</b>{/await}",
        "js_parse_error",
        1,
        8,
    );
}

#[test]
fn render_tag_propagates_js_parse_errors() {
    // Previously the swallowed expression became an empty identifier, and the
    // downstream "must be a call" check stood in for the dropped error.
    assert_error("{@render s(42 = nope)}", "js_parse_error", 1, 11);
}

#[test]
fn debug_tag_propagates_js_parse_errors() {
    assert_error("{@debug a +}", "js_parse_error", 1, 11);
    assert_error("{@debug a b}", "expected_token", 1, 10);
    assert_error("{@debugx y}", "expected_token", 1, 9);
}

#[test]
fn valid_tags_still_compile() {
    assert_compiles("{@html x}");
    assert_compiles("{@debug}");
    assert_compiles("{@render s()}");
    assert_compiles("{@render s?.()}");
    assert_compiles("{#await p then v}{v}{/await}");
    assert_compiles("{#await p}a{:then v}{v}{:catch e}{e}{/await}");
    assert_compiles("{#if true}{@const c = 1}<b>{c}</b>{/if}");
    assert_compiles("{#if true}{@const c = (1, 2)}<b>{c}</b>{/if}");
    assert_compiles("{#if true}{@const { a, b = 2 } = o}<b>{a}{b}</b>{/if}");
    assert_compiles("{#each [1] as v}{@const c = v}<b>{c}</b>{/each}");
}

// -- #3246 -------------------------------------------------------------------

#[test]
fn const_tag_without_initialiser_is_rejected() {
    assert_error(
        "{#if true}{@const c}<b>{c}</b>{/if}",
        "expected_token",
        1,
        19,
    );
    assert_error(
        "{#if true}{@const c }<b>{c}</b>{/if}",
        "expected_token",
        1,
        20,
    );
    // The two neighbouring shapes were already right; keep them pinned.
    assert_error("{@const}", "expected_whitespace", 1, 7);
    assert_error(
        "{#if true}{@const a = 1, b = 2}x{/if}",
        "const_tag_invalid_expression",
        1,
        22,
    );
}

// -- #3247 -------------------------------------------------------------------

#[test]
fn unterminated_expression_is_blamed_on_the_expression() {
    assert_error("<div>{1</div>", "js_parse_error", 1, 9);
    assert_error("<div>{x</div>", "js_parse_error", 1, 9);
    assert_error("<div><span>{1</span></div>", "js_parse_error", 1, 26);
    assert_error("<p>{a</p>", "js_parse_error", 1, 7);
    assert_error("{1<div>x</div>", "js_parse_error", 1, 10);
    assert_error("<div>{'}'</div>", "js_parse_error", 1, 11);
    assert_error("{#each [1] as v}{1{/each}", "expected_token", 1, 18);
    assert_error("{#if true}{@const c = 1{/if}", "expected_token", 1, 23);
    assert_error("{#if x}{1{/if}", "expected_token", 1, 9);
    assert_error("<div title={1>x</div>", "js_parse_error", 1, 17);
    // Upstream turns the `Unterminated regular expression` a trailing `/>`
    // provokes back into the missing `}`.
    assert_error("<C a={1 />", "expected_token", 1, 9);
    assert_error("{@html x", "expected_token", 1, 8);
}

#[test]
fn unterminated_expression_at_the_root_is_reported() {
    // Both of these used to compile, emitting a tag for a `{` that never closed.
    assert_error("{1", "expected_token", 1, 2);
    assert_error("{x", "expected_token", 1, 2);
}

// -- #3280 -------------------------------------------------------------------

#[test]
fn every_directive_kind_rejects_an_empty_name() {
    assert_error("<div use:={x}>", "directive_missing_name", 1, 5);
    assert_error("<div transition:={x}>", "directive_missing_name", 1, 5);
    assert_error("<div class:={x}>", "directive_missing_name", 1, 5);
    assert_error("<div bind:={x}>", "directive_missing_name", 1, 5);
    assert_error("<div style:={x}>", "directive_missing_name", 1, 5);
    assert_error("<div animate:={x}>", "directive_missing_name", 1, 5);
    assert_error("<C let:={x}>", "directive_missing_name", 1, 3);
    assert_error("<button on:={h}>", "directive_missing_name", 1, 8);
    assert_error("<div in:={x}>", "directive_missing_name", 1, 5);
    assert_error("<div out:={x}>", "directive_missing_name", 1, 5);
    // The name is empty when only modifiers follow the colon, too.
    assert_error("<div bind:|x={y}>", "directive_missing_name", 1, 5);
    assert_error("<div style:|important={x}>", "directive_missing_name", 1, 5);
}

#[test]
fn empty_directive_name_ends_at_the_colon() {
    // `bind:` used to report `bind_invalid_name` and to end at the value.
    let spans = [
        ("<div use:={x}>", 9),
        ("<div bind:={x}>", 10),
        ("<div style:={x}>", 11),
        ("<div animate:={x}>", 13),
        ("<button on:={h}>", 11),
        ("<div bind:|x={y}>", 10),
    ];
    for (src, end_column) in spans {
        let err = compile(
            src,
            CompileOptions {
                filename: Some("A.svelte".to_string()),
                generate: GenerateMode::Client,
                css: CssMode::External,
                ..Default::default()
            },
        )
        .expect_err("expected a parse error");
        let (_, end) = err.diagnostic().span.expect("span");
        assert_eq!(
            rsvelte_core::compiler::source_position(src, end).column,
            end_column,
            "for {src:?}"
        );
    }
}

#[test]
fn a_broken_directive_value_outranks_the_missing_name() {
    // Upstream reads the value before rejecting the name.
    assert_error("<div use:={1 +}>", "js_parse_error", 1, 14);
    assert_error("<div class:={1 +}>", "js_parse_error", 1, 16);
}

#[test]
fn unknown_special_tags_are_rejected() {
    assert_error("{@bogus x}", "expected_tag", 1, 2);
    assert_error("{@nope}", "expected_tag", 1, 2);
    assert_error("{@}", "expected_tag", 1, 2);
    assert_error("{@ }", "expected_tag", 1, 2);
    // `{@attach}` is an attribute, not a tag.
    assert_error("{@attach foo}", "expected_tag", 1, 2);
    assert_error("{@attachx y}", "expected_tag", 1, 2);
}

#[test]
fn valid_directives_still_compile() {
    assert_compiles("<div use:x={y}></div>");
    assert_compiles("<div style:color={y}></div>");
    assert_compiles("<div style:color|important={y}></div>");
    assert_compiles("<div class:red={y}></div>");
    assert_compiles("<div bind:this={el}></div>");
    assert_compiles("<div transition:fade|global></div>");
    assert_compiles("<C let:x></C>");
    assert_compiles("<button on:click|preventDefault={h}></button>");
    assert_compiles("{#each [1] as v (v)}<div animate:flip></div>{/each}");
    // A colon-bearing name that is not a directive stays a plain attribute.
    assert_compiles("<svg><use xlink:href=\"#a\"></use></svg>");
    assert_compiles("<div foo:bar=\"1\"></div>");
    assert_compiles("<div><span {@attach a}></span></div>");
}
