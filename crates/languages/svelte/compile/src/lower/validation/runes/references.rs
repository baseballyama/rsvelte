//! Upstream's `Identifier` checks of a reference to a rune that no call follows.

use oxc_ast::AstKind;
use oxc_ast::ast::IdentifierReference;
use oxc_span::GetSpan;
use rsvelte_svelte_semantic::resolve::RUNES;

use super::RuneWalk;
use crate::lower::special::invalid;
use crate::lower::{Diagnostic, Span};

impl RuneWalk<'_> {
    /// A rune's name, with each member read after it, must be a rune that is called.
    pub(super) fn check_rune_reference(
        &self,
        reference: &IdentifierReference<'_>,
    ) -> Result<(), Diagnostic> {
        let mut name = reference.name.as_str().to_owned();
        if !RUNES.contains(&name.as_str())
            || self.res.symbol(reference).is_some()
            || self.res.is_store_subscription(&name)
        {
            return Ok(());
        }
        let mut current = reference.span;
        // Upstream reads a tree without parentheses or types.
        let mut parents = (self.frames.iter().rev()).map(|f| f.kind).filter(|kind| {
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
        let mut parent = parents.next();
        loop {
            let property = match parent {
                Some(AstKind::StaticMemberExpression(member)) => {
                    Some((member.property.name.as_str(), member.span))
                }
                Some(AstKind::ComputedMemberExpression(member)) => {
                    return invalid(
                        "rune_invalid_computed_property",
                        "Cannot access a computed property of a rune",
                        span(member.span),
                    );
                }
                _ => None,
            };
            let Some((property, member)) = property else {
                break;
            };
            name.push('.');
            name.push_str(property);
            current = member;
            parent = parents.next();
            if !RUNES.contains(&name.as_str()) {
                let at = span(parent.map(|p| p.span()).or(self.tag).unwrap_or(member));
                let renamed = match name.as_str() {
                    "$effect.active" => Some("$effect.tracking"),
                    "$state.frozen" => Some("$state.raw"),
                    _ => None,
                };
                if let Some(replacement) = renamed {
                    let message = format!("`{name}` is now `{replacement}`");
                    return invalid("rune_renamed", &message, at);
                }
                if name == "$state.is" {
                    let message = format!("The `{name}` rune has been removed");
                    return invalid("rune_removed", &message, at);
                }
                let message = format!("`{name}` is not a valid rune");
                return invalid("rune_invalid_name", &message, at);
            }
        }
        if matches!(parent, Some(AstKind::CallExpression(_))) {
            return Ok(());
        }
        invalid(
            "rune_missing_parentheses",
            "Cannot use rune without parentheses",
            span(current),
        )
    }
}

const fn span(span: oxc_span::Span) -> Span {
    Span::new(span.start, span.end)
}
