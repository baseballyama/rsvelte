use rsvelte_typescript::copy::{Rewrite, copy};
use rustc_hash::FxHashSet;

use super::{Kind, NodeIdentifier, Plan, R, SyntaxTree, rune_call, span, unsupported, walk};

pub(super) fn collect(
    tree: &SyntaxTree,
    program: NodeIdentifier,
    plan: &mut Plan,
    consumed: &mut FxHashSet<NodeIdentifier>,
) -> R<()> {
    super::constructors::collect(tree, program, &mut plan.constructors)?;
    walk(tree, program, &mut |identifier| {
        if let Kind::AssignPattern(_, default) = tree.kind(identifier)
            && rune_call(tree, default).is_some_and(|(name, _)| name == "$bindable")
        {
            let Kind::Call { callee, .. } = tree.kind(default) else {
                unreachable!()
            };
            consumed.insert(callee);
        }
        let value_initializer = match tree.kind(identifier) {
            Kind::Declarator {
                identifier: pattern,
                initializer: Some(initializer),
            } => Some((pattern, initializer)),
            Kind::Class(rsvelte_typescript::syntax_tree::Class::Field {
                key,
                value: Some(initializer),
                computed: false,
                ..
            }) => Some((key, initializer)),
            Kind::Assign(_, target, initializer)
                if plan.constructors.assignments.contains(&identifier) =>
            {
                let Kind::Member { property, .. } = tree.kind(target) else {
                    unreachable!()
                };
                Some((property, initializer))
            }
            _ => None,
        };
        if let Some((pattern, initializer)) = value_initializer
            && let Some((name, _)) = rune_call(tree, initializer)
            && value(name)
        {
            plan.core_values.insert(name);
            if name == "$derived"
                && let Some((_, Some(argument))) = rune_call(tree, initializer)
            {
                plan.async_values |= super::super::asynchronous::has_await(tree, argument);
            }
            let Kind::Call {
                callee, arguments, ..
            } = tree.kind(initializer)
            else {
                unreachable!()
            };
            let arity = if matches!(name, "$state" | "$state.raw") {
                arguments.len() <= 1
            } else {
                arguments.len() == 1
            };
            let pattern_supported = matches!(
                tree.kind(pattern),
                Kind::Identifier(_) | Kind::ObjectPattern(_) | Kind::ArrayPattern(_)
            );
            if !pattern_supported || !arity {
                return Err(unsupported(
                    format_args!("this use of `{name}`"),
                    span(tree, initializer),
                ));
            }
            plan.core_patterns |= !matches!(tree.kind(pattern), Kind::Identifier(_));
            consumed.insert(root(tree, callee));
        }
        let Some((name, _)) = rune_call(tree, identifier) else {
            return Ok(());
        };
        let Kind::Call {
            callee, arguments, ..
        } = tree.kind(identifier)
        else {
            unreachable!()
        };
        let arity = match name {
            "$effect" | "$effect.pre" | "$effect.root" | "$state.snapshot" | "$state.eager" => {
                Some(1)
            }
            "$effect.tracking" | "$effect.pending" | "$host" => Some(0),
            "$inspect" | "$inspect.trace" => None,
            _ => return Ok(()),
        };
        if arity.is_some_and(|arity| arguments.len() != arity) {
            return Err(unsupported(
                format_args!("this use of `{name}`"),
                span(tree, identifier),
            ));
        }
        consumed.insert(root(tree, callee));
        if !eager(name) {
            plan.auxiliary.insert(name, span(tree, identifier));
        }
        Ok(())
    })
}

fn root(tree: &SyntaxTree, callee: NodeIdentifier) -> NodeIdentifier {
    match tree.kind(callee) {
        Kind::Member { object, .. } => object,
        _ => callee,
    }
}

pub(crate) fn eager(name: &str) -> bool {
    name == "$state.eager"
}

pub(crate) fn inline(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    rewriter: &mut impl Rewrite,
    identifier: NodeIdentifier,
) -> Option<NodeIdentifier> {
    let (name, argument) = rune_call(from, identifier)?;
    eager(name).then(|| {
        copy(
            from,
            to,
            rewriter,
            argument.expect("a checked eager argument"),
        )
    })
}

pub(crate) fn local(name: &str) -> Option<&'static str> {
    Some(match name {
        "$effect" => "$$effect",
        "$effect.pre" => "$$effect_pre",
        "$effect.root" => "$$effect_root",
        "$effect.tracking" => "$$effect_tracking",
        "$effect.pending" => "$$effect_pending",
        "$state.snapshot" => "$$snapshot",
        "$host" => "$$host",
        _ => return None,
    })
}

pub(super) fn inspect_call(tree: &SyntaxTree, identifier: NodeIdentifier) -> bool {
    let Kind::Call { callee, .. } = tree.kind(identifier) else {
        return false;
    };
    if rune_call(tree, identifier)
        .is_some_and(|(name, _)| matches!(name, "$inspect" | "$inspect.trace"))
    {
        return true;
    }
    matches!(tree.kind(callee), Kind::Member { object, property, computed: false, .. }
        if tree.name(property) == "with" && rune_call(tree, object).is_some_and(|(name, _)| name == "$inspect"))
}

pub(super) const SOURCE: &str = include_str!("runes.js");

pub(crate) fn value(name: &str) -> bool {
    matches!(name, "$state" | "$state.raw" | "$derived" | "$derived.by")
}
