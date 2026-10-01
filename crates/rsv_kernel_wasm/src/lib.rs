//! Browser bindings for the kernel's document IR and printer.

use rsv_kernel::doc::{GroupDecision, PrintOptions, TraceEvent, TraceMode, string_width};
use rsv_kernel::json::JsonWriter;
use wasm_bindgen::prelude::*;

mod dsl;

#[wasm_bindgen(js_name = renderDoc)]
#[must_use]
pub fn render_doc(source: &str, width: u32, tabs: bool) -> String {
    let parsed = match dsl::parse(source) {
        Ok(parsed) => parsed,
        Err(error) => return error_json(&error),
    };
    let opts = PrintOptions {
        width: width as usize,
        indent_spaces: if tabs { None } else { Some(2) },
        tab_width: 2,
    };
    let mut trace = Vec::new();
    let printed = parsed.docs.print_with_trace(parsed.root, &opts, &mut trace);
    result_json(
        printed.as_ref().ok().map(String::as_str),
        printed.is_err(),
        &trace,
        &parsed.origins,
    )
}

#[wasm_bindgen(js_name = stringWidth)]
#[must_use]
pub fn string_width_wasm(text: &str) -> usize {
    string_width(text)
}

fn error_json(error: &dsl::DslError) -> String {
    let mut json = JsonWriter::new(false);
    json.begin_object()
        .key("ok")
        .bool(false)
        .key("refused")
        .bool(false)
        .key("message")
        .str(&error.message)
        .key("at")
        .num(error.at)
        .key("trace")
        .begin_array()
        .end_array()
        .key("origins")
        .begin_array()
        .end_array()
        .end_object();
    json.finish()
}

fn result_json(
    output: Option<&str>,
    refused: bool,
    trace: &[TraceEvent],
    origins: &[(u32, usize)],
) -> String {
    let mut json = JsonWriter::new(false);
    json.begin_object().key("ok").bool(!refused);
    if let Some(output) = output {
        json.key("out").str(output);
    } else {
        json.key("refused")
            .bool(true)
            .key("message")
            .str("a flat-only layout did not fit on its line");
    }
    json.key("trace").begin_array();
    for event in trace {
        trace_json(&mut json, *event);
    }
    json.end_array().key("origins").begin_array();
    for &(doc, at) in origins {
        json.begin_array().num(doc).num(at).end_array();
    }
    json.end_array().end_object();
    json.finish()
}

fn trace_json(json: &mut JsonWriter, event: TraceEvent) {
    json.begin_object();
    match event {
        TraceEvent::Group {
            doc,
            pos,
            remaining,
            mode,
            decision,
        } => {
            json.key("kind")
                .str("group")
                .key("doc")
                .num(doc.index())
                .key("pos")
                .num(pos)
                .key("rem")
                .num(remaining)
                .key("mode")
                .str(match mode {
                    TraceMode::Flat => "flat",
                    TraceMode::Break => "break",
                })
                .key("why")
                .str(match decision {
                    GroupDecision::Fits => "fits",
                    GroupDecision::DoesNotFit => "does-not-fit",
                    GroupDecision::Broken => "broken",
                    GroupDecision::ParentFlat => "parent-flat",
                });
        }
        TraceEvent::Fill {
            doc,
            pos,
            content_fits,
            separator_fits,
        } => {
            json.key("kind")
                .str("fill")
                .key("doc")
                .num(doc.index())
                .key("pos")
                .num(pos)
                .key("contentFits")
                .bool(content_fits)
                .key("separatorFits");
            if let Some(fits) = separator_fits {
                json.bool(fits);
            } else {
                json.null();
            }
        }
        TraceEvent::Refused { doc, pos } => {
            json.key("kind")
                .str("refused")
                .key("doc")
                .num(doc.index())
                .key("pos")
                .num(pos);
        }
        TraceEvent::Remeasure { pos } => {
            json.key("kind").str("remeasure").key("pos").num(pos);
        }
    }
    json.end_object();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn renders_the_playground_dsl_with_the_kernel_printer() {
        let json = render_doc(
            concat!(
                r#"group("f(", indent([softline, "#,
                r#"join([",", line], ["aaaa", "bbbb"])]), softline, ")")"#
            ),
            10,
            false,
        );
        assert!(json.contains(r#""out":"f(\n  aaaa,\n  bbbb\n)""#), "{json}");
        assert!(json.contains(r#""why":"does-not-fit""#), "{json}");
    }

    #[test]
    fn reports_dsl_errors_in_utf16_offsets() {
        let json = render_doc("[\"日\", @]", 80, false);
        assert!(json.contains(r#""at":6"#), "{json}");
    }
}
