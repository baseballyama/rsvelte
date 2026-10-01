//! Name resolution: one scope analysis over the script and the template, and the binding types
//! compileScript derives from the script.
//!
//! The template contributes [`HostRoot`]s: each expression is evaluated in the script's top-level
//! scope, and each `v-for` opens a [`HostScope`] declaring its aliases for the element it sits on.
//! Lint rules, compilation and the type-check projection all read this one resolution.

use rsv_js::ast::flag;
use rsv_js::scope::{self, HostRoot, HostScope, Semantic};
use rsv_js::{Ast, Kind, NodeId};
use rsv_kernel::intern::Atom;
use rustc_hash::FxHashMap;

use crate::ast::{AttrKind, DirExp, DirName, Sfc, TId, TNode};
use crate::hir::{Hir, HirId, NodeKind, PropKind};

/// compiler-core's `BindingTypes`, the ones `<script setup>` produces.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum BindingType {
    /// A key of `defineProps`' runtime declaration.
    Props,
    SetupLet,
    SetupConst,
    SetupReactiveConst,
    SetupMaybeRef,
    SetupRef,
    LiteralConst,
}

#[derive(Debug)]
pub struct Resolution {
    pub sem: Semantic,
    /// compileScript's `bindingMetadata`: by name, as the template compiler looks names up.
    pub bindings: FxHashMap<Atom, BindingType>,
    /// The `defineProps(…)` call, if the script makes one.
    pub define_props: Option<DefineProps>,
    /// The template's scope roots, in document order (what [`scope::analyze`] was given).
    pub host: Vec<HostRoot>,
}

#[derive(Clone, Copy, Debug)]
pub struct DefineProps {
    pub call: NodeId,
    /// The runtime declaration (the call's argument).
    pub runtime: Option<NodeId>,
    /// The statement holding the call.
    pub stmt: NodeId,
    /// `const props = defineProps(…)`: the declared name.
    pub decl: Option<NodeId>,
}

impl Resolution {
    #[must_use]
    pub fn binding_type(&self, name: Atom) -> Option<BindingType> {
        self.bindings.get(&name).copied()
    }
}

/// `program` is the script's program (or an empty one); `hir` is the template, `None` without one.
#[must_use]
pub fn resolve(js: &Ast, program: NodeId, hir: Option<&Hir>, src: &str) -> Resolution {
    let host = hir.map_or_else(Vec::new, template_roots);
    let sem = scope::analyze(js, program, &host);
    let (bindings, define_props) = binding_metadata(js, src, program);
    Resolution {
        sem,
        bindings,
        define_props,
        host,
    }
}

/// The template's scope roots, in document order.
#[must_use]
pub fn template_roots(hir: &Hir) -> Vec<HostRoot> {
    let mut out = Vec::new();
    for &n in hir.root() {
        node_roots(hir, n, &mut out);
    }
    out
}

fn node_roots(hir: &Hir, n: HirId, out: &mut Vec<HostRoot>) {
    match &hir.node(n).kind {
        NodeKind::Text(_) | NodeKind::Comment { .. } => {}
        NodeKind::Interpolation { expr } => out.push(HostRoot::Expr(*expr)),
        NodeKind::Element(el) => {
            let mut inner = Vec::new();
            let mut for_exp = None;
            for p in hir.props(el.props) {
                if let PropKind::Directive(d) = &p.kind {
                    match &d.exp {
                        DirExp::None => {}
                        DirExp::Expr(e) => inner.push(HostRoot::Expr(*e)),
                        DirExp::For(f) => for_exp = Some(f),
                    }
                }
            }
            for &k in hir.children(el.children) {
                node_roots(hir, k, &mut inner);
            }
            match for_exp {
                // vue-eslint-parser: the aliases are visible on the whole element.
                Some(f) => {
                    out.push(HostRoot::Expr(f.source));
                    out.push(HostRoot::Scope(HostScope {
                        node: f.params[0],
                        params: f.params.clone(),
                        body: inner,
                    }));
                }
                None => out.extend(inner),
            }
        }
    }
}

const DEFINE_MACROS: &[&str] = &["defineProps", "defineEmits", "withDefaults", "defineSlots"];
const REF_CALLS: &[&str] = &[
    "ref",
    "computed",
    "shallowRef",
    "customRef",
    "toRef",
    "useTemplateRef",
];

/// compileScript's binding metadata for a `<script setup>` program: the user's imports, then the
/// setup bindings (`walkDeclaration`), with `defineProps`' keys as `props` where nothing else
/// claims the name.
fn binding_metadata(
    ast: &Ast,
    src: &str,
    program: NodeId,
) -> (FxHashMap<Atom, BindingType>, Option<DefineProps>) {
    let Kind::Program(body) = ast.kind(program) else {
        unreachable!("a script parses to a program")
    };
    let (vue_aliases, imports) = user_imports(ast, src, body);
    let mut setup: Vec<(Atom, BindingType)> = Vec::new();
    let mut define_props = None;
    for &stmt in body {
        match ast.kind(stmt) {
            Kind::ExprStmt(e) if is_define_props(ast, e) => {
                define_props = Some(DefineProps {
                    call: e,
                    runtime: first_arg(ast, e),
                    stmt,
                    decl: None,
                });
            }
            Kind::VarDecl { kind, decls } => {
                for &d in decls {
                    if let Kind::Declarator { id, init: Some(i) } = ast.kind(d)
                        && is_define_props(ast, i)
                    {
                        define_props = Some(DefineProps {
                            call: i,
                            runtime: first_arg(ast, i),
                            stmt,
                            decl: Some(id),
                        });
                    }
                }
                walk_declaration(ast, kind == flag::CONST, decls, &vue_aliases, &mut setup);
            }
            Kind::Function {
                name: Some(n),
                decl: true,
                ..
            } => setup.extend(ast.atom(n).map(|a| (a, BindingType::SetupConst))),
            _ => {}
        }
    }
    let prop_keys = define_props
        .and_then(|d| d.runtime)
        .map_or_else(Vec::new, |r| object_keys(ast, src, r));
    // compileScript fills `bindingMetadata` in this order; a later entry overwrites.
    let mut out = FxHashMap::default();
    for k in prop_keys {
        out.entry(k).or_insert(BindingType::Props);
    }
    for (k, t) in imports.into_iter().chain(setup) {
        out.insert(k, t);
    }
    (out, define_props)
}

/// The script's value imports: the local names of what it imports from `vue` (by imported name),
/// and each import's binding type.
fn user_imports<'a>(
    ast: &'a Ast,
    src: &'a str,
    body: &[NodeId],
) -> (FxHashMap<&'a str, &'a str>, Vec<(Atom, BindingType)>) {
    let mut vue_aliases = FxHashMap::default();
    let mut imports = Vec::new();
    for &stmt in body {
        let Kind::Import {
            specifiers,
            source,
            type_only: false,
        } = ast.kind(stmt)
        else {
            continue;
        };
        let from = ast.str_value(source, src);
        for &sp in specifiers {
            let (local, imported) = match ast.kind(sp) {
                Kind::ImportDefault(l) => (l, "default"),
                Kind::ImportNamespace(l) => (l, "*"),
                Kind::ImportNamed { imported, local } => (local, ast.name(imported)),
                _ => continue,
            };
            if from == "vue" {
                vue_aliases.insert(imported, ast.name(local));
            }
            #[expect(
                clippy::case_sensitive_file_extension_comparisons,
                reason = "compileScript's `endsWith('.vue')` is case-sensitive"
            )]
            let from_sfc = from.ends_with(".vue");
            let t = if imported == "*" || (imported == "default" && from_sfc) || from == "vue" {
                BindingType::SetupConst
            } else {
                BindingType::SetupMaybeRef
            };
            imports.extend(ast.atom(local).map(|a| (a, t)));
        }
    }
    (vue_aliases, imports)
}

/// compiler-sfc `walkDeclaration` for one variable declaration. Destructured declarators are not
/// classified yet.
fn walk_declaration(
    ast: &Ast,
    is_const: bool,
    decls: &[NodeId],
    vue_aliases: &FxHashMap<&str, &str>,
    out: &mut Vec<(Atom, BindingType)>,
) {
    let alias = |name: &str| vue_aliases.get(name).copied();
    let reactive = alias("reactive");
    let all_literal = is_const
        && decls.iter().all(|&d| match ast.kind(d) {
            Kind::Declarator { id, init } => {
                matches!(ast.kind(id), Kind::Ident(_)) && init.is_some_and(|i| is_static(ast, i))
            }
            _ => false,
        });
    for &d in decls {
        let Kind::Declarator { id, init } = ast.kind(d) else {
            continue;
        };
        let Some(name) = ast
            .atom(id)
            .filter(|_| matches!(ast.kind(id), Kind::Ident(_)))
        else {
            continue;
        };
        let callee = init.and_then(|i| call_name(ast, i));
        let is_macro = is_const && callee.is_some_and(|c| DEFINE_MACROS.contains(&c));
        let t = if all_literal || (is_const && init.is_some_and(|i| is_static(ast, i))) {
            BindingType::LiteralConst
        } else if callee.is_some() && callee == reactive {
            if is_const {
                BindingType::SetupReactiveConst
            } else {
                BindingType::SetupLet
            }
        } else if is_macro || (is_const && init.is_some_and(|i| can_never_be_ref(ast, i, reactive)))
        {
            if callee == Some("defineProps") {
                BindingType::SetupReactiveConst
            } else {
                BindingType::SetupConst
            }
        } else if is_const {
            let makes_ref = callee.is_some_and(|c| {
                REF_CALLS.iter().any(|r| alias(r) == Some(c)) || c == "defineModel"
            });
            if makes_ref {
                BindingType::SetupRef
            } else {
                BindingType::SetupMaybeRef
            }
        } else {
            BindingType::SetupLet
        };
        out.push((name, t));
    }
}

fn is_define_props(ast: &Ast, e: NodeId) -> bool {
    call_name(ast, e) == Some("defineProps")
}

fn first_arg(ast: &Ast, call: NodeId) -> Option<NodeId> {
    match ast.kind(call) {
        Kind::Call { args, .. } => args.first().copied(),
        _ => None,
    }
}

/// compiler-sfc `isCallOf`: a call whose callee is a plain identifier.
pub(crate) fn call_name(ast: &Ast, e: NodeId) -> Option<&str> {
    match ast.kind(e) {
        Kind::Call { callee, .. } if matches!(ast.kind(callee), Kind::Ident(_)) => {
            Some(ast.name(callee))
        }
        _ => None,
    }
}

/// compiler-sfc `getObjectOrArrayExpressionKeys`.
/// A key no identifier of the document spells has no atom, and no template name can need it.
fn object_keys(ast: &Ast, src: &str, e: NodeId) -> Vec<Atom> {
    match ast.kind(e) {
        Kind::Object(props) => props
            .iter()
            .filter_map(|&p| match ast.kind(p) {
                Kind::Property {
                    key,
                    computed: false,
                    ..
                } => match ast.kind(key) {
                    Kind::Ident(a) => Some(a),
                    Kind::Str => ast.atoms.lookup(ast.str_value(key, src)),
                    _ => None,
                },
                _ => None,
            })
            .collect(),
        Kind::Array(items) => items
            .iter()
            .filter(|&&i| matches!(ast.kind(i), Kind::Str))
            .filter_map(|&i| ast.atoms.lookup(ast.str_value(i, src)))
            .collect(),
        _ => Vec::new(),
    }
}

/// compiler-sfc `isStaticNode`.
pub(crate) fn is_static(ast: &Ast, e: NodeId) -> bool {
    match ast.kind(e) {
        Kind::Unary(_, a) => is_static(ast, a),
        Kind::Binary(_, l, r) | Kind::Logical(_, l, r) => is_static(ast, l) && is_static(ast, r),
        Kind::Cond { test, cons, alt } => {
            is_static(ast, test) && is_static(ast, cons) && is_static(ast, alt)
        }
        Kind::Seq(list) => list.iter().all(|&x| is_static(ast, x)),
        Kind::Template { exprs, .. } => exprs.iter().all(|&x| is_static(ast, x)),
        Kind::Str | Kind::Num(_) | Kind::Bool(_) | Kind::Null => true,
        _ => false,
    }
}

/// compiler-sfc `canNeverBeRef`.
fn can_never_be_ref(ast: &Ast, e: NodeId, reactive: Option<&str>) -> bool {
    if reactive.is_some() && call_name(ast, e) == reactive {
        return true;
    }
    match ast.kind(e) {
        // The last five are `isLiteralNode`: every `*Literal` type, template literals included.
        Kind::Unary(..)
        | Kind::Binary(..)
        | Kind::Array(_)
        | Kind::Object(_)
        | Kind::Function { .. }
        | Kind::Arrow { .. }
        | Kind::Update { .. }
        | Kind::Str
        | Kind::Num(_)
        | Kind::Bool(_)
        | Kind::Null
        | Kind::Template { .. } => true,
        Kind::Seq(list) => list
            .last()
            .is_some_and(|&l| can_never_be_ref(ast, l, reactive)),
        _ => false,
    }
}

/// The `v-if` / `v-else-if` / `v-else` directive of an element, if any.
#[must_use]
pub fn if_directive(c: &Sfc, n: TId) -> Option<DirName> {
    let TNode::Element { attrs, .. } = c.node(n) else {
        return None;
    };
    c.attrs(*attrs).iter().find_map(|a| match &a.kind {
        AttrKind::Directive(d)
            if matches!(d.name, DirName::If | DirName::ElseIf | DirName::Else) =>
        {
            Some(d.name)
        }
        _ => None,
    })
}
