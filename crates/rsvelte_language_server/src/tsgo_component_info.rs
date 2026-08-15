//! Component prop, event and slot-let completion through tsgo's public LSP.

use std::ops::Range as ByteRange;
use std::str::FromStr;

use lsp_types::{
    CompletionContext, CompletionItem, CompletionItemKind, CompletionTextEdit,
    CompletionTriggerKind, Documentation, Position, Range, TextEdit, Uri,
};
use rsvelte_projection::{ByteRange as ProjectionRange, ProjectionMap};
use serde_json::{Value, json};

use crate::context::EmbeddedRegions;
use crate::text::{LineIndex, source_offset};

const QUERY_SUFFIX: &str = ".rsvelte-component-info.tsx";
const PROBE_MEMBER: &str = "__rsvelte_component_info_probe";

/// Why component-specific completions cannot be offered at a source position.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ComponentCompletionRejection {
    ParserError,
    UnsupportedTrigger,
    EmbeddedLanguage,
    NotComponentStartTag,
    ComponentName,
    AttributeValue,
}

/// Source information retained while component type information is queried.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ComponentCompletionSite {
    component_expression: String,
    component_range: ByteRange<usize>,
    component_ordinal: usize,
    word_range: Range,
    colon_trigger: bool,
}

impl ComponentCompletionSite {
    #[must_use]
    pub fn component_expression(&self) -> &str {
        &self.component_expression
    }

    #[must_use]
    pub fn component_range(&self) -> ByteRange<usize> {
        self.component_range.clone()
    }

    #[must_use]
    pub const fn word_range(&self) -> Range {
        self.word_range
    }

    #[must_use]
    pub const fn was_colon_triggered(&self) -> bool {
        self.colon_trigger
    }
}

/// Locate a component completion site without requiring a successful Svelte AST.
pub fn component_completion_site(
    source: &str,
    position: Position,
    context: Option<&CompletionContext>,
    parser_error: bool,
) -> Result<ComponentCompletionSite, ComponentCompletionRejection> {
    if parser_error {
        return Err(ComponentCompletionRejection::ParserError);
    }

    let colon_trigger = match context {
        None => false,
        Some(context) if context.trigger_kind == CompletionTriggerKind::INVOKED => false,
        Some(context)
            if context.trigger_kind == CompletionTriggerKind::TRIGGER_CHARACTER
                && context.trigger_character.as_deref() == Some(":") =>
        {
            true
        }
        Some(_) => return Err(ComponentCompletionRejection::UnsupportedTrigger),
    };

    let index = LineIndex::new(source);
    let offset = index.offset(source, position);
    if EmbeddedRegions::new(source).contains(offset) {
        return Err(ComponentCompletionRejection::EmbeddedLanguage);
    }

    let (component_range, expression) = component_start_tag(source, offset)
        .ok_or(ComponentCompletionRejection::NotComponentStartTag)?;
    if offset <= component_range.end {
        return Err(ComponentCompletionRejection::ComponentName);
    }
    if cursor_in_attribute_value(&source[component_range.end..offset]) {
        return Err(ComponentCompletionRejection::AttributeValue);
    }

    let word = current_word(source, offset);
    let component_ordinal = preceding_component_count(&source[..component_range.start], expression);
    Ok(ComponentCompletionSite {
        component_expression: expression.to_string(),
        component_range,
        component_ordinal,
        word_range: Range::new(
            index.position(source, word.start),
            index.position(source, word.end),
        ),
        colon_trigger,
    })
}

/// Find an exact generated occurrence of the component expression.
///
/// The returned candidates are ordered as the projection emits them. Callers
/// can use an explicit generated range when a transform intentionally renames
/// the tag expression.
#[must_use]
pub fn generated_component_ranges(
    map: &ProjectionMap,
    site: &ComponentCompletionSite,
    generated_text: &str,
) -> Vec<ByteRange<usize>> {
    let Some(source_range) = ProjectionRange::new(
        source_offset(site.component_range.start),
        source_offset(site.component_range.end),
    ) else {
        return Vec::new();
    };
    let exact = map
        .source_range_to_generated(source_range)
        .into_iter()
        .map(ProjectionRange::as_usize_range)
        .filter(|range| {
            generated_text.get(range.clone()) == Some(site.component_expression.as_str())
        })
        .collect::<Vec<_>>();
    if !exact.is_empty() {
        return exact;
    }

    let anchor = format!("__sveltets_2_ensureComponent({}", site.component_expression);
    let candidates = generated_text
        .match_indices(&anchor)
        .map(|(start, _)| {
            let start = start + "__sveltets_2_ensureComponent(".len();
            start..start + site.component_expression.len()
        })
        .collect::<Vec<_>>();
    candidates
        .get(site.component_ordinal)
        .cloned()
        .into_iter()
        .collect()
}

/// Component surface being enumerated by a virtual member completion.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum ComponentPart {
    Props,
    Events,
    DefaultSlotLets,
}

impl ComponentPart {
    const ALL: [Self; 3] = [Self::Props, Self::Events, Self::DefaultSlotLets];

    const fn prefix(self) -> &'static str {
        match self {
            Self::Props => "",
            Self::Events => "on:",
            Self::DefaultSlotLets => "let:",
        }
    }
}

/// One property discovered from a component type.
#[derive(Clone, Debug, PartialEq)]
pub struct ComponentMember {
    pub name: String,
    pub type_detail: String,
    pub documentation: Option<Documentation>,
}

/// The normalized component surface returned by a completed query.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct ComponentInfo {
    pub props: Vec<ComponentMember>,
    pub events: Vec<ComponentMember>,
    pub default_slot_lets: Vec<ComponentMember>,
}

impl ComponentInfo {
    fn members_mut(&mut self, part: ComponentPart) -> &mut Vec<ComponentMember> {
        match part {
            ComponentPart::Props => &mut self.props,
            ComponentPart::Events => &mut self.events,
            ComponentPart::DefaultSlotLets => &mut self.default_slot_lets,
        }
    }

    /// Convert type members into the manual items used in a component start tag.
    #[must_use]
    pub fn completion_items(&self, site: &ComponentCompletionSite) -> Vec<CompletionItem> {
        let parts: &[(ComponentPart, &[ComponentMember])] = if site.colon_trigger {
            &[
                (ComponentPart::Events, &self.events),
                (ComponentPart::DefaultSlotLets, &self.default_slot_lets),
            ]
        } else {
            &[
                (ComponentPart::Props, &self.props),
                (ComponentPart::Events, &self.events),
                (ComponentPart::DefaultSlotLets, &self.default_slot_lets),
            ]
        };

        parts
            .iter()
            .flat_map(|(part, members)| {
                members
                    .iter()
                    .map(move |member| completion_item(*part, member, site.word_range))
            })
            .collect()
    }
}

/// A virtual document operation or public tsgo LSP request.
#[derive(Clone, Debug, PartialEq)]
pub enum ComponentInfoAction {
    Open {
        uri: Uri,
        language_id: &'static str,
        version: i32,
        text: String,
    },
    Change {
        uri: Uri,
        version: i32,
        text: String,
    },
    Request {
        id: ComponentInfoRequestId,
        method: &'static str,
        params: Value,
    },
    Close {
        uri: Uri,
    },
    Complete(ComponentInfo),
}

/// Stable correlation token for a request emitted by [`ComponentInfoQuery`].
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum ComponentInfoRequestId {
    Completion(ComponentPart),
    Resolve { part: ComponentPart, index: usize },
}

/// A protocol-state violation while driving a component query.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ComponentInfoQueryError {
    RequestNotPending,
    UnexpectedResponse,
}

/// A public-LSP-only query for legacy and Svelte 5 component type surfaces.
///
/// Drive it by repeatedly executing [`Self::next_action`]. Requests pause the
/// machine until [`Self::accept_response`] or [`Self::accept_error`] is called.
/// Open/change bodies are virtual and must only be sent to tsgo, never written.
pub struct ComponentInfoQuery {
    query_uri: Uri,
    generated_text: String,
    generated_component_range: ByteRange<usize>,
    component_expression: String,
    version: i32,
    part_index: usize,
    stage: QueryStage,
    waiting: Option<ComponentInfoRequestId>,
    items: Vec<Value>,
    resolve_index: usize,
    info: ComponentInfo,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum QueryStage {
    Open,
    Completion,
    Resolve,
    Close,
    Complete,
    Done,
}

impl ComponentInfoQuery {
    /// Create a query next to a shadow URI so relative module resolution stays unchanged.
    pub fn new(
        shadow_uri: &Uri,
        generated_text: impl Into<String>,
        generated_component_range: ByteRange<usize>,
        component_expression: impl Into<String>,
        version: i32,
    ) -> Result<Self, InvalidComponentQuery> {
        let generated_text = generated_text.into();
        let component_expression = component_expression.into();
        if generated_component_range.start > generated_component_range.end
            || component_expression.trim().is_empty()
            || generated_text.get(generated_component_range.clone())
                != Some(component_expression.as_str())
        {
            return Err(InvalidComponentQuery);
        }
        let query_uri = Uri::from_str(&format!("{}{QUERY_SUFFIX}", shadow_uri.as_str()))
            .map_err(|_| InvalidComponentQuery)?;
        Ok(Self {
            query_uri,
            generated_text,
            generated_component_range,
            component_expression,
            version,
            part_index: 0,
            stage: QueryStage::Open,
            waiting: None,
            items: Vec::new(),
            resolve_index: 0,
            info: ComponentInfo::default(),
        })
    }

    #[must_use]
    pub const fn query_uri(&self) -> &Uri {
        &self.query_uri
    }

    /// Return the next operation, or `None` while a request response is pending.
    pub fn next_action(&mut self) -> Option<ComponentInfoAction> {
        if self.waiting.is_some() {
            return None;
        }
        match self.stage {
            QueryStage::Open => {
                self.stage = QueryStage::Completion;
                let (text, _) = self.probe(ComponentPart::ALL[self.part_index]);
                Some(ComponentInfoAction::Open {
                    uri: self.query_uri.clone(),
                    language_id: "typescriptreact",
                    version: self.version,
                    text,
                })
            }
            QueryStage::Completion => {
                let part = ComponentPart::ALL[self.part_index];
                let (_, position) = self.probe(part);
                let id = ComponentInfoRequestId::Completion(part);
                self.waiting = Some(id);
                Some(ComponentInfoAction::Request {
                    id,
                    method: "textDocument/completion",
                    params: json!({
                        "textDocument": { "uri": self.query_uri.as_str() },
                        "position": position,
                        "context": { "triggerKind": 1 }
                    }),
                })
            }
            QueryStage::Resolve if self.resolve_index < self.items.len() => {
                let part = ComponentPart::ALL[self.part_index];
                let id = ComponentInfoRequestId::Resolve {
                    part,
                    index: self.resolve_index,
                };
                self.waiting = Some(id);
                Some(ComponentInfoAction::Request {
                    id,
                    method: "completionItem/resolve",
                    params: self.items[self.resolve_index].clone(),
                })
            }
            QueryStage::Resolve => self.advance_part(),
            QueryStage::Close => {
                self.stage = QueryStage::Complete;
                Some(ComponentInfoAction::Close {
                    uri: self.query_uri.clone(),
                })
            }
            QueryStage::Complete => {
                self.stage = QueryStage::Done;
                Some(ComponentInfoAction::Complete(std::mem::take(
                    &mut self.info,
                )))
            }
            QueryStage::Done => None,
        }
    }

    /// Feed a successful public LSP response back into the state machine.
    pub fn accept_response(
        &mut self,
        id: ComponentInfoRequestId,
        response: Value,
    ) -> Result<(), ComponentInfoQueryError> {
        if self.waiting != Some(id) {
            return Err(if self.waiting.is_some() {
                ComponentInfoQueryError::UnexpectedResponse
            } else {
                ComponentInfoQueryError::RequestNotPending
            });
        }
        self.waiting = None;
        match id {
            ComponentInfoRequestId::Completion(part)
                if part == ComponentPart::ALL[self.part_index] =>
            {
                self.items = completion_values(response);
                self.resolve_index = 0;
                self.stage = QueryStage::Resolve;
            }
            ComponentInfoRequestId::Resolve { part, index }
                if part == ComponentPart::ALL[self.part_index] && index == self.resolve_index =>
            {
                let initial = self.items[index].clone();
                let resolved = merge_completion_values(initial, response);
                if let Some(member) = component_member(&resolved, part) {
                    self.info.members_mut(part).push(member);
                }
                self.resolve_index += 1;
            }
            _ => return Err(ComponentInfoQueryError::UnexpectedResponse),
        }
        Ok(())
    }

    /// Continue after an LSP error. Resolve failures retain initial item detail;
    /// a failed member-completion request produces an empty component part.
    pub fn accept_error(
        &mut self,
        id: ComponentInfoRequestId,
    ) -> Result<(), ComponentInfoQueryError> {
        match id {
            ComponentInfoRequestId::Completion(_) => self.accept_response(id, Value::Null),
            ComponentInfoRequestId::Resolve { index, .. } => {
                let fallback = self
                    .items
                    .get(index)
                    .cloned()
                    .ok_or(ComponentInfoQueryError::UnexpectedResponse)?;
                self.accept_response(id, fallback)?;
                Ok(())
            }
        }
    }

    fn advance_part(&mut self) -> Option<ComponentInfoAction> {
        self.part_index += 1;
        self.items.clear();
        self.resolve_index = 0;
        if self.part_index == ComponentPart::ALL.len() {
            self.stage = QueryStage::Close;
            return self.next_action();
        }
        self.version = self.version.saturating_add(1);
        self.stage = QueryStage::Completion;
        let (text, _) = self.probe(ComponentPart::ALL[self.part_index]);
        Some(ComponentInfoAction::Change {
            uri: self.query_uri.clone(),
            version: self.version,
            text,
        })
    }

    fn probe(&self, part: ComponentPart) -> (String, Position) {
        let replacement = probe_expression(part, &self.component_expression);
        let cursor_in_replacement = replacement
            .find(&format!(".{PROBE_MEMBER}"))
            .expect("probe expression owns its cursor marker")
            + 1;
        let mut text = String::with_capacity(
            self.generated_text.len() - self.generated_component_range.len() + replacement.len(),
        );
        text.push_str(&self.generated_text[..self.generated_component_range.start]);
        text.push_str(&replacement);
        text.push_str(&self.generated_text[self.generated_component_range.end..]);
        let cursor = self.generated_component_range.start + cursor_in_replacement;
        let position = utf8_position(&text, cursor);
        (text, position)
    }
}

/// Invalid generated range, expression or URI for a virtual component query.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct InvalidComponentQuery;

fn component_start_tag(source: &str, offset: usize) -> Option<(ByteRange<usize>, &str)> {
    let before = source.get(..offset)?;
    for (open, _) in before.rmatch_indices('<') {
        let tail = source.get(open + 1..)?;
        if tail.starts_with(['/', '!', '?']) {
            continue;
        }
        let end = tail
            .find(|c: char| {
                !(c.is_ascii_alphanumeric() || matches!(c, '-' | '_' | '.' | ':' | '$'))
            })
            .map_or(source.len(), |end| open + 1 + end);
        if end <= open + 1 || offset < end {
            continue;
        }
        let expression = &source[open + 1..end];
        let component = expression
            .as_bytes()
            .first()
            .is_some_and(u8::is_ascii_uppercase)
            || expression.contains('.');
        if !component {
            continue;
        }
        if source[end..offset].contains('>') {
            continue;
        }
        return Some((open + 1..end, expression));
    }
    None
}

fn preceding_component_count(source: &str, expression: &str) -> usize {
    let needle = format!("<{expression}");
    let embedded = EmbeddedRegions::new(source);
    source
        .match_indices(&needle)
        .filter(|(start, _)| {
            !embedded.contains(*start)
                && !inside_html_comment(source, *start)
                && source[*start + needle.len()..]
                    .chars()
                    .next()
                    .is_none_or(|character| {
                        !(character.is_ascii_alphanumeric()
                            || matches!(character, '-' | '_' | '.' | ':' | '$'))
                    })
        })
        .count()
}

fn inside_html_comment(source: &str, offset: usize) -> bool {
    let before = &source[..offset];
    before.rfind("<!--") > before.rfind("-->")
}

fn cursor_in_attribute_value(after_name: &str) -> bool {
    let mut quote = None;
    let mut escaped = false;
    let mut braces = 0usize;
    let mut value = ValueState::None;
    for character in after_name.chars() {
        if let Some(active) = quote {
            if escaped {
                escaped = false;
            } else if character == '\\' {
                escaped = true;
            } else if character == active {
                quote = None;
                value = ValueState::None;
            }
            continue;
        }
        if value == ValueState::Unquoted {
            if character.is_whitespace() {
                value = ValueState::None;
            }
            continue;
        }
        if value == ValueState::AfterEqual {
            match character {
                c if c.is_whitespace() => continue,
                '"' | '\'' => {
                    quote = Some(character);
                    continue;
                }
                '{' => {
                    braces = 1;
                    value = ValueState::None;
                    continue;
                }
                _ => {
                    value = ValueState::Unquoted;
                    continue;
                }
            }
        }
        match character {
            '"' | '\'' if braces > 0 => quote = Some(character),
            '{' => braces += 1,
            '}' => braces = braces.saturating_sub(1),
            '=' if braces == 0 => value = ValueState::AfterEqual,
            _ => {}
        }
    }
    quote.is_some() || braces > 0 || value != ValueState::None
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum ValueState {
    None,
    AfterEqual,
    Unquoted,
}

fn current_word(source: &str, offset: usize) -> ByteRange<usize> {
    let mut start = offset;
    while start > 0 {
        let character = source[..start]
            .chars()
            .next_back()
            .expect("nonempty prefix");
        if character.is_whitespace() || character == '.' {
            break;
        }
        start -= character.len_utf8();
    }
    let mut end = offset;
    while end < source.len() {
        let character = source[end..].chars().next().expect("nonempty suffix");
        if !(character.is_ascii_alphanumeric()
            || character == '_'
            || character == '$'
            || character == ':')
        {
            break;
        }
        end += character.len_utf8();
    }
    start..end
}

fn probe_expression(part: ComponentPart, component: &str) -> String {
    let constructor = match part {
        ComponentPart::Props => "I extends { $$prop_def: infer P } ? P : never",
        ComponentPart::Events => "I extends { $$events_def: infer E } ? E : never",
        ComponentPart::DefaultSlotLets => {
            "I extends { $$slot_def: infer S } ? S extends { default?: infer D } ? NonNullable<D> : never : never"
        }
    };
    let callable = match part {
        ComponentPart::Props => "P",
        ComponentPart::Events => "P extends { $$events?: infer E } ? NonNullable<E> : never",
        ComponentPart::DefaultSlotLets => {
            "P extends { $$slots?: infer S } ? NonNullable<S> extends { default?: infer D } ? NonNullable<D> : never : never"
        }
    };
    format!(
        "((null as unknown as (typeof {component} extends (internals: any, props: infer P, ...args: any[]) => any ? {callable} : typeof {component} extends abstract new (...args: any[]) => infer I ? {constructor} : never)).{PROBE_MEMBER}, ({component}))"
    )
}

fn completion_values(response: Value) -> Vec<Value> {
    match response {
        Value::Array(items) => items,
        Value::Object(mut object) => object
            .remove("items")
            .and_then(|items| items.as_array().cloned())
            .unwrap_or_default(),
        _ => Vec::new(),
    }
}

fn merge_completion_values(initial: Value, resolved: Value) -> Value {
    match (initial, resolved) {
        (Value::Object(mut initial), Value::Object(resolved)) => {
            initial.extend(resolved);
            Value::Object(initial)
        }
        (_, resolved) => resolved,
    }
}

fn component_member(value: &Value, part: ComponentPart) -> Option<ComponentMember> {
    let item: CompletionItem = serde_json::from_value(value.clone()).ok()?;
    let name = unquote_property_name(&item.label);
    if name == PROBE_MEMBER || (part == ComponentPart::Props && name.starts_with("$$")) {
        return None;
    }
    let type_detail = normalized_detail(&name, item.detail.as_deref(), item.label_details.as_ref());
    Some(ComponentMember {
        name,
        type_detail,
        documentation: item.documentation,
    })
}

fn unquote_property_name(label: &str) -> String {
    let label = label.strip_suffix('?').unwrap_or(label);
    label
        .strip_prefix(['\'', '"'])
        .and_then(|label| label.strip_suffix(['\'', '"']))
        .unwrap_or(label)
        .to_string()
}

fn normalized_detail(
    name: &str,
    detail: Option<&str>,
    label_details: Option<&lsp_types::CompletionItemLabelDetails>,
) -> String {
    if let Some(detail) = detail {
        if let Some(at) = detail.rfind(name) {
            let suffix = detail[at + name.len()..].trim();
            if suffix.starts_with(':') || suffix.starts_with("?:") {
                return format!("{name}{suffix}");
            }
        }
        if !detail.is_empty() {
            return detail.to_string();
        }
    }
    if let Some(detail) = label_details.and_then(|details| details.detail.as_deref()) {
        return format!("{name}{detail}");
    }
    name.to_string()
}

fn completion_item(
    part: ComponentPart,
    member: &ComponentMember,
    word_range: Range,
) -> CompletionItem {
    let label = format!("{}{name}", part.prefix(), name = member.name);
    let text_edit = (word_range.start != word_range.end)
        .then(|| CompletionTextEdit::Edit(TextEdit::new(word_range, label.clone())));
    CompletionItem {
        label: label.clone(),
        kind: (part == ComponentPart::Props).then_some(CompletionItemKind::FIELD),
        sort_text: Some("-1".to_string()),
        detail: Some(member.type_detail.clone()),
        documentation: member.documentation.clone(),
        commit_characters: Some(Vec::new()),
        text_edit,
        ..CompletionItem::default()
    }
}

fn utf8_position(text: &str, offset: usize) -> Position {
    let offset = offset.min(text.len());
    let before = &text[..offset];
    let line = before.bytes().filter(|byte| *byte == b'\n').count() as u32;
    let line_start = before.rfind('\n').map_or(0, |index| index + 1);
    Position::new(line, (offset - line_start) as u32)
}

#[cfg(test)]
mod tests {
    use lsp_types::{MarkupContent, MarkupKind};

    use super::*;

    fn invoked() -> CompletionContext {
        CompletionContext {
            trigger_kind: CompletionTriggerKind::INVOKED,
            trigger_character: None,
        }
    }

    fn colon() -> CompletionContext {
        CompletionContext {
            trigger_kind: CompletionTriggerKind::TRIGGER_CHARACTER,
            trigger_character: Some(":".to_string()),
        }
    }

    fn site(source: &str, needle: &str, context: &CompletionContext) -> ComponentCompletionSite {
        let offset = source.find(needle).unwrap() + needle.len();
        let position = LineIndex::new(source).position(source, offset);
        component_completion_site(source, position, Some(context), false).unwrap()
    }

    #[test]
    fn namespace_component_and_current_directive_word_are_located() {
        let source = "<script>let no = 1</script>\n<Components.Button on:cli />";
        let site = site(source, "on:cli", &invoked());
        assert_eq!(site.component_expression(), "Components.Button");
        assert_eq!(site.component_range(), 29..46);
        assert_eq!(site.word_range().start, Position::new(1, 19));
        assert_eq!(site.word_range().end, Position::new(1, 25));
    }

    #[test]
    fn parser_script_native_value_and_non_colon_triggers_are_rejected() {
        let source = "<script>Comp.</script><div x /><Comp value={foo} />";
        let index = LineIndex::new(source);
        let script = index.position(source, source.find("Comp.").unwrap() + 4);
        assert_eq!(
            component_completion_site(source, script, Some(&invoked()), false),
            Err(ComponentCompletionRejection::EmbeddedLanguage)
        );
        let native = index.position(source, source.find("<div x").unwrap() + 6);
        assert_eq!(
            component_completion_site(source, native, Some(&invoked()), false),
            Err(ComponentCompletionRejection::NotComponentStartTag)
        );
        let value = index.position(source, source.find("foo").unwrap() + 2);
        assert_eq!(
            component_completion_site(source, value, Some(&invoked()), false),
            Err(ComponentCompletionRejection::AttributeValue)
        );
        assert_eq!(
            component_completion_site(source, Position::new(0, 0), Some(&invoked()), true),
            Err(ComponentCompletionRejection::ParserError)
        );
        let dot = CompletionContext {
            trigger_kind: CompletionTriggerKind::TRIGGER_CHARACTER,
            trigger_character: Some(".".to_string()),
        };
        assert_eq!(
            component_completion_site(source, value, Some(&dot), false),
            Err(ComponentCompletionRejection::UnsupportedTrigger)
        );
        let component_name = index.position(source, source.rfind("<Comp").unwrap() + 3);
        assert!(matches!(
            component_completion_site(source, component_name, Some(&invoked()), false),
            Err(ComponentCompletionRejection::NotComponentStartTag)
                | Err(ComponentCompletionRejection::ComponentName)
        ));
    }

    #[test]
    fn completed_attribute_values_allow_the_next_component_completion() {
        for source in [
            "<Comp value={foo}  />",
            "<Comp value=foo  />",
            "<Comp value=\"foo\"  />",
        ] {
            let offset = source.rfind("  ").unwrap() + 1;
            let position = LineIndex::new(source).position(source, offset);
            assert!(
                component_completion_site(source, position, Some(&invoked()), false).is_ok(),
                "{source}"
            );
        }
    }

    #[test]
    fn projection_selects_only_exact_component_name_segments() {
        let source = "<Component />";
        let artifact = rsvelte_projection::ProjectionEngine
            .project(source, Default::default())
            .unwrap();
        let position = Position::new(0, 12);
        let site = component_completion_site(source, position, Some(&invoked()), false).unwrap();
        let ranges = generated_component_ranges(
            &artifact.exact_mappings.unwrap_or_default(),
            &site,
            &artifact.code,
        );
        assert!(!ranges.is_empty());
        assert!(
            ranges
                .iter()
                .all(|range| &artifact.code[range.clone()] == "Component")
        );
    }

    #[test]
    fn generated_fallback_uses_the_source_occurrence_of_a_repeated_component() {
        let source =
            "<script>const sample = '<Comp />';</script><!-- <Comp /> --><Comp a /><Comp b />";
        let artifact = rsvelte_projection::ProjectionEngine
            .project(source, Default::default())
            .unwrap();
        let offset = source.rfind(" b").unwrap() + 2;
        let position = LineIndex::new(source).position(source, offset);
        let site = component_completion_site(source, position, Some(&invoked()), false).unwrap();
        let ranges = generated_component_ranges(&ProjectionMap::default(), &site, &artifact.code);
        assert_eq!(ranges.len(), 1);
        let second = artifact
            .code
            .match_indices("__sveltets_2_ensureComponent(Comp")
            .nth(1)
            .unwrap()
            .0
            + "__sveltets_2_ensureComponent(".len();
        assert_eq!(ranges[0], second..second + 4);
    }

    #[test]
    fn virtual_probes_cover_legacy_and_svelte_five_shapes() {
        let legacy = probe_expression(ComponentPart::Events, "Components.Legacy");
        assert!(legacy.contains("abstract new"));
        assert!(legacy.contains("$$events_def"));
        assert!(legacy.contains("props: infer P"));
        assert!(legacy.contains("$$events?: infer E"));
        let slots = probe_expression(ComponentPart::DefaultSlotLets, "Modern");
        assert!(slots.contains("$$slot_def"));
        assert!(slots.contains("$$slots?: infer S"));
        assert!(slots.contains("default?: infer D"));
    }

    #[test]
    fn query_is_open_completion_resolve_change_and_close_state_machine() {
        let shadow_uri = Uri::from_str("file:///cache/svelte/App.svelte.tsx").unwrap();
        let generated = "use(Components.Button);";
        let range = generated.find("Components.Button").unwrap()
            ..generated.find("Components.Button").unwrap() + "Components.Button".len();
        let mut query =
            ComponentInfoQuery::new(&shadow_uri, generated, range, "Components.Button", 7).unwrap();

        let ComponentInfoAction::Open { text, version, .. } = query.next_action().unwrap() else {
            panic!("expected open");
        };
        assert_eq!(version, 7);
        assert!(text.contains("$$prop_def"));
        let ComponentInfoAction::Request { id, method, .. } = query.next_action().unwrap() else {
            panic!("expected completion");
        };
        assert_eq!(method, "textDocument/completion");
        assert_eq!(id, ComponentInfoRequestId::Completion(ComponentPart::Props));
        query
            .accept_response(
                id,
                json!({ "items": [{
                    "label": "title",
                    "detail": "(property) title: string",
                    "data": { "opaque": true }
                }] }),
            )
            .unwrap();
        let ComponentInfoAction::Request { id, method, params } = query.next_action().unwrap()
        else {
            panic!("expected resolve");
        };
        assert_eq!(method, "completionItem/resolve");
        assert_eq!(params["data"]["opaque"], true);
        query
            .accept_response(
                id,
                json!({
                    "label": "title",
                    "detail": "(property) title: string",
                    "documentation": { "kind": "markdown", "value": "Heading" }
                }),
            )
            .unwrap();
        let ComponentInfoAction::Change { text, version, .. } = query.next_action().unwrap() else {
            panic!("expected event probe change");
        };
        assert_eq!(version, 8);
        assert!(text.contains("$$events_def"));

        for part in [ComponentPart::Events, ComponentPart::DefaultSlotLets] {
            let ComponentInfoAction::Request { id, .. } = query.next_action().unwrap() else {
                panic!("expected completion request");
            };
            assert_eq!(id, ComponentInfoRequestId::Completion(part));
            query.accept_response(id, Value::Null).unwrap();
            if part == ComponentPart::Events {
                assert!(matches!(
                    query.next_action(),
                    Some(ComponentInfoAction::Change { .. })
                ));
            }
        }
        assert!(matches!(
            query.next_action(),
            Some(ComponentInfoAction::Close { .. })
        ));
        let Some(ComponentInfoAction::Complete(info)) = query.next_action() else {
            panic!("expected completed info");
        };
        assert_eq!(info.props.len(), 1);
        assert_eq!(info.props[0].type_detail, "title: string");
        assert_eq!(
            info.props[0].documentation,
            Some(Documentation::MarkupContent(MarkupContent {
                kind: MarkupKind::Markdown,
                value: "Heading".to_string()
            }))
        );
    }

    #[test]
    fn manual_items_include_type_docs_prefix_and_current_word_edit() {
        let source = "<Comp on:ol />";
        let site = site(source, "on:ol", &invoked());
        let docs = Documentation::MarkupContent(MarkupContent {
            kind: MarkupKind::Markdown,
            value: "Dispatched when ready".to_string(),
        });
        let info = ComponentInfo {
            props: vec![ComponentMember {
                name: "title".to_string(),
                type_detail: "title: string".to_string(),
                documentation: None,
            }],
            events: vec![ComponentMember {
                name: "old".to_string(),
                type_detail: "old: CustomEvent<void>".to_string(),
                documentation: Some(docs.clone()),
            }],
            default_slot_lets: vec![ComponentMember {
                name: "item".to_string(),
                type_detail: "item: Row".to_string(),
                documentation: None,
            }],
        };
        let items = info.completion_items(&site);
        assert_eq!(
            items
                .iter()
                .map(|item| item.label.as_str())
                .collect::<Vec<_>>(),
            ["title", "on:old", "let:item"]
        );
        assert_eq!(items[0].kind, Some(CompletionItemKind::FIELD));
        assert_eq!(items[1].documentation, Some(docs));
        let Some(CompletionTextEdit::Edit(edit)) = &items[1].text_edit else {
            panic!("manual item must own its word replacement");
        };
        assert_eq!(edit.range, site.word_range());
        assert_eq!(edit.new_text, "on:old");
    }

    #[test]
    fn colon_trigger_returns_only_event_and_slot_directives() {
        let source = "<Comp on: />";
        let site = site(source, "on:", &colon());
        let member = |name: &str| ComponentMember {
            name: name.to_string(),
            type_detail: format!("{name}: unknown"),
            documentation: None,
        };
        let info = ComponentInfo {
            props: vec![member("prop")],
            events: vec![member("event")],
            default_slot_lets: vec![member("slot")],
        };
        assert_eq!(
            info.completion_items(&site)
                .into_iter()
                .map(|item| item.label)
                .collect::<Vec<_>>(),
            ["on:event", "let:slot"]
        );
    }

    #[test]
    fn whitespace_completion_keeps_the_official_absent_text_edit_shape() {
        let source = "<Comp  />";
        let site = site(source, "<Comp ", &invoked());
        let info = ComponentInfo {
            props: vec![ComponentMember {
                name: "value".to_string(),
                type_detail: "value: string".to_string(),
                documentation: None,
            }],
            ..ComponentInfo::default()
        };
        let item = info.completion_items(&site).remove(0);
        assert_eq!(site.word_range().start, site.word_range().end);
        assert!(item.text_edit.is_none());
    }

    #[test]
    fn generated_helpers_and_svelte_five_metadata_are_filtered() {
        let values = [
            (PROBE_MEMBER, ComponentPart::Events, false),
            ("__public", ComponentPart::Events, true),
            ("$$events", ComponentPart::Props, false),
            ("optional?", ComponentPart::Props, true),
            ("title", ComponentPart::Props, true),
            ("click", ComponentPart::Events, true),
        ];
        for (label, part, expected) in values {
            assert_eq!(
                component_member(
                    &json!({ "label": label, "detail": format!("{label}: any") }),
                    part
                )
                .is_some(),
                expected
            );
        }
        assert_eq!(
            component_member(&json!({ "label": "optional?" }), ComponentPart::Props)
                .unwrap()
                .name,
            "optional"
        );
    }
}
