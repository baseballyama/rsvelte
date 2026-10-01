//! Rune lowering for both targets: one [`Rewrite`] whose only parameter is the [`Target`].

use rsvelte_javascript::copy::{Rewrite, copy, copy_node};
use rsvelte_javascript::operators::{
    AssignmentOperator, BinaryOperator, LogicalOperator, UpdateOperator,
};
use rsvelte_javascript::syntax_tree::flag;
use rsvelte_javascript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;

use super::Target;
use crate::semantic::resolve::{BindingKind, Resolution, rune_call};

#[derive(Debug)]
pub struct ScriptRewrite<'a> {
    pub target: Target,
    pub res: &'a Resolution,
}

impl ScriptRewrite<'_> {
    /// Upstream `build_getter` / the `read` transforms, by binding kind and target.
    fn read(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        let (b, info) = self.res.binding(identifier)?;
        if self.res.sem.bindings[b].node == identifier {
            return None;
        }
        let source_location = from.source_location(identifier);
        let name = from.name(identifier);
        match (self.target, info.kind) {
            (Target::Client, BindingKind::State | BindingKind::RawState)
                if self.res.is_state_source(b) =>
            {
                let x = to.ident(name, source_location);
                Some(to.runtime("$", "get", &[x]))
            }
            (Target::Client, BindingKind::Derived | BindingKind::DerivedBy) => {
                let x = to.ident(name, source_location);
                Some(to.runtime("$", "get", &[x]))
            }
            (Target::Client, BindingKind::Property | BindingKind::BindableProperty) => {
                let x = to.ident(name, source_location);
                if self.res.is_prop_source(b) {
                    return Some(to.call0(x, &[]));
                }
                let key = info.prop_key?;
                let props = to.identifier("$$props");
                let computed = !matches!(from.kind(key), Kind::Identifier(_));
                let k = if computed {
                    copy_node(from, to, self, key)
                } else {
                    to.ident(from.name(key), source_location)
                };
                Some(to.member(
                    props,
                    k,
                    computed,
                    false,
                    rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
                ))
            }
            (Target::Server, BindingKind::Derived | BindingKind::DerivedBy) => {
                let x = to.ident(name, source_location);
                Some(to.call0(x, &[]))
            }
            _ => None,
        }
    }

    fn assign(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
        op: AssignmentOperator,
        target: NodeIdentifier,
        value: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        if self.target != Target::Client || !matches!(from.kind(target), Kind::Identifier(_)) {
            return None;
        }
        let (b, info) = self.res.binding(target)?;
        let state = self.res.is_state_source(b)
            || matches!(info.kind, BindingKind::Derived | BindingKind::DerivedBy);
        let prop = self.res.is_prop_source(b);
        if !state && !prop {
            return None;
        }
        // Upstream `build_assignment_value`: `a += b` assigns `a + b`, read through the transform.
        let rhs = copy(from, to, self, value);
        let new_value = if op == AssignmentOperator::Assign {
            rhs
        } else {
            let current = self.read(from, to, target)?;
            match logical_of(op) {
                Some(l) => to.logical(l, current, rhs, from.source_location(identifier)),
                None => to.binary(
                    binary_of(op),
                    current,
                    rhs,
                    from.source_location(identifier),
                ),
            }
        };
        let x = to.ident(from.name(target), from.source_location(target));
        if prop {
            return Some(to.call(x, &[new_value], false, from.source_location(identifier)));
        }
        let proxy = info.kind == BindingKind::State
            && matches!(
                op,
                AssignmentOperator::Assign
                    | AssignmentOperator::Or
                    | AssignmentOperator::And
                    | AssignmentOperator::Nullish
            )
            && should_proxy(from, self.res, value);
        let mut arguments = vec![x, new_value];
        if proxy {
            arguments.push(to.write_boolean(
                true,
                rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
            ));
        }
        Some(to.runtime("$", "set", &arguments))
    }

    fn update(
        &self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        op: UpdateOperator,
        prefix: bool,
        arg: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        if self.target != Target::Client || !matches!(from.kind(arg), Kind::Identifier(_)) {
            return None;
        }
        let (b, info) = self.res.binding(arg)?;
        let x = to.ident(from.name(arg), from.source_location(arg));
        let mut arguments = vec![x];
        if op == UpdateOperator::Dec {
            arguments.push(to.write_number(
                -1.0,
                rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
            ));
        }
        let name = if self.res.is_state_source(b)
            || matches!(info.kind, BindingKind::Derived | BindingKind::DerivedBy)
        {
            if prefix { "update_pre" } else { "update" }
        } else if self.res.is_prop_source(b) {
            if prefix {
                "update_pre_prop"
            } else {
                "update_prop"
            }
        } else {
            return None;
        };
        Some(to.runtime("$", name, &arguments))
    }
}

impl Rewrite for ScriptRewrite<'_> {
    fn rewrite(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        match from.kind(identifier) {
            Kind::Identifier(_) => self.read(from, to, identifier),
            Kind::Assign(op, target, value) => self.assign(from, to, identifier, op, target, value),
            Kind::Update { op, prefix, arg } => self.update(from, to, op, prefix, arg),
            Kind::Property { key, value, .. } if from.flags(identifier) & flag::SHORTHAND != 0 => {
                // `{ count }` stops being shorthand when `count` reads through a transform.
                let v = self.read(from, to, value)?;
                let k = to.ident(from.name(key), from.source_location(key));
                Some(to.property(
                    k,
                    v,
                    from.flags(identifier) & !flag::SHORTHAND,
                    from.source_location(identifier),
                ))
            }
            _ => None,
        }
    }
}

const fn logical_of(op: AssignmentOperator) -> Option<LogicalOperator> {
    match op {
        AssignmentOperator::Or => Some(LogicalOperator::Or),
        AssignmentOperator::And => Some(LogicalOperator::And),
        AssignmentOperator::Nullish => Some(LogicalOperator::Nullish),
        _ => None,
    }
}

fn binary_of(op: AssignmentOperator) -> BinaryOperator {
    let text = op.as_str();
    BinaryOperator::parse(&text[..text.len() - 1])
        .expect("every compound assignment has a binary operator")
}

/// Upstream `should_proxy`.
#[must_use]
pub fn should_proxy(syntax_tree: &SyntaxTree, res: &Resolution, e: NodeIdentifier) -> bool {
    match syntax_tree.kind(e) {
        Kind::String
        | Kind::Number(_)
        | Kind::Boolean(_)
        | Kind::Null
        | Kind::Template { .. }
        | Kind::Arrow { .. }
        | Kind::Unary(..)
        | Kind::Binary(..)
        | Kind::Function {
            declaration: false, ..
        } => false,
        Kind::Identifier(_) if syntax_tree.name(e) == "undefined" => false,
        Kind::Identifier(_) => {
            let Some((b, _)) = res.binding(e) else {
                return true;
            };
            let s = &res.sem.bindings[b];
            if s.writes > 0 {
                return true;
            }
            s.initializer(syntax_tree)
                .is_none_or(|initializer| should_proxy(syntax_tree, res, initializer))
        }
        _ => true,
    }
}

/// The instance script's statements, lowered; imports go to `hoisted`.
///
/// # Errors
///
/// An `unsupported` [`Diagnostic`] if the script exports anything.
///
/// # Panics
///
/// If a top-level statement of the parsed script has no source range.
pub fn lower_instance(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    rw: &mut ScriptRewrite<'_>,
    program: NodeIdentifier,
    hoisted: &mut Vec<NodeIdentifier>,
) -> Result<Vec<NodeIdentifier>, Diagnostic> {
    let Kind::Program(body) = from.kind(program) else {
        unreachable!("scripts parse to programs")
    };
    let mut out = Vec::with_capacity(body.len());
    for &statement in body {
        match from.kind(statement) {
            Kind::TypeScriptDeclaration => {}
            Kind::Import { .. } => hoisted.push(copy(from, to, rw, statement)),
            // Upstream turns these into the component's exports; copying them would put an
            // `export` inside the component function.
            Kind::ExportNamed(_) | Kind::ExportDefault(_) => {
                return Err(Diagnostic::error(
                    "unsupported",
                    "exports from the instance script are not supported yet",
                    from.source_location(statement)
                        .span()
                        .expect("a parsed statement has a source range"),
                ));
            }
            Kind::VariableDeclaration { kind, declarations } => {
                let mut lowered = Vec::with_capacity(declarations.len());
                for &d in declarations {
                    lower_declarator(from, to, rw, d, &mut lowered);
                }
                if !lowered.is_empty() {
                    out.push(to.var_declaration(kind, &lowered, from.source_location(statement)));
                }
            }
            _ => out.push(copy(from, to, rw, statement)),
        }
    }
    Ok(out)
}

fn lower_declarator(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    rw: &mut ScriptRewrite<'_>,
    d: NodeIdentifier,
    out: &mut Vec<NodeIdentifier>,
) {
    let Kind::Declarator {
        identifier,
        initializer: Some(initializer),
    } = from.kind(d)
    else {
        out.push(copy(from, to, rw, d));
        return;
    };
    let Some((rune, arg)) = rune_call(from, initializer) else {
        out.push(copy(from, to, rw, d));
        return;
    };
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
                rsvelte_javascript::operators::UnaryOperator::Void,
                zero,
                rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
            )
        }
    };
    match (rw.target, rune) {
        (_, "$state" | "$state.raw") => {
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
            out.push(to.declarator(target, Some(v), source_location));
        }
        (_, "$derived" | "$derived.by") => {
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
            out.push(to.declarator(target, Some(call), source_location));
        }
        (Target::Server, "$props") => {
            let target = copy(from, to, rw, identifier);
            let props = to.identifier("$$props");
            out.push(to.declarator(target, Some(props), source_location));
        }
        (Target::Client, "$props") => lower_client_props(from, to, rw, identifier, out),
        _ => out.push(copy(from, to, rw, d)),
    }
}

/// Upstream client `VariableDeclaration`, `$props` branch: only props that need a source get a
/// declaration (`$.prop(…)`); the rest are read as `$$props.x`.
fn lower_client_props(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    rw: &mut ScriptRewrite<'_>,
    pattern: NodeIdentifier,
    out: &mut Vec<NodeIdentifier>,
) {
    let Kind::ObjectPattern(props) = from.kind(pattern) else {
        // `let props = $props()`: rest_props needs the excluded-names set; not ported yet.
        out.push(copy(from, to, rw, pattern));
        return;
    };
    for &p in props {
        let Kind::Property { key, value, .. } = from.kind(p) else {
            continue;
        };
        let local = match from.kind(value) {
            Kind::AssignPattern(l, _) => l,
            _ => value,
        };
        let Some((b, info)) = rw.res.binding(local) else {
            continue;
        };
        if !rw.res.is_prop_source(b) {
            continue;
        }
        let key_name = match from.kind(key) {
            Kind::Identifier(_) => from.name(key).to_owned(),
            _ => from.str_value(key, "").to_owned(),
        };
        let s = &rw.res.sem.bindings[b];
        let mut flags = 1 | 2; // PROPS_IS_IMMUTABLE | PROPS_IS_RUNES
        if info.kind == BindingKind::BindableProperty {
            flags |= 8;
        }
        if s.writes > 0 || s.mutations > 0 {
            flags |= 4; // PROPS_IS_UPDATED
        }
        let mut arguments = vec![to.identifier("$$props"), to.write_string(&key_name)];
        let initial = info.initial.map(|i| copy(from, to, rw, i));
        let arg = initial.map(|initializer| {
            if is_simple_expression(to, initializer) {
                initializer
            } else {
                flags |= 16; // PROPS_IS_LAZY_INITIAL
                match to.kind(initializer) {
                    Kind::Call {
                        callee, arguments, ..
                    } if arguments.is_empty() && matches!(to.kind(callee), Kind::Identifier(_)) => {
                        callee
                    }
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

/// Upstream `is_simple_expression`.
fn is_simple_expression(syntax_tree: &SyntaxTree, e: NodeIdentifier) -> bool {
    match syntax_tree.kind(e) {
        Kind::String
        | Kind::Number(_)
        | Kind::Boolean(_)
        | Kind::Null
        | Kind::Identifier(_)
        | Kind::Arrow { .. }
        | Kind::Function {
            declaration: false, ..
        } => true,
        Kind::Conditional {
            test,
            consequent,
            alternate,
        } => {
            is_simple_expression(syntax_tree, test)
                && is_simple_expression(syntax_tree, consequent)
                && is_simple_expression(syntax_tree, alternate)
        }
        Kind::Binary(_, l, r) | Kind::Logical(_, l, r) => {
            is_simple_expression(syntax_tree, l) && is_simple_expression(syntax_tree, r)
        }
        _ => false,
    }
}
