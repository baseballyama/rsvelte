use super::{
    BindingKind, Kind, Names, NodeIdentifier, Rewrite, ScriptRewrite, SyntaxTree, copy, flag,
    rune_call, should_proxy,
};
use crate::lower::javascript::is_simple_expression;

pub(super) fn server_props_pattern(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    rw: &mut ScriptRewrite<'_>,
    identifier: NodeIdentifier,
) -> NodeIdentifier {
    let rw = &mut UnwrapBindable(rw);
    let hidden = |to: &mut SyntaxTree| {
        ["$$slots", "$$events"].map(|name| {
            let value = to.identifier(name);
            crate::lower::javascript::init_property(to, name, value)
        })
    };
    match from.kind(identifier) {
        Kind::ObjectPattern(props)
            if props
                .last()
                .is_some_and(|&p| matches!(from.kind(p), Kind::Rest(_))) =>
        {
            let mut copied: Vec<NodeIdentifier> =
                props.iter().map(|&p| copy(from, to, rw, p)).collect();
            let rest = copied.pop().expect("the pattern ends with a rest element");
            copied.extend(hidden(to));
            copied.push(rest);
            to.object_pat(&copied, from.source_location(identifier))
        }
        Kind::Identifier(_) => {
            let mut props = hidden(to).to_vec();
            let name = copy(from, to, rw, identifier);
            props.push(to.rest(
                name,
                rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
            ));
            to.object_pat(
                &props,
                rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
            )
        }
        _ => copy(from, to, rw, identifier),
    }
}

/// Upstream server `$props` declaration: `x = $bindable(d)` becomes `x = d`.
struct UnwrapBindable<'r, 'a>(&'r mut ScriptRewrite<'a>);

impl Rewrite for UnwrapBindable<'_, '_> {
    fn rewrite(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        if let Kind::AssignPattern(left, right) = from.kind(identifier)
            && let Some(("$bindable", arg)) = rune_call(from, right)
        {
            let left = copy(from, to, self, left);
            let right = if let Some(a) = arg {
                copy(from, to, self, a)
            } else {
                let zero = to.write_number(
                    0.0,
                    rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
                );
                to.unary(
                    rsvelte_typescript::operators::UnaryOperator::Void,
                    zero,
                    rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
                )
            };
            return Some(to.assign_pat(left, right, from.source_location(identifier)));
        }
        self.0.rewrite(from, to, identifier)
    }
}

/// Upstream client `VariableDeclaration`, `$props` branch: only props that need a source get a
/// declaration (`$.prop(…)`); the rest are read as `$$props.x`, and a rest pattern is
/// `$.rest_props` without the names declared before it.
#[expect(
    clippy::too_many_lines,
    reason = "ports upstream's `$props` branch in one piece"
)]
pub(super) fn lower_client_props(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    rw: &mut ScriptRewrite<'_>,
    pattern: NodeIdentifier,
    out: &mut Vec<NodeIdentifier>,
    hoisted: &mut Vec<NodeIdentifier>,
    names: &mut Names,
) {
    let mut seen: Vec<String> = ["$$slots", "$$events", "$$legacy"]
        .map(str::to_owned)
        .to_vec();
    if rw.accessors {
        seen.push("$$host".to_owned());
    }
    let mut rest_props = |target: NodeIdentifier, seen: &[String], to: &mut SyntaxTree| {
        let exclude = names.unique("rest_excludes");
        let items: Vec<NodeIdentifier> = seen.iter().map(|n| to.write_string(n)).collect();
        let array = to.array(
            &items,
            rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
        );
        let set = to.identifier("Set");
        let new = to.new_(
            set,
            &[array],
            rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
        );
        let identifier = to.identifier(&exclude);
        hoisted.push(to.let_(flag::VAR, identifier, Some(new)));
        let props = to.identifier("$$props");
        let exclude = to.identifier(&exclude);
        let call = to.runtime("$", "rest_props", &[props, exclude]);
        let target = to.ident(from.name(target), from.source_location(target));
        to.declarator(
            target,
            Some(call),
            rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
        )
    };
    let Kind::ObjectPattern(props) = from.kind(pattern) else {
        out.push(rest_props(pattern, &seen, to));
        return;
    };
    for &p in props {
        let (key, value) = match from.kind(p) {
            Kind::Property { key, value, .. } => (key, value),
            Kind::Rest(arg) => {
                out.push(rest_props(arg, &seen, to));
                continue;
            }
            _ => continue,
        };
        let key_name = match from.kind(key) {
            Kind::Identifier(_) => from.name(key).to_owned(),
            _ => from.str_value(key, rw.source_text).to_owned(),
        };
        seen.push(key_name.clone());
        let local = match from.kind(value) {
            Kind::AssignPattern(l, _) => l,
            _ => value,
        };
        let Some((b, info)) = rw.res.binding(local) else {
            continue;
        };
        if !rw.is_prop_source(b) {
            continue;
        }
        let s = &rw.res.sem.bindings[b];
        let mut flags = 1 | 2; // PROPS_IS_IMMUTABLE | PROPS_IS_RUNES
        if info.kind == BindingKind::BindableProperty {
            flags |= 8;
        }
        if rw.accessors || s.writes > 0 || s.mutations > 0 {
            flags |= 4; // PROPS_IS_UPDATED
        }
        let mut arguments = vec![to.identifier("$$props"), to.write_string(&key_name)];
        let initial = info.initial.map(|i| {
            let initializer = copy(from, to, rw, i);
            if info.kind == BindingKind::BindableProperty && should_proxy(from, rw.res, i) {
                to.runtime("$", "proxy", &[initializer])
            } else {
                initializer
            }
        });
        let arg = initial.map(|initializer| {
            if is_simple_expression(to, initializer) {
                initializer
            } else {
                flags |= 16; // PROPS_IS_LAZY_INITIAL
                match to.kind(initializer) {
                    Kind::Call {
                        callee, arguments, ..
                    } if arguments.is_empty() && to.is_identifier(callee) => callee,
                    _ => to.arrow(
                        &[],
                        initializer,
                        true,
                        false,
                        rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
                    ),
                }
            }
        });
        arguments.push(to.write_number(
            f64::from(flags),
            rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
        ));
        if let Some(a) = arg {
            arguments.push(a);
        }
        let call = to.runtime("$", "prop", &arguments);
        let target = to.ident(from.name(local), from.source_location(local));
        out.push(to.declarator(target, Some(call), from.source_location(p)));
    }
}
