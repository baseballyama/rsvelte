//! Svelte-specific normalization for tsgo completion items.

use std::collections::HashMap;
use std::path::Path;

use serde_json::Value;

const COMPONENT_SUFFIX: &str = "__SvelteComponent_";
const RUNES: [&str; 4] = ["$props", "$state", "$derived", "$effect"];

/// Source context needed to normalize an initial or resolved completion.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct CompletionRewriteContext {
    kit_route: bool,
    pub prefer_components: bool,
}

impl CompletionRewriteContext {
    #[must_use]
    pub fn new(file_path: Option<&Path>, prefer_components: bool) -> Self {
        Self {
            kit_route: file_path.is_some_and(is_kit_route_file),
            prefer_components,
        }
    }

    #[must_use]
    pub const fn is_kit_route(self) -> bool {
        self.kit_route
    }
}

/// The original-source site at which tsgo completions were requested.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum CompletionSite {
    Script,
    TemplateExpression,
    RawTemplateText,
    Style,
    BlockMarker,
    ElementStartTag,
    ComponentStartTag { at_whitespace: bool },
}

/// What the server should do with a tsgo completion response.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum CompletionAction {
    Forward,
    Suppress,
    /// Discard global tsgo results and use Svelte props/directives instead.
    NarrowToSvelte,
}

/// Apply the false-global-completion guards from upstream's completion
/// provider without coupling them to a particular Svelte AST representation.
#[must_use]
pub const fn completion_action(
    site: CompletionSite,
    item_count: usize,
    first_is_member_variable: bool,
) -> CompletionAction {
    match site {
        CompletionSite::RawTemplateText | CompletionSite::Style | CompletionSite::BlockMarker => {
            CompletionAction::Suppress
        }
        CompletionSite::ElementStartTag if item_count > 500 && !first_is_member_variable => {
            CompletionAction::Suppress
        }
        CompletionSite::ComponentStartTag {
            at_whitespace: true,
        } if item_count > 500 => CompletionAction::NarrowToSvelte,
        CompletionSite::Script
        | CompletionSite::TemplateExpression
        | CompletionSite::ElementStartTag
        | CompletionSite::ComponentStartTag { .. } => CompletionAction::Forward,
    }
}

/// Normalize one completion response while preserving tsgo's opaque `data`.
///
/// tsgo resolves a completion by the generated `data.name`, so changing data
/// together with the visible label makes `completionItem/resolve` silently
/// stop returning auto-import edits.
pub fn rewrite_completion_response(value: &mut Value) {
    rewrite_completion_response_for_context(
        value,
        CompletionRewriteContext {
            kit_route: false,
            prefer_components: true,
        },
    );
}

/// Normalize an initial response for its source context.
pub fn rewrite_completion_response_for_context(
    value: &mut Value,
    context: CompletionRewriteContext,
) {
    let Some(items) = completion_items_mut(value) else {
        return;
    };
    if context.kit_route {
        duplicate_kit_types_items(items);
    }
    for item in items {
        rewrite_completion_item_with_preference(item, context.prefer_components);
    }
}

/// Normalize one initial or resolved completion item.
pub fn rewrite_completion_item(item: &mut Value) {
    rewrite_completion_item_for_context(
        item,
        CompletionRewriteContext {
            kit_route: false,
            prefer_components: true,
        },
    );
}

/// Normalize one resolved item and any auto-import edit it contains.
pub fn rewrite_completion_item_for_context(item: &mut Value, context: CompletionRewriteContext) {
    rewrite_completion_item_with_preference(item, context.prefer_components);
    if context.kit_route {
        rewrite_kit_types_import_edits(item);
    }
}

/// Remove virtual component names and shadow extensions from editor-visible fields.
pub fn rewrite_visible_tsgo_response(value: &mut Value) {
    rewrite_visible_value(value);
}

fn rewrite_completion_item_with_preference(item: &mut Value, prefer_components: bool) {
    let generated_component = item
        .get("label")
        .and_then(Value::as_str)
        .is_some_and(|label| label.ends_with(COMPONENT_SUFFIX));
    let rune = item
        .get("label")
        .and_then(Value::as_str)
        .is_some_and(|label| RUNES.contains(&label));
    rewrite_visible_value(item);
    if prefer_components && (generated_component || rune) {
        let Some(object) = item.as_object_mut() else {
            return;
        };
        object.insert("sortText".to_string(), Value::String("-1".to_string()));
        object.insert("preselect".to_string(), Value::Bool(true));
    }
    if generated_component {
        let Some(object) = item.as_object_mut() else {
            return;
        };
        object.insert(
            "commitCharacters".to_string(),
            Value::Array(vec![Value::String(">".to_string())]),
        );
    }
}

fn completion_items_mut(value: &mut Value) -> Option<&mut Vec<Value>> {
    match value {
        Value::Array(items) => Some(items),
        Value::Object(object) => object.get_mut("items")?.as_array_mut(),
        _ => None,
    }
}

fn duplicate_kit_types_items(items: &mut Vec<Value>) {
    let mut by_label = HashMap::new();
    for (index, item) in items.iter().enumerate() {
        let Some(label) = item.get("label").and_then(Value::as_str) else {
            continue;
        };
        let Some(source) = item.get("data").and_then(find_kit_types_source) else {
            continue;
        };
        if is_generated_kit_types_source(source) && !visible_uses_local_kit_types(item) {
            by_label.insert(label.to_string(), index);
        }
    }

    let mut indices = by_label.into_values().collect::<Vec<_>>();
    indices.sort_unstable();
    let additions = indices
        .into_iter()
        .map(|index| {
            let source = items[index]
                .get("data")
                .and_then(find_kit_types_source)
                .expect("index selected from a kit source");
            let local = local_kit_types_specifier(source);
            let mut duplicate = items[index].clone();
            rewrite_kit_types_visible_fields(&mut duplicate, source, &local);
            if let Some(object) = duplicate.as_object_mut()
                && let Some(sort_text) = object.get("sortText").and_then(Value::as_str)
                && let Ok(sort_number) = sort_text.parse::<i64>()
            {
                object.insert(
                    "sortText".to_string(),
                    Value::String((sort_number - 1).to_string()),
                );
            }
            duplicate
        })
        .collect::<Vec<_>>();
    items.extend(additions);
}

fn find_kit_types_source(value: &Value) -> Option<&str> {
    match value {
        Value::String(source) if is_generated_kit_types_source(source) => Some(source),
        Value::Array(values) => values.iter().find_map(find_kit_types_source),
        Value::Object(object) => object.values().find_map(find_kit_types_source),
        _ => None,
    }
}

fn is_generated_kit_types_source(source: &str) -> bool {
    let normalized = source.replace('\\', "/");
    normalized.contains(".svelte-kit/types/") && is_kit_types_path(&normalized)
}

fn is_kit_types_path(path: &str) -> bool {
    path.ends_with("/$types") || path.ends_with("/$types.js") || path.ends_with("/$types.d.ts")
}

fn local_kit_types_specifier(source: &str) -> String {
    if source.replace('\\', "/").ends_with("/$types.js") {
        "./$types.js".to_string()
    } else {
        "./$types".to_string()
    }
}

fn visible_uses_local_kit_types(item: &Value) -> bool {
    match item {
        Value::String(text) => text.contains("./$types"),
        Value::Array(values) => values.iter().any(visible_uses_local_kit_types),
        Value::Object(object) => object
            .iter()
            .filter(|(key, _)| key.as_str() != "data")
            .any(|(_, value)| visible_uses_local_kit_types(value)),
        _ => false,
    }
}

fn rewrite_kit_types_visible_fields(value: &mut Value, source: &str, local: &str) {
    let Value::Object(object) = value else {
        return;
    };
    for (key, child) in object {
        if key == "data" {
            continue;
        }
        match child {
            Value::String(text) => {
                if text.contains(source) {
                    *text = text.replace(source, local);
                } else {
                    rewrite_generated_kit_path(text, local);
                }
            }
            Value::Object(_) => rewrite_kit_types_visible_fields(child, source, local),
            Value::Array(values) => {
                for value in values {
                    match value {
                        Value::String(text) => {
                            if text.contains(source) {
                                *text = text.replace(source, local);
                            } else {
                                rewrite_generated_kit_path(text, local);
                            }
                        }
                        Value::Object(_) => {
                            rewrite_kit_types_visible_fields(value, source, local);
                        }
                        _ => {}
                    }
                }
            }
            _ => {}
        }
    }
}

fn rewrite_generated_kit_path(text: &mut String, local: &str) {
    let Some(marker) = text.find(".svelte-kit/types/") else {
        return;
    };
    let start = text[..marker]
        .rfind(|character: char| character.is_whitespace() || ['\'', '"', '`'].contains(&character))
        .map_or(0, |index| index + 1);
    let Some(types) = text[marker..].find("/$types") else {
        return;
    };
    let mut end = marker + types + "/$types".len();
    for suffix in [".d.ts", ".js"] {
        if text[end..].starts_with(suffix) {
            end += suffix.len();
            break;
        }
    }
    text.replace_range(start..end, local);
}

/// Rewrite resolved tsgo edits to the SvelteKit-local `./$types` spelling.
pub fn rewrite_kit_types_import_edits(item: &mut Value) {
    let Value::Object(object) = item else {
        return;
    };
    for key in ["textEdit", "additionalTextEdits"] {
        if let Some(edits) = object.get_mut(key) {
            rewrite_edit_new_text(edits);
        }
    }
}

fn rewrite_edit_new_text(value: &mut Value) {
    match value {
        Value::Array(values) => values.iter_mut().for_each(rewrite_edit_new_text),
        Value::Object(object) => {
            if let Some(text) = object
                .get("newText")
                .and_then(Value::as_str)
                .map(str::to_string)
            {
                object.insert(
                    "newText".to_string(),
                    Value::String(rewrite_quoted_kit_paths(&text)),
                );
            }
            object.values_mut().for_each(rewrite_edit_new_text);
        }
        _ => {}
    }
}

fn rewrite_quoted_kit_paths(text: &str) -> String {
    let mut output = text.to_string();
    let mut cursor = 0;
    while let Some(relative_start) = output[cursor..].find(['\'', '"', '`']) {
        let quote_start = cursor + relative_start;
        let quote = output.as_bytes()[quote_start] as char;
        let path_start = quote_start + 1;
        let Some(relative_end) = output[path_start..].find(quote) else {
            break;
        };
        let path_end = path_start + relative_end;
        let path = &output[path_start..path_end];
        if is_generated_kit_types_source(path) {
            let local = local_kit_types_specifier(path);
            output.replace_range(path_start..path_end, &local);
            cursor = path_start + local.len() + 1;
        } else {
            cursor = path_end + 1;
        }
    }
    output
}

fn is_kit_route_file(path: &Path) -> bool {
    path.file_name()
        .and_then(|name| name.to_str())
        .is_some_and(|name| name.starts_with('+'))
}

fn rewrite_visible_value(value: &mut Value) {
    match value {
        Value::Object(object) => {
            for (key, child) in object {
                if key != "data" {
                    rewrite_visible_value(child);
                }
            }
        }
        Value::Array(items) => items.iter_mut().for_each(rewrite_visible_value),
        Value::String(text) => rewrite_visible_text(text),
        _ => {}
    }
}

fn rewrite_visible_text(text: &mut String) {
    if text.contains(COMPONENT_SUFFIX) {
        let trailing_newline = text.ends_with('\n');
        let filtered = text
            .lines()
            .filter(|line| {
                !(line.contains("(alias) type ")
                    && line.contains(COMPONENT_SUFFIX)
                    && line.trim_end().ends_with("= any"))
            })
            .collect::<Vec<_>>()
            .join("\n");
        *text = filtered;
        if trailing_newline {
            text.push('\n');
        }
    }
    while let Some(suffix) = text.find(COMPONENT_SUFFIX) {
        text.replace_range(suffix..suffix + COMPONENT_SUFFIX.len(), "");
    }
    if text.contains(".svelte.tsx") {
        *text = text.replace(".svelte.tsx", ".svelte");
    }
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use serde_json::json;

    use super::*;

    #[test]
    fn rewrites_visible_component_fields_but_not_resolve_data() {
        let mut response = json!({
            "isIncomplete": false,
            "items": [{
                "label": "Button__SvelteComponent_",
                "filterText": "Button__SvelteComponent_",
                "insertText": "Button__SvelteComponent_",
                "textEdit": {
                    "range": {
                        "start": { "line": 0, "character": 0 },
                        "end": { "line": 0, "character": 1 }
                    },
                    "newText": "Button__SvelteComponent_"
                },
                "data": {
                    "name": "Button__SvelteComponent_",
                    "source": "./Button.svelte.tsx"
                }
            }]
        });

        rewrite_completion_response(&mut response);
        let item = &response["items"][0];
        assert_eq!(item["label"], "Button");
        assert_eq!(item["filterText"], "Button");
        assert_eq!(item["insertText"], "Button");
        assert_eq!(item["textEdit"]["newText"], "Button");
        assert_eq!(item["sortText"], "-1");
        assert_eq!(item["preselect"], true);
        assert_eq!(item["commitCharacters"], json!([">"]));
        assert_eq!(item["data"]["name"], "Button__SvelteComponent_");
        assert_eq!(item["data"]["source"], "./Button.svelte.tsx");
    }

    #[test]
    fn visible_hover_hides_the_generated_component_alias() {
        let mut hover = json!({
            "contents": {
                "value": "(alias) const Child__SvelteComponent_: Component\n(alias) type Child__SvelteComponent_ = any\n"
            },
            "data": { "name": "Child__SvelteComponent_" }
        });
        rewrite_visible_tsgo_response(&mut hover);
        assert_eq!(
            hover["contents"]["value"],
            "(alias) const Child: Component\n"
        );
        assert_eq!(hover["data"]["name"], "Child__SvelteComponent_");
    }

    #[test]
    fn resolved_import_edits_hide_the_shadow_suffix_and_path() {
        let mut item = json!({
            "label": "Button__SvelteComponent_",
            "detail": "Auto import from ./Button.svelte.tsx",
            "additionalTextEdits": [{
                "range": {
                    "start": { "line": 0, "character": 0 },
                    "end": { "line": 0, "character": 0 }
                },
                "newText": "import Button__SvelteComponent_ from './Button.svelte.tsx';\n"
            }],
            "data": { "name": "Button__SvelteComponent_" }
        });

        rewrite_completion_item(&mut item);
        assert_eq!(item["label"], "Button");
        assert_eq!(item["detail"], "Auto import from ./Button.svelte");
        assert_eq!(
            item["additionalTextEdits"][0]["newText"],
            "import Button from './Button.svelte';\n"
        );
        assert_eq!(item["data"]["name"], "Button__SvelteComponent_");
    }

    #[test]
    fn ordinary_completion_keeps_tsgo_ranking() {
        let mut item = json!({
            "label": "ordinary",
            "sortText": "11",
            "data": { "name": "ordinary" }
        });
        rewrite_completion_item(&mut item);
        assert_eq!(item["sortText"], "11");
        assert!(item.get("preselect").is_none());
    }

    #[test]
    fn component_and_runes_rank_first_only_where_upstream_prefers_them() {
        let mut component = json!({
            "label": "Button__SvelteComponent_",
            "sortText": "11",
            "data": { "name": "Button__SvelteComponent_" }
        });
        rewrite_completion_item_for_context(
            &mut component,
            CompletionRewriteContext::new(None, false),
        );
        assert_eq!(component["label"], "Button");
        assert_eq!(component["sortText"], "11");
        assert!(component.get("preselect").is_none());
        assert_eq!(component["commitCharacters"], json!([">"]));

        let mut rune = json!({ "label": "$state", "sortText": "11" });
        rewrite_completion_item_for_context(&mut rune, CompletionRewriteContext::new(None, true));
        assert_eq!(rune["sortText"], "-1");
        assert_eq!(rune["preselect"], true);
        assert!(rune.get("commitCharacters").is_none());
    }

    #[test]
    fn plus_route_duplicates_kit_types_without_touching_opaque_data() {
        let opaque = json!({
            "entryId": {
                "name": "PageData",
                "source": "/work/.svelte-kit/types/src/routes/blog/$types.js",
                "token": [1, { "future": true }]
            }
        });
        let mut response = json!({
            "isIncomplete": false,
            "items": [{
                "label": "PageData",
                "sortText": "11",
                "labelDetails": {
                    "description": "/work/.svelte-kit/types/src/routes/blog/$types.js"
                },
                "data": opaque
            }]
        });
        rewrite_completion_response_for_context(
            &mut response,
            CompletionRewriteContext::new(
                Some(Path::new("/work/src/routes/blog/+page.svelte")),
                false,
            ),
        );

        let items = response["items"].as_array().unwrap();
        assert_eq!(items.len(), 2);
        assert_eq!(items[0]["sortText"], "11");
        assert_eq!(items[1]["sortText"], "10");
        assert_eq!(items[1]["labelDetails"]["description"], "./$types.js");
        assert_eq!(items[1]["data"], items[0]["data"]);
        assert_eq!(items[1]["data"], opaque);
    }

    #[test]
    fn only_plus_routes_get_kit_types_duplicates() {
        let mut ordinary = json!([{
            "label": "PageData",
            "data": { "source": "/work/.svelte-kit/types/src/routes/$types.d.ts" }
        }]);
        rewrite_completion_response_for_context(
            &mut ordinary,
            CompletionRewriteContext::new(Some(Path::new("/work/src/routes/Page.svelte")), true),
        );
        assert_eq!(ordinary.as_array().unwrap().len(), 1);

        let mut route = ordinary.clone();
        rewrite_completion_response_for_context(
            &mut route,
            CompletionRewriteContext::new(
                Some(Path::new("/work/src/routes/+layout.svelte.tsx")),
                true,
            ),
        );
        assert_eq!(route.as_array().unwrap().len(), 2);
        assert_eq!(route[1]["labelDetails"], Value::Null);
        assert_eq!(route[1]["data"], route[0]["data"]);
    }

    #[test]
    fn kit_types_keeps_one_duplicate_per_label_and_nonnumeric_sort_text() {
        let mut response = json!({
            "items": [
                {
                    "label": "PageData",
                    "sortText": "auto",
                    "detail": "first .svelte-kit/types/src/routes/$types.d.ts",
                    "data": { "source": ".svelte-kit/types/src/routes/$types.d.ts", "id": 1 }
                },
                {
                    "label": "PageData",
                    "sortText": "auto",
                    "detail": "second .svelte-kit/types/src/routes/$types.d.ts",
                    "data": { "source": ".svelte-kit/types/src/routes/$types.d.ts", "id": 2 }
                }
            ]
        });
        rewrite_completion_response_for_context(
            &mut response,
            CompletionRewriteContext::new(Some(Path::new("+page.ts")), false),
        );
        let items = response["items"].as_array().unwrap();
        assert_eq!(items.len(), 3);
        assert_eq!(items[2]["sortText"], "auto");
        assert_eq!(items[2]["detail"], "second ./$types");
        assert_eq!(items[2]["data"]["id"], 2);
    }

    #[test]
    fn resolved_kit_imports_use_local_types_and_preserve_js_suffix() {
        let data = json!({
            "source": "/work/.svelte-kit/types/src/routes/blog/$types.js",
            "token": "opaque"
        });
        let mut item = json!({
            "label": "PageData",
            "textEdit": {
                "newText": "import type { PageData } from '/work/.svelte-kit/types/src/routes/blog/$types.js';"
            },
            "additionalTextEdits": [{
                "newText": "export type { LayoutData } from \"/work/.svelte-kit/types/src/routes/blog/$types.d.ts\";"
            }],
            "data": data
        });
        rewrite_completion_item_for_context(
            &mut item,
            CompletionRewriteContext::new(Some(Path::new("+page.svelte")), false),
        );
        assert_eq!(
            item["textEdit"]["newText"],
            "import type { PageData } from './$types.js';"
        );
        assert_eq!(
            item["additionalTextEdits"][0]["newText"],
            "export type { LayoutData } from \"./$types\";"
        );
        assert_eq!(item["data"], data);
    }

    #[test]
    fn completion_suppression_matches_upstream_boundaries() {
        for site in [
            CompletionSite::RawTemplateText,
            CompletionSite::Style,
            CompletionSite::BlockMarker,
        ] {
            assert_eq!(
                completion_action(site, 1, false),
                CompletionAction::Suppress
            );
        }
        assert_eq!(
            completion_action(CompletionSite::Script, 1000, false),
            CompletionAction::Forward
        );
        assert_eq!(
            completion_action(CompletionSite::TemplateExpression, 1000, false),
            CompletionAction::Forward
        );
        assert_eq!(
            completion_action(CompletionSite::ElementStartTag, 500, false),
            CompletionAction::Forward
        );
        assert_eq!(
            completion_action(CompletionSite::ElementStartTag, 501, false),
            CompletionAction::Suppress
        );
        assert_eq!(
            completion_action(CompletionSite::ElementStartTag, 501, true),
            CompletionAction::Forward
        );
        assert_eq!(
            completion_action(
                CompletionSite::ComponentStartTag {
                    at_whitespace: true,
                },
                501,
                true,
            ),
            CompletionAction::NarrowToSvelte
        );
        assert_eq!(
            completion_action(
                CompletionSite::ComponentStartTag {
                    at_whitespace: false,
                },
                501,
                false,
            ),
            CompletionAction::Forward
        );
    }
}
