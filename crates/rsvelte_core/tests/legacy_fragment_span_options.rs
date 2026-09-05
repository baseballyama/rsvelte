//! Upstream's `convert_to_legacy` splices the extracted `<svelte:options>` node
//! back into `fragment.nodes` and only then reads `first.start` / `last.end`
//! (`compiler/legacy.js:58-82`), so the html fragment's span covers the options
//! tag. Expected values are generated through this same entry point —
//! `svelte.compile(src, { filename: 'main.svelte', generate: 'client' }).ast.html`
//! on the pinned submodule — rather than inferred from `parse()`.

use rsvelte_core::{CompileOptions, GenerateMode, compile};
use serde_json::Value;

const OPT: &str = "<svelte:options runes={false} />";

fn html_of(source: &str) -> Value {
    let options = CompileOptions {
        filename: Some("main.svelte".to_string()),
        generate: GenerateMode::Client,
        dev: false,
        ..Default::default()
    };
    let result = compile(source, options).expect("compiles");
    let text = result.ast.get().expect("compile() must fill `ast`");
    let ast: Value = serde_json::from_str(text).expect("`ast` is JSON");
    ast.get("html").expect("legacy ast has `html`").clone()
}

/// `(name, source, start, end, children)`. A `None` child count is a cell whose
/// child set diverges for a reason this span rule cannot reach.
fn cells() -> Vec<(&'static str, String, u64, u64, Option<usize>)> {
    vec![
        (
            "options_first",
            format!("{OPT}\n<div>x</div>"),
            0,
            45,
            Some(3),
        ),
        ("options_only", OPT.to_string(), 0, 32, Some(1)),
        ("options_only_nl", format!("{OPT}\n"), 0, 32, Some(1)),
        (
            "options_middle",
            format!("<div>a</div>\n{OPT}\n<div>b</div>"),
            0,
            58,
            Some(5),
        ),
        // The trailing `Text` between `</div>` and the options tag is dropped
        // from `children` on the modern axis too, so it is not this rule's.
        ("options_last", format!("<div>a</div>\n{OPT}"), 0, 45, None),
        (
            "leading_ws_options",
            format!("\n\n  {OPT}\n<div>x</div>"),
            4,
            49,
            Some(4),
        ),
        (
            "options_after_script",
            format!("<script>\n\tlet a = 1;\n</script>\n{OPT}\n<div>{{a}}</div>"),
            31,
            78,
            Some(4),
        ),
        (
            "negctl_no_options",
            "<div>x</div>".to_string(),
            0,
            12,
            Some(1),
        ),
        (
            "negctl_ws_div",
            "\n\n  <div>x</div>\n".to_string(),
            4,
            16,
            Some(2),
        ),
        (
            "negctl_script_div",
            "<script>\n\tlet a = 1;\n</script>\n<div>{a}</div>".to_string(),
            31,
            45,
            Some(2),
        ),
    ]
}

#[test]
fn legacy_html_fragment_span_covers_svelte_options() {
    let mut failures = Vec::new();
    for (name, source, start, end, children) in cells() {
        let html = html_of(&source);
        let got_start = html.get("start").and_then(Value::as_u64);
        let got_end = html.get("end").and_then(Value::as_u64);
        if got_start != Some(start) || got_end != Some(end) {
            failures.push(format!(
                "{name}: span {got_start:?}..{got_end:?}, official {start}..{end}"
            ));
        }
        if let Some(expected) = children {
            let got = html.get("children").and_then(Value::as_array).map(Vec::len);
            if got != Some(expected) {
                failures.push(format!("{name}: {got:?} children, official {expected}"));
            }
        }
    }
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}

/// Half the cells carry no `<svelte:options>` and must be unaffected; without
/// them a rule that spans the whole source passes every positive cell.
#[test]
fn cells_cover_both_sides_of_the_options_axis() {
    let (with, without): (Vec<_>, Vec<_>) = cells().into_iter().partition(|c| c.1.contains(OPT));
    assert!(with.len() >= 5, "{} cells carry svelte:options", with.len());
    assert!(without.len() >= 3, "{} cells do not", without.len());
}
