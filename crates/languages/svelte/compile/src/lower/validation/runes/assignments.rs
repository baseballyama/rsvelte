//! Upstream's `validate_assignment`, and the pattern assignments this port does not lower.

use oxc_ast::ast::{
    AssignmentTarget, AssignmentTargetMaybeDefault, AssignmentTargetProperty, Expression,
    IdentifierReference, MemberExpression, SimpleAssignmentTarget,
};
use rsvelte_svelte_semantic::resolve::BindingKind;

use super::RuneWalk;
use crate::lower::javascript::member_root;
use crate::lower::script::mutates_signal;
use crate::lower::{Diagnostic, Resolution, Span, Target, unsupported};

/// A name an assignment or a binding cannot change, as upstream's `validate_assignment` sorts it.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(super) enum Fixed {
    Import,
    Constant,
    EachItem,
    SnippetParameter,
}

/// Upstream `validate_assignment`: what an assignment or the `bind:` directive (`binding`) at
/// `span` writes is not [`Fixed`]. The span is asked for only on an error.
pub(super) fn check_assignment(
    fixed: Option<Fixed>,
    binding: bool,
    span: impl FnOnce() -> Span,
) -> Result<(), Diagnostic> {
    let Some(fixed) = fixed else {
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
            "Cannot reassign or bind to each block argument in runes mode. Use the array and index \
                variables instead (e.g. `array[i] = value` instead of `entry = value`, or \
                `bind:value={array[i]}` instead of `bind:value={entry}`)".to_owned(),
        ),
        Fixed::SnippetParameter => (
            "snippet_parameter_assignment",
            "Cannot reassign or bind to snippet parameter".to_owned(),
        ),
    };
    crate::lower::special::invalid(code, &message, span())
}

/// What makes the name `name` [`Fixed`]: an `{#each}` item or a snippet parameter only as the
/// whole of what is written (`whole`).
fn fixed_name(res: &Resolution, name: &IdentifierReference<'_>, whole: bool) -> Option<Fixed> {
    let symbol = res.symbol(name)?;
    let flags = res.scoping().symbol_flags(symbol);
    let fixed = if flags.is_import() {
        Fixed::Import
    } else {
        match res.binding(symbol).kind {
            BindingKind::Each => Fixed::EachItem,
            BindingKind::Snippet => Fixed::SnippetParameter,
            BindingKind::Template | BindingKind::StaticIndex | BindingKind::KeyedIndex => {
                Fixed::Constant
            }
            _ if flags.is_const_variable() => Fixed::Constant,
            _ => return None,
        }
    };
    (whole || matches!(fixed, Fixed::Import | Fixed::Constant)).then_some(fixed)
}

/// [`Fixed`] of a `bind:` target.
pub(super) fn fixed_expression(res: &Resolution, e: &Expression<'_>, whole: bool) -> Option<Fixed> {
    // Upstream erases types before it analyzes the template.
    match e.get_inner_expression() {
        Expression::Identifier(name) => fixed_name(res, name, whole),
        _ => None,
    }
}

pub(super) fn fixed_simple(
    res: &Resolution,
    target: &SimpleAssignmentTarget<'_>,
    whole: bool,
) -> Option<Fixed> {
    match target {
        SimpleAssignmentTarget::AssignmentTargetIdentifier(name) => fixed_name(res, name, whole),
        _ => fixed_expression(res, target.get_expression()?, whole),
    }
}

/// [`Fixed`] of `target` or of a name its pattern writes. As upstream, a default, a rest element
/// and a `for … of` head are not looked into, so a `const` written there compiles.
pub(super) fn fixed_target(
    res: &Resolution,
    target: &AssignmentTarget<'_>,
    whole: bool,
) -> Option<Fixed> {
    let element = |element: &AssignmentTargetMaybeDefault<'_>| {
        element
            .as_assignment_target()
            .and_then(|t| fixed_target(res, t, false))
    };
    match target {
        AssignmentTarget::ArrayAssignmentTarget(array) => {
            array.elements.iter().flatten().find_map(element)
        }
        AssignmentTarget::ObjectAssignmentTarget(object) => {
            object
                .properties
                .iter()
                .find_map(|property| match property {
                    AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(p) => p
                        .init
                        .is_none()
                        .then(|| fixed_name(res, &p.binding, false))?,
                    AssignmentTargetProperty::AssignmentTargetPropertyProperty(p) => {
                        element(&p.binding)
                    }
                })
        }
        _ => fixed_simple(res, target.as_simple_assignment_target()?, whole),
    }
}

/// What a pattern writes: a name or a member.
enum Written<'a> {
    Name(&'a IdentifierReference<'a>),
    Member(&'a MemberExpression<'a>),
}

/// Upstream `extract_paths` of an assignment's left side: every name and member it writes, in a
/// default's target and a rest's too.
fn for_each_written<'a>(target: &'a AssignmentTarget<'a>, f: &mut impl FnMut(Written<'a>)) {
    let element = |element: &'a AssignmentTargetMaybeDefault<'a>, f: &mut _| match element {
        AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(d) => {
            for_each_written(&d.binding, f);
        }
        _ => {
            if let Some(target) = element.as_assignment_target() {
                for_each_written(target, f);
            }
        }
    };
    match target {
        AssignmentTarget::ArrayAssignmentTarget(array) => {
            for e in array.elements.iter().flatten() {
                element(e, f);
            }
            if let Some(rest) = &array.rest {
                for_each_written(&rest.target, f);
            }
        }
        AssignmentTarget::ObjectAssignmentTarget(object) => {
            for property in &object.properties {
                match property {
                    AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(p) => {
                        f(Written::Name(&p.binding));
                    }
                    AssignmentTargetProperty::AssignmentTargetPropertyProperty(p) => {
                        element(&p.binding, f);
                    }
                }
            }
            if let Some(rest) = &object.rest {
                for_each_written(&rest.target, f);
            }
        }
        AssignmentTarget::AssignmentTargetIdentifier(name) => f(Written::Name(name)),
        _ => {
            let Some(simple) = target.as_simple_assignment_target() else {
                return;
            };
            if let Some(member) = simple.as_member_expression() {
                f(Written::Member(member));
            } else if let Some(e) = simple
                .get_expression()
                .map(Expression::get_inner_expression)
            {
                match e {
                    Expression::Identifier(name) => f(Written::Name(name)),
                    _ => {
                        if let Some(member) = e.as_member_expression() {
                            f(Written::Member(member));
                        }
                    }
                }
            }
        }
    }
}

impl RuneWalk<'_> {
    /// Refuses a `pattern`, written by the node at `span`, that writes a name the `target` reads
    /// through a signal or a call, or a member of a `$bindable` prop: a destructuring assignment
    /// needs upstream's per-path assignment, and upstream prints a `for … in` or `for … of` head
    /// as invalid JavaScript.
    pub(super) fn check_pattern_assignment(
        &self,
        span: Span,
        pattern: &AssignmentTarget<'_>,
        target: Target,
    ) -> Result<(), Diagnostic> {
        let (res, accessors) = (self.res, self.custom_element);
        let store = |name: &IdentifierReference<'_>| {
            res.symbol(name).is_none() && res.is_store_subscription(&name.name)
        };
        let mut transformed = false;
        for_each_written(pattern, &mut |written| {
            transformed |= match written {
                Written::Name(name) if store(name) => true,
                Written::Member(member) if member_root(member.object()).is_some_and(store) => true,
                Written::Name(name) => {
                    res.symbol(name)
                        .is_some_and(|symbol| match res.binding(symbol).kind {
                            BindingKind::Normal => false,
                            // The server reads only a derived through a call.
                            BindingKind::Derived | BindingKind::DerivedBy => true,
                            _ => target == Target::Client,
                        })
                }
                Written::Member(member) => {
                    target == Target::Client && mutates_signal(res, accessors, member.object())
                }
            };
        });
        if !transformed {
            return Ok(());
        }
        unsupported(
            "an assignment to state, a prop, a derived or a store in a pattern",
            span,
        )
    }
}
