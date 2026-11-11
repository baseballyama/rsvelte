use oxc_ast::ast::Expression;
use oxc_span::SPAN;
use rsvelte_typescript_compile::build::Builder;

/// What a value rune makes of its rewritten argument: a cell.
pub(crate) fn rune_value<'t>(
    b: &Builder<'t>,
    rune: &str,
    argument: Option<Expression<'t>>,
    tracking: bool,
) -> Option<Expression<'t>> {
    Some(match rune {
        "$props" => return None,
        "$state" | "$state.raw" => {
            let local = if rune == "$state" {
                "$$ref"
            } else {
                "$$shallowRef"
            };
            b.call(b.id(local), argument)
        }
        "$derived" => {
            let argument = argument?;
            let asynchronous = crate::compilation::asynchronous::has_await(&argument);
            let argument = tracked(b, argument, tracking && !asynchronous);
            let getter = if asynchronous {
                async_arrow(b, argument)
            } else {
                b.arrow(b.parameters([]), argument)
            };
            if asynchronous {
                let call = b.call(b.id("$$async_derived"), [getter]);
                Expression::new_await_expression(SPAN, call, b)
            } else {
                b.call(b.id("$$computed"), [getter])
            }
        }
        "$derived.by" => {
            let argument = argument?;
            let getter = if tracking {
                let call = tracked(b, b.call(argument, []), true);
                b.arrow(b.parameters([]), call)
            } else {
                argument
            };
            b.call(b.id("$$computed"), [getter])
        }
        _ => unreachable!("checked by plan"),
    })
}

/// `async () => value`.
pub(crate) fn async_arrow<'t>(b: &Builder<'t>, value: Expression<'t>) -> Expression<'t> {
    let Expression::ArrowFunctionExpression(mut arrow) = b.arrow(b.parameters([]), value) else {
        unreachable!("an arrow")
    };
    arrow.r#async = true;
    Expression::ArrowFunctionExpression(arrow)
}

/// `$$tracked(() => value)` when the component reads `$effect.tracking()`.
pub(crate) fn tracked<'t>(
    b: &Builder<'t>,
    value: Expression<'t>,
    tracking: bool,
) -> Expression<'t> {
    if !tracking {
        return value;
    }
    b.call(b.id("$$tracked"), [b.arrow(b.parameters([]), value)])
}
