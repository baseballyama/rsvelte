//! Upstream reads an attribute's value **once**, in `read_attribute`, before it
//! knows which directive kind it has, and then applies two more rules to it:
//! `read_attribute_value` rejects an absent value (`expected_attribute_value`),
//! and every directive except `style:` demands that the value be a single
//! expression (`directive_invalid_value`). rsvelte had eight per-directive
//! parsers each hand-rolling its own `if self.eat_optional("=")`, so neither rule
//! existed on the directive path at all — the same "one upstream site, N ports"
//! shape as `directive_missing_name` two lines above it.
//!
//! `style:` is exempt from the single-expression rule because upstream returns
//! the `StyleDirective` before reaching it, not because it reads its value
//! differently — it goes through the same shared read here.
//!
//! Every code, message and span below was read off the official compiler at the
//! pinned `submodules/svelte` revision.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const PREAMBLE: &str = "<script>let x = 1; let n = () => {}; let h = () => {};</script>\n";

fn compile_result(markup: &str, generate: GenerateMode) -> Result<String, String> {
    compile(
        &format!("{PREAMBLE}{markup}\n"),
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .map_err(|e| format!("{e:?}"))
}

/// `(markup, offset of the reported point inside `markup`)`. The point is where
/// the value's content starts — just past an opening quote, or the cursor itself
/// when the value is unquoted — because upstream reports `first_value.start`.
const INVALID_VALUE: &[(&str, usize)] = &[
    // Every directive kind except `style:`.
    ("<div use:n=\"a\"></div>", 12),
    ("<div transition:n=\"a\"></div>", 19),
    ("<div in:n=\"a\"></div>", 11),
    ("<div out:n=\"a\"></div>", 12),
    ("<div class:n=\"a\"></div>", 14),
    ("<div bind:n=\"a\"></div>", 13),
    ("<div animate:n=\"a\"></div>", 16),
    ("<div on:n=\"a\"></div>", 11),
    ("<C let:n=\"a\" />", 10),
    // Value shapes, on one kind.
    ("<div use:n=abc></div>", 11),
    ("<div use:n=1></div>", 11),
    ("<div use:n=/></div>", 11),
    ("<div use:n=\"\"></div>", 12),
    ("<div use:n=\"{x}{x}\"></div>", 12),
    ("<div use:n=\"a{x}\"></div>", 12),
    ("<div use:n=\"{x}y\"></div>", 12),
    ("<div use:n={x}y></div>", 11),
    ("<C let:n= />", 10),
];

/// `=` with nothing after it, which `read_attribute_value` reports before
/// anything else. `style:` is included because it shares the read.
const EXPECTED_ATTRIBUTE_VALUE: &[(&str, usize)] = &[
    ("<div use:n=></div>", 11),
    ("<div transition:n=></div>", 18),
    ("<div in:n=></div>", 10),
    ("<div out:n=></div>", 11),
    ("<div class:n=></div>", 13),
    ("<div bind:n=></div>", 12),
    ("<div animate:n=></div>", 15),
    ("<div on:n=></div>", 10),
    ("<div style:n=></div>", 13),
];

/// `style:` takes a text value — upstream returns the `StyleDirective` before
/// the single-expression test — and so do the shapes that are legal everywhere.
const LEGAL: &[&str] = &[
    "<div style:n=\"a\"></div>",
    "<div style:color=\"red\"></div>",
    "<div style:n=abc></div>",
    "<div style:n=\"\"></div>",
    "<div style:n=\"a{x}\"></div>",
    "<div style:n={x}></div>",
    "<div style:n></div>",
    "<div style:color|important={x}></div>",
    "<div use:n></div>",
    "<div use:n={x}></div>",
    "<div use:n=\"{x}\"></div>",
    "<div use:n='{x}'></div>",
    "<div use:n= {x}></div>",
    "<div class:n></div>",
    "<div class:n={x}></div>",
    "<div bind:this></div>",
    "<div bind:this={x}></div>",
    "<button on:click={h}></button>",
    "<C let:item />",
    "<C let:item={x} />",
    "<div transition:n></div>",
    // A colon in an attribute name is not a directive, and these keep the
    // ordinary attribute behaviour.
    "<div notadirective:n=\"a\"></div>",
    "<div xmlns:svg=\"a\"></div>",
];

fn point(offset: usize) -> usize {
    PREAMBLE.len() + offset
}

#[test]
fn a_directive_value_that_is_not_one_expression_is_directive_invalid_value() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        for (markup, offset) in INVALID_VALUE {
            let err = match compile_result(markup, generate) {
                Err(err) => err,
                Ok(code) => panic!("{markup:?} must not compile; emitted:\n{code}"),
            };
            assert!(
                err.contains("directive_invalid_value"),
                "expected directive_invalid_value for {markup:?}, got: {err}"
            );
            let at = point(*offset);
            assert!(
                err.contains(&format!("span: ({at}, {at})")),
                "span must be the point ({at}, {at}) for {markup:?}, got: {err}"
            );
        }
    }
}

#[test]
fn an_absent_directive_value_is_expected_attribute_value() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        for (markup, offset) in EXPECTED_ATTRIBUTE_VALUE {
            let err = match compile_result(markup, generate) {
                Err(err) => err,
                Ok(code) => panic!("{markup:?} must not compile; emitted:\n{code}"),
            };
            assert!(
                err.contains("expected_attribute_value"),
                "expected expected_attribute_value for {markup:?}, got: {err}"
            );
            let at = point(*offset);
            assert!(
                err.contains(&format!("span: ({at}, {at})")),
                "span must be the point ({at}, {at}) for {markup:?}, got: {err}"
            );
        }
    }
}

#[test]
fn the_legal_neighbours_still_compile() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        for markup in LEGAL {
            if let Err(err) = compile_result(markup, generate) {
                panic!("{markup:?} must compile, got: {err}");
            }
        }
    }
}

/// `style_directive_invalid_modifier` is upstream's `StyleDirective` visitor, so
/// every element parent reaches it. rsvelte checks it per element-visitor arm,
/// and three special elements had no arm — the #2497 shape. `<svelte:head>` is
/// the control: it rejects the attribute before the modifier is ever looked at.
#[test]
fn a_bad_style_modifier_is_reported_whatever_the_host() {
    const HOSTS: &[&str] = &[
        "div",
        "svelte:element this={'div'}",
        "svelte:body",
        "svelte:window",
        "svelte:document",
    ];
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        for host in HOSTS {
            let tag = host.split(' ').next().unwrap();
            let markup = format!("<{host} style:n|m></{tag}>");
            let err = match compile_result(&markup, generate) {
                Err(err) => err,
                Ok(code) => panic!("{markup:?} must not compile; emitted:\n{code}"),
            };
            assert!(
                err.contains("style_directive_invalid_modifier"),
                "expected style_directive_invalid_modifier for {markup:?}, got: {err}"
            );
        }
        for host in HOSTS {
            let tag = host.split(' ').next().unwrap();
            let markup = format!("<{host} style:n|important={{x}}></{tag}>");
            if let Err(err) = compile_result(&markup, generate) {
                panic!("{markup:?} must compile, got: {err}");
            }
        }
    }
}
