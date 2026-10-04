use super::{NodeIdentifier, Rewrite, SourceLocation, SyntaxTree, copy};

pub(crate) fn rune_value(
    javascript: &SyntaxTree,
    to: &mut SyntaxTree,
    rewriter: &mut impl Rewrite,
    rune: &str,
    arg: Option<NodeIdentifier>,
    tracking: bool,
) -> Option<NodeIdentifier> {
    Some(match rune {
        "$props" => return None,
        "$state" | "$state.raw" => {
            let local = if rune == "$state" {
                "$$ref"
            } else {
                "$$shallowRef"
            };
            let callee = to.identifier(local);
            let arguments: Vec<NodeIdentifier> = arg
                .iter()
                .map(|&a| copy(javascript, to, rewriter, a))
                .collect();
            to.call0(callee, &arguments)
        }
        "$derived" => {
            let asynchronous = super::super::super::asynchronous::has_await(javascript, arg?);
            let a = copy(javascript, to, rewriter, arg?);
            let a = tracked(to, a, tracking && !asynchronous);
            let f = to.arrow(&[], a, true, asynchronous, SourceLocation::SYNTHETIC);
            let callee = to.identifier(if asynchronous {
                "$$async_derived"
            } else {
                "$$computed"
            });
            let value = to.call0(callee, &[f]);
            if asynchronous {
                to.await_(value, SourceLocation::SYNTHETIC)
            } else {
                value
            }
        }
        "$derived.by" => {
            let a = copy(javascript, to, rewriter, arg?);
            let a = if tracking {
                let call = to.call0(a, &[]);
                let call = tracked(to, call, tracking);
                to.arrow(&[], call, true, false, SourceLocation::SYNTHETIC)
            } else {
                a
            };
            let callee = to.identifier("$$computed");
            to.call0(callee, &[a])
        }
        _ => unreachable!("checked by plan"),
    })
}

pub(crate) fn tracked(
    to: &mut SyntaxTree,
    value: NodeIdentifier,
    tracking: bool,
) -> NodeIdentifier {
    if !tracking {
        return value;
    }
    let getter = to.arrow(&[], value, true, false, SourceLocation::SYNTHETIC);
    let tracked = to.identifier("$$tracked");
    to.call0(tracked, &[getter])
}
