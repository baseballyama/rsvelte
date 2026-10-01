//! compileStyle: the `vue-sfc-trim` plugin on every sheet, and `vue-sfc-scoped` on a scoped one.

use rsv_css::ast::{Rule, RuleKind, Simple};
use rsv_kernel::diag::Unsupported;
use rsv_kernel::emit::Edits;
use rsv_kernel::source::Span;

use super::StyleInput;

/// # Errors
///
/// [`Unsupported`] for a scoped selector the port does not rewrite yet.
pub(super) fn compile(src: &str, style: &StyleInput<'_>, id: &str) -> Result<String, Unsupported> {
    let mut edits = Edits::default();
    let attr = format!("[data-v-{id}]");
    let lo = style.sheet.content.lo;
    for rule in &style.sheet.rules {
        visit(
            src,
            rule,
            lo,
            style.scoped.then_some(attr.as_str()),
            &mut edits,
        )?;
    }
    Ok(edits.apply_in(src, style.sheet.content))
}

fn visit(
    src: &str,
    rule: &Rule,
    floor: u32,
    scope: Option<&str>,
    edits: &mut Edits,
) -> Result<(), Unsupported> {
    // `vue-sfc-trim`: a rule's non-empty `raws.before` and `raws.after` become one newline.
    let before = whitespace_before(src, rule.span.lo, floor);
    if !before.is_empty() {
        edits.replace(before, "\n");
    }
    let block = match &rule.kind {
        RuleKind::Style { block, .. } => Some(*block),
        RuleKind::At { block, .. } => *block,
    };
    if let Some(block) = block {
        let after = whitespace_before(src, block.hi - 1, block.lo + 1);
        if !after.is_empty() {
            edits.replace(after, "\n");
        }
    }
    match &rule.kind {
        RuleKind::Style { selectors, .. } => {
            if let Some(attr) = scope {
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
                                        | Simple::PseudoElement { name, .. } => name.text(src),
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
                    edits.insert(at.hi, attr);
                }
            }
        }
        RuleKind::At { name, .. } => {
            if scope.is_some() && name.text(src).ends_with("keyframes") {
                return Err(Unsupported::at("keyframes in a scoped style", rule.span));
            }
            let inner = block.map_or(floor, |b| b.lo + 1);
            for child in &rule.children {
                visit(src, child, inner, scope, edits)?;
            }
        }
    }
    Ok(())
}

/// The whitespace run that ends at `at`, not reaching below `floor`.
const fn whitespace_before(src: &str, at: u32, floor: u32) -> Span {
    let b = src.as_bytes();
    let mut lo = at;
    while lo > floor && b[lo as usize - 1].is_ascii_whitespace() {
        lo -= 1;
    }
    Span::new(lo, at)
}
