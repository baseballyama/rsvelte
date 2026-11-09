use rsvelte_typescript_semantic::scope::Semantic;
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

/// Upstream `get_rune`: the rune a call names by its callee's shape.
///
/// The callee is `$x`, `$x.y` or `$inspect(…).with`, with any optional links. When `scope` is
/// given the root must be unbound there, so that a store subscription of the same name is no rune.
#[must_use]
pub fn rune(
    syntax_tree: &SyntaxTree,
    e: NodeIdentifier,
    scope: Option<&Semantic>,
) -> Option<&'static str> {
    let Kind::Call { callee, .. } = syntax_tree.kind(e) else {
        return None;
    };
    let (rune, root) = match syntax_tree.kind(callee) {
        Kind::Identifier(_) => {
            let name = syntax_tree.name(callee);
            if !name.starts_with('$') {
                return None;
            }
            (*RUNES.iter().find(|&&rune| rune == name)?, callee)
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
                    (*rune, object)
                }
                Kind::Call {
                    callee: inspect, ..
                } if member == "with"
                    && matches!(syntax_tree.kind(inspect), Kind::Identifier(_))
                    && syntax_tree.name(inspect) == "$inspect" =>
                {
                    ("$inspect().with", inspect)
                }
                _ => return None,
            }
        }
        _ => return None,
    };
    scope
        .is_none_or(|semantic| semantic.binding_of(root).is_none())
        .then_some(rune)
}

/// A rune call that lowers as one, with its first argument: one inside an optional chain is not.
#[must_use]
pub fn rune_call(
    syntax_tree: &SyntaxTree,
    e: NodeIdentifier,
) -> Option<(&'static str, Option<NodeIdentifier>)> {
    let Kind::Call {
        callee,
        arguments,
        optional,
        ..
    } = syntax_tree.kind(e)
    else {
        return None;
    };
    if optional
        || matches!(
            syntax_tree.kind(callee),
            Kind::Member { optional: true, .. }
        )
    {
        return None;
    }
    Some((rune(syntax_tree, e, None)?, arguments.first().copied()))
}
