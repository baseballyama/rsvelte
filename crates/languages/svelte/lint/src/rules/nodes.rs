//! The JavaScript nodes of a document in the order `ESLint` visits them.

use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_syntax::{NodeIdentifier, SyntaxTree};

use crate::rule::File;

/// The roots of the document's JavaScript by position: a module's program, or a component's
/// scripts and template expressions.
pub(super) fn roots(file: &File<'_>) -> Vec<NodeIdentifier> {
    if let Some(module) = file.module() {
        return vec![module.root];
    }
    let component = file
        .component()
        .expect("a document is a module or a component");
    let tree = &component.javascript;
    let mut roots: Vec<NodeIdentifier> = component
        .module
        .iter()
        .chain(&component.instance)
        .map(|script| script.program)
        .chain(component.template_expressions.iter().copied())
        .collect();
    roots.sort_by_key(|&root| span(tree, root).start_offset);
    roots
}

/// Calls `visit` on every node under [`roots`], each before its children, in source order.
pub(super) fn walk(file: &File<'_>, mut visit: impl FnMut(NodeIdentifier)) {
    let tree = file.javascript();
    let mut stack = roots(file);
    stack.reverse();
    while let Some(node) = stack.pop() {
        visit(node);
        let at = stack.len();
        tree.for_each_child(node, |child| stack.push(child));
        stack[at..].reverse();
    }
}

pub(super) fn span(tree: &SyntaxTree, node: NodeIdentifier) -> Span {
    tree.source_location(node)
        .span()
        .expect("a parsed node has a source range")
}

pub(super) fn text<'s>(tree: &SyntaxTree, node: NodeIdentifier, source: &'s str) -> &'s str {
    span(tree, node).text(source)
}

/// `node` is an identifier called `name`.
pub(super) fn is_named(tree: &SyntaxTree, node: NodeIdentifier, name: &str) -> bool {
    tree.atom(node)
        .is_some_and(|atom| tree.atoms.get(atom) == name)
}
