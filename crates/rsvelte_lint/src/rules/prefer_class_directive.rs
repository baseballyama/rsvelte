//! `svelte/prefer-class-directive` — suggest `class:name={cond}` directives
//! instead of ternary expressions inside `class="..."` attributes.
//!
//! Port of `eslint-plugin-svelte/src/rules/prefer-class-directive.ts`.
//!
//! Category: Stylistic Issues. Type: suggestion. fixable=code.
//! Not recommended (default_severity = Off).
//!
//! Option: `[{ "prefer": "always" | "empty" }]` (default `"empty"`).
//! - `"always"`: flag every ternary in a class attribute.
//! - `"empty"` (default): flag only when at least one branch is an empty string.
//!
//! TEMPLATE rule. Operates on `class` attributes of HTML elements and
//! `<svelte:element>`. Components and `<svelte:self>` are excluded.

use serde_json::Value;

use rsvelte_core::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, ExpressionTag, RegularElement,
    SvelteDynamicElement,
};

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{node_end, node_start, node_type};

static META: RuleMeta = RuleMeta {
    name: "svelte/prefer-class-directive",
    category: RuleCategory::Style,
    fixable: Fixable::Code,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "require class directives instead of ternary expressions",
    options_schema: Some(
        r#"[{"type":"object","properties":{"prefer":{"enum":["always","empty"]}},"additionalProperties":false}]"#,
    ),
};

/// An entry in the parsed conditional map.
#[derive(Debug)]
struct MapEntry {
    /// Start byte offset of the test expression in the source.
    test_start: u32,
    /// End byte offset of the test expression in the source.
    test_end: u32,
    /// The test expression JSON node (to inspect its type for negation logic).
    test_json: Value,
    /// Whether this entry represents the negated branch.
    not: bool,
    /// The class name string for this branch.
    class_name: String,
}

/// Recursively parse a `ConditionalExpression` node into a list of map entries.
/// Returns `None` if any branch yields a non-constant string.
/// Returns `Some([])` if there are too many entries (handled by caller).
fn parse_conditional(expr: &Value) -> Option<Vec<MapEntry>> {
    if node_type(expr) != Some("ConditionalExpression") {
        return None;
    }
    let test = expr.get("test")?;
    let consequent = expr.get("consequent")?;
    let alternate = expr.get("alternate")?;
    let test_start = node_start(test)?;
    let test_end = node_end(test)?;

    let mut entries: Vec<MapEntry> = Vec::new();

    // Process consequent (not negated).
    process_branch(test, test_start, test_end, false, consequent, &mut entries)?;
    // Process alternate (negated).
    process_branch(test, test_start, test_end, true, alternate, &mut entries)?;

    Some(entries)
}

/// Process one branch of a conditional (consequent or alternate).
fn process_branch(
    test: &Value,
    test_start: u32,
    test_end: u32,
    not: bool,
    branch: &Value,
    entries: &mut Vec<MapEntry>,
) -> Option<()> {
    if node_type(branch) == Some("ConditionalExpression") {
        // Nested conditional: recurse but swap the `not` logic for the sub-entries.
        let sub = parse_conditional(branch)?;
        for sub_entry in sub {
            entries.push(MapEntry {
                test_start: sub_entry.test_start,
                test_end: sub_entry.test_end,
                test_json: sub_entry.test_json,
                not: sub_entry.not,
                class_name: sub_entry.class_name,
            });
        }
    } else {
        let s = get_string_if_constant(branch)?;
        entries.push(MapEntry {
            test_start,
            test_end,
            test_json: test.clone(),
            not,
            class_name: s,
        });
    }
    Some(())
}

/// Mirror of `getStringIfConstant`: get the constant string value of a Literal
/// or TemplateLiteral (simple no-expression case).
fn get_string_if_constant(node: &Value) -> Option<String> {
    match node_type(node)? {
        "Literal" => {
            // String literal.
            node.get("value")
                .and_then(Value::as_str)
                .map(str::to_string)
        }
        "TemplateLiteral" => {
            // Only handle the no-interpolation case.
            let exprs = node.get("expressions").and_then(Value::as_array)?;
            if !exprs.is_empty() {
                return None;
            }
            let quasis = node.get("quasis").and_then(Value::as_array)?;
            let cooked: String = quasis
                .iter()
                .filter_map(|q| {
                    q.get("value")
                        .and_then(|v| v.get("cooked"))
                        .and_then(Value::as_str)
                })
                .collect();
            Some(cooked)
        }
        _ => None,
    }
}

/// Mirror of `needParentheses(node, 'not')`. Determines if an expression needs
/// parentheses when prefixed with `!`.
fn need_parens_for_not(node: &Value) -> bool {
    !matches!(
        node_type(node),
        Some(
            "Identifier"
                | "MemberExpression"
                | "CallExpression"
                | "UnaryExpression"
                | "NewExpression"
                | "Literal"
                | "TemplateLiteral"
        )
    )
}

/// Build the condition text for a map entry (mirrors `exprToString`).
/// Reads the source slice for the expression and applies negation logic.
fn expr_to_string(ctx: &LintContext, entry: &MapEntry) -> String {
    let text = ctx.slice(entry.test_start, entry.test_end).to_string();
    if !entry.not {
        return text;
    }
    let node = &entry.test_json;
    // not + BinaryExpression with equality operator → flip the operator.
    if node_type(node) == Some("BinaryExpression") {
        let op = node.get("operator").and_then(Value::as_str).unwrap_or("");
        if matches!(op, "===" | "==" | "!==" | "!=")
            && let (Some(left), Some(right)) = (node.get("left"), node.get("right"))
            && let (Some(ls), Some(le), Some(rs), Some(re)) = (
                node_start(left),
                node_end(left),
                node_start(right),
                node_end(right),
            )
        {
            let left_text = ctx.slice(ls, le);
            let op_text = ctx.slice(le, rs);
            let right_text = ctx.slice(rs, re);
            let flipped_op = match op {
                "===" => op_text.replace("===", "!=="),
                "==" => op_text.replace("==", "!="),
                "!==" => op_text.replace("!==", "==="),
                "!=" => op_text.replace("!=", "=="),
                _ => op_text.to_string(),
            };
            return format!("{left_text}{flipped_op}{right_text}");
        }
    }
    // not + UnaryExpression with `!` → strip the `!`.
    if node_type(node) == Some("UnaryExpression")
        && node.get("operator").and_then(Value::as_str) == Some("!")
        && node.get("prefix").and_then(Value::as_bool) == Some(true)
        && let Some(arg) = node.get("argument")
        && let (Some(as_), Some(ae)) = (node_start(arg), node_end(arg))
    {
        return ctx.slice(as_, ae).to_string();
    }
    // General negation.
    if need_parens_for_not(node) {
        format!("!({text})")
    } else {
        format!("!{text}")
    }
}

/// Get all possible constant string values for a part (mirrors upstream `getStrings`).
///
/// - Text part: returns `Some(vec![text_value])`.
/// - ExpressionTag with a ConditionalExpression: returns all leaf strings from
///   `parse_conditional`. Returns `None` if any leaf is non-constant (unknown).
/// - ExpressionTag with another constant expression: returns `Some(vec![val])`.
/// - ExpressionTag with an unknown expression: returns `None`.
fn get_strings(part: &AttributeValuePart) -> Option<Vec<String>> {
    match part {
        AttributeValuePart::Text(t) => Some(vec![t.data.to_string()]),
        AttributeValuePart::ExpressionTag(tag) => {
            let json = tag.expression.as_json();
            if node_type(json) == Some("ConditionalExpression") {
                let entries = parse_conditional(json)?;
                Some(entries.into_iter().map(|e| e.class_name).collect())
            } else {
                let s = get_string_if_constant(json)?;
                Some(vec![s])
            }
        }
    }
}

/// Mirrors upstream `endsWithNonWord(attr, index)`:
/// Walk from `check_index` backward through parts, finding the first non-empty
/// possible string. If that string's last char is whitespace, returns `true`
/// (ends with non-word). If word char, returns `false`. If all empty → `true`
/// (start of attribute = non-word). If any strings are `None` (unknown), returns
/// `false` (conservative: assume unknown is separated).
///
/// Returns `true` if the boundary ends with a non-word (i.e. NOT a word char).
fn ends_with_non_word(parts: &[AttributeValuePart], check_index: usize) -> bool {
    let mut i = check_index as isize;
    while i >= 0 {
        let part = &parts[i as usize];
        let strings = match get_strings(part) {
            None => return false, // unknown → conservative: not safe to merge
            Some(ss) => ss,
        };
        for s in &strings {
            if !s.is_empty() {
                // First non-empty string: check its last char.
                return s
                    .chars()
                    .next_back()
                    .is_none_or(|c| c.is_ascii_whitespace());
            }
        }
        // All strings empty → keep looking at previous part.
        i -= 1;
    }
    true // start of attribute → non-word boundary
}

/// Mirrors upstream `startsWithNonWord(attr, index)`:
/// Walk from `check_index` forward, finding the first non-empty possible string.
/// Returns `true` if it starts with a non-word character (whitespace), `false` if
/// a word character. If no content → `true` (end of attribute). Unknown → `false`.
fn starts_with_non_word(parts: &[AttributeValuePart], check_index: usize) -> bool {
    let mut i = check_index;
    while i < parts.len() {
        let strings = match get_strings(&parts[i]) {
            None => return false,
            Some(ss) => ss,
        };
        for s in &strings {
            if !s.is_empty() {
                return s.chars().next().is_none_or(|c| c.is_ascii_whitespace());
            }
        }
        i += 1;
    }
    true // end of attribute → non-word boundary
}

/// Whether `s` is a valid CSS class name (only word chars and dashes).
fn is_valid_class_name(s: &str) -> bool {
    !s.is_empty()
        && s.chars()
            .all(|c| c.is_alphanumeric() || c == '-' || c == '_')
}

/// Process a `class` attribute value that is an `Expression` (single mustache,
/// no surrounding text like `class={expr}`).
fn verify_expression_attr(
    ctx: &mut LintContext,
    tag: &ExpressionTag,
    attr_start: u32,
    attr_end: u32,
    prefer_empty: bool,
) {
    let json = tag.expression.as_json();
    if node_type(json) != Some("ConditionalExpression") {
        return;
    }
    let Some(entries) = parse_conditional(json) else {
        return;
    };
    if entries.len() > 2 {
        return;
    }
    // In empty mode, skip when all class names are non-empty.
    if prefer_empty && entries.iter().all(|e| !e.class_name.trim().is_empty()) {
        return;
    }
    // Validate class names.
    for entry in &entries {
        let trimmed = entry.class_name.trim();
        if !trimmed.is_empty() && !is_valid_class_name(trimmed) {
            return;
        }
    }
    // No surrounding parts → always safe to transform (word boundaries don't apply).
    let tag_start = tag.start;
    let class_directives = build_class_directives(ctx, &entries);
    let directive_text = class_directives.join(" ");
    ctx.report_with_fix(
        tag_start,
        tag.end,
        "Unexpected class using the ternary operator.",
        Fix {
            message: "Replace with class directive".to_string(),
            edits: vec![TextEdit {
                start: attr_start,
                end: attr_end,
                new_text: directive_text,
            }],
        },
    );
}

/// Process a `class` attribute value that is a `Sequence` of text + expression parts.
fn verify_sequence_attr(
    ctx: &mut LintContext,
    parts: &[AttributeValuePart],
    attr_start: u32,
    attr_end: u32,
    prefer_empty: bool,
) {
    for (index, part) in parts.iter().enumerate() {
        let AttributeValuePart::ExpressionTag(tag) = part else {
            continue;
        };
        let json = tag.expression.as_json();
        if node_type(json) != Some("ConditionalExpression") {
            continue;
        }
        let Some(entries) = parse_conditional(json) else {
            continue;
        };
        if entries.len() > 2 {
            continue;
        }
        if prefer_empty && entries.iter().all(|e| !e.class_name.trim().is_empty()) {
            continue;
        }
        // Validate class names and check word boundaries.
        //
        // Mirror upstream's variable naming:
        //   prevIsWord = !startsWithNonWord(attr, index + 1)  → what comes AFTER starts with word
        //   nextIsWord = !endsWithNonWord(attr, index - 1)    → what comes BEFORE ends with word
        let prev_is_word = index + 1 < parts.len() && !starts_with_non_word(parts, index + 1);
        let next_is_word = index > 0 && !ends_with_non_word(parts, index - 1);
        let mut can_transform = true;
        // Collect the "space" string (from the empty-string entry, if any).
        let mut space: Option<String> = None;
        for entry in &entries {
            let trimmed = entry.class_name.trim();
            if !entry.class_name.is_empty() {
                // class_name is non-empty (may be all whitespace like " ").
                if !trimmed.is_empty() && !is_valid_class_name(trimmed) {
                    can_transform = false;
                    break;
                }
                // Check word boundaries using the raw class_name (not trimmed).
                // Mirrors: `className[0].trim() && prevIsWord` and
                //          `className[className.length-1].trim() && nextIsWord`
                let starts_word = entry
                    .class_name
                    .chars()
                    .next()
                    .is_some_and(|c| !c.is_ascii_whitespace());
                let ends_word = entry
                    .class_name
                    .chars()
                    .next_back()
                    .is_some_and(|c| !c.is_ascii_whitespace());
                if (starts_word && prev_is_word) || (ends_word && next_is_word) {
                    can_transform = false;
                    break;
                }
                if trimmed.is_empty() {
                    // Whitespace-only class_name → treat as the space separator.
                    space = Some(entry.class_name.clone());
                }
            } else {
                // Truly empty class_name ("").
                if prev_is_word && next_is_word {
                    can_transform = false;
                    break;
                }
                // Capture as space separator.
                space = Some(entry.class_name.clone());
            }
        }
        if !can_transform {
            continue;
        }

        let class_directives = build_class_directives(ctx, &entries);
        let directive_text = class_directives.join(" ");

        // Determine the parts before and after this expression tag (after trimming
        // adjacent whitespace-only text parts).
        let before_parts = &parts[..index];
        let after_parts = &parts[index + 1..];

        // Trim trailing whitespace-only text from before parts and leading from after.
        let effective_before: Vec<&AttributeValuePart> = {
            let mut bp: Vec<&AttributeValuePart> = before_parts.iter().collect();
            // Pop trailing whitespace-only text parts.
            while let Some(last) = bp.last() {
                if let AttributeValuePart::Text(t) = last {
                    if t.data.trim().is_empty() {
                        bp.pop();
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
            bp
        };
        let effective_after: Vec<&AttributeValuePart> = {
            let mut ap: Vec<&AttributeValuePart> = after_parts.iter().collect();
            while !ap.is_empty() {
                if let AttributeValuePart::Text(t) = ap[0] {
                    if t.data.trim().is_empty() {
                        ap.remove(0);
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
            ap
        };

        // Build fix edits.
        if effective_before.is_empty() && effective_after.is_empty() {
            // Entire attribute is this one expression → replace whole attribute.
            ctx.report_with_fix(
                tag.start,
                tag.end,
                "Unexpected class using the ternary operator.",
                Fix {
                    message: "Replace with class directive".to_string(),
                    edits: vec![TextEdit {
                        start: attr_start,
                        end: attr_end,
                        new_text: directive_text,
                    }],
                },
            );
        } else {
            // Complex case: multiple parts. We need to:
            // 1. Trim trailing whitespace from last before-text part.
            // 2. Trim leading whitespace from first after-text part.
            // 3. Replace/remove the expression tag.
            // 4. Insert class directives after the attribute.
            let mut edits: Vec<TextEdit> = Vec::new();

            // Trim the last text part before the tag (remove trailing whitespace).
            // We look at the actual parts (not effective_before which already dropped them).
            if index > 0
                && let Some(AttributeValuePart::Text(t)) = parts[..index].iter().next_back()
            {
                let trimmed_end = t.data.trim_end();
                if trimmed_end != t.data.as_str() {
                    // Trim trailing whitespace: shorten the text node.
                    let new_end = t.start + trimmed_end.len() as u32;
                    if new_end < t.end {
                        if t.data.trim().is_empty() {
                            // Fully remove the whitespace-only text node.
                            edits.push(TextEdit {
                                start: t.start,
                                end: t.end,
                                new_text: String::new(),
                            });
                        } else {
                            // Trim trailing whitespace only.
                            edits.push(TextEdit {
                                start: new_end,
                                end: t.end,
                                new_text: String::new(),
                            });
                        }
                    }
                }
            }

            // Trim the first text part after the tag (remove leading whitespace).
            if index + 1 < parts.len()
                && let Some(AttributeValuePart::Text(t)) = parts[index + 1..].iter().next()
            {
                let trimmed_start = t.data.trim_start();
                if trimmed_start != t.data.as_str() {
                    let removed_len = t.data.len() - trimmed_start.len();
                    let new_start = t.start + removed_len as u32;
                    if t.data.trim().is_empty() {
                        edits.push(TextEdit {
                            start: t.start,
                            end: t.end,
                            new_text: String::new(),
                        });
                    } else {
                        edits.push(TextEdit {
                            start: t.start,
                            end: new_start,
                            new_text: String::new(),
                        });
                    }
                }
            }

            // Replace or remove the expression tag.
            let sep = space.as_deref().unwrap_or(" ");
            let sep_or_space = if sep.is_empty() { " " } else { sep };
            if !effective_before.is_empty() && !effective_after.is_empty() {
                // Both sides have content → replace with separator.
                edits.push(TextEdit {
                    start: tag.start,
                    end: tag.end,
                    new_text: sep_or_space.to_string(),
                });
            } else {
                // Only one side → remove the tag.
                edits.push(TextEdit {
                    start: tag.start,
                    end: tag.end,
                    new_text: String::new(),
                });
            }

            // Insert class directives after the attribute.
            edits.push(TextEdit {
                start: attr_end,
                end: attr_end,
                new_text: format!(" {directive_text}"),
            });

            ctx.report_with_fix(
                tag.start,
                tag.end,
                "Unexpected class using the ternary operator.",
                Fix {
                    message: "Replace with class directive".to_string(),
                    edits,
                },
            );
        }
    }
}

/// Build the `class:name={expr}` directive strings from map entries.
fn build_class_directives(ctx: &LintContext, entries: &[MapEntry]) -> Vec<String> {
    let mut directives: Vec<String> = Vec::new();
    for entry in entries {
        let trimmed = entry.class_name.trim();
        if !trimmed.is_empty() {
            let condition = expr_to_string(ctx, entry);
            directives.push(format!("class:{trimmed}={{{condition}}}"));
        }
    }
    directives
}

/// Check a `class` attribute on an element.
fn check_class_attr(ctx: &mut LintContext, attributes: &[Attribute], prefer_empty: bool) {
    for attr in attributes {
        let Attribute::Attribute(node) = attr else {
            continue;
        };
        if node.name.as_str() != "class" {
            continue;
        }
        match &node.value {
            AttributeValue::Expression(tag) => {
                verify_expression_attr(ctx, tag, node.start, node.end, prefer_empty);
            }
            AttributeValue::Sequence(parts) => {
                verify_sequence_attr(ctx, parts, node.start, node.end, prefer_empty);
            }
            AttributeValue::True(_) => {}
        }
    }
}

#[derive(Default)]
pub struct PreferClassDirective;

impl Rule for PreferClassDirective {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        let prefer_empty = ctx
            .option0()
            .and_then(|v| v.get("prefer"))
            .and_then(Value::as_str)
            != Some("always");
        check_class_attr(ctx, &el.attributes, prefer_empty);
    }

    fn check_svelte_dynamic_element(&self, ctx: &mut LintContext, el: &SvelteDynamicElement) {
        let prefer_empty = ctx
            .option0()
            .and_then(|v| v.get("prefer"))
            .and_then(Value::as_str)
            != Some("always");
        check_class_attr(ctx, &el.attributes, prefer_empty);
    }
}
