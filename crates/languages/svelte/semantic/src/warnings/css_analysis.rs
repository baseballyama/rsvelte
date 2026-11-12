//! The errors of Svelte's `css-analyze.js`: where `:global` and `&` may stand in a selector.
//! Svelte stops at the first, in the order its walk meets them.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_stylesheet_semantic::matcher::is_explicitly_global;
use rsvelte_stylesheet_syntax::syntax_tree::{
    Combinator, ComplexSelector, RelativeSelector, Rule, RuleKind, Simple,
};

use super::error;

type Found = Result<(), Diagnostic>;

/// A style rule as the selectors in it and in its nested rules see it.
struct Owner<'a> {
    selectors: &'a [ComplexSelector],
    global_block: bool,
    nested: bool,
}

pub(super) fn first_error(rules: &[Rule], source: &str) -> Option<Diagnostic> {
    walk(rules, None, source).err()
}

fn walk(rules: &[Rule], parent: Option<&Owner<'_>>, source: &str) -> Found {
    for rule in rules {
        match &rule.kind {
            RuleKind::At { .. } => walk(&rule.children, parent, source)?,
            RuleKind::Keyframe { .. } => {}
            RuleKind::Style { selectors, .. } => {
                let owner = Owner {
                    selectors,
                    global_block: global_block(rule, selectors, parent.is_some(), source)?,
                    nested: parent.is_some(),
                };
                for selector in &**selectors {
                    complex(selector, &owner, parent, false, source)?;
                }
                walk(&rule.children, Some(&owner), source)?;
            }
        }
    }
    Ok(())
}

/// The `Rule` visitor's checks of a prelude, and whether it is a `:global { … }` block.
fn global_block(
    rule: &Rule,
    selectors: &[ComplexSelector],
    nested: bool,
    source: &str,
) -> Result<bool, Diagnostic> {
    let mut global_block = false;
    for selector in selectors {
        let mut this = false;
        for (index, part) in selector.parts.iter().enumerate() {
            match part.simple.iter().position(|s| s.is_global_block(source)) {
                Some(0) if part.simple.len() > 1 && index == 0 && !nested => {
                    return Err(css(
                        "css_global_block_invalid_modifier_start",
                        MODIFIER_START,
                        part.simple[1].span(),
                    ));
                }
                Some(0) => {
                    global_block = true;
                    this = true;
                    if let Some(combinator) =
                        part.combinator.filter(|c| *c != Combinator::Descendant)
                    {
                        return Err(css(
                            "css_global_block_invalid_combinator",
                            &format!(
                                "A `:global` selector cannot follow a `{}` combinator",
                                name(combinator)
                            ),
                            part.span,
                        ));
                    }
                    let lone = selector.parts.len() == 1 && selector.parts[0].simple.len() == 1;
                    if lone && selectors.len() > 1 {
                        return Err(invalid_list(selectors));
                    }
                    if let Some(declaration) = rule.declarations.first()
                        && lone
                        && selectors.len() == 1
                    {
                        return Err(css(
                            "css_global_block_invalid_declaration",
                            "A top-level `:global {...}` block can only contain rules, not \
                                declarations",
                            declaration.span,
                        ));
                    }
                }
                Some(at) => {
                    return Err(css(
                        "css_global_block_invalid_modifier",
                        "A `:global` selector cannot modify an existing selector",
                        part.simple[at].span(),
                    ));
                }
                None => {}
            }
        }
        if global_block && !this {
            return Err(invalid_list(selectors));
        }
    }
    Ok(global_block)
}

/// The `ComplexSelector`, `RelativeSelector` and `NestingSelector` visitors, in their order.
fn complex(
    selector: &ComplexSelector,
    owner: &Owner<'_>,
    parent: Option<&Owner<'_>>,
    in_pseudo_class: bool,
    source: &str,
) -> Found {
    for (index, part) in selector.parts.iter().enumerate() {
        if index == 0 && !owner.nested && !in_pseudo_class {
            leading_combinator(part)?;
        }
        for simple in &part.simple {
            match simple {
                Simple::Nesting(span) => nesting(*span, owner, parent, source)?,
                Simple::PseudoClass { selectors, .. } => {
                    for selector in selectors {
                        complex(selector, owner, parent, true, source)?;
                    }
                }
                _ => {}
            }
        }
    }
    if let Some(at) = selector
        .parts
        .iter()
        .position(|p| is_explicitly_global(source, p))
    {
        let first = selector.parts[at].simple.first();
        let arguments = matches!(
            first,
            Simple::PseudoClass {
                arguments: Some(_),
                ..
            }
        );
        if in_pseudo_class && !arguments {
            return Err(css(
                "css_global_block_invalid_placement",
                "A `:global` selector cannot be inside a pseudoclass",
                first.span(),
            ));
        }
        if arguments
            && at != 0
            && at != selector.parts.len() - 1
            && !selector.parts[at + 1..]
                .iter()
                .all(|p| is_explicitly_global(source, p))
        {
            return Err(css(
                "css_global_invalid_placement",
                "`:global(...)` can be at the start or end of a selector sequence, but not in the \
                    middle",
                first.span(),
            ));
        }
    }
    for part in &selector.parts {
        for (index, simple) in part.simple.iter().enumerate() {
            let Simple::PseudoClass {
                arguments,
                selectors,
                span,
                ..
            } = simple
            else {
                continue;
            };
            if !simple.is_pseudo(source, &["global"]) {
                continue;
            }
            let child = selectors.first().map(|s| s.parts[0].simple.first());
            if child.is_some_and(is_type) && index != 0 {
                return Err(css(
                    "css_global_invalid_selector_list",
                    "`:global(...)` must not contain type or universal selectors when used in a \
                        compound selector",
                    *span,
                ));
            }
            if let Some(next) = part.simple.iter().nth(index + 1)
                && is_type(next)
            {
                return Err(css(
                    "css_type_selector_invalid_placement",
                    "`:global(...)` must not be followed by a type selector",
                    next.span(),
                ));
            }
            if arguments.is_some()
                && selectors.len() > 1
                && (selector.parts.len() > 1 || part.simple.len() > 1)
            {
                return Err(css(
                    "css_global_invalid_selector",
                    "`:global(...)` must contain exactly one selector",
                    *span,
                ));
            }
        }
    }
    Ok(())
}

/// Outside a rule, a selector cannot start with a combinator.
fn leading_combinator(part: &RelativeSelector) -> Found {
    let Some(combinator) = part.combinator else {
        return Ok(());
    };
    // A leading combinator is always written, so its name is its text.
    let start = part.span.start_offset;
    Err(css(
        "css_selector_invalid",
        "Invalid selector",
        Span::new(start, start + name(combinator).len() as u32),
    ))
}

fn nesting(at: Span, owner: &Owner<'_>, parent: Option<&Owner<'_>>, source: &str) -> Found {
    let Some(parent) = parent else {
        // Outside a rule, `&` may only open a lone `:global(...)`.
        let first = owner.selectors[0].parts[0].simple.first();
        let opens_global = owner.selectors.len() == 1
            && owner.selectors[0].parts[0].simple.len() == 1
            && first.is_pseudo(source, &["global"])
            && matches!(first, Simple::PseudoClass { selectors, .. }
                if selectors.first().is_some_and(|s| s.parts[0].simple.first().span() == at));
        if opens_global {
            return Ok(());
        }
        return Err(css(
            "css_nesting_selector_invalid_placement",
            "Nesting selectors can only be used inside a rule or as the first selector inside a \
                lone `:global(...)`",
            at,
        ));
    };
    let lone =
        parent.selectors[0].parts.len() == 1 && parent.selectors[0].parts[0].simple.len() == 1;
    if parent.global_block && !parent.nested && lone {
        return Err(css(
            "css_global_block_invalid_modifier_start",
            MODIFIER_START,
            at,
        ));
    }
    Ok(())
}

const fn name(combinator: Combinator) -> &'static str {
    match combinator {
        Combinator::Child => ">",
        Combinator::NextSibling => "+",
        Combinator::SubsequentSibling => "~",
        Combinator::Column => "||",
        Combinator::Descendant => " ",
    }
}

const MODIFIER_START: &str =
    "A `:global` selector can only be modified if it is a descendant of other selectors";

fn invalid_list(selectors: &[ComplexSelector]) -> Diagnostic {
    css(
        "css_global_block_invalid_list",
        "A `:global` selector cannot be part of a selector list with entries that don't contain \
            `:global`",
        Span::new(
            selectors[0].span.start_offset,
            selectors[selectors.len() - 1].span.end_offset,
        ),
    )
}

/// Svelte's `TypeSelector`, which a universal selector is too.
const fn is_type(simple: &Simple) -> bool {
    matches!(
        simple,
        Simple::Type(_) | Simple::Universal(_) | Simple::NamespacedType { .. }
    )
}

fn css(code: &'static str, message: &str, span: Span) -> Diagnostic {
    error(code, message, span)
}

#[cfg(test)]
mod tests;
