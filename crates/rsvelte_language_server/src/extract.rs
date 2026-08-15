//! The Svelte component extraction refactoring.

use std::path::{Component, Path, PathBuf};

use lsp_types::Range;
use regex::{Captures, Regex};
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
        let tag = &source[tag_start..tag_end];
        new_source.push_str(&update_relative_imports(
            tag,
            old_path.parent().unwrap_or(Path::new(".")),
            &file_path,
            root.css
                .as_ref()
                .is_some_and(|style| style.start as usize == tag_start),
        ));
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

fn update_relative_imports(
    tag: &str,
    old_directory: &Path,
    new_component_path: &str,
    style: bool,
) -> String {
    let pattern = if style {
        r#"@import\s+['"`](((\./)|(\.\./)).*?)['"`]"#
    } else {
        r#"import\s+\{[^}]*\}.*['"`](((\./)|(\.\./)).*?)['"`]|import\s+\w+\s+from\s+['"`](((\./)|(\.\./)).*?)['"`]"#
    };
    let regex = Regex::new(pattern).expect("static import pattern");
    let new_directory = old_directory
        .join(new_component_path)
        .parent()
        .unwrap_or(old_directory)
        .to_path_buf();
    regex
        .replace_all(tag, |captures: &Captures<'_>| {
            let original = captures.get(1).or_else(|| captures.get(5));
            let Some(original) = original else {
                return captures[0].to_string();
            };
            let replacement =
                update_relative_import(old_directory, &new_directory, original.as_str());
            captures[0].replacen(original.as_str(), &replacement, 1)
        })
        .into_owned()
}

fn update_relative_import(old_directory: &Path, new_directory: &Path, import: &str) -> String {
    let relative = relative_path(new_directory, old_directory);
    let path = normalize(relative.join(import));
    let mut value = path.to_string_lossy().replace('\\', "/");
    if !value.starts_with('.') {
        value.insert_str(0, "./");
    }
    value
}

fn relative_path(from: &Path, to: &Path) -> PathBuf {
    let from = normalize(from.to_path_buf());
    let to = normalize(to.to_path_buf());
    let from = from.components().collect::<Vec<_>>();
    let to = to.components().collect::<Vec<_>>();
    let common = from
        .iter()
        .zip(&to)
        .take_while(|(left, right)| left == right)
        .count();
    let mut result = PathBuf::new();
    for _ in common..from.len() {
        result.push("..");
    }
    for component in &to[common..] {
        result.push(component.as_os_str());
    }
    result
}

fn normalize(path: PathBuf) -> PathBuf {
    let mut result = PathBuf::new();
    for component in path.components() {
        match component {
            Component::CurDir => {}
            Component::ParentDir
                if matches!(result.components().next_back(), Some(Component::Normal(_))) =>
            {
                result.pop();
            }
            _ => result.push(component.as_os_str()),
        }
    }
    result
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

    #[test]
    fn nested_components_rebase_script_and_style_imports() {
        let source = "<script>import x from './lib/x'; import { y } from '../shared/y';</script>\n<p>x</p>\n<style>@import './theme.css';</style>";
        let edit = component(
            source,
            "file:///tmp/src/App.svelte",
            Range::new(Position::new(1, 0), Position::new(1, 8)),
            "parts/NewComp",
        )
        .unwrap();
        let created = edit["documentChanges"][2]["edits"][0]["newText"]
            .as_str()
            .unwrap();
        assert!(created.contains("from '../lib/x'"));
        assert!(created.contains("from '../../shared/y'"));
        assert!(created.contains("@import '../theme.css'"));
    }
}
