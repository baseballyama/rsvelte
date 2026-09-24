//! An unnamed `compile()` names its source `(unknown)`, not `input.svelte` (#4704).
//!
//! `validate_options` replaces an absent `filename` with `(unknown)` before
//! anything reads it, so upstream's `get_source_name(filename, output_filename,
//! fallback)` never sees an absent filename — and its `fallback` parameter is
//! unused in the body (`utils/mapped_code.js:471`). rsvelte's port kept the
//! parameter and *used* it, so an unnamed component was named by the dead
//! default instead.
//!
//! Every expectation below was read off the oracle (`submodules/svelte`
//! `636eaaaa6`, `VERSION 5.57.1`) by compiling the same source, not inferred
//! from the sibling module port.

use rsvelte_core::{CompileOptions, GenerateMode, compile};
use serde_json::Value;

const SRC: &str = "<script>let n = $state(1);</script><p>{n}</p><style>p{color:red}</style>";

fn sources(options: CompileOptions) -> (Vec<String>, Vec<String>) {
    let result = compile(SRC, options).expect("compiles");
    let read = |map: Option<&str>| {
        map.map(|text| {
            serde_json::from_str::<Value>(text).expect("the map is JSON")["sources"]
                .as_array()
                .expect("sources is an array")
                .iter()
                .map(|value| value.as_str().expect("a source is a string").to_string())
                .collect::<Vec<_>>()
        })
        .unwrap_or_default()
    };
    (
        read(result.js.map.as_deref()),
        read(result.css.as_ref().and_then(|css| css.map.as_deref())),
    )
}

fn options(generate: GenerateMode) -> CompileOptions {
    CompileOptions {
        generate,
        ..Default::default()
    }
}

#[test]
fn an_unnamed_component_is_named_unknown_on_both_targets() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let (js, css) = sources(options(generate));
        assert_eq!(js, ["(unknown)"], "js sources for {generate:?}");
        assert_eq!(css, ["(unknown)"], "css sources for {generate:?}");
    }
}

#[test]
fn an_output_filename_makes_the_unnamed_source_relative() {
    // The oracle joins the parts verbatim, so one directory of output path
    // yields one `../` — and the name it is relative to is still `(unknown)`.
    let (js, css) = sources(CompileOptions {
        output_filename: Some("out/App.js".to_string()),
        ..options(GenerateMode::Client)
    });
    assert_eq!(js, ["../(unknown)"]);
    assert_eq!(
        css,
        ["(unknown)"],
        "cssOutputFilename is what moves the css map"
    );

    let (js, css) = sources(CompileOptions {
        css_output_filename: Some("out/App.css".to_string()),
        ..options(GenerateMode::Client)
    });
    assert_eq!(js, ["(unknown)"], "outputFilename is what moves the js map");
    assert_eq!(css, ["../(unknown)"]);
}

#[test]
fn a_named_component_is_unaffected() {
    // The positive control: the substitution only fires when `filename` is
    // absent, so the named case must keep the basename the oracle prints.
    let (js, css) = sources(CompileOptions {
        filename: Some("src/App.svelte".to_string()),
        ..options(GenerateMode::Client)
    });
    assert_eq!(js, ["App.svelte"]);
    assert_eq!(css, ["App.svelte"]);
}
