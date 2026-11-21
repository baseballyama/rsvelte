//! Which `$props()` defaults the props object can be inferred from.

use oxc_ast::ast::{BindingPattern, Expression};

use crate::lower::reads_any;

/// The bindings of one `$props()` pattern. The props object is inferred from the defaults, so a
/// default that reads a sibling would infer the object from itself (TS7022).
pub(super) struct Siblings<'e> {
    names: Vec<&'e str>,
    defaults: Vec<(&'e str, Option<&'e Expression<'e>>)>,
}

impl<'e> Siblings<'e> {
    pub(super) fn new(pattern: &'e BindingPattern<'e>) -> Self {
        let BindingPattern::ObjectPattern(object) = pattern else {
            return Self {
                names: Vec::new(),
                defaults: Vec::new(),
            };
        };
        let defaults = object
            .properties
            .iter()
            .filter_map(|property| match &property.value {
                BindingPattern::BindingIdentifier(name) => Some((name.name.as_str(), None)),
                BindingPattern::AssignmentPattern(assignment) => match &assignment.left {
                    BindingPattern::BindingIdentifier(name) => {
                        Some((name.name.as_str(), Some(&assignment.right)))
                    }
                    _ => None,
                },
                _ => None,
            })
            .collect();
        let names = pattern
            .get_binding_identifiers()
            .iter()
            .map(|name| name.name.as_str())
            .collect();
        Self { names, defaults }
    }

    /// The default to infer from: a sibling's own, as svelte2tsx's `typeof sibling`, or `None` for
    /// an untyped prop, as is one that reads a sibling another way, which svelte2tsx types `any`.
    pub(super) fn independent(
        &self,
        mut default: &'e Expression<'e>,
    ) -> Option<&'e Expression<'e>> {
        for _ in 0..=self.defaults.len() {
            if let Expression::Identifier(name) = default.without_parentheses()
                && let Some(&(_, next)) = self.defaults.iter().find(|(n, _)| *n == name.name)
            {
                default = next?;
                continue;
            }
            return (!reads_any(default, &self.names)).then_some(default);
        }
        None
    }
}
