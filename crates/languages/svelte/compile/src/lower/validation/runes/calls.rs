//! Upstream's `CallExpression` checks of a rune call.

use oxc_ast::ast::{Argument, CallExpression, Expression};

use super::{Body, Parent, Place, RuneWalk, state_invalid_placement};
use crate::lower::{Diagnostic, Target, span_of, unsupported};

impl RuneWalk<'_> {
    /// Upstream's `CallExpression` checks for a rune call, then whether this port lowers it.
    /// A call that ends an optional chain sits in the chain, which is no place for a rune.
    pub(super) fn check_rune(
        &mut self,
        call: &CallExpression<'_>,
        rune: &'static str,
        place: Place,
        chained: bool,
    ) -> Result<(), Diagnostic> {
        let spread = call.arguments.iter().any(Argument::is_spread);
        if rune != "$inspect" && spread {
            return crate::lower::special::invalid(
                "rune_invalid_spread",
                &format!("`{rune}` cannot be called with a spread argument"),
                span_of(call),
            );
        }
        let count = call.arguments.len();
        // Upstream counts the arguments of these before it asks where they are.
        if matches!(rune, "$bindable" | "$host" | "$inspect.trace") {
            check_rune_arguments(call, rune, count)?;
            self.check_rune_placement(call, rune, place)?;
        } else {
            self.check_rune_placement(call, rune, place)?;
            check_rune_arguments(call, rune, count)?;
        }
        let lowered = !chained && !matches!(call.callee, Expression::ChainExpression(_));
        self.refuse_unlowered(call, rune, place, lowered);
        Ok(())
    }

    /// Upstream's placement errors, and its errors for a second `$props()` or `$props.id()`.
    fn check_rune_placement(
        &mut self,
        call: &CallExpression<'_>,
        rune: &'static str,
        place: Place,
    ) -> Result<(), Diagnostic> {
        let parent = place.parent;
        let top = matches!(parent, Parent::Initializer { top: true, .. }) && !place.module;
        let (code, message) = match rune {
            "$bindable" if parent != Parent::PropsDefault => (
                "bindable_invalid_location",
                "`$bindable()` can only be used inside a `$props()` declaration".to_owned(),
            ),
            "$host" if place.module || !self.custom_element => (
                "host_invalid_placement",
                "`$host()` can only be used inside custom element component instances".to_owned(),
            ),
            "$props" | "$props.id" => {
                let seen = if rune == "$props" {
                    &mut self.props
                } else {
                    &mut self.props_id
                };
                if std::mem::replace(seen, true) {
                    (
                        "props_duplicate",
                        format!("Cannot use `{rune}()` more than once"),
                    )
                } else if !top
                    || rune == "$props.id"
                        && !matches!(parent, Parent::Initializer { named: true, .. })
                {
                    let code = if rune == "$props" {
                        "props_invalid_placement"
                    } else {
                        "props_id_invalid_placement"
                    };
                    (
                        code,
                        format!(
                            "`{rune}()` can only be used at the top level of components as a variable declaration initializer"
                        ),
                    )
                } else {
                    return Ok(());
                }
            }
            "$state" | "$state.raw" | "$derived" | "$derived.by"
                if !matches!(
                    parent,
                    Parent::Initializer { .. } | Parent::ClassField | Parent::ConstructorAssignment
                ) =>
            {
                return state_invalid_placement(rune, span_of(call));
            }
            "$effect" | "$effect.pre" if !matches!(parent, Parent::Statement(_)) => (
                "effect_invalid_placement",
                "`$effect()` can only be used as an expression statement".to_owned(),
            ),
            "$inspect.trace" => match parent {
                Parent::Statement(Some((
                    Body {
                        generator: true, ..
                    },
                    true,
                ))) => (
                    "inspect_trace_generator",
                    "`$inspect.trace(...)` cannot be used inside a generator function".to_owned(),
                ),
                Parent::Statement(Some((_, true))) => return Ok(()),
                _ => (
                    "inspect_trace_invalid_placement",
                    "`$inspect.trace(...)` must be the first statement of a function body"
                        .to_owned(),
                ),
            },
            _ => return Ok(()),
        };
        crate::lower::special::invalid(code, &message, span_of(call))
    }

    /// Keeps the first rune call this port does not lower, refused when the walk ends.
    fn refuse_unlowered(
        &mut self,
        call: &CallExpression<'_>,
        rune: &'static str,
        place: Place,
        lowered: bool,
    ) {
        // Upstream splits a destructured state or derived into one declaration per path; this
        // port has no `extract_paths` yet.
        let destructured = matches!(rune, "$state" | "$state.raw" | "$derived" | "$derived.by")
            && matches!(place.parent, Parent::Initializer { named: false, .. });
        let supported = lowered
            && !destructured
            && match rune {
                "$state" | "$state.raw" | "$derived" | "$derived.by" => !place.in_class,
                "$props" | "$props.id" | "$bindable" | "$effect.pending" | "$effect.tracking" => {
                    true
                }
                "$host" => self.custom_element,
                "$effect" | "$effect.pre" => {
                    matches!(place.parent, Parent::Statement(_)) || self.target == Target::Client
                }
                _ => false,
            };
        if supported || self.refused.is_some() {
            return;
        }
        let what = if place.in_class {
            format!("`{rune}` in a class body")
        } else if !lowered {
            format!("`{rune}` in an optional chain")
        } else if destructured {
            format!("a destructured `{rune}` declaration")
        } else {
            format!("`{rune}`")
        };
        self.refused = unsupported::<()>(&what, span_of(call)).err();
    }
}

/// Upstream's errors for a rune called with the wrong number of arguments.
fn check_rune_arguments(
    call: &CallExpression<'_>,
    rune: &'static str,
    count: usize,
) -> Result<(), Diagnostic> {
    let expected = match rune {
        "$props" | "$props.id" | "$host" | "$effect.tracking" if count > 0 => {
            return crate::lower::special::invalid(
                "rune_invalid_arguments",
                &format!("`{rune}` cannot be called with arguments"),
                span_of(call),
            );
        }
        "$derived" | "$derived.by" | "$effect" | "$effect.pre" | "$effect.root"
        | "$inspect().with" | "$state.eager" | "$state.snapshot"
            if count != 1 =>
        {
            "exactly one argument"
        }
        "$bindable" | "$state" | "$state.raw" | "$inspect.trace" if count > 1 => {
            "zero or one arguments"
        }
        "$inspect" if count < 1 => "one or more arguments",
        _ => return Ok(()),
    };
    crate::lower::special::invalid(
        "rune_invalid_arguments_length",
        &format!("`{rune}` must be called with {expected}"),
        span_of(call),
    )
}
