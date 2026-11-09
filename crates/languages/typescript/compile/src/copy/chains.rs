use super::{NodeIdentifier, Rewrite, SyntaxTree, copy, copy_all, copy_node};
use rsvelte_typescript_syntax::syntax_tree::{Kind, flag};

/// The object, callee or left operand a chain link is built on, for the kinds that nest
/// thousands deep in real input (`a.b.c…`, `f()()…`, `a + b + …`).
fn chain_child(f: &SyntaxTree, identifier: NodeIdentifier) -> Option<NodeIdentifier> {
    match f.kind(identifier) {
        Kind::Member { object, .. } => Some(object),
        Kind::Call { callee, .. } => Some(callee),
        Kind::Binary(_, l, _) | Kind::Logical(_, l, _) => Some(l),
        _ => None,
    }
}

/// Copies the chain link `first`, already offered to the rewriter, walking its inner links by a
/// loop. Each inner link still goes to the rewriter first, as [`copy`] does; `first`'s own flags
/// are applied by [`copy_node`].
pub(super) fn copy_chain<R: Rewrite + ?Sized>(
    f: &SyntaxTree,
    to: &mut SyntaxTree,
    rw: &mut R,
    first: NodeIdentifier,
) -> NodeIdentifier {
    // Only the links below `first` are kept, so a one-link chain allocates nothing.
    let mut links = Vec::new();
    let mut inner = chain_child(f, first).expect("a chain link has an inner expression");
    let mut copied = loop {
        if let Some(rewritten) = rw.rewrite(f, to, inner) {
            break rewritten;
        }
        match chain_child(f, inner) {
            Some(next) => {
                links.push(inner);
                inner = next;
            }
            None => break copy_node(f, to, rw, inner),
        }
    };
    while let Some(link) = links.pop() {
        copied = link_tail(f, to, rw, link, copied);
        if f.flags(link) & flag::GROUPED != 0 {
            copied = to.grouped(copied);
        }
    }
    link_tail(f, to, rw, first, copied)
}

/// What [`copy_node`] builds for a chain link once its inner expression is copied.
fn link_tail<R: Rewrite + ?Sized>(
    f: &SyntaxTree,
    to: &mut SyntaxTree,
    rw: &mut R,
    link: NodeIdentifier,
    inner: NodeIdentifier,
) -> NodeIdentifier {
    let span = f.source_location(link);
    match f.kind(link) {
        Kind::Member {
            property,
            computed,
            optional,
            ..
        } => {
            let p = if computed {
                copy(f, to, rw, property)
            } else {
                copy_node(f, to, rw, property)
            };
            to.member(inner, p, computed, optional, span)
        }
        Kind::Call {
            arguments,
            optional,
            pure,
            ..
        } => {
            let a = copy_all(f, to, rw, arguments);
            let call = to.call(inner, &a, optional, span);
            if pure {
                to.mark_pure(call);
            }
            call
        }
        Kind::Binary(op, _, r) => {
            let r = copy(f, to, rw, r);
            to.binary(op, inner, r, span)
        }
        Kind::Logical(op, _, r) => {
            let r = copy(f, to, rw, r);
            to.logical(op, inner, r, span)
        }
        _ => unreachable!("a chain link is a member, call, binary or logical expression"),
    }
}
