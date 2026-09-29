//! Name resolution, the first layer above the surface tree: every identifier of the script and the
//! template resolved to a binding, and every binding classified by the rune that declares it.
//! Everything here is a side table over [`BindingId`]s and the tree's own [`NodeId`]s; the tree is
//! not touched. Compilation, lint rules and the HIR all read this one resolution.

use rsv_js::scope::{self, BindingId, DeclKind, Semantic};
use rsv_js::{Ast, Kind, NodeId};
use rsv_kernel::idx::IndexVec;

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

pub struct Resolution {
    pub sem: Semantic,
    pub bindings: IndexVec<BindingId, BindInfo>,
    /// The instance calls `$props()` (upstream `needs_props`).
    pub uses_props: bool,
}

pub fn resolve(ast: &Ast, program: NodeId, template_exprs: &[NodeId]) -> Resolution {
    let sem = scope::analyze(ast, program, template_exprs);
    let bindings = classify(ast, &sem, program);
    Resolution {
        uses_props: has_props_rune(ast, program),
        sem,
        bindings,
    }
}

impl Resolution {
    pub fn binding(&self, ident: NodeId) -> Option<(BindingId, &BindInfo)> {
        let b = self.sem.binding_of(ident)?;
        Some((b, &self.bindings[b]))
    }

    /// Upstream `is_state_source`: in runes mode a `$state` needs a signal only if it is reassigned.
    pub fn is_state_source(&self, b: BindingId) -> bool {
        let info = &self.bindings[b];
        matches!(info.kind, BindKind::State | BindKind::RawState) && self.sem.bindings[b].writes > 0
    }

    /// Upstream `is_prop_source`, runes mode.
    pub fn is_prop_source(&self, b: BindingId) -> bool {
        let info = &self.bindings[b];
        let s = &self.sem.bindings[b];
        matches!(info.kind, BindKind::Prop | BindKind::BindableProp)
            && (s.writes > 0 || info.initial.is_some() || s.mutations > 0)
    }

    /// Evaluates `e` of the component's own tree.
    pub fn evaluate(&self, ast: &Ast, src: &str, e: NodeId) -> crate::evaluate::Evaluation {
        crate::evaluate::Evaluator::new(ast, src, self).evaluate(crate::evaluate::Tree::Source, e)
    }

    /// Evaluates `e` of a lowered tree, resolving names in the component scope.
    pub fn evaluate_output(
        &self,
        source: &Ast,
        src: &str,
        out: &Ast,
        e: NodeId,
    ) -> crate::evaluate::Evaluation {
        crate::evaluate::Evaluator::new(source, src, self)
            .evaluate(crate::evaluate::Tree::Output(out), e)
    }
}

fn has_props_rune(ast: &Ast, program: NodeId) -> bool {
    let Kind::Program(body) = ast.kind(program) else {
        unreachable!("a script parses to a program")
    };
    body.iter().any(|&stmt| match ast.kind(stmt) {
        Kind::VarDecl { decls, .. } => decls.iter().any(|&d| {
            matches!(ast.kind(d), Kind::Declarator { init: Some(i), .. } if rune_call(ast, i).is_some_and(|(r, _)| r == "$props"))
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
pub fn rune_call(ast: &Ast, e: NodeId) -> Option<(&'static str, Option<NodeId>)> {
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
    let rune = RUNES.iter().find(|r| **r == name)?;
    Some((rune, args.first().copied()))
}
