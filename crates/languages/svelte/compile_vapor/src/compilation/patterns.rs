use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

pub(super) fn names(tree: &SyntaxTree, pattern: NodeIdentifier) -> Vec<NodeIdentifier> {
    let mut stack = vec![pattern];
    let mut names = Vec::new();
    while let Some(node) = stack.pop() {
        match tree.kind(node) {
            Kind::Identifier(_) => names.push(node),
            Kind::ObjectPattern(items) | Kind::ArrayPattern(items) => {
                stack.extend(items.iter().rev());
            }
            Kind::Property { value, .. } | Kind::Rest(value) | Kind::AssignPattern(value, _) => {
                stack.push(value);
            }
            Kind::Hole => {}
            _ => unreachable!("a binding pattern contains patterns and properties"),
        }
    }
    names
}
