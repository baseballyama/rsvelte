//! Upstream raises `directive_missing_name` from **one** place — `read_attribute`
//! in `1-parse/state/element.js`, right after `get_directive_type` — for every
//! kind that function recognises. rsvelte had the check written into three of the
//! eight per-directive parsers, so `style:`, `animate:`, `let:` and `on:` never
//! raised it at all and `bind:` raised `bind_invalid_name` with a different span.
//!
//! Two things upstream's single site decides that a per-parser copy drifts on:
//! the **message** carries the whole tag name (`style:|important`, not `style:`),
//! and the **end** is `start + colon_index + 1` — the colon, never the modifiers.
//!
//! Every code, message and span below was read off the official compiler at the
//! pinned `submodules/svelte` revision.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const PREAMBLE: &str = "<script>let x = 1; let h = () => {};</script>\n";

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

/// `(markup, the tag name upstream puts in the message)`. The span's end is
/// derived here rather than tabulated, because upstream derives it too:
/// `start + colon_index + 1`, which is why a modifier moves it not at all.
const MISSING_NAME: &[(&str, &str)] = &[
    ("<div use:={x}></div>", "use:"),
    ("<div transition:={x}></div>", "transition:"),
    ("<div in:={x}></div>", "in:"),
    ("<div out:={x}></div>", "out:"),
    ("<div class:={x}></div>", "class:"),
    ("<div bind:={x}></div>", "bind:"),
    ("<div style:={x}></div>", "style:"),
    ("<div animate:={x}></div>", "animate:"),
    ("<C let:={x} />", "let:"),
    ("<button on:={h}></button>", "on:"),
    // No value at all.
    ("<div use:></div>", "use:"),
    ("<div style:></div>", "style:"),
    ("<div on:></div>", "on:"),
    ("<div bind:></div>", "bind:"),
    ("<div let:></div>", "let:"),
    ("<div animate:></div>", "animate:"),
    ("<div class:></div>", "class:"),
    // A modifier does not make the name non-empty, and the message keeps it.
    ("<div style:|important={x}></div>", "style:|important"),
    ("<div on:|once={h}></div>", "on:|once"),
    ("<div bind:|x={y}></div>", "bind:|x"),
    ("<div class:|x={y}></div>", "class:|x"),
    // Whitespace after the colon, and the `=/>` value shape.
    ("<div style: ={x}></div>", "style:"),
    ("<div style:=\"a\"></div>", "style:"),
];

fn directive_start(markup: &str) -> usize {
    PREAMBLE.len() + markup.find(' ').expect("markup has a tag") + 1
}

#[test]
fn every_directive_kind_reports_directive_missing_name() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        for (markup, tag_name) in MISSING_NAME {
            let err = match compile_result(markup, generate) {
                Err(err) => err,
                Ok(code) => panic!("{markup:?} must not compile; emitted:\n{code}"),
            };
            assert!(
                err.contains("directive_missing_name"),
                "expected directive_missing_name for {markup:?}, got: {err}"
            );
            assert!(
                err.contains(&format!("`{tag_name}` name cannot be empty")),
                "message must name the whole tag for {markup:?}, got: {err}"
            );
            let start = directive_start(markup);
            let end = start
                + tag_name
                    .find(':')
                    .expect("a directive tag name has a colon")
                + 1;
            assert!(
                err.contains(&format!("span: ({start}, {end})")),
                "span must be ({start}, {end}) for {markup:?}, got: {err}"
            );
        }
    }
}

/// Upstream reads the attribute's value *before* testing the name, so a value
/// that cannot be read is what gets reported. Putting the name test first would
/// pass every one of these on the code alone and still be wrong.
const VALUE_ERROR_WINS: &[(&str, &str)] = &[
    ("<div style:\"x\"></div>", "expected_token"),
    ("<div use:\"x\"></div>", "expected_token"),
    ("<div on:\"x\"></div>", "expected_token"),
    ("<div style:=></div>", "expected_attribute_value"),
];

#[test]
fn a_value_that_cannot_be_read_is_reported_instead() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        for (markup, code) in VALUE_ERROR_WINS {
            let err = match compile_result(markup, generate) {
                Err(err) => err,
                Ok(js) => panic!("{markup:?} must not compile; emitted:\n{js}"),
            };
            assert!(
                err.contains(code),
                "expected {code} for {markup:?}, got: {err}"
            );
        }
    }
}

/// The over-rejection control: a real name, a prefix that is not a directive,
/// and the shorthand forms all still compile.
const LEGAL: &[&str] = &[
    "<div style:color={x}></div>",
    "<div style:color|important={x}></div>",
    "<div class:red={x}></div>",
    "<div class:red></div>",
    "<div bind:this={x}></div>",
    "<button on:click={h}></button>",
    "<button on:click|once={h}></button>",
    "<div use:x></div>",
    "<div transition:x></div>",
    "<div in:x></div>",
    "<div out:x></div>",
    "<C let:item />",
    "<div notadirective:={x}></div>",
    "<div xmlns:svg=\"a\"></div>",
];

#[test]
fn a_directive_with_a_name_still_compiles() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        for markup in LEGAL {
            if let Err(err) = compile_result(markup, generate) {
                panic!("{markup:?} must compile, got: {err}");
            }
        }
    }
}
