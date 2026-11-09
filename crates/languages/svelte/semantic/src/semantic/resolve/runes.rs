use rsvelte_typescript::scope::{DeclarationKind, ScopeIdentifier, Semantic};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

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

/// `$name(arg)` or `$name.member(arg)` → (`"$name.member"`, first argument), by syntax alone.
/// Whether a component's call is the rune depends on its scope: ask [`super::Resolution::rune`].
#[must_use]
pub fn rune_call(
    syntax_tree: &SyntaxTree,
    e: NodeIdentifier,
) -> Option<(&'static str, Option<NodeIdentifier>)> {
    let Kind::Call {
        callee, arguments, ..
    } = syntax_tree.kind(e)
    else {
        return None;
    };
    let rune = match syntax_tree.kind(callee) {
        Kind::Identifier(_) => match syntax_tree.name(callee) {
            "$state" => "$state",
            "$state.raw" => "$state.raw",
            "$derived" => "$derived",
            "$derived.by" => "$derived.by",
            "$state.eager" => "$state.eager",
            "$state.snapshot" => "$state.snapshot",
            "$props" => "$props",
            "$props.id" => "$props.id",
            "$bindable" => "$bindable",
            "$effect" => "$effect",
            "$effect.pre" => "$effect.pre",
            "$effect.tracking" => "$effect.tracking",
            "$effect.root" => "$effect.root",
            "$effect.pending" => "$effect.pending",
            "$inspect" => "$inspect",
            "$inspect().with" => "$inspect().with",
            "$inspect.trace" => "$inspect.trace",
            "$host" => "$host",
            _ => return None,
        },
        Kind::Member {
            object,
            property,
            computed: false,
            ..
        } if matches!(syntax_tree.kind(object), Kind::Identifier(_)) => {
            match (syntax_tree.name(object), syntax_tree.name(property)) {
                ("$state", "raw") => "$state.raw",
                ("$derived", "by") => "$derived.by",
                ("$state", "eager") => "$state.eager",
                ("$state", "snapshot") => "$state.snapshot",
                ("$props", "id") => "$props.id",
                ("$effect", "pre") => "$effect.pre",
                ("$effect", "tracking") => "$effect.tracking",
                ("$effect", "root") => "$effect.root",
                ("$effect", "pending") => "$effect.pending",
                ("$inspect", "trace") => "$inspect.trace",
                _ => return None,
            }
        }
        Kind::Member {
            object,
            property,
            computed: false,
            ..
        } if syntax_tree.name(property) == "with"
            && matches!(syntax_tree.kind(object), Kind::Call { callee, .. }
                if matches!(syntax_tree.kind(callee), Kind::Identifier(_))
                    && syntax_tree.name(callee) == "$inspect") =>
        {
            "$inspect().with"
        }
        _ => return None,
    };
    Some((rune, arguments.first().copied()))
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

/// Upstream `get_rune`: the rune `e` calls, with its first argument, when the callee's root
/// names neither a binding nor a store subscription in `subscribed`.
pub(super) fn rune(
    syntax_tree: &SyntaxTree,
    sem: &Semantic,
    subscribed: &[&str],
    e: NodeIdentifier,
) -> Option<(&'static str, Option<NodeIdentifier>)> {
    let found = rune_call(syntax_tree, e)?;
    let Kind::Call { callee, .. } = syntax_tree.kind(e) else {
        return None;
    };
    let mut root = callee;
    loop {
        match syntax_tree.kind(root) {
            Kind::Member { object, .. } => root = object,
            Kind::Call { callee, .. } => root = callee,
            _ => break,
        }
    }
    (sem.binding_of(root).is_none() && !subscribed.contains(&syntax_tree.name(root)))
        .then_some(found)
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
