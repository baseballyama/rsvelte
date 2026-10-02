use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

#[must_use]
pub fn cannot_be_set_statically(name: &str) -> bool {
    matches!(
        name,
        "autofocus" | "muted" | "defaultValue" | "defaultChecked"
    )
}

#[must_use]
pub fn needs_clsx(javascript: &SyntaxTree, e: NodeIdentifier) -> bool {
    !matches!(
        javascript.kind(e),
        Kind::String
            | Kind::Number(_)
            | Kind::Boolean(_)
            | Kind::Null
            | Kind::Template { .. }
            | Kind::Binary(..)
    )
}
