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

/// `$name(arg)` or `$name.member(arg)` → (`"$name.member"`, first argument).
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
                ("$inspect()", "with") => "$inspect().with",
                ("$inspect", "trace") => "$inspect.trace",
                _ => return None,
            }
        }
        _ => return None,
    };
    Some((rune, arguments.first().copied()))
}
