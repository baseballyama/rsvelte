//! The Svelte component extraction refactoring.

use std::path::Path;

use lsp_types::Range;
use serde_json::{Value, json};

use crate::text::LineIndex;
use crate::uri::uri_to_path;

pub const COMMAND: &str = "extract_to_svelte_component";

/// Build the workspace edit returned by upstream's extract-component command.
pub fn component(
    source: &str,
    uri: &str,
    range: Range,
    requested_path: &str,
) -> Result<Value, String> {
    let index = LineIndex::new(source);
    let start = index.offset(source, range.start);
    let end = index.offset(source, range.end);
    if start >= end || !boundary(source, start, true) || !boundary(source, end, false) {
        return Err("Invalid selection range".to_string());
    }

    let allocator = rsvelte_core::Allocator::default();
    let root = rsvelte_core::parse(source, &allocator, rsvelte_core::ParseOptions::default())
        .map_err(|_| "Invalid selection range".to_string())?;
    let blocked = [
        root.instance
            .as_ref()
            .map(|tag| (tag.start as usize, tag.end as usize)),
        root.module
            .as_ref()
            .map(|tag| (tag.start as usize, tag.end as usize)),
        root.css
            .as_ref()
            .map(|tag| (tag.start as usize, tag.end as usize)),
    ];
    if blocked
        .into_iter()
        .flatten()
        .any(|(a, b)| start >= a && end <= b)
    {
        return Err("Invalid selection range".to_string());
    }

    let mut file_path = if requested_path.is_empty() {
        "./NewComponent".to_string()
    } else {
        requested_path.to_string()
    };
    if !file_path.ends_with(".svelte") {
        file_path.push_str(".svelte");
    }
    if !file_path.starts_with('.') {
        file_path.insert_str(0, "./");
    }
    let name = Path::new(&file_path)
        .file_stem()
        .and_then(|name| name.to_str())
        .filter(|name| !name.is_empty())
        .ok_or_else(|| "Invalid selection range".to_string())?;
    let old_path = uri_to_path(uri);
    let new_path = old_path.parent().unwrap_or(Path::new(".")).join(&file_path);
    let new_uri = file_uri(&new_path);

    let mut new_source = format!("{}\n\n", &source[start..end]);
    let mut tags: Vec<(usize, usize)> = [
        root.instance
            .as_ref()
            .map(|tag| (tag.start as usize, tag.end as usize)),
        root.module
            .as_ref()
            .map(|tag| (tag.start as usize, tag.end as usize)),
        root.css
            .as_ref()
            .map(|tag| (tag.start as usize, tag.end as usize)),
    ]
    .into_iter()
    .flatten()
    .collect();
    tags.sort_unstable();
    for (tag_start, tag_end) in tags {
        new_source.push_str(&source[tag_start..tag_end]);
        new_source.push_str("\n\n");
    }

    let import_at = root
        .instance
        .as_ref()
        .or(root.module.as_ref())
        .map(|tag| tag.content_offset as usize);
    let import = format!("\n  import {name} from '{file_path}';\n");
    let import_edit = import_at.map_or_else(
        || json!({ "range": zero(), "newText": format!("<script>{import}</script>") }),
        |offset| json!({ "range": point(&index, source, offset), "newText": import }),
    );
    Ok(json!({
        "documentChanges": [
            { "textDocument": { "uri": uri, "version": null }, "edits": [
                { "range": range, "newText": format!("<{name}></{name}>") }, import_edit
            ] },
            { "kind": "create", "uri": new_uri, "options": { "overwrite": true } },
            { "textDocument": { "uri": new_uri, "version": null }, "edits": [
                { "range": zero(), "newText": new_source }
            ] }
        ]
    }))
}

fn boundary(source: &str, offset: usize, start: bool) -> bool {
    let adjacent = if start {
        source[..offset].chars().next_back()
    } else {
        source[offset..].chars().next()
    };
    adjacent.is_none_or(|c| c.is_whitespace() || !c.is_alphanumeric() && c != '_')
}

fn file_uri(path: &Path) -> String {
    format!("file://{}", path.to_string_lossy().replace(' ', "%20"))
}

fn zero() -> Value {
    json!({ "start": { "line": 0, "character": 0 }, "end": { "line": 0, "character": 0 } })
}

fn point(index: &LineIndex, source: &str, offset: usize) -> Value {
    let position = index.position(source, offset);
    json!({ "start": position, "end": position })
}

#[cfg(test)]
mod tests {
    use super::*;
    use lsp_types::Position;

    #[test]
    fn extracts_template_and_copies_tags() {
        let source = "<script>\nlet x = 1;\n</script>\n\n<p>extract me</p>\n\n<style>p { color: blue; }</style>";
        let edit = component(
            source,
            "file:///tmp/App.svelte",
            Range::new(Position::new(4, 0), Position::new(4, 17)),
            "NewComp",
        )
        .unwrap();
        assert_eq!(
            edit["documentChanges"][0]["edits"][0]["newText"],
            "<NewComp></NewComp>"
        );
        assert_eq!(
            edit["documentChanges"][1]["uri"],
            "file:///tmp/./NewComp.svelte"
        );
        assert_eq!(
            edit["documentChanges"][2]["edits"][0]["newText"],
            "<p>extract me</p>\n\n<script>\nlet x = 1;\n</script>\n\n<style>p { color: blue; }</style>\n\n"
        );
    }
}
