//! Rune lowering for both targets: one [`Rewrite`] whose only parameter is the [`Target`].

use rsv_js::ast::flag;
use rsv_js::copy::{Rewrite, copy, copy_node};
use rsv_js::ops::{AssignOp, BinOp, LogicalOp, UpdateOp};
use rsv_js::scope::BindingId;
use rsv_js::{Ast, Kind, NodeId};
use rsv_kernel::diag::Diagnostic;
use rustc_hash::FxHashMap;

use super::Target;
use super::names::Names;
use crate::resolve::{BindKind, Resolution, rune_call};

#[derive(Debug)]
pub struct ScriptRewrite<'a> {
    pub target: Target,
    pub res: &'a Resolution,
    /// The document the source tree's spans index.
    pub src: &'a str,
    /// The `{#each}` names in scope on the client, and whether a read goes through `$.get`
    /// (upstream's per-block `transform`).
    pub each: Option<&'a FxHashMap<BindingId, bool>>,
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
            (Target::Client, BindKind::Each | BindKind::StaticIndex | BindKind::KeyedIndex) => {
                let Some(&through_get) = self.each.and_then(|m| m.get(&b)) else {
                    unreachable!("an `{{#each}}` name is read only inside its block")
                };
                if !through_get {
                    return None;
                }
                let x = to.ident(name, loc);
                Some(to.runtime("$", "get", &[x]))
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
            Kind::Block(body)
                if self.target == Target::Server && body.iter().any(|&s| is_effect(from, s)) =>
            {
                let kept: Vec<NodeId> = body
                    .iter()
                    .filter(|&&s| !is_effect(from, s))
                    .map(|&s| copy(from, to, self, s))
                    .collect();
                Some(to.block(&kept, from.loc(id)))
            }
            Kind::Call { args, .. } if self.target == Target::Client => {
                let name = match rune_call(from, id)?.0 {
                    "$effect" => "user_effect",
                    "$effect.pre" => "user_pre_effect",
                    _ => return None,
                };
                let args: Vec<NodeId> = args.iter().map(|&a| copy(from, to, self, a)).collect();
                Some(to.runtime("$", name, &args))
            }
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

/// Upstream server `ExpressionStatement`: an effect statement renders nothing.
fn is_effect(from: &Ast, stmt: NodeId) -> bool {
    matches!(from.kind(stmt), Kind::ExprStmt(e)
        if rune_call(from, e).is_some_and(|(r, _)| matches!(r, "$effect" | "$effect.pre")))
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
    proxyable(ast, Some(res), e)
}

/// `res` is `None` for a binding's initial value, which upstream checks without a scope.
fn proxyable(ast: &Ast, res: Option<&Resolution>, e: NodeId) -> bool {
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
                BindKind::Prop | BindKind::BindableProp | BindKind::RestProp => info.initial,
                _ => s.init(ast),
            };
            initial.is_none_or(|init| proxyable(ast, None, init))
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
    from: &Ast,
    to: &mut Ast,
    rw: &mut ScriptRewrite<'_>,
    program: NodeId,
    hoisted: &mut Vec<NodeId>,
    names: &mut Names,
) -> Result<Vec<NodeId>, Diagnostic> {
    let Kind::Program(body) = from.kind(program) else {
        unreachable!("scripts parse to programs")
    };
    let mut out = Vec::with_capacity(body.len());
    for &stmt in body {
        match from.kind(stmt) {
            Kind::TsDecl => {}
            _ if rw.target == Target::Server && is_effect(from, stmt) => {}
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
                for &d in decls {
                    check_destructured_rune(from, rw.target, d)?;
                }
                let mut lowered = Vec::with_capacity(decls.len());
                for &d in decls {
                    lower_declarator(from, to, rw, d, &mut lowered, hoisted, names);
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

/// Upstream splits a destructured `$derived` (both targets) and a destructured `$state` (client)
/// into one declaration per path; this port has no `extract_paths` yet.
fn check_destructured_rune(from: &Ast, target: Target, d: NodeId) -> Result<(), Diagnostic> {
    let Kind::Declarator {
        id,
        init: Some(init),
    } = from.kind(d)
    else {
        return Ok(());
    };
    if matches!(from.kind(id), Kind::Ident(_)) {
        return Ok(());
    }
    let Some((rune, _)) = rune_call(from, init) else {
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
            from.loc(d)
                .span()
                .expect("a parsed declarator has a source range"),
        ));
    }
    Ok(())
}

fn lower_declarator(
    from: &Ast,
    to: &mut Ast,
    rw: &mut ScriptRewrite<'_>,
    d: NodeId,
    out: &mut Vec<NodeId>,
    hoisted: &mut Vec<NodeId>,
    names: &mut Names,
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
            let target = server_props_pattern(from, to, rw, id);
            let props = to.id("$$props");
            out.push(to.declarator(target, Some(props), loc));
        }
        (Target::Client, "$props") => lower_client_props(from, to, rw, id, out, hoisted, names),
        _ => out.push(copy(from, to, rw, d)),
    }
}

/// Upstream server `VariableDeclaration`, `$props` branch: a rest pattern or a bare identifier
/// must not collect `$$slots` and `$$events`. `$$slots` references are refused earlier, so
/// the deconflicted `$$slots_` name never applies.
fn server_props_pattern(
    from: &Ast,
    to: &mut Ast,
    rw: &mut ScriptRewrite<'_>,
    id: NodeId,
) -> NodeId {
    let rw = &mut UnwrapBindable(rw);
    let hidden = |to: &mut Ast| {
        ["$$slots", "$$events"].map(|name| {
            let value = to.id(name);
            super::client::init_property(to, name, value)
        })
    };
    match from.kind(id) {
        Kind::ObjectPat(props)
            if props
                .last()
                .is_some_and(|&p| matches!(from.kind(p), Kind::Rest(_))) =>
        {
            let mut copied: Vec<NodeId> = props.iter().map(|&p| copy(from, to, rw, p)).collect();
            let rest = copied.pop().expect("the pattern ends with a rest element");
            copied.extend(hidden(to));
            copied.push(rest);
            to.object_pat(&copied, from.loc(id))
        }
        Kind::Ident(_) => {
            let mut props = hidden(to).to_vec();
            let name = copy(from, to, rw, id);
            props.push(to.rest(name, rsv_kernel::source::Loc::SYNTHETIC));
            to.object_pat(&props, rsv_kernel::source::Loc::SYNTHETIC)
        }
        _ => copy(from, to, rw, id),
    }
}

/// Upstream server `$props` declaration: `x = $bindable(d)` becomes `x = d`.
struct UnwrapBindable<'r, 'a>(&'r mut ScriptRewrite<'a>);

impl Rewrite for UnwrapBindable<'_, '_> {
    fn rewrite(&mut self, from: &Ast, to: &mut Ast, id: NodeId) -> Option<NodeId> {
        if let Kind::AssignPat(left, right) = from.kind(id)
            && let Some(("$bindable", arg)) = rune_call(from, right)
        {
            let left = copy(from, to, self, left);
            let right = if let Some(a) = arg {
                copy(from, to, self, a)
            } else {
                let zero = to.num(0.0, rsv_kernel::source::Loc::SYNTHETIC);
                to.unary(
                    rsv_js::ops::UnaryOp::Void,
                    zero,
                    rsv_kernel::source::Loc::SYNTHETIC,
                )
            };
            return Some(to.assign_pat(left, right, from.loc(id)));
        }
        self.0.rewrite(from, to, id)
    }
}

/// Upstream client `VariableDeclaration`, `$props` branch: only props that need a source get a
/// declaration (`$.prop(…)`); the rest are read as `$$props.x`, and a rest pattern is
/// `$.rest_props` without the names declared before it.
fn lower_client_props(
    from: &Ast,
    to: &mut Ast,
    rw: &mut ScriptRewrite<'_>,
    pattern: NodeId,
    out: &mut Vec<NodeId>,
    hoisted: &mut Vec<NodeId>,
    names: &mut Names,
) {
    let mut seen: Vec<String> = ["$$slots", "$$events", "$$legacy"]
        .map(str::to_owned)
        .to_vec();
    let mut rest_props = |target: NodeId, seen: &[String], to: &mut Ast| {
        let exclude = names.unique("rest_excludes");
        let items: Vec<NodeId> = seen.iter().map(|n| to.str(n)).collect();
        let array = to.array(&items, rsv_kernel::source::Loc::SYNTHETIC);
        let set = to.id("Set");
        let new = to.new_(set, &[array], rsv_kernel::source::Loc::SYNTHETIC);
        let id = to.id(&exclude);
        hoisted.push(to.let_(flag::VAR, id, Some(new)));
        let props = to.id("$$props");
        let exclude = to.id(&exclude);
        let call = to.runtime("$", "rest_props", &[props, exclude]);
        let target = to.ident(from.name(target), from.loc(target));
        to.declarator(target, Some(call), rsv_kernel::source::Loc::SYNTHETIC)
    };
    let Kind::ObjectPat(props) = from.kind(pattern) else {
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
            Kind::Ident(_) => from.name(key).to_owned(),
            _ => from.str_value(key, rw.src).to_owned(),
        };
        seen.push(key_name.clone());
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
        let s = &rw.res.sem.bindings[b];
        let mut flags = 1 | 2; // PROPS_IS_IMMUTABLE | PROPS_IS_RUNES
        if info.kind == BindKind::BindableProp {
            flags |= 8;
        }
        if s.writes > 0 || s.mutations > 0 {
            flags |= 4; // PROPS_IS_UPDATED
        }
        let mut args = vec![to.id("$$props"), to.str(&key_name)];
        let initial = info.initial.map(|i| {
            let init = copy(from, to, rw, i);
            if info.kind == BindKind::BindableProp && should_proxy(from, rw.res, i) {
                to.runtime("$", "proxy", &[init])
            } else {
                init
            }
        });
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
