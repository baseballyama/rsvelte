use rsvelte_typescript_syntax::operators::UnaryOperator;

use super::super::derived::{Created, callback};

use super::{Kind, NodeIdentifier, ScriptRewrite, SyntaxTree, Target, copy, should_proxy_read};

/// A `$state`, `$state.raw`, `$derived` or `$derived.by` declarator, at any depth.
pub(super) fn lower_value_declarator(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    rw: &mut ScriptRewrite<'_>,
    d: NodeIdentifier,
) -> Option<NodeIdentifier> {
    let Kind::Declarator {
        identifier,
        initializer: Some(initializer),
    } = from.kind(d)
    else {
        return None;
    };
    let (rune, arg) = rw.res.rune(from, initializer)?;
    let source_location = from.source_location(d);
    let value = |to: &mut SyntaxTree, rw: &mut ScriptRewrite<'_>| {
        if let Some(a) = arg {
            copy(from, to, rw, a)
        } else {
            let zero = to.write_number(
                0.0,
                rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
            );
            to.unary(
                UnaryOperator::Void,
                zero,
                rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
            )
        }
    };
    match rune {
        "$state" | "$state.raw" => {
            let mut v = value(to, rw);
            if rw.target == Target::Client {
                let b = rw.res.sem.binding_of(identifier);
                if rune == "$state" && arg.is_some_and(|a| should_proxy_read(from, rw.res, a)) {
                    v = to.runtime("$", "proxy", &[v]);
                }
                if b.is_some_and(|b| rw.res.is_state_source(b)) {
                    v = to.runtime("$", "state", &[v]);
                }
            }
            let target = copy(from, to, rw, identifier);
            Some(to.declarator(target, Some(v), source_location))
        }
        "$derived" | "$derived.by" => {
            let v = value(to, rw);
            let f = if rune == "$derived" {
                let Some(at) = from.source_location(d).span() else {
                    unreachable!("a declarator is parsed from source")
                };
                callback(from, rw.res, to, arg, v, Created::Script(at))
            } else {
                v
            };
            let call = to.runtime("$", "derived", &[f]);
            let target = copy(from, to, rw, identifier);
            Some(to.declarator(target, Some(call), source_location))
        }
        _ => None,
    }
}
