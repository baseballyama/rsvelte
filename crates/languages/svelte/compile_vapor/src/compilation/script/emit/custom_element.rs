use oxc_ast::ast::{PropertyKey, Statement};
use rsvelte_svelte_semantic::resolve::BindingKind;

use super::super::prop_cell;
use super::ScriptRewrite;

/// `$$custom_element_bind({ key: { get, set } })`: the props a custom element's properties read
/// and write.
pub(super) fn bindings<'t>(rw: &ScriptRewrite<'_, 't>) -> Statement<'t> {
    let (b, res) = (rw.b, rw.res);
    let scoping = res.scoping();
    let mut properties = Vec::new();
    for symbol in scoping.symbol_ids() {
        let info = res.binding(symbol);
        if !matches!(
            info.kind,
            BindingKind::Property | BindingKind::BindableProperty
        ) {
            continue;
        }
        let name = scoping.symbol_name(symbol);
        let value = || {
            rw.binding_value(symbol, name, oxc_span::SPAN)
                .expect("a prop has a value")
        };
        let mut fields = vec![b.init("get", b.arrow(b.params([]), value()))];
        if prop_cell(res, symbol) {
            let set = b.assign_member(value(), b.id("$$prop_value"));
            fields.push(b.init("set", b.arrow(b.params(["$$prop_value"]), set)));
        }
        let Some(PropertyKey::StaticIdentifier(key)) = info.prop_key else {
            unreachable!("a prop has a key")
        };
        properties.push(b.property(
            crate::compilation::string_key(b, &key.name),
            b.object(fields),
            false,
        ));
    }
    b.stmt(b.call(b.id("$$custom_element_bind"), [b.object(properties)]))
}
