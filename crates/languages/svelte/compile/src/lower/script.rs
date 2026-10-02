//! Rune lowering for both targets: one [`Rewrite`] whose only parameter is the [`Target`].

use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_svelte::semantic::resolve::{BindingKind, Resolution, rune_call};
use rsvelte_typescript::copy::{Rewrite, copy, copy_node};
use rsvelte_typescript::operators::{
    AssignmentOperator, BinaryOperator, LogicalOperator, UpdateOperator,
};
use rsvelte_typescript::scope::BindingIdentifier;
use rsvelte_typescript::syntax_tree::flag;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::FxHashMap;

use super::Target;
use super::names::Names;

#[derive(Debug)]
pub struct ScriptRewrite<'a> {
    pub target: Target,
    pub res: &'a Resolution,
    /// The document the source tree's spans index.
    pub source_text: &'a str,
    /// The `{#each}` names in scope on the client, and whether a read goes through `$.get`
    /// (upstream's per-block `transform`).
    pub each: Option<&'a FxHashMap<BindingIdentifier, bool>>,
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
            (
                Target::Client,
                BindingKind::Each | BindingKind::StaticIndex | BindingKind::KeyedIndex,
            ) => {
                let Some(&through_get) = self.each.and_then(|m| m.get(&b)) else {
                    unreachable!("an `{{#each}}` name is read only inside its block")
                };
                if !through_get {
                    return None;
                }
                let x = to.ident(name, source_location);
                Some(to.runtime("$", "get", &[x]))
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
            Kind::Block(body)
                if self.target == Target::Server && body.iter().any(|&s| is_effect(from, s)) =>
            {
                let kept: Vec<NodeIdentifier> = body
                    .iter()
                    .filter(|&&s| !is_effect(from, s))
                    .map(|&s| copy(from, to, self, s))
                    .collect();
                Some(to.block(&kept, from.source_location(identifier)))
            }
            Kind::Call { arguments, .. } if self.target == Target::Client => {
                let name = match rune_call(from, identifier)?.0 {
                    "$effect" => "user_effect",
                    "$effect.pre" => "user_pre_effect",
                    _ => return None,
                };
                let arguments: Vec<NodeIdentifier> =
                    arguments.iter().map(|&a| copy(from, to, self, a)).collect();
                Some(to.runtime("$", name, &arguments))
            }
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

/// Upstream server `ExpressionStatement`: an effect statement renders nothing.
fn is_effect(from: &SyntaxTree, statement: NodeIdentifier) -> bool {
    matches!(from.kind(statement), Kind::ExpressionStatement(e)
        if rune_call(from, e).is_some_and(|(r, _)| matches!(r, "$effect" | "$effect.pre")))
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
    proxyable(syntax_tree, Some(res), e)
}

/// `res` is `None` for a binding's initial value, which upstream checks without a scope.
fn proxyable(syntax_tree: &SyntaxTree, res: Option<&Resolution>, e: NodeIdentifier) -> bool {
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
            let Some(res) = res else {
                return true;
            };
            let Some((b, info)) = res.binding(e) else {
                return true;
            };
            let s = &res.sem.bindings[b];
            if s.writes > 0 {
                return true;
            }
            // Analysis rewires a prop's initial from `$props()` to its default.
            let initial = match info.kind {
                BindingKind::Property
                | BindingKind::BindableProperty
                | BindingKind::RestProperty => info.initial,
                _ => s.initializer(syntax_tree),
            };
            initial.is_none_or(|initializer| proxyable(syntax_tree, None, initializer))
        }
        _ => true,
    }
}

/// The instance script's statements, lowered; imports go to `hoisted`.
///
/// # Errors
///
/// An `unsupported` [`Diagnostic`] if the script exports anything or destructures a rune that
/// upstream splits per path.
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
    names: &mut Names,
) -> Result<Vec<NodeIdentifier>, Diagnostic> {
    let Kind::Program(body) = from.kind(program) else {
        unreachable!("scripts parse to programs")
    };
    let mut out = Vec::with_capacity(body.len());
    for &statement in body {
        match from.kind(statement) {
            Kind::TypeScriptDeclaration => {}
            _ if rw.target == Target::Server && is_effect(from, statement) => {}
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
                for &d in declarations {
                    check_destructured_rune(from, rw.target, d)?;
                }
                let mut lowered = Vec::with_capacity(declarations.len());
                for &d in declarations {
                    lower_declarator(from, to, rw, d, &mut lowered, hoisted, names);
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

/// Upstream splits a destructured `$derived` (both targets) and a destructured `$state` (client)
/// into one declaration per path; this port has no `extract_paths` yet.
fn check_destructured_rune(
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
    if matches!(from.kind(identifier), Kind::Identifier(_)) {
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
        return Err(Diagnostic::error(
            "unsupported",
            format!("a destructured `{rune}` declaration is not supported yet"),
            from.source_location(d)
                .span()
                .expect("a parsed declarator has a source range"),
        ));
    }
    Ok(())
}

fn lower_declarator(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    rw: &mut ScriptRewrite<'_>,
    d: NodeIdentifier,
    out: &mut Vec<NodeIdentifier>,
    hoisted: &mut Vec<NodeIdentifier>,
    names: &mut Names,
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
                rsvelte_typescript::operators::UnaryOperator::Void,
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
            let target = server_props_pattern(from, to, rw, identifier);
            let props = to.identifier("$$props");
            out.push(to.declarator(target, Some(props), source_location));
        }
        (Target::Client, "$props") => {
            lower_client_props(from, to, rw, identifier, out, hoisted, names);
        }
        _ => out.push(copy(from, to, rw, d)),
    }
}

/// Upstream server `VariableDeclaration`, `$props` branch: a rest pattern or a bare identifier
/// must not collect `$$slots` and `$$events`. `$$slots` references are refused earlier, so
/// the deconflicted `$$slots_` name never applies.
fn server_props_pattern(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    rw: &mut ScriptRewrite<'_>,
    identifier: NodeIdentifier,
) -> NodeIdentifier {
    let rw = &mut UnwrapBindable(rw);
    let hidden = |to: &mut SyntaxTree| {
        ["$$slots", "$$events"].map(|name| {
            let value = to.identifier(name);
            super::javascript::init_property(to, name, value)
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
fn lower_client_props(
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
        if !rw.res.is_prop_source(b) {
            continue;
        }
        let s = &rw.res.sem.bindings[b];
        let mut flags = 1 | 2; // PROPS_IS_IMMUTABLE | PROPS_IS_RUNES
        if info.kind == BindingKind::BindableProperty {
            flags |= 8;
        }
        if s.writes > 0 || s.mutations > 0 {
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
