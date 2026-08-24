//! `js.map` header fields (issue #3295).
//!
//! Upstream builds the JS map with esrap's `print()`, which emits no `file` key
//! at all, and derives `sources` from `get_source_name` — whose `outputFilename`
//! branch (`utils/mapped_code.js:430`) joins the relative parts verbatim, with no
//! `./` prefix. rsvelte baked in a constant `"input.svelte.js"` for `file` and
//! prefixed every `outputFilename`-relative source with `./`.
//!
//! The CSS map is the control: upstream *does* set `file` there
//! (`3-transform/css/index.js`), so a fix that strips the key everywhere would
//! break it.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};
use serde_json::Value;

const SRC: &str = "<script>\n\tlet n = $state(1);\n</script>\n<p class=\"k\">{n}</p>\n<style>.k { color: red }</style>";

fn maps(opts: CompileOptions) -> (Value, Option<Value>) {
    let r = compile(SRC, opts).expect("compiles");
    let js = serde_json::from_str(r.js.map.as_deref().expect("js map")).expect("js map is JSON");
    let css = r
        .css
        .and_then(|c| c.map)
        .map(|m| serde_json::from_str(&m).expect("css map is JSON"));
    (js, css)
}

fn base(generate: GenerateMode) -> CompileOptions {
    CompileOptions {
        filename: Some("Probe.svelte".to_string()),
        generate,
        css: CssMode::External,
        ..Default::default()
    }
}

#[test]
fn js_map_has_no_file_key() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let (js, _) = maps(base(generate));
        assert!(
            js.get("file").is_none(),
            "official's js.map carries no `file`, got {js:#}"
        );
    }
}

#[test]
fn css_map_keeps_its_file_key() {
    let (_, css) = maps(base(GenerateMode::Client));
    let css = css.expect("external css produces a map");
    assert_eq!(
        css.get("file").and_then(Value::as_str),
        Some("Probe.svelte")
    );
}

#[test]
fn output_filename_does_not_prefix_sources() {
    let mut opts = base(GenerateMode::Client);
    opts.output_filename = Some("out.js".to_string());
    let (js, _) = maps(opts);
    assert_eq!(
        js.get("sources"),
        Some(&serde_json::json!(["Probe.svelte"])),
        "a same-directory outputFilename leaves `sources` a bare basename"
    );
    assert!(js.get("file").is_none(), "still no `file`: {js:#}");
}

#[test]
fn output_filename_relative_path_matches_upstream() {
    let mut opts = base(GenerateMode::Client);
    opts.filename = Some("src/lib/Probe.svelte".to_string());
    opts.output_filename = Some("dist/out.js".to_string());
    let (js, _) = maps(opts);
    assert_eq!(
        js.get("sources"),
        Some(&serde_json::json!(["../src/lib/Probe.svelte"]))
    );
}

#[test]
fn css_output_filename_names_the_css_map_file() {
    let mut opts = base(GenerateMode::Client);
    opts.css_output_filename = Some("out.css".to_string());
    let (_, css) = maps(opts);
    let css = css.expect("external css produces a map");
    assert_eq!(css.get("file").and_then(Value::as_str), Some("out.css"));
    assert_eq!(
        css.get("sources"),
        Some(&serde_json::json!(["Probe.svelte"]))
    );
}
