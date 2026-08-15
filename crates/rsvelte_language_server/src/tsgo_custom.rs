//! Pure Svelte-specific helpers for tsgo custom requests and code lenses.

use std::collections::BTreeMap;
use std::path::{Component, Path, PathBuf};

use lsp_types::{Location, Position, Range, Uri};
use serde_json::{Map, Value, json};

const COMPONENT_SUFFIX: &str = "__SvelteComponent_";
const MODULE_EXTENSIONS: &[&str] = &[
    "ts", "tsx", "js", "jsx", "mts", "cts", "mjs", "cjs", "svelte",
];

/// One mapped TypeScript reference considered for `$/getComponentReferences`.
#[derive(Debug)]
pub struct ComponentReference<'a> {
    pub location: Location,
    pub source_text: Option<&'a str>,
    pub is_definition: bool,
    pub is_generated: bool,
}

/// A source file visible to the file-reference index.
#[derive(Debug, Clone, Copy)]
pub struct WorkspaceSource<'a> {
    pub path: &'a Path,
    pub uri: &'a Uri,
    pub text: &'a str,
}

/// The editor and tsgo identities of one Svelte document.
#[derive(Debug, Clone, Copy)]
pub struct ShadowUriPair<'a> {
    pub source_uri: &'a Uri,
    pub shadow_uri: &'a Uri,
}

/// The two URI pairs needed to forward a `workspace/willRenameFiles` request.
#[derive(Debug, Clone, Copy)]
pub struct WillRenameMapping<'a> {
    pub old: ShadowUriPair<'a>,
    pub new: ShadowUriPair<'a>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CodeLensKind {
    Reference,
    Implementation,
}

impl CodeLensKind {
    fn name(self) -> &'static str {
        match self {
            Self::Reference => "reference",
            Self::Implementation => "implementation",
        }
    }
}

/// Read the official provider's resolve discriminator from a lens.
#[must_use]
pub fn code_lens_kind(lens: &Value) -> Option<CodeLensKind> {
    match lens
        .pointer("/data/kind")
        .and_then(Value::as_str)
        .or_else(|| lens.pointer("/data/type").and_then(Value::as_str))
    {
        Some("references" | "reference") => Some(CodeLensKind::Reference),
        Some("implementations" | "implementation") => Some(CodeLensKind::Implementation),
        _ => None,
    }
}

/// Reference lens for the component class synthesized by svelte2tsx.
#[must_use]
pub fn component_reference_code_lens(source_uri: &Uri) -> Value {
    json!({
        "range": {
            "start": { "line": 0, "character": 0 },
            "end": { "line": 0, "character": 1 }
        },
        "data": { "kind": "references", "uri": source_uri.as_str() }
    })
}

/// Byte offset at which tsgo should probe the generated component export.
#[must_use]
pub fn component_probe_offset(generated_text: &str) -> Option<usize> {
    generated_text.rfind(COMPONENT_SUFFIX)
}

/// UTF-8 LSP position at which tsgo should probe the generated component export.
#[must_use]
pub fn component_probe_position(generated_text: &str) -> Option<Position> {
    component_probe_offset(generated_text).map(|offset| utf8_position(generated_text, offset))
}

/// Remove definitions, generated locations, closing tags, and zero ranges.
#[must_use]
pub fn filter_component_references<'a>(
    references: impl IntoIterator<Item = ComponentReference<'a>>,
) -> Vec<Location> {
    references
        .into_iter()
        .filter(|reference| !reference.is_definition && !reference.is_generated)
        .filter(|reference| non_zero_range(reference.location.range))
        .filter(|reference| {
            reference
                .source_text
                .is_none_or(|text| !is_component_closing_tag(text, reference.location.range.start))
        })
        .map(|reference| reference.location)
        .collect()
}

/// Whether a mapped component name is immediately preceded by the `/` of an end tag.
#[must_use]
pub fn is_component_closing_tag(source_text: &str, start: Position) -> bool {
    let offset = utf16_offset(source_text, start);
    offset > 0 && source_text.as_bytes().get(offset - 1) == Some(&b'/')
}

/// Find ES module specifiers which resolve to `target_path`.
#[must_use]
pub fn find_file_references(target_path: &Path, sources: &[WorkspaceSource<'_>]) -> Vec<Location> {
    let target_path = normalize_path(target_path);
    let mut locations = Vec::new();

    for source in sources {
        for span in module_specifier_spans(source.path, source.text) {
            let specifier = &source.text[span.clone()];
            if !specifier.starts_with('.')
                || !specifier_resolves_to(source.path, specifier, &target_path)
            {
                continue;
            }
            locations.push(Location::new(
                source.uri.clone(),
                Range::new(
                    utf16_position(source.text, span.start),
                    utf16_position(source.text, span.end),
                ),
            ));
        }
    }

    locations.sort_by(|left, right| {
        left.uri
            .as_str()
            .cmp(right.uri.as_str())
            .then_with(|| left.range.start.line.cmp(&right.range.start.line))
            .then_with(|| left.range.start.character.cmp(&right.range.start.character))
            .then_with(|| left.range.end.line.cmp(&right.range.end.line))
            .then_with(|| left.range.end.character.cmp(&right.range.end.character))
    });

    locations
}

/// Replace editor `.svelte` URIs with the old and prospective shadow URIs.
pub fn rewrite_will_rename_params(params: &mut Value, mappings: &[WillRenameMapping<'_>]) {
    if let Some(file) = params.as_object_mut() {
        for mapping in mappings {
            replace_uri_field(
                file,
                "oldUri",
                mapping.old.source_uri,
                mapping.old.shadow_uri,
            );
            replace_uri_field(
                file,
                "newUri",
                mapping.new.source_uri,
                mapping.new.shadow_uri,
            );
        }
    }
    let Some(files) = params.get_mut("files").and_then(Value::as_array_mut) else {
        return;
    };
    for file in files.iter_mut().filter_map(Value::as_object_mut) {
        for mapping in mappings {
            replace_uri_field(
                file,
                "oldUri",
                mapping.old.source_uri,
                mapping.old.shadow_uri,
            );
            replace_uri_field(
                file,
                "newUri",
                mapping.new.source_uri,
                mapping.new.shadow_uri,
            );
        }
    }
}

/// Normalize tsgo's file-rename edit before the generic range mapper runs.
pub fn rewrite_will_rename_result(
    result: &mut Value,
    mappings: &[WillRenameMapping<'_>],
    documents: &[ShadowUriPair<'_>],
) {
    let mut pairs = documents.to_vec();
    pairs.extend(
        mappings
            .iter()
            .flat_map(|mapping| [mapping.old, mapping.new]),
    );
    if let Some(changes) = result.get_mut("changes").and_then(Value::as_object_mut) {
        rewrite_changes_map(changes, mappings, &pairs);
    }

    let Some(document_changes) = result
        .get_mut("documentChanges")
        .and_then(Value::as_array_mut)
    else {
        return;
    };
    let mut rewritten = Vec::<Value>::new();
    for mut change in std::mem::take(document_changes) {
        let Some(uri) = change.pointer("/textDocument/uri").and_then(Value::as_str) else {
            rewritten.push(change);
            continue;
        };
        if is_kit_types_path(uri) {
            continue;
        }
        let mapped_uri = result_uri_for(uri, mappings, &pairs)
            .unwrap_or(uri)
            .to_string();
        if let Some(value) = change.pointer_mut("/textDocument/uri") {
            *value = Value::String(mapped_uri.clone());
        }
        if let Some(edits) = change.get_mut("edits").and_then(Value::as_array_mut) {
            rewrite_text_edits(edits, &mapped_uri, &pairs);
        }
        if let Some(existing) = rewritten.iter_mut().find(|existing| {
            existing
                .pointer("/textDocument/uri")
                .and_then(Value::as_str)
                == Some(&mapped_uri)
        }) {
            if edit_count(&change) >= edit_count(existing) {
                *existing = change;
            }
        } else {
            rewritten.push(change);
        }
    }
    *document_changes = rewritten;
}

/// Keep mapped, non-empty lenses and attach the editor-facing resolve identity.
pub fn prepare_code_lenses(result: &mut Value, source_uri: &Uri) {
    let Some(lenses) = result.as_array_mut() else {
        return;
    };
    lenses.retain_mut(|lens| {
        let Some(range) = lens.get("range").and_then(parse_range) else {
            return false;
        };
        if !non_zero_range(range) {
            return false;
        }
        let data = lens
            .as_object_mut()
            .expect("a lens with a range is an object")
            .entry("data")
            .or_insert_with(|| Value::Object(Map::new()));
        if let Some(data) = data.as_object_mut() {
            data.insert(
                "uri".to_string(),
                Value::String(source_uri.as_str().to_string()),
            );
        }
        true
    });
}

/// Build the editor-neutral command used by the official code-lens provider.
pub fn resolve_code_lens(
    lens: &mut Value,
    kind: CodeLensKind,
    source_uri: &Uri,
    locations: Vec<Location>,
) -> bool {
    let Some(start) = lens
        .get("range")
        .and_then(parse_range)
        .map(|range| range.start)
    else {
        return false;
    };
    let count = locations.len();
    let plural = if count == 1 { "" } else { "s" };
    lens.as_object_mut()
        .expect("range belongs to an object")
        .insert(
            "command".to_string(),
            json!({
                "title": format!("{count} {}{plural}", kind.name()),
                "command": "",
                "arguments": [source_uri.as_str(), start, locations],
            }),
        );
    true
}

fn replace_uri_field(object: &mut Map<String, Value>, key: &str, from: &Uri, to: &Uri) {
    if object.get(key).and_then(Value::as_str) == Some(from.as_str()) {
        object.insert(key.to_string(), Value::String(to.as_str().to_string()));
    }
}

fn rewrite_changes_map(
    changes: &mut Map<String, Value>,
    mappings: &[WillRenameMapping<'_>],
    pairs: &[ShadowUriPair<'_>],
) {
    let mut rewritten = BTreeMap::<String, Value>::new();
    for (uri, mut edits) in std::mem::take(changes) {
        if is_kit_types_path(&uri) {
            continue;
        }
        let mapped_uri = result_uri_for(&uri, mappings, pairs)
            .unwrap_or(&uri)
            .to_string();
        if let Some(edits) = edits.as_array_mut() {
            rewrite_text_edits(edits, &mapped_uri, pairs);
        }
        if let Some(existing) = rewritten.get_mut(&mapped_uri)
            && let (Some(existing), Some(edits)) = (existing.as_array_mut(), edits.as_array_mut())
        {
            if edits.len() >= existing.len() {
                *existing = std::mem::take(edits);
            }
        } else {
            rewritten.insert(mapped_uri, edits);
        }
    }
    changes.extend(rewritten);
}

fn rewrite_text_edits(edits: &mut Vec<Value>, document_uri: &str, pairs: &[ShadowUriPair<'_>]) {
    let route_file = uri_basename(document_uri).is_some_and(|name| name.starts_with('+'));
    edits.retain_mut(|edit| {
        let Some(new_text) = edit.get_mut("newText") else {
            return true;
        };
        let Some(text) = new_text.as_str() else {
            return true;
        };
        if route_file && is_kit_types_path(text) {
            return false;
        }
        *new_text = Value::String(rewrite_shadow_specifiers(text, pairs));
        true
    });
}

fn rewrite_shadow_specifiers(text: &str, pairs: &[ShadowUriPair<'_>]) -> String {
    let mut result = text.to_string();
    for pair in pairs {
        let Some(source_name) = uri_basename(pair.source_uri.as_str()) else {
            continue;
        };
        if let Some(shadow_name) = uri_basename(pair.shadow_uri.as_str()) {
            result = result.replace(shadow_name, source_name);
        }
        if source_name.ends_with(".svelte") {
            for suffix in [".tsx", ".jsx", ".ts", ".js"] {
                result = result.replace(&format!("{source_name}{suffix}"), source_name);
            }
        }
    }
    result
}

fn source_uri_for<'a>(uri: &str, pairs: &'a [ShadowUriPair<'_>]) -> Option<&'a str> {
    pairs
        .iter()
        .find(|pair| pair.shadow_uri.as_str() == uri)
        .map(|pair| pair.source_uri.as_str())
}

fn result_uri_for<'a>(
    uri: &str,
    mappings: &'a [WillRenameMapping<'_>],
    pairs: &'a [ShadowUriPair<'_>],
) -> Option<&'a str> {
    mappings
        .iter()
        .find(|mapping| {
            mapping.old.shadow_uri.as_str() == uri || mapping.old.source_uri.as_str() == uri
        })
        .map(|mapping| mapping.new.source_uri.as_str())
        .or_else(|| source_uri_for(uri, pairs))
}

fn edit_count(change: &Value) -> usize {
    change
        .get("edits")
        .and_then(Value::as_array)
        .map_or(0, Vec::len)
}

fn is_kit_types_path(path: &str) -> bool {
    path.ends_with("/$types.js") || path.ends_with("/$types") || path.ends_with("/$types.d.ts")
}

fn uri_basename(uri: &str) -> Option<&str> {
    uri.rsplit('/').next().filter(|name| !name.is_empty())
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum TokenKind<'a> {
    Ident(&'a str),
    String,
    Punct(u8),
}

#[derive(Debug, Clone, Copy)]
struct Token<'a> {
    kind: TokenKind<'a>,
    start: usize,
    end: usize,
}

fn module_specifier_spans(path: &Path, text: &str) -> Vec<std::ops::Range<usize>> {
    let regions = if path
        .extension()
        .is_some_and(|extension| extension == "svelte")
    {
        svelte_script_regions(text)
    } else {
        std::iter::once(0..text.len()).collect()
    };
    let mut spans = Vec::new();
    for region in regions {
        let tokens = tokenize(&text[region.clone()], region.start);
        let mut index = 0;
        while index < tokens.len() {
            match tokens[index].kind {
                TokenKind::Ident("import") => {
                    collect_import_specifier(&tokens, index, &mut spans);
                }
                TokenKind::Ident("export") => {
                    collect_from_specifier(&tokens, index + 1, &mut spans);
                }
                TokenKind::Ident("require") => {
                    collect_call_specifier(&tokens, index, &mut spans);
                }
                _ => {}
            }
            index += 1;
        }
    }
    spans.sort_by_key(|span| (span.start, span.end));
    spans.dedup();
    spans
}

fn collect_import_specifier(
    tokens: &[Token<'_>],
    index: usize,
    spans: &mut Vec<std::ops::Range<usize>>,
) {
    match tokens.get(index + 1).map(|token| token.kind) {
        Some(TokenKind::String) => push_string_span(tokens[index + 1], spans),
        Some(TokenKind::Punct(b'(')) => collect_call_specifier(tokens, index, spans),
        _ => collect_from_specifier(tokens, index + 1, spans),
    }
}

fn collect_call_specifier(
    tokens: &[Token<'_>],
    index: usize,
    spans: &mut Vec<std::ops::Range<usize>>,
) {
    if matches!(
        tokens.get(index + 1).map(|token| token.kind),
        Some(TokenKind::Punct(b'('))
    ) && let Some(token) = tokens.get(index + 2)
        && token.kind == TokenKind::String
    {
        push_string_span(*token, spans);
    }
}

fn collect_from_specifier(
    tokens: &[Token<'_>],
    mut index: usize,
    spans: &mut Vec<std::ops::Range<usize>>,
) {
    let mut depth = 0usize;
    while let Some(token) = tokens.get(index) {
        match token.kind {
            TokenKind::Punct(b'(' | b'[' | b'{') => depth += 1,
            TokenKind::Punct(b')' | b']' | b'}') => depth = depth.saturating_sub(1),
            TokenKind::Punct(b';') if depth == 0 => break,
            TokenKind::Ident("import" | "export") if depth == 0 => break,
            TokenKind::Ident("from") if depth == 0 => {
                if let Some(next) = tokens.get(index + 1)
                    && next.kind == TokenKind::String
                {
                    push_string_span(*next, spans);
                }
                break;
            }
            _ => {}
        }
        index += 1;
    }
}

fn push_string_span(token: Token<'_>, spans: &mut Vec<std::ops::Range<usize>>) {
    if token.end > token.start + 1 {
        spans.push(token.start + 1..token.end - 1);
    }
}

fn tokenize(text: &str, base: usize) -> Vec<Token<'_>> {
    let bytes = text.as_bytes();
    let mut tokens = Vec::new();
    let mut index = 0;
    while index < bytes.len() {
        if bytes[index].is_ascii_whitespace() {
            index += 1;
            continue;
        }
        if bytes[index] == b'/' && bytes.get(index + 1) == Some(&b'/') {
            index += 2;
            while index < bytes.len() && !matches!(bytes[index], b'\n' | b'\r') {
                index += 1;
            }
            continue;
        }
        if bytes[index] == b'/' && bytes.get(index + 1) == Some(&b'*') {
            index += 2;
            while index + 1 < bytes.len() && !(bytes[index] == b'*' && bytes[index + 1] == b'/') {
                index += 1;
            }
            index = (index + 2).min(bytes.len());
            continue;
        }
        if matches!(bytes[index], b'\'' | b'"' | b'`') {
            let quote = bytes[index];
            let start = index;
            index += 1;
            let mut interpolation = false;
            while index < bytes.len() {
                if bytes[index] == b'\\' {
                    index = (index + 2).min(bytes.len());
                } else if quote == b'`'
                    && bytes[index] == b'$'
                    && bytes.get(index + 1) == Some(&b'{')
                {
                    interpolation = true;
                    index += 2;
                } else if bytes[index] == quote {
                    index += 1;
                    break;
                } else {
                    index += 1;
                }
            }
            if !interpolation {
                tokens.push(Token {
                    kind: TokenKind::String,
                    start: base + start,
                    end: base + index,
                });
            }
            continue;
        }
        if is_identifier_start(bytes[index]) {
            let start = index;
            index += 1;
            while index < bytes.len() && is_identifier_continue(bytes[index]) {
                index += 1;
            }
            tokens.push(Token {
                kind: TokenKind::Ident(&text[start..index]),
                start: base + start,
                end: base + index,
            });
            continue;
        }
        tokens.push(Token {
            kind: TokenKind::Punct(bytes[index]),
            start: base + index,
            end: base + index + 1,
        });
        index += 1;
    }
    tokens
}

const fn is_identifier_start(byte: u8) -> bool {
    byte.is_ascii_alphabetic() || matches!(byte, b'_' | b'$')
}

const fn is_identifier_continue(byte: u8) -> bool {
    is_identifier_start(byte) || byte.is_ascii_digit()
}

fn svelte_script_regions(text: &str) -> Vec<std::ops::Range<usize>> {
    let lower = text.to_ascii_lowercase();
    let mut regions = Vec::new();
    let mut cursor = 0;
    while let Some(relative_start) = lower[cursor..].find("<script") {
        let tag_start = cursor + relative_start;
        let Some(relative_open_end) = lower[tag_start..].find('>') else {
            break;
        };
        let content_start = tag_start + relative_open_end + 1;
        let Some(relative_close) = lower[content_start..].find("</script") else {
            break;
        };
        let content_end = content_start + relative_close;
        regions.push(content_start..content_end);
        cursor = content_end + "</script".len();
    }
    regions
}

fn specifier_resolves_to(source_path: &Path, specifier: &str, target: &Path) -> bool {
    let specifier = specifier
        .split(['?', '#'])
        .next()
        .unwrap_or(specifier)
        .replace('\\', "/");
    let parent = source_path.parent().unwrap_or_else(|| Path::new(""));
    let base = normalize_path(&parent.join(specifier));
    resolution_candidates(&base).any(|candidate| candidate == target)
}

fn resolution_candidates(base: &Path) -> impl Iterator<Item = PathBuf> {
    let mut candidates = vec![base.to_path_buf()];
    match base.extension().and_then(|extension| extension.to_str()) {
        None => {
            for extension in MODULE_EXTENSIONS {
                candidates.push(base.with_extension(extension));
                candidates.push(base.join("index").with_extension(extension));
            }
        }
        Some("js") => {
            candidates.push(base.with_extension("ts"));
            candidates.push(base.with_extension("tsx"));
            if base.to_string_lossy().ends_with(".svelte.js") {
                candidates.push(PathBuf::from(
                    base.to_string_lossy().trim_end_matches(".js"),
                ));
            }
        }
        Some("mjs") => candidates.push(base.with_extension("mts")),
        Some("cjs") => candidates.push(base.with_extension("cts")),
        _ => {}
    }
    candidates.into_iter()
}

fn normalize_path(path: &Path) -> PathBuf {
    let mut normalized = PathBuf::new();
    for component in path.components() {
        match component {
            Component::CurDir => {}
            Component::ParentDir => {
                if !normalized.pop() {
                    normalized.push(component.as_os_str());
                }
            }
            _ => normalized.push(component.as_os_str()),
        }
    }
    normalized
}

fn non_zero_range(range: Range) -> bool {
    range.start != range.end
}

fn parse_range(value: &Value) -> Option<Range> {
    serde_json::from_value(value.clone()).ok()
}

fn utf8_position(text: &str, offset: usize) -> Position {
    let offset = floor_char_boundary(text, offset);
    let before = &text[..offset];
    let line = before.bytes().filter(|byte| *byte == b'\n').count();
    let line_start = before.rfind('\n').map_or(0, |index| index + 1);
    Position::new(line as u32, (offset - line_start) as u32)
}

fn utf16_position(text: &str, offset: usize) -> Position {
    let offset = floor_char_boundary(text, offset);
    let before = &text[..offset];
    let line = before.bytes().filter(|byte| *byte == b'\n').count();
    let line_start = before.rfind('\n').map_or(0, |index| index + 1);
    Position::new(
        line as u32,
        text[line_start..offset].encode_utf16().count() as u32,
    )
}

fn utf16_offset(text: &str, position: Position) -> usize {
    let line_start = if position.line == 0 {
        0
    } else {
        text.match_indices('\n')
            .nth(position.line as usize - 1)
            .map_or(text.len(), |(offset, _)| offset + 1)
    };
    let line_end = text[line_start..]
        .find('\n')
        .map_or(text.len(), |offset| line_start + offset);
    let mut units = 0u32;
    for (offset, character) in text[line_start..line_end].char_indices() {
        let width = character.len_utf16() as u32;
        if units + width > position.character {
            return line_start + offset;
        }
        units += width;
        if units == position.character {
            return line_start + offset + character.len_utf8();
        }
    }
    line_end
}

fn floor_char_boundary(text: &str, offset: usize) -> usize {
    let mut offset = offset.min(text.len());
    while !text.is_char_boundary(offset) {
        offset -= 1;
    }
    offset
}

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use super::*;

    fn uri(value: &str) -> Uri {
        Uri::from_str(value).unwrap()
    }

    fn location(uri: &Uri, line: u32, start: u32, end: u32) -> Location {
        Location::new(
            uri.clone(),
            Range::new(Position::new(line, start), Position::new(line, end)),
        )
    }

    #[test]
    fn component_probe_uses_the_last_generated_export() {
        let generated = "Old__SvelteComponent_\né Final__SvelteComponent_";
        assert_eq!(
            component_probe_offset(generated),
            Some(generated.rfind(COMPONENT_SUFFIX).unwrap())
        );
        assert_eq!(
            component_probe_position(generated),
            Some(Position::new(1, 8))
        );
    }

    #[test]
    fn component_references_omit_definitions_generated_ranges_and_end_tags() {
        let component_uri = uri("file:///workspace/Parent.svelte");
        let source = "<script>import Child from './Child.svelte';</script>\n<Child />\n</Child>";
        let references = vec![
            ComponentReference {
                location: location(&component_uri, 0, 15, 20),
                source_text: Some(source),
                is_definition: false,
                is_generated: false,
            },
            ComponentReference {
                location: location(&component_uri, 1, 1, 6),
                source_text: Some(source),
                is_definition: false,
                is_generated: false,
            },
            ComponentReference {
                location: location(&component_uri, 2, 2, 7),
                source_text: Some(source),
                is_definition: false,
                is_generated: false,
            },
            ComponentReference {
                location: location(&component_uri, 1, 1, 1),
                source_text: Some(source),
                is_definition: false,
                is_generated: false,
            },
            ComponentReference {
                location: location(&component_uri, 1, 1, 6),
                source_text: Some(source),
                is_definition: true,
                is_generated: false,
            },
            ComponentReference {
                location: location(&component_uri, 1, 1, 6),
                source_text: Some(source),
                is_definition: false,
                is_generated: true,
            },
        ];

        assert_eq!(
            filter_component_references(references),
            vec![
                location(&component_uri, 0, 15, 20),
                location(&component_uri, 1, 1, 6)
            ]
        );
    }

    #[test]
    fn file_references_cover_svelte_scripts_and_es_module_forms() {
        let target_path = Path::new("/workspace/target.ts");
        let ts_path = Path::new("/workspace/consumer.ts");
        let svelte_path = Path::new("/workspace/Consumer.svelte");
        let ts_uri = uri("file:///workspace/consumer.ts");
        let svelte_uri = uri("file:///workspace/Consumer.svelte");
        let ts = concat!(
            "import { named } from './target';\n",
            "import './target.js';\n",
            "export { named as again } from './target';\n",
            "const lazy = import('./target.js');\n",
            "const common = require('./target');\n",
            "const ordinary = './target';\n",
        );
        let svelte = concat!(
            "<script context=\"module\">export * from './target';</script>\n",
            "<script>import './target.js';</script>\n",
            "<p>{import('./target')}</p>\n",
        );
        let sources = [
            WorkspaceSource {
                path: ts_path,
                uri: &ts_uri,
                text: ts,
            },
            WorkspaceSource {
                path: svelte_path,
                uri: &svelte_uri,
                text: svelte,
            },
        ];

        let locations = find_file_references(target_path, &sources);
        assert_eq!(locations.len(), 7);
        assert_eq!(
            locations.iter().filter(|item| item.uri == ts_uri).count(),
            5
        );
        assert_eq!(
            locations
                .iter()
                .filter(|item| item.uri == svelte_uri)
                .count(),
            2
        );
        assert!(locations.iter().all(|item| non_zero_range(item.range)));
        assert!(locations.windows(2).all(|pair| {
            (
                pair[0].uri.as_str(),
                pair[0].range.start.line,
                pair[0].range.start.character,
            ) <= (
                pair[1].uri.as_str(),
                pair[1].range.start.line,
                pair[1].range.start.character,
            )
        }));
        let first_start = ts.find("./target").unwrap();
        let first_ts = locations.iter().find(|item| item.uri == ts_uri).unwrap();
        assert_eq!(
            first_ts.range,
            Range::new(
                utf16_position(ts, first_start),
                utf16_position(ts, first_start + "./target".len())
            )
        );
    }

    #[test]
    fn file_references_match_the_official_svelte_fixture_range() {
        let target = Path::new("/workspace/find-file-references-child.svelte");
        let source_path = Path::new("/workspace/find-file-references-parent.svelte");
        let source_uri = uri("file:///workspace/find-file-references-parent.svelte");
        let source = concat!(
            "<script>\n",
            "import FindFileReferencesChild from \"./find-file-references-child.svelte\";\n",
            "</script>"
        );
        let sources = [WorkspaceSource {
            path: source_path,
            uri: &source_uri,
            text: source,
        }];

        let locations = find_file_references(target, &sources);
        assert_eq!(locations, vec![location(&source_uri, 1, 37, 72)]);
    }

    #[test]
    fn will_rename_params_use_old_and_prospective_shadow_uris() {
        let old_source = uri("file:///workspace/Imported.svelte");
        let old_shadow = uri("file:///cache/Imported.svelte.tsx");
        let new_source = uri("file:///workspace/Documentation.svelte");
        let new_shadow = uri("file:///cache/Documentation.svelte.tsx");
        let mappings = [WillRenameMapping {
            old: ShadowUriPair {
                source_uri: &old_source,
                shadow_uri: &old_shadow,
            },
            new: ShadowUriPair {
                source_uri: &new_source,
                shadow_uri: &new_shadow,
            },
        }];
        let mut params = json!({
            "files": [{ "oldUri": old_source.as_str(), "newUri": new_source.as_str() }]
        });
        let mut custom_params =
            json!({ "oldUri": old_source.as_str(), "newUri": new_source.as_str() });

        rewrite_will_rename_params(&mut params, &mappings);
        rewrite_will_rename_params(&mut custom_params, &mappings);

        assert_eq!(params["files"][0]["oldUri"], old_shadow.as_str());
        assert_eq!(params["files"][0]["newUri"], new_shadow.as_str());
        assert_eq!(custom_params["oldUri"], old_shadow.as_str());
        assert_eq!(custom_params["newUri"], new_shadow.as_str());
    }

    #[test]
    fn will_rename_result_rewrites_shadow_documents_and_filters_kit_types() {
        let consumer_source = uri("file:///workspace/Consumer.svelte");
        let consumer_shadow = uri("file:///cache/Consumer.svelte.tsx");
        let imported_source = uri("file:///workspace/Imported.svelte");
        let imported_shadow = uri("file:///cache/Imported.svelte.tsx");
        let renamed_source = uri("file:///workspace/Documentation.svelte");
        let renamed_shadow = uri("file:///cache/Documentation.svelte.tsx");
        let route_source = uri("file:///workspace/sub/+page.svelte");
        let route_shadow = uri("file:///cache/+page.svelte.tsx");
        let kit_types = uri("file:///workspace/.svelte-kit/types/$types.d.ts");
        let mapping = WillRenameMapping {
            old: ShadowUriPair {
                source_uri: &imported_source,
                shadow_uri: &imported_shadow,
            },
            new: ShadowUriPair {
                source_uri: &renamed_source,
                shadow_uri: &renamed_shadow,
            },
        };
        let documents = [
            ShadowUriPair {
                source_uri: &consumer_source,
                shadow_uri: &consumer_shadow,
            },
            ShadowUriPair {
                source_uri: &route_source,
                shadow_uri: &route_shadow,
            },
        ];
        let mut result = json!({
            "changes": {
                (consumer_shadow.as_str()): [{
                    "range": { "start": { "line": 1, "character": 17 }, "end": { "line": 1, "character": 44 } },
                    "newText": "./Documentation.svelte.tsx"
                }],
                (kit_types.as_str()): [{ "range": { "start": { "line": 0, "character": 0 }, "end": { "line": 0, "character": 1 } }, "newText": "x" }]
            },
            "documentChanges": [{
                "textDocument": { "uri": route_shadow.as_str(), "version": null },
                "edits": [
                    { "range": { "start": { "line": 1, "character": 0 }, "end": { "line": 1, "character": 1 } }, "newText": "./$types.js" },
                    { "range": { "start": { "line": 2, "character": 0 }, "end": { "line": 2, "character": 1 } }, "newText": "./Documentation.svelte.js" }
                ]
            }, {
                "textDocument": { "uri": imported_shadow.as_str(), "version": null },
                "edits": [
                    { "range": { "start": { "line": 0, "character": 0 }, "end": { "line": 0, "character": 1 } }, "newText": "old" }
                ]
            }, {
                "textDocument": { "uri": renamed_shadow.as_str(), "version": null },
                "edits": [
                    { "range": { "start": { "line": 0, "character": 0 }, "end": { "line": 0, "character": 1 } }, "newText": "new" },
                    { "range": { "start": { "line": 1, "character": 0 }, "end": { "line": 1, "character": 1 } }, "newText": "newer" }
                ]
            }]
        });

        rewrite_will_rename_result(&mut result, &[mapping], &documents);

        assert!(result["changes"].get(kit_types.as_str()).is_none());
        assert_eq!(
            result["changes"][consumer_source.as_str()][0]["newText"],
            "./Documentation.svelte"
        );
        assert_eq!(
            result["documentChanges"][0]["textDocument"]["uri"],
            route_source.as_str()
        );
        assert_eq!(
            result["documentChanges"][0]["edits"]
                .as_array()
                .unwrap()
                .len(),
            1
        );
        assert_eq!(
            result["documentChanges"][0]["edits"][0]["newText"],
            "./Documentation.svelte"
        );
        assert_eq!(result["documentChanges"].as_array().unwrap().len(), 2);
        assert_eq!(
            result["documentChanges"][1]["textDocument"]["uri"],
            renamed_source.as_str()
        );
        assert_eq!(
            result["documentChanges"][1]["edits"]
                .as_array()
                .unwrap()
                .len(),
            2
        );
    }

    #[test]
    fn code_lenses_drop_zero_ranges_and_preserve_resolve_data() {
        let source_uri = uri("file:///workspace/references.svelte");
        let mut result = json!([
            {
                "range": { "start": { "line": 1, "character": 14 }, "end": { "line": 1, "character": 17 } },
                "data": { "type": "reference", "opaque": [1, 2, 3] }
            },
            {
                "range": { "start": { "line": 4, "character": 2 }, "end": { "line": 4, "character": 2 } },
                "data": { "type": "reference" }
            }
        ]);

        prepare_code_lenses(&mut result, &source_uri);

        assert_eq!(result.as_array().unwrap().len(), 1);
        assert_eq!(result[0]["data"]["uri"], source_uri.as_str());
        assert_eq!(result[0]["data"]["opaque"], json!([1, 2, 3]));
        assert_eq!(code_lens_kind(&result[0]), Some(CodeLensKind::Reference));

        assert_eq!(
            component_reference_code_lens(&source_uri),
            json!({
                "range": {
                    "start": { "line": 0, "character": 0 },
                    "end": { "line": 0, "character": 1 }
                },
                "data": { "kind": "references", "uri": source_uri.as_str() }
            })
        );
    }

    #[test]
    fn code_lens_kind_accepts_tsgo_and_legacy_discriminators() {
        assert_eq!(
            code_lens_kind(&json!({ "data": { "kind": "references" } })),
            Some(CodeLensKind::Reference)
        );
        assert_eq!(
            code_lens_kind(&json!({ "data": { "kind": "implementations" } })),
            Some(CodeLensKind::Implementation)
        );
        assert_eq!(
            code_lens_kind(&json!({ "data": { "type": "reference" } })),
            Some(CodeLensKind::Reference)
        );
        assert_eq!(
            code_lens_kind(&json!({ "data": { "type": "implementation" } })),
            Some(CodeLensKind::Implementation)
        );
        assert_eq!(
            code_lens_kind(&json!({ "data": { "kind": "unknown" } })),
            None
        );
    }

    #[test]
    fn prepare_code_lenses_preserves_tsgo_resolve_data() {
        let source_uri = uri("file:///workspace/references.svelte");
        let mut result = json!([{
            "range": {
                "start": { "line": 1, "character": 14 },
                "end": { "line": 1, "character": 17 }
            },
            "data": {
                "kind": "references",
                "uri": "file:///overlay/references.svelte.ts",
                "opaque": { "future": true }
            }
        }]);

        prepare_code_lenses(&mut result, &source_uri);

        assert_eq!(code_lens_kind(&result[0]), Some(CodeLensKind::Reference));
        assert_eq!(result[0]["data"]["uri"], source_uri.as_str());
        assert_eq!(result[0]["data"]["opaque"], json!({ "future": true }));
        assert_eq!(result[0]["data"]["kind"], "references");
    }

    #[test]
    fn code_lens_commands_match_official_reference_and_implementation_shape() {
        let source_uri = uri("file:///workspace/references.svelte");
        let mut reference_lens = json!({
            "range": { "start": { "line": 1, "character": 14 }, "end": { "line": 1, "character": 17 } },
            "data": { "type": "reference" }
        });
        let references = vec![location(&source_uri, 5, 13, 16)];

        assert!(resolve_code_lens(
            &mut reference_lens,
            CodeLensKind::Reference,
            &source_uri,
            references.clone()
        ));
        assert_eq!(reference_lens["command"]["title"], "1 reference");
        assert_eq!(reference_lens["command"]["command"], "");
        assert_eq!(
            reference_lens["command"]["arguments"],
            json!([
                source_uri.as_str(),
                { "line": 1, "character": 14 },
                references
            ])
        );

        let mut implementation_lens = reference_lens;
        assert!(resolve_code_lens(
            &mut implementation_lens,
            CodeLensKind::Implementation,
            &source_uri,
            Vec::new()
        ));
        assert_eq!(implementation_lens["command"]["title"], "0 implementations");
    }
}
