//! Shared rune rewriting with a target parameter.

mod declarators;
mod props;

pub(super) use declarators::check_destructured_rune;
use declarators::lower_value_declarator;
use props::{lower_client_props, server_props_pattern};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_svelte::semantic::resolve::{BindingKind, Resolution, rune_call};
use rsvelte_typescript::copy::{Rewrite, copy, copy_node};
use rsvelte_typescript::operators::{
    AssignmentOperator, BinaryOperator, LogicalOperator, UnaryOperator, UpdateOperator,
};
use rsvelte_typescript::scope::BindingIdentifier;
use rsvelte_typescript::syntax_tree::flag;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::FxHashMap;

use super::names::Names;
use super::{Target, unsupported};

#[derive(Debug)]
pub(super) struct ScriptRewrite<'a> {
    pub target: Target,
    pub accessors: bool,
    pub rest_reads: Option<&'a rustc_hash::FxHashSet<NodeIdentifier>>,
    pub res: &'a Resolution,
    /// The document the source tree's spans index.
    pub source_text: &'a str,
    /// How the client reads the names the template declares, for those in scope (upstream's
    /// per-block `transform`, keyed by binding instead of by name).
    pub template: Option<&'a FxHashMap<BindingIdentifier, Read>>,
}

/// How a name the template declares is read on the client.
#[derive(Clone, Debug)]
pub(super) enum Read {
    Plain,
    /// `$.get(name)`
    Get,
    /// `name()`
    Call,
    /// `$.get(object).name`: a name that a destructuring `{@const}` declares.
    #[expect(dead_code, reason = "template const destructuring is not lowered yet")]
    Member(String),
}

impl Read {
    pub(super) const fn get_if(through_get: bool) -> Self {
        if through_get { Self::Get } else { Self::Plain }
    }
}

impl ScriptRewrite<'_> {
    pub(super) fn is_prop_source(&self, binding: BindingIdentifier) -> bool {
        self.res.is_prop_source(binding)
            || (self.accessors
                && matches!(
                    self.res.bindings[binding].kind,
                    BindingKind::Property | BindingKind::BindableProperty
                ))
    }

    /// Upstream `build_getter` / the `read` transforms, by binding kind and target.
    fn read(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        if self.target == Target::Client
            && self
                .rest_reads
                .is_some_and(|reads| reads.contains(&identifier))
        {
            return Some(to.identifier("$$props"));
        }
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
                if self.is_prop_source(b) {
                    return Some(to.call0(x, &[]));
                }
                let key = info.prop_key?;
                let props = to.identifier("$$props");
                let computed = !from.is_identifier(key);
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
                BindingKind::Each
                | BindingKind::StaticIndex
                | BindingKind::KeyedIndex
                | BindingKind::Snippet
                | BindingKind::Template,
            ) => {
                let Some(read) = self.template.and_then(|m| m.get(&b)) else {
                    unreachable!("a template name is read only inside its block")
                };
                let x = to.ident(name, source_location);
                match read {
                    Read::Plain => None,
                    Read::Get => Some(to.runtime("$", "get", &[x])),
                    Read::Call => Some(to.call0(x, &[])),
                    Read::Member(object) => {
                        let o = to.identifier(object);
                        let get = to.runtime("$", "get", &[o]);
                        Some(to.member(
                            get,
                            x,
                            false,
                            false,
                            rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
                        ))
                    }
                }
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
        if self.target != Target::Client || !from.is_identifier(target) {
            return None;
        }
        let (b, info) = self.res.binding(target)?;
        let state = self.res.is_state_source(b)
            || matches!(info.kind, BindingKind::Derived | BindingKind::DerivedBy);
        let prop = self.is_prop_source(b);
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
        if !from.is_identifier(arg) {
            return None;
        }
        let (b, info) = self.res.binding(arg)?;
        let derived = matches!(info.kind, BindingKind::Derived | BindingKind::DerivedBy);
        if self.target == Target::Server && !derived {
            return None;
        }
        let x = to.ident(from.name(arg), from.source_location(arg));
        let mut arguments = vec![x];
        if op == UpdateOperator::Dec {
            arguments.push(to.write_number(
                -1.0,
                rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
            ));
        }
        let name = if self.target == Target::Server {
            if prefix {
                "update_derived_pre"
            } else {
                "update_derived"
            }
        } else if self.res.is_state_source(b) || derived {
            if prefix { "update_pre" } else { "update" }
        } else if self.is_prop_source(b) {
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
            Kind::Call { arguments, .. } => {
                let name = match (self.target, rune_call(from, identifier)?.0) {
                    (Target::Client, "$host") => {
                        let props = to.identifier("$$props");
                        return Some(to.dot(props, "$$host"));
                    }
                    (Target::Server, "$host") => {
                        let zero = to.write_number(
                            0.0,
                            rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
                        );
                        return Some(to.unary(
                            UnaryOperator::Void,
                            zero,
                            rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
                        ));
                    }
                    (Target::Client, "$effect.pending") => {
                        let namespace = to.identifier("$");
                        let pending = to.dot(namespace, "pending");
                        return Some(to.runtime("$", "eager", &[pending]));
                    }
                    (Target::Server, "$effect.pending") => {
                        return Some(to.write_number(
                            0.0,
                            rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
                        ));
                    }
                    (Target::Client, "$effect.tracking") => {
                        return Some(to.runtime("$", "effect_tracking", &[]));
                    }
                    (Target::Server, "$effect.tracking") => {
                        return Some(to.write_boolean(
                            false,
                            rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
                        ));
                    }
                    (Target::Client, "$effect") => "user_effect",
                    (Target::Client, "$effect.pre") => "user_pre_effect",
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
            // Upstream lowers a state or derived declaration in a nested function the same way.
            Kind::Declarator { .. } => lower_value_declarator(from, to, self, identifier),
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
pub(super) fn should_proxy(syntax_tree: &SyntaxTree, res: &Resolution, e: NodeIdentifier) -> bool {
    proxyable(syntax_tree, Some(res), e)
}

/// `res` is `None` for a binding's initial value, which upstream checks without a scope.
fn proxyable(syntax_tree: &SyntaxTree, res: Option<&Resolution>, e: NodeIdentifier) -> bool {
    match syntax_tree.kind(e) {
        Kind::String
        | Kind::Regex { .. }
        | Kind::BigInt
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

#[derive(Clone, Copy, PartialEq, Eq)]
pub(super) enum ScriptContext {
    Instance,
    Module,
}

/// Script statements share rune lowering; imports go to `hoisted`.
///
/// # Errors
///
/// An `unsupported` [`Diagnostic`] if the script exports anything or destructures a rune that
/// upstream splits per path.
///
/// # Panics
///
/// If a top-level statement of the parsed script has no source range.
pub(super) fn lower_script(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    rw: &mut ScriptRewrite<'_>,
    program: NodeIdentifier,
    hoisted: &mut Vec<NodeIdentifier>,
    names: &mut Names,
    context: ScriptContext,
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
            Kind::ExportNamed(_)
            | Kind::ExportDefault(_)
            | Kind::Control(
                rsvelte_typescript::syntax_tree::Control::ExportList { .. }
                | rsvelte_typescript::syntax_tree::Control::ExportAll { .. },
            ) if context == ScriptContext::Instance => {
                return unsupported(
                    "an export from the instance script",
                    from.source_location(statement)
                        .span()
                        .expect("a parsed statement has a source range"),
                );
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

fn lower_declarator(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    rw: &mut ScriptRewrite<'_>,
    d: NodeIdentifier,
    out: &mut Vec<NodeIdentifier>,
    hoisted: &mut Vec<NodeIdentifier>,
    names: &mut Names,
) {
    if let Some(lowered) = lower_value_declarator(from, to, rw, d) {
        out.push(lowered);
        return;
    }
    let Kind::Declarator {
        identifier,
        initializer: Some(initializer),
    } = from.kind(d)
    else {
        out.push(copy(from, to, rw, d));
        return;
    };
    let source_location = from.source_location(d);
    match (
        rw.target,
        rune_call(from, initializer).map(|(rune, _)| rune),
    ) {
        (Target::Server, Some("$props")) => {
            let target = server_props_pattern(from, to, rw, identifier);
            let props = to.identifier("$$props");
            out.push(to.declarator(target, Some(props), source_location));
        }
        (Target::Client, Some("$props")) => {
            lower_client_props(from, to, rw, identifier, out, hoisted, names);
        }
        _ => out.push(copy(from, to, rw, d)),
    }
}
