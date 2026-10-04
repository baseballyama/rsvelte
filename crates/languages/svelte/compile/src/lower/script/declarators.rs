use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_typescript::operators::UnaryOperator;

use super::{
    Kind, NodeIdentifier, ScriptRewrite, SyntaxTree, Target, copy, rune_call, should_proxy,
    unsupported,
};

/// Upstream splits a destructured `$derived` (both targets) and a destructured `$state` (client)
/// into one declaration per path; this port has no `extract_paths` yet.
pub(in crate::lower) fn check_destructured_rune(
    from: &SyntaxTree,
    target: Target,
    d: NodeIdentifier,
) -> Result<(), Diagnostic> {
    let Kind::Declarator {
        identifier,
        initializer: Some(initializer),
    } = from.kind(d)
    else {
        return Ok(());
    };
    if from.is_identifier(identifier) {
        return Ok(());
    }
    let Some((rune, _)) = rune_call(from, initializer) else {
        return Ok(());
    };
    let split = match rune {
        "$derived" | "$derived.by" => true,
        "$state" | "$state.raw" => target == Target::Client,
        _ => false,
    };
    if split {
        return unsupported(
            &format!("a destructured `{rune}` declaration"),
            from.source_location(d)
                .span()
                .expect("a parsed declarator has a source range"),
        );
    }
    Ok(())
}

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
    let (rune, arg) = rune_call(from, initializer)?;
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
                if rune == "$state" && arg.is_some_and(|a| should_proxy(from, rw.res, a)) {
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
                to.arrow(
                    &[],
                    v,
                    true,
                    false,
                    rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
                )
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
