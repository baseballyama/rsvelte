//! Prints a style sheet the way prettier's postcss printer does, for the subset the parser reads.

use rsv_kernel::diag::Unsupported;
use rsv_kernel::source::Span;

use crate::ast::{Rule, RuleKind, StyleSheet};

/// Each line starts with `indent`; one nesting level adds `unit`.
///
/// # Errors
///
/// [`Unsupported`] if the style sheet contains a comment, which this printer does not place.
pub fn format(
    src: &str,
    sheet: &StyleSheet,
    indent: &str,
    unit: &str,
) -> Result<String, Unsupported> {
    if has_comment(sheet.content.text(src)) {
        return Err(Unsupported::at("comments in CSS", sheet.content));
    }
    let mut out = String::new();
    rules(src, &sheet.rules, indent, unit, &mut out);
    Ok(out)
}

fn has_comment(text: &str) -> bool {
    text.contains("/*")
}

fn rules(src: &str, list: &[Rule], indent: &str, unit: &str, out: &mut String) {
    let mut prev_end: Option<u32> = None;
    for rule in list {
        if let Some(end) = prev_end {
            // prettier keeps at most one blank line between rules, and none it did not see.
            if blank_line_between(src, Span::new(end, rule.span.lo)) {
                out.push('\n');
            }
        }
        prev_end = Some(rule.span.hi);
        out.push_str(indent);
        match &rule.kind {
            RuleKind::Style { selectors, .. } => {
                for (i, sel) in selectors.iter().enumerate() {
                    if i > 0 {
                        out.push_str(",\n");
                        out.push_str(indent);
                    }
                    selector(src, sel, out);
                }
                block(src, rule, indent, unit, out);
            }
            RuleKind::At {
                name,
                prelude,
                block: body,
            } => {
                out.push('@');
                out.push_str(name.text(src));
                if !prelude.is_empty() {
                    out.push(' ');
                    collapse(prelude.text(src), out);
                }
                if body.is_some() {
                    block(src, rule, indent, unit, out);
                } else {
                    out.push_str(";\n");
                }
            }
        }
    }
}

fn block(src: &str, rule: &Rule, indent: &str, unit: &str, out: &mut String) {
    out.push_str(" {\n");
    let inner = format!("{indent}{unit}");
    for d in &rule.decls {
        out.push_str(&inner);
        out.push_str(&d.property.text(src).to_ascii_lowercase());
        out.push_str(": ");
        collapse(d.value.text(src), out);
        out.push_str(";\n");
    }
    rules(src, &rule.children, &inner, unit, out);
    out.push_str(indent);
    out.push_str("}\n");
}

fn selector(src: &str, sel: &crate::ast::ComplexSelector, out: &mut String) {
    use crate::ast::Combinator::{Child, Descendant, NextSibling, SubsequentSibling};
    for rel in &sel.parts {
        match rel.combinator {
            None => {}
            Some(Descendant) => out.push(' '),
            Some(Child) => out.push_str(" > "),
            Some(NextSibling) => out.push_str(" + "),
            Some(SubsequentSibling) => out.push_str(" ~ "),
        }
        out.push_str(rel.span.text(src));
    }
}

fn collapse(text: &str, out: &mut String) {
    let mut first = true;
    for word in text.split_ascii_whitespace() {
        if !first {
            out.push(' ');
        }
        first = false;
        out.push_str(word);
    }
}

fn blank_line_between(src: &str, gap: Span) -> bool {
    gap.text(src).bytes().filter(|&b| b == b'\n').count() >= 2
}
