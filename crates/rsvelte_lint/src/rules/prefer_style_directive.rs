//! `svelte/prefer-style-directive` — suggest `style:prop` directives instead of
//! `style="prop: value"` attribute declarations.
//!
//! Port of `eslint-plugin-svelte/src/rules/prefer-style-directive.ts`.
//!
//! Category: Stylistic Issues. Type: suggestion. fixable=code.
//! Not recommended (`default_severity` = Off).
//!
//! TEMPLATE rule. Operates on `style` attributes of HTML elements and
//! `<svelte:element>`. Components are excluded.
//!
//! Handles two cases:
//! 1. **Declaration** — a static `prop: value` or `prop: {expr}` declaration
//!    inside the style string. Emits `style:prop="value"` or `style:prop="{expr}"`.
//! 2. **Inline ternary** — a `{cond ? 'prop: value;' : ''}` or
//!    `{cond ? '' : 'prop: value;'}` mustache at the top level of the style string.
//!    Emits `style:prop={cond ? 'value' : null}`.

use serde_json::Value;

use rsvelte_core::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, RegularElement, SvelteDynamicElement,
};

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{node_end, node_start, node_type};

static META: RuleMeta = RuleMeta {
    name: "svelte/prefer-style-directive",
    category: RuleCategory::Style,
    fixable: Fixable::Code,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "require style directives instead of style attribute",
    options_schema: None,
};

const MESSAGE: &str = "Can use style directives instead.";

fn source_offset(value: usize) -> u32 {
    u32::try_from(value).expect("source offsets are represented as u32")
}

// ── CSS parsing helpers ────────────────────────────────────────────────────────

/// A parsed CSS declaration extracted from the style attribute value.
struct Decl {
    /// Property name (e.g. `"color"`).
    prop: String,
    /// Byte start of the prop name in the source file.
    prop_start: u32,
    /// The source slice for the value portion (inside the style attr).
    value_start: u32,
    value_end: u32,
    /// Byte start and end of this whole declaration in the source.
    start: u32,
    end: u32,
    /// Whether this is the first node among all root nodes.
    is_first: bool,
    /// Whether this is the last node among all root nodes.
    is_last: bool,
}

/// An inline ternary at the top level of the style value.
struct Inline {
    /// The `ExpressionTag` byte range in the source (including `{}`).
    expr_start: u32,
    expr_end: u32,
    /// Property name extracted from the inline CSS string.
    prop: String,
    /// The value string (e.g. `"20px"`).
    value_str: String,
    /// The test expression source range.
    test_start: u32,
    test_end: u32,
    /// Which branch is positive (`true` = consequent has the CSS, false = alternate).
    positive: bool,
    /// Byte range of the positive string literal node (for source quoting).
    pos_lit_quote: char,
    /// The start/end of the positive literal node (for quoting).
    pos_lit_start: u32,
    pos_lit_end: u32,
    /// The alternate literal start/end.
    neg_lit_start: u32,
    neg_lit_end: u32,
    /// Whether this is the first node among all root nodes.
    is_first: bool,
    /// Whether this is the last node among all root nodes.
    is_last: bool,
}

enum RootNode {
    Decl(Decl),
    Inline(Inline),
}

impl RootNode {
    const fn decl_start(&self) -> u32 {
        match self {
            Self::Decl(d) => d.start,
            Self::Inline(i) => i.expr_start,
        }
    }
    const fn decl_end(&self) -> u32 {
        match self {
            Self::Decl(d) => d.end,
            Self::Inline(i) => i.expr_end,
        }
    }
}

/// Parse the style attribute value (a sequence of text + expression parts) into
/// a list of root nodes (declarations and inline ternaries).
///
/// The parsing is done by walking the parts linearly:
/// - Text parts are split on `;` to find declarations.
/// - Expression tags are classified as either part of a declaration's value
///   (when preceded by `prop-name:`) or as an inline ternary (when at the top
///   level, not inside a declaration).
fn parse_style_value(parts: &[AttributeValuePart], source: &str) -> Vec<RootNode> {
    // Build a virtual CSS text by joining all parts, tracking the source byte
    // offsets for each character position.
    //
    // Strategy: iterate over the parts in order.
    // - Text parts contribute literal characters.
    // - ExpressionTag parts are treated as opaque "slots".
    //
    // We use a state machine with states:
    // - `PropName`: collecting property name characters.
    // - `Colon`: found `:` after prop name.
    // - `Value`: collecting value characters (may contain expression tags).
    // - `Top`: between declarations (whitespace).

    // We process parts sequentially.
    // `decl_prop`: accumulated prop name text, or None if not in a declaration.
    // `decl_prop_start`: byte offset where prop name begins.
    // `decl_value_start`: byte offset where value begins (after ':' and whitespace).
    // `in_decl_value`: true once we've seen `:` in a declaration.
    // `decl_start`: byte offset of the start of the current declaration.
    // `prop_has_interp`: the prop name segment had an ExpressionTag.
    // `value_parts`: the value parts (text and expression tags).
    // `unknown_interpolations`: expression tags in unknown positions.

    let mut parser = StyleValueParser::default();

    // Count total parts for is_first/is_last calculation.
    // We'll assign indices after collection.

    for part in parts {
        match part {
            AttributeValuePart::Text(t) => parser.process_text(t.raw.as_ref(), t.start),
            AttributeValuePart::ExpressionTag(tag) => {
                parser.process_expression(tag, source);
            }
        }
    }

    // Finalize any dangling declaration at end of parts (no trailing `;`).
    if matches!(parser.state, ParseState::Value | ParseState::ValueAfterExpr)
        && let Some(mut cd) = parser.declaration.take()
        && cd.flags.contains(DeclFlags::HAS_VALUE)
    {
        // value_end was already updated to the last non-whitespace position
        // (or last ExprTag end) during scanning. Set decl_end to match.
        cd.end = cd.value_end;
        finalize_decl(&mut parser.nodes, Some(cd));
    }

    // Set is_first / is_last.
    let len = parser.nodes.len();
    for (i, n) in parser.nodes.iter_mut().enumerate() {
        match n {
            RootNode::Decl(d) => {
                d.is_first = i == 0;
                d.is_last = i == len - 1;
            }
            RootNode::Inline(il) => {
                il.is_first = i == 0;
                il.is_last = i == len - 1;
            }
        }
    }

    parser.nodes
}

struct StyleValueParser {
    state: ParseState,
    declaration: Option<CurDecl>,
    nodes: Vec<RootNode>,
}

impl Default for StyleValueParser {
    fn default() -> Self {
        Self {
            state: ParseState::Top,
            declaration: None,
            nodes: Vec::new(),
        }
    }
}

impl StyleValueParser {
    fn process_expression(
        &mut self,
        tag: &rsvelte_core::ast::template::ExpressionTag,
        source: &str,
    ) {
        match self.state {
            ParseState::Top => {
                if let Some(inline) = try_parse_inline(tag, source) {
                    self.nodes.push(RootNode::Inline(inline));
                }
            }
            ParseState::PropName => {
                if let Some(declaration) = &mut self.declaration {
                    declaration.flags.mark(DeclFlags::PROP_INTERPOLATION);
                }
                self.declaration = None;
                self.state = ParseState::Top;
            }
            ParseState::ValueLeadingSpace => {
                if let Some(declaration) = &mut self.declaration {
                    declaration.value_start = tag.start;
                    declaration.value_end = tag.end;
                    declaration.flags.mark(DeclFlags::HAS_VALUE);
                    self.state = ParseState::ValueAfterExpr;
                }
            }
            ParseState::Value => {
                if let Some(declaration) = &mut self.declaration {
                    declaration.flags.mark(DeclFlags::HAS_VALUE);
                }
                self.state = ParseState::ValueAfterExpr;
            }
            ParseState::ValueAfterExpr => {
                if let Some(declaration) = &mut self.declaration {
                    declaration.value_end = tag.end;
                }
            }
        }
    }

    fn process_text(&mut self, text: &str, base: u32) {
        let bytes = text.as_bytes();
        let mut index = 0;
        while index < bytes.len() {
            if self.skip_comment(bytes, &mut index) {
                continue;
            }
            self.process_text_byte(text, base, &mut index);
        }
    }

    fn skip_comment(&mut self, bytes: &[u8], index: &mut usize) -> bool {
        if bytes[*index] != b'/' || bytes.get(*index + 1) != Some(&b'*') {
            return false;
        }
        if matches!(self.state, ParseState::PropName) {
            self.declaration = None;
            self.state = ParseState::Top;
        }
        *index += 2;
        while *index < bytes.len() {
            if bytes[*index] == b'*' && bytes.get(*index + 1) == Some(&b'/') {
                *index += 2;
                break;
            }
            *index += 1;
        }
        true
    }

    fn process_text_byte(&mut self, text: &str, base: u32, index: &mut usize) {
        let byte = text.as_bytes()[*index];
        let position = base + source_offset(*index);
        match self.state {
            ParseState::Top => self.process_top(byte, position, index),
            ParseState::PropName => self.process_property_name(byte, position, index),
            ParseState::ValueLeadingSpace => {
                self.process_value_leading_space(byte, position, index);
            }
            ParseState::Value => self.process_value(text, byte, base, position, index),
            ParseState::ValueAfterExpr => {
                self.process_value_after_expression(byte, position, index);
            }
        }
    }

    fn process_top(&mut self, byte: u8, position: u32, index: &mut usize) {
        if byte == b';' || byte.is_ascii_whitespace() {
            *index += 1;
        } else {
            self.declaration = Some(CurDecl::new(position));
            self.state = ParseState::PropName;
        }
    }

    fn process_property_name(&mut self, byte: u8, position: u32, index: &mut usize) {
        let declaration = self
            .declaration
            .as_mut()
            .expect("property state has declaration");
        if byte == b':' {
            declaration.prop_end = position;
            self.state = ParseState::ValueLeadingSpace;
        } else if byte == b';' || matches!(byte, b'{' | b'}') {
            declaration.flags.mark(DeclFlags::UNKNOWN_INTERPOLATION);
            self.state = ParseState::Top;
            self.declaration = None;
        } else {
            declaration.prop.push(char::from(byte));
        }
        *index += 1;
    }

    fn process_value_leading_space(&mut self, byte: u8, position: u32, index: &mut usize) {
        let declaration = self
            .declaration
            .as_mut()
            .expect("value state has declaration");
        if byte == b';' {
            declaration.value_start = position;
            declaration.value_end = position;
            declaration.end = position + 1;
            finalize_decl(&mut self.nodes, self.declaration.take());
            self.state = ParseState::Top;
            *index += 1;
        } else if !byte.is_ascii_whitespace() {
            declaration.value_start = position;
            self.state = ParseState::Value;
        } else {
            *index += 1;
        }
    }

    fn process_value(&mut self, text: &str, byte: u8, base: u32, position: u32, index: &mut usize) {
        let declaration = self
            .declaration
            .as_mut()
            .expect("value state has declaration");
        if byte == b';' {
            declaration.end = position + 1;
            declaration.value_end = trim_end_pos(text, *index, base);
            declaration.flags.mark(DeclFlags::HAS_VALUE);
            finalize_decl(&mut self.nodes, self.declaration.take());
            self.state = ParseState::Top;
            *index += 1;
        } else if byte == b'!' && text[*index..].starts_with("!important") {
            declaration.flags.mark(DeclFlags::IMPORTANT);
            declaration.value_end = trim_end_pos(text, *index, base);
            declaration.flags.mark(DeclFlags::HAS_VALUE);
            *index += "!important".len();
        } else {
            if !byte.is_ascii_whitespace() {
                declaration.value_end = position + 1;
                declaration.flags.mark(DeclFlags::HAS_VALUE);
            }
            *index += 1;
        }
    }

    fn process_value_after_expression(&mut self, byte: u8, position: u32, index: &mut usize) {
        if byte == b';' {
            if let Some(declaration) = &mut self.declaration {
                declaration.end = position + 1;
            }
            finalize_decl(&mut self.nodes, self.declaration.take());
            self.state = ParseState::Top;
        }
        *index += 1;
    }
}

#[derive(Debug, Clone, PartialEq)]
enum ParseState {
    Top,
    PropName,
    ValueLeadingSpace,
    Value,
    ValueAfterExpr,
}

struct CurDecl {
    prop: String,
    prop_start: u32,
    prop_end: u32,
    flags: DeclFlags,
    value_start: u32,
    value_end: u32,
    start: u32,
    end: u32,
}

impl CurDecl {
    fn new(position: u32) -> Self {
        Self {
            prop: String::new(),
            prop_start: position,
            prop_end: position,
            flags: DeclFlags::default(),
            value_start: 0,
            value_end: 0,
            start: position,
            end: position,
        }
    }
}

#[derive(Clone, Copy, Default)]
struct DeclFlags(u8);

impl DeclFlags {
    const PROP_INTERPOLATION: u8 = 1;
    const HAS_VALUE: u8 = 1 << 1;
    const UNKNOWN_INTERPOLATION: u8 = 1 << 2;
    const IMPORTANT: u8 = 1 << 3;

    const fn contains(self, flag: u8) -> bool {
        self.0 & flag != 0
    }

    const fn mark(&mut self, flag: u8) {
        self.0 |= flag;
    }
}

fn finalize_decl(nodes: &mut Vec<RootNode>, cd: Option<CurDecl>) {
    let Some(cd) = cd else { return };
    if cd.flags.contains(DeclFlags::PROP_INTERPOLATION)
        || cd.flags.contains(DeclFlags::UNKNOWN_INTERPOLATION)
        || cd.flags.contains(DeclFlags::IMPORTANT)
    {
        return;
    }
    let prop = cd.prop.trim().to_string();
    if prop.is_empty() {
        return;
    }
    if !cd.flags.contains(DeclFlags::HAS_VALUE) && cd.value_start == 0 {
        return;
    }
    nodes.push(RootNode::Decl(Decl {
        prop,
        prop_start: cd.prop_start,
        value_start: cd.value_start,
        value_end: cd.value_end,
        start: cd.start,
        end: cd.end,
        is_first: false,
        is_last: false,
    }));
}

/// Return the byte position of the last non-whitespace character in
/// `text[..text_idx]`, as an absolute position relative to `base`.
fn trim_end_pos(text: &str, text_idx: usize, base: u32) -> u32 {
    let s = &text[..text_idx];
    let trimmed = s.trim_end();
    base + source_offset(trimmed.len())
}

/// Try to parse a top-level `ExpressionTag` as an inline ternary that contains
/// a single CSS declaration. Returns `Some(Inline)` if successful.
fn try_parse_inline(
    tag: &rsvelte_core::ast::template::ExpressionTag,
    source: &str,
) -> Option<Inline> {
    let json = tag.expression.as_json();
    if node_type(json) != Some("ConditionalExpression") {
        return None;
    }
    let consequent = json.get("consequent")?;
    let alternate = json.get("alternate")?;
    let test = json.get("test")?;

    // One branch must be an empty string literal, the other a non-empty string literal.
    let is_str_lit = |n: &Value| {
        node_type(n) == Some("Literal") && n.get("value").and_then(Value::as_str).is_some()
    };

    if !is_str_lit(consequent) || !is_str_lit(alternate) {
        return None;
    }
    // Both must be string literals.
    let consequent_str = consequent.get("value").and_then(Value::as_str)?;
    let alternate_str = alternate.get("value").and_then(Value::as_str)?;

    // Exactly one must be non-empty.
    let (positive, css_str, pos_node, neg_node) =
        if !alternate_str.is_empty() && consequent_str.is_empty() {
            (false, alternate_str, alternate, consequent)
        } else if !consequent_str.is_empty() && alternate_str.is_empty() {
            (true, consequent_str, consequent, alternate)
        } else {
            return None;
        };

    // If both are non-empty, skip (upstream: "return" early).
    // Already handled above.

    // Parse the CSS string for a single declaration.
    let (prop, value_str) = parse_css_declaration(css_str)?;

    let test_start = node_start(test)?;
    let test_end = node_end(test)?;
    let pos_lit_start = node_start(pos_node)?;
    let pos_lit_end = node_end(pos_node)?;
    let neg_lit_start = node_start(neg_node)?;
    let neg_lit_end = node_end(neg_node)?;

    // Determine the quote char of the positive literal.
    let pos_lit_quote = if pos_lit_start < source_offset(source.len()) {
        let ch = source.as_bytes()[pos_lit_start as usize];
        if ch == b'\'' { '\'' } else { '"' }
    } else {
        '"'
    };

    Some(Inline {
        expr_start: tag.start,
        expr_end: tag.end,
        prop,
        value_str,
        test_start,
        test_end,
        positive,
        pos_lit_quote,
        pos_lit_start,
        pos_lit_end,
        neg_lit_start,
        neg_lit_end,
        is_first: false,
        is_last: false,
    })
}

/// Parse `"prop: value;"` CSS string, returning `(prop_name, value_string)`.
/// Strips whitespace and trailing `;`.
fn parse_css_declaration(css: &str) -> Option<(String, String)> {
    let s = css.trim().trim_end_matches(';').trim();
    let colon = s.find(':')?;
    let prop = s[..colon].trim().to_string();
    let value = s[colon + 1..].trim().to_string();
    if prop.is_empty() || value.is_empty() {
        return None;
    }
    Some((prop, value))
}

// ── Rule check ────────────────────────────────────────────────────────────────

/// Check a `style` attribute on an element.
fn check_style_attr(ctx: &mut LintContext, attributes: &[Attribute]) {
    // Find the style attribute.
    let style_attr = attributes.iter().find_map(|attr| {
        if let Attribute::Attribute(node) = attr
            && node.name.as_str() == "style"
        {
            return Some(node);
        }
        None
    });
    let Some(style_attr) = style_attr else {
        return;
    };

    // Collect the parts of the style attribute value.
    let parts: Vec<AttributeValuePart> = match &style_attr.value {
        AttributeValue::Sequence(p) => p.clone(),
        AttributeValue::Expression(tag) => {
            vec![AttributeValuePart::ExpressionTag(
                rsvelte_core::ast::template::ExpressionTag {
                    start: tag.start,
                    end: tag.end,
                    expression: tag.expression.clone(),
                    metadata: rsvelte_core::ast::template::TagMetadata::default(),
                },
            )]
        }
        AttributeValue::True(_) => return,
    };

    if parts.is_empty() {
        return;
    }

    let source = ctx.source().to_string();
    let nodes = parse_style_value(&parts, &source);
    let total = nodes.len();
    if total == 0 {
        return;
    }

    let attr_start = style_attr.start;
    let attr_end = style_attr.end;

    // Check for existing style directives on this element, to avoid suggesting
    // when the directive already exists.
    let existing_directives: Vec<String> = attributes
        .iter()
        .filter_map(|a| {
            if let Attribute::StyleDirective(d) = a {
                Some(d.name.to_string())
            } else {
                None
            }
        })
        .collect();

    let mut reporter = StyleDirectiveReporter {
        ctx,
        parts: &parts,
        nodes: &nodes,
        attr_start,
        attr_end,
        existing_directives: &existing_directives,
    };
    for node in &nodes {
        reporter.report(node);
    }
}

struct StyleDirectiveReporter<'borrow, 'source, 'value> {
    ctx: &'borrow mut LintContext<'source>,
    parts: &'borrow [AttributeValuePart<'value>],
    nodes: &'borrow [RootNode],
    attr_start: u32,
    attr_end: u32,
    existing_directives: &'borrow [String],
}

impl StyleDirectiveReporter<'_, '_, '_> {
    fn report(&mut self, node: &RootNode) {
        match node {
            RootNode::Decl(declaration) => self.report_declaration(node, declaration),
            RootNode::Inline(inline) => self.report_inline(node, inline),
        }
    }

    fn report_declaration(&mut self, node: &RootNode, declaration: &Decl) {
        if self
            .existing_directives
            .iter()
            .any(|existing| existing == &declaration.prop)
        {
            return;
        }
        let value = self
            .ctx
            .slice(declaration.value_start, declaration.value_end);
        let directive = format!("style:{}=\"{value}\"", declaration.prop);
        let fix = self.fix(node, directive, declaration.is_first);
        self.ctx
            .report_with_fix(declaration.prop_start, declaration.end, MESSAGE, fix);
    }

    fn report_inline(&mut self, node: &RootNode, inline: &Inline) {
        if self
            .existing_directives
            .iter()
            .any(|existing| existing == &inline.prop)
        {
            return;
        }
        let value = self.inline_value(inline);
        let directive = format!("style:{}={{{value}}}", inline.prop);
        let fix = self.fix(node, directive, inline.is_first);
        self.ctx
            .report_with_fix(inline.expr_start + 1, inline.expr_end - 1, MESSAGE, fix);
    }

    fn inline_value(&self, inline: &Inline) -> String {
        let (consequent_start, consequent_end, alternate_start) = if inline.positive {
            (
                inline.pos_lit_start,
                inline.pos_lit_end,
                inline.neg_lit_start,
            )
        } else {
            (
                inline.neg_lit_start,
                inline.neg_lit_end,
                inline.pos_lit_start,
            )
        };
        let quoted_value = format!(
            "{}{}{}",
            inline.pos_lit_quote, inline.value_str, inline.pos_lit_quote
        );
        let (consequent, alternate) = if inline.positive {
            (quoted_value.as_str(), "null")
        } else {
            ("null", quoted_value.as_str())
        };
        format!(
            "{}{}{}{}{}",
            self.ctx.slice(inline.test_start, inline.test_end),
            self.ctx.slice(inline.test_end, consequent_start),
            consequent,
            self.ctx.slice(consequent_end, alternate_start),
            alternate,
        )
    }

    fn fix(&self, node: &RootNode, directive: String, is_first: bool) -> Fix {
        if self.nodes.len() == 1 {
            return Fix {
                message: "Replace with style directive".to_string(),
                edits: vec![TextEdit {
                    start: self.attr_start,
                    end: self.attr_end,
                    new_text: directive,
                }],
            };
        }
        let insert = if is_first {
            TextEdit {
                start: self.attr_start,
                end: self.attr_start,
                new_text: format!("{directive} "),
            }
        } else {
            TextEdit {
                start: self.attr_end,
                end: self.attr_end,
                new_text: format!(" {directive}"),
            }
        };
        Fix {
            message: "Replace with style directive".to_string(),
            edits: vec![remove_node_edit(self.nodes, node, self.parts), insert],
        }
    }
}

/// Build the `TextEdit` that removes a node from the style attribute value.
/// Mirrors `removeStyle` in upstream: if there's a node after, remove up to
/// the next node's start; if there's a node before, remove from the previous
/// node's end; otherwise remove the node itself.
fn remove_node_edit(
    nodes: &[RootNode],
    node: &RootNode,
    _parts: &[AttributeValuePart],
) -> TextEdit {
    let idx = nodes
        .iter()
        .position(|n| std::ptr::eq(std::ptr::from_ref(n), std::ptr::from_ref(node)))
        .unwrap_or(0);
    let after = nodes.get(idx + 1);
    let before = if idx > 0 { nodes.get(idx - 1) } else { None };
    after.map_or_else(
        || {
            before.map_or_else(
                || TextEdit {
                    start: node.decl_start(),
                    end: node.decl_end(),
                    new_text: String::new(),
                },
                |before_node| TextEdit {
                    start: before_node.decl_end(),
                    end: node.decl_end(),
                    new_text: String::new(),
                },
            )
        },
        |after_node| {
            // Remove from this node's start to the next node's start.
            TextEdit {
                start: node.decl_start(),
                end: after_node.decl_start(),
                new_text: String::new(),
            }
        },
    )
}

#[derive(Default)]
pub struct PreferStyleDirective;

impl Rule for PreferStyleDirective {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        check_style_attr(ctx, &el.attributes);
    }

    fn check_svelte_dynamic_element(&self, ctx: &mut LintContext, el: &SvelteDynamicElement) {
        check_style_attr(ctx, &el.attributes);
    }
}
