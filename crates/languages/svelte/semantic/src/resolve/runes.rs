use oxc_ast::AstKind;
use oxc_ast::ast::{Argument, CallExpression, ChainElement, Expression, IdentifierReference};
use oxc_semantic::{ScopeId, SymbolFlags};
use rsvelte_typescript_semantic::semantic::Semantic;

use crate::typescript::without_typescript;

pub const RUNES: &[&str] = &[
    "$state",
    "$state.raw",
    "$derived",
    "$derived.by",
    "$state.eager",
    "$state.snapshot",
    "$props",
    "$props.id",
    "$bindable",
    "$effect",
    "$effect.pre",
    "$effect.tracking",
    "$effect.root",
    "$effect.pending",
    "$inspect",
    "$inspect().with",
    "$inspect.trace",
    "$host",
];

/// The identifiers a rune starts with: each name in [`RUNES`] up to its first `.` or `(`.
pub const RUNE_ROOTS: &[&str] = &[
    "$state",
    "$derived",
    "$props",
    "$bindable",
    "$effect",
    "$inspect",
    "$host",
];

/// The rune a call names by its callee's shape, and the callee's root: `$x`, `$x.y` or
/// `$inspect(…).with`, with any optional links.
fn named<'a>(call: &'a CallExpression<'a>) -> Option<(&'static str, &'a IdentifierReference<'a>)> {
    match &call.callee {
        Expression::Identifier(callee) => {
            let name = callee.name.as_str();
            if !name.starts_with('$') {
                return None;
            }
            Some((*RUNES.iter().find(|&&rune| rune == name)?, callee))
        }
        Expression::StaticMemberExpression(member) => {
            let property = member.property.name.as_str();
            match &member.object {
                Expression::Identifier(object) => {
                    let root = object.name.as_str();
                    if !root.starts_with('$') {
                        return None;
                    }
                    let rune = RUNES.iter().find(|rune| {
                        (rune.strip_prefix(root)).and_then(|rest| rest.strip_prefix('.'))
                            == Some(property)
                    })?;
                    Some((*rune, object))
                }
                Expression::CallExpression(inspect) if property == "with" => {
                    match &inspect.callee {
                        Expression::Identifier(callee) if callee.name == "$inspect" => {
                            Some(("$inspect().with", callee))
                        }
                        _ => None,
                    }
                }
                _ => None,
            }
        }
        _ => None,
    }
}

/// The call `e` is when it lowers as a rune call: not inside an optional chain, and with a
/// callee that is not one, which upstream wraps in a `ChainExpression` that names no rune.
fn lowered<'a>(e: &'a Expression<'a>) -> Option<&'a CallExpression<'a>> {
    match without_typescript(e) {
        Expression::CallExpression(call)
            if !matches!(call.callee, Expression::ChainExpression(_)) =>
        {
            Some(call)
        }
        _ => None,
    }
}

/// The first argument of a rune call, which no rune spreads.
fn first_argument<'a>(call: &'a CallExpression<'a>) -> Option<&'a Expression<'a>> {
    call.arguments
        .first()
        .and_then(Argument::as_expression)
        .map(without_typescript)
}

/// A rune call that lowers as one, with its first argument, by syntax alone. Whether a
/// component's call is the rune depends on its scope: ask [`super::Resolution::rune`].
#[must_use]
pub fn rune_call<'a>(e: &'a Expression<'a>) -> Option<(&'static str, Option<&'a Expression<'a>>)> {
    let call = lowered(e)?;
    Some((named(call)?.0, first_argument(call)))
}

/// Whether the rune call `e` lowers as one.
#[must_use]
pub fn lowers<'a>(e: &'a Expression<'a>) -> bool {
    lowered(e).is_some()
}

/// Upstream `get_rune`: the rune the call `call` names, when the callee's root names neither a
/// binding nor a store subscription in `subscribed`.
pub(super) fn named_in_scope<'a>(
    semantic: &Semantic,
    subscribed: &[&str],
    call: &'a CallExpression<'a>,
) -> Option<&'static str> {
    let (rune, root) = named(call)?;
    let bound = root
        .reference_id
        .get()
        .and_then(|reference| semantic.scoping().get_reference(reference).symbol_id())
        .is_some();
    (!bound && !subscribed.contains(&root.name.as_str())).then_some(rune)
}

/// [`named_in_scope`] of an expression that is a call, inside an optional chain too: the rune
/// upstream's visitors of a call see.
pub(super) fn named_in_scope_anywhere<'a>(
    semantic: &Semantic,
    subscribed: &[&str],
    e: &'a Expression<'a>,
) -> Option<&'static str> {
    match without_typescript(e) {
        Expression::CallExpression(call) => named_in_scope(semantic, subscribed, call),
        Expression::ChainExpression(chain) => match &chain.expression {
            ChainElement::CallExpression(call) => named_in_scope(semantic, subscribed, call),
            _ => None,
        },
        _ => None,
    }
}

/// [`named_in_scope`] of a call that lowers as a rune, with its first argument.
pub(super) fn rune<'a>(
    semantic: &Semantic,
    subscribed: &[&str],
    e: &'a Expression<'a>,
) -> Option<(&'static str, Option<&'a Expression<'a>>)> {
    let call = lowered(e)?;
    Some((
        named_in_scope(semantic, subscribed, call)?,
        first_argument(call),
    ))
}

/// Upstream analysis's synthetic store subscriptions among the rune names: `$name` subscribes to
/// a store when `name` is bound in the instance's scope or the module's, unless that binding is
/// itself a rune's (a `$props()` one only for `props`) or `derived` from `svelte/store`.
pub(super) fn subscribed(semantic: &Semantic, instance: ScopeId) -> Vec<&'static str> {
    let scoping = semantic.scoping();
    RUNE_ROOTS
        .iter()
        .copied()
        .filter(|&name| {
            let store = &name[1..];
            let Some(symbol) = scoping.find_binding(instance, store.into()) else {
                return false;
            };
            let declaration = scoping.symbol_declaration(symbol);
            // Upstream asks before it declares any subscription, so only bindings shadow a rune.
            let initial = match semantic.nodes().kind(declaration) {
                AstKind::VariableDeclarator(d) => d
                    .init
                    .as_ref()
                    .and_then(|init| rune(semantic, &[], init))
                    .map(|(initial, _)| initial),
                _ => None,
            };
            let from_svelte_store = || {
                scoping.symbol_flags(symbol).contains(SymbolFlags::Import)
                    && semantic
                        .nodes()
                        .ancestor_kinds(declaration)
                        .find_map(|kind| match kind {
                            AstKind::ImportDeclaration(import) => {
                                Some(import.source.value == "svelte/store")
                            }
                            _ => None,
                        })
                        .unwrap_or(false)
            };
            (initial.is_none() || (store != "props" && initial == Some("$props")))
                && !(name == "$derived" && from_svelte_store())
        })
        .collect()
}
