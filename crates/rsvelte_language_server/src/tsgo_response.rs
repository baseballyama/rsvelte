//! Position and URI translation at the tsgo protocol boundary.

use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::str::FromStr;
use std::sync::Arc;

use lsp_types::{Position, Range, Uri};
use serde_json::{Map, Value};

use crate::text::LineIndex;
use crate::tsgo_overlay::TsgoOverlay;
use crate::uri::uri_to_path;

/// The Svelte document associated with a request.
///
/// Responses such as hover and document highlights contain ranges but no URI,
/// so the server retains this value alongside the forwarded request id.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct RequestDocumentContext {
    source_uri: Uri,
    shadow_uri: Uri,
    source_path: PathBuf,
    shadow_path: PathBuf,
    plain_text: Option<Arc<str>>,
}

#[derive(Clone, Debug)]
struct UriAlias {
    source_uri: Uri,
    shadow_uri: Uri,
    projection: RequestDocumentContext,
}

impl RequestDocumentContext {
    #[must_use]
    pub fn source_uri(&self) -> &Uri {
        &self.source_uri
    }

    #[must_use]
    pub fn shadow_uri(&self) -> &Uri {
        &self.shadow_uri
    }
}

/// Translates JSON protocol values between the editor and the tsgo child.
pub struct TsgoResponseMapper<'a> {
    overlays: &'a [TsgoOverlay],
    default_document: Option<RequestDocumentContext>,
    aliases: Vec<UriAlias>,
}

impl<'a> TsgoResponseMapper<'a> {
    #[must_use]
    pub const fn new(overlay: &'a TsgoOverlay) -> Self {
        Self {
            overlays: std::slice::from_ref(overlay),
            default_document: None,
            aliases: Vec::new(),
        }
    }

    /// Construct a mapper for responses which may cross workspace roots.
    #[must_use]
    pub const fn for_overlays(overlays: &'a [TsgoOverlay]) -> Self {
        Self {
            overlays,
            default_document: None,
            aliases: Vec::new(),
        }
    }

    /// Construct a mapper whose URI-less ranges belong to `document`.
    #[must_use]
    pub fn with_default_document(
        overlay: &'a TsgoOverlay,
        document: Option<RequestDocumentContext>,
    ) -> Self {
        Self {
            overlays: std::slice::from_ref(overlay),
            default_document: document,
            aliases: Vec::new(),
        }
    }

    /// Construct a cross-workspace mapper with a URI-less response context.
    #[must_use]
    pub const fn for_overlays_with_default_document(
        overlays: &'a [TsgoOverlay],
        document: Option<RequestDocumentContext>,
    ) -> Self {
        Self {
            overlays,
            default_document: document,
            aliases: Vec::new(),
        }
    }

    /// Capture the default document before the request URI is rewritten.
    #[must_use]
    pub fn for_request(overlay: &'a TsgoOverlay, params: &Value) -> Self {
        let overlays = std::slice::from_ref(overlay);
        let default_document =
            find_request_uri(params).and_then(|uri| document_context_for_uri_in(overlays, uri));
        Self {
            overlays,
            default_document,
            aliases: Vec::new(),
        }
    }

    /// Capture request context while allowing cross-workspace result URIs.
    #[must_use]
    pub fn for_overlays_request(overlays: &'a [TsgoOverlay], params: &Value) -> Self {
        let default_document =
            find_request_uri(params).and_then(|uri| document_context_for_uri_in(overlays, uri));
        Self {
            overlays,
            default_document,
            aliases: Vec::new(),
        }
    }

    /// Resolve a source or shadow URI into a retainable request context.
    #[must_use]
    pub fn document_context(&self, uri: &Uri) -> Option<RequestDocumentContext> {
        self.context_for_uri(uri.as_str())
    }

    #[must_use]
    pub fn default_document(&self) -> Option<&RequestDocumentContext> {
        self.default_document.as_ref()
    }

    /// Treat a prospective shadow URI as another name for an existing
    /// projection while exposing its corresponding prospective source URI.
    ///
    /// This is used by `workspace/willRenameFiles`: tsgo computes ranges in
    /// the old document but keys edits by the not-yet-open new shadow URI.
    /// Registration fails when either prospective URI already has a real
    /// overlay route, or when `projection_uri` has no readable mapping.
    pub fn add_uri_alias(
        &mut self,
        source_uri: Uri,
        shadow_uri: Uri,
        projection_uri: &Uri,
    ) -> bool {
        if source_uri == shadow_uri
            || document_context_for_uri_in(self.overlays, source_uri.as_str()).is_some()
            || document_context_for_uri_in(self.overlays, shadow_uri.as_str()).is_some()
            || self.aliases.iter().any(|alias| {
                alias.source_uri == source_uri
                    || alias.shadow_uri == source_uri
                    || alias.source_uri == shadow_uri
                    || alias.shadow_uri == shadow_uri
            })
        {
            return false;
        }
        let Some(projection) = self.context_for_uri(projection_uri.as_str()) else {
            return false;
        };
        self.aliases.push(UriAlias {
            source_uri,
            shadow_uri,
            projection,
        });
        true
    }

    /// Map editor-facing request params from source UTF-16 to shadow UTF-8.
    ///
    /// `false` means a required source span has no shadow mapping and the
    /// request should not be forwarded.
    pub fn map_request(&self, method: &str, params: &mut Value) -> bool {
        self.map_transactional(method, params, Direction::SourceToShadow)
    }

    /// Map a tsgo result from shadow UTF-8 back to source UTF-16.
    ///
    /// A root result whose required span is generated becomes `null`. Invalid
    /// elements inside arrays are removed without discarding mapped siblings.
    pub fn map_response(&self, method: &str, result: &mut Value) -> bool {
        if is_semantic_tokens_method(method) {
            let mapped = self.map_semantic_tokens(result);
            if !mapped {
                *result = Value::Null;
            }
            return mapped;
        }

        let mut mapped = result.clone();
        if self.map_value(
            &mut mapped,
            Direction::ShadowToSource,
            self.default_document.as_ref(),
        ) {
            *result = mapped;
            true
        } else {
            *result = Value::Null;
            false
        }
    }

    /// Map child requests and notifications such as `workspace/applyEdit` and
    /// pull/publish diagnostics to editor coordinates.
    pub fn map_child_params(&self, method: &str, params: &mut Value) -> bool {
        if is_semantic_tokens_method(method) {
            return self.map_response(method, params);
        }
        self.map_transactional(method, params, Direction::ShadowToSource)
    }

    fn map_transactional(&self, _method: &str, value: &mut Value, direction: Direction) -> bool {
        let mut mapped = value.clone();
        if !self.map_value(&mut mapped, direction, self.default_document.as_ref()) {
            return false;
        }
        *value = mapped;
        true
    }

    fn map_value(
        &self,
        value: &mut Value,
        direction: Direction,
        inherited: Option<&RequestDocumentContext>,
    ) -> bool {
        if is_range(value) {
            return self.map_range_value(value, direction, inherited);
        }
        if is_position(value) {
            return self.map_position_value(value, direction, inherited);
        }

        match value {
            Value::Array(items) => {
                let mut mapped = Vec::with_capacity(items.len());
                for mut item in std::mem::take(items) {
                    if self.map_value(&mut item, direction, inherited) {
                        mapped.push(item);
                    }
                }
                *items = mapped;
                true
            }
            Value::Object(object) => self.map_object(object, direction, inherited),
            _ => true,
        }
    }

    fn map_object(
        &self,
        object: &mut Map<String, Value>,
        direction: Direction,
        inherited: Option<&RequestDocumentContext>,
    ) -> bool {
        let own_context = self.object_document_context(object);
        let local_context = own_context.as_ref().or(inherited);
        let target_context = object
            .get("targetUri")
            .and_then(Value::as_str)
            .and_then(|uri| self.context_for_uri(uri));
        let call_from_context = object
            .get("from")
            .and_then(Value::as_object)
            .and_then(|from| self.object_document_context(from));

        if !self.map_folding_range(object, direction, local_context) {
            return false;
        }

        for key in URI_FIELDS {
            if let Some(uri) = object.get_mut(*key) {
                self.map_uri_value(uri, direction);
            }
        }

        for key in URI_KEYED_MAPS {
            if let Some(value) = object.get_mut(*key)
                && !self.map_uri_keyed_map(value, direction, local_context)
            {
                return false;
            }
        }

        let keys = object.keys().cloned().collect::<Vec<_>>();
        for key in keys {
            if URI_FIELDS.contains(&key.as_str())
                || URI_KEYED_MAPS.contains(&key.as_str())
                || key == "data"
                || FOLDING_FIELDS.contains(&key.as_str())
            {
                continue;
            }

            let context = match key.as_str() {
                "originSelectionRange" => inherited,
                "targetRange" | "targetSelectionRange" => target_context.as_ref().or(local_context),
                "fromRanges" => call_from_context.as_ref().or(local_context),
                _ => local_context,
            };
            let Some(child) = object.get_mut(&key) else {
                continue;
            };

            let keep = if is_range_field(&key) && is_range(child) {
                self.map_range_value(child, direction, context)
            } else if key == "position" && is_position(child) {
                self.map_position_value(child, direction, context)
            } else {
                self.map_value(child, direction, context)
            };
            if !keep {
                return false;
            }
        }
        true
    }

    fn map_uri_keyed_map(
        &self,
        value: &mut Value,
        direction: Direction,
        inherited: Option<&RequestDocumentContext>,
    ) -> bool {
        let Some(entries) = value.as_object_mut() else {
            return true;
        };
        let mut mapped = BTreeMap::<String, Value>::new();
        for (uri, mut child) in std::mem::take(entries) {
            let context = self.context_for_uri(&uri);
            if !self.map_value(&mut child, direction, context.as_ref().or(inherited)) {
                continue;
            }
            let mapped_uri = self.mapped_uri_string(&uri, direction);
            if let Some(existing) = mapped.get_mut(&mapped_uri)
                && let (Some(existing), Some(child)) =
                    (existing.as_array_mut(), child.as_array_mut())
            {
                existing.append(child);
            } else {
                mapped.insert(mapped_uri, child);
            }
        }
        entries.extend(mapped);
        true
    }

    fn map_folding_range(
        &self,
        object: &mut Map<String, Value>,
        direction: Direction,
        context: Option<&RequestDocumentContext>,
    ) -> bool {
        let Some(start_line) = object.get("startLine").and_then(json_u32) else {
            return true;
        };
        let Some(end_line) = object.get("endLine").and_then(json_u32) else {
            return true;
        };
        let start_character = object.get("startCharacter").and_then(json_u32).unwrap_or(0);
        let end_character = object.get("endCharacter").and_then(json_u32).unwrap_or(0);
        let Some(start) = self.map_position(
            Position::new(start_line, start_character),
            direction,
            context,
        ) else {
            return false;
        };
        let Some(end) =
            self.map_position(Position::new(end_line, end_character), direction, context)
        else {
            return false;
        };
        if matches!(direction, Direction::ShadowToSource)
            && let Some(context) = context
            && context.plain_text.is_none()
            && !self.folding_range_is_one_to_one(
                context,
                Range::new(
                    Position::new(start_line, start_character),
                    Position::new(end_line, end_character),
                ),
                Range::new(start, end),
            )
        {
            return false;
        }
        object.insert("startLine".to_string(), Value::from(start.line));
        object.insert("endLine".to_string(), Value::from(end.line));
        if object.contains_key("startCharacter") {
            object.insert("startCharacter".to_string(), Value::from(start.character));
        }
        if object.contains_key("endCharacter") {
            object.insert("endCharacter".to_string(), Value::from(end.character));
        }
        true
    }

    /// `FoldingRangeProvider.mapToOriginalRange` (`:64-97`): a span whose mapped
    /// start is inside a `<script>` is kept, and one in the template survives
    /// only when the source and generated text are the same string. Without it
    /// every JSX node the shadow builds for the template folds twice.
    fn folding_range_is_one_to_one(
        &self,
        context: &RequestDocumentContext,
        shadow: Range,
        source: Range,
    ) -> bool {
        let Some(overlay) = self.overlay_for_context(context) else {
            return true;
        };
        let Some(source_text) = overlay.source_text(&context.source_path) else {
            return true;
        };
        let Some(shadow_text) = overlay
            .shadow_for_source(&context.source_path)
            .map(|document| document.text.as_str())
        else {
            return true;
        };
        let source_index = LineIndex::new(source_text);
        let start = source_index.offset(source_text, source.start);
        if crate::context::EmbeddedRegions::new(source_text).in_script(start) {
            return true;
        }
        let end = source_index.offset(source_text, source.end);
        let Some(original) = source_text.get(start..end) else {
            return true;
        };
        if original.is_empty() {
            return false;
        }
        let shadow_index = LineIndex::new(shadow_text);
        let generated = shadow_text.get(
            shadow_index.offset(shadow_text, shadow.start)
                ..shadow_index.offset(shadow_text, shadow.end),
        );
        generated.is_some_and(|generated| original.trim() == generated.trim())
    }

    fn map_uri_value(&self, value: &mut Value, direction: Direction) {
        let Some(uri) = value.as_str() else {
            return;
        };
        *value = Value::String(self.mapped_uri_string(uri, direction));
    }

    fn mapped_uri_string(&self, uri: &str, direction: Direction) -> String {
        if let Some(alias) = self.alias_for_uri(uri) {
            return match direction {
                Direction::SourceToShadow => alias.shadow_uri.as_str().to_string(),
                Direction::ShadowToSource => alias.source_uri.as_str().to_string(),
            };
        }
        let Some(context) = document_context_for_uri_in(self.overlays, uri) else {
            return uri.to_string();
        };
        match direction {
            Direction::SourceToShadow => context.shadow_uri.as_str().to_string(),
            Direction::ShadowToSource => context.source_uri.as_str().to_string(),
        }
    }

    fn map_position_value(
        &self,
        value: &mut Value,
        direction: Direction,
        context: Option<&RequestDocumentContext>,
    ) -> bool {
        let Some(position) = parse_position(value) else {
            return true;
        };
        let Some(position) = self.map_position(position, direction, context) else {
            return false;
        };
        write_position(value, position);
        true
    }

    fn map_range_value(
        &self,
        value: &mut Value,
        direction: Direction,
        context: Option<&RequestDocumentContext>,
    ) -> bool {
        let Some(range) = parse_range(value) else {
            return true;
        };
        let Some(range) = self.map_range(range, direction, context) else {
            return false;
        };
        write_range(value, range);
        true
    }

    fn map_position(
        &self,
        position: Position,
        direction: Direction,
        context: Option<&RequestDocumentContext>,
    ) -> Option<Position> {
        let Some(context) = context else {
            return Some(position);
        };
        if let Some(text) = &context.plain_text {
            return Some(match direction {
                Direction::SourceToShadow => plain_source_to_tsgo(text, position),
                Direction::ShadowToSource => plain_tsgo_to_source(text, position),
            });
        }
        let overlay = self.overlay_for_context(context)?;
        match direction {
            Direction::SourceToShadow => {
                let mapped = overlay.map_source_position(&context.source_path, position)?;
                (!overlay.is_generated_position(&context.shadow_path, mapped)).then_some(mapped)
            }
            Direction::ShadowToSource => {
                overlay.map_generated_position(&context.shadow_path, position)
            }
        }
    }

    fn map_range(
        &self,
        range: Range,
        direction: Direction,
        context: Option<&RequestDocumentContext>,
    ) -> Option<Range> {
        let Some(context) = context else {
            return Some(range);
        };
        if let Some(text) = &context.plain_text {
            return Some(match direction {
                Direction::SourceToShadow => Range::new(
                    plain_source_to_tsgo(text, range.start),
                    plain_source_to_tsgo(text, range.end),
                ),
                Direction::ShadowToSource => Range::new(
                    plain_tsgo_to_source(text, range.start),
                    plain_tsgo_to_source(text, range.end),
                ),
            });
        }
        let overlay = self.overlay_for_context(context)?;
        match direction {
            Direction::SourceToShadow => {
                let mapped = overlay.map_source_range(&context.source_path, range)?;
                (!overlay.is_generated_range(&context.shadow_path, mapped)).then_some(mapped)
            }
            Direction::ShadowToSource => overlay.map_generated_range(&context.shadow_path, range),
        }
    }

    fn map_semantic_tokens(&self, result: &mut Value) -> bool {
        let Some(context) = self.default_document.as_ref() else {
            return true;
        };
        let Some(data) = result.get_mut("data") else {
            return true;
        };
        let Some(data) = data.as_array_mut() else {
            return false;
        };
        if data.len() % 5 != 0 {
            return false;
        }
        let input = std::mem::take(data);

        let mut line = 0u32;
        let mut character = 0u32;
        let mut tokens = Vec::with_capacity(input.len() / 5);
        for encoded in input.chunks_exact(5) {
            let Some(delta_line) = json_u32(&encoded[0]) else {
                return false;
            };
            let Some(delta_start) = json_u32(&encoded[1]) else {
                return false;
            };
            let Some(length) = json_u32(&encoded[2]) else {
                return false;
            };
            let Some(token_type) = json_u32(&encoded[3]) else {
                return false;
            };
            let Some(modifiers) = json_u32(&encoded[4]) else {
                return false;
            };
            let Some(next_line) = line.checked_add(delta_line) else {
                return false;
            };
            character = if delta_line == 0 {
                let Some(next) = character.checked_add(delta_start) else {
                    return false;
                };
                next
            } else {
                delta_start
            };
            line = next_line;

            let Some(end_character) = character.checked_add(length) else {
                return false;
            };
            let generated = Range::new(
                Position::new(line, character),
                Position::new(line, end_character),
            );
            let Some(source) = self.map_range(generated, Direction::ShadowToSource, Some(context))
            else {
                continue;
            };
            if source.start.line != source.end.line
                || source.start.character >= source.end.character
            {
                continue;
            }
            tokens.push((
                source.start.line,
                source.start.character,
                source.end.character - source.start.character,
                token_type,
                modifiers,
            ));
        }

        tokens.sort_unstable();
        tokens.dedup();
        let mut encoded = Vec::with_capacity(tokens.len() * 5);
        let mut previous_line = 0u32;
        let mut previous_character = 0u32;
        for (line, character, length, token_type, modifiers) in tokens {
            let delta_line = line - previous_line;
            let delta_start = if delta_line == 0 {
                character - previous_character
            } else {
                character
            };
            encoded.extend([
                Value::from(delta_line),
                Value::from(delta_start),
                Value::from(length),
                Value::from(token_type),
                Value::from(modifiers),
            ]);
            previous_line = line;
            previous_character = character;
        }
        *data = encoded;
        true
    }

    fn overlay_for_context(&self, context: &RequestDocumentContext) -> Option<&'a TsgoOverlay> {
        self.overlays.iter().find(|overlay| {
            overlay
                .shadow_for_source(&context.source_path)
                .is_some_and(|shadow| shadow.shadow_uri == context.shadow_uri)
        })
    }

    fn alias_for_uri(&self, uri: &str) -> Option<&UriAlias> {
        self.aliases
            .iter()
            .find(|alias| alias.source_uri.as_str() == uri || alias.shadow_uri.as_str() == uri)
    }

    fn context_for_uri(&self, uri: &str) -> Option<RequestDocumentContext> {
        self.alias_for_uri(uri)
            .map(|alias| alias.projection.clone())
            .or_else(|| document_context_for_uri_in(self.overlays, uri))
    }

    fn object_document_context(
        &self,
        object: &Map<String, Value>,
    ) -> Option<RequestDocumentContext> {
        object
            .get("uri")
            .or_else(|| object.get("documentUri"))
            .and_then(Value::as_str)
            .or_else(|| {
                object
                    .get("textDocument")
                    .and_then(Value::as_object)
                    .and_then(|document| document.get("uri"))
                    .and_then(Value::as_str)
            })
            .and_then(|uri| self.context_for_uri(uri))
    }
}

#[derive(Clone, Copy)]
enum Direction {
    SourceToShadow,
    ShadowToSource,
}

const URI_FIELDS: &[&str] = &["uri", "documentUri", "targetUri", "oldUri", "newUri"];
const URI_KEYED_MAPS: &[&str] = &["changes", "relatedDocuments"];
const FOLDING_FIELDS: &[&str] = &["startLine", "startCharacter", "endLine", "endCharacter"];

fn is_range_field(key: &str) -> bool {
    matches!(
        key,
        "range"
            | "selectionRange"
            | "targetRange"
            | "targetSelectionRange"
            | "originSelectionRange"
            | "insert"
            | "replace"
    )
}

/// Upstream spells "no definitions" as `[]` (`TypeScriptPlugin.getDefinitions`
/// returns `[]`), and gives `targetRange` the same span as
/// `targetSelectionRange` — `LocationLink.create(uri, defLocation.range,
/// defLocation.range, ...)` — where tsgo reports the enclosing declaration.
pub fn normalize_definition_result(result: &mut Value) {
    if result.is_null() {
        *result = Value::Array(Vec::new());
        return;
    }
    let Some(links) = result.as_array_mut() else {
        return;
    };
    for link in links {
        let Some(object) = link.as_object_mut() else {
            continue;
        };
        let Some(selection) = object.get("targetSelectionRange").cloned() else {
            continue;
        };
        if object.contains_key("targetRange") {
            object.insert("targetRange".to_string(), selection);
        }
    }
}

/// Upstream builds a hover body itself — `['```typescript', declaration,
/// '```']` joined with `['---', documentation]` — and returns it as a bare
/// string. tsgo returns the same two parts as `MarkupContent` with only a
/// newline between them.
pub fn normalize_hover_result(result: &mut Value) {
    let Some(object) = result.as_object_mut() else {
        return;
    };
    let Some(value) = object
        .get("contents")
        .and_then(|contents| contents.get("value"))
        .and_then(Value::as_str)
    else {
        return;
    };
    let text = upstream_hover_text(value);
    object.insert("contents".to_string(), Value::String(text));
}

fn upstream_hover_text(value: &str) -> String {
    const FENCE: &str = "```typescript\n";
    let Some(rest) = value.strip_prefix(FENCE) else {
        return value.trim_end_matches('\n').to_string();
    };
    let Some(end) = rest.find("\n```") else {
        return value.trim_end_matches('\n').to_string();
    };
    let declaration = &rest[..end];
    let documentation = rest[end + "\n```".len()..].trim_start_matches('\n');
    if documentation.trim().is_empty() {
        format!("{FENCE}{declaration}\n```")
    } else {
        format!("{FENCE}{declaration}\n```\n---\n{documentation}")
    }
}

/// TypeScript's quick info spans a whole string-literal token; tsgo spans only
/// the text between its quotes, so a hover on a module specifier or a quoted
/// property key comes back one character short at each end.
pub fn widen_hover_range_over_string_quotes(result: &mut Value, text: &str) {
    let Some(range) = result.get("range").and_then(parse_range) else {
        return;
    };
    let index = LineIndex::new(text);
    let start = index.offset(text, range.start);
    let end = index.offset(text, range.end);
    if start == 0 || end < start || end >= text.len() {
        return;
    }
    let bytes = text.as_bytes();
    let quote = bytes[start - 1];
    if !matches!(quote, b'"' | b'\'' | b'`') || bytes[end] != quote {
        return;
    }
    let widened = Range::new(
        index.position(text, start - 1),
        index.position(text, end + 1),
    );
    if let Some(value) = result.get_mut("range") {
        write_range(value, widened);
    }
}

/// The result an editor gets when a request never reaches tsgo. Upstream still
/// answers `[]` for a definition request it cannot map.
#[must_use]
pub fn tsgo_unmapped_result(method: &str) -> Value {
    match method {
        "textDocument/definition" => Value::Array(Vec::new()),
        // `PluginHost.getCompletions` returns `Promise<CompletionList>` and ends
        // in `CompletionList.create(flattened, isIncomplete)`, so upstream has no
        // way to answer a completion with `null` — every plugin declining leaves
        // an empty list whose `isIncomplete` is the `false` seed of the reduce.
        "textDocument/completion" => empty_completion_list(),
        _ => Value::Null,
    }
}

/// The value upstream's completion host produces when every plugin declines.
#[must_use]
pub fn empty_completion_list() -> Value {
    serde_json::json!({ "isIncomplete": false, "items": [] })
}

fn is_semantic_tokens_method(method: &str) -> bool {
    method == "textDocument/semanticTokens/full" || method == "textDocument/semanticTokens/range"
}

fn find_request_uri(value: &Value) -> Option<&str> {
    let object = value.as_object()?;
    object
        .get("textDocument")
        .and_then(Value::as_object)
        .and_then(|document| document.get("uri"))
        .and_then(Value::as_str)
        .or_else(|| object.get("uri").and_then(Value::as_str))
        .or_else(|| object.get("documentUri").and_then(Value::as_str))
        .or_else(|| {
            object
                .get("item")
                .and_then(Value::as_object)
                .and_then(|item| item.get("uri"))
                .and_then(Value::as_str)
        })
}

fn document_context_for_uri_in(
    overlays: &[TsgoOverlay],
    uri: &str,
) -> Option<RequestDocumentContext> {
    Uri::from_str(uri).ok()?;
    let path = uri_to_path(uri);
    if let Some((_, shadow)) = overlays
        .iter()
        .filter_map(|overlay| {
            overlay
                .shadow_for_source(&path)
                .map(|shadow| (overlay, shadow))
        })
        .max_by_key(|(overlay, _)| overlay.workspace().components().count())
    {
        return Some(RequestDocumentContext {
            source_uri: shadow.source_uri.clone(),
            shadow_uri: shadow.shadow_uri.clone(),
            source_path: uri_to_path(shadow.source_uri.as_str()),
            shadow_path: uri_to_path(shadow.shadow_uri.as_str()),
            plain_text: None,
        });
    }
    for overlay in overlays {
        if let Some(source_path) = overlay.source_for_shadow(&path) {
            let shadow = overlay.shadow_for_source(source_path)?;
            return Some(RequestDocumentContext {
                source_uri: shadow.source_uri.clone(),
                shadow_uri: shadow.shadow_uri.clone(),
                source_path: source_path.to_path_buf(),
                shadow_path: path,
                plain_text: None,
            });
        }
    }
    plain_disk_context(uri, &path)
}

fn plain_disk_context(uri: &str, path: &Path) -> Option<RequestDocumentContext> {
    if !uri.starts_with("file://") || !is_script_path(path) {
        return None;
    }
    let text: Arc<str> = fs::read_to_string(path).ok()?.into();
    let uri = Uri::from_str(uri).ok()?;
    Some(RequestDocumentContext {
        source_uri: uri.clone(),
        shadow_uri: uri,
        source_path: path.to_path_buf(),
        shadow_path: path.to_path_buf(),
        plain_text: Some(text),
    })
}

fn is_script_path(path: &Path) -> bool {
    path.extension()
        .and_then(|extension| extension.to_str())
        .is_some_and(|extension| {
            matches!(
                extension.to_ascii_lowercase().as_str(),
                "ts" | "tsx" | "mts" | "cts" | "js" | "jsx" | "mjs" | "cjs"
            )
        })
}

fn plain_source_to_tsgo(text: &str, position: Position) -> Position {
    let offset = LineIndex::new(text).offset(text, position);
    utf8_position(text, offset)
}

fn plain_tsgo_to_source(text: &str, position: Position) -> Position {
    let offset = utf8_offset(text, position);
    LineIndex::new(text).position(text, offset)
}

fn utf8_position(text: &str, offset: usize) -> Position {
    let offset = floor_char_boundary(text, offset.min(text.len()));
    let line = text.as_bytes()[..offset]
        .iter()
        .filter(|byte| **byte == b'\n')
        .count();
    let line_start = text.as_bytes()[..offset]
        .iter()
        .rposition(|byte| *byte == b'\n')
        .map_or(0, |position| position + 1);
    Position::new(
        u32::try_from(line).unwrap_or(u32::MAX),
        u32::try_from(offset - line_start).unwrap_or(u32::MAX),
    )
}

fn utf8_offset(text: &str, position: Position) -> usize {
    let mut line = 0u32;
    let mut line_start = 0usize;
    for (index, byte) in text.bytes().enumerate() {
        if line == position.line {
            break;
        }
        if byte == b'\n' {
            line += 1;
            line_start = index + 1;
        }
    }
    if line != position.line {
        return text.len();
    }
    let line_end = text[line_start..]
        .find('\n')
        .map_or(text.len(), |relative| line_start + relative);
    floor_char_boundary(
        text,
        line_start
            .saturating_add(position.character as usize)
            .min(line_end),
    )
}

fn floor_char_boundary(text: &str, mut offset: usize) -> usize {
    while offset > 0 && !text.is_char_boundary(offset) {
        offset -= 1;
    }
    offset
}

fn is_position(value: &Value) -> bool {
    let Some(object) = value.as_object() else {
        return false;
    };
    object.len() == 2
        && object
            .get("line")
            .is_some_and(|value| json_u32(value).is_some())
        && object
            .get("character")
            .is_some_and(|value| json_u32(value).is_some())
}

fn parse_position(value: &Value) -> Option<Position> {
    let object = value.as_object()?;
    Some(Position::new(
        json_u32(object.get("line")?)?,
        json_u32(object.get("character")?)?,
    ))
}

fn write_position(value: &mut Value, position: Position) {
    let Some(object) = value.as_object_mut() else {
        return;
    };
    object.insert("line".to_string(), Value::from(position.line));
    object.insert("character".to_string(), Value::from(position.character));
}

fn is_range(value: &Value) -> bool {
    let Some(object) = value.as_object() else {
        return false;
    };
    object.len() == 2
        && object.get("start").is_some_and(is_position)
        && object.get("end").is_some_and(is_position)
}

fn parse_range(value: &Value) -> Option<Range> {
    let object = value.as_object()?;
    Some(Range::new(
        parse_position(object.get("start")?)?,
        parse_position(object.get("end")?)?,
    ))
}

fn write_range(value: &mut Value, range: Range) {
    let Some(object) = value.as_object_mut() else {
        return;
    };
    if let Some(start) = object.get_mut("start") {
        write_position(start, range.start);
    }
    if let Some(end) = object.get_mut("end") {
        write_position(end, range.end);
    }
}

fn json_u32(value: &Value) -> Option<u32> {
    value.as_u64().and_then(|value| u32::try_from(value).ok())
}

#[cfg(test)]
mod tests {
    #[test]
    fn an_unmapped_completion_is_an_empty_list_not_null() {
        assert_eq!(
            tsgo_unmapped_result("textDocument/completion"),
            json!({ "isIncomplete": false, "items": [] })
        );
        // The other two shapes upstream can produce are unchanged.
        assert_eq!(tsgo_unmapped_result("textDocument/definition"), json!([]));
        assert_eq!(tsgo_unmapped_result("textDocument/hover"), Value::Null);
    }

    use std::fs;
    use std::time::{SystemTime, UNIX_EPOCH};

    use serde_json::json;

    use super::*;
    use crate::uri::path_to_uri;

    struct Workspace(PathBuf);

    impl Workspace {
        fn new() -> Self {
            let nonce = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_nanos();
            let root = std::env::temp_dir().join(format!(
                "rsvelte-tsgo-response-{}-{nonce}",
                std::process::id()
            ));
            fs::create_dir_all(&root).unwrap();
            Self(root)
        }
    }

    impl Drop for Workspace {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    fn overlay(source: &str) -> (Workspace, PathBuf, TsgoOverlay) {
        let workspace = Workspace::new();
        let path = workspace.0.join("src/App.svelte");
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(&path, source).unwrap();
        let overlay = TsgoOverlay::build(&workspace.0, None).unwrap();
        (workspace, path, overlay)
    }

    fn source_range(source: &str, needle: &str) -> Range {
        let start = source.find(needle).unwrap();
        let index = crate::text::LineIndex::new(source);
        Range::new(
            index.position(source, start),
            index.position(source, start + needle.len()),
        )
    }

    fn json_range(range: Range) -> Value {
        json!({
            "start": { "line": range.start.line, "character": range.start.character },
            "end": { "line": range.end.line, "character": range.end.character }
        })
    }

    #[test]
    fn request_context_round_trips_uri_position_and_range() {
        let source = "<script lang=\"ts\">\nconst 名前 = \"💡\";\nconsole.log(名前);\n</script>\n";
        let (_workspace, path, overlay) = overlay(source);
        let source_uri = overlay.shadow_for_source(&path).unwrap().source_uri.clone();
        let range = source_range(source, "名前");
        let mut params = json!({
            "textDocument": { "uri": source_uri.as_str() },
            "position": { "line": range.start.line, "character": range.start.character },
            "range": json_range(range)
        });
        let mapper = TsgoResponseMapper::for_request(&overlay, &params);
        let context = mapper.default_document().cloned().unwrap();
        assert!(mapper.map_request("textDocument/hover", &mut params));
        assert_eq!(params["textDocument"]["uri"], context.shadow_uri.as_str());

        let generated_range = parse_range(&params["range"]).unwrap();
        let mut response = json!({
            "contents": { "kind": "markdown", "value": "type" },
            "range": json_range(generated_range)
        });
        let mapper = TsgoResponseMapper::with_default_document(&overlay, Some(context));
        assert!(mapper.map_response("textDocument/hover", &mut response));
        assert_eq!(parse_range(&response["range"]), Some(range));
    }

    /// `mapToOriginalRange` (`FoldingRangeProvider.ts:64-97`) keeps a template
    /// span only when the source and generated text are the same string, and
    /// keeps every span whose start is inside a `<script>` unconditionally.
    #[test]
    fn a_template_folding_range_survives_only_where_the_two_texts_agree() {
        let source = "<script>\nlet value = 1;\n</script>\n<div class=\"a\">\n<p>x</p>\n</div>\n";
        let (_workspace, path, overlay) = overlay(source);
        let source_uri = overlay.shadow_for_source(&path).unwrap().source_uri.clone();
        let params = json!({ "textDocument": { "uri": source_uri.as_str() } });
        let context = TsgoResponseMapper::for_request(&overlay, &params)
            .default_document()
            .cloned()
            .unwrap();
        let fold = |range: Range| {
            let mapper = TsgoResponseMapper::with_default_document(&overlay, Some(context.clone()));
            let mut response = json!([{
                "startLine": range.start.line,
                "startCharacter": range.start.character,
                "endLine": range.end.line,
                "endCharacter": range.end.character
            }]);
            mapper.map_response("textDocument/foldingRange", &mut response);
            response.as_array().map_or(0, Vec::len)
        };
        let script = overlay
            .map_source_range(&path, source_range(source, "let value = 1;"))
            .unwrap();
        assert_eq!(fold(script), 1, "a span inside the script is kept");
        let element = overlay
            .map_source_range(&path, source_range(source, "<div class=\"a\">"))
            .unwrap();
        assert_eq!(fold(element), 0, "the shadow rewrites the element");
    }

    #[test]
    fn locations_workspace_edits_and_nested_symbols_map_recursively() {
        let source = "<script>\nlet value = 1;\nconsole.log(value);\n</script>";
        let (_workspace, path, overlay) = overlay(source);
        let shadow = overlay.shadow_for_source(&path).unwrap();
        let source_range = source_range(source, "value");
        let generated = overlay.map_source_range(&path, source_range).unwrap();
        let shadow_uri = shadow.shadow_uri.clone();
        let source_uri = shadow.source_uri.clone();
        let mut response = json!({
            "locations": [{ "uri": shadow_uri.as_str(), "range": json_range(generated) }],
            "edit": {
                "changes": {
                    shadow_uri.as_str(): [{ "range": json_range(generated), "newText": "next" }]
                },
                "documentChanges": [{
                    "textDocument": { "uri": shadow_uri.as_str(), "version": 1 },
                    "edits": [{ "range": json_range(generated), "newText": "next" }]
                }]
            },
            "symbols": [{
                "name": "value",
                "kind": 13,
                "range": json_range(generated),
                "selectionRange": json_range(generated),
                "children": []
            }]
        });
        let context = TsgoResponseMapper::new(&overlay)
            .document_context(&source_uri)
            .unwrap();
        let mapper = TsgoResponseMapper::with_default_document(&overlay, Some(context));
        assert!(mapper.map_response("test", &mut response));
        assert_eq!(response["locations"][0]["uri"], source_uri.as_str());
        assert_eq!(
            parse_range(&response["locations"][0]["range"]),
            Some(source_range)
        );
        assert!(
            response["edit"]["changes"]
                .get(source_uri.as_str())
                .is_some()
        );
        assert_eq!(
            response["edit"]["documentChanges"][0]["textDocument"]["uri"],
            source_uri.as_str()
        );
        assert_eq!(
            parse_range(&response["symbols"][0]["selectionRange"]),
            Some(source_range)
        );
    }

    #[test]
    fn one_response_maps_shadow_locations_from_multiple_workspaces() {
        let source = "<script>let value = 1;</script>";
        let (_first_workspace, first_path, first_overlay) = overlay(source);
        let (_second_workspace, second_path, second_overlay) = overlay(source);
        let range = source_range(source, "value");
        let first_generated = first_overlay.map_source_range(&first_path, range).unwrap();
        let second_generated = second_overlay
            .map_source_range(&second_path, range)
            .unwrap();
        let first_shadow = first_overlay.shadow_for_source(&first_path).unwrap();
        let second_shadow = second_overlay.shadow_for_source(&second_path).unwrap();
        let first_shadow_uri = first_shadow.shadow_uri.clone();
        let first_source_uri = first_shadow.source_uri.clone();
        let second_shadow_uri = second_shadow.shadow_uri.clone();
        let second_source_uri = second_shadow.source_uri.clone();
        let overlays = [first_overlay, second_overlay];
        let mut response = json!([
            { "uri": first_shadow_uri.as_str(), "range": json_range(first_generated) },
            { "uri": second_shadow_uri.as_str(), "range": json_range(second_generated) }
        ]);

        let mapper = TsgoResponseMapper::for_overlays(&overlays);
        assert!(mapper.map_response("workspace/symbol", &mut response));
        assert_eq!(response[0]["uri"], first_source_uri.as_str());
        assert_eq!(response[1]["uri"], second_source_uri.as_str());
        assert_eq!(parse_range(&response[0]["range"]), Some(range));
        assert_eq!(parse_range(&response[1]["range"]), Some(range));
    }

    #[test]
    fn unopened_plain_and_node_module_files_cross_utf8_utf16_on_disk() {
        let source = "<script>let value = 1;</script>";
        let (workspace, _path, overlay) = overlay(source);
        let dependency = workspace.0.join("node_modules/pkg/index.d.ts");
        fs::create_dir_all(dependency.parent().unwrap()).unwrap();
        let text = "export const icon = '😀'; export const 名前 = icon;\n";
        fs::write(&dependency, text).unwrap();
        let uri = path_to_uri(&dependency).unwrap();
        let source_start = text.find("名前").unwrap();
        let source_range = Range::new(
            LineIndex::new(text).position(text, source_start),
            LineIndex::new(text).position(text, source_start + "名前".len()),
        );
        let tsgo_range = Range::new(
            plain_source_to_tsgo(text, source_range.start),
            plain_source_to_tsgo(text, source_range.end),
        );
        assert_ne!(source_range.start.character, tsgo_range.start.character);

        let mut response = json!({
            "uri": uri.as_str(),
            "range": json_range(tsgo_range)
        });
        let mapper = TsgoResponseMapper::new(&overlay);
        assert!(mapper.map_response("textDocument/definition", &mut response));
        assert_eq!(parse_range(&response["range"]), Some(source_range));

        let mut params = json!({
            "textDocument": { "uri": uri.as_str() },
            "position": {
                "line": source_range.start.line,
                "character": source_range.start.character
            },
            "range": json_range(source_range)
        });
        let mapper = TsgoResponseMapper::for_request(&overlay, &params);
        assert!(mapper.default_document().is_some());
        assert!(mapper.map_request("textDocument/hover", &mut params));
        assert_eq!(params["textDocument"]["uri"], uri.as_str());
        assert_eq!(parse_range(&params["range"]), Some(tsgo_range));
    }

    #[test]
    fn prospective_shadow_alias_uses_old_projection_and_new_visible_uri() {
        let source = "<script>const 💡 = 1; let value = 💡;</script>";
        let (workspace, old_path, overlay) = overlay(source);
        let old = overlay.shadow_for_source(&old_path).unwrap();
        let old_source_uri = old.source_uri.clone();
        let old_shadow_uri = old.shadow_uri.clone();
        let source_range = source_range(source, "value");
        let generated = overlay.map_source_range(&old_path, source_range).unwrap();
        let new_source_uri = path_to_uri(&workspace.0.join("src/Renamed.svelte")).unwrap();
        let new_shadow_uri =
            path_to_uri(&overlay.cache_dir().join("svelte/src/Renamed.svelte.tsx")).unwrap();

        let mut mapper = TsgoResponseMapper::new(&overlay);
        assert!(mapper.add_uri_alias(
            new_source_uri.clone(),
            new_shadow_uri.clone(),
            &old_source_uri,
        ));
        assert!(!mapper.add_uri_alias(
            old_source_uri.clone(),
            new_shadow_uri.clone(),
            &old_source_uri,
        ));

        let mut response = json!({
            "changes": {
                new_shadow_uri.as_str(): [{
                    "range": json_range(generated),
                    "newText": "renamed"
                }],
                old_shadow_uri.as_str(): [{
                    "range": json_range(generated),
                    "newText": "old"
                }]
            }
        });
        assert!(mapper.map_response("workspace/willRenameFiles", &mut response));
        assert_eq!(
            parse_range(&response["changes"][new_source_uri.as_str()][0]["range"]),
            Some(source_range)
        );
        assert_eq!(
            parse_range(&response["changes"][old_source_uri.as_str()][0]["range"]),
            Some(source_range)
        );

        let mut request = json!({
            "textDocument": { "uri": new_source_uri.as_str() },
            "range": json_range(source_range)
        });
        assert!(mapper.map_request("textDocument/hover", &mut request));
        assert_eq!(request["textDocument"]["uri"], new_shadow_uri.as_str());
        assert_eq!(parse_range(&request["range"]), Some(generated));
    }

    #[test]
    fn nested_workspace_uses_the_most_specific_shadow() {
        let workspace = Workspace::new();
        let nested = workspace.0.join("packages/app");
        let path = nested.join("src/App.svelte");
        let source = "<script>let value = 1;</script>";
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(&path, source).unwrap();
        let parent_overlay = TsgoOverlay::build(&workspace.0, None).unwrap();
        let nested_overlay = TsgoOverlay::build(&nested, None).unwrap();
        let nested_shadow = nested_overlay.shadow_for_source(&path).unwrap();
        let nested_shadow_uri = nested_shadow.shadow_uri.clone();
        let source_uri = nested_shadow.source_uri.clone();
        let overlays = [parent_overlay, nested_overlay];
        let range = source_range(source, "value");
        let mut params = json!({
            "textDocument": { "uri": source_uri.as_str() },
            "position": {
                "line": range.start.line,
                "character": range.start.character
            }
        });

        let mapper = TsgoResponseMapper::for_overlays_request(&overlays, &params);
        assert_eq!(
            mapper.default_document().unwrap().shadow_uri(),
            &nested_shadow_uri
        );
        assert!(mapper.map_request("textDocument/hover", &mut params));
        assert_eq!(params["textDocument"]["uri"], nested_shadow_uri.as_str());
    }

    #[test]
    fn generated_array_elements_are_dropped() {
        let source = "<script>let value;</script><p>{value}</p>";
        let (_workspace, path, overlay) = overlay(source);
        let shadow = overlay.shadow_for_source(&path).unwrap();
        let shadow_path = uri_to_path(shadow.shadow_uri.as_str());
        let ignored_offset =
            shadow.text.find("/*Ωignore_startΩ*/").unwrap() + "/*Ωignore_startΩ*/".len();
        let ignored =
            crate::text::LineIndex::new(&shadow.text).position(&shadow.text, ignored_offset);
        let source_range = source_range(source, "value");
        let generated = overlay.map_source_range(&path, source_range).unwrap();
        assert!(overlay.is_generated_position(&shadow_path, ignored));

        let mut result = json!([
            { "uri": shadow.shadow_uri.as_str(), "range": json_range(Range::new(ignored, ignored)) },
            { "uri": shadow.shadow_uri.as_str(), "range": json_range(generated) }
        ]);
        let mapper = TsgoResponseMapper::new(&overlay);
        assert!(mapper.map_response("textDocument/definition", &mut result));
        assert_eq!(result.as_array().unwrap().len(), 1);
        assert_eq!(parse_range(&result[0]["range"]), Some(source_range));
    }

    #[test]
    fn a_definition_link_survives_an_enclosing_range_that_touches_generated_code() {
        let source = "<script>let value;</script><p>{value}</p>";
        let (_workspace, path, overlay) = overlay(source);
        let shadow = overlay.shadow_for_source(&path).unwrap();
        let shadow_path = uri_to_path(shadow.shadow_uri.as_str());
        let index = crate::text::LineIndex::new(&shadow.text);
        let selection = overlay
            .map_source_range(&path, source_range(source, "value"))
            .unwrap();
        // tsgo reports the enclosing declaration, which here runs into the
        // `Ωignore` region upstream never carries in a `LocationLink`.
        let marker = shadow
            .text
            .find("/*\u{03A9}ignore_start\u{03A9}*/")
            .unwrap();
        let enclosing = Range::new(
            selection.start,
            index.position(
                &shadow.text,
                marker + "/*\u{03A9}ignore_start\u{03A9}*/".len(),
            ),
        );
        assert!(overlay.is_generated_range(&shadow_path, enclosing));

        let link = || {
            json!([{
                "targetUri": shadow.shadow_uri.as_str(),
                "targetRange": json_range(enclosing),
                "targetSelectionRange": json_range(selection)
            }])
        };
        let mapper = TsgoResponseMapper::new(&overlay);

        let mut forwarded = link();
        assert!(mapper.map_response("textDocument/definition", &mut forwarded));
        assert!(
            forwarded.as_array().unwrap().is_empty(),
            "the enclosing range takes the whole link with it"
        );

        let mut collapsed = link();
        normalize_definition_result(&mut collapsed);
        assert!(mapper.map_response("textDocument/definition", &mut collapsed));
        assert_eq!(collapsed.as_array().unwrap().len(), 1);
        assert_eq!(
            parse_range(&collapsed[0]["targetSelectionRange"]),
            Some(source_range(source, "value"))
        );
    }

    #[test]
    fn semantic_tokens_decode_map_filter_sort_and_reencode_utf16() {
        let source = "<script lang=\"ts\">\nconst 💡name = 1;\nconsole.log(💡name);\n</script>";
        let (_workspace, path, overlay) = overlay(source);
        let shadow = overlay.shadow_for_source(&path).unwrap();
        let first_source = source_range(source, "name");
        let second_start = source.rfind("name").unwrap();
        let index = crate::text::LineIndex::new(source);
        let second_source = Range::new(
            index.position(source, second_start),
            index.position(source, second_start + 4),
        );
        let first = overlay.map_source_range(&path, first_source).unwrap();
        let second = overlay.map_source_range(&path, second_source).unwrap();
        assert_eq!(first.start.line, first.end.line);
        assert_eq!(second.start.line, second.end.line);

        let mut generated = [first, second];
        generated.sort_by_key(|range| (range.start.line, range.start.character));
        let mut data = Vec::new();
        let mut line = 0;
        let mut character = 0;
        for range in generated {
            let delta_line = range.start.line - line;
            let delta_start = if delta_line == 0 {
                range.start.character - character
            } else {
                range.start.character
            };
            data.extend([
                delta_line,
                delta_start,
                range.end.character - range.start.character,
                7,
                0,
            ]);
            line = range.start.line;
            character = range.start.character;
        }
        let mut result = json!({ "data": data });
        let context = TsgoResponseMapper::new(&overlay)
            .document_context(&shadow.source_uri)
            .unwrap();
        let mapper = TsgoResponseMapper::with_default_document(&overlay, Some(context));
        assert!(mapper.map_response("textDocument/semanticTokens/full", &mut result));

        let encoded = result["data"].as_array().unwrap();
        assert_eq!(encoded.len(), 10);
        assert_eq!(encoded[0], first_source.start.line);
        assert_eq!(encoded[1], first_source.start.character);
        assert_eq!(encoded[2], 4);
        assert_eq!(
            encoded[5],
            second_source.start.line - first_source.start.line
        );
        assert_eq!(encoded[6], second_source.start.character);
        assert_eq!(encoded[7], 4);
        assert_eq!(first_source.end.character - first_source.start.character, 4);
    }

    #[test]
    fn plain_typescript_values_and_completion_data_are_opaque() {
        let workspace = Workspace::new();
        fs::write(workspace.0.join("empty.txt"), "").unwrap();
        let overlay = TsgoOverlay::build(&workspace.0, None).unwrap();
        let mut value = json!({
            "uri": "file:///plain.ts",
            "range": {
                "start": { "line": 1, "character": 2 },
                "end": { "line": 1, "character": 4 }
            },
            "data": {
                "uri": "file:///generated.svelte.tsx",
                "range": {
                    "start": { "line": 99, "character": 0 },
                    "end": { "line": 99, "character": 1 }
                }
            }
        });
        let original = value.clone();
        let mapper = TsgoResponseMapper::new(&overlay);
        assert!(mapper.map_response("completionItem/resolve", &mut value));
        assert_eq!(value, original);
    }

    #[test]
    fn a_definition_link_takes_its_selection_span_as_the_target_range() {
        let mut result = json!([{
            "originSelectionRange": { "start": { "line": 1, "character": 10 }, "end": { "line": 1, "character": 18 } },
            "targetRange": { "start": { "line": 1, "character": 1 }, "end": { "line": 1, "character": 42 } },
            "targetSelectionRange": { "start": { "line": 1, "character": 10 }, "end": { "line": 1, "character": 18 } },
            "targetUri": "file:///a.svelte"
        }]);
        normalize_definition_result(&mut result);
        assert_eq!(result[0]["targetRange"], result[0]["targetSelectionRange"]);
        assert_eq!(
            result[0]["targetRange"]["start"]["character"],
            json!(10),
            "the declaration span must not survive"
        );
    }

    #[test]
    fn no_definition_is_an_empty_list_not_null() {
        let mut result = Value::Null;
        normalize_definition_result(&mut result);
        assert_eq!(result, json!([]));
        assert_eq!(tsgo_unmapped_result("textDocument/definition"), json!([]));
        assert_eq!(tsgo_unmapped_result("textDocument/hover"), Value::Null);
    }

    #[test]
    fn a_hover_body_is_a_string_with_upstreams_separator() {
        let mut result = json!({
            "contents": { "kind": "markdown", "value": "```typescript\nconst greeting: \"hi\"\n```\n" },
            "range": { "start": { "line": 1, "character": 7 }, "end": { "line": 1, "character": 15 } }
        });
        normalize_hover_result(&mut result);
        assert_eq!(
            result["contents"],
            json!("```typescript\nconst greeting: \"hi\"\n```")
        );
        assert!(result.get("range").is_some(), "the range must survive");

        let mut documented = json!({
            "contents": { "kind": "markdown", "value": "```typescript\nfunction $props(): any\n```\nDeclares the props." }
        });
        normalize_hover_result(&mut documented);
        assert_eq!(
            documented["contents"],
            json!("```typescript\nfunction $props(): any\n```\n---\nDeclares the props.")
        );
    }

    #[test]
    fn a_hover_on_a_string_literal_spans_its_quotes() {
        let text = "import type { Foo } from \"./types.js\";\nconst o = { 'kk': 1 };\n";
        let mut module = json!({
            "contents": "```typescript\nmodule \"./types.js\"\n```",
            "range": { "start": { "line": 0, "character": 26 }, "end": { "line": 0, "character": 36 } }
        });
        widen_hover_range_over_string_quotes(&mut module, text);
        assert_eq!(module["range"]["start"]["character"], json!(25));
        assert_eq!(module["range"]["end"]["character"], json!(37));

        let mut key = json!({
            "contents": "```typescript\n(property) 'kk': number\n```",
            "range": { "start": { "line": 1, "character": 13 }, "end": { "line": 1, "character": 15 } }
        });
        widen_hover_range_over_string_quotes(&mut key, text);
        assert_eq!(key["range"]["start"]["character"], json!(12));
        assert_eq!(key["range"]["end"]["character"], json!(16));

        // An identifier is not surrounded by matching quotes, so it is left alone.
        let mut identifier = json!({
            "contents": "```typescript\ntype Foo\n```",
            "range": { "start": { "line": 0, "character": 14 }, "end": { "line": 0, "character": 17 } }
        });
        widen_hover_range_over_string_quotes(&mut identifier, text);
        assert_eq!(identifier["range"]["start"]["character"], json!(14));
        assert_eq!(identifier["range"]["end"]["character"], json!(17));
    }
}
