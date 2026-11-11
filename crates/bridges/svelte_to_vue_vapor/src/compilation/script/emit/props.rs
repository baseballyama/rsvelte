use oxc_ast::ast::{Expression, IdentifierReference, PropertyKey, Statement};
use rsvelte_svelte_semantic::resolve::{BindingKind, Resolution};
use rsvelte_typescript_compile::build::Builder;

use super::super::prop_cell;
use super::ScriptRewrite;

/// What a template read of a prop becomes: `$$props.<key>`, `$$attrs` for the rest, or the
/// prop's cell, which Vue unwraps.
pub(crate) fn prop_member<'t>(
    b: &Builder<'t>,
    res: &Resolution,
    identifier: &IdentifierReference<'_>,
) -> Option<Expression<'t>> {
    let symbol = res.symbol(identifier)?;
    let info = res.binding(symbol);
    if info.kind == BindingKind::RestProperty {
        return Some(b.id_at("$$attrs", identifier.span));
    }
    if prop_cell(res, symbol) {
        return Some(b.id_at(&identifier.name, identifier.span));
    }
    if info.kind != BindingKind::Property {
        return None;
    }
    let PropertyKey::StaticIdentifier(key) = info.prop_key? else {
        return None;
    };
    let Expression::StaticMemberExpression(mut m) = b.member(b.id("$$props"), &key.name) else {
        unreachable!("a member")
    };
    m.span = identifier.span;
    Some(Expression::StaticMemberExpression(m))
}

/// `const name = $$prop_cell($$props, 'key', () => fallback, server, bindable)` for each prop read
/// through a cell.
pub(super) fn prop_declarations<'t>(rw: &mut ScriptRewrite<'_, 't>, body: &mut Vec<Statement<'t>>) {
    let (b, res, server) = (rw.b, rw.res, rw.server);
    let scoping = res.scoping();
    for symbol in scoping.symbol_ids() {
        if !prop_cell(res, symbol) {
            continue;
        }
        let info = res.binding(symbol);
        let fallback = info
            .initial
            .map_or_else(|| b.id("undefined"), |argument| rw.expression(argument));
        let Some(PropertyKey::StaticIdentifier(key)) = info.prop_key else {
            unreachable!("a prop has a key")
        };
        let value = b.call(
            b.id("$$prop_cell"),
            [
                b.id("$$props"),
                b.string(&key.name),
                b.arrow(b.parameters([]), fallback),
                b.boolean(server),
                b.boolean(info.kind == BindingKind::BindableProperty),
            ],
        );
        body.push(b.const_(scoping.symbol_name(symbol), value));
    }
}
