//! compileStyle: the `vue-sfc-trim` plugin on every sheet, and `vue-sfc-scoped` on a scoped one.

use rsvelte_kernel::diagnostics::diagnostic::Unsupported;
use rsvelte_kernel::output::emitter::Edits;
use rsvelte_kernel::source::positions::Span;
use rsvelte_stylesheet::syntax_tree::{Rule, RuleKind, Simple};

use crate::syntax_tree::Style;

/// # Errors
///
/// [`Unsupported`] for a scoped selector the port does not rewrite yet.
pub(super) fn compile(
    source_text: &str,
    style: &Style,
    identifier: &str,
) -> Result<String, Unsupported> {
    let mut edits = Edits::default();
    let attribute = format!("[data-v-{identifier}]");
    let start_offset = style.sheet.content.start_offset;
    for rule in &style.sheet.rules {
        visit(
            source_text,
            rule,
            start_offset,
            style.scoped.then_some(attribute.as_str()),
            &mut edits,
        )?;
    }
    Ok(edits.apply_in(source_text, style.sheet.content))
}

fn visit(
    source_text: &str,
    rule: &Rule,
    floor: u32,
    scope: Option<&str>,
    edits: &mut Edits,
) -> Result<(), Unsupported> {
    // `vue-sfc-trim`: a rule's non-empty `raws.before` and `raws.after` become one newline.
    let before = whitespace_before(source_text, rule.span.start_offset, floor);
    if !before.is_empty() {
        edits.replace(before, "\n");
    }
    let block = match &rule.kind {
        RuleKind::Style { block, .. } => Some(*block),
        RuleKind::At { block, .. } => *block,
    };
    if let Some(block) = block {
        let after = whitespace_before(source_text, block.end_offset - 1, block.start_offset + 1);
        if !after.is_empty() {
            edits.replace(after, "\n");
        }
    }
    match &rule.kind {
        RuleKind::Style { selectors, .. } => {
            if let Some(attribute) = scope {
                for sel in selectors {
                    // `rewriteSelector`: after the last node that is neither a pseudo nor a
                    // combinator.
                    let mut last = None;
                    for part in &sel.parts {
                        for s in &part.simple {
                            match s {
                                Simple::PseudoClass { .. } | Simple::PseudoElement { .. } => {
                                    let name = match s {
                                        Simple::PseudoClass { name, .. }
                                        | Simple::PseudoElement { name, .. } => {
                                            name.text(source_text)
                                        }
                                        _ => "",
                                    };
                                    if matches!(
                                        name,
                                        "deep"
                                            | "global"
                                            | "slotted"
                                            | "v-deep"
                                            | "v-global"
                                            | "v-slotted"
                                            | "is"
                                            | "where"
                                    ) {
                                        return Err(Unsupported::at(
                                            "this pseudo-class in a scoped style",
                                            s.span(),
                                        ));
                                    }
                                }
                                Simple::Universal(span) => {
                                    return Err(Unsupported::at(
                                        "a universal selector in a scoped style",
                                        *span,
                                    ));
                                }
                                _ => last = Some(s.span()),
                            }
                        }
                    }
                    let Some(at) = last else {
                        return Err(Unsupported::at(
                            "a scoped selector of pseudo-classes only",
                            sel.span,
                        ));
                    };
                    edits.insert(at.end_offset, attribute);
                }
            }
        }
        RuleKind::At { name, .. } => {
            if scope.is_some() && name.text(source_text).ends_with("keyframes") {
                return Err(Unsupported::at("keyframes in a scoped style", rule.span));
            }
            let inner = block.map_or(floor, |b| b.start_offset + 1);
            for child in &rule.children {
                visit(source_text, child, inner, scope, edits)?;
            }
        }
    }
    Ok(())
}

/// The whitespace run that ends at `at`, not reaching below `floor`.
const fn whitespace_before(source_text: &str, at: u32, floor: u32) -> Span {
    let b = source_text.as_bytes();
    let mut start_offset = at;
    while start_offset > floor && b[start_offset as usize - 1].is_ascii_whitespace() {
        start_offset -= 1;
    }
    Span::new(start_offset, at)
}
