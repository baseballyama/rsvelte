//! Rune lowering for both targets: one [`Rewrite`] whose only parameter is the [`Target`].

use rsv_js::ast::flag;
use rsv_js::copy::{Rewrite, copy, copy_node};
use rsv_js::ops::{AssignOp, BinOp, LogicalOp, UpdateOp};
use rsv_js::{Ast, Kind, NodeId};
use rsv_kernel::diag::Diagnostic;

use super::Target;
use crate::resolve::{BindKind, Resolution, rune_call};

#[derive(Debug)]
pub struct ScriptRewrite<'a> {
    pub target: Target,
    pub res: &'a Resolution,
}

impl ScriptRewrite<'_> {
    /// Upstream `build_getter` / the `read` transforms, by binding kind and target.
    fn read(&mut self, from: &Ast, to: &mut Ast, id: NodeId) -> Option<NodeId> {
        let (b, info) = self.res.binding(id)?;
        if self.res.sem.bindings[b].node == id {
            return None;
        }
        let loc = from.loc(id);
        let name = from.name(id);
        match (self.target, info.kind) {
            (Target::Client, BindKind::State | BindKind::RawState)
                if self.res.is_state_source(b) =>
            {
                let x = to.ident(name, loc);
                Some(to.runtime("$", "get", &[x]))
            }
            (Target::Client, BindKind::Derived | BindKind::DerivedBy) => {
                let x = to.ident(name, loc);
                Some(to.runtime("$", "get", &[x]))
            }
            (Target::Client, BindKind::Prop | BindKind::BindableProp) => {
                let x = to.ident(name, loc);
                if self.res.is_prop_source(b) {
                    return Some(to.call0(x, &[]));
                }
                let key = info.prop_key?;
                let props = to.id("$$props");
                let computed = !matches!(from.kind(key), Kind::Ident(_));
                let k = if computed {
                    copy_node(from, to, self, key)
                } else {
                    to.ident(from.name(key), loc)
                };
                Some(to.member(
                    props,
                    k,
                    computed,
                    false,
                    rsv_kernel::source::Loc::SYNTHETIC,
                ))
            }
            (Target::Server, BindKind::Derived | BindKind::DerivedBy) => {
                let x = to.ident(name, loc);
                Some(to.call0(x, &[]))
            }
            _ => None,
        }
    }

    fn assign(
        &mut self,
        from: &Ast,
        to: &mut Ast,
        id: NodeId,
        op: AssignOp,
        target: NodeId,
        value: NodeId,
    ) -> Option<NodeId> {
        if self.target != Target::Client || !matches!(from.kind(target), Kind::Ident(_)) {
            return None;
        }
        let (b, info) = self.res.binding(target)?;
        let state = self.res.is_state_source(b)
            || matches!(info.kind, BindKind::Derived | BindKind::DerivedBy);
        let prop = self.res.is_prop_source(b);
        if !state && !prop {
            return None;
        }
        // Upstream `build_assignment_value`: `a += b` assigns `a + b`, read through the transform.
        let rhs = copy(from, to, self, value);
        let new_value = if op == AssignOp::Assign {
            rhs
        } else {
            let current = self.read(from, to, target)?;
            match logical_of(op) {
                Some(l) => to.logical(l, current, rhs, from.loc(id)),
                None => to.binary(binary_of(op), current, rhs, from.loc(id)),
            }
        };
        let x = to.ident(from.name(target), from.loc(target));
        if prop {
            return Some(to.call(x, &[new_value], false, from.loc(id)));
        }
        let proxy = info.kind == BindKind::State
            && matches!(
                op,
                AssignOp::Assign | AssignOp::Or | AssignOp::And | AssignOp::Nullish
            )
            && should_proxy(from, self.res, value);
        let mut args = vec![x, new_value];
        if proxy {
            args.push(to.bool(true, rsv_kernel::source::Loc::SYNTHETIC));
        }
        Some(to.runtime("$", "set", &args))
    }

    fn update(
        &self,
        from: &Ast,
        to: &mut Ast,
        op: UpdateOp,
        prefix: bool,
        arg: NodeId,
    ) -> Option<NodeId> {
        if self.target != Target::Client || !matches!(from.kind(arg), Kind::Ident(_)) {
            return None;
        }
        let (b, info) = self.res.binding(arg)?;
        let x = to.ident(from.name(arg), from.loc(arg));
        let mut args = vec![x];
        if op == UpdateOp::Dec {
            args.push(to.num(-1.0, rsv_kernel::source::Loc::SYNTHETIC));
        }
        let name = if self.res.is_state_source(b)
            || matches!(info.kind, BindKind::Derived | BindKind::DerivedBy)
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
        Some(to.runtime("$", name, &args))
    }
}

impl Rewrite for ScriptRewrite<'_> {
    fn rewrite(&mut self, from: &Ast, to: &mut Ast, id: NodeId) -> Option<NodeId> {
        match from.kind(id) {
            Kind::Ident(_) => self.read(from, to, id),
            Kind::Assign(op, target, value) => self.assign(from, to, id, op, target, value),
            Kind::Update { op, prefix, arg } => self.update(from, to, op, prefix, arg),
            Kind::Property { key, value, .. } if from.flags(id) & flag::SHORTHAND != 0 => {
                // `{ count }` stops being shorthand when `count` reads through a transform.
                let v = self.read(from, to, value)?;
                let k = to.ident(from.name(key), from.loc(key));
                Some(to.property(k, v, from.flags(id) & !flag::SHORTHAND, from.loc(id)))
            }
            _ => None,
        }
    }
}

const fn logical_of(op: AssignOp) -> Option<LogicalOp> {
    match op {
        AssignOp::Or => Some(LogicalOp::Or),
        AssignOp::And => Some(LogicalOp::And),
        AssignOp::Nullish => Some(LogicalOp::Nullish),
        _ => None,
    }
}

fn binary_of(op: AssignOp) -> BinOp {
    let text = op.as_str();
    BinOp::parse(&text[..text.len() - 1]).expect("every compound assignment has a binary operator")
}

/// Upstream `should_proxy`.
#[must_use]
pub fn should_proxy(ast: &Ast, res: &Resolution, e: NodeId) -> bool {
    match ast.kind(e) {
        Kind::Str
        | Kind::Num(_)
        | Kind::Bool(_)
        | Kind::Null
        | Kind::Template { .. }
        | Kind::Arrow { .. }
        | Kind::Unary(..)
        | Kind::Binary(..)
        | Kind::Function { decl: false, .. } => false,
        Kind::Ident(_) if ast.name(e) == "undefined" => false,
        Kind::Ident(_) => {
            let Some((b, _)) = res.binding(e) else {
                return true;
            };
            let s = &res.sem.bindings[b];
            if s.writes > 0 {
                return true;
            }
            s.init(ast).is_none_or(|init| should_proxy(ast, res, init))
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
    from: &Ast,
    to: &mut Ast,
    rw: &mut ScriptRewrite<'_>,
    program: NodeId,
    hoisted: &mut Vec<NodeId>,
) -> Result<Vec<NodeId>, Diagnostic> {
    let Kind::Program(body) = from.kind(program) else {
        unreachable!("scripts parse to programs")
    };
    let mut out = Vec::with_capacity(body.len());
    for &stmt in body {
        match from.kind(stmt) {
            Kind::TsDecl => {}
            Kind::Import { .. } => hoisted.push(copy(from, to, rw, stmt)),
            // Upstream turns these into the component's exports; copying them would put an
            // `export` inside the component function.
            Kind::ExportNamed(_) | Kind::ExportDefault(_) => {
                return Err(Diagnostic::error(
                    "unsupported",
                    "exports from the instance script are not supported yet",
                    from.loc(stmt)
                        .span()
                        .expect("a parsed statement has a source range"),
                ));
            }
            Kind::VarDecl { kind, decls } => {
                let mut lowered = Vec::with_capacity(decls.len());
                for &d in decls {
                    lower_declarator(from, to, rw, d, &mut lowered);
                }
                if !lowered.is_empty() {
                    out.push(to.var_decl(kind, &lowered, from.loc(stmt)));
                }
            }
            _ => out.push(copy(from, to, rw, stmt)),
        }
    }
    Ok(out)
}

fn lower_declarator(
    from: &Ast,
    to: &mut Ast,
    rw: &mut ScriptRewrite<'_>,
    d: NodeId,
    out: &mut Vec<NodeId>,
) {
    let Kind::Declarator {
        id,
        init: Some(init),
    } = from.kind(d)
    else {
        out.push(copy(from, to, rw, d));
        return;
    };
    let Some((rune, arg)) = rune_call(from, init) else {
        out.push(copy(from, to, rw, d));
        return;
    };
    let loc = from.loc(d);
    let value = |to: &mut Ast, rw: &mut ScriptRewrite<'_>| {
        if let Some(a) = arg {
            copy(from, to, rw, a)
        } else {
            let zero = to.num(0.0, rsv_kernel::source::Loc::SYNTHETIC);
            to.unary(
                rsv_js::ops::UnaryOp::Void,
                zero,
                rsv_kernel::source::Loc::SYNTHETIC,
            )
        }
    };
    match (rw.target, rune) {
        (_, "$state" | "$state.raw") => {
            let mut v = value(to, rw);
            if rw.target == Target::Client {
                let b = rw.res.sem.binding_of(id);
                if rune == "$state" && arg.is_some_and(|a| should_proxy(from, rw.res, a)) {
                    v = to.runtime("$", "proxy", &[v]);
                }
                if b.is_some_and(|b| rw.res.is_state_source(b)) {
                    v = to.runtime("$", "state", &[v]);
                }
            }
            let target = copy(from, to, rw, id);
            out.push(to.declarator(target, Some(v), loc));
        }
        (_, "$derived" | "$derived.by") => {
            let v = value(to, rw);
            let f = if rune == "$derived" {
                to.arrow(&[], v, true, false, rsv_kernel::source::Loc::SYNTHETIC)
            } else {
                v
            };
            let call = to.runtime("$", "derived", &[f]);
            let target = copy(from, to, rw, id);
            out.push(to.declarator(target, Some(call), loc));
        }
        (Target::Server, "$props") => {
            let target = copy(from, to, rw, id);
            let props = to.id("$$props");
            out.push(to.declarator(target, Some(props), loc));
        }
        (Target::Client, "$props") => lower_client_props(from, to, rw, id, out),
        _ => out.push(copy(from, to, rw, d)),
    }
}

/// Upstream client `VariableDeclaration`, `$props` branch: only props that need a source get a
/// declaration (`$.prop(…)`); the rest are read as `$$props.x`.
fn lower_client_props(
    from: &Ast,
    to: &mut Ast,
    rw: &mut ScriptRewrite<'_>,
    pattern: NodeId,
    out: &mut Vec<NodeId>,
) {
    let Kind::ObjectPat(props) = from.kind(pattern) else {
        // `let props = $props()`: rest_props needs the excluded-names set; not ported yet.
        out.push(copy(from, to, rw, pattern));
        return;
    };
    for &p in props {
        let Kind::Property { key, value, .. } = from.kind(p) else {
            continue;
        };
        let local = match from.kind(value) {
            Kind::AssignPat(l, _) => l,
            _ => value,
        };
        let Some((b, info)) = rw.res.binding(local) else {
            continue;
        };
        if !rw.res.is_prop_source(b) {
            continue;
        }
        let key_name = match from.kind(key) {
            Kind::Ident(_) => from.name(key).to_owned(),
            _ => from.str_value(key, "").to_owned(),
        };
        let s = &rw.res.sem.bindings[b];
        let mut flags = 1 | 2; // PROPS_IS_IMMUTABLE | PROPS_IS_RUNES
        if info.kind == BindKind::BindableProp {
            flags |= 8;
        }
        if s.writes > 0 || s.mutations > 0 {
            flags |= 4; // PROPS_IS_UPDATED
        }
        let mut args = vec![to.id("$$props"), to.str(&key_name)];
        let initial = info.initial.map(|i| copy(from, to, rw, i));
        let arg = initial.map(|init| {
            if is_simple_expression(to, init) {
                init
            } else {
                flags |= 16; // PROPS_IS_LAZY_INITIAL
                match to.kind(init) {
                    Kind::Call { callee, args, .. }
                        if args.is_empty() && matches!(to.kind(callee), Kind::Ident(_)) =>
                    {
                        callee
                    }
                    _ => to.arrow(&[], init, true, false, rsv_kernel::source::Loc::SYNTHETIC),
                }
            }
        });
        args.push(to.num(f64::from(flags), rsv_kernel::source::Loc::SYNTHETIC));
        if let Some(a) = arg {
            args.push(a);
        }
        let call = to.runtime("$", "prop", &args);
        let target = to.ident(from.name(local), from.loc(local));
        out.push(to.declarator(target, Some(call), from.loc(p)));
    }
}

/// Upstream `is_simple_expression`.
fn is_simple_expression(ast: &Ast, e: NodeId) -> bool {
    match ast.kind(e) {
        Kind::Str
        | Kind::Num(_)
        | Kind::Bool(_)
        | Kind::Null
        | Kind::Ident(_)
        | Kind::Arrow { .. }
        | Kind::Function { decl: false, .. } => true,
        Kind::Cond { test, cons, alt } => {
            is_simple_expression(ast, test)
                && is_simple_expression(ast, cons)
                && is_simple_expression(ast, alt)
        }
        Kind::Binary(_, l, r) | Kind::Logical(_, l, r) => {
            is_simple_expression(ast, l) && is_simple_expression(ast, r)
        }
        _ => false,
    }
}
