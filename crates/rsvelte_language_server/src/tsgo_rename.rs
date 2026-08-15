//! Svelte-specific correction around tsgo's prepare-rename and rename LSP responses.
//!
//! tsgo sees the generated `.svelte.tsx` document. The editor sees the
//! original component, and some generated rename locations are not edits at
//! all: they are bridges to another TypeScript symbol which must be queried in
//! a follow-up rename request. This module keeps that distinction explicit and
//! has no transport or server-loop state.

use std::collections::{BTreeMap, BTreeSet};

use lsp_types::{Position, Range, Uri};
use rsvelte_projection::{ByteRange, ProjectionMap};
use serde_json::{Map, Value, json};
use sourcemap::SourceMap;

use crate::context::attribute_context;
use crate::text::LineIndex;

const IGNORE_START: &str = "/*Ωignore_startΩ*/";
const IGNORE_END: &str = "/*Ωignore_endΩ*/";
const STORE_GET: &str = "__sveltets_2_store_get(";
const PROPS_RETURN: &str = "\nreturn { props: {";

/// One source/generated pair needed by the pure rename correction layer.
#[derive(Debug, Clone, Copy)]
pub struct RenameDocument<'a> {
    /// URI exposed to the editor.
    pub source_uri: &'a Uri,
    /// URI opened in tsgo.
    pub shadow_uri: &'a Uri,
    /// Original Svelte source.
    pub source_text: &'a str,
    /// Generated svelte2tsx text.
    pub generated_text: &'a str,
    /// Exact projection mappings for identifiers copied verbatim.
    pub projection_map: &'a ProjectionMap,
    /// Standard source map used when a template identifier lives in a
    /// rewritten rather than byte-exact generated chunk.
    pub source_map: Option<&'a str>,
    /// True when projection is in an error state and rename must not run.
    pub parser_error: bool,
}

/// Why a Svelte rename must not be forwarded to tsgo.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RenameRejection {
    /// svelte2tsx has no reliable generated document in parser-error state.
    ParserError,
    /// The cursor is on a native HTML tag, attribute, or event-handler name.
    NativeHtml,
    /// The source position has no exact generated identifier to query.
    UnmappedPosition,
}

/// Source symbol identified before asking tsgo.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RenameTarget {
    /// Original identifier without the `$` store prefix.
    pub name: String,
    /// Editor range tsgo's prepare response is constrained to.
    pub source_range: Range,
    /// Whether the request began on an auto-subscription `$store` value.
    pub is_store_value: bool,
}

/// Request routing decided from the original Svelte document.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PrepareRenamePlan {
    /// Do not forward the request.
    Reject(RenameRejection),
    /// Ask tsgo at the virtual position.
    Request {
        /// Virtual shadow URI.
        uri: Uri,
        /// UTF-8 position negotiated with tsgo.
        position: Position,
        /// Source symbol facts retained for response correction.
        target: RenameTarget,
    },
}

impl PrepareRenamePlan {
    /// Request details, if the rename is safe to forward.
    #[must_use]
    pub const fn request(&self) -> Option<(&Uri, Position, &RenameTarget)> {
        match self {
            Self::Request {
                uri,
                position,
                target,
            } => Some((uri, *position, target)),
            Self::Reject(_) => None,
        }
    }
}

/// Why another `textDocument/rename` query is necessary.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum RenameFollowupReason {
    /// Base store rename must also query the generated `$store` symbol.
    StoreValue,
    /// `$store` rename must also query the base store symbol.
    StoreBase,
    /// A legacy `export let` local rename must query the public props-object key.
    LegacyPropKey,
    /// A consumer prop rename must query the target component's generated local declaration.
    LegacyPropDeclaration,
}

/// A follow-up tsgo rename request discovered in generated edits.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RenameFollowup {
    /// Virtual document containing the bridge symbol.
    pub uri: Uri,
    /// UTF-8 tsgo position of that symbol.
    pub position: Position,
    /// Name to pass to the follow-up `textDocument/rename` request.
    pub new_name: String,
    /// Semantic reason for the extra query.
    pub reason: RenameFollowupReason,
}

/// Corrected editor edit plus any additional tsgo work required for parity.
#[derive(Debug, Clone, PartialEq)]
pub struct RenameRewrite {
    /// WorkspaceEdit in editor/source coordinates.
    pub edit: Value,
    /// Follow-up rename requests. Their responses should be fed through
    /// [`rewrite_workspace_edit`] with `collect_followups = false` and merged.
    pub followups: Vec<RenameFollowup>,
}

/// Reject unsafe source positions or route a prepare/rename request to tsgo.
#[must_use]
pub fn prepare_rename_plan(
    document: RenameDocument<'_>,
    source_position: Position,
) -> PrepareRenamePlan {
    if document.parser_error {
        return PrepareRenamePlan::Reject(RenameRejection::ParserError);
    }
    let source_index = LineIndex::new(document.source_text);
    let cursor = source_index.offset(document.source_text, source_position);
    if is_native_html_name(document.source_text, cursor) {
        return PrepareRenamePlan::Reject(RenameRejection::NativeHtml);
    }
    let Some((identifier, mut start, end)) = identifier_at(document.source_text, cursor) else {
        return PrepareRenamePlan::Reject(RenameRejection::UnmappedPosition);
    };
    let is_store_value = identifier.starts_with('$') && identifier.len() > 1;
    let name = if is_store_value {
        start += 1;
        &identifier[1..]
    } else {
        identifier
    };
    let Some(generated_offset) =
        exact_source_offset(document.projection_map, start).or_else(|| {
            source_map_source_to_generated(
                document.source_map?,
                document.source_text,
                document.generated_text,
                start,
            )
        })
    else {
        return PrepareRenamePlan::Reject(RenameRejection::UnmappedPosition);
    };
    let generated_position = utf8_position(document.generated_text, generated_offset as usize);
    PrepareRenamePlan::Request {
        uri: document.shadow_uri.clone(),
        position: generated_position,
        target: RenameTarget {
            name: name.to_string(),
            source_range: Range::new(
                source_index.position(document.source_text, start),
                source_index.position(document.source_text, end),
            ),
            is_store_value,
        },
    }
}

/// Map a tsgo prepare-rename result back to the editor.
///
/// Both standard response forms are accepted: a bare `Range` and
/// `{ range, placeholder }`. A `$store` target always exposes only `store`.
#[must_use]
pub fn rewrite_prepare_response(
    plan: &PrepareRenamePlan,
    response: Value,
    documents: &[RenameDocument<'_>],
) -> Option<Value> {
    let (_, _, target) = plan.request()?;
    if response.is_null() {
        return None;
    }
    if target.is_store_value {
        return match response {
            Value::Object(mut object) if object.contains_key("range") => {
                object.insert("range".to_string(), range_value(target.source_range));
                object.insert(
                    "placeholder".to_string(),
                    Value::String(target.name.clone()),
                );
                Some(Value::Object(object))
            }
            _ => Some(range_value(target.source_range)),
        };
    }

    let (range, wrapped) = if let Some(range) = response.get("range") {
        (parse_range(range)?, true)
    } else {
        (parse_range(&response)?, false)
    };
    let (uri, _, _) = plan.request()?;
    let document = document_by_shadow(documents, uri.as_str())?;
    let mapped = map_generated_range(document, range)?;
    if wrapped {
        let mut object = response.as_object()?.clone();
        object.insert("range".to_string(), range_value(mapped));
        Some(Value::Object(object))
    } else {
        Some(range_value(mapped))
    }
}

/// Rewrite one tsgo WorkspaceEdit into original Svelte coordinates.
///
/// Generated edits are inspected for store/prop bridges before they are
/// filtered. `collect_followups` should be true for the primary response and
/// false while processing follow-up responses to prevent cycles.
#[must_use]
pub fn rewrite_workspace_edit(
    plan: &PrepareRenamePlan,
    response: &Value,
    documents: &[RenameDocument<'_>],
    new_name: &str,
    collect_followups: bool,
) -> RenameRewrite {
    let target = plan.request().map(|(_, _, target)| target);
    let mut edits = Vec::new();
    let mut followups = Vec::new();
    visit_workspace_edits(response, |uri, edit| {
        let Some(range) = edit.get("range").and_then(parse_range) else {
            return;
        };
        let new_text = edit
            .get("newText")
            .and_then(Value::as_str)
            .unwrap_or(new_name);
        let Some(document) = document_by_shadow(documents, uri) else {
            edits.push(EditorEdit {
                uri: uri.to_string(),
                range,
                new_text: new_text.to_string(),
            });
            return;
        };
        let start = utf8_offset(document.generated_text, range.start);
        let end = utf8_offset(document.generated_text, range.end).max(start);

        if collect_followups {
            collect_generated_followups(document, start, end, new_name, target, &mut followups);
        }
        if is_generated_span(document.generated_text, start, end)
            || is_wrong_generated_rename(document.generated_text, start)
        {
            return;
        }
        let Some(source_range) = map_generated_offsets(document, start, end) else {
            return;
        };
        let (source_range, replacement) =
            correct_shorthand(document.source_text, source_range, new_text, new_name);
        edits.push(EditorEdit {
            uri: document.source_uri.as_str().to_string(),
            range: source_range,
            new_text: replacement,
        });
    });

    dedupe_followups(&mut followups);
    RenameRewrite {
        edit: workspace_edit(edits),
        followups,
    }
}

/// Merge already-corrected WorkspaceEdits, dropping duplicate text edits.
#[must_use]
pub fn merge_workspace_edits(edits: impl IntoIterator<Item = Value>) -> Value {
    let mut merged = Vec::new();
    for edit in edits {
        visit_workspace_edits(&edit, |uri, value| {
            let Some(range) = value.get("range").and_then(parse_range) else {
                return;
            };
            let Some(new_text) = value.get("newText").and_then(Value::as_str) else {
                return;
            };
            merged.push(EditorEdit {
                uri: uri.to_string(),
                range,
                new_text: new_text.to_string(),
            });
        });
    }
    workspace_edit(merged)
}

#[derive(Debug, Clone)]
struct EditorEdit {
    uri: String,
    range: Range,
    new_text: String,
}

fn collect_generated_followups(
    document: RenameDocument<'_>,
    start: usize,
    end: usize,
    new_name: &str,
    target: Option<&RenameTarget>,
    followups: &mut Vec<RenameFollowup>,
) {
    let generated = document.generated_text;
    let starts_in_generated = is_generated_span(generated, start, end);
    if !starts_in_generated && has_exact_generated_range(document.projection_map, start, end) {
        return;
    }

    if generated[..start].ends_with(STORE_GET) {
        if let Some(dollar) = generated[..start]
            .rfind("let $")
            .map(|offset| offset + "let ".len())
        {
            followups.push(RenameFollowup {
                uri: document.shadow_uri.clone(),
                position: utf8_position(generated, dollar),
                new_name: format!("${new_name}"),
                reason: RenameFollowupReason::StoreValue,
            });
        }
        return;
    }

    if generated[start..].starts_with('$') {
        let tail = &generated[start..];
        if let Some(argument) = tail
            .find(STORE_GET)
            .map(|relative| start + relative + STORE_GET.len())
        {
            followups.push(RenameFollowup {
                uri: document.shadow_uri.clone(),
                position: utf8_position(generated, argument),
                new_name: new_name.to_string(),
                reason: RenameFollowupReason::StoreBase,
            });
            return;
        }
    }

    if is_after_props_return(generated, start) {
        let old_name = generated.get(start..end).unwrap_or_default();
        if let Some(key) = prop_key_before(generated, start) {
            let origin_is_legacy_prop = target.is_some_and(|target| {
                source_line_contains_export_let(
                    document.source_text,
                    target.source_range,
                    &target.name,
                )
            });
            followups.push(RenameFollowup {
                uri: document.shadow_uri.clone(),
                position: utf8_position(generated, key),
                new_name: new_name.to_string(),
                reason: if origin_is_legacy_prop {
                    RenameFollowupReason::LegacyPropKey
                } else {
                    RenameFollowupReason::LegacyPropDeclaration
                },
            });
        } else if let Some(declaration) = find_generated_let(generated, old_name) {
            followups.push(RenameFollowup {
                uri: document.shadow_uri.clone(),
                position: utf8_position(generated, declaration),
                new_name: new_name.to_string(),
                reason: RenameFollowupReason::LegacyPropDeclaration,
            });
        }
    }
}

fn source_line_contains_export_let(source: &str, range: Range, name: &str) -> bool {
    let index = LineIndex::new(source);
    let start = index.offset(source, Position::new(range.start.line, 0));
    let end = source[start..]
        .find(['\n', '\r'])
        .map_or(source.len(), |relative| start + relative);
    let line = &source[start..end];
    let Some(export) = line.find("export") else {
        return false;
    };
    let tail = &line[export + "export".len()..];
    let tail = tail.trim_start();
    let Some(tail) = tail.strip_prefix("let") else {
        return false;
    };
    let tail = tail.trim_start();
    tail.strip_prefix(name).is_some_and(|after| {
        after.is_empty()
            || after.starts_with(|character: char| {
                character.is_whitespace() || matches!(character, ';' | ':' | '/')
            })
    })
}

fn prop_key_before(generated: &str, value_start: usize) -> Option<usize> {
    let colon = generated[..value_start].rfind(':')?;
    let mut key_end = colon;
    while generated
        .as_bytes()
        .get(key_end.wrapping_sub(1))
        .is_some_and(u8::is_ascii_whitespace)
    {
        key_end -= 1;
    }
    let mut key_start = key_end;
    while generated
        .as_bytes()
        .get(key_start.wrapping_sub(1))
        .is_some_and(|byte| is_identifier_byte(*byte))
    {
        key_start -= 1;
    }
    (key_start < key_end).then_some(key_start)
}

fn find_generated_let(generated: &str, name: &str) -> Option<usize> {
    if name.is_empty() {
        return None;
    }
    let needle = format!("let {name}");
    generated
        .match_indices(&needle)
        .find_map(|(start, matched)| {
            let end = start + matched.len();
            generated
                .as_bytes()
                .get(end)
                .is_none_or(|byte| !is_identifier_byte(*byte))
                .then_some(start + "let ".len())
        })
}

fn is_after_props_return(generated: &str, offset: usize) -> bool {
    generated[..offset.min(generated.len())].contains(PROPS_RETURN)
}

fn is_wrong_generated_rename(generated: &str, start: usize) -> bool {
    [
        "__sveltets_2_instanceOf(",
        "__sveltets_1_ensureType(",
        "= __sveltets_2_store_get(",
    ]
    .iter()
    .any(|prefix| generated[..start].ends_with(prefix))
}

fn map_generated_range(document: RenameDocument<'_>, range: Range) -> Option<Range> {
    let start = utf8_offset(document.generated_text, range.start);
    let end = utf8_offset(document.generated_text, range.end).max(start);
    map_generated_offsets(document, start, end)
}

fn map_generated_offsets(document: RenameDocument<'_>, start: usize, end: usize) -> Option<Range> {
    let generated = ByteRange::new(u32::try_from(start).ok()?, u32::try_from(end).ok()?)?;
    if let Some(source) = document
        .projection_map
        .generated_range_to_source(generated)
        .or_else(|| exact_boundary_range(document.projection_map, generated))
    {
        let index = LineIndex::new(document.source_text);
        return Some(Range::new(
            index.position(document.source_text, source.start() as usize),
            index.position(document.source_text, source.end() as usize),
        ));
    }

    let map = SourceMap::from_slice(document.source_map?.as_bytes()).ok()?;
    let generated_index = LineIndex::new(document.generated_text);
    let generated_start = generated_index.position(document.generated_text, start);
    let token = map.lookup_token(generated_start.line, generated_start.character)?;
    token.get_source()?;
    let width = document
        .generated_text
        .get(start..end)?
        .encode_utf16()
        .count();
    let source_start = Position::new(token.get_src_line(), token.get_src_col());
    let source_end = Position::new(
        source_start.line,
        source_start
            .character
            .saturating_add(u32::try_from(width).ok()?),
    );
    Some(Range::new(source_start, source_end))
}

fn has_exact_generated_range(map: &ProjectionMap, start: usize, end: usize) -> bool {
    let Some(range) = u32::try_from(start)
        .ok()
        .zip(u32::try_from(end).ok())
        .and_then(|(start, end)| ByteRange::new(start, end))
    else {
        return false;
    };
    map.generated_range_to_source(range).is_some() || exact_boundary_range(map, range).is_some()
}

fn exact_boundary_range(map: &ProjectionMap, generated: ByteRange) -> Option<ByteRange> {
    let segment = map.segments().iter().find(|segment| {
        generated.start() >= segment.generated.start() && generated.end() <= segment.generated.end()
    })?;
    let start = segment.source.start() + generated.start() - segment.generated.start();
    ByteRange::new(start, start + generated.len())
}

fn exact_source_offset(map: &ProjectionMap, source: usize) -> Option<u32> {
    let source = u32::try_from(source).ok()?;
    map.source_to_generated(source)
        .first()
        .copied()
        .or_else(|| {
            map.segments()
                .iter()
                .find(|segment| segment.source.end() == source)
                .map(|segment| segment.generated.end())
        })
}

fn source_map_source_to_generated(
    raw_map: &str,
    source_text: &str,
    generated_text: &str,
    source_offset: usize,
) -> Option<u32> {
    let source_position = LineIndex::new(source_text).position(source_text, source_offset);
    let map = SourceMap::from_slice(raw_map.as_bytes()).ok()?;
    let token = map
        .tokens()
        .filter(|token| {
            token.get_source().is_some() && token.get_src_line() == source_position.line
        })
        .min_by_key(|token| {
            (
                token.get_src_col().abs_diff(source_position.character),
                token.get_dst_line(),
                token.get_dst_col(),
            )
        })?;
    let generated_index = LineIndex::new(generated_text);
    let offset = generated_index.offset(
        generated_text,
        Position::new(token.get_dst_line(), token.get_dst_col()),
    );
    u32::try_from(offset).ok()
}

fn correct_shorthand(
    source: &str,
    range: Range,
    raw_replacement: &str,
    _requested_name: &str,
) -> (Range, String) {
    let index = LineIndex::new(source);
    let start = index.offset(source, range.start);
    let end = index.offset(source, range.end).max(start);
    let Some((public, value)) = split_rename_pair(raw_replacement) else {
        return (range, raw_replacement.to_string());
    };

    let directive = source[..start]
        .strip_suffix("bind:")
        .or_else(|| source[..start].strip_suffix("let:"));
    if directive.is_some() {
        return (range, format!("{public}={{{value}}}"));
    }

    if source.as_bytes().get(start.wrapping_sub(1)) == Some(&b'{')
        && source.as_bytes().get(end) == Some(&b'}')
    {
        let expanded = Range::new(
            index.position(source, start - 1),
            index.position(source, end + 1),
        );
        return (expanded, format!("{public}={{{value}}}"));
    }

    // A key/value pair outside Svelte shorthand syntax is already a complete
    // TypeScript replacement and must retain tsgo's prefix/suffix semantics.
    (range, raw_replacement.to_string())
}

fn split_rename_pair(replacement: &str) -> Option<(&str, &str)> {
    let (public, value) = replacement.split_once(':')?;
    let public = public.trim();
    let value = value.trim();
    (!public.is_empty() && !value.is_empty()).then_some((public, value))
}

fn is_native_html_name(source: &str, offset: usize) -> bool {
    if let Some(attribute) = attribute_context(source, offset)
        && !attribute.in_value
        && !is_component_tag(attribute.element_tag)
    {
        return true;
    }
    let before = &source[..offset.min(source.len())];
    let Some(open) = before.rfind('<') else {
        return false;
    };
    if source[open..offset].contains('>') {
        return false;
    }
    let mut start = open + 1;
    if source.as_bytes().get(start) == Some(&b'/') {
        start += 1;
    }
    let mut end = start;
    while source
        .as_bytes()
        .get(end)
        .is_some_and(|byte| is_tag_name_byte(*byte))
    {
        end += 1;
    }
    (start..=end).contains(&offset)
        && source
            .get(start..end)
            .is_some_and(|tag| !is_component_tag(tag))
}

fn is_component_tag(tag: &str) -> bool {
    tag.starts_with(|character: char| character.is_ascii_uppercase())
        || tag.starts_with("svelte:component")
}

fn identifier_at(source: &str, cursor: usize) -> Option<(&str, usize, usize)> {
    let bytes = source.as_bytes();
    let mut at = cursor.min(bytes.len());
    if at == bytes.len() || !bytes.get(at).is_some_and(|byte| is_identifier_byte(*byte)) {
        at = at.checked_sub(1)?;
    }
    if !bytes.get(at).is_some_and(|byte| is_identifier_byte(*byte)) {
        return None;
    }
    let mut start = at;
    while bytes
        .get(start.wrapping_sub(1))
        .is_some_and(|byte| is_identifier_byte(*byte))
    {
        start -= 1;
    }
    let mut end = at + 1;
    while bytes.get(end).is_some_and(|byte| is_identifier_byte(*byte)) {
        end += 1;
    }
    Some((&source[start..end], start, end))
}

const fn is_identifier_byte(byte: u8) -> bool {
    byte.is_ascii_alphanumeric() || matches!(byte, b'_' | b'$') || byte >= 0x80
}

const fn is_tag_name_byte(byte: u8) -> bool {
    byte.is_ascii_alphanumeric() || matches!(byte, b':' | b'-' | b'_' | b'.')
}

fn is_generated_span(text: &str, start: usize, end: usize) -> bool {
    let start = start.min(text.len());
    let end = end.min(text.len());
    let last_start = text[..start].rfind(IGNORE_START);
    let last_end = text[..start].rfind(IGNORE_END);
    let next_end = text[end..].find(IGNORE_END).map(|at| end + at);
    matches!((last_start, next_end), (Some(open), Some(close)) if last_end.is_none_or(|end| open > end) && open < close)
}

fn document_by_shadow<'a>(
    documents: &'a [RenameDocument<'a>],
    uri: &str,
) -> Option<RenameDocument<'a>> {
    documents
        .iter()
        .find(|document| document.shadow_uri.as_str() == uri)
        .copied()
}

fn visit_workspace_edits(edit: &Value, mut visit: impl FnMut(&str, &Value)) {
    if let Some(changes) = edit.get("changes").and_then(Value::as_object) {
        for (uri, edits) in changes {
            if let Some(edits) = edits.as_array() {
                for edit in edits {
                    visit(uri, edit);
                }
            }
        }
    }
    if let Some(changes) = edit.get("documentChanges").and_then(Value::as_array) {
        for change in changes {
            let Some(uri) = change.pointer("/textDocument/uri").and_then(Value::as_str) else {
                continue;
            };
            if let Some(edits) = change.get("edits").and_then(Value::as_array) {
                for edit in edits {
                    visit(uri, edit);
                }
            }
        }
    }
}

fn workspace_edit(edits: Vec<EditorEdit>) -> Value {
    let mut seen = BTreeSet::new();
    let mut changes: BTreeMap<String, Vec<Value>> = BTreeMap::new();
    for edit in edits {
        let key = (
            edit.uri.clone(),
            edit.range.start.line,
            edit.range.start.character,
            edit.range.end.line,
            edit.range.end.character,
            edit.new_text.clone(),
        );
        if !seen.insert(key) {
            continue;
        }
        changes.entry(edit.uri).or_default().push(json!({
            "range": range_value(edit.range),
            "newText": edit.new_text
        }));
    }
    let changes = changes
        .into_iter()
        .map(|(uri, edits)| (uri, Value::Array(edits)))
        .collect::<Map<_, _>>();
    json!({ "changes": Value::Object(changes) })
}

fn dedupe_followups(followups: &mut Vec<RenameFollowup>) {
    let mut seen = BTreeSet::new();
    followups.retain(|followup| {
        seen.insert((
            followup.uri.as_str().to_string(),
            followup.position.line,
            followup.position.character,
            followup.new_name.clone(),
            followup.reason,
        ))
    });
}

fn parse_range(value: &Value) -> Option<Range> {
    Some(Range::new(
        Position::new(
            u32::try_from(value.pointer("/start/line")?.as_u64()?).ok()?,
            u32::try_from(value.pointer("/start/character")?.as_u64()?).ok()?,
        ),
        Position::new(
            u32::try_from(value.pointer("/end/line")?.as_u64()?).ok()?,
            u32::try_from(value.pointer("/end/character")?.as_u64()?).ok()?,
        ),
    ))
}

fn range_value(range: Range) -> Value {
    json!({
        "start": { "line": range.start.line, "character": range.start.character },
        "end": { "line": range.end.line, "character": range.end.character }
    })
}

fn utf8_position(text: &str, offset: usize) -> Position {
    let offset = floor_char_boundary(text, offset.min(text.len()));
    let before = &text[..offset];
    let line = before.bytes().filter(|byte| *byte == b'\n').count();
    let line_start = before.rfind('\n').map_or(0, |at| at + 1);
    Position::new(
        u32::try_from(line).unwrap_or(u32::MAX),
        u32::try_from(offset - line_start).unwrap_or(u32::MAX),
    )
}

fn utf8_offset(text: &str, position: Position) -> usize {
    let mut line = 0u32;
    let mut start = 0usize;
    for (offset, byte) in text.bytes().enumerate() {
        if line == position.line {
            break;
        }
        if byte == b'\n' {
            line += 1;
            start = offset + 1;
        }
    }
    if line != position.line {
        return text.len();
    }
    let end = text[start..]
        .find('\n')
        .map_or(text.len(), |relative| start + relative);
    floor_char_boundary(
        text,
        start.saturating_add(position.character as usize).min(end),
    )
}

fn floor_char_boundary(text: &str, mut offset: usize) -> usize {
    while offset > 0 && !text.is_char_boundary(offset) {
        offset -= 1;
    }
    offset
}

#[cfg(test)]
mod tests {
    use super::*;
    use rsvelte_projection::{ProjectionArtifact, ProjectionEngine, Svelte2TsxOptions};
    use std::str::FromStr;

    fn uri(value: &str) -> Uri {
        Uri::from_str(value).unwrap()
    }

    fn project(source: &str) -> ProjectionArtifact {
        ProjectionEngine::new()
            .project(
                source,
                Svelte2TsxOptions {
                    filename: "Input.svelte".to_string(),
                    is_ts_file: source.contains("lang=\"ts\""),
                    emit_jsdoc: true,
                    ..Svelte2TsxOptions::default()
                },
            )
            .unwrap()
    }

    fn view<'a>(
        source_uri: &'a Uri,
        shadow_uri: &'a Uri,
        source: &'a str,
        artifact: &'a ProjectionArtifact,
    ) -> RenameDocument<'a> {
        RenameDocument {
            source_uri,
            shadow_uri,
            source_text: source,
            generated_text: &artifact.code,
            projection_map: artifact.exact_mappings.as_ref().unwrap(),
            source_map: artifact.source_map.as_deref(),
            parser_error: false,
        }
    }

    fn edit(uri: &Uri, text: &str, start: Position, end: Position) -> Value {
        json!({
            "changes": {
                uri.as_str(): [{
                    "range": range_value(Range::new(start, end)),
                    "newText": text
                }]
            }
        })
    }

    #[test]
    fn parser_errors_and_native_html_names_are_rejected() {
        let source_uri = uri("file:///Input.svelte");
        let shadow_uri = uri("file:///cache/Input.svelte.tsx");
        let source = "<div class={value}></div><Component prop={value} />";
        let artifact = project(source);
        let mut document = view(&source_uri, &shadow_uri, source, &artifact);
        document.parser_error = true;
        assert_eq!(
            prepare_rename_plan(document, Position::new(0, 1)),
            PrepareRenamePlan::Reject(RenameRejection::ParserError)
        );

        document.parser_error = false;
        assert_eq!(
            prepare_rename_plan(document, Position::new(0, 1)),
            PrepareRenamePlan::Reject(RenameRejection::NativeHtml)
        );
        assert_eq!(
            prepare_rename_plan(document, Position::new(0, 6)),
            PrepareRenamePlan::Reject(RenameRejection::NativeHtml)
        );
        let component = prepare_rename_plan(document, Position::new(0, 26));
        assert!(
            matches!(component, PrepareRenamePlan::Request { .. }),
            "{component:?}"
        );
    }

    #[test]
    fn store_prepare_range_excludes_the_dollar() {
        let source_uri = uri("file:///Input.svelte");
        let shadow_uri = uri("file:///cache/Input.svelte.tsx");
        let source = "<script>let store; $store;</script>";
        let artifact = project(source);
        let document = view(&source_uri, &shadow_uri, source, &artifact);
        let offset = source.find("$store").unwrap() + 2;
        let position = LineIndex::new(source).position(source, offset);
        let plan = prepare_rename_plan(document, position);
        let (_, _, target) = plan.request().unwrap();
        assert!(target.is_store_value);
        assert_eq!(target.name, "store");
        assert_eq!(
            &source[LineIndex::new(source).offset(source, target.source_range.start)
                ..LineIndex::new(source).offset(source, target.source_range.end)],
            "store"
        );
        assert_eq!(
            rewrite_prepare_response(&plan, json!(null), &[document]),
            None
        );
        assert_eq!(
            rewrite_prepare_response(
                &plan,
                json!({"start":{"line":0,"character":0},"end":{"line":0,"character":1}}),
                &[document]
            ),
            Some(range_value(target.source_range))
        );
    }

    #[test]
    fn generated_store_edit_becomes_a_followup_before_filtering() {
        let source_uri = uri("file:///Input.svelte");
        let shadow_uri = uri("file:///cache/Input.svelte.tsx");
        let source = "<script>let store; $store;</script>";
        let artifact = project(source);
        let document = view(&source_uri, &shadow_uri, source, &artifact);
        let base = artifact.code.find(&format!("{STORE_GET}store")).unwrap() + STORE_GET.len();
        let response = edit(
            &shadow_uri,
            "renamed",
            utf8_position(&artifact.code, base),
            utf8_position(&artifact.code, base + "store".len()),
        );
        let source_position =
            LineIndex::new(source).position(source, source.find("store").unwrap());
        let plan = prepare_rename_plan(document, source_position);
        let rewritten = rewrite_workspace_edit(&plan, &response, &[document], "renamed", true);
        assert_eq!(rewritten.edit, json!({"changes": {}}));
        assert_eq!(rewritten.followups.len(), 1);
        assert_eq!(
            rewritten.followups[0].reason,
            RenameFollowupReason::StoreValue
        );
        assert_eq!(rewritten.followups[0].new_name, "$renamed");

        let dollar = artifact.code[..base].rfind("let $").unwrap() + "let ".len();
        let dollar_response = edit(
            &shadow_uri,
            "$renamed",
            utf8_position(&artifact.code, dollar),
            utf8_position(&artifact.code, dollar + "$store".len()),
        );
        let dollar_source = source.find("$store").unwrap() + 1;
        let dollar_position = LineIndex::new(source).position(source, dollar_source);
        let dollar_plan = prepare_rename_plan(document, dollar_position);
        let dollar_rewritten =
            rewrite_workspace_edit(&dollar_plan, &dollar_response, &[document], "renamed", true);
        assert_eq!(dollar_rewritten.followups.len(), 1);
        assert_eq!(
            dollar_rewritten.followups[0].reason,
            RenameFollowupReason::StoreBase
        );
        assert_eq!(dollar_rewritten.followups[0].new_name, "renamed");
    }

    #[test]
    fn generated_prop_object_edit_becomes_an_explicit_followup() {
        let source_uri = uri("file:///Input.svelte");
        let shadow_uri = uri("file:///cache/Input.svelte.tsx");
        let source = "<script>export let prop;</script>{prop}";
        let artifact = project(source);
        let document = view(&source_uri, &shadow_uri, source, &artifact);
        let props = artifact.code.find(PROPS_RETURN).unwrap();
        let value = artifact.code[props..].find("prop: prop").unwrap() + props + "prop: ".len();
        let response = edit(
            &shadow_uri,
            "next",
            utf8_position(&artifact.code, value),
            utf8_position(&artifact.code, value + "prop".len()),
        );
        let position = LineIndex::new(source).position(source, source.find("prop").unwrap());
        let plan = prepare_rename_plan(document, position);
        let rewritten = rewrite_workspace_edit(&plan, &response, &[document], "next", true);
        assert_eq!(rewritten.followups.len(), 1);
        assert_eq!(
            rewritten.followups[0].reason,
            RenameFollowupReason::LegacyPropKey
        );
    }

    #[test]
    fn bind_prop_and_slot_shorthands_preserve_key_value_meaning() {
        let source = "<Child bind:foo {foo} let:slot>{slot}</Child>";
        let index = LineIndex::new(source);
        let range = |needle: &str, from: usize| {
            let start = source[from..].find(needle).unwrap() + from;
            Range::new(
                index.position(source, start),
                index.position(source, start + needle.len()),
            )
        };

        let bind = range("foo", 0);
        assert_eq!(
            correct_shorthand(source, bind, "foo: renamed", "renamed"),
            (bind, "foo={renamed}".to_string())
        );
        let attr = range("foo", source.find("{foo}").unwrap());
        let (expanded, replacement) = correct_shorthand(source, attr, "renamed: foo", "renamed");
        assert_eq!(
            &source[index.offset(source, expanded.start)..index.offset(source, expanded.end)],
            "{foo}"
        );
        assert_eq!(replacement, "renamed={foo}");
        let slot = range("slot", source.find("let:").unwrap());
        assert_eq!(
            correct_shorthand(source, slot, "slot: renamed", "renamed"),
            (slot, "slot={renamed}".to_string())
        );
    }

    #[test]
    fn generated_marker_edits_are_removed_and_source_edits_merge_once() {
        let source_uri = uri("file:///Input.svelte");
        let shadow_uri = uri("file:///cache/Input.svelte.tsx");
        let source = "<script>export let value;</script>{value}";
        let artifact = project(source);
        let document = view(&source_uri, &shadow_uri, source, &artifact);
        let generated = artifact.code.find(IGNORE_START).unwrap() + IGNORE_START.len();
        let response = edit(
            &shadow_uri,
            "next",
            utf8_position(&artifact.code, generated),
            utf8_position(&artifact.code, generated + 1),
        );
        let position = LineIndex::new(source).position(source, source.find("value").unwrap());
        let plan = prepare_rename_plan(document, position);
        let rewritten = rewrite_workspace_edit(&plan, &response, &[document], "next", false);
        assert_eq!(rewritten.edit, json!({"changes": {}}));

        let range = Range::new(Position::new(0, 0), Position::new(0, 1));
        let plain = edit(&source_uri, "next", range.start, range.end);
        assert_eq!(
            merge_workspace_edits([plain.clone(), plain]),
            json!({"changes": {source_uri.as_str(): [{"range": range_value(range), "newText": "next"}]}})
        );
    }
}
