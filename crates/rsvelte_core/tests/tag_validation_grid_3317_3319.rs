//! Host x shape grids for the three `{@…}` tag validation issues, with the
//! official compiler's verdict recorded per cell, re-derived from the
//! `submodules/svelte` oracle every gate reads (5.56.9, 20b341f10).
//!
//! - #3317 `{@debug}` argument-list shapes (trailing / leading / double comma,
//!   spread) that official rejects and rsvelte accepted.
//! - #3318 `await` in an `{@attach}` expression, across every host a start tag
//!   can be.
//! - #3319 the empty tag body's `js_parse_error` message and the `end` of the
//!   `expected_token` a trailing `;` raises.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// What the official compiler does with a cell: accept, or reject with this
/// `(code, message, start_delta, end_delta)` where the deltas are relative to
/// the byte offset of `anchor` in the source.
#[derive(Clone, Copy)]
enum Verdict {
    Accept,
    Reject(&'static str, &'static str, usize, usize),
}
use Verdict::{Accept, Reject};

const UNEXPECTED: &str = "Unexpected token";
const NOT_IDENTIFIERS: &str =
    "{@debug ...} arguments must be identifiers, not arbitrary expressions";
const EXPECTED_BRACE: &str = "Expected token }";
const EXPECTED_TAG: &str = "Expected 'html', 'render', 'attach', 'const', or 'debug'";
const ASYNC: &str = "Cannot use `await` in deriveds and template expressions, or at the top level of a component, unless the `experimental.async` compiler option is `true`";

fn check(label: &str, src: &str, anchor: &str, expected: Verdict) -> Option<String> {
    let base = src.find(anchor).unwrap_or_else(|| {
        panic!("{label}: anchor {anchor:?} not found in source");
    });
    let result = compile(
        src,
        CompileOptions {
            generate: GenerateMode::Client,
            filename: Some("Comp.svelte".into()),
            ..Default::default()
        },
    );
    match (result, expected) {
        (Ok(_), Accept) => None,
        (Ok(_), Reject(code, ..)) => Some(format!("{label}: accepted, official rejects {code}")),
        (Err(err), Accept) => {
            let d = err.diagnostic();
            Some(format!(
                "{label}: rejected {:?}, official accepts",
                d.code.as_deref().unwrap_or("<none>")
            ))
        }
        (Err(err), Reject(code, message, start_delta, end_delta)) => {
            let d = err.diagnostic();
            let want = (
                code.to_string(),
                format!("{message}\nhttps://svelte.dev/e/{code}"),
                ((base + start_delta) as u32, (base + end_delta) as u32),
            );
            let got = (
                d.code.clone().unwrap_or_default(),
                d.message.clone(),
                d.span.unwrap_or((u32::MAX, u32::MAX)),
            );
            (got != want).then(|| format!("{label}:\n   want {want:?}\n   got  {got:?}"))
        }
    }
}

fn report(failures: Vec<String>) {
    assert!(
        failures.is_empty(),
        "{} divergence(s) from the official compiler:\n{}",
        failures.len(),
        failures.join("\n")
    );
}

const DEBUG_HEAD: &str = concat!(
    "<script>\n",
    "\timport Child from './Child.svelte';\n",
    "\tlet s = $state(1);\n",
    "\tlet n = $state(1);\n",
    "\tlet arr = $state([]);\n",
    "\tlet o = $state({ k: 1 });\n",
    "\tlet p = Promise.resolve(1);\n",
    "</script>\n"
);

/// The ten hosts #3317 enumerates, as `(name, wrapper)`.
fn debug_hosts() -> Vec<(&'static str, fn(&str) -> String)> {
    vec![
        ("root", (|t| t.to_string()) as fn(&str) -> String),
        ("element_child", |t| format!("<div>{t}</div>")),
        ("in_if", |t| format!("{{#if n}}{t}{{/if}}")),
        ("in_each", |t| format!("{{#each arr as a}}{t}{{/each}}")),
        ("in_snippet", |t| {
            format!("{{#snippet sn()}}{t}{{/snippet}}")
        }),
        ("component_child", |t| format!("<Child>{t}</Child>")),
        ("in_await", |t| format!("{{#await p then v}}{t}{{/await}}")),
        ("in_key", |t| format!("{{#key n}}{t}{{/key}}")),
        ("in_boundary", |t| {
            format!("<svelte:boundary>{t}</svelte:boundary>")
        }),
        ("in_fragment", |t| {
            format!("<Child><svelte:fragment slot=\"s\">{t}</svelte:fragment></Child>")
        }),
    ]
}

/// `{@debug}` argument shapes x host. Deltas are from the tag's `{`.
#[test]
fn debug_tag_argument_shapes_match_official() {
    let shapes: &[(&str, &str, Verdict)] = &[
        // #3317: the three list-shape errors rsvelte used to accept, plus the
        // double comma the same parse covers.
        (
            "trailing_comma",
            "{@debug s,}",
            Reject("js_parse_error", UNEXPECTED, 10, 10),
        ),
        (
            "leading_comma",
            "{@debug , s}",
            Reject("js_parse_error", UNEXPECTED, 8, 8),
        ),
        (
            "spread",
            "{@debug ...arr}",
            Reject("js_parse_error", UNEXPECTED, 8, 8),
        ),
        (
            "double_comma",
            "{@debug s,,n}",
            Reject("js_parse_error", UNEXPECTED, 10, 10),
        ),
        // trailing input after a complete list is `expected_token`, not a parse error
        (
            "trailing_junk",
            "{@debug s n}",
            Reject("expected_token", EXPECTED_BRACE, 10, 10),
        ),
        // the seventeen shapes that already agreed — kept as the negative control
        ("empty", "{@debug}", Accept),
        ("one", "{@debug s}", Accept),
        ("two", "{@debug s, n}", Accept),
        ("dup", "{@debug s, s}", Accept),
        ("undeclared", "{@debug nope}", Accept),
        ("paren", "{@debug (s)}", Accept),
        (
            "member",
            "{@debug o.k}",
            Reject("debug_tag_invalid_arguments", NOT_IDENTIFIERS, 8, 8),
        ),
        (
            "call",
            "{@debug fn()}",
            Reject("debug_tag_invalid_arguments", NOT_IDENTIFIERS, 8, 8),
        ),
        (
            "number",
            "{@debug 1}",
            Reject("debug_tag_invalid_arguments", NOT_IDENTIFIERS, 8, 8),
        ),
        (
            "string",
            "{@debug \"x\"}",
            Reject("debug_tag_invalid_arguments", NOT_IDENTIFIERS, 8, 8),
        ),
        (
            "assign",
            "{@debug s = 1}",
            Reject("debug_tag_invalid_arguments", NOT_IDENTIFIERS, 8, 8),
        ),
        (
            "ternary",
            "{@debug n ? s : o.k}",
            Reject("debug_tag_invalid_arguments", NOT_IDENTIFIERS, 8, 8),
        ),
    ];

    let mut failures = Vec::new();
    for (host, wrap) in debug_hosts() {
        for (shape, tag, expected) in shapes {
            let src = format!("{DEBUG_HEAD}{}\n", wrap(tag));
            if let Some(f) = check(&format!("debug/{host}/{shape}"), &src, "{@debug", *expected) {
                failures.push(f);
            }
        }
    }
    report(failures);
}

const ATTACH_HEAD: &str = concat!(
    "<script>\n",
    "\timport Child from './Child.svelte';\n",
    "\tlet att = $state(() => {});\n",
    "\tlet n = $state(1);\n",
    "\tlet o = $state({ f: () => {} });\n",
    "</script>\n"
);

/// Every host a start tag can be, per #3318, plus the two non-attribute
/// positions (`{@attach}` in fragment position, and inside a snippet body).
fn attach_hosts() -> Vec<(&'static str, fn(&str) -> String)> {
    vec![
        (
            "div",
            (|a| format!("<div {a}></div>")) as fn(&str) -> String,
        ),
        ("input", |a| format!("<input {a} />")),
        ("svelte_self", |a| {
            format!("{{#if n}}<svelte:self {a} />{{/if}}")
        }),
        ("svelte_head_child", |a| {
            format!("<svelte:head><div {a}></div></svelte:head>")
        }),
        ("svelte_fragment", |a| {
            format!("<Child><svelte:fragment slot=\"s\" {a}>y</svelte:fragment></Child>")
        }),
        ("svelte_boundary", |a| {
            format!("<svelte:boundary {a}>y</svelte:boundary>")
        }),
        ("svelte_options", |a| format!("<svelte:options {a} />")),
        ("component_self_closing", |a| format!("<Child {a} />")),
        ("component_with_children", |a| {
            format!("<Child {a}>y</Child>")
        }),
        ("svelte_element", |a| {
            format!("<svelte:element this={{'div'}} {a}></svelte:element>")
        }),
        ("svelte_component", |a| {
            format!("<svelte:component this={{Child}} {a} />")
        }),
        ("svelte_body", |a| format!("<svelte:body {a} />")),
        ("svelte_window", |a| format!("<svelte:window {a} />")),
        ("svelte_document", |a| format!("<svelte:document {a} />")),
        ("svelte_head_direct", |a| {
            format!("<svelte:head {a}></svelte:head>")
        }),
        ("title", |a| {
            format!("<svelte:head><title {a}>t</title></svelte:head>")
        }),
        ("slot", |a| format!("<slot {a} />")),
        ("in_snippet", |a| {
            format!("{{#snippet s()}}<div {a}></div>{{/snippet}}")
        }),
        ("in_each", |a| {
            format!("{{#each [1] as i}}<div {a}></div>{{/each}}")
        }),
        ("fragment_position", |a| format!("<div>{a}</div>")),
    ]
}

const AWAIT_ATTACH: &str = "{@attach await Promise.resolve(att)}";
const PLAIN_ATTACH: &str = "{@attach att}";

/// Per host: the verdict for `{@attach await …}` and for the `{@attach att}`
/// control, both anchored at the tag's `{`.
fn attach_expectations() -> Vec<(&'static str, Verdict, Verdict)> {
    // `await` is legal wherever an `{@attach}` itself is legal, so the two
    // columns only differ on hosts that reject the tag outright.
    let async_err = Reject("experimental_async", ASYNC, 9, 35);
    vec![
        ("div", async_err, Accept),
        ("input", async_err, Accept),
        ("svelte_self", async_err, Accept),
        ("svelte_head_child", async_err, Accept),
        (
            "svelte_fragment",
            Reject(
                "svelte_fragment_invalid_attribute",
                "`<svelte:fragment>` can only have a slot attribute and (optionally) a let: directive",
                0,
                AWAIT_ATTACH.len(),
            ),
            Reject(
                "svelte_fragment_invalid_attribute",
                "`<svelte:fragment>` can only have a slot attribute and (optionally) a let: directive",
                0,
                PLAIN_ATTACH.len(),
            ),
        ),
        (
            "svelte_boundary",
            Reject(
                "svelte_boundary_invalid_attribute",
                "Valid attributes on `<svelte:boundary>` are `onerror` and `failed`",
                0,
                AWAIT_ATTACH.len(),
            ),
            Reject(
                "svelte_boundary_invalid_attribute",
                "Valid attributes on `<svelte:boundary>` are `onerror` and `failed`",
                0,
                PLAIN_ATTACH.len(),
            ),
        ),
        (
            "svelte_options",
            Reject(
                "svelte_options_invalid_attribute",
                "`<svelte:options>` can only receive static attributes",
                0,
                AWAIT_ATTACH.len(),
            ),
            Reject(
                "svelte_options_invalid_attribute",
                "`<svelte:options>` can only receive static attributes",
                0,
                PLAIN_ATTACH.len(),
            ),
        ),
        ("component_self_closing", async_err, Accept),
        ("component_with_children", async_err, Accept),
        ("svelte_element", async_err, Accept),
        ("svelte_component", async_err, Accept),
        ("svelte_body", async_err, Accept),
        ("svelte_window", async_err, Accept),
        ("svelte_document", async_err, Accept),
        (
            "svelte_head_direct",
            Reject(
                "svelte_head_illegal_attribute",
                "`<svelte:head>` cannot have attributes nor directives",
                0,
                AWAIT_ATTACH.len(),
            ),
            Reject(
                "svelte_head_illegal_attribute",
                "`<svelte:head>` cannot have attributes nor directives",
                0,
                PLAIN_ATTACH.len(),
            ),
        ),
        (
            "title",
            Reject(
                "title_illegal_attribute",
                "`<title>` cannot have attributes nor directives",
                0,
                AWAIT_ATTACH.len(),
            ),
            Reject(
                "title_illegal_attribute",
                "`<title>` cannot have attributes nor directives",
                0,
                PLAIN_ATTACH.len(),
            ),
        ),
        (
            "slot",
            Reject(
                "slot_element_invalid_attribute",
                "`<slot>` can only receive attributes and (optionally) let directives",
                0,
                AWAIT_ATTACH.len(),
            ),
            Reject(
                "slot_element_invalid_attribute",
                "`<slot>` can only receive attributes and (optionally) let directives",
                0,
                PLAIN_ATTACH.len(),
            ),
        ),
        ("in_snippet", async_err, Accept),
        ("in_each", async_err, Accept),
        // `{@attach}` is an attribute form; upstream's `special()` does not know
        // it, so in fragment position it is an unknown tag name.
        (
            "fragment_position",
            Reject("expected_tag", EXPECTED_TAG, 2, 2),
            Reject("expected_tag", EXPECTED_TAG, 2, 2),
        ),
    ]
}

/// `await` in an `{@attach}` needs `experimental.async` on every host, not on
/// the seven the element visitors happened to implement it for.
#[test]
fn attach_tag_await_matches_official_on_every_host() {
    let hosts = attach_hosts();
    let expectations = attach_expectations();
    assert_eq!(
        hosts.len(),
        expectations.len(),
        "every host needs a recorded official verdict"
    );

    let mut failures = Vec::new();
    for ((host, wrap), (name, await_verdict, plain_verdict)) in hosts.iter().zip(&expectations) {
        assert_eq!(host, name, "host list and verdict list must stay aligned");
        for (column, body, expected) in [
            ("await", AWAIT_ATTACH, *await_verdict),
            ("plain", PLAIN_ATTACH, *plain_verdict),
        ] {
            let src = format!("{ATTACH_HEAD}{}\n", wrap(body));
            if let Some(f) = check(
                &format!("attach/{host}/{column}"),
                &src,
                "{@attach",
                expected,
            ) {
                failures.push(f);
            }
        }
    }
    report(failures);
}

/// #3319 part 1: an empty tag body is `Unexpected token`, the message acorn
/// gives for the unwrapped empty string — not the JS parser's message for `()`.
#[test]
fn empty_tag_expression_message_matches_official() {
    // `delta` is the offset of the `}` — the token acorn stops on — from the
    // anchor's `{`.
    let hosts: &[(&str, &str, &str, usize)] = &[
        ("html_root", "{@html }", "{@html", 7),
        ("html_in_div", "<div>{@html }</div>", "{@html", 7),
        ("html_in_if", "{#if 1}{@html }{/if}", "{@html", 7),
        ("attach_div", "<div {@attach }></div>", "{@attach", 9),
        ("attach_component", "<Child {@attach } />", "{@attach", 9),
        (
            "attach_svelte_element",
            "<svelte:element this={'div'} {@attach }></svelte:element>",
            "{@attach",
            9,
        ),
        ("mustache", "{}", "{}", 1),
        ("attribute", "<div a={}></div>", "{}", 1),
    ];

    let mut failures = Vec::new();
    for (name, src, anchor, delta) in hosts {
        if let Some(f) = check(
            &format!("empty/{name}"),
            src,
            anchor,
            Reject("js_parse_error", UNEXPECTED, *delta, *delta),
        ) {
            failures.push(f);
        }
    }
    report(failures);
}

/// #3319 part 2: a trailing `;` in a tag body is a zero-width `expected_token`
/// at the `;`, not a one-character range.
#[test]
fn trailing_semicolon_end_matches_official() {
    let hosts: &[(&str, String)] = &[
        ("root", "{@html s;}".to_string()),
        ("element_child", "<div>{@html s;}</div>".to_string()),
        ("in_if", "{#if n}{@html s;}{/if}".to_string()),
        ("in_each", "{#each arr as a}{@html s;}{/each}".to_string()),
        (
            "in_snippet",
            "{#snippet sn()}{@html s;}{/snippet}".to_string(),
        ),
        ("component_child", "<Child>{@html s;}</Child>".to_string()),
        ("in_key", "{#key n}{@html s;}{/key}".to_string()),
        (
            "in_boundary",
            "<svelte:boundary>{@html s;}</svelte:boundary>".to_string(),
        ),
        (
            "in_fragment",
            "<Child><svelte:fragment slot=\"s\">{@html s;}</svelte:fragment></Child>".to_string(),
        ),
    ];

    let mut failures = Vec::new();
    for (name, body) in hosts {
        let src = format!("{DEBUG_HEAD}{body}\n");
        if let Some(f) = check(
            &format!("semicolon/{name}"),
            &src,
            "{@html",
            Reject("expected_token", EXPECTED_BRACE, 8, 8),
        ) {
            failures.push(f);
        }
    }
    report(failures);
}
