//! Facts about a component that every task reads: what each binding is (state, prop, …), what
//! each template expression depends on, the component name, the CSS hash and which elements the
//! style sheet selects. All of it lives in side tables keyed by ids, so the trees stay immutable.

use crate::ast::{AttrValue, Component, Part, TId, TNode, decode_text};
use rsv_css::matcher::{self, Element, Match};
use rsv_js::scope::{self, BindingId, DeclKind, Semantic};
use rsv_js::{Ast, Kind, NodeId};
use rsv_kernel::idx::IndexVec;
use rustc_hash::FxHashMap;

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

#[derive(Clone, Copy, Debug, Default)]
pub struct ExprMeta {
    /// Any identifier used as a reference (upstream marks the enclosing fragments dynamic).
    pub has_reference: bool,
    pub has_state: bool,
    pub has_call: bool,
    pub has_member: bool,
}

pub struct Analysis {
    pub sem: Semantic,
    pub bindings: IndexVec<BindingId, BindInfo>,
    /// Keyed by the expression root of every template expression.
    pub exprs: FxHashMap<NodeId, ExprMeta>,
    pub name: String,
    pub css_hash: Option<String>,
    pub needs_context: bool,
    /// The instance calls `$props()` (upstream `needs_props`).
    pub uses_props: bool,
    /// Per template node: whether the style sheet selects it (elements only).
    pub scoped: Vec<bool>,
    /// Per element: whether its children are dynamic (upstream `fragment.metadata.dynamic`).
    pub dynamic: Vec<bool>,
    pub root_dynamic: bool,
    /// Per complex selector, in [`rsv_css::scope::selectors`] order.
    pub css_used: Vec<bool>,
}

impl Analysis {
    pub fn binding(&self, ident: NodeId) -> Option<(BindingId, &BindInfo)> {
        let b = self.sem.binding_of(ident)?;
        Some((b, &self.bindings[b]))
    }

    pub fn meta(&self, expr: NodeId) -> ExprMeta {
        *self
            .exprs
            .get(&expr)
            .expect("every template expression is analysed")
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

/// Upstream `get_component_name` followed by `scope.generate`'s sanitising.
pub fn component_name(filename: &str) -> String {
    let mut parts: Vec<&str> = filename.split(['/', '\\']).collect();
    let basename = parts.pop().unwrap_or("");
    let last_dir = parts.last().copied();
    let mut name = basename.replacen(".svelte", "", 1);
    if name == "index"
        && let Some(dir) = last_dir
        && !dir.is_empty()
        && dir != "src"
    {
        name = dir.to_owned();
    }
    let mut chars = name.chars();
    let upper: String = match chars.next() {
        Some(c) => c.to_uppercase().chain(chars).collect(),
        None => String::new(),
    };
    sanitize_identifier(&upper)
}

/// `[^a-zA-Z0-9_$]` → `_`, and a leading digit → `_` (upstream `scope.generate`).
pub fn sanitize_identifier(name: &str) -> String {
    let mut out: String = name
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '_' || c == '$' {
                c
            } else {
                '_'
            }
        })
        .collect();
    if out.starts_with(|c: char| c.is_ascii_digit()) {
        out.replace_range(0..1, "_");
    }
    out
}

/// Upstream `hash` (utils.js): djb2 over UTF-16 code units, right to left, base 36.
pub fn hash(s: &str) -> String {
    let units: Vec<u16> = s
        .encode_utf16()
        .filter(|&u| u != u16::from(b'\r'))
        .collect();
    let mut h: i32 = 5381;
    for &u in units.iter().rev() {
        h = (h.wrapping_shl(5).wrapping_sub(h)) ^ i32::from(u);
    }
    to_base36(h as u32)
}

fn to_base36(mut v: u32) -> String {
    const DIGITS: &[u8; 36] = b"0123456789abcdefghijklmnopqrstuvwxyz";
    if v == 0 {
        return "0".into();
    }
    let mut buf = Vec::new();
    while v > 0 {
        buf.push(DIGITS[(v % 36) as usize]);
        v /= 36;
    }
    buf.reverse();
    String::from_utf8(buf).expect("ASCII digits")
}

pub fn analyze(c: &Component, src: &str, filename: &str) -> Analysis {
    let program = c.program;
    let sem = scope::analyze(&c.js, program, &c.template_exprs);
    let bindings = classify(&c.js, &sem, program);
    let mut an = Analysis {
        sem,
        bindings,
        exprs: FxHashMap::default(),
        name: component_name(filename),
        css_hash: c
            .style
            .as_ref()
            .map(|_| format!("svelte-{}", hash(filename))),
        needs_context: false,
        uses_props: false,
        scoped: vec![false; c.nodes.len()],
        dynamic: vec![false; c.nodes.len()],
        root_dynamic: false,
        css_used: Vec::new(),
    };
    an.uses_props = has_props_rune(&c.js, program);

    let mut walker = MetaWalker {
        ast: &c.js,
        src,
        an: &an,
        meta: ExprMeta::default(),
        deps: 0,
        needs_context: false,
    };
    walker.visit(program);
    let script_needs_context = walker.needs_context;
    let mut exprs = FxHashMap::default();
    let mut needs_context = script_needs_context;
    for &e in &c.template_exprs {
        let mut w = MetaWalker {
            ast: &c.js,
            src,
            an: &an,
            meta: ExprMeta::default(),
            deps: 0,
            needs_context: false,
        };
        w.visit(e);
        needs_context |= w.needs_context;
        exprs.insert(e, w.meta);
    }
    an.exprs = exprs;
    an.needs_context = needs_context;
    let mut dynamic = vec![false; c.nodes.len()];
    an.root_dynamic = mark_dynamic(c, src, &an, c.children(c.root), &mut dynamic);
    an.dynamic = dynamic;

    if let Some(style) = &c.style {
        let selectors = rsv_css::scope::selectors(&style.sheet);
        an.css_used = vec![false; selectors.len()];
        let parents = parents(c);
        for (id, n) in c.nodes.iter().enumerate() {
            if !matches!(n, TNode::Element { .. }) {
                continue;
            }
            let el = El {
                c,
                src,
                id: id as TId,
                parents: &parents,
            };
            for (i, sel) in selectors.iter().enumerate() {
                if matcher::matches(src, sel, el) {
                    an.css_used[i] = true;
                    let global = sel.parts.last().is_some_and(|r| matcher::is_global(src, r));
                    if !global {
                        an.scoped[id] = true;
                    }
                }
            }
        }
    }
    an
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

/// Computes [`ExprMeta`] the way upstream's analysis visitors do, and `needs_context`.
struct MetaWalker<'a> {
    ast: &'a Ast,
    src: &'a str,
    an: &'a Analysis,
    meta: ExprMeta,
    /// Bindings referenced so far (upstream `metadata.dependencies`, as a count).
    deps: u32,
    needs_context: bool,
}

impl MetaWalker<'_> {
    fn visit(&mut self, id: NodeId) {
        match self.ast.kind(id) {
            Kind::Ident(_) => {
                let declares = self
                    .an
                    .binding(id)
                    .is_some_and(|(b, _)| self.an.sem.bindings[b].node == id);
                self.meta.has_reference |= !declares;
                if let Some((_, info)) = self.an.binding(id)
                    && !declares
                {
                    self.deps += 1;
                    let prop = matches!(
                        info.kind,
                        BindKind::Prop | BindKind::BindableProp | BindKind::RestProp
                    );
                    if (prop || !info.is_function)
                        && !self.an.evaluate(self.ast, self.src, id).is_known
                    {
                        self.meta.has_state = true;
                    }
                }
            }
            Kind::Member {
                object,
                property,
                computed,
                ..
            } => {
                self.visit(object);
                if computed {
                    self.visit(property);
                }
                self.meta.has_member = true;
                if !self.is_pure(id) {
                    self.meta.has_state = true;
                }
                if !self.is_safe(id) {
                    self.needs_context = true;
                }
            }
            Kind::Call { callee, args, .. } => {
                let rune = rune_call(self.ast, id).map(|(r, _)| r);
                self.visit(callee);
                for &a in args {
                    self.visit(a);
                }
                if rune.is_none() {
                    if !self.is_safe(callee) {
                        self.needs_context = true;
                    }
                    if !self.is_pure(callee) || self.deps > 0 {
                        self.meta.has_call = true;
                        self.meta.has_state = true;
                    }
                } else if matches!(rune, Some("$effect" | "$effect.pre" | "$bindable")) {
                    self.needs_context = true;
                }
            }
            Kind::Property {
                key,
                value,
                computed,
                ..
            } => {
                if computed {
                    self.visit(key);
                }
                self.visit(value);
            }
            _ => {
                let mut kids = Vec::new();
                self.ast.for_each_child(id, |c| kids.push(c));
                for c in kids {
                    self.visit(c);
                }
            }
        }
    }

    fn root_ident(&self, mut e: NodeId) -> Option<NodeId> {
        while let Kind::Member { object, .. } = self.ast.kind(e) {
            e = object;
        }
        matches!(self.ast.kind(e), Kind::Ident(_)).then_some(e)
    }

    /// Upstream `is_pure`.
    fn is_pure(&self, e: NodeId) -> bool {
        match self.ast.kind(e) {
            Kind::Str | Kind::Num(_) | Kind::Bool(_) | Kind::Null => true,
            Kind::Call { callee, args, .. } => {
                self.is_pure(callee) && args.iter().all(|&a| self.is_pure(a))
            }
            Kind::Ident(_) | Kind::Member { .. } => match self.root_ident(e) {
                Some(root) => self.an.binding(root).is_none(),
                None => false,
            },
            _ => false,
        }
    }

    /// Upstream `is_safe_identifier`.
    fn is_safe(&self, e: NodeId) -> bool {
        let Some(root) = self.root_ident(e) else {
            return false;
        };
        let Some((b, info)) = self.an.binding(root) else {
            return true;
        };
        self.an.sem.bindings[b].kind != DeclKind::Import
            && !matches!(
                info.kind,
                BindKind::Prop | BindKind::BindableProp | BindKind::RestProp
            )
    }
}

/// Upstream `mark_subtree_dynamic` callers, for the node types this port has: returns whether
/// `list` makes its fragment dynamic, and records the answer for each element's own children.
fn mark_dynamic(c: &Component, src: &str, an: &Analysis, list: &[TId], out: &mut [bool]) -> bool {
    let mut any = false;
    for &id in list {
        match c.node(id) {
            TNode::Expr { .. } => any = true,
            TNode::If { cons, alt, .. } => {
                any = true;
                mark_dynamic(c, src, an, c.children(*cons), out);
                if let Some(a) = alt {
                    mark_dynamic(c, src, an, c.children(*a), out);
                }
            }
            TNode::Element {
                name,
                attrs,
                children,
                ..
            } => {
                let own = mark_dynamic(c, src, an, c.children(*children), out);
                out[id as usize] = own;
                any |= own;
                for a in c.attrs(*attrs) {
                    let attr = a.name.text(src);
                    let AttrValue::Parts(r) = a.value else {
                        any |= crate::lower::cannot_be_set_statically(attr);
                        continue;
                    };
                    let parts = c.parts(r);
                    let references = parts.iter().any(
                        |p| matches!(p, Part::Expr { expr, .. } if an.meta(*expr).has_reference),
                    );
                    let single_expr = match parts {
                        [Part::Expr { expr, .. }] => Some(*expr),
                        _ => None,
                    };
                    let is_event = attr.starts_with("on") && single_expr.is_some();
                    let class_expr = attr == "class"
                        && !a.quoted
                        && single_expr.is_some_and(|e| {
                            !matches!(
                                c.js.kind(e),
                                Kind::Str
                                    | Kind::Num(_)
                                    | Kind::Bool(_)
                                    | Kind::Null
                                    | Kind::Template { .. }
                                    | Kind::Binary(..)
                            )
                        });
                    let option_value = attr == "value" && name.text(src) == "option";
                    any |= references
                        || is_event
                        || class_expr
                        || option_value
                        || crate::lower::cannot_be_set_statically(attr);
                }
            }
            TNode::Text { .. } | TNode::Comment { .. } => {}
        }
    }
    any
}

fn parents(c: &Component) -> Vec<Option<TId>> {
    let mut out = vec![None; c.nodes.len()];
    fn walk(c: &Component, list: &[TId], parent: Option<TId>, out: &mut [Option<TId>]) {
        for &id in list {
            out[id as usize] = parent;
            match c.node(id) {
                TNode::Element { children, .. } => walk(c, c.children(*children), Some(id), out),
                // Blocks are transparent for CSS: their children's parent is the enclosing element.
                TNode::If { cons, alt, .. } => {
                    walk(c, c.children(*cons), parent, out);
                    if let Some(a) = alt {
                        walk(c, c.children(*a), parent, out);
                    }
                }
                _ => {}
            }
        }
    }
    walk(c, c.children(c.root), None, &mut out);
    out
}

#[derive(Clone, Copy)]
struct El<'a> {
    c: &'a Component,
    src: &'a str,
    id: TId,
    parents: &'a [Option<TId>],
}

impl El<'_> {
    fn attr_state(&self, name: &str, check: impl Fn(&str) -> bool) -> Match {
        let TNode::Element { attrs, .. } = self.c.node(self.id) else {
            unreachable!("El wraps elements")
        };
        for a in self.c.attrs(*attrs) {
            if !a.name.text(self.src).eq_ignore_ascii_case(name) {
                continue;
            }
            return match a.value {
                AttrValue::True => Match::from_bool(check("")),
                AttrValue::Parts(r) => {
                    let parts = self.c.parts(r);
                    if parts.iter().all(|p| matches!(p, Part::Text(_))) {
                        let text: String = parts
                            .iter()
                            .map(|p| match p {
                                Part::Text(s) => decode_text(s.text(self.src)).into_owned(),
                                Part::Expr { .. } => unreachable!(),
                            })
                            .collect();
                        Match::from_bool(check(&text))
                    } else {
                        Match::Maybe
                    }
                }
            };
        }
        Match::No
    }
}

trait FromBool {
    fn from_bool(b: bool) -> Self;
}

impl FromBool for Match {
    fn from_bool(b: bool) -> Match {
        if b { Match::Yes } else { Match::No }
    }
}

impl Element for El<'_> {
    fn tag_name(&self) -> Option<&str> {
        let TNode::Element { name, .. } = self.c.node(self.id) else {
            unreachable!("El wraps elements")
        };
        Some(name.text(self.src))
    }

    fn class(&self, name: &str) -> Match {
        self.attr_state("class", |v| v.split_ascii_whitespace().any(|c| c == name))
    }

    fn id(&self, name: &str) -> Match {
        self.attr_state("id", |v| v == name)
    }

    fn attribute(&self, name: &str) -> Match {
        match self.attr_state(name, |_| true) {
            Match::No => Match::No,
            _ => Match::Yes,
        }
    }

    fn parent(&self) -> Option<Self> {
        self.parents[self.id as usize].map(|p| El { id: p, ..*self })
    }
}
