//! Name resolution, the first layer above the surface tree.
//!
//! Every identifier of the script and the
//! template is resolved to a binding, and every binding classified by the rune that declares it.
//! Everything here is a side table over [`BindingId`]s and the tree's own [`NodeId`]s; the tree is
//! not touched. Compilation, lint rules and the HIR all read this one resolution.

use rsv_js::scope::{self, BindingId, DeclKind, HostRoot, HostScope, Semantic};
use rsv_js::{Ast, Kind, NodeId};
use rsv_kernel::idx::IndexVec;

use crate::hir::{AttrValue, Children, Hir, NodeKind, Part};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum BindKind {
    Normal,
    State,
    RawState,
    Derived,
    DerivedBy,
    Prop,
    BindableProp,
    RestProp,
    /// Declared by an `{#each}` context.
    Each,
    /// The index of an unkeyed `{#each}` (upstream `static`): it never changes for an item.
    StaticIndex,
    /// The index of a keyed `{#each}` (upstream `template`).
    KeyedIndex,
}

#[derive(Clone, Copy, Debug)]
pub struct BindInfo {
    pub kind: BindKind,
    /// A function declaration or a variable initialised with a function.
    pub is_function: bool,
    /// For props: the default value; for state/derived: the rune's argument.
    pub initial: Option<NodeId>,
    /// For props: the key in `$$props` (the property name, not the local name).
    pub prop_key: Option<NodeId>,
}

#[derive(Debug)]
pub struct Resolution {
    pub sem: Semantic,
    pub bindings: IndexVec<BindingId, BindInfo>,
    /// The instance calls `$props()` (upstream `needs_props`).
    pub uses_props: bool,
}

/// Resolves the script and the template of `hir`, which any frontend may have built over `ast`.
#[must_use]
pub fn resolve(ast: &Ast, program: NodeId, hir: &Hir) -> Resolution {
    let mut host = Vec::new();
    template_roots(hir, hir.root, &mut host);
    let sem = scope::analyze(ast, program, &host);
    let mut bindings = classify(ast, &sem, program);
    classify_each(ast, &sem, hir, &mut bindings);
    Resolution {
        uses_props: has_props_rune(ast, program),
        sem,
        bindings,
    }
}

/// The template's expressions in document order, with the scope each `{#each}` opens (upstream
/// `create_scopes`' `EachBlock`: the collection outside it, the key and the body inside it).
fn template_roots(hir: &Hir, list: Children, out: &mut Vec<HostRoot>) {
    for &id in hir.children(list) {
        match &hir.node(id).kind {
            NodeKind::Text { .. } | NodeKind::Comment { .. } => {}
            NodeKind::Expr { expr } => out.push(HostRoot::Expr(*expr)),
            NodeKind::Element(el) => {
                for a in hir.attrs(el.attrs) {
                    match &a.value {
                        AttrValue::Boolean | AttrValue::Static(_) => {}
                        &(AttrValue::Expression { expr, .. } | AttrValue::Shorthand(expr)) => {
                            out.push(HostRoot::Expr(expr));
                        }
                        AttrValue::Interpolated(parts) => {
                            out.extend(parts.iter().filter_map(|p| match *p {
                                Part::Expr { expr, .. } => Some(HostRoot::Expr(expr)),
                                Part::Text(_) => None,
                            }));
                        }
                        &AttrValue::Bind(expr) => out.push(HostRoot::Bound(expr)),
                    }
                }
                template_roots(hir, el.children, out);
            }
            NodeKind::If {
                branches,
                otherwise,
            } => {
                for b in hir.branches(*branches) {
                    out.push(HostRoot::Expr(b.test));
                    template_roots(hir, b.body, out);
                }
                if let Some(o) = otherwise {
                    template_roots(hir, *o, out);
                }
            }
            NodeKind::Each(each) => {
                out.push(HostRoot::Expr(each.collection));
                let params: Vec<NodeId> = each.context().into_iter().chain(each.index()).collect();
                let mut body = Vec::new();
                body.extend(each.key().map(HostRoot::Expr));
                template_roots(hir, each.body, &mut body);
                match params.first() {
                    Some(&node) => out.push(HostRoot::Scope(HostScope { node, params, body })),
                    None => out.extend(body),
                }
                if let Some(f) = each.fallback {
                    template_roots(hir, f, out);
                }
            }
        }
    }
}

/// Upstream declares an each block's names `each`, and its index `static` or `template`.
fn classify_each(ast: &Ast, sem: &Semantic, hir: &Hir, out: &mut IndexVec<BindingId, BindInfo>) {
    for n in &hir.nodes {
        let NodeKind::Each(each) = &n.kind else {
            continue;
        };
        if let Some(context) = each.context() {
            for_each_pattern_ident(ast, context, &mut |id| {
                if let Some(b) = sem.binding_of(id) {
                    out[b].kind = BindKind::Each;
                    out[b].is_function = false;
                }
            });
        }
        if let Some(b) = each.index().and_then(|i| sem.binding_of(i)) {
            out[b].kind = if each.keyed(ast) {
                BindKind::KeyedIndex
            } else {
                BindKind::StaticIndex
            };
            out[b].is_function = false;
        }
    }
}

/// The identifiers a binding pattern declares.
pub fn for_each_pattern_ident(ast: &Ast, p: NodeId, f: &mut impl FnMut(NodeId)) {
    match ast.kind(p) {
        Kind::Ident(_) => f(p),
        Kind::ObjectPat(props) => {
            for &pr in props {
                match ast.kind(pr) {
                    Kind::Property { value, .. } => for_each_pattern_ident(ast, value, f),
                    Kind::Rest(a) => for_each_pattern_ident(ast, a, f),
                    _ => {}
                }
            }
        }
        Kind::ArrayPat(items) => {
            for &it in items {
                for_each_pattern_ident(ast, it, f);
            }
        }
        Kind::AssignPat(l, _) | Kind::Rest(l) => for_each_pattern_ident(ast, l, f),
        _ => {}
    }
}

impl Resolution {
    #[must_use]
    pub fn binding(&self, ident: NodeId) -> Option<(BindingId, &BindInfo)> {
        let b = self.sem.binding_of(ident)?;
        Some((b, &self.bindings[b]))
    }

    /// Upstream `is_state_source`: in runes mode a `$state` needs a signal only if it is
    /// reassigned.
    #[must_use]
    pub fn is_state_source(&self, b: BindingId) -> bool {
        let info = &self.bindings[b];
        matches!(info.kind, BindKind::State | BindKind::RawState) && self.sem.bindings[b].writes > 0
    }

    /// Upstream `is_prop_source`, runes mode.
    #[must_use]
    pub fn is_prop_source(&self, b: BindingId) -> bool {
        let info = &self.bindings[b];
        let s = &self.sem.bindings[b];
        matches!(info.kind, BindKind::Prop | BindKind::BindableProp)
            && (s.writes > 0 || info.initial.is_some() || s.mutations > 0)
    }

    /// Evaluates `e` of the component's own tree.
    #[must_use]
    pub fn evaluate(&self, ast: &Ast, src: &str, e: NodeId) -> crate::evaluate::Evaluation {
        crate::evaluate::Evaluator::new(ast, src, self).evaluate(crate::evaluate::Tree::Source, e)
    }

    /// Evaluates `e` of a lowered tree, resolving names in `scope`.
    #[must_use]
    pub fn evaluate_output(
        &self,
        source: &Ast,
        src: &str,
        out: &Ast,
        e: NodeId,
        scope: scope::ScopeId,
    ) -> crate::evaluate::Evaluation {
        crate::evaluate::Evaluator::new(source, src, self)
            .evaluate(crate::evaluate::Tree::Output(out, scope), e)
    }
}

fn has_props_rune(ast: &Ast, program: NodeId) -> bool {
    let Kind::Program(body) = ast.kind(program) else {
        unreachable!("a script parses to a program")
    };
    body.iter().any(|&stmt| match ast.kind(stmt) {
        Kind::VarDecl { decls, .. } => decls.iter().any(|&d| {
            let Kind::Declarator { init: Some(i), .. } = ast.kind(d) else {
                return false;
            };
            rune_call(ast, i).is_some_and(|(r, _)| r == "$props")
        }),
        _ => false,
    })
}

fn classify(ast: &Ast, sem: &Semantic, program: NodeId) -> IndexVec<BindingId, BindInfo> {
    let mut out: IndexVec<BindingId, BindInfo> = sem
        .bindings
        .iter()
        .map(|b| BindInfo {
            kind: BindKind::Normal,
            // Upstream `Binding.is_function`: never updated, and initialised with a function.
            is_function: b.writes == 0
                && b.mutations == 0
                && (b.kind == DeclKind::Function
                    || b.init(ast).is_some_and(|i| {
                        matches!(ast.kind(i), Kind::Function { .. } | Kind::Arrow { .. })
                    })),
            initial: None,
            prop_key: None,
        })
        .collect();
    let Kind::Program(body) = ast.kind(program) else {
        unreachable!("a script parses to a program")
    };
    for &stmt in body {
        let Kind::VarDecl { decls, .. } = ast.kind(stmt) else {
            continue;
        };
        for &d in decls {
            let Kind::Declarator {
                id,
                init: Some(init),
            } = ast.kind(d)
            else {
                continue;
            };
            let Some((rune, arg)) = rune_call(ast, init) else {
                continue;
            };
            match rune {
                "$state" | "$state.raw" | "$derived" | "$derived.by" => {
                    let kind = match rune {
                        "$state" => BindKind::State,
                        "$state.raw" => BindKind::RawState,
                        "$derived" => BindKind::Derived,
                        _ => BindKind::DerivedBy,
                    };
                    if let Some(b) = sem.binding_of(id) {
                        out[b].kind = kind;
                        out[b].initial = arg;
                        out[b].is_function = false;
                    }
                }
                "$props" => classify_props(ast, sem, id, &mut out),
                _ => {}
            }
        }
    }
    out
}

fn classify_props(
    ast: &Ast,
    sem: &Semantic,
    pattern: NodeId,
    out: &mut IndexVec<BindingId, BindInfo>,
) {
    match ast.kind(pattern) {
        Kind::Ident(_) => {
            if let Some(b) = sem.binding_of(pattern) {
                out[b].kind = BindKind::RestProp;
            }
        }
        Kind::ObjectPat(props) => {
            for &p in props {
                match ast.kind(p) {
                    Kind::Property { key, value, .. } => {
                        let (local, default) = match ast.kind(value) {
                            Kind::AssignPat(l, r) => (l, Some(r)),
                            _ => (value, None),
                        };
                        let bindable = default
                            .and_then(|d| rune_call(ast, d))
                            .is_some_and(|(r, _)| r == "$bindable");
                        if let Some(b) = sem.binding_of(local) {
                            let info = &mut out[b];
                            info.kind = if bindable {
                                BindKind::BindableProp
                            } else {
                                BindKind::Prop
                            };
                            info.initial = if bindable {
                                default.and_then(|d| rune_call(ast, d)).and_then(|(_, a)| a)
                            } else {
                                default
                            };
                            info.prop_key = Some(key);
                            info.is_function = false;
                        }
                    }
                    Kind::Rest(arg) => {
                        if let Some(b) = sem.binding_of(arg) {
                            out[b].kind = BindKind::RestProp;
                        }
                    }
                    _ => {}
                }
            }
        }
        _ => {}
    }
}

/// `$name(arg)` or `$name.member(arg)` → (`"$name.member"`, first argument).
#[must_use]
pub fn rune_call(ast: &Ast, e: NodeId) -> Option<(&'static str, Option<NodeId>)> {
    const RUNES: &[&str] = &[
        "$state",
        "$state.raw",
        "$derived",
        "$derived.by",
        "$props",
        "$bindable",
        "$effect",
        "$effect.pre",
    ];
    let Kind::Call { callee, args, .. } = ast.kind(e) else {
        return None;
    };
    let name = match ast.kind(callee) {
        Kind::Ident(_) => ast.name(callee).to_owned(),
        Kind::Member {
            object,
            property,
            computed: false,
            ..
        } if matches!(ast.kind(object), Kind::Ident(_)) => {
            format!("{}.{}", ast.name(object), ast.name(property))
        }
        _ => return None,
    };
    let rune = RUNES.iter().find(|r| **r == name)?;
    Some((rune, args.first().copied()))
}
