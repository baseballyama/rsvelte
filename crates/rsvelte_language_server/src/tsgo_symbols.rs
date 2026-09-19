//! The anonymous functions in tsgo's outline of a component, treated the way
//! `TypeScriptPlugin.getDocumentSymbols` (`TypeScriptPlugin.ts:329-351`) treats
//! them: a `<function>` the user wrote is named after its source text, and one
//! the projection generated is dropped.

use std::ops::Range;

use lsp_types::Position;
use rsvelte_core::Allocator;
use serde_json::Value;

use crate::context::{EmbeddedRegions, body_of};
use crate::nodes::parse_root;
use crate::text::LineIndex;

const ANONYMOUS_FUNCTION: &str = "<function>";
const NAME_LIMIT: usize = 50;

/// Rewrite a mapped `textDocument/documentSymbol` result for the component
/// whose source is `text`. Both response shapes are accepted; a dropped
/// `DocumentSymbol`'s children take its place, as upstream keeps every other
/// entry of its flat list.
pub fn rewrite_anonymous_function_symbols(result: &mut Value, text: &str) {
    let Some(items) = result.as_array_mut() else {
        return;
    };
    if !items.iter().any(has_anonymous_function) {
        return;
    }
    let document = SymbolDocument::new(text);
    rewrite(items, &document);
}

fn has_anonymous_function(item: &Value) -> bool {
    item.get("name").and_then(Value::as_str) == Some(ANONYMOUS_FUNCTION)
        || item
            .get("children")
            .and_then(Value::as_array)
            .is_some_and(|children| children.iter().any(has_anonymous_function))
}

fn rewrite(items: &mut Vec<Value>, document: &SymbolDocument<'_>) {
    let mut kept = Vec::with_capacity(items.len());
    for mut item in std::mem::take(items) {
        if let Some(children) = item.get_mut("children").and_then(Value::as_array_mut) {
            rewrite(children, document);
        }
        if item.get("name").and_then(Value::as_str) != Some(ANONYMOUS_FUNCTION) {
            kept.push(item);
            continue;
        }
        let range = item
            .pointer("/location/range")
            .or_else(|| item.get("range"))
            .and_then(|range| serde_json::from_value::<lsp_types::Range>(range.clone()).ok());
        let Some(range) = range else {
            kept.push(item);
            continue;
        };
        if let Some(name) = document.function_name(range) {
            item["name"] = Value::String(name);
            kept.push(item);
        } else if let Some(Value::Array(children)) = item.get_mut("children").map(Value::take) {
            kept.extend(children);
        }
    }
    *items = kept;
}

struct SymbolDocument<'a> {
    text: &'a str,
    index: LineIndex,
    scripts: Vec<Range<usize>>,
    /// `document.scriptInfo?.end`: the instance script alone, so a component
    /// that only has `<script module>` compares against `undefined`.
    instance_end: Option<usize>,
    /// svelte2tsx's `htmlxAst`: the legacy template AST, UTF-16 offsets.
    template: Option<Value>,
}

impl<'a> SymbolDocument<'a> {
    fn new(text: &'a str) -> Self {
        let allocator = Allocator::default();
        let (scripts, instance_end, template) = match parse_root(text, &allocator) {
            Some(root) => {
                let instance = root
                    .instance
                    .as_deref()
                    .and_then(|script| body_of(text, script.start as usize, script.end as usize));
                let module = root
                    .module
                    .as_deref()
                    .and_then(|script| body_of(text, script.start as usize, script.end as usize));
                let instance_end = instance.as_ref().map(|body| body.end);
                let scripts = instance.into_iter().chain(module).collect();
                let legacy = rsvelte_core::convert_to_legacy(text, root);
                (scripts, instance_end, legacy.get("html").cloned())
            }
            None => {
                let instance_end = crate::context::instance_script_body(text).map(|body| body.end);
                (
                    EmbeddedRegions::new(text).scripts().to_vec(),
                    instance_end,
                    None,
                )
            }
        };
        Self {
            text,
            index: LineIndex::new(text),
            scripts,
            instance_end,
            template,
        }
    }

    /// The name upstream gives a `<function>` symbol, or `None` when it drops
    /// the symbol.
    fn function_name(&self, range: lsp_types::Range) -> Option<String> {
        // `TypeScriptPlugin.ts:297-303` drops these before the function branch.
        if range.start == range.end {
            return None;
        }
        let start = self.index.offset(self.text, range.start);
        // svelte2tsx replaces the instance script's end tag with the generated
        // template callback, so its start maps to `scriptInfo.end`, which
        // `isInScript` also counts as inside the script.
        let starts_at_script_end = self.instance_end == Some(start);
        if starts_at_script_end
            || (!self.is_in_script(range.start)
                && !self.is_in_user_written_template_function(start))
        {
            return None;
        }
        let end = self.index.offset(self.text, range.end);
        let (from, to) = (start.min(end), start.max(end));
        let name = self.text[from..to].trim_start_matches(is_js_whitespace);
        Some(truncate_utf16(name))
    }

    /// `isInScript`: `isInRange` is inclusive at both ends.
    fn is_in_script(&self, position: Position) -> bool {
        let offset = self.index.offset(self.text, position);
        self.scripts
            .iter()
            .any(|body| (body.start..=body.end).contains(&offset))
    }

    /// `isInUserWrittenTemplateFunction` (`TypeScriptPlugin.ts:396-417`).
    fn is_in_user_written_template_function(&self, offset: usize) -> bool {
        let Some(template) = &self.template else {
            return false;
        };
        let offset = self.text[..offset].encode_utf16().count() as f64;
        template
            .as_object()
            .is_some_and(|root| root.values().any(|child| visit_children(child, offset)))
    }
}

/// `estree-walker`'s descent: into every property that is a node or an array of
/// nodes.
fn visit_children(value: &Value, offset: f64) -> bool {
    match value {
        Value::Array(items) => items.iter().any(|item| visit(item, offset)),
        value => visit(value, offset),
    }
}

fn visit(node: &Value, offset: f64) -> bool {
    let Some(object) = node.as_object() else {
        return false;
    };
    let Some(kind) = object.get("type").and_then(Value::as_str) else {
        return false;
    };
    // JavaScript's `offset < node.start`: `null` compares as 0, a missing field
    // as NaN.
    let bound = |key| match object.get(key) {
        Some(Value::Null) => 0.0,
        Some(value) => value.as_f64().unwrap_or(f64::NAN),
        None => f64::NAN,
    };
    if offset < bound("start") || offset > bound("end") {
        return false;
    }
    if matches!(kind, "ArrowFunctionExpression" | "FunctionExpression") {
        return true;
    }
    object.values().any(|child| visit_children(child, offset))
}

/// `String.prototype.trimLeft`'s whitespace: Unicode `White_Space` plus the BOM.
fn is_js_whitespace(character: char) -> bool {
    character.is_whitespace() || character == '\u{feff}'
}

/// `name.substring(0, 50) + '...'` when `name.length > 50`, in UTF-16 units.
fn truncate_utf16(name: &str) -> String {
    if name.encode_utf16().count() <= NAME_LIMIT {
        return name.to_string();
    }
    let mut units = 0;
    let mut out = String::new();
    for character in name.chars() {
        units += character.len_utf16();
        if units > NAME_LIMIT {
            break;
        }
        out.push(character);
    }
    out.push_str("...");
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn position_of(text: &str, needle: &str) -> Position {
        let index = LineIndex::new(text);
        index.position(text, text.find(needle).expect("needle"))
    }

    fn symbol(name: &str, text: &str, from: &str, to: Option<&str>) -> Value {
        let start = position_of(text, from);
        let end = to.map_or(start, |to| {
            let index = LineIndex::new(text);
            index.position(text, text.find(to).expect("needle") + to.len())
        });
        json!({
            "name": name,
            "kind": 12,
            "location": {
                "uri": "file:///App.svelte",
                "range": { "start": start, "end": end },
            },
        })
    }

    fn names(result: &Value) -> Vec<String> {
        let mut names = result
            .as_array()
            .unwrap()
            .iter()
            .map(|item| item["name"].as_str().unwrap().to_string())
            .collect::<Vec<_>>();
        names.sort();
        names
    }

    #[test]
    fn a_script_function_is_named_after_its_text_and_the_generated_callback_is_dropped() {
        for final_newline in ["", "\n"] {
            let text = format!(
                "<script>\n  import Test1 from \"./Test1.svelte\";\n  (function () {{ return true; }})();\n</script>\n\n<Test1></Test1>{final_newline}"
            );
            let script_end = text.find("</script>").unwrap();
            let index = LineIndex::new(&text);
            let callback_start = index.position(&text, script_end);
            let document_end = index.position(&text, text.len());
            let mut result = json!([
                { "name": "Test1", "kind": 13, "location": { "uri": "file:///App.svelte", "range": {
                    "start": position_of(&text, "Test1 from"), "end": position_of(&text, " from") } } },
                symbol("<function>", &text, "function ()", Some("return true; }")),
                { "name": "<function>", "kind": 12, "location": { "uri": "file:///App.svelte", "range": {
                    "start": callback_start, "end": document_end } } },
            ]);
            rewrite_anonymous_function_symbols(&mut result, &text);
            assert_eq!(
                names(&result),
                ["Test1", "function () { return true; }"],
                "{final_newline:?}"
            );
        }
    }

    #[test]
    fn generated_snippet_functions_go_and_template_functions_the_user_wrote_stay() {
        let text = concat!(
            "<script lang=\"ts\">\n",
            "    const value = true;\n",
            "</script>\n",
            "\n",
            "{#each items as item}\n",
            "    {@const getter = () => item}\n",
            "    <button on:click={function () { value; }}>x</button>\n",
            "{/each}\n",
            "\n",
            "<Component>\n",
            "    {#snippet children({ data })}\n",
            "        <Child {data} />\n",
            "    {/snippet}\n",
            "</Component>\n",
        );
        let mut result = json!([
            symbol("<function>", text, "() => item", Some("() => item")),
            symbol(
                "<function>",
                text,
                "function () { value; }",
                Some("function () { value; }")
            ),
            symbol("<function>", text, "{#snippet", Some("{/snippet}")),
            symbol("<function>", text, "<Child", Some("/>")),
        ]);
        rewrite_anonymous_function_symbols(&mut result, text);
        assert_eq!(names(&result), ["() => item", "function () { value; }"]);
    }

    /// `document.scriptInfo?.end` is `undefined` without an instance script, so
    /// the module script's own end is not the generated callback's boundary.
    #[test]
    fn a_module_script_end_is_not_the_instance_script_end() {
        let text = "<script module>\n  export const a = 1;\n</script>\n\n<p>{a}</p>\n";
        let script_end = text.find("</script>").expect("needle");
        let index = LineIndex::new(text);
        let mut result = json!([{
            "name": "<function>",
            "kind": 12,
            "location": { "uri": "file:///App.svelte", "range": {
                "start": index.position(text, script_end),
                "end": index.position(text, script_end + "</script>".len()),
            } },
        }]);
        rewrite_anonymous_function_symbols(&mut result, text);
        assert_eq!(names(&result), ["</script>"]);
    }

    #[test]
    fn a_dropped_document_symbol_leaves_its_children_in_its_place() {
        let text = "<script>let a;</script>\n<Component>\n  {#snippet children({ data })}<p>{data}</p>{/snippet}\n</Component>\n";
        let index = LineIndex::new(text);
        let range = |from: &str, to: &str| {
            json!({
                "start": index.position(text, text.find(from).unwrap()),
                "end": index.position(text, text.find(to).unwrap() + to.len()),
            })
        };
        let mut result = json!([{
            "name": "children",
            "kind": 7,
            "range": range("{#snippet", "{/snippet}"),
            "selectionRange": range("{#snippet", "{/snippet}"),
            "children": [{
                "name": "<function>",
                "kind": 12,
                "range": range("{#snippet", "{/snippet}"),
                "selectionRange": range("{#snippet", "{/snippet}"),
                "children": [{
                    "name": "data",
                    "kind": 13,
                    "range": range("data", "data"),
                    "selectionRange": range("data", "data"),
                    "children": [],
                }],
            }],
        }]);
        rewrite_anonymous_function_symbols(&mut result, text);
        assert_eq!(result[0]["children"][0]["name"], "data");
        assert_eq!(result[0]["children"].as_array().unwrap().len(), 1);
    }

    #[test]
    fn a_long_function_name_is_cut_at_fifty_utf16_units() {
        let body = "x".repeat(60);
        let text = format!("<script>\n  (function () {{ {body} }})();\n</script>\n");
        let mut result = json!([symbol("<function>", &text, "function ()", Some(" })"))]);
        rewrite_anonymous_function_symbols(&mut result, &text);
        let name = result[0]["name"].as_str().unwrap();
        assert_eq!(
            name,
            format!("{}...", &format!("function () {{ {body}")[..50])
        );
    }

    #[test]
    fn a_result_without_anonymous_functions_is_left_alone() {
        let text = "<p>{";
        let mut result = json!([{ "name": "a", "kind": 13 }]);
        let before = result.clone();
        rewrite_anonymous_function_symbols(&mut result, text);
        assert_eq!(result, before);
    }
}
