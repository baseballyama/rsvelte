use std::borrow::Cow;

use oxc_ast::AstKind;
use oxc_ast::ast::BindingPattern;
use oxc_semantic::SymbolId;
use rsvelte_svelte_semantic::resolve::Resolution;

use super::javascript::literal_key_name;

/// Whether the rest prop `symbol` leaves out `key`: upstream's `exclude_props`, the keys the
/// `$props()` pattern names, which `rest.key` reads from `rest` instead of `$$props`.
pub(super) fn excludes(res: &Resolution, symbol: SymbolId, key: &str) -> bool {
    pattern_keys(res, symbol).any(|named| named == key)
}

/// The keys the `$props()` pattern that declares the rest prop `symbol` names.
fn pattern_keys(res: &Resolution, symbol: SymbolId) -> impl Iterator<Item = Cow<'_, str>> {
    let properties = match res.declaration(symbol) {
        AstKind::VariableDeclarator(declarator) => match &declarator.id {
            BindingPattern::ObjectPattern(pattern) => pattern.properties.as_slice(),
            _ => &[],
        },
        _ => &[],
    };
    properties.iter().filter_map(|p| literal_key_name(&p.key))
}
