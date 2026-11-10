use oxc_allocator::TakeIn;
use oxc_ast::ast::{Expression, VariableDeclarator};
use oxc_ast_visit::{VisitMut, walk_mut};

use super::super::derived::{Created, keeps_callee};
use super::{ScriptRewrite, Target, should_proxy_read};

/// Lowers a `$state`, `$state.raw`, `$derived` or `$derived.by` declarator at any depth in
/// place; `false` when `d` is none of them.
pub(super) fn lower_value_declarator<'o>(
    rw: &mut ScriptRewrite<'_, 'o>,
    d: &mut VariableDeclarator<'o>,
) -> bool {
    let Some(init) = &d.init else {
        return false;
    };
    let Some((rune, argument)) = rw.res.rune(init) else {
        return false;
    };
    if !matches!(rune, "$state" | "$state.raw" | "$derived" | "$derived.by") {
        return false;
    }
    let b = rw.b;
    // What the value is decided on is the argument as written, before the rewrite reads it.
    let proxy = rune == "$state" && argument.is_some_and(|a| should_proxy_read(rw.res, a));
    let keeps = rune == "$derived"
        && keeps_callee(rw.res, argument, Created::Script(super::super::span_of(d)));
    let Some(Expression::CallExpression(mut call)) = d.init.take() else {
        unreachable!("a rune is a call")
    };
    let mut value = call.arguments.first_mut().map_or_else(
        || b.void0(),
        |argument| argument.take_in(b).into_expression(),
    );
    rw.visit_expression(&mut value);
    walk_mut::walk_binding_pattern(rw, &mut d.id);
    d.init = Some(match rune {
        "$state" | "$state.raw" if rw.target == Target::Client => {
            if proxy {
                value = b.runtime("proxy", [value]);
            }
            let source =
                d.id.get_binding_identifier()
                    .and_then(|identifier| identifier.symbol_id.get())
                    .is_some_and(|symbol| rw.res.is_state_source(symbol));
            if source {
                b.runtime("state", [value])
            } else {
                value
            }
        }
        "$state" | "$state.raw" => value,
        "$derived" => {
            let callback = b.arrow(b.params([]), value);
            let callback = if keeps {
                super::super::builder::unthunk(callback)
            } else {
                callback
            };
            b.runtime("derived", [callback])
        }
        _ => b.runtime("derived", [value]),
    });
    true
}
