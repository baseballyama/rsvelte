//! prettier-plugin-tailwindcss's `transformSvelte`. Before the plugin prints, it sorts the classes
//! of each `class` attribute and of the `attributes` the options add: the attribute's text in its
//! tree, and every string in the attribute's expressions in the source the plugin prints the
//! expressions from. The scripts and the style sheet sort as their own languages do.

use std::collections::HashMap;
use std::path::Path;
use std::sync::Arc;

use oxc_ast::ast::{StringLiteral, TemplateLiteral};
use oxc_ast_visit::{Visit, walk};
use rsvelte_stylesheet_format::tailwind::{ClassList, Sorter, sorted_part};
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, AttributeValue, Component, Part};
use rsvelte_typescript_tree::document_span;

use super::Span;

#[cfg(test)]
mod tests;

/// What sorts a component's Tailwind classes: the run's sorter, and the file, from whose
/// directory Tailwind is found.
#[derive(Clone, Copy, Debug)]
pub struct Tailwind<'a> {
    pub sorter: &'a Arc<Sorter>,
    pub file: &'a Path,
}

/// A component with its template's classes sorted.
pub(super) struct Sorted {
    /// The source with each string of a class expression sorted. The plugin keeps every
    /// whitespace and duplicate there, so each string keeps its length and every span still holds.
    pub(super) source: String,
    /// The sorted text of each class attribute's text, by the start of its span.
    pub(super) texts: HashMap<u32, String>,
}

/// A class list in the source, and where its sorted part goes.
struct Found {
    /// The part `sortClasses` reorders.
    sorted: Span,
    /// The attribute's text it is in, whose duplicates go; `None` for a string in an expression.
    text: Option<Span>,
}

/// `None` when the template holds no class list to sort.
pub(super) fn sort(
    c: &Component,
    source: &str,
    tailwind: Tailwind<'_>,
) -> Result<Option<Sorted>, String> {
    let attributes = &tailwind.sorter.options().attributes;
    let mut found = Vec::new();
    for attribute in &c.attributes {
        let name = attribute.name.text(source);
        if attribute.kind != AttributeKind::Attribute
            || !(name == "class" || attributes.iter().any(|a| a == name))
        {
            continue;
        }
        let AttributeValue::Parts(parts) = attribute.value else {
            continue;
        };
        let parts = parts.get(&c.parts);
        for (i, part) in parts.iter().enumerate() {
            match *part {
                Part::Text(text) => {
                    let raw = text.text(source);
                    // A class that touches an expression may continue in it.
                    let ignore_first = i > 0 && !raw.starts_with(is_space);
                    let ignore_last = i + 1 < parts.len() && !raw.ends_with(is_space);
                    if let Some(sorted) = part_of(text, raw, ignore_first, ignore_last) {
                        found.push(Found {
                            sorted,
                            text: Some(text),
                        });
                    }
                }
                Part::Expression { expression, .. } => Strings {
                    source,
                    found: &mut found,
                }
                .visit_expression(c.javascript.get_expression(expression)),
            }
        }
    }
    if found.is_empty() {
        return Ok(None);
    }
    let lists: Vec<ClassList<'_>> = (found.iter())
        .map(|f| ClassList {
            text: f.sorted.text(source),
            collapse_whitespace: false,
            remove_duplicates: f.text.is_some(),
        })
        .collect();
    let sorted = tailwind.sorter.sort(tailwind.file, &lists)?;
    let mut out = Sorted {
        source: source.to_owned(),
        texts: HashMap::new(),
    };
    for (f, sorted) in found.iter().zip(sorted) {
        let at = f.sorted.start_offset as usize..f.sorted.end_offset as usize;
        if let Some(text) = f.text {
            let start = text.start_offset as usize;
            let mut whole = text.text(source).to_owned();
            whole.replace_range(at.start - start..at.end - start, &sorted);
            out.texts.insert(text.start_offset, whole);
        } else if sorted.len() == at.len() {
            out.source.replace_range(at, &sorted);
        } else {
            return Err(format!(
                "a string the plugin sorted to another length: {:?}",
                f.sorted.text(source)
            ));
        }
    }
    Ok(Some(out))
}

/// The plugin's whitespace between classes.
const fn is_space(c: char) -> bool {
    matches!(c, '\t' | '\r' | '\x0C' | '\n' | ' ')
}

/// The span of what `sortClasses` reorders of `raw`, the text at `at`.
fn part_of(at: Span, raw: &str, ignore_first: bool, ignore_last: bool) -> Option<Span> {
    let (start, end) = sorted_part(raw, ignore_first, ignore_last)?;
    (start < end).then(|| Span::new(at.start_offset + start as u32, at.start_offset + end as u32))
}

/// Every string and template in an expression: the plugin's `visit` with its `Literal` and
/// `TemplateLiteral` callbacks.
struct Strings<'s, 'f> {
    source: &'s str,
    found: &'f mut Vec<Found>,
}

impl<'a> Visit<'a> for Strings<'_, '_> {
    fn visit_string_literal(&mut self, it: &StringLiteral<'a>) {
        let literal = document_span(it.span);
        let raw = Span::new(literal.start_offset + 1, literal.end_offset - 1);
        if let Some(sorted) = part_of(raw, raw.text(self.source), false, false) {
            self.found.push(Found { sorted, text: None });
        }
    }

    fn visit_template_literal(&mut self, it: &TemplateLiteral<'a>) {
        for (i, quasi) in it.quasis.iter().enumerate() {
            let at = document_span(quasi.span);
            let raw = at.text(self.source);
            debug_assert_eq!(
                raw,
                quasi.value.raw.as_str(),
                "a quasi's span is its raw text"
            );
            let ignore_first = i > 0 && !raw.starts_with(is_space);
            let ignore_last = i < it.expressions.len() && !raw.ends_with(is_space);
            if let Some(sorted) = part_of(at, raw, ignore_first, ignore_last) {
                self.found.push(Found { sorted, text: None });
            }
        }
        walk::walk_template_literal(self, it);
    }
}
