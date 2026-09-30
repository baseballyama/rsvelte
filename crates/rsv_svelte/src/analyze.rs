//! What the compiler derives on top of name resolution ([`crate::resolve`]).
//!
//! That is what each template
//! expression depends on, which fragments are dynamic, the component name, the CSS hash and which
//! elements the style sheet selects. All of it lives in side tables keyed by ids, so the trees stay
//! immutable.

use rsv_css::matcher::{self, Element, Match};
use rsv_js::scope::DeclKind;
use rsv_js::{Ast, Kind, NodeId};
use rsv_kernel::idx::IndexVec;
use rustc_hash::FxHashMap;

use crate::hir::{self, AttrValue, Hir, HirId, NodeKind, Part};
use crate::lower::CompileInput;
use crate::resolve::{BindKind, Resolution, rune_call};

#[derive(Clone, Copy, Debug, Default)]
#[expect(
    clippy::struct_excessive_bools,
    reason = "independent facts upstream tracks as separate flags"
)]
pub struct ExprMeta {
    /// Any identifier used as a reference (upstream marks the enclosing fragments dynamic).
    pub has_reference: bool,
    pub has_state: bool,
    pub has_call: bool,
    pub has_member: bool,
}

#[derive(Debug)]
pub struct Analysis {
    /// Keyed by the expression root of every template expression.
    pub exprs: FxHashMap<NodeId, ExprMeta>,
    pub name: String,
    pub css_hash: Option<String>,
    pub needs_context: bool,
    /// Per HIR node: whether the style sheet selects it (elements only).
    pub scoped: IndexVec<HirId, bool>,
    /// Per element: whether its children are dynamic (upstream `fragment.metadata.dynamic`).
    pub dynamic: IndexVec<HirId, bool>,
    pub root_dynamic: bool,
    /// Per complex selector, in [`rsv_css::scope::selectors`] order.
    pub css_used: Vec<bool>,
}

impl Analysis {
    /// # Panics
    ///
    /// If `expr` is not the root of a template expression.
    #[must_use]
    pub fn meta(&self, expr: NodeId) -> ExprMeta {
        *self
            .exprs
            .get(&expr)
            .expect("every template expression is analysed")
    }
}

/// Upstream `get_component_name` followed by `scope.generate`'s sanitising.
#[must_use]
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
        dir.clone_into(&mut name);
    }
    let mut chars = name.chars();
    let upper: String = chars
        .next()
        .map_or_else(String::new, |c| c.to_uppercase().chain(chars).collect());
    sanitize_identifier(&upper)
}

/// `[^a-zA-Z0-9_$]` → `_`, and a leading digit → `_` (upstream `scope.generate`).
#[must_use]
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
#[must_use]
pub fn hash(s: &str) -> String {
    let units: Vec<u16> = s
        .encode_utf16()
        .filter(|&u| u != u16::from(b'\r'))
        .collect();
    let mut h: i32 = 5381;
    for &u in units.iter().rev() {
        h = (h.wrapping_shl(5).wrapping_sub(h)) ^ i32::from(u);
    }
    to_base36(h.cast_unsigned())
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

#[must_use]
pub fn analyze(input: &CompileInput<'_>, res: &Resolution, filename: &str) -> Analysis {
    let (hir, src, js) = (input.hir, input.src, input.js);
    let mut an = Analysis {
        exprs: FxHashMap::default(),
        name: component_name(filename),
        css_hash: input.style.map(|_| format!("svelte-{}", hash(filename))),
        needs_context: false,
        scoped: IndexVec::from_elem_n(false, hir.nodes.len()),
        dynamic: IndexVec::from_elem_n(false, hir.nodes.len()),
        root_dynamic: false,
        css_used: Vec::new(),
    };
    let mut walker = MetaWalker {
        ast: js,
        src,
        res,
        meta: ExprMeta::default(),
        deps: 0,
        needs_context: false,
    };
    walker.visit(input.program);
    let script_needs_context = walker.needs_context;
    let mut exprs = FxHashMap::default();
    let mut needs_context = script_needs_context;
    for &e in input.template_exprs {
        let mut w = MetaWalker {
            ast: js,
            src,
            res,
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
    let mut dynamic = IndexVec::from_elem_n(false, hir.nodes.len());
    an.root_dynamic = mark_dynamic(input, &an, hir.children(hir.root), &mut dynamic);
    an.dynamic = dynamic;

    if let Some(sheet) = input.style {
        let selectors = rsv_css::scope::selectors(sheet);
        an.css_used = vec![false; selectors.len()];
        for (id, _) in hir.elements() {
            let el = El { hir, src, id };
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

/// Computes [`ExprMeta`] the way upstream's analysis visitors do, and `needs_context`.
struct MetaWalker<'a> {
    ast: &'a Ast,
    src: &'a str,
    res: &'a Resolution,
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
                    .res
                    .binding(id)
                    .is_some_and(|(b, _)| self.res.sem.bindings[b].node == id);
                self.meta.has_reference |= !declares;
                if let Some((_, info)) = self.res.binding(id)
                    && !declares
                {
                    self.deps += 1;
                    let prop = matches!(
                        info.kind,
                        BindKind::Prop | BindKind::BindableProp | BindKind::RestProp
                    );
                    if (prop || !info.is_function)
                        && !self.res.evaluate(self.ast, self.src, id).is_known
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
            Kind::Ident(_) | Kind::Member { .. } => self
                .root_ident(e)
                .is_some_and(|root| self.res.binding(root).is_none()),
            _ => false,
        }
    }

    /// Upstream `is_safe_identifier`.
    fn is_safe(&self, e: NodeId) -> bool {
        let Some(root) = self.root_ident(e) else {
            return false;
        };
        let Some((b, info)) = self.res.binding(root) else {
            return true;
        };
        self.res.sem.bindings[b].kind != DeclKind::Import
            && !matches!(
                info.kind,
                BindKind::Prop | BindKind::BindableProp | BindKind::RestProp
            )
    }
}

/// Upstream `mark_subtree_dynamic` callers, for the node types this port has: returns whether
/// `list` makes its fragment dynamic, and records the answer for each element's own children.
fn mark_dynamic(
    input: &CompileInput<'_>,
    an: &Analysis,
    list: &[HirId],
    out: &mut IndexVec<HirId, bool>,
) -> bool {
    let (hir, src) = (input.hir, input.src);
    let mut any = false;
    for &id in list {
        match &hir.node(id).kind {
            NodeKind::Expr { .. } => any = true,
            NodeKind::If {
                branches,
                otherwise,
            } => {
                any = true;
                for b in hir.branches(*branches) {
                    mark_dynamic(input, an, hir.children(b.body), out);
                }
                if let Some(o) = otherwise {
                    mark_dynamic(input, an, hir.children(*o), out);
                }
            }
            NodeKind::Element(el) => {
                let own = mark_dynamic(input, an, hir.children(el.children), out);
                out[id] = own;
                any |= own;
                for a in hir.attrs(el.attrs) {
                    let attr = a.name.text(src);
                    let (references, single_expr, quoted) = match &a.value {
                        AttrValue::Boolean => {
                            any |= crate::lower::cannot_be_set_statically(attr);
                            continue;
                        }
                        AttrValue::Static(_) => (false, None, true),
                        &AttrValue::Expression { expr, quoted } => {
                            (an.meta(expr).has_reference, Some(expr), quoted)
                        }
                        &AttrValue::Shorthand(expr) => {
                            (an.meta(expr).has_reference, Some(expr), false)
                        }
                        AttrValue::Interpolated(parts) => {
                            let references = parts.iter().any(|p| match *p {
                                Part::Expr { expr, .. } => an.meta(expr).has_reference,
                                Part::Text(_) => false,
                            });
                            (references, None, true)
                        }
                    };
                    let is_event = attr.starts_with("on") && single_expr.is_some();
                    let class_expr = attr == "class"
                        && !quoted
                        && single_expr.is_some_and(|e| {
                            !matches!(
                                input.js.kind(e),
                                Kind::Str
                                    | Kind::Num(_)
                                    | Kind::Bool(_)
                                    | Kind::Null
                                    | Kind::Template { .. }
                                    | Kind::Binary(..)
                            )
                        });
                    let option_value = attr == "value" && el.name.text(src) == "option";
                    any |= references
                        || is_event
                        || class_expr
                        || option_value
                        || crate::lower::cannot_be_set_statically(attr);
                }
            }
            NodeKind::Text { .. } | NodeKind::Comment { .. } => {}
        }
    }
    any
}

#[derive(Clone, Copy)]
struct El<'a> {
    hir: &'a Hir,
    src: &'a str,
    id: HirId,
}

impl El<'_> {
    fn element(&self) -> &hir::Element {
        let NodeKind::Element(el) = &self.hir.node(self.id).kind else {
            unreachable!("El wraps elements")
        };
        el
    }

    fn attr_state(&self, name: &str, check: impl Fn(&str) -> bool) -> Match {
        for a in self.hir.attrs(self.element().attrs) {
            if !a.name.text(self.src).eq_ignore_ascii_case(name) {
                continue;
            }
            return match &a.value {
                AttrValue::Boolean => Match::from_bool(check("")),
                AttrValue::Static(text) => Match::from_bool(check(text)),
                AttrValue::Interpolated(parts) if parts.is_empty() => Match::from_bool(check("")),
                AttrValue::Expression { .. }
                | AttrValue::Shorthand(_)
                | AttrValue::Interpolated(_) => Match::Maybe,
            };
        }
        Match::No
    }
}

trait FromBool {
    fn from_bool(b: bool) -> Self;
}

impl FromBool for Match {
    fn from_bool(b: bool) -> Self {
        if b { Self::Yes } else { Self::No }
    }
}

impl Element for El<'_> {
    fn tag_name(&self) -> Option<&str> {
        Some(self.element().name.text(self.src))
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

    /// Blocks are transparent for CSS: the parent is the enclosing element.
    fn parent(&self) -> Option<Self> {
        let mut at = self.hir.node(self.id).parent;
        while let Some(p) = at {
            if matches!(self.hir.node(p).kind, NodeKind::Element(_)) {
                return Some(El { id: p, ..*self });
            }
            at = self.hir.node(p).parent;
        }
        None
    }
}
