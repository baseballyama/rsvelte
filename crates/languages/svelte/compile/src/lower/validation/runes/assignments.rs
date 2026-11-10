//! Upstream's `validate_assignment`, and the pattern assignments this port does not lower.

use rsvelte_svelte_semantic::resolve::{BindingKind, for_each_pattern_target};
use rsvelte_typescript_semantic::scope::DeclarationKind;

use crate::lower::{
    Diagnostic, Kind, NodeIdentifier, Resolution, Span, SyntaxTree, Target, span_of, unsupported,
};

use super::RuneWalk;

/// A name an assignment or a binding cannot change, as upstream's `validate_assignment` sorts it.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Fixed {
    Import,
    Constant,
    EachItem,
    SnippetParameter,
}

/// Upstream `validate_assignment`: `argument`, assigned by the node at `span` or bound by the
/// `bind:` directive at `span`, names nothing that cannot change. The span is asked for only on
/// an error, because a frontend writes nodes with none where it raises none.
pub(super) fn check_assignment(
    javascript: &SyntaxTree,
    res: &Resolution,
    argument: NodeIdentifier,
    binding: bool,
    span: impl FnOnce() -> Span,
) -> Result<(), Diagnostic> {
    let Some(fixed) = fixed(javascript, res, argument, true) else {
        return Ok(());
    };
    let (code, message) = match fixed {
        Fixed::Import | Fixed::Constant => {
            let thing = if fixed == Fixed::Import {
                "import"
            } else {
                "constant"
            };
            let (code, verb) = if binding {
                ("constant_binding", "bind to")
            } else {
                ("constant_assignment", "assign to")
            };
            (code, format!("Cannot {verb} {thing}"))
        }
        Fixed::EachItem => (
            "each_item_invalid_assignment",
            "Cannot reassign or bind to each block argument in runes mode. Use the array and index variables instead (e.g. `array[i] = value` instead of `entry = value`, or `bind:value={array[i]}` instead of `bind:value={entry}`)".to_owned(),
        ),
        Fixed::SnippetParameter => (
            "snippet_parameter_assignment",
            "Cannot reassign or bind to snippet parameter".to_owned(),
        ),
    };
    crate::lower::special::invalid(code, &message, span())
}

/// What makes `argument`, or a name its pattern writes, [`Fixed`]: an `{#each}` item or a snippet
/// parameter only as the whole `argument` (`whole`). As upstream, a default, a rest element and
/// a `for … of` head are not looked into, so a `const` written there compiles.
fn fixed(
    javascript: &SyntaxTree,
    res: &Resolution,
    argument: NodeIdentifier,
    whole: bool,
) -> Option<Fixed> {
    match javascript.kind(argument) {
        Kind::Identifier(_) => {
            let (b, information) = res.binding(argument)?;
            let fixed = match (res.sem.bindings[b].kind, information.kind) {
                (DeclarationKind::Import, _) => Fixed::Import,
                (_, BindingKind::Each) => Fixed::EachItem,
                (_, BindingKind::Snippet) => Fixed::SnippetParameter,
                (DeclarationKind::Const, _)
                | (_, BindingKind::Template | BindingKind::StaticIndex | BindingKind::KeyedIndex) => {
                    Fixed::Constant
                }
                _ => return None,
            };
            (whole || matches!(fixed, Fixed::Import | Fixed::Constant)).then_some(fixed)
        }
        Kind::ArrayPattern(elements) => {
            (elements.iter()).find_map(|&element| fixed(javascript, res, element, false))
        }
        Kind::ObjectPattern(properties) => properties.iter().find_map(|&property| match javascript
            .kind(property)
        {
            Kind::Property { value, .. } => fixed(javascript, res, value, false),
            _ => None,
        }),
        _ => None,
    }
}

impl RuneWalk<'_> {
    /// Refuses a `pattern`, written by `e`, that writes a name the `target` reads through a signal or a call, or a
    /// member of a `$bindable` prop: a destructuring assignment needs upstream's per-path
    /// assignment, and upstream prints a `for … in` or `for … of` head as invalid JavaScript.
    pub(super) fn check_pattern_assignment(
        &self,
        e: NodeIdentifier,
        pattern: NodeIdentifier,
        target: Target,
    ) -> Result<(), Diagnostic> {
        let (javascript, res, accessors) = (self.javascript, self.res, self.custom_element);
        let mut transformed = false;
        for_each_pattern_target(javascript, pattern, &mut |name| {
            transformed |= if javascript.is_identifier(name) {
                res.binding(name)
                    .is_some_and(|(_, information)| match information.kind {
                        BindingKind::Normal => false,
                        // The server reads only a derived through a call.
                        BindingKind::Derived | BindingKind::DerivedBy => true,
                        _ => target == Target::Client,
                    })
            } else {
                target == Target::Client
                    && crate::lower::script::mutated_bindable_prop(res, accessors, javascript, name)
                        .is_some()
            };
        });
        if !transformed {
            return Ok(());
        }
        unsupported(
            "an assignment to state, a prop or a derived in a pattern",
            span_of(javascript, e),
        )
    }
}
