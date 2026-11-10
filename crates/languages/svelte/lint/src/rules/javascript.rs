//! Walking the JavaScript of a document, which the rules over any expression share.

use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_syntax::{Kind, NodeIdentifier, SyntaxTree};

use crate::rule::File;

/// The roots of the document's JavaScript: a component's scripts and then its template
/// expressions, or a module's program. A parse can leave nodes no root reaches.
pub(super) fn roots(file: &File<'_>) -> Vec<NodeIdentifier> {
    match (file.component(), file.module()) {
        (Some(component), _) => component
            .module
            .iter()
            .map(|script| script.program)
            .chain(std::iter::once(component.program))
            .chain(component.template_expressions.iter().copied())
            .collect(),
        (None, Some(module)) => vec![module.root],
        (None, None) => Vec::new(),
    }
}

/// Every node the roots reach, each before its children, in source order.
pub(super) fn walk(file: &File<'_>, mut f: impl FnMut(NodeIdentifier)) {
    let javascript = file.javascript();
    let mut pending = roots(file);
    pending.reverse();
    let mut children = Vec::new();
    while let Some(node) = pending.pop() {
        f(node);
        children.clear();
        javascript.for_each_child(node, |child| children.push(child));
        pending.extend(children.iter().rev());
    }
}

/// Whether a member or call chain has a `?.`, which `ESTree` wraps in a `ChainExpression`.
pub(super) fn is_optional_chain(javascript: &SyntaxTree, mut node: NodeIdentifier) -> bool {
    loop {
        match javascript.kind(node) {
            Kind::Member {
                object, optional, ..
            } => {
                if optional {
                    return true;
                }
                node = object;
            }
            Kind::Call {
                callee, optional, ..
            } => {
                if optional {
                    return true;
                }
                node = callee;
            }
            _ => return false,
        }
    }
}

/// The node's span; every node a rule reports was parsed from the source.
pub(super) fn span(javascript: &SyntaxTree, node: NodeIdentifier) -> Span {
    javascript
        .source_location(node)
        .span()
        .expect("a node parsed from the source")
}
