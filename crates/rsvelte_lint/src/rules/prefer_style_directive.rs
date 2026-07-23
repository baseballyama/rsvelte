//! `svelte/prefer-style-directive` — suggest `style:prop` directives instead of
//! `style="prop: value"` attribute declarations.
//!
//! Port of `eslint-plugin-svelte/src/rules/prefer-style-directive.ts`.
//!
//! Category: Stylistic Issues. Type: suggestion. fixable=code.
//! Not recommended (default_severity = Off).
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
    decl_start: u32,
    decl_end: u32,
    /// Whether this is the first node among all root nodes.
    is_first: bool,
    /// Whether this is the last node among all root nodes.
    is_last: bool,
}

/// An inline ternary at the top level of the style value.
struct Inline {
    /// The ExpressionTag byte range in the source (including `{}`).
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
    fn decl_start(&self) -> u32 {
        match self {
            RootNode::Decl(d) => d.decl_start,
            RootNode::Inline(i) => i.expr_start,
        }
    }
    fn decl_end(&self) -> u32 {
        match self {
            RootNode::Decl(d) => d.decl_end,
            RootNode::Inline(i) => i.expr_end,
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

    let mut nodes: Vec<RootNode> = Vec::new();

    // We process parts sequentially.
    // `decl_prop`: accumulated prop name text, or None if not in a declaration.
    // `decl_prop_start`: byte offset where prop name begins.
    // `decl_value_start`: byte offset where value begins (after ':' and whitespace).
    // `in_decl_value`: true once we've seen `:` in a declaration.
    // `decl_start`: byte offset of the start of the current declaration.
    // `prop_has_interp`: the prop name segment had an ExpressionTag.
    // `value_parts`: the value parts (text and expression tags).
    // `unknown_interpolations`: expression tags in unknown positions.

    let mut state: ParseState = ParseState::Top;
    // Current declaration being built.
    let mut cur_decl: Option<CurDecl> = None;

    // Count total parts for is_first/is_last calculation.
    // We'll assign indices after collection.

    for part in parts {
        match part {
            AttributeValuePart::Text(t) => {
                let text = t.raw.as_ref();
                let base = t.start;
                let bytes = text.as_bytes();
                let mut i = 0usize;
                while i < bytes.len() {
                    let b = bytes[i];
                    let abs_pos = base + i as u32;

                    // Skip CSS block comments (`/* … */`) in all states.
                    // PostCSS (used by the oracle) parses comments as separate
                    // nodes rather than as declaration text, so any `/*` in the
                    // Top or PropName state means we are NOT inside a property
                    // declaration and should discard any partially-accumulated
                    // prop and advance past the comment.
                    if b == b'/' && bytes.get(i + 1) == Some(&b'*') {
                        // Drop any partially-accumulated declaration (it is
                        // invalid — a real prop name cannot contain `/*`).
                        if matches!(state, ParseState::PropName) {
                            cur_decl = None;
                            state = ParseState::Top;
                        }
                        // Skip to the end of the comment.
                        i += 2; // past `/*`
                        while i < bytes.len() {
                            if bytes[i] == b'*' && bytes.get(i + 1) == Some(&b'/') {
                                i += 2; // past `*/`
                                break;
                            }
                            i += 1;
                        }
                        continue;
                    }

                    match &state {
                        ParseState::Top => {
                            if b == b';' {
                                // Stray semicolon; skip.
                                i += 1;
                                continue;
                            }
                            if !b.is_ascii_whitespace() {
                                // Start of a new declaration prop name.
                                let cd = CurDecl {
                                    prop: String::new(),
                                    prop_start: abs_pos,
                                    prop_end: abs_pos,
                                    has_prop_interp: false,
                                    value_start: 0,
                                    value_end: 0,
                                    has_value: false,
                                    unknown_interp: false,
                                    important: false,
                                    decl_start: abs_pos,
                                    decl_end: abs_pos,
                                };
                                cur_decl = Some(cd);
                                state = ParseState::PropName;
                                // Don't advance; re-process this byte in PropName state.
                                continue;
                            }
                            // Whitespace → stay in Top.
                            i += 1;
                        }
                        ParseState::PropName => {
                            let cd = cur_decl.as_mut().unwrap();
                            if b == b':' {
                                // End of prop name, start of value.
                                cd.prop_end = abs_pos;
                                state = ParseState::ValueLeadingSpace;
                                i += 1;
                            } else if b == b';' || b == b'{' || b == b'}' {
                                // Unexpected character in prop → mark unknown.
                                cd.unknown_interp = true;
                                state = ParseState::Top;
                                cur_decl = None;
                                i += 1;
                            } else {
                                cd.prop.push(b as char);
                                i += 1;
                            }
                        }
                        ParseState::ValueLeadingSpace => {
                            let cd = cur_decl.as_mut().unwrap();
                            if b == b';' {
                                // Empty value.
                                cd.value_start = abs_pos;
                                cd.value_end = abs_pos;
                                cd.decl_end = abs_pos + 1;
                                finalize_decl(&mut nodes, cur_decl.take());
                                state = ParseState::Top;
                                i += 1;
                            } else if !b.is_ascii_whitespace() {
                                cd.value_start = abs_pos;
                                state = ParseState::Value;
                                // Re-process.
                                continue;
                            } else {
                                i += 1;
                            }
                        }
                        ParseState::Value => {
                            let cd = cur_decl.as_mut().unwrap();
                            if b == b';' {
                                cd.decl_end = abs_pos + 1;
                                cd.value_end = trim_end_pos(text, i, base);
                                cd.has_value = true;
                                finalize_decl(&mut nodes, cur_decl.take());
                                state = ParseState::Top;
                                i += 1;
                            } else if b == b'!' && text[i..].starts_with("!important") {
                                // !important marker.
                                let cd = cur_decl.as_mut().unwrap();
                                cd.important = true;
                                cd.value_end = trim_end_pos(text, i, base);
                                cd.has_value = true;
                                // Skip "!important".
                                i += "!important".len();
                            } else {
                                // Track value_end as we scan (non-whitespace only, so we can
                                // finalize at end-of-parts without a trailing semicolon).
                                if !b.is_ascii_whitespace() {
                                    cd.value_end = abs_pos + 1;
                                    cd.has_value = true;
                                }
                                i += 1;
                            }
                        }
                        ParseState::ValueAfterExpr => {
                            // Text after an expression tag in the value.
                            // Look for `;` to end the declaration.
                            if b == b';' {
                                if let Some(cd) = cur_decl.as_mut() {
                                    cd.decl_end = abs_pos + 1;
                                    // value_end stays as the last expr tag end.
                                }
                                finalize_decl(&mut nodes, cur_decl.take());
                                state = ParseState::Top;
                            }
                            i += 1;
                        }
                    }
                }
                // End of text part: if we are in Value state and no `;` was found,
                // the value continues (possibly into the next expression tag).
            }
            AttributeValuePart::ExpressionTag(tag) => {
                match &state {
                    ParseState::Top => {
                        // Top-level expression tag: check if it's a ternary inline.
                        if let Some(inline) = try_parse_inline(tag, source) {
                            nodes.push(RootNode::Inline(inline));
                        }
                        // Stay in Top state.
                    }
                    ParseState::PropName => {
                        // Expression tag inside prop name → unknown interpolation.
                        if let Some(cd) = cur_decl.as_mut() {
                            cd.has_prop_interp = true;
                        }
                        // Continue in PropName? Actually upstream skips decls with prop interps.
                        // Mark and bail to Top.
                        cur_decl = None;
                        state = ParseState::Top;
                    }
                    ParseState::ValueLeadingSpace => {
                        // Expression tag after `:` and whitespace — value starts here.
                        if let Some(cd) = cur_decl.as_mut() {
                            cd.value_start = tag.start;
                            cd.value_end = tag.end;
                            cd.has_value = true;
                            state = ParseState::ValueAfterExpr;
                        }
                    }
                    ParseState::Value => {
                        // Expression tag inside value — mark as having expression, stay in Value.
                        // The value_end will be updated when we see `;` or end of parts.
                        // For now, extend the "value" range to include this tag.
                        if let Some(cd) = cur_decl.as_mut() {
                            cd.has_value = true;
                        }
                        state = ParseState::ValueAfterExpr;
                    }
                    ParseState::ValueAfterExpr => {
                        // Multiple expression tags in the value are valid value
                        // interpolations (e.g. `color: {r}e{d}`). Just extend the
                        // value range to include this tag.
                        if let Some(cd) = cur_decl.as_mut() {
                            cd.value_end = tag.end;
                        }
                        // Stay in ValueAfterExpr state.
                    }
                }
            }
        }
    }

    // Finalize any dangling declaration at end of parts (no trailing `;`).
    if matches!(state, ParseState::Value | ParseState::ValueAfterExpr)
        && let Some(mut cd) = cur_decl.take()
        && cd.has_value
    {
        // value_end was already updated to the last non-whitespace position
        // (or last ExprTag end) during scanning. Set decl_end to match.
        cd.decl_end = cd.value_end;
        finalize_decl(&mut nodes, Some(cd));
    }

    // Set is_first / is_last.
    let len = nodes.len();
    for (i, n) in nodes.iter_mut().enumerate() {
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

    nodes
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
    has_prop_interp: bool,
    value_start: u32,
    value_end: u32,
    has_value: bool,
    unknown_interp: bool,
    important: bool,
    decl_start: u32,
    decl_end: u32,
}

fn finalize_decl(nodes: &mut Vec<RootNode>, cd: Option<CurDecl>) {
    let Some(cd) = cd else { return };
    if cd.has_prop_interp || cd.unknown_interp || cd.important {
        return;
    }
    let prop = cd.prop.trim().to_string();
    if prop.is_empty() {
        return;
    }
    if !cd.has_value && cd.value_start == 0 {
        return;
    }
    nodes.push(RootNode::Decl(Decl {
        prop,
        prop_start: cd.prop_start,
        value_start: cd.value_start,
        value_end: cd.value_end,
        decl_start: cd.decl_start,
        decl_end: cd.decl_end,
        is_first: false,
        is_last: false,
    }));
}

/// Return the byte position of the last non-whitespace character in
/// `text[..text_idx]`, as an absolute position relative to `base`.
fn trim_end_pos(text: &str, text_idx: usize, base: u32) -> u32 {
    let s = &text[..text_idx];
    let trimmed = s.trim_end();
    base + trimmed.len() as u32
}

/// Try to parse a top-level ExpressionTag as an inline ternary that contains
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
    let pos_lit_quote = if pos_lit_start < source.len() as u32 {
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
                    metadata: Default::default(),
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
    let existing_directives: Vec<&str> = attributes
        .iter()
        .filter_map(|a| {
            if let Attribute::StyleDirective(d) = a {
                Some(d.name.as_str())
            } else {
                None
            }
        })
        .collect();

    for node in &nodes {
        match node {
            RootNode::Decl(d) => {
                // Skip if a style directive for this prop already exists.
                if existing_directives.contains(&d.prop.as_str()) {
                    continue;
                }
                let value_text = ctx.slice(d.value_start, d.value_end).to_string();
                let style_directive = format!("style:{}=\"{}\"", d.prop, value_text);

                // Report at the declaration location.
                // Upstream reports at `decl.loc` which is relative to the attribute.
                // We report at the prop_start position in the source.
                let report_start = d.prop_start;
                let report_end = d.decl_end;

                let fix = if total == 1 {
                    // Only node → replace whole attribute.
                    Fix {
                        message: "Replace with style directive".to_string(),
                        edits: vec![TextEdit {
                            start: attr_start,
                            end: attr_end,
                            new_text: style_directive,
                        }],
                    }
                } else {
                    // Multiple nodes: remove this decl from the style, insert directive.
                    let mut edits = Vec::new();
                    // Remove the decl from the style attribute.
                    let remove_edit = remove_node_edit(&nodes, node, &parts);
                    edits.push(remove_edit);
                    // Insert directive.
                    if d.is_first {
                        // Insert before the attribute.
                        edits.push(TextEdit {
                            start: attr_start,
                            end: attr_start,
                            new_text: format!("{style_directive} "),
                        });
                    } else {
                        // Insert after the attribute.
                        edits.push(TextEdit {
                            start: attr_end,
                            end: attr_end,
                            new_text: format!(" {style_directive}"),
                        });
                    }
                    Fix {
                        message: "Replace with style directive".to_string(),
                        edits,
                    }
                };
                ctx.report_with_fix(report_start, report_end, MESSAGE, fix);
            }
            RootNode::Inline(il) => {
                // Skip if a style directive for this prop already exists.
                if existing_directives.contains(&il.prop.as_str()) {
                    continue;
                }
                // Build the style directive for inline ternary.
                // style:prop={test ? 'value' : null} or style:prop={test ? null : 'value'}
                let test_text = ctx.slice(il.test_start, il.test_end);
                // Get the source text for the span between test and consequent start,
                // and between consequent end and alternate start.
                let consequent_node_start = if il.positive {
                    il.pos_lit_start
                } else {
                    il.neg_lit_start
                };
                let consequent_node_end = if il.positive {
                    il.pos_lit_end
                } else {
                    il.neg_lit_end
                };
                let alternate_node_start = if il.positive {
                    il.neg_lit_start
                } else {
                    il.pos_lit_start
                };
                let _alternate_node_end = if il.positive {
                    il.neg_lit_end
                } else {
                    il.pos_lit_end
                };

                // Build the value text for the positive branch (value_str in quotes).
                let q = il.pos_lit_quote;
                let value_in_quotes = format!("{q}{}{q}", il.value_str);

                // Build the ternary value expression:
                // For `test ? 'css-decl;' : ''` → `{test ? 'value' : null}`
                // We need: `{test_text<from-test-to-consequent-quote><value><from-consequent-end-to-alternate-start>null}`
                // i.e. replicate the original source structure between test and consequent/alternate,
                // but replace the literal content.
                //
                // Upstream uses:
                //   valueText = sourceCode.text.slice(test.range[0], consequent.range[0])
                //   + (positive ? openQuote + decl.value.value + closeQuote : 'null')
                //   + sourceCode.text.slice(consequent.range[1], alternate.range[0])
                //   + (positive ? 'null' : openQuote + decl.value.value + closeQuote)
                //
                // where pos_lit is the string literal with the CSS value.

                let between_test_and_consequent = ctx.slice(il.test_end, consequent_node_start);
                let between_consequent_and_alternate =
                    ctx.slice(consequent_node_end, alternate_node_start);

                let (cons_text, alt_text) = if il.positive {
                    (value_in_quotes.as_str().to_string(), "null".to_string())
                } else {
                    ("null".to_string(), value_in_quotes.as_str().to_string())
                };

                let value_text = format!(
                    "{test_text}{between_test_and_consequent}{cons_text}{between_consequent_and_alternate}{alt_text}"
                );
                let style_directive = format!("style:{}={{{value_text}}}", il.prop);

                let fix = if total == 1 {
                    Fix {
                        message: "Replace with style directive".to_string(),
                        edits: vec![TextEdit {
                            start: attr_start,
                            end: attr_end,
                            new_text: style_directive,
                        }],
                    }
                } else {
                    let mut edits = Vec::new();
                    let remove_edit = remove_node_edit(&nodes, node, &parts);
                    edits.push(remove_edit);
                    if il.is_first {
                        edits.push(TextEdit {
                            start: attr_start,
                            end: attr_start,
                            new_text: format!("{style_directive} "),
                        });
                    } else {
                        edits.push(TextEdit {
                            start: attr_end,
                            end: attr_end,
                            new_text: format!(" {style_directive}"),
                        });
                    }
                    Fix {
                        message: "Replace with style directive".to_string(),
                        edits,
                    }
                };
                // Report at the inline ternary expression (not the tag) to match
                // upstream's `node: node.expression` (the ConditionalExpression inside {}).
                // The column is the column of the ConditionalExpression start.
                // Since we have the tag's `{` at il.expr_start, the expr is at il.expr_start+1.
                let report_start = il.expr_start + 1;
                ctx.report_with_fix(report_start, il.expr_end - 1, MESSAGE, fix);
            }
        }
    }
}

/// Build the TextEdit that removes a node from the style attribute value.
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
        .position(|n| std::ptr::eq(n as *const _, node as *const _))
        .unwrap_or(0);
    let after = nodes.get(idx + 1);
    let before = if idx > 0 { nodes.get(idx - 1) } else { None };
    if let Some(after_node) = after {
        // Remove from this node's start to the next node's start.
        TextEdit {
            start: node.decl_start(),
            end: after_node.decl_start(),
            new_text: String::new(),
        }
    } else if let Some(before_node) = before {
        // Remove from the previous node's end to this node's end.
        TextEdit {
            start: before_node.decl_end(),
            end: node.decl_end(),
            new_text: String::new(),
        }
    } else {
        TextEdit {
            start: node.decl_start(),
            end: node.decl_end(),
            new_text: String::new(),
        }
    }
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
