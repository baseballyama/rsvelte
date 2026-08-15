//! Svelte-specific normalization for tsgo code actions.

use lsp_types::{Position, Range, Uri};
use rsvelte_core::{Allocator, ParseOptions, parse};
use serde_json::{Map, Value, json};

use crate::text::LineIndex;

pub const SORT_IMPORTS_KIND: &str = "source.sortImports";
pub const ADD_MISSING_IMPORTS_KIND: &str = "source.addMissingImports";
pub const REMOVE_UNUSED_IMPORTS_KIND: &str = "source.removeUnusedImports";

const QUICK_FIX_KIND: &str = "quickfix";
const SOURCE_KIND: &str = "source";
const ORGANIZE_IMPORTS_KIND: &str = "source.organizeImports";
const FIX_ALL_KIND: &str = "source.fixAll";
const COMPONENT_SUFFIX: &str = "__SvelteComponent_";
const GENERATED_HELPERS: &[&str] = &[
    "__sveltets_",
    "__SvelteComponentTyped__",
    "/*Ωignore_startΩ*/",
    "/*Ωignore_endΩ*/",
];

/// Source state needed to normalize one code-action response.
pub struct TsgoCodeActionContext<'a> {
    pub source_uri: &'a Uri,
    pub source: &'a str,
    pub parser_error: bool,
    pub default_script_language: Option<&'a str>,
    pub diagnostic_codes: &'a [u32],
}

impl<'a> TsgoCodeActionContext<'a> {
    #[must_use]
    pub const fn new(source_uri: &'a Uri, source: &'a str) -> Self {
        Self {
            source_uri,
            source,
            parser_error: false,
            default_script_language: None,
            diagnostic_codes: &[],
        }
    }

    #[must_use]
    pub const fn with_parser_error(mut self, parser_error: bool) -> Self {
        self.parser_error = parser_error;
        self
    }

    #[must_use]
    pub const fn with_default_script_language(mut self, language: Option<&'a str>) -> Self {
        self.default_script_language = language;
        self
    }

    #[must_use]
    pub const fn with_diagnostic_codes(mut self, diagnostic_codes: &'a [u32]) -> Self {
        self.diagnostic_codes = diagnostic_codes;
        self
    }
}

/// Whether a kind is implemented by the tsgo-backed Svelte action path.
#[must_use]
pub fn is_supported_code_action_kind(kind: &str) -> bool {
    matches!(
        kind,
        QUICK_FIX_KIND
            | SOURCE_KIND
            | ORGANIZE_IMPORTS_KIND
            | SORT_IMPORTS_KIND
            | ADD_MISSING_IMPORTS_KIND
            | REMOVE_UNUSED_IMPORTS_KIND
            | FIX_ALL_KIND
    )
}

#[must_use]
pub fn is_source_code_action_kind(kind: &str) -> bool {
    kind == SOURCE_KIND || kind.starts_with("source.")
}

#[must_use]
pub fn is_organize_code_action_kind(kind: &str) -> bool {
    matches!(
        kind,
        ORGANIZE_IMPORTS_KIND | SORT_IMPORTS_KIND | REMOVE_UNUSED_IMPORTS_KIND
    )
}

#[must_use]
pub fn document_has_script(source: &str) -> bool {
    !script_regions(source).is_empty()
}

#[must_use]
pub fn document_has_parser_error(source: &str) -> bool {
    let allocator = Allocator::default();
    parse(
        source,
        &allocator,
        ParseOptions {
            modern: true,
            defer_script_parse: false,
            skip_non_css_lang_style: true,
            ..ParseOptions::default()
        },
    )
    .is_err()
}

/// Decide before forwarding whether the requested `only` set can produce a
/// safe action for this document.
#[must_use]
pub fn should_forward_code_action_request(
    only: Option<&[String]>,
    parser_error: bool,
    has_script: bool,
) -> bool {
    let Some(only) = only else {
        return true;
    };
    if only.is_empty() {
        return true;
    }
    only.iter().any(|kind| {
        is_supported_code_action_kind(kind)
            && !(parser_error && is_source_code_action_kind(kind))
            && (has_script || !is_organize_code_action_kind(kind))
    })
}

/// Normalize a tsgo `textDocument/codeAction` result after shadow mapping.
///
/// Returns the number of actions left in the response.
pub fn rewrite_code_action_response(
    value: &mut Value,
    context: &TsgoCodeActionContext<'_>,
) -> usize {
    let scripts = script_regions(context.source);
    let Some(actions) = code_actions_mut(value) else {
        return 0;
    };

    let mut normalized = Vec::with_capacity(actions.len() + 1);
    for mut action in std::mem::take(actions) {
        if normalize_action(&mut action, context, &scripts) {
            normalized.push(action);
        }
    }
    if needs_lang_ts_action(context)
        && let Some(action) = create_add_lang_ts_action(context, &scripts)
    {
        normalized.insert(0, action);
    }
    *actions = normalized;
    actions.len()
}

fn code_actions_mut(value: &mut Value) -> Option<&mut Vec<Value>> {
    match value {
        Value::Array(actions) => Some(actions),
        Value::Object(object) => object.get_mut("items")?.as_array_mut(),
        _ => None,
    }
}

fn normalize_action(
    action: &mut Value,
    context: &TsgoCodeActionContext<'_>,
    scripts: &[ScriptRegion],
) -> bool {
    let Some(object) = action.as_object_mut() else {
        return false;
    };
    let kind = object
        .get("kind")
        .and_then(Value::as_str)
        .map(str::to_string);
    if kind
        .as_deref()
        .is_some_and(|kind| !is_supported_code_action_kind(kind))
    {
        return false;
    }
    if context.parser_error && kind.as_deref().is_some_and(is_source_code_action_kind) {
        return false;
    }
    if scripts.is_empty() && kind.as_deref().is_some_and(is_organize_code_action_kind) {
        return false;
    }

    let import_action = is_import_action(object);
    rewrite_visible_fields(object);
    let stats = normalize_workspace_edit(object, context, scripts, kind.as_deref());

    if import_action && scripts.is_empty() {
        wrap_import_edits_in_script(object, context);
    }

    let final_stats = workspace_edit_stats(object);
    if stats.had_edits && final_stats.kept_edits == 0 {
        return false;
    }
    if kind.as_deref().is_some_and(is_organize_code_action_kind)
        && current_document_edit_count(object, context.source_uri) == 0
    {
        return false;
    }
    true
}

fn rewrite_visible_fields(object: &mut Map<String, Value>) {
    for (key, value) in object {
        if key == "data" || key == "command" || is_uri_key(key) {
            continue;
        }
        rewrite_visible_value(value);
    }
}

fn rewrite_visible_value(value: &mut Value) {
    match value {
        Value::String(text) => rewrite_visible_text(text),
        Value::Array(items) => {
            for item in items {
                rewrite_visible_value(item);
            }
        }
        Value::Object(object) => rewrite_visible_fields(object),
        _ => {}
    }
}

fn rewrite_visible_text(text: &mut String) {
    let had_component_suffix = text.contains(COMPONENT_SUFFIX);
    if had_component_suffix {
        *text = text.replace(COMPONENT_SUFFIX, "");
    }
    if text.contains(".svelte.tsx") {
        *text = text.replace(".svelte.tsx", ".svelte");
    }
    if had_component_suffix {
        *text = text
            .replace("import type ", "import ")
            .replace(" type ", " ");
    }
}

fn is_uri_key(key: &str) -> bool {
    matches!(
        key,
        "uri" | "documentUri" | "targetUri" | "oldUri" | "newUri"
    )
}

#[derive(Default)]
struct EditStats {
    had_edits: bool,
    kept_edits: usize,
}

fn normalize_workspace_edit(
    action: &mut Map<String, Value>,
    context: &TsgoCodeActionContext<'_>,
    scripts: &[ScriptRegion],
    kind: Option<&str>,
) -> EditStats {
    let mut stats = EditStats::default();
    let Some(edit) = action.get_mut("edit").and_then(Value::as_object_mut) else {
        return stats;
    };
    let protect_script = kind.is_some_and(is_source_code_action_kind);

    if let Some(changes) = edit.get_mut("changes").and_then(Value::as_object_mut) {
        for (uri, edits) in changes {
            let is_current = uri == context.source_uri.as_str();
            normalize_edit_array(
                edits,
                is_current,
                protect_script,
                context.source,
                scripts,
                &mut stats,
            );
        }
    }

    if let Some(changes) = edit
        .get_mut("documentChanges")
        .and_then(Value::as_array_mut)
    {
        for change in changes {
            let Some(change) = change.as_object_mut() else {
                continue;
            };
            let uri = change
                .get("textDocument")
                .and_then(Value::as_object)
                .and_then(|document| document.get("uri"))
                .and_then(Value::as_str);
            let is_current = uri == Some(context.source_uri.as_str());
            if let Some(edits) = change.get_mut("edits") {
                normalize_edit_array(
                    edits,
                    is_current,
                    protect_script,
                    context.source,
                    scripts,
                    &mut stats,
                );
            }
        }
    }
    stats
}

fn normalize_edit_array(
    value: &mut Value,
    is_current: bool,
    protect_script: bool,
    source: &str,
    scripts: &[ScriptRegion],
    stats: &mut EditStats,
) {
    let Some(edits) = value.as_array_mut() else {
        return;
    };
    stats.had_edits |= !edits.is_empty();
    let index = LineIndex::new(source);
    edits.retain_mut(|edit| {
        let Some(edit) = edit.as_object_mut() else {
            return false;
        };
        if !strip_generated_helper_text(edit) {
            return false;
        }
        if is_current && protect_script && !edit_range_in_scripts(edit, source, &index, scripts) {
            return false;
        }
        stats.kept_edits += 1;
        true
    });
}

fn strip_generated_helper_text(edit: &mut Map<String, Value>) -> bool {
    let Some(text) = edit.get("newText").and_then(Value::as_str) else {
        return true;
    };
    if !GENERATED_HELPERS.iter().any(|helper| text.contains(helper)) {
        return true;
    }
    let stripped = text
        .split_inclusive('\n')
        .filter(|line| !GENERATED_HELPERS.iter().any(|helper| line.contains(helper)))
        .collect::<String>();
    if stripped.is_empty() {
        return false;
    }
    edit.insert("newText".to_string(), Value::String(stripped));
    true
}

fn edit_range_in_scripts(
    edit: &Map<String, Value>,
    source: &str,
    index: &LineIndex,
    scripts: &[ScriptRegion],
) -> bool {
    let Some(range) = edit.get("range").and_then(parse_range) else {
        return false;
    };
    let start = index.offset(source, range.start);
    let end = index.offset(source, range.end).max(start);
    scripts
        .iter()
        .any(|script| script.content_start <= start && end <= script.content_end)
}

fn workspace_edit_stats(action: &Map<String, Value>) -> EditStats {
    let mut stats = EditStats::default();
    let Some(edit) = action.get("edit").and_then(Value::as_object) else {
        return stats;
    };
    if let Some(changes) = edit.get("changes").and_then(Value::as_object) {
        for edits in changes.values() {
            let count = edits.as_array().map_or(0, Vec::len);
            stats.kept_edits += count;
            if count > 0 {
                stats.had_edits = true;
            }
        }
    }
    if let Some(changes) = edit.get("documentChanges").and_then(Value::as_array) {
        for change in changes {
            let Some(change) = change.as_object() else {
                continue;
            };
            let count = change
                .get("edits")
                .and_then(Value::as_array)
                .map_or(0, Vec::len);
            stats.kept_edits += count;
            stats.had_edits |= count > 0;
        }
    }
    stats
}

fn current_document_edit_count(action: &Map<String, Value>, source_uri: &Uri) -> usize {
    let Some(edit) = action.get("edit").and_then(Value::as_object) else {
        return 0;
    };
    let changes = edit
        .get("changes")
        .and_then(Value::as_object)
        .and_then(|changes| changes.get(source_uri.as_str()))
        .and_then(Value::as_array)
        .map_or(0, Vec::len);
    let document_changes = edit
        .get("documentChanges")
        .and_then(Value::as_array)
        .map_or(0, |changes| {
            changes
                .iter()
                .filter_map(Value::as_object)
                .filter(|change| {
                    change
                        .get("textDocument")
                        .and_then(Value::as_object)
                        .and_then(|document| document.get("uri"))
                        .and_then(Value::as_str)
                        == Some(source_uri.as_str())
                })
                .filter_map(|change| change.get("edits").and_then(Value::as_array))
                .map(Vec::len)
                .sum()
        });
    changes + document_changes
}

fn is_import_action(action: &Map<String, Value>) -> bool {
    if action
        .get("data")
        .and_then(Value::as_object)
        .is_some_and(|data| {
            data.get("fixName").and_then(Value::as_str) == Some("import")
                || data.get("fixId").and_then(Value::as_str) == Some("fixMissingImport")
        })
    {
        return true;
    }
    if action
        .get("title")
        .and_then(Value::as_str)
        .is_some_and(|title| title.to_ascii_lowercase().contains("import"))
    {
        return true;
    }
    contains_import_edit(action.get("edit"))
}

fn contains_import_edit(value: Option<&Value>) -> bool {
    let Some(value) = value else {
        return false;
    };
    match value {
        Value::String(text) => text.trim_start().starts_with("import "),
        Value::Array(items) => items.iter().any(|item| contains_import_edit(Some(item))),
        Value::Object(object) => object
            .iter()
            .any(|(key, value)| key != "data" && contains_import_edit(Some(value))),
        _ => false,
    }
}

fn wrap_import_edits_in_script(
    action: &mut Map<String, Value>,
    context: &TsgoCodeActionContext<'_>,
) {
    let mut imports = String::new();
    let line_ending = newline(context.source);
    for_each_current_edit_array(action, context.source_uri, &mut |edits| {
        for edit in edits.iter() {
            if let Some(text) = edit.get("newText").and_then(Value::as_str) {
                imports.push_str(text.trim_start_matches(['\r', '\n']));
                if !imports.ends_with(['\r', '\n']) {
                    imports.push_str(line_ending);
                }
            }
        }
        edits.clear();
    });
    if imports.is_empty() {
        return;
    }
    let language = match context.default_script_language {
        Some(language @ ("js" | "ts")) => format!(" lang=\"{language}\""),
        _ => String::new(),
    };
    let newline = newline(context.source);
    let text = format!("<script{language}>{newline}{imports}</script>{newline}");
    let insertion = json!({
        "range": zero_range(),
        "newText": text
    });
    insert_current_edit(action, context.source_uri, insertion);
}

fn for_each_current_edit_array(
    action: &mut Map<String, Value>,
    source_uri: &Uri,
    callback: &mut impl FnMut(&mut Vec<Value>),
) {
    let Some(edit) = action.get_mut("edit").and_then(Value::as_object_mut) else {
        return;
    };
    if let Some(edits) = edit
        .get_mut("changes")
        .and_then(Value::as_object_mut)
        .and_then(|changes| changes.get_mut(source_uri.as_str()))
        .and_then(Value::as_array_mut)
    {
        callback(edits);
    }
    if let Some(changes) = edit
        .get_mut("documentChanges")
        .and_then(Value::as_array_mut)
    {
        for change in changes {
            let Some(change) = change.as_object_mut() else {
                continue;
            };
            let is_current = change
                .get("textDocument")
                .and_then(Value::as_object)
                .and_then(|document| document.get("uri"))
                .and_then(Value::as_str)
                == Some(source_uri.as_str());
            if is_current && let Some(edits) = change.get_mut("edits").and_then(Value::as_array_mut)
            {
                callback(edits);
            }
        }
    }
}

fn insert_current_edit(action: &mut Map<String, Value>, source_uri: &Uri, insertion: Value) {
    let Some(edit) = action.get_mut("edit").and_then(Value::as_object_mut) else {
        return;
    };
    if let Some(edits) = edit
        .get_mut("changes")
        .and_then(Value::as_object_mut)
        .and_then(|changes| changes.get_mut(source_uri.as_str()))
        .and_then(Value::as_array_mut)
    {
        edits.push(insertion);
        return;
    }
    if let Some(changes) = edit
        .get_mut("documentChanges")
        .and_then(Value::as_array_mut)
    {
        for change in changes {
            let Some(change) = change.as_object_mut() else {
                continue;
            };
            let is_current = change
                .get("textDocument")
                .and_then(Value::as_object)
                .and_then(|document| document.get("uri"))
                .and_then(Value::as_str)
                == Some(source_uri.as_str());
            if is_current && let Some(edits) = change.get_mut("edits").and_then(Value::as_array_mut)
            {
                edits.push(insertion);
                return;
            }
        }
    }
}

fn needs_lang_ts_action(context: &TsgoCodeActionContext<'_>) -> bool {
    context
        .diagnostic_codes
        .iter()
        .any(|code| (8004..=8017).contains(code))
}

fn create_add_lang_ts_action(
    context: &TsgoCodeActionContext<'_>,
    scripts: &[ScriptRegion],
) -> Option<Value> {
    let newline = newline(context.source);
    let edits = if scripts.is_empty() {
        vec![json!({
            "range": zero_range(),
            "newText": format!("<script lang=\"ts\"></script>{newline}")
        })]
    } else {
        let index = LineIndex::new(context.source);
        scripts
            .iter()
            .filter(|script| !script.has_lang)
            .map(|script| {
                let position = index.position(context.source, script.tag_name_end);
                json!({
                    "range": {
                        "start": position,
                        "end": position
                    },
                    "newText": " lang=\"ts\""
                })
            })
            .collect()
    };
    if edits.is_empty() {
        return None;
    }
    let title = if scripts.is_empty() {
        "Add <script lang=\"ts\"> tag"
    } else {
        "Add lang=\"ts\" to <script> tag"
    };
    Some(json!({
        "title": title,
        "kind": QUICK_FIX_KIND,
        "edit": {
            "documentChanges": [{
                "textDocument": {
                    "uri": context.source_uri.as_str(),
                    "version": null
                },
                "edits": edits
            }]
        }
    }))
}

#[derive(Clone, Copy, Debug)]
struct ScriptRegion {
    tag_name_end: usize,
    content_start: usize,
    content_end: usize,
    has_lang: bool,
}

fn script_regions(source: &str) -> Vec<ScriptRegion> {
    let allocator = Allocator::default();
    let options = ParseOptions {
        modern: true,
        loose: true,
        defer_script_parse: true,
        lenient_script: true,
        skip_non_css_lang_style: true,
        ..ParseOptions::default()
    };
    if let Ok(root) = parse(source, &allocator, options) {
        let mut regions = [root.module.as_deref(), root.instance.as_deref()]
            .into_iter()
            .flatten()
            .map(|script| {
                let tag_name_end = script.start as usize + "<script".len();
                let content_start = script.content_offset as usize;
                ScriptRegion {
                    tag_name_end,
                    content_start,
                    content_end: content_start + script.raw_content.len(),
                    has_lang: has_lang_attribute(&source[tag_name_end..content_start]),
                }
            })
            .collect::<Vec<_>>();
        regions.sort_by_key(|script| script.tag_name_end);
        return regions;
    }
    scan_script_regions(source)
}

fn scan_script_regions(source: &str) -> Vec<ScriptRegion> {
    let mut regions = Vec::new();
    let mut search = 0;
    while let Some(relative) = source[search..].find("<script") {
        let tag_start = search + relative;
        let tag_name_end = tag_start + "<script".len();
        if source[tag_name_end..]
            .chars()
            .next()
            .is_some_and(|character| !character.is_ascii_whitespace() && character != '>')
        {
            search = tag_name_end;
            continue;
        }
        let Some(content_start) = find_tag_end(source, tag_name_end) else {
            break;
        };
        let Some(relative_end) = source[content_start..].find("</script") else {
            break;
        };
        let content_end = content_start + relative_end;
        let opening_tag = &source[tag_name_end..content_start];
        regions.push(ScriptRegion {
            tag_name_end,
            content_start,
            content_end,
            has_lang: has_lang_attribute(opening_tag),
        });
        search = content_end + "</script".len();
    }
    regions
}

fn find_tag_end(source: &str, mut offset: usize) -> Option<usize> {
    let bytes = source.as_bytes();
    let mut quote = None;
    while offset < bytes.len() {
        let byte = bytes[offset];
        match quote {
            Some(current) if byte == current => quote = None,
            None if byte == b'\'' || byte == b'"' => quote = Some(byte),
            None if byte == b'>' => return Some(offset + 1),
            _ => {}
        }
        offset += 1;
    }
    None
}

fn has_lang_attribute(opening_tag: &str) -> bool {
    opening_tag
        .split_ascii_whitespace()
        .any(|attribute| attribute == "lang" || attribute.starts_with("lang="))
}

fn parse_range(value: &Value) -> Option<Range> {
    let object = value.as_object()?;
    Some(Range::new(
        parse_position(object.get("start")?)?,
        parse_position(object.get("end")?)?,
    ))
}

fn parse_position(value: &Value) -> Option<Position> {
    let object = value.as_object()?;
    Some(Position::new(
        u32::try_from(object.get("line")?.as_u64()?).ok()?,
        u32::try_from(object.get("character")?.as_u64()?).ok()?,
    ))
}

fn zero_range() -> Value {
    json!({
        "start": { "line": 0, "character": 0 },
        "end": { "line": 0, "character": 0 }
    })
}

fn newline(source: &str) -> &'static str {
    if source.contains("\r\n") {
        "\r\n"
    } else {
        "\n"
    }
}

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use super::*;

    fn uri() -> Uri {
        Uri::from_str("file:///workspace/App.svelte").unwrap()
    }

    fn context<'a>(uri: &'a Uri, source: &'a str) -> TsgoCodeActionContext<'a> {
        TsgoCodeActionContext::new(uri, source)
    }

    #[test]
    fn supported_kind_helpers_match_the_forwarded_surface() {
        for kind in [
            "quickfix",
            "source",
            "source.organizeImports",
            "source.sortImports",
            "source.addMissingImports",
            "source.removeUnusedImports",
            "source.fixAll",
        ] {
            assert!(is_supported_code_action_kind(kind), "{kind}");
        }
        assert!(!is_supported_code_action_kind("refactor.extract"));
        assert!(is_source_code_action_kind("source.fixAll.ts"));
        assert!(is_organize_code_action_kind("source.sortImports"));

        let source = vec!["source.organizeImports".to_string()];
        assert!(!should_forward_code_action_request(
            Some(&source),
            true,
            true
        ));
        assert!(!should_forward_code_action_request(
            Some(&source),
            false,
            false
        ));
        let quickfix = vec!["quickfix".to_string()];
        assert!(should_forward_code_action_request(
            Some(&quickfix),
            true,
            false
        ));
    }

    #[test]
    fn component_import_is_unsuffixed_and_wrapped_in_a_typescript_script() {
        let uri = uri();
        let source = "<Button />\r\n";
        let mut response = json!([{
            "title": "Add import from ./Button.svelte.tsx",
            "kind": "quickfix",
            "edit": {
                "changes": {
                    uri.as_str(): [{
                        "range": zero_range(),
                        "newText": "import type Button__SvelteComponent_ from './Button.svelte.tsx';\r\n"
                    }]
                }
            },
            "data": {
                "fixName": "import",
                "name": "Button__SvelteComponent_",
                "source": "./Button.svelte.tsx"
            }
        }]);
        let context = context(&uri, source).with_default_script_language(Some("ts"));
        assert_eq!(rewrite_code_action_response(&mut response, &context), 1);
        let action = &response[0];
        assert_eq!(action["title"], "Add import from ./Button.svelte");
        assert_eq!(
            action["edit"]["changes"][uri.as_str()][0]["newText"],
            "<script lang=\"ts\">\r\nimport Button from './Button.svelte';\r\n</script>\r\n"
        );
        assert_eq!(
            action["data"]["name"], "Button__SvelteComponent_",
            "resolve data belongs to tsgo"
        );
        assert_eq!(action["data"]["source"], "./Button.svelte.tsx");
    }

    #[test]
    fn parser_errors_suppress_source_actions_but_keep_quickfixes() {
        let uri = uri();
        let source = "<script>let broken = ;</script>";
        let mut response = json!([
            { "title": "Organize Imports", "kind": "source.organizeImports" },
            { "title": "Fix typo", "kind": "quickfix" },
            { "title": "Extract", "kind": "refactor.extract" }
        ]);
        let context = context(&uri, source).with_parser_error(true);
        assert_eq!(rewrite_code_action_response(&mut response, &context), 1);
        assert_eq!(response[0]["title"], "Fix typo");
    }

    #[test]
    fn organize_imports_keeps_script_edits_and_drops_markup_and_helpers() {
        let uri = uri();
        let source = "<script>\n  import { b, a } from './x';\n</script>\n<p />\n";
        let mut response = json!([{
            "title": "Organize Imports",
            "kind": "source.organizeImports",
            "edit": {
                "documentChanges": [{
                    "textDocument": { "uri": uri.as_str(), "version": null },
                    "edits": [
                        {
                            "range": {
                                "start": { "line": 1, "character": 2 },
                                "end": { "line": 1, "character": 36 }
                            },
                            "newText": "import { a, b } from './x';\n"
                        },
                        {
                            "range": {
                                "start": { "line": 0, "character": 0 },
                                "end": { "line": 0, "character": 0 }
                            },
                            "newText": "import { SvelteComponentTyped as __SvelteComponentTyped__ } from 'svelte';\n"
                        },
                        {
                            "range": {
                                "start": { "line": 3, "character": 0 },
                                "end": { "line": 3, "character": 0 }
                            },
                            "newText": "corrupt markup"
                        }
                    ]
                }]
            }
        }]);
        assert_eq!(
            rewrite_code_action_response(&mut response, &context(&uri, source)),
            1
        );
        let edits = response[0]["edit"]["documentChanges"][0]["edits"]
            .as_array()
            .unwrap();
        assert_eq!(edits.len(), 1);
        assert_eq!(edits[0]["newText"], "import { a, b } from './x';\n");
    }

    #[test]
    fn organize_action_without_a_script_is_removed() {
        let uri = uri();
        let mut response = json!([{
            "title": "Organize Imports",
            "kind": "source.organizeImports",
            "edit": { "changes": { uri.as_str(): [] } }
        }]);
        assert_eq!(
            rewrite_code_action_response(&mut response, &context(&uri, "<p />")),
            0
        );
        assert_eq!(response, json!([]));
    }

    #[test]
    fn only_top_level_script_blocks_enable_source_actions() {
        assert!(!document_has_script(
            "<!-- <script></script> --><svelte:head><script></script></svelte:head><p />"
        ));
        assert!(document_has_script(
            "<svelte:head><script></script></svelte:head><script>let x;</script>"
        ));
        assert!(document_has_parser_error("<script>let = ;</script>"));
        assert!(!document_has_parser_error(
            "<script lang=\"ts\">let x: string;</script>"
        ));
    }

    #[test]
    fn ts_only_diagnostic_adds_or_updates_script_language() {
        let uri = uri();
        let codes = [8004];
        let mut no_script = json!([]);
        let no_script_context = context(&uri, "<p />").with_diagnostic_codes(&codes);
        assert_eq!(
            rewrite_code_action_response(&mut no_script, &no_script_context),
            1
        );
        assert_eq!(
            no_script[0]["edit"]["documentChanges"][0]["edits"][0]["newText"],
            "<script lang=\"ts\"></script>\n"
        );

        let source = "<script context=\"module\"></script>\n<script>let x;</script>";
        let mut scripts = json!([]);
        let context = context(&uri, source).with_diagnostic_codes(&codes);
        assert_eq!(rewrite_code_action_response(&mut scripts, &context), 1);
        let edits = scripts[0]["edit"]["documentChanges"][0]["edits"]
            .as_array()
            .unwrap();
        assert_eq!(edits.len(), 2);
        assert!(edits.iter().all(|edit| edit["newText"] == " lang=\"ts\""));
    }

    #[test]
    fn helper_only_quickfix_is_dropped_but_external_file_edit_is_preserved() {
        let uri = uri();
        let source = "<script>let x;</script>";
        let mut response = json!([
            {
                "title": "Generated helper",
                "kind": "quickfix",
                "edit": {
                    "changes": {
                        uri.as_str(): [{
                            "range": zero_range(),
                            "newText": "const x = __sveltets_2_any(0);"
                        }]
                    }
                }
            },
            {
                "title": "Update other file",
                "kind": "quickfix",
                "edit": {
                    "changes": {
                        "file:///workspace/other.ts": [{
                            "range": zero_range(),
                            "newText": "export const y = 1;"
                        }]
                    }
                }
            }
        ]);
        assert_eq!(
            rewrite_code_action_response(&mut response, &context(&uri, source)),
            1
        );
        assert_eq!(response[0]["title"], "Update other file");
    }
}
