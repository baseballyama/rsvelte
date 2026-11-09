//! Prints a style sheet the way prettier's postcss printer does, for the subset the parser reads.

use rsvelte_kernel::diagnostics::Unsupported;
use rsvelte_kernel::source::positions::Span;
use rsvelte_stylesheet_syntax::syntax_tree::{Rule, RuleKind, StyleSheet};

/// Each line starts with `indent`; one nesting level adds `unit`.
///
/// # Errors
///
/// [`Unsupported`] if the style sheet contains a comment, which this printer does not place, or
/// text prettier would rewrite (see [`verbatim`]).
pub fn format(
    source_text: &str,
    sheet: &StyleSheet,
    indent: &str,
    unit: &str,
) -> Result<String, Unsupported> {
    if !sheet.comments.is_empty() {
        return Err(Unsupported::at("comments in CSS", sheet.content));
    }
    let mut out = String::new();
    rules(source_text, &sheet.rules, indent, unit, &mut out)?;
    Ok(out)
}

type R = Result<(), Unsupported>;

/// `text` (collapsed when `collapsed`) unless prettier would print it otherwise.
fn checked<'t>(
    source_text: &'t str,
    span: Span,
    keeps: fn(&str) -> bool,
    collapsed: &'t mut String,
) -> Result<&'t str, Unsupported> {
    collapsed.clear();
    let raw = span.text(source_text);
    // Collapsing would also squeeze the whitespace inside a string, which prettier keeps.
    let mut in_string = false;
    let mut previous = ' ';
    for ch in raw.chars() {
        if ch == '"' {
            in_string = !in_string;
        } else if in_string && ch.is_ascii_whitespace() && (ch != ' ' || previous == ' ') {
            return Err(Unsupported::at("CSS that prettier rewrites", span));
        }
        previous = if in_string { ch } else { ' ' };
    }
    collapse(raw.trim(), collapsed);
    if keeps(collapsed) {
        Ok(collapsed)
    } else {
        Err(Unsupported::at("CSS that prettier rewrites", span))
    }
}

fn rules(source_text: &str, list: &[Rule], indent: &str, unit: &str, out: &mut String) -> R {
    let mut prev_end: Option<u32> = None;
    for rule in list {
        if let Some(end) = prev_end {
            // prettier keeps at most one blank line between rules, and none it did not see.
            if blank_line_between(source_text, Span::new(end, rule.span.start_offset))? {
                out.push('\n');
            }
        }
        prev_end = Some(rule.span.end_offset);
        one_rule(source_text, rule, indent, unit, out)?;
    }
    Ok(())
}

fn one_rule(source_text: &str, rule: &Rule, indent: &str, unit: &str, out: &mut String) -> R {
    let mut scratch = String::new();
    out.push_str(indent);
    match &rule.kind {
        RuleKind::Keyframe { prelude, .. } => {
            out.push_str(checked(
                source_text,
                *prelude,
                verbatim::keyframe,
                &mut scratch,
            )?);
            block(source_text, rule, indent, unit, out)?;
        }
        RuleKind::Style { selectors, .. } => {
            for (i, sel) in selectors.iter().enumerate() {
                if i > 0 {
                    out.push_str(",\n");
                    out.push_str(indent);
                }
                selector(source_text, sel, out)?;
            }
            block(source_text, rule, indent, unit, out)?;
        }
        RuleKind::At {
            name,
            prelude,
            block: body,
        } => {
            out.push('@');
            let name = checked(source_text, *name, verbatim::prelude, &mut scratch)?.to_owned();
            out.push_str(&name);
            if !prelude.is_empty() {
                // `@document url(http://…)` puts its `{` on a line of its own.
                if prelude.text(source_text).contains("//")
                    && !matches!(name.as_str(), "media" | "supports" | "import")
                {
                    return Err(Unsupported::at("CSS that prettier rewrites", *prelude));
                }
                out.push(' ');
                out.push_str(checked(
                    source_text,
                    *prelude,
                    verbatim::prelude,
                    &mut scratch,
                )?);
            }
            if body.is_some() {
                block(source_text, rule, indent, unit, out)?;
            } else {
                out.push_str(";\n");
            }
        }
    }
    Ok(())
}

/// A declaration or a nested rule, in the order written.
enum Item<'a> {
    Declaration(&'a rsvelte_stylesheet_syntax::syntax_tree::Declaration),
    Rule(&'a Rule),
}

fn block(source_text: &str, rule: &Rule, indent: &str, unit: &str, out: &mut String) -> R {
    out.push_str(" {\n");
    let inner = format!("{indent}{unit}");
    let mut items: Vec<(Span, Item<'_>)> = rule
        .declarations
        .iter()
        .map(|d| (d.span, Item::Declaration(d)))
        .chain(rule.children.iter().map(|r| (r.span, Item::Rule(r))))
        .collect();
    items.sort_by_key(|(span, _)| span.start_offset);
    let mut prev_end: Option<u32> = None;
    for (span, item) in &items {
        if let Some(end) = prev_end
            && blank_line_between(source_text, Span::new(end, span.start_offset))?
        {
            out.push('\n');
        }
        prev_end = Some(span.end_offset);
        match item {
            Item::Declaration(d) => declaration(source_text, d, &inner, out)?,
            Item::Rule(r) => one_rule(source_text, r, &inner, unit, out)?,
        }
    }
    out.push_str(indent);
    out.push_str("}\n");
    Ok(())
}

fn declaration(
    source_text: &str,
    d: &rsvelte_stylesheet_syntax::syntax_tree::Declaration,
    inner: &str,
    out: &mut String,
) -> R {
    let mut scratch = String::new();
    out.push_str(inner);
    let property = d.property.text(source_text);
    // Prettier keeps a custom property's name as written.
    if property.starts_with("--") {
        out.push_str(property);
    } else {
        out.push_str(&property.to_ascii_lowercase());
    }
    out.push_str(": ");
    // Prettier keeps the line breaks of a grid value,
    // and the space after a value's `!important`.
    let after = &source_text[d.value.end_offset as usize..];
    if property.to_ascii_lowercase().starts_with("grid") && d.value.text(source_text).contains('\n')
        || d.value.text(source_text).ends_with("important")
            && after.starts_with(|c: char| c.is_ascii_whitespace())
    {
        return Err(Unsupported::at("CSS that prettier rewrites", d.value));
    }
    out.push_str(checked(
        source_text,
        d.value,
        verbatim::value,
        &mut scratch,
    )?);
    out.push_str(";\n");
    Ok(())
}

fn selector(
    source_text: &str,
    sel: &rsvelte_stylesheet_syntax::syntax_tree::ComplexSelector,
    out: &mut String,
) -> R {
    use rsvelte_stylesheet_syntax::syntax_tree::Combinator::{
        Child, Descendant, NextSibling, SubsequentSibling,
    };
    for (i, rel) in sel.parts.iter().enumerate() {
        let combinator = match rel.combinator {
            None => "",
            Some(Descendant) => " ",
            Some(Child) => " > ",
            Some(NextSibling) => " + ",
            Some(SubsequentSibling) => " ~ ",
        };
        // A nested selector that starts with a combinator (`> b`) has nothing before it.
        out.push_str(if i == 0 {
            combinator.trim_start()
        } else {
            combinator
        });
        let text = rel.span.text(source_text);
        if !verbatim::compound(text) {
            return Err(Unsupported::at("CSS that prettier rewrites", rel.span));
        }
        out.push_str(text);
    }
    Ok(())
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

/// Whether a blank line follows the item before `gap`; postcss counts from after its `;`.
fn blank_line_between(source_text: &str, gap: Span) -> Result<bool, Unsupported> {
    let text = gap.text(source_text);
    let after = match text.split_once(';') {
        Some((_, rest)) if rest.contains(';') => {
            return Err(Unsupported::at("CSS that prettier rewrites", gap));
        }
        Some((_, rest)) => rest,
        None => text,
    };
    Ok(after.bytes().filter(|&b| b == b'\n').count() >= 2)
}

mod verbatim;
