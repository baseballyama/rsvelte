use std::borrow::Cow;

use oxc_ast::ast::Expression;
use oxc_syntax::operator::{BinaryOperator, UnaryOperator};
use rsvelte_kernel::source::characters::is_ecmascript_whitespace as is_space;
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Part, TemplateNode,
};
use rsvelte_typescript_tree::Tree;
use rustc_hash::FxHashSet;
use serde::Deserialize;

use super::element_kind::is_html_like;
use super::nodes;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/prefer-class-directive",
    files: Files::Components,
    configure,
};

#[derive(Default, Deserialize)]
#[serde(deny_unknown_fields)]
struct Options {
    prefer: Option<Prefer>,
}

#[derive(Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
enum Prefer {
    Always,
    Empty,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    Ok(Box::new(PreferClassDirective {
        prefer_empty: options.prefer != Some(Prefer::Always),
    }))
}

#[derive(Debug)]
struct PreferClassDirective {
    /// Report only a conditional with an empty branch.
    prefer_empty: bool,
}

impl SvelteRule for PreferClassDirective {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        let values = Values {
            javascript: &component.javascript,
            source,
        };
        let mut directives = FxHashSet::default();
        for node in &component.nodes {
            let TemplateNode::Element { attributes, .. } = node else {
                continue;
            };
            if !is_html_like(node, source) {
                continue;
            }
            let all = component.attributes(*attributes);
            directives.clear();
            directives.extend(
                all.iter()
                    .filter(|attribute| attribute.kind == AttributeKind::Class)
                    .filter_map(|attribute| attribute.directive_name(&component.modifiers))
                    .map(|name| name.text(source)),
            );
            for attribute in all {
                if attribute.kind != AttributeKind::Attribute
                    || attribute.shorthand
                    || attribute.name.text(source) != "class"
                {
                    continue;
                }
                let AttributeValue::Parts(parts) = attribute.value else {
                    continue;
                };
                let parts = component.parts(parts);
                for (index, part) in parts.iter().enumerate() {
                    if let Part::Expression { expression, span } = *part
                        && let Some((fix, names)) = self.verify(
                            &values,
                            attribute,
                            parts,
                            index,
                            values.javascript.get_expression(expression),
                            span,
                        )
                    {
                        let mut report =
                            Report::range("Unexpected class using the ternary operator.", span)
                                .message_id("unexpected");
                        // A second `class:name` would be a duplicate attribute.
                        if !names.iter().any(|name| directives.contains(name.as_str())) {
                            report = report.fix(fix);
                        }
                        reporter.report(report);
                    }
                }
            }
        }
    }
}

struct Values<'a> {
    javascript: &'a Tree,
    source: &'a str,
}

impl<'a> Values<'a> {
    /// `getStringIfConstant`: the string a literal, a template of constants or a `+` of them is.
    fn constant(expression: &'a Expression<'a>) -> Option<Cow<'a, str>> {
        match expression {
            Expression::StringLiteral(string) => Some(string.value.as_str().map_or_else(
                || Cow::Owned(string.value.display().to_string()),
                Cow::Borrowed,
            )),
            Expression::TemplateLiteral(template) => {
                let mut text = String::new();
                for (i, quasi) in template.quasis.iter().enumerate() {
                    // An invalid escape has no cooked value.
                    text.push_str(&quasi.value.cooked?.display().to_string());
                    if let Some(expression) = template.expressions.get(i) {
                        text.push_str(&Self::constant(expression)?);
                    }
                }
                Some(Cow::Owned(text))
            }
            Expression::BinaryExpression(binary) if binary.operator == BinaryOperator::Addition => {
                let mut text = Self::constant(&binary.left)?.into_owned();
                text.push_str(&Self::constant(&binary.right)?);
                Some(Cow::Owned(text))
            }
            _ => None,
        }
    }

    /// Every string a conditional's branches may be, in order; `None` when one is not constant.
    fn branches(expression: &'a Expression<'a>, out: &mut Vec<Cow<'a, str>>) -> Option<()> {
        if let Expression::ConditionalExpression(conditional) = expression {
            Self::branches(&conditional.consequent, out)?;
            Self::branches(&conditional.alternate, out)
        } else {
            out.push(Self::constant(expression)?);
            Some(())
        }
    }

    /// Every string a value part may be; `None` when one is unknown.
    fn strings(&self, part: &Part) -> Option<Vec<Cow<'a, str>>> {
        let mut out = Vec::new();
        match *part {
            Part::Text(span) => out.push(rsvelte_markup_syntax::decode_attribute(
                span.text(self.source),
            )),
            Part::Expression { expression, .. } => {
                Self::branches(self.javascript.get_expression(expression), &mut out)?;
            }
        }
        Some(out)
    }

    /// Whether the first character the parts from `parts` may start with is a space, or there is
    /// none; `false` when unknown.
    fn starts_with_space(&self, parts: &[Part]) -> bool {
        for part in parts {
            let Some(strings) = self.strings(part) else {
                return false;
            };
            if let Some(first) = strings.iter().find_map(|s| s.chars().next()) {
                return is_space(first);
            }
        }
        true
    }

    fn ends_with_space(&self, parts: &[Part]) -> bool {
        for part in parts.iter().rev() {
            let Some(strings) = self.strings(part) else {
                return false;
            };
            if let Some(last) = strings.iter().find_map(|s| s.chars().next_back()) {
                return is_space(last);
            }
        }
        true
    }

    /// `test` as a directive's value, negated when `not`.
    fn condition(&self, test: &Expression<'_>, not: bool) -> String {
        let source_of = |expression: &Expression<'_>| nodes::text(expression, self.source);
        if !not {
            return source_of(test).to_owned();
        }
        match test {
            Expression::BinaryExpression(binary)
                if matches!(
                    binary.operator,
                    BinaryOperator::StrictEquality
                        | BinaryOperator::Equality
                        | BinaryOperator::StrictInequality
                        | BinaryOperator::Inequality
                ) =>
            {
                let between = &self.source[nodes::span(&binary.left).end_offset as usize
                    ..nodes::span(&binary.right).start_offset as usize];
                let between = if matches!(
                    binary.operator,
                    BinaryOperator::StrictEquality | BinaryOperator::Equality
                ) {
                    swap_equality(between, b'=', '!')
                } else {
                    swap_equality(between, b'!', '=')
                };
                format!(
                    "{}{between}{}",
                    source_of(&binary.left),
                    source_of(&binary.right)
                )
            }
            Expression::UnaryExpression(unary) if unary.operator == UnaryOperator::LogicalNot => {
                source_of(&unary.argument).to_owned()
            }
            _ if needs_parentheses(test) => format!("!({})", source_of(test)),
            _ => format!("!{}", source_of(test)),
        }
    }
}

/// `between.replace(/[=](={1,2})/g, '!$1')`, or the same with `!` and `=` swapped.
fn swap_equality(between: &str, from: u8, to: char) -> String {
    let bytes = between.as_bytes();
    let mut out = String::with_capacity(between.len());
    let mut at = 0;
    while at < bytes.len() {
        if bytes[at] == from && bytes.get(at + 1) == Some(&b'=') {
            let run = if bytes.get(at + 2) == Some(&b'=') {
                2
            } else {
                1
            };
            out.push(to);
            out.push_str(&between[at + 1..at + 1 + run]);
            at += 1 + run;
        } else {
            let c = between[at..].chars().next().expect("in bounds");
            out.push(c);
            at += c.len_utf8();
        }
    }
    out
}

/// `#a in b` is a `BinaryExpression` to `ESTree`.
const fn needs_parentheses(expression: &Expression<'_>) -> bool {
    matches!(
        expression,
        Expression::ArrowFunctionExpression(_)
            | Expression::AssignmentExpression(_)
            | Expression::BinaryExpression(_)
            | Expression::PrivateInExpression(_)
            | Expression::ConditionalExpression(_)
            | Expression::LogicalExpression(_)
            | Expression::SequenceExpression(_)
            | Expression::UnaryExpression(_)
            | Expression::UpdateExpression(_)
    )
}

fn is_class_name(name: &str) -> bool {
    name.bytes()
        .all(|b| b.is_ascii_alphanumeric() || b == b'_' || b == b'-')
}

impl PreferClassDirective {
    /// The fix, and the classes it writes as directives.
    fn verify<'a>(
        &self,
        values: &Values<'a>,
        attribute: &Attribute,
        parts: &[Part],
        index: usize,
        expression: &'a Expression<'a>,
        span: Span,
    ) -> Option<(Fix, Vec<String>)> {
        let Expression::ConditionalExpression(conditional) = expression else {
            return None;
        };
        let test = &conditional.test;
        // A nested conditional makes more than two classes, which is too complicated.
        let names = [
            Values::constant(&conditional.consequent)?,
            Values::constant(&conditional.alternate)?,
        ];
        if self.prefer_empty && names.iter().all(|n| !n.trim_matches(is_space).is_empty()) {
            return None;
        }
        let next_is_word = !values.starts_with_space(&parts[index + 1..]);
        let previous_is_word = !values.ends_with_space(&parts[..index]);
        for name in &names {
            match (name.chars().next(), name.chars().next_back()) {
                (Some(first), Some(last)) => {
                    // Upstream pairs each end of the class with the opposite neighbour.
                    if !is_class_name(name.trim_matches(is_space))
                        || (!is_space(first) && next_is_word)
                        || (!is_space(last) && previous_is_word)
                    {
                        return None;
                    }
                }
                _ if next_is_word && previous_is_word => return None,
                _ => {}
            }
        }
        let mut directives = Vec::new();
        let mut classes = Vec::new();
        let mut space = " ";
        for (name, not) in names.iter().zip([false, true]) {
            let trimmed = name.trim_matches(is_space);
            if trimmed.is_empty() {
                space = name;
            } else {
                classes.push(trimmed.to_owned());
                directives.push(format!(
                    "class:{trimmed}={{{}}}",
                    values.condition(test, not)
                ));
            }
        }
        let directives = directives.join(" ");
        let source = values.source;
        let mut fix = Fix::new();
        let mut before = &parts[..index];
        while let Some((&Part::Text(text), rest)) = before.split_last() {
            let value = text.text(source);
            if value.trim_matches(is_space).is_empty() {
                fix.push(text, "");
                before = rest;
                continue;
            }
            let trimmed = value.trim_end_matches(is_space);
            if trimmed.len() != value.len() {
                fix.push(text, trimmed);
            }
            break;
        }
        let mut after = &parts[index + 1..];
        while let Some((&Part::Text(text), rest)) = after.split_first() {
            let value = text.text(source);
            if value.trim_matches(is_space).is_empty() {
                fix.push(text, "");
                after = rest;
                continue;
            }
            let trimmed = value.trim_start_matches(is_space);
            if trimmed.len() != value.len() {
                fix.push(text, trimmed);
            }
            break;
        }
        if before.is_empty() && after.is_empty() {
            return Some((Fix::replace(attribute.span, directives), classes));
        }
        if before.is_empty() || after.is_empty() {
            fix.push(span, "");
        } else {
            fix.push(span, if space.is_empty() { " " } else { space });
        }
        fix.push(
            Span::new(attribute.span.end_offset, attribute.span.end_offset),
            format!(" {directives}"),
        );
        Some((fix, classes))
    }
}
