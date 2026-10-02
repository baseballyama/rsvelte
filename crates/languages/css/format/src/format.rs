//! Prints a style sheet the way prettier's postcss printer does, for the subset the parser reads.

use rsvelte_kernel::diagnostics::diagnostic::Unsupported;
use rsvelte_kernel::source::positions::Span;
use rsvelte_stylesheet::syntax_tree::{Rule, RuleKind, StyleSheet};

/// Each line starts with `indent`; one nesting level adds `unit`.
///
/// # Errors
///
/// [`Unsupported`] if the style sheet contains a comment, which this printer does not place.
pub fn format(
    source_text: &str,
    sheet: &StyleSheet,
    indent: &str,
    unit: &str,
) -> Result<String, Unsupported> {
    if has_comment(sheet.content.text(source_text)) {
        return Err(Unsupported::at("comments in CSS", sheet.content));
    }
    let mut out = String::new();
    rules(source_text, &sheet.rules, indent, unit, &mut out);
    Ok(out)
}

fn has_comment(text: &str) -> bool {
    text.contains("/*")
}

fn rules(source_text: &str, list: &[Rule], indent: &str, unit: &str, out: &mut String) {
    let mut prev_end: Option<u32> = None;
    for rule in list {
        if let Some(end) = prev_end {
            // prettier keeps at most one blank line between rules, and none it did not see.
            if blank_line_between(source_text, Span::new(end, rule.span.start_offset)) {
                out.push('\n');
            }
        }
        prev_end = Some(rule.span.end_offset);
        out.push_str(indent);
        match &rule.kind {
            RuleKind::Style { selectors, .. } => {
                for (i, sel) in selectors.iter().enumerate() {
                    if i > 0 {
                        out.push_str(",\n");
                        out.push_str(indent);
                    }
                    selector(source_text, sel, out);
                }
                block(source_text, rule, indent, unit, out);
            }
            RuleKind::At {
                name,
                prelude,
                block: body,
            } => {
                out.push('@');
                out.push_str(name.text(source_text));
                if !prelude.is_empty() {
                    out.push(' ');
                    collapse(prelude.text(source_text), out);
                }
                if body.is_some() {
                    block(source_text, rule, indent, unit, out);
                } else {
                    out.push_str(";\n");
                }
            }
        }
    }
}

fn block(source_text: &str, rule: &Rule, indent: &str, unit: &str, out: &mut String) {
    out.push_str(" {\n");
    let inner = format!("{indent}{unit}");
    for d in &rule.declarations {
        out.push_str(&inner);
        out.push_str(&d.property.text(source_text).to_ascii_lowercase());
        out.push_str(": ");
        collapse(d.value.text(source_text), out);
        out.push_str(";\n");
    }
    rules(source_text, &rule.children, &inner, unit, out);
    out.push_str(indent);
    out.push_str("}\n");
}

fn selector(
    source_text: &str,
    sel: &rsvelte_stylesheet::syntax_tree::ComplexSelector,
    out: &mut String,
) {
    use rsvelte_stylesheet::syntax_tree::Combinator::{
        Child, Descendant, NextSibling, SubsequentSibling,
    };
    for rel in &sel.parts {
        match rel.combinator {
            None => {}
            Some(Descendant) => out.push(' '),
            Some(Child) => out.push_str(" > "),
            Some(NextSibling) => out.push_str(" + "),
            Some(SubsequentSibling) => out.push_str(" ~ "),
        }
        out.push_str(rel.span.text(source_text));
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

fn blank_line_between(source_text: &str, gap: Span) -> bool {
    gap.text(source_text)
        .bytes()
        .filter(|&b| b == b'\n')
        .count()
        >= 2
}
