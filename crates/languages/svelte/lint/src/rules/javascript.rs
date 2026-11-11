//! Walking the JavaScript of a document, which the rules over any expression share.

use oxc_semantic::AstNode;
use rsvelte_kernel::source::positions::Span;

use crate::rule::File;

/// Every node of the document's JavaScript, a component's scripts and template expressions or a
/// module's program, each before its children, in the order the analysis visited them.
pub(super) fn walk<'a>(file: &File<'a>, mut f: impl FnMut(&AstNode<'a>)) {
    for node in file.nodes().iter() {
        f(node);
    }
}

/// An oxc span as the document's position type.
pub(super) const fn span(span: oxc_span::Span) -> Span {
    super::node_span(span)
}
