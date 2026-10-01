//! The instance script: Svelte's runes as Vue's reactivity, by copying the script's tree.
//!
//! A `$state` becomes a `ref`, a `$derived` a `computed`; every script reference to one reads
//! `.value`, every reference to a prop reads `$$props.<key>`. What the script does not mean the
//! same in both runtimes is refused in [`plan`], before anything is built.

use rsv_js::ast::flag;
use rsv_js::copy::{Rewrite, Verbatim, copy};
use rsv_js::scope::BindingId;
use rsv_js::{Ast, Kind, NodeId};
use rsv_kernel::source::Loc;
use rsv_svelte::ast::Component;
use rsv_svelte::resolve::{BindKind, Resolution, rune_call};
use rustc_hash::{FxHashMap, FxHashSet};

use crate::helpers::{self, Helper};
use crate::{R, unsupported};

/// What [`plan`] found: the script's runes and the names the template needs.
#[derive(Debug, Default)]
pub struct Plan {
    /// The local name of `onMount`, imported from `svelte`.
    on_mount: Option<NodeId>,
    /// `$props()`'s keys and literal defaults, in order; `None` without a `$props()`.
    props: Option<Vec<(String, Option<NodeId>)>>,
    /// The top-level function declarations, by binding.
    pub functions: FxHashMap<BindingId, NodeId>,
}

/// The names Vue's compiler treats as macros wherever they are called.
const VUE_MACROS: &[&str] = &[
    "defineProps",
    "defineEmits",
    "defineExpose",
    "defineOptions",
    "defineSlots",
    "defineModel",
    "withDefaults",
];

/// The globals the generated code reads; a binding of the same name would shadow them.
const SHADOWED_GLOBALS: &[&str] = &["Array", "Object", "String", "Boolean", "undefined"];

/// The helper names `vue` exports that the compiled module may import as `_<name>`.
const VUE_HELPERS: &[&str] = &[
    "Fragment",
    "openBlock",
    "createElementBlock",
    "createElementVNode",
    "createCommentVNode",
    "createTextVNode",
    "toDisplayString",
    "renderList",
    "unref",
    "withDirectives",
    "vModelText",
    "vModelCheckbox",
    "vModelRadio",
    "vModelSelect",
    "defineComponent",
];

/// `@vue/shared` `GLOBALS_ALLOWED`: a template name outside the list and the component's bindings
/// is read from `_ctx`, which a Svelte global is not; a prop key in it would be read as a prop.
pub const VUE_GLOBALS: &[&str] = &[
    "Infinity",
    "undefined",
    "NaN",
    "isFinite",
    "isNaN",
    "parseFloat",
    "parseInt",
    "decodeURI",
    "decodeURIComponent",
    "encodeURI",
    "encodeURIComponent",
    "Math",
    "Number",
    "Date",
    "Array",
    "Object",
    "Boolean",
    "String",
    "RegExp",
    "Map",
    "Set",
    "JSON",
    "Intl",
    "BigInt",
    "console",
    "Error",
    "Symbol",
];

/// A name the compiled module or the Vue compiler declares itself.
fn is_internal(name: &str) -> bool {
    matches!(
        name,
        "_ctx" | "_cache" | "__props" | "_sfc_main" | "_sfc_render" | "_export_sfc"
    ) || name
        .strip_prefix("_hoisted_")
        .is_some_and(|n| !n.is_empty() && n.bytes().all(|b| b.is_ascii_digit()))
        || name
            .strip_prefix('_')
            .is_some_and(|n| VUE_HELPERS.contains(&n))
}

/// Checks the script and records what the translation needs from it.
///
/// # Errors
///
/// A `vuelte_unsupported` diagnostic for a construct outside the mapping.
pub fn plan(c: &Component, res: &Resolution, src: &str) -> R<Plan> {
    let mut plan = Plan::default();
    let js = &c.js;
    check_names(js, res)?;
    let Some(script) = &c.instance else {
        return Ok(plan);
    };
    if script.ts {
        return Err(unsupported("a TypeScript instance script", script.span));
    }
    let Kind::Program(body) = js.kind(c.program) else {
        unreachable!("a script parses to a program")
    };
    let mut consumed = FxHashSet::default();
    let mut mount_calls = FxHashSet::default();
    for &s in body {
        match js.kind(s) {
            Kind::Import { .. } => match on_mount_import(js, src, s) {
                Some(local) if plan.on_mount.is_none() => plan.on_mount = Some(local),
                _ => {
                    return Err(unsupported(
                        "an import other than one `onMount` from 'svelte'",
                        span(js, s),
                    ));
                }
            },
            Kind::ExportNamed(_) | Kind::ExportDefault(_) => {
                return Err(unsupported("an export", span(js, s)));
            }
            Kind::VarDecl { decls, .. } => {
                for &d in decls {
                    let Kind::Declarator { id, init: Some(i) } = js.kind(d) else {
                        continue;
                    };
                    let Some((rune, _)) = rune_call(js, i) else {
                        continue;
                    };
                    let Kind::Call { callee, args, .. } = js.kind(i) else {
                        unreachable!("a rune is a call")
                    };
                    let ident = matches!(js.kind(id), Kind::Ident(_));
                    let ok = match rune {
                        "$state" | "$state.raw" => ident && args.len() <= 1,
                        "$derived" | "$derived.by" => ident && args.len() == 1,
                        "$props" if args.is_empty() && plan.props.is_none() => {
                            plan.props = Some(props(js, id)?);
                            true
                        }
                        _ => false,
                    };
                    if !ok {
                        return Err(unsupported(
                            format_args!("this use of `{rune}`"),
                            span(js, i),
                        ));
                    }
                    consumed.insert(match js.kind(callee) {
                        Kind::Member { object, .. } => object,
                        _ => callee,
                    });
                }
            }
            Kind::Function {
                name: Some(n),
                decl: true,
                ..
            } => {
                if let Some(b) = res.sem.binding_of(n) {
                    plan.functions.insert(b, s);
                }
            }
            Kind::ExprStmt(e) => {
                if let Some(local) = plan.on_mount
                    && let Kind::Call { callee, args, .. } = js.kind(e)
                    && matches!(js.kind(callee), Kind::Ident(_))
                    && res.sem.binding_of(callee) == res.sem.binding_of(local)
                {
                    check_on_mount(js, args, span(js, e))?;
                    mount_calls.insert(callee);
                }
            }
            _ => {}
        }
    }
    check_references(js, res, c.program, plan.on_mount, &consumed, &mount_calls)?;
    check_writes(js, res)?;
    Ok(plan)
}

/// The local name of `import { onMount } from 'svelte'`.
fn on_mount_import(js: &Ast, src: &str, import: NodeId) -> Option<NodeId> {
    let Kind::Import {
        specifiers: [sp],
        source,
        type_only: false,
    } = js.kind(import)
    else {
        return None;
    };
    match js.kind(*sp) {
        Kind::ImportNamed { imported, local }
            if js.name(imported) == "onMount" && js.str_value(source, src) == "svelte" =>
        {
            Some(local)
        }
        _ => None,
    }
}

/// Names the translation or the Vue compiler would collide with.
fn check_names(js: &Ast, res: &Resolution) -> R<()> {
    for b in &res.sem.bindings {
        let name = js.name(b.node);
        if name.starts_with('$') {
            return Err(unsupported(
                format_args!("the `$`-prefixed name `{name}`"),
                span(js, b.node),
            ));
        }
        if SHADOWED_GLOBALS.contains(&name) || is_internal(name) || VUE_MACROS.contains(&name) {
            return Err(unsupported(
                format_args!("a binding named `{name}`"),
                span(js, b.node),
            ));
        }
    }
    Ok(())
}

/// Runes, store subscriptions and `onMount` outside the uses [`plan`] consumed.
fn check_references(
    js: &Ast,
    res: &Resolution,
    program: NodeId,
    on_mount: Option<NodeId>,
    consumed: &FxHashSet<NodeId>,
    mount_calls: &FxHashSet<NodeId>,
) -> R<()> {
    let on_mount_binding = on_mount.and_then(|l| res.sem.binding_of(l));
    walk(js, program, &mut |n| match js.kind(n) {
        Kind::Ident(_) => {
            let name = js.name(n);
            let binding = res.sem.binding_of(n);
            if VUE_MACROS.contains(&name) {
                return Err(unsupported(format_args!("the name `{name}`"), span(js, n)));
            }
            if name.starts_with('$') && binding.is_none() && !consumed.contains(&n) {
                return Err(unsupported(
                    format_args!("the rune or store subscription `{name}`"),
                    span(js, n),
                ));
            }
            if binding.is_some()
                && binding == on_mount_binding
                && Some(n) != on_mount
                && !mount_calls.contains(&n)
            {
                return Err(unsupported(
                    "`onMount` other than as a top-level call",
                    span(js, n),
                ));
            }
            Ok(())
        }
        Kind::New { .. } => Err(unsupported(
            "a `new` expression (Svelte proxies only plain objects and arrays, Vue more)",
            span(js, n),
        )),
        _ => Ok(()),
    })
}

/// Writes Vue would not see the way Svelte does.
fn check_writes(js: &Ast, res: &Resolution) -> R<()> {
    for (b, info) in res.bindings.iter_enumerated() {
        let s = &res.sem.bindings[b];
        let refused = match info.kind {
            BindKind::Prop => {
                (s.writes > 0 || s.mutations > 0).then_some("writing or mutating a prop")
            }
            BindKind::Derived | BindKind::DerivedBy => {
                (s.writes > 0).then_some("assigning a `$derived`")
            }
            BindKind::BindableProp | BindKind::RestProp => Some("this prop declaration"),
            _ => None,
        };
        if let Some(what) = refused {
            return Err(unsupported(what, span(js, s.node)));
        }
    }
    Ok(())
}

/// Visits every node that is an expression or a binding, not property names.
///
/// # Errors
///
/// The first error `f` returns.
pub fn walk(js: &Ast, root: NodeId, f: &mut impl FnMut(NodeId) -> R<()>) -> R<()> {
    let mut stack = vec![root];
    while let Some(n) = stack.pop() {
        f(n)?;
        match js.kind(n) {
            Kind::Member {
                object,
                property,
                computed,
                ..
            } => {
                stack.push(object);
                if computed {
                    stack.push(property);
                }
            }
            Kind::Property {
                key,
                value,
                computed,
                ..
            } => {
                if computed {
                    stack.push(key);
                }
                stack.push(value);
            }
            Kind::ImportNamed { local, .. } => stack.push(local),
            _ => js.for_each_child(n, |k| stack.push(k)),
        }
    }
    Ok(())
}

fn span(js: &Ast, n: NodeId) -> rsv_kernel::source::Span {
    js.loc(n).span().unwrap_or_default()
}

/// `let { a, b = 1, c: d } = $props()`: plain keys with literal defaults.
fn props(js: &Ast, pattern: NodeId) -> R<Vec<(String, Option<NodeId>)>> {
    let refuse = |n: NodeId| {
        Err(unsupported(
            "a `$props()` pattern other than plain keys with literal defaults",
            span(js, n),
        ))
    };
    let Kind::ObjectPat(list) = js.kind(pattern) else {
        return refuse(pattern);
    };
    let mut out = Vec::with_capacity(list.len());
    for &p in list {
        let Kind::Property {
            key,
            value,
            computed: false,
            method: false,
            ..
        } = js.kind(p)
        else {
            return refuse(p);
        };
        if !matches!(js.kind(key), Kind::Ident(_)) {
            return refuse(p);
        }
        let default = match js.kind(value) {
            Kind::Ident(_) => None,
            Kind::AssignPat(target, d)
                if matches!(js.kind(target), Kind::Ident(_)) && is_literal(js, d) =>
            {
                Some(d)
            }
            _ => return refuse(p),
        };
        let name = js.name(key);
        let reserved = matches!(name, "key" | "ref" | "ref_for" | "ref_key")
            || name.starts_with("onVnode")
            || VUE_GLOBALS.contains(&name)
            || name.bytes().any(|b| b.is_ascii_uppercase());
        if reserved {
            return Err(unsupported(
                format_args!(
                    "the prop name `{name}` (Vue reserves it, reads it as a global, or \
                     normalises its case)"
                ),
                span(js, key),
            ));
        }
        out.push((name.to_owned(), default));
    }
    Ok(out)
}

fn is_literal(js: &Ast, e: NodeId) -> bool {
    match js.kind(e) {
        Kind::Str | Kind::Num(_) | Kind::Bool(_) | Kind::Null => true,
        Kind::Unary(rsv_js::ops::UnaryOp::Neg, n) => matches!(js.kind(n), Kind::Num(_)),
        Kind::Template { exprs, .. } => exprs.is_empty(),
        _ => false,
    }
}

/// `onMount(() => { … })`: a callback that returns nothing, which Svelte would call on destroy.
fn check_on_mount(js: &Ast, args: &[NodeId], at: rsv_kernel::source::Span) -> R<()> {
    let refused = || {
        Err(unsupported(
            "an `onMount` callback that may return a value (Svelte calls a returned function on \
             destroy, Vue ignores it)",
            at,
        ))
    };
    let [f] = args else { return refused() };
    let (Kind::Arrow {
        body,
        expr_body: false,
        ..
    }
    | Kind::Function {
        body, decl: false, ..
    }) = js.kind(*f)
    else {
        return refused();
    };
    let mut stack = vec![body];
    while let Some(n) = stack.pop() {
        match js.kind(n) {
            Kind::Return(Some(_)) => return refused(),
            Kind::Function { .. } | Kind::Arrow { .. } => {}
            _ => js.for_each_child(n, |k| stack.push(k)),
        }
    }
    Ok(())
}

/// The `<script setup>` program: Vue imports, the options and props macros, the helpers, then
/// the script's statements.
pub fn emit(
    c: &Component,
    res: &Resolution,
    plan: &Plan,
    helpers: &[Helper],
    to: &mut Ast,
) -> NodeId {
    let js = &c.js;
    let stmts: &[NodeId] = match js.kind(c.program) {
        Kind::Program(body) => body,
        _ => unreachable!("a script parses to a program"),
    };
    let mut runes = (false, false, false);
    for &s in stmts {
        if let Kind::VarDecl { decls, .. } = js.kind(s) {
            for &d in decls {
                if let Kind::Declarator { init: Some(i), .. } = js.kind(d) {
                    match rune_call(js, i).map(|(r, _)| r) {
                        Some("$state") => runes.0 = true,
                        Some("$state.raw") => runes.1 = true,
                        Some("$derived" | "$derived.by") => runes.2 = true,
                        _ => {}
                    }
                }
            }
        }
    }
    let mut body = Vec::new();
    let mut specs = Vec::new();
    for (used, imported, local) in [
        (runes.0, "ref", "$$ref"),
        (runes.1, "shallowRef", "$$shallowRef"),
        (runes.2, "computed", "$$computed"),
    ] {
        if used {
            let i = to.id(imported);
            let l = to.id(local);
            specs.push(to.import_named(i, l, false, Loc::SYNTHETIC));
        }
    }
    if let Some(local) = plan.on_mount {
        let i = to.id("onMounted");
        let l = to.ident(js.name(local), js.loc(local));
        specs.push(to.import_named(i, l, false, Loc::SYNTHETIC));
    }
    if !specs.is_empty() {
        let source = to.str("vue");
        body.push(to.import(&specs, source, false, Loc::SYNTHETIC));
    }
    let key = to.id("inheritAttrs");
    let value = to.bool(false, Loc::SYNTHETIC);
    let option = to.property(key, value, 0, Loc::SYNTHETIC);
    let options = to.object(&[option], Loc::SYNTHETIC);
    let callee = to.id("defineOptions");
    let call = to.call0(callee, &[options]);
    body.push(to.expr_stmt(call));
    if let Some(props) = &plan.props {
        let entries: Vec<NodeId> = props
            .iter()
            .map(|(name, default)| {
                let fields: Vec<NodeId> = default
                    .iter()
                    .map(|&d| {
                        let k = to.id("default");
                        let v = copy(js, to, &mut Verbatim, d);
                        to.property(k, v, 0, Loc::SYNTHETIC)
                    })
                    .collect();
                let k = to.id(name);
                let v = to.object(&fields, Loc::SYNTHETIC);
                to.property(k, v, 0, Loc::SYNTHETIC)
            })
            .collect();
        let decl = to.object(&entries, Loc::SYNTHETIC);
        let callee = to.id("defineProps");
        let call = to.call0(callee, &[decl]);
        let name = to.id("$$props");
        body.push(to.let_(flag::CONST, name, Some(call)));
    }
    body.extend(helpers::declarations(helpers, to));
    let mut rw = ScriptRewrite { res };
    for &s in stmts {
        match js.kind(s) {
            Kind::Import { .. } => {}
            Kind::VarDecl { kind, decls } => {
                for &d in decls {
                    if let Some(stmt) = declarator(js, kind, d, &mut rw, to) {
                        body.push(stmt);
                    }
                }
            }
            _ => body.push(copy(js, to, &mut rw, s)),
        }
    }
    to.program(&body, Loc::SYNTHETIC)
}

/// One declarator as its own statement: a rune as Vue's reactivity, `$props()` as nothing (its
/// keys are in `defineProps`), anything else copied.
fn declarator(
    js: &Ast,
    kind: u8,
    d: NodeId,
    rw: &mut ScriptRewrite<'_>,
    to: &mut Ast,
) -> Option<NodeId> {
    let Kind::Declarator { id, init } = js.kind(d) else {
        unreachable!("a declarator")
    };
    let rune = init.and_then(|i| rune_call(js, i));
    let Some((rune, arg)) = rune else {
        let target = copy(js, to, rw, id);
        let value = init.map(|i| copy(js, to, rw, i));
        let decl = to.declarator(target, value, js.loc(d));
        return Some(to.var_decl(kind, &[decl], js.loc(d)));
    };
    let value = match rune {
        "$props" => return None,
        "$state" | "$state.raw" => {
            let local = if rune == "$state" {
                "$$ref"
            } else {
                "$$shallowRef"
            };
            let callee = to.id(local);
            let args: Vec<NodeId> = arg.iter().map(|&a| copy(js, to, rw, a)).collect();
            to.call0(callee, &args)
        }
        "$derived" => {
            let a = copy(js, to, rw, arg?);
            let f = to.arrow(&[], a, true, false, Loc::SYNTHETIC);
            let callee = to.id("$$computed");
            to.call0(callee, &[f])
        }
        "$derived.by" => {
            let a = copy(js, to, rw, arg?);
            let callee = to.id("$$computed");
            to.call0(callee, &[a])
        }
        _ => unreachable!("checked by plan"),
    };
    let name = to.ident(js.name(id), js.loc(id));
    Some(to.let_(flag::CONST, name, Some(value)))
}

/// Script references: `x.value` for `$state` and `$derived`, `$$props.<key>` for props.
struct ScriptRewrite<'a> {
    res: &'a Resolution,
}

impl ScriptRewrite<'_> {
    fn reference(&self, from: &Ast, to: &mut Ast, id: NodeId) -> Option<NodeId> {
        let (b, info) = self.res.binding(id)?;
        if self.res.sem.bindings[b].node == id {
            return None;
        }
        match info.kind {
            BindKind::State | BindKind::RawState | BindKind::Derived | BindKind::DerivedBy => {
                let x = to.ident(from.name(id), from.loc(id));
                Some(to.dot(x, "value"))
            }
            BindKind::Prop => prop_member(self.res, from, to, id),
            _ => None,
        }
    }
}

impl Rewrite for ScriptRewrite<'_> {
    fn rewrite(&mut self, from: &Ast, to: &mut Ast, id: NodeId) -> Option<NodeId> {
        match from.kind(id) {
            Kind::Ident(_) => self.reference(from, to, id),
            Kind::Property {
                key,
                value,
                shorthand: true,
                computed: false,
                ..
            } => {
                let (target, default) = match from.kind(value) {
                    Kind::AssignPat(t, d) => (t, Some(d)),
                    _ => (value, None),
                };
                if !matches!(from.kind(target), Kind::Ident(_)) {
                    return None;
                }
                let v = self.reference(from, to, target)?;
                let v = default.map_or(v, |d| {
                    let d = copy(from, to, self, d);
                    to.assign_pat(v, d, from.loc(value))
                });
                let k = to.ident(from.name(key), from.loc(key));
                Some(to.property(k, v, 0, from.loc(id)))
            }
            _ => None,
        }
    }
}

/// `$$props.<key>` for a reference to a prop; `None` for anything else.
pub fn prop_member(res: &Resolution, from: &Ast, to: &mut Ast, id: NodeId) -> Option<NodeId> {
    let (b, info) = res.binding(id)?;
    if info.kind != BindKind::Prop || res.sem.bindings[b].node == id {
        return None;
    }
    let key = from.name(info.prop_key?);
    let object = to.id("$$props");
    let property = to.ident(key, Loc::SYNTHETIC);
    Some(to.member(object, property, false, false, from.loc(id)))
}
