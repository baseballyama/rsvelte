//! Upstream's `Identifier` checks: `arguments` stands in a function, a member chain off a rune
//! names a rune, and the rune is called.

use oxc_ast::AstKind;
use oxc_ast::ast::IdentifierReference;
use rsvelte_svelte_semantic::resolve::RUNES;

use super::RuneWalk;
use crate::lower::special::invalid;
use crate::lower::{Diagnostic, Span, span_of};

impl RuneWalk<'_> {
    /// `reference` is the node being entered; its ancestors are the walk's frames.
    pub(super) fn check_rune_reference(
        &self,
        reference: &IdentifierReference<'_>,
    ) -> Result<(), Diagnostic> {
        let name = reference.name.as_str();
        // Upstream counts a method as a function expression, and an arrow as no function.
        if name == "arguments"
            && !(self.frames.iter()).any(|frame| matches!(frame.kind, AstKind::Function(_)))
        {
            return invalid(
                "invalid_arguments_usage",
                "The arguments keyword cannot be used within the template or at the top level of \
                    a component",
                span_of(reference),
            );
        }
        if !RUNES.contains(&name)
            || self.res.symbol(reference).is_some()
            || self.res.is_store_subscription(name)
        {
            return Ok(());
        }
        // Upstream's tree has no parentheses, and no type wrappers once types are erased.
        let mut ancestors = (self.frames.iter().rev()).map(|f| f.kind).filter(|kind| {
            !matches!(
                kind,
                AstKind::ParenthesizedExpression(_)
                    | AstKind::TSAsExpression(_)
                    | AstKind::TSSatisfiesExpression(_)
                    | AstKind::TSNonNullExpression(_)
                    | AstKind::TSTypeAssertion(_)
                    | AstKind::TSInstantiationExpression(_)
            )
        });
        let mut name = name.to_owned();
        let mut current = span_of(&AstKind::IdentifierReference(reference));
        let mut parent = ancestors.next();
        loop {
            let property = match parent {
                Some(AstKind::ComputedMemberExpression(member)) => {
                    return invalid(
                        "rune_invalid_computed_property",
                        "Cannot access a computed property of a rune",
                        span_of(&AstKind::ComputedMemberExpression(member)),
                    );
                }
                Some(AstKind::StaticMemberExpression(member)) => member.property.name.as_str(),
                Some(AstKind::PrivateFieldExpression(member)) => member.field.name.as_str(),
                _ => break,
            };
            name.push('.');
            name.push_str(property);
            current = span_of(&parent.expect("a member expression"));
            parent = ancestors.next();
            if !RUNES.contains(&name.as_str()) {
                // At a template expression's root upstream names the tag, which the walk cannot
                // see.
                let at = parent.map_or(self.tag, |parent| Some(span_of(&parent)));
                return invalid_name(&name, at.unwrap_or(current), at.is_some());
            }
        }
        if matches!(parent, Some(AstKind::CallExpression(_))) {
            return Ok(());
        }
        invalid(
            "rune_missing_parentheses",
            "Cannot use rune without parentheses",
            current,
        )
    }
}

fn invalid_name(name: &str, span: Span, known: bool) -> Result<(), Diagnostic> {
    if !known {
        return Err(Diagnostic::error(
            "unsupported",
            "an invalid rune name at the root of a template attribute",
            span,
        ));
    }
    match name {
        "$effect.active" => invalid(
            "rune_renamed",
            "`$effect.active` is now `$effect.tracking`",
            span,
        ),
        "$state.frozen" => invalid("rune_renamed", "`$state.frozen` is now `$state.raw`", span),
        "$state.is" => invalid(
            "rune_removed",
            "The `$state.is` rune has been removed",
            span,
        ),
        _ => invalid(
            "rune_invalid_name",
            &format!("`{name}` is not a valid rune"),
            span,
        ),
    }
}
