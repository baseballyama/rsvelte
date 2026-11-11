//! `$.derived`'s callback, for `$derived(…)` in the script and for a component's memoized props.

use oxc_ast::ast::Expression;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::resolve::Resolution;

use super::Builder;
use crate::lower::builder::Runtime;

#[derive(Clone, Copy)]
pub(super) enum Created {
    /// At this declarator in the script.
    Script(Span),
    /// In the template, which runs after the script.
    Template,
}

/// Upstream's `b.thunk(value)`, except that `() => f()` stays an arrow unless `source`, the
/// expression `value` was built from, calls a function `$.derived(f)` may keep.
pub(super) fn callback<'o>(
    b: &Builder<'o>,
    res: &Resolution,
    source: Option<&Expression<'_>>,
    value: Expression<'o>,
    created: Created,
) -> Expression<'o> {
    if keeps_callee(res, source, created) {
        b.thunk(value)
    } else {
        b.arrow(b.params([]), value)
    }
}

/// Whether `$.derived` may keep the callee of the call `source` instead of a thunk: one never
/// reassigned, and a function, an import or declared before the derived. A global counts as
/// final, as upstream treats it, although the component cannot see its writes.
pub(super) fn keeps_callee(
    res: &Resolution,
    source: Option<&Expression<'_>>,
    created: Created,
) -> bool {
    let Some(Expression::CallExpression(call)) = source else {
        return true;
    };
    let Expression::Identifier(callee) = &call.callee else {
        return true;
    };
    res.symbol(callee).is_none_or(|symbol| {
        let scoping = res.scoping();
        let flags = scoping.symbol_flags(symbol);
        res.writes(symbol) == 0
            && match created {
                Created::Template => true,
                Created::Script(at) => {
                    flags.is_function()
                        || flags.is_import()
                        || scoping.symbol_span(symbol).start < at.start_offset
                }
            }
    })
}
