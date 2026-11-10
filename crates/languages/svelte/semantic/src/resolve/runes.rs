use rsvelte_typescript_semantic::scope::{DeclarationKind, ScopeIdentifier, Semantic};
use rsvelte_typescript_syntax::{Kind, NodeIdentifier, SyntaxTree};

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

/// The rune a call names by its callee's shape, and the callee's root: `$x`, `$x.y` or
/// `$inspect(…).with`, with any optional links.
fn named(syntax_tree: &SyntaxTree, e: NodeIdentifier) -> Option<(&'static str, NodeIdentifier)> {
    let Kind::Call { callee, .. } = syntax_tree.kind(e) else {
        return None;
    };
    match syntax_tree.kind(callee) {
        Kind::Identifier(_) => {
            let name = syntax_tree.name(callee);
            if !name.starts_with('$') {
                return None;
            }
            Some((*RUNES.iter().find(|&&rune| rune == name)?, callee))
        }
        Kind::Member {
            object,
            property,
            computed: false,
            ..
        } => {
            let member = syntax_tree.name(property);
            match syntax_tree.kind(object) {
                Kind::Identifier(_) => {
                    let root = syntax_tree.name(object);
                    if !root.starts_with('$') {
                        return None;
                    }
                    let rune = RUNES.iter().find(|rune| {
                        (rune.strip_prefix(root)).and_then(|rest| rest.strip_prefix('.'))
                            == Some(member)
                    })?;
                    Some((*rune, object))
                }
                Kind::Call {
                    callee: inspect, ..
                } if member == "with"
                    && matches!(syntax_tree.kind(inspect), Kind::Identifier(_))
                    && syntax_tree.name(inspect) == "$inspect" =>
                {
                    Some(("$inspect().with", inspect))
                }
                _ => None,
            }
        }
        _ => None,
    }
}

/// A rune call that lowers as one, with its first argument, by syntax alone: one inside an
/// optional chain is not. Whether a component's call is the rune depends on its scope: ask
/// [`super::Resolution::rune`].
#[must_use]
pub fn rune_call(
    syntax_tree: &SyntaxTree,
    e: NodeIdentifier,
) -> Option<(&'static str, Option<NodeIdentifier>)> {
    lowered(syntax_tree, e, named(syntax_tree, e)?.0)
}

/// The rune `rune` that the call `e` names, with its first argument, when it [`lowers`].
fn lowered(
    syntax_tree: &SyntaxTree,
    e: NodeIdentifier,
    rune: &'static str,
) -> Option<(&'static str, Option<NodeIdentifier>)> {
    let Kind::Call { arguments, .. } = syntax_tree.kind(e) else {
        return None;
    };
    lowers(syntax_tree, e).then(|| (rune, arguments.first().copied()))
}

/// Whether the rune call `e` lowers as one: neither it nor its callee ends an optional chain,
/// which upstream wraps in a `ChainExpression` that names no rune.
#[must_use]
pub fn lowers(syntax_tree: &SyntaxTree, e: NodeIdentifier) -> bool {
    let Kind::Call { callee, .. } = syntax_tree.kind(e) else {
        return false;
    };
    !syntax_tree.is_chain(e) && !syntax_tree.is_chain(callee)
}

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

/// Upstream analysis's synthetic store subscriptions among the rune names: `$name` subscribes to
/// a store when `name` is bound at the instance's top (the root scope) or the module's, unless
/// that binding is itself a rune's (a `$props()` one only for `props`) or `derived` from
/// `svelte/store`.
pub(super) fn subscribed(
    syntax_tree: &SyntaxTree,
    source_text: &str,
    sem: &Semantic,
    program: NodeIdentifier,
    module: Option<NodeIdentifier>,
) -> Vec<&'static str> {
    RUNE_ROOTS
        .iter()
        .copied()
        .filter(|&name| {
            let store = &name[1..];
            let Some(binding) = syntax_tree
                .atoms
                .lookup(store)
                .and_then(|atom| sem.lookup(ScopeIdentifier::ROOT, atom))
            else {
                return false;
            };
            let binding = &sem.bindings[binding];
            // Upstream asks before it declares any subscription, so only bindings shadow a rune.
            let initial = binding
                .initializer(syntax_tree)
                .and_then(|initializer| rune(syntax_tree, sem, &[], initializer))
                .map(|(initial, _)| initial);
            let programs = [Some(program), module];
            (initial.is_none() || (store != "props" && initial == Some("$props")))
                && !(name == "$derived"
                    && binding.kind == DeclarationKind::Import
                    && import_source(syntax_tree, source_text, programs, binding.declaration)
                        == Some("svelte/store"))
        })
        .collect()
}

/// Upstream `get_rune`: the rune the call `e` names, when the callee's root names neither a
/// binding nor a store subscription in `subscribed`.
pub(super) fn named_in_scope(
    syntax_tree: &SyntaxTree,
    sem: &Semantic,
    subscribed: &[&str],
    e: NodeIdentifier,
) -> Option<&'static str> {
    let (rune, root) = named(syntax_tree, e)?;
    (sem.binding_of(root).is_none() && !subscribed.contains(&syntax_tree.name(root)))
        .then_some(rune)
}

/// [`named_in_scope`] of a call that lowers as a rune, with its first argument.
pub(super) fn rune(
    syntax_tree: &SyntaxTree,
    sem: &Semantic,
    subscribed: &[&str],
    e: NodeIdentifier,
) -> Option<(&'static str, Option<NodeIdentifier>)> {
    lowered(
        syntax_tree,
        e,
        named_in_scope(syntax_tree, sem, subscribed, e)?,
    )
}

/// The module that the import specifier `specifier` of one of `programs` imports from.
fn import_source<'a>(
    syntax_tree: &'a SyntaxTree,
    source_text: &'a str,
    programs: [Option<NodeIdentifier>; 2],
    specifier: Option<NodeIdentifier>,
) -> Option<&'a str> {
    let specifier = specifier?;
    programs.into_iter().flatten().find_map(|program| {
        let Kind::Program(body) = syntax_tree.kind(program) else {
            return None;
        };
        body.iter()
            .find_map(|&statement| match syntax_tree.kind(statement) {
                Kind::Import {
                    specifiers, source, ..
                } if specifiers.contains(&specifier) => {
                    Some(syntax_tree.str_value(source, source_text))
                }
                _ => None,
            })
    })
}
