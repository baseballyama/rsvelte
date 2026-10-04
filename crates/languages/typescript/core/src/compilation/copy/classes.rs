use rsvelte_kernel::source::positions::SourceLocation;

use super::{NodeIdentifier, Rewrite, SyntaxTree, copy, copy_all, copy_opt};
use crate::syntax_tree::Class;

pub(super) fn copy_class<R: Rewrite + ?Sized>(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    rw: &mut R,
    class: Class<'_>,
    span: SourceLocation,
) -> NodeIdentifier {
    let class = match class {
        Class::Definition {
            name,
            superclass,
            members,
            declaration,
        } => {
            let name = copy_opt(from, to, rw, name);
            let superclass = copy_opt(from, to, rw, superclass);
            let members = copy_all(from, to, rw, members);
            return to.class(
                Class::Definition {
                    name,
                    superclass,
                    members: &members,
                    declaration,
                },
                span,
            );
        }
        Class::Method {
            key,
            function,
            computed,
            is_static,
            getter,
            setter,
        } => Class::Method {
            key: copy(from, to, rw, key),
            function: copy(from, to, rw, function),
            computed,
            is_static,
            getter,
            setter,
        },
        Class::Field {
            key,
            value,
            computed,
            is_static,
        } => Class::Field {
            key: copy(from, to, rw, key),
            value: copy_opt(from, to, rw, value),
            computed,
            is_static,
        },
        Class::StaticBlock(body) => Class::StaticBlock(copy(from, to, rw, body)),
    };
    to.class(class, span)
}
