//! Browser rendering for the kernel document printer.

use rsvelte_kernel::output::document::{
    GroupDecision, PrintOptions, TraceEvent, TraceMode, string_width,
};
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use wasm_bindgen::prelude::*;

mod layout_expression;

#[wasm_bindgen(js_name = renderDocument)]
#[must_use]
pub fn render_document(source: &str, width: u32, tabs: bool) -> String {
    let parsed = match layout_expression::parse(source) {
        Ok(parsed) => parsed,
        Err(error) => return error_json(&error),
    };
    let options = PrintOptions {
        width: width as usize,
        indent_spaces: if tabs { None } else { Some(2) },
        tab_width: 2,
    };
    let mut trace = Vec::new();
    let printed = parsed
        .docs
        .print_with_trace(parsed.root, &options, &mut trace);
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

fn error_json(error: &layout_expression::LayoutExpressionError) -> String {
    let mut json = StructuredDataWriter::new(false);
    json.begin_object()
        .key("ok")
        .write_boolean(false)
        .key("refused")
        .write_boolean(false)
        .key("message")
        .write_string(&error.message)
        .key("at")
        .write_number(error.at)
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
    let mut json = StructuredDataWriter::new(false);
    json.begin_object().key("ok").write_boolean(!refused);
    if let Some(output) = output {
        json.key("output").write_string(output);
    } else {
        json.key("refused")
            .write_boolean(true)
            .key("message")
            .write_string("a flat-only layout did not fit on its line");
    }
    json.key("trace").begin_array();
    for event in trace {
        trace_json(&mut json, *event);
    }
    json.end_array().key("origins").begin_array();
    for &(document, at) in origins {
        json.begin_array()
            .write_number(document)
            .write_number(at)
            .end_array();
    }
    json.end_array().end_object();
    json.finish()
}

fn trace_json(json: &mut StructuredDataWriter, event: TraceEvent) {
    json.begin_object();
    match event {
        TraceEvent::Group {
            document,
            position,
            remaining,
            mode,
            decision,
        } => {
            json.key("kind")
                .write_string("group")
                .key("layoutInstructionIdentifier")
                .write_number(document.index())
                .key("position")
                .write_number(position)
                .key("remainingWidth")
                .write_number(remaining)
                .key("mode")
                .write_string(match mode {
                    TraceMode::Flat => "flat",
                    TraceMode::Break => "break",
                })
                .key("why")
                .write_string(match decision {
                    GroupDecision::Fits => "fits",
                    GroupDecision::DoesNotFit => "does-not-fit",
                    GroupDecision::Broken => "broken",
                    GroupDecision::ParentFlat => "parent-flat",
                });
        }
        TraceEvent::Fill {
            document,
            position,
            content_fits,
            separator_fits,
        } => {
            json.key("kind")
                .write_string("fill")
                .key("layoutInstructionIdentifier")
                .write_number(document.index())
                .key("position")
                .write_number(position)
                .key("contentFits")
                .write_boolean(content_fits)
                .key("separatorFits");
            if let Some(fits) = separator_fits {
                json.write_boolean(fits);
            } else {
                json.null();
            }
        }
        TraceEvent::Refused { document, position } => {
            json.key("kind")
                .write_string("refused")
                .key("layoutInstructionIdentifier")
                .write_number(document.index())
                .key("position")
                .write_number(position);
        }
        TraceEvent::Remeasure { position } => {
            json.key("kind")
                .write_string("remeasure")
                .key("position")
                .write_number(position);
        }
    }
    json.end_object();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn renders_the_playground_layout_expression_with_the_kernel_printer() {
        let json = render_document(
            concat!(
                r#"group("f(", indent([softline, "#,
                r#"join([",", line], ["aaaa", "bbbb"])]), softline, ")")"#
            ),
            10,
            false,
        );
        assert!(
            json.contains(r#""output":"f(\n  aaaa,\n  bbbb\n)""#),
            "{json}"
        );
        assert!(json.contains(r#""why":"does-not-fit""#), "{json}");
    }

    #[test]
    fn reports_layout_expression_errors_in_utf16_offsets() {
        let json = render_document("[\"日\", @]", 80, false);
        assert!(json.contains(r#""at":6"#), "{json}");
    }
}
