//! Client lowering: a DOM template per fragment plus the statements that walk it and keep it up to
//! date.
//!
//! Mirrors upstream `3-transform/client` (Fragment, `RegularElement`, `IfBlock`, `EachBlock`,
//! `BindDirective`, `AttachTag`, shared/fragment).

use rsv_html::decode_text;
use rsv_js::ast::flag;
use rsv_js::copy::copy;
use rsv_js::ops::{AssignOp, LogicalOp, UnaryOp};
use rsv_js::scope::{BindingId, ScopeId};
use rsv_js::{Ast, Kind, NodeId};
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::source::{Loc, Span};
use rustc_hash::FxHashMap;

use super::names::Names;
use super::script::{ScriptRewrite, lower_instance};
use super::{
    CompileInput, Item, Parent, Target, check_binding, check_foreign_element, check_runes,
    check_stores, clean_nodes, each_index_names, escape_html, event_attribute, has_dependency,
    is_directive, is_load_error_element, needs_clsx, sanitize_template_string,
};
use crate::analyze::{Analysis, ExprMeta};
use crate::hir::{AttrValue, Attribute, ElementKind, Hir, HirId, NodeKind, Part};
use crate::parse::is_void;
use crate::resolve::Resolution;

const TEMPLATE_FRAGMENT: u32 = 1;
const TEMPLATE_USE_IMPORT_NODE: u32 = 2;
const EACH_ITEM_REACTIVE: u32 = 1;
const EACH_INDEX_REACTIVE: u32 = 1 << 1;
const EACH_IS_CONTROLLED: u32 = 1 << 2;
const EACH_ITEM_IMMUTABLE: u32 = 1 << 4;
const PASSIVE_EVENTS: &[&str] = &["touchstart", "touchmove"];
const DELEGATED_EVENTS: &[&str] = &[
    "beforeinput",
    "click",
    "change",
    "dblclick",
    "contextmenu",
    "focusin",
    "focusout",
    "input",
    "keydown",
    "keyup",
    "mousedown",
    "mousemove",
    "mouseout",
    "mouseover",
    "mouseup",
    "pointerdown",
    "pointermove",
    "pointerout",
    "pointerover",
    "pointerup",
    "touchend",
    "touchmove",
    "touchstart",
];

type R<T> = Result<T, Diagnostic>;

fn unsupported<T>(what: &str, span: Span) -> R<T> {
    Err(Diagnostic::error(
        "unsupported",
        format!("{what} is not supported yet"),
        span,
    ))
}

/// Upstream `normalize_attribute`.
#[must_use]
pub fn normalize_attribute(name: &str) -> String {
    let lower = name.to_ascii_lowercase();
    let alias = match lower.as_str() {
        "formnovalidate" => "formNoValidate",
        "ismap" => "isMap",
        "nomodule" => "noModule",
        "playsinline" => "playsInline",
        "readonly" => "readOnly",
        "defaultvalue" => "defaultValue",
        "defaultchecked" => "defaultChecked",
        "srcobject" => "srcObject",
        "novalidate" => "noValidate",
        "allowfullscreen" => "allowFullscreen",
        "disablepictureinpicture" => "disablePictureInPicture",
        "disableremoteplayback" => "disableRemotePlayback",
        _ => return lower,
    };
    alias.to_owned()
}

/// The HTML of one fragment, built while its nodes are visited (upstream `Template`).
#[derive(Default)]
struct Template {
    arena: Vec<TplNode>,
    roots: Vec<usize>,
    stack: Vec<usize>,
    needs_import_node: bool,
}

enum TplNode {
    Element {
        name: String,
        attrs: Vec<(String, Option<String>)>,
        children: Vec<usize>,
    },
    Text(String),
    Comment(Option<String>),
}

impl Template {
    fn add(&mut self, n: TplNode) -> usize {
        self.arena.push(n);
        let i = self.arena.len() - 1;
        match self.stack.last() {
            Some(&p) => match &mut self.arena[p] {
                TplNode::Element { children, .. } => children.push(i),
                _ => unreachable!("only elements are pushed on the stack"),
            },
            None => self.roots.push(i),
        }
        i
    }

    fn push_element(&mut self, name: &str) {
        let i = self.add(TplNode::Element {
            name: name.to_owned(),
            attrs: Vec::new(),
            children: Vec::new(),
        });
        self.stack.push(i);
    }

    fn pop_element(&mut self) {
        self.stack.pop();
    }

    fn push_text(&mut self, raw: String) {
        self.add(TplNode::Text(raw));
    }

    fn push_comment(&mut self) {
        self.add(TplNode::Comment(None));
    }

    /// Like a JS object: setting an existing key keeps its position.
    fn set_prop(&mut self, key: &str, value: Option<String>) {
        let top = *self
            .stack
            .last()
            .expect("attributes are set on an open element");
        let TplNode::Element { attrs, .. } = &mut self.arena[top] else {
            unreachable!("stack holds elements")
        };
        match attrs.iter_mut().find(|(k, _)| k == key) {
            Some(slot) => slot.1 = value,
            None => attrs.push((key.to_owned(), value)),
        }
    }

    fn is_lone_comment(&self) -> bool {
        self.roots.len() == 1 && matches!(self.arena[self.roots[0]], TplNode::Comment(_))
    }

    fn html(&self) -> String {
        let mut out = String::new();
        for &r in &self.roots {
            self.stringify(r, &mut out);
        }
        out
    }

    fn stringify(&self, i: usize, out: &mut String) {
        match &self.arena[i] {
            TplNode::Text(raw) => out.push_str(raw),
            TplNode::Comment(Some(d)) => {
                out.push_str("<!--");
                out.push_str(d);
                out.push_str("-->");
            }
            TplNode::Comment(None) => out.push_str("<!>"),
            TplNode::Element {
                name,
                attrs,
                children,
            } => {
                out.push('<');
                out.push_str(name);
                for (k, v) in attrs {
                    out.push(' ');
                    out.push_str(&k.to_ascii_lowercase());
                    if let Some(v) = v {
                        out.push_str("=\"");
                        out.push_str(&escape_html(v, true));
                        out.push('"');
                    }
                }
                if is_void(name) {
                    out.push_str("/>");
                } else {
                    out.push('>');
                    for &c in children {
                        self.stringify(c, out);
                    }
                    out.push_str("</");
                    out.push_str(name);
                    out.push('>');
                }
            }
        }
    }
}

/// Per fragment: the template and the memoized expressions (`$0`, `$1`, …) of its render effect.
#[derive(Default)]
struct Frag {
    tpl: Template,
    memo: Vec<NodeId>,
}

#[derive(Default)]
struct Lists {
    init: Vec<NodeId>,
    update: Vec<NodeId>,
    after: Vec<NodeId>,
}

/// How to reach the first node of a child list (upstream `process_children`'s `initial`).
#[derive(Clone)]
enum Prev {
    Call { method: &'static str, of: String },
    Ident(String),
}

struct Cx<'a> {
    js: &'a Ast,
    hir: &'a Hir,
    src: &'a str,
    res: &'a Resolution,
    an: &'a Analysis,
    out: Ast,
    names: Names,
    hoisted: Vec<NodeId>,
    templates: FxHashMap<String, String>,
    events: Vec<String>,
    /// The `{#each}` names in scope, and whether a read goes through `$.get`.
    each: FxHashMap<BindingId, bool>,
    each_index: FxHashMap<HirId, String>,
    /// Where names in lowered expressions resolve: the innermost `{#each}` scope.
    scope: ScopeId,
    /// Upstream `state.preserve_whitespace`: inside `<pre>` or `<textarea>`.
    preserve_ws: bool,
}

/// # Errors
///
/// An `unsupported` [`Diagnostic`] if the component uses a construct the client lowering does not
/// handle yet.
pub fn lower(input: &CompileInput<'_>, res: &Resolution, an: &Analysis) -> R<(Ast, NodeId)> {
    let js = input.js;
    check_stores(js, res, input.src, input.program)?;
    check_runes(input, res, Target::Client)?;
    let declared = res.sem.bindings.iter().map(|b| js.atoms.get(b.name));
    let referenced = res.sem.references.iter().map(|r| js.name(r.node));
    let mut cx = Cx {
        js,
        hir: input.hir,
        src: input.src,
        res,
        an,
        out: Ast::new(),
        names: Names::new(declared, referenced),
        hoisted: Vec::new(),
        templates: FxHashMap::default(),
        events: Vec::new(),
        each: FxHashMap::default(),
        each_index: FxHashMap::default(),
        scope: ScopeId::ROOT,
        preserve_ws: false,
    };
    cx.each_index = each_index_names(input.hir, &mut cx.names);
    let mut rw = ScriptRewrite {
        target: Target::Client,
        res,
        src: input.src,
        each: None,
    };
    let instance = lower_instance(
        js,
        &mut cx.out,
        &mut rw,
        input.program,
        &mut cx.hoisted,
        &mut cx.names,
    )?;
    let template = cx.fragment(Parent::Root, input.hir.children(input.hir.root))?;

    let o = &mut cx.out;
    let mut body = Vec::new();
    if an.needs_context {
        let props = o.id("$$props");
        let t = o.bool(true, Loc::SYNTHETIC);
        let push = o.runtime("$", "push", &[props, t]);
        body.push(o.expr_stmt(push));
    }
    body.extend(instance);
    body.extend(template);
    if an.needs_context {
        let pop = o.runtime("$", "pop", &[]);
        body.push(o.expr_stmt(pop));
    }
    let mut params = vec![o.id("$$anchor")];
    if res.uses_props || an.needs_context {
        params.push(o.id("$$props"));
    }
    let block = o.block(&body, Loc::SYNTHETIC);
    let name = o.id(&an.name);
    let func = o.function(true, Some(name), &params, block, false, Loc::SYNTHETIC);

    let mut program = Vec::new();
    let src1 = o.str("svelte/internal/disclose-version");
    program.push(o.import(&[], src1, false, Loc::SYNTHETIC));
    let ns = o.id("$");
    let spec = o.import_namespace(ns, Loc::SYNTHETIC);
    let src2 = o.str("svelte/internal/client");
    program.push(o.import(&[spec], src2, false, Loc::SYNTHETIC));
    program.extend(cx.hoisted.iter().copied());
    let o = &mut cx.out;
    program.push(o.export_default(func, Loc::SYNTHETIC));
    if !cx.events.is_empty() {
        let names: Vec<NodeId> = cx.events.iter().map(|e| o.str(e)).collect();
        let arr = o.array(&names, Loc::SYNTHETIC);
        let d = o.runtime("$", "delegate", &[arr]);
        program.push(o.expr_stmt(d));
    }
    let root = o.program(&program, Loc::SYNTHETIC);
    Ok((cx.out, root))
}

impl<'a> Cx<'a> {
    fn expr(&mut self, e: NodeId) -> NodeId {
        let mut rw = ScriptRewrite {
            target: Target::Client,
            res: self.res,
            src: self.src,
            each: Some(&self.each),
        };
        copy(self.js, &mut self.out, &mut rw, e)
    }

    /// `b.thunk`: `() => e`, or `f` for `() => f()`.
    fn thunk(&mut self, e: NodeId) -> NodeId {
        let arrow = self.out.arrow(&[], e, true, false, Loc::SYNTHETIC);
        self.unthunk(arrow)
    }

    /// `b.unthunk`: `(a, b) => f(a, b)` is `f`.
    fn unthunk(&self, arrow: NodeId) -> NodeId {
        let o = &self.out;
        let Kind::Arrow {
            params,
            body,
            expr_body: true,
            is_async: false,
            ..
        } = o.kind(arrow)
        else {
            return arrow;
        };
        let Kind::Call {
            callee,
            args,
            optional: false,
            ..
        } = o.kind(body)
        else {
            return arrow;
        };
        let same = matches!(o.kind(callee), Kind::Ident(_))
            && params.len() == args.len()
            && params.iter().zip(args).all(|(&p, &a)| {
                matches!(o.kind(p), Kind::Ident(_))
                    && matches!(o.kind(a), Kind::Ident(_))
                    && o.name(p) == o.name(a)
            });
        if same { callee } else { arrow }
    }

    /// `b.call` drops trailing missing arguments and turns inner ones into `void 0`.
    fn call(&mut self, method: &str, args: Vec<Option<NodeId>>) -> NodeId {
        runtime_call(&mut self.out, method, args)
    }

    fn stmt(&mut self, e: NodeId) -> NodeId {
        self.out.expr_stmt(e)
    }

    fn var(&mut self, name: &str, init: NodeId) -> NodeId {
        let id = self.out.id(name);
        self.out.let_(flag::VAR, id, Some(init))
    }

    fn num(&mut self, v: u32) -> NodeId {
        self.out.num(f64::from(v), Loc::SYNTHETIC)
    }

    fn tru(&mut self) -> NodeId {
        self.out.bool(true, Loc::SYNTHETIC)
    }

    fn is_static_element(&self, id: HirId) -> bool {
        let NodeKind::Element(el) = &self.hir.node(id).kind else {
            return false;
        };
        if self.an.dynamic[id] {
            return false;
        }
        let tag = el.name.text(self.src);
        if tag.contains('-') {
            return false;
        }
        for a in self.hir.attrs(el.attrs) {
            let n = a.name.text(self.src);
            if event_attribute(self.src, a).is_some()
                || super::cannot_be_set_statically(n)
                || n == "dir"
            {
                return false;
            }
            if matches!(tag, "input" | "textarea" | "select") && matches!(n, "value" | "checked") {
                return false;
            }
            if tag == "option" && n == "value" {
                return false;
            }
            if !matches!(a.value, AttrValue::Boolean | AttrValue::Static(_)) {
                return false;
            }
        }
        true
    }

    fn memoize(&mut self, frag: &mut Frag, value: NodeId, meta: ExprMeta) -> NodeId {
        if !meta.has_call {
            return value;
        }
        let id = self.out.id(&format!("${}", frag.memo.len()));
        frag.memo.push(value);
        id
    }

    /// Upstream `Fragment` visitor: the statements of one block.
    fn fragment(&mut self, parent: Parent<'_>, list: &[HirId]) -> R<Vec<NodeId>> {
        let cleaned = clean_nodes(self.hir, self.src, parent, list, self.preserve_ws);
        let items = cleaned.items;
        if items.is_empty() {
            return Ok(Vec::new());
        }
        let mut frag = Frag::default();
        let mut l = Lists::default();
        let close;

        let single_element = match items.as_slice() {
            [Item::Node(id)] => match &self.hir.node(*id).kind {
                NodeKind::Element(e) => Some((*id, e.name)),
                _ => None,
            },
            _ => None,
        };
        if let Some((el, name)) = single_element {
            let id = self.names.generate(name.text(self.src));
            self.element(el, &id, &mut frag, &mut l)?;
            let flags = if frag.tpl.needs_import_node {
                TEMPLATE_USE_IMPORT_NODE
            } else {
                0
            };
            let callee = self.transform_template(&frag.tpl, "root", flags);
            let call = self.out.call0(callee, &[]);
            let decl = self.var(&id, call);
            l.init.insert(0, decl);
            close = self.append(&id);
        } else if let [Item::Text { data, .. }] = items.as_slice() {
            let id = self.names.generate("text");
            let s = self.out.str(data);
            let call = self.call("text", vec![Some(s)]);
            let decl = self.var(&id, call);
            l.init.insert(0, decl);
            close = self.append(&id);
        } else {
            let id = self.names.generate("fragment");
            let use_space_template = items.iter().any(|i| matches!(i, Item::Expr(_)))
                && items
                    .iter()
                    .all(|i| matches!(i, Item::Text { .. } | Item::Expr(_)));
            if use_space_template {
                let text = self.names.generate("text");
                self.process_children(&items, Prev::Ident(text.clone()), false, &mut frag, &mut l)?;
                let call = self.call("text", vec![]);
                let decl = self.var(&text, call);
                l.init.insert(0, decl);
                close = self.append(&text);
            } else {
                self.process_children(
                    &items,
                    Prev::Call {
                        method: "first_child",
                        of: id.clone(),
                    },
                    false,
                    &mut frag,
                    &mut l,
                )?;
                let mut flags = TEMPLATE_FRAGMENT;
                if frag.tpl.needs_import_node {
                    flags |= TEMPLATE_USE_IMPORT_NODE;
                }
                let callee = self.transform_template(&frag.tpl, "root", flags);
                let call = self.out.call0(callee, &[]);
                let decl = self.var(&id, call);
                l.init.insert(0, decl);
                close = self.append(&id);
            }
        }

        let mut body = Vec::new();
        if cleaned.text_first {
            let next = self.call("next", vec![]);
            body.push(self.stmt(next));
        }
        body.append(&mut l.init);
        if !l.update.is_empty() {
            let effect = self.render_statement(&mut frag, &std::mem::take(&mut l.update));
            body.push(effect);
        }
        body.append(&mut l.after);
        body.push(close);
        Ok(body)
    }

    fn append(&mut self, id: &str) -> NodeId {
        let anchor = self.out.id("$$anchor");
        let x = self.out.id(id);
        let call = self.call("append", vec![Some(anchor), Some(x)]);
        self.stmt(call)
    }

    /// Upstream `build_render_statement`.
    fn render_statement(&mut self, frag: &mut Frag, update: &[NodeId]) -> NodeId {
        let ids: Vec<NodeId> = (0..frag.memo.len())
            .map(|i| self.out.id(&format!("${i}")))
            .collect();
        let single = match update {
            [s] => match self.out.kind(*s) {
                Kind::ExprStmt(e) => Some(e),
                _ => None,
            },
            _ => None,
        };
        let body = if let Some(e) = single {
            self.out.arrow(&ids, e, true, false, Loc::SYNTHETIC)
        } else {
            let b = self.out.block(update, Loc::SYNTHETIC);
            self.out.arrow(&ids, b, false, false, Loc::SYNTHETIC)
        };
        let values = if frag.memo.is_empty() {
            None
        } else {
            let memo = std::mem::take(&mut frag.memo);
            let thunks: Vec<NodeId> = memo
                .into_iter()
                .map(|m| self.out.arrow(&[], m, true, false, Loc::SYNTHETIC))
                .collect();
            Some(self.out.array(&thunks, Loc::SYNTHETIC))
        };
        let call = self.call("template_effect", vec![Some(body), values]);
        self.stmt(call)
    }

    /// Upstream `transform_template`: hoists `var root = $.from_html(…)` (shared by identical
    /// templates) and returns the callee that builds the fragment.
    fn transform_template(&mut self, tpl: &Template, name: &str, flags: u32) -> NodeId {
        if tpl.is_lone_comment() {
            let ns = self.out.id("$");
            return self.out.dot(ns, "comment");
        }
        let html = tpl.html();
        let key = format!("html {flags} {html}");
        if let Some(existing) = self.templates.get(&key) {
            let existing = existing.clone();
            return self.out.id(&existing);
        }
        let raw = sanitize_template_string(&html).into_owned();
        let q = self.out.template_elem(&raw, true);
        let t = self.out.template(&[q], &[], Loc::SYNTHETIC);
        let flags_arg = (flags != 0).then(|| self.num(flags));
        let call = self.call("from_html", vec![Some(t), flags_arg]);
        let id = self.names.unique(name);
        let decl = self.var(&id, call);
        self.hoisted.push(decl);
        self.templates.insert(key, id.clone());
        self.out.id(&id)
    }

    /// Upstream `process_children`.
    fn process_children(
        &mut self,
        items: &[Item<'_>],
        initial: Prev,
        is_element: bool,
        frag: &mut Frag,
        l: &mut Lists,
    ) -> R<()> {
        let mut st = Walk {
            prev: initial,
            skipped: 0,
        };
        let mut sequence: Vec<Item<'_>> = Vec::new();
        for item in items {
            if matches!(item, Item::Text { .. } | Item::Expr(_)) {
                sequence.push(item.clone());
                continue;
            }
            if !sequence.is_empty() {
                self.flush_sequence(&std::mem::take(&mut sequence), &mut st, frag, l);
            }
            let Item::Node(id) = item else {
                unreachable!("text is part of a sequence")
            };
            let id = *id;
            if self.is_static_element(id) {
                st.skipped += 1;
                self.visit(id, &st.prev_name(), frag, l)?;
            } else if is_element
                && items.len() == 1
                && matches!(self.hir.node(id).kind, NodeKind::Each(_))
            {
                // Upstream's `is_controlled`: the element is the block's anchor.
                self.each_block(id, &st.prev_name(), true, frag, l)?;
            } else {
                let name = match &self.hir.node(id).kind {
                    NodeKind::Element(el) => el.name.text(self.src).to_owned(),
                    _ => "node".to_owned(),
                };
                let node = self.flush_node(&mut st, false, &name, l);
                self.visit(id, &node, frag, l)?;
            }
        }
        if !sequence.is_empty() {
            self.flush_sequence(&sequence, &mut st, frag, l);
        }
        if st.skipped > 1 {
            st.skipped -= 1;
            let n = (st.skipped != 1).then(|| self.num(st.skipped));
            let call = self.call("next", vec![n]);
            l.init.push(self.stmt(call));
        }
        Ok(())
    }

    fn prev_expr(&mut self, prev: &Prev, is_text: bool) -> NodeId {
        match prev {
            Prev::Ident(name) => self.out.id(name),
            Prev::Call { method, of } => {
                let x = self.out.id(of);
                let t = is_text.then(|| self.tru());
                self.call(method, vec![Some(x), t])
            }
        }
    }

    fn get_node(&mut self, st: &Walk, is_text: bool) -> NodeId {
        if st.skipped == 0 {
            return self.prev_expr(&st.prev, is_text);
        }
        let p = self.prev_expr(&st.prev, false);
        let n = (is_text || st.skipped != 1).then(|| self.num(st.skipped));
        let t = is_text.then(|| self.tru());
        self.call("sibling", vec![Some(p), n, t])
    }

    fn flush_node(&mut self, st: &mut Walk, is_text: bool, name: &str, l: &mut Lists) -> String {
        let expression = self.get_node(st, is_text);
        let id = if let Kind::Ident(_) = self.out.kind(expression) {
            self.out.name(expression).to_owned()
        } else {
            let id = self.names.generate(name);
            let decl = self.var(&id, expression);
            l.init.push(decl);
            id
        };
        st.prev = Prev::Ident(id.clone());
        st.skipped = 1;
        id
    }

    fn flush_sequence(&mut self, seq: &[Item<'_>], st: &mut Walk, frag: &mut Frag, l: &mut Lists) {
        if seq.iter().all(|i| matches!(i, Item::Text { .. })) {
            st.skipped += 1;
            let raw: String = seq
                .iter()
                .map(|i| match i {
                    Item::Text { raw, .. } => raw.as_ref(),
                    _ => unreachable!("all text"),
                })
                .collect();
            frag.tpl.push_text(raw);
            return;
        }
        frag.tpl.push_text(" ".into());
        let (value, has_state) = self.template_chunk(seq, frag);
        let id = self.flush_node(st, seq.len() == 1, "text", l);
        let x = self.out.id(&id);
        if has_state {
            let call = self.call("set_text", vec![Some(x), Some(value)]);
            l.update.push(self.stmt(call));
        } else {
            let target = self.out.dot(x, "nodeValue");
            let assign = self
                .out
                .assign(AssignOp::Assign, target, value, Loc::SYNTHETIC);
            l.init.push(self.stmt(assign));
        }
    }

    /// Upstream `build_template_chunk`.
    fn template_chunk(&mut self, values: &[Item<'_>], frag: &mut Frag) -> (NodeId, bool) {
        let mut quasis: Vec<String> = vec![String::new()];
        let mut exprs: Vec<NodeId> = Vec::new();
        let mut has_state = false;
        for item in values {
            let expr = match item {
                Item::Text { data, .. } => {
                    quasis.last_mut().expect("never empty").push_str(data);
                    continue;
                }
                Item::Expr(e) => *e,
                Item::Node(_) => unreachable!("sequences hold text and expression tags"),
            };
            let js = self.js;
            match js.kind(expr) {
                Kind::Str | Kind::Num(_) | Kind::Bool(_) | Kind::Null => {
                    if !matches!(js.kind(expr), Kind::Null) {
                        let v = self.res.evaluate(js, self.src, expr).value.to_js_string();
                        quasis.last_mut().expect("never empty").push_str(&v);
                    }
                    continue;
                }
                Kind::Ident(_)
                    if js.name(expr) == "undefined" && self.res.binding(expr).is_none() =>
                {
                    continue;
                }
                _ => {}
            }
            let meta = self.an.meta(expr);
            let built = self.expr(expr);
            let mut value = self.memoize(frag, built, meta);
            let evaluated = self
                .res
                .evaluate_output(js, self.src, &self.out, value, self.scope);
            let known = evaluated.is_known.then_some(&evaluated);
            has_state |= meta.has_state && known.is_none();
            if values.len() == 1 {
                if let Some(k) = known {
                    let s = match &k.value {
                        crate::evaluate::Val::Null | crate::evaluate::Val::Undefined => {
                            String::new()
                        }
                        v => v.to_js_string(),
                    };
                    value = self.out.str(&s);
                }
                return (value, has_state);
            }
            if let Kind::Logical(op @ (LogicalOp::Nullish | LogicalOp::Or), l, r) =
                self.out.kind(value)
                && matches!(self.out.kind(r), Kind::Null)
            {
                let empty = self.out.str("");
                value = self.out.logical(op, l, empty, self.out.loc(value));
            }
            if let Some(k) = known {
                let s = match &k.value {
                    crate::evaluate::Val::Null | crate::evaluate::Val::Undefined => String::new(),
                    v => v.to_js_string(),
                };
                quasis.last_mut().expect("never empty").push_str(&s);
            } else {
                if !evaluated.is_defined {
                    let empty = self.out.str("");
                    value = self
                        .out
                        .logical(LogicalOp::Nullish, value, empty, Loc::SYNTHETIC);
                }
                exprs.push(value);
                quasis.push(String::new());
            }
        }
        if exprs.is_empty() {
            let s = quasis.pop().expect("never empty");
            return (self.out.str(&s), has_state);
        }
        let n = quasis.len();
        let elems: Vec<NodeId> = quasis
            .iter()
            .enumerate()
            .map(|(i, q)| {
                self.out
                    .template_elem(&sanitize_template_string(q), i + 1 == n)
            })
            .collect();
        (self.out.template(&elems, &exprs, Loc::SYNTHETIC), has_state)
    }

    fn visit(&mut self, id: HirId, node: &str, frag: &mut Frag, l: &mut Lists) -> R<()> {
        match self.hir.node(id).kind {
            NodeKind::Element(_) => self.element(id, node, frag, l),
            NodeKind::If { .. } => self.if_block(id, node, frag, l),
            NodeKind::Each(_) => self.each_block(id, node, false, frag, l),
            _ => unreachable!("clean_nodes keeps only elements and blocks as nodes"),
        }
    }

    /// Upstream `RegularElement`.
    fn element(&mut self, id: HirId, node: &str, frag: &mut Frag, l: &mut Lists) -> R<()> {
        let hir = self.hir;
        let NodeKind::Element(el) = &hir.node(id).kind else {
            unreachable!()
        };
        if el.kind != ElementKind::Regular {
            return unsupported("components, `<slot>` and `svelte:` elements", el.name);
        }
        let tag = el.name.text(self.src).to_ascii_lowercase();
        if matches!(
            tag.as_str(),
            "svg" | "math" | "script" | "select" | "option" | "textarea" | "template"
        ) || tag.contains('-')
        {
            return unsupported(&format!("`<{tag}>`"), el.name);
        }
        check_foreign_element(self.src, el.name)?;
        frag.tpl.push_element(&tag);
        if tag == "noscript" {
            frag.tpl.pop_element();
            return Ok(());
        }
        frag.tpl.needs_import_node |= tag == "video";

        let attr_list = hir.attrs(el.attrs);
        // Upstream visits directives into their own lists, which follow the children's.
        let mut directives = self.element_directives(attr_list, &tag, node)?;
        let has_spread = attr_list
            .iter()
            .any(|a| matches!(a.value, AttrValue::Spread(_)));
        // Upstream compares the name as written.
        let remove_defaults = el.name.text(self.src) == "input"
            && self.remove_input_defaults(attr_list, has_spread, node, l);
        if has_spread {
            self.attribute_effect(id, &tag, attr_list, node, remove_defaults, l);
        } else {
            self.element_attributes(id, attr_list, node, frag, l)?;
        }
        let load_error_events = attr_list.iter().any(|a| {
            !is_directive(&a.value) && matches!(a.name.text(self.src), "onload" | "onerror")
        });
        if is_load_error_element(&tag) && (has_spread || load_error_events) {
            let x = self.out.id(node);
            let call = self.call("replay_events", vec![Some(x)]);
            l.after.push(self.stmt(call));
        }

        let outer_preserve = self.preserve_ws;
        self.preserve_ws |= tag == "pre" || tag == "textarea";
        let children = self.element_children(id, &tag, node, frag);
        self.preserve_ws = outer_preserve;
        let mut child = children?;
        if self.an.dynamic[id] {
            l.init.append(&mut child.init);
            l.update.append(&mut child.update);
            l.after.append(&mut child.after);
        }
        l.init.append(&mut directives.init);
        l.after.append(&mut directives.after);
        frag.tpl.pop_element();
        Ok(())
    }

    /// The directives of upstream `RegularElement`'s `other_directives`, in attribute order.
    fn element_directives(&mut self, attrs: &[Attribute], tag: &str, node: &str) -> R<Lists> {
        let mut directives = Lists::default();
        for a in attrs {
            match a.value {
                AttrValue::Bind(_) => {
                    let call = self.binding(a, tag, attrs, node)?;
                    directives.after.push(self.stmt(call));
                }
                AttrValue::Attach(e) => {
                    let call = self.attach(e, node);
                    directives.init.push(self.stmt(call));
                }
                _ => {}
            }
        }
        Ok(directives)
    }

    /// Upstream's `$.remove_input_defaults` condition for an `<input>`; a binding is named by its
    /// property, so `bind:value` counts as a dynamic `value`. With a spread the runtime's
    /// `attribute_effect` removes them: returns whether it must.
    fn remove_input_defaults(
        &mut self,
        attrs: &[Attribute],
        has_spread: bool,
        node: &str,
        l: &mut Lists,
    ) -> bool {
        let src = self.src;
        let has_value = attrs.iter().any(|a| {
            matches!(a.name.text(src), "value" | "checked")
                && !matches!(a.value, AttrValue::Static(_) | AttrValue::Class(_))
        });
        let has_default_value = attrs.iter().any(|a| {
            !is_directive(&a.value) && matches!(a.name.text(src), "defaultValue" | "defaultChecked")
        });
        if has_default_value || !(has_spread || has_value) {
            return false;
        }
        if has_spread {
            return true;
        }
        let x = self.out.id(node);
        let call = self.call("remove_input_defaults", vec![Some(x)]);
        l.init.push(self.stmt(call));
        false
    }

    /// Upstream `build_attribute_effect`: every attribute and spread, in order, as one object the
    /// runtime diffs, with its own memoized values.
    fn attribute_effect(
        &mut self,
        id: HirId,
        tag: &str,
        attrs: &[Attribute],
        node: &str,
        remove_defaults: bool,
        l: &mut Lists,
    ) {
        let mut memo = Frag::default();
        let mut values = Vec::with_capacity(attrs.len());
        let mut class_directives = Vec::new();
        for a in attrs {
            match a.value {
                AttrValue::Bind(_) | AttrValue::Attach(_) => continue,
                AttrValue::Class(_) => {
                    class_directives.push(a);
                    continue;
                }
                AttrValue::Spread(e) => {
                    let meta = self.an.meta(e);
                    let built = self.expr(e);
                    let v = self.memoize(&mut memo, built, meta);
                    values.push(self.out.spread(v, Loc::SYNTHETIC));
                    continue;
                }
                _ => {}
            }
            let (value, _) = self.attribute_value(a, &mut memo);
            let raw_name = a.name.text(self.src);
            if event_attribute(self.src, a).is_some()
                && matches!(
                    self.out.kind(value),
                    Kind::Arrow { .. } | Kind::Function { .. }
                )
            {
                // A stable handler, so the runtime does not remove and re-add it on every update.
                let handler = self.names.generate("event_handler");
                l.init.push(self.var(&handler, value));
                let x = self.out.id(&handler);
                values.push(init_property(&mut self.out, raw_name, x));
            } else {
                let name = if tag == "select" && normalize_attribute(raw_name) == "defaultValue" {
                    "defaultValue"
                } else {
                    raw_name
                };
                values.push(init_property(&mut self.out, name, value));
            }
        }
        if !class_directives.is_empty() {
            let props: Vec<NodeId> = class_directives
                .iter()
                .map(|d| {
                    let AttrValue::Class(e) = d.value else {
                        unreachable!("class directives")
                    };
                    let meta = self.an.meta(e);
                    let built = self.expr(e);
                    let v = self.memoize(&mut memo, built, meta);
                    init_property(&mut self.out, d.name.text(self.src), v)
                })
                .collect();
            let object = self.out.object(&props, Loc::SYNTHETIC);
            let ns = self.out.id("$");
            let key = self.out.dot(ns, "CLASS");
            values.push(
                self.out
                    .property(key, object, flag::COMPUTED, Loc::SYNTHETIC),
            );
        }
        let ids: Vec<NodeId> = (0..memo.memo.len())
            .map(|i| self.out.id(&format!("${i}")))
            .collect();
        let object = self.out.object(&values, Loc::SYNTHETIC);
        let arrow = self.out.arrow(&ids, object, true, false, Loc::SYNTHETIC);
        let sync = (!memo.memo.is_empty()).then(|| {
            let thunks: Vec<NodeId> = std::mem::take(&mut memo.memo)
                .into_iter()
                .map(|m| self.out.arrow(&[], m, true, false, Loc::SYNTHETIC))
                .collect();
            self.out.array(&thunks, Loc::SYNTHETIC)
        });
        let hash = if self.an.scoped[id] {
            self.an.css_hash.clone()
        } else {
            None
        };
        let hash = hash.map(|h| self.out.str(&h));
        let remove = remove_defaults.then(|| self.tru());
        let x = self.out.id(node);
        let call = self.call(
            "attribute_effect",
            vec![Some(x), Some(arrow), sync, None, None, hash, remove],
        );
        l.init.push(self.stmt(call));
    }

    /// The attribute loop of upstream `RegularElement` (no spread).
    fn element_attributes(
        &mut self,
        id: HirId,
        attrs: &[Attribute],
        node: &str,
        frag: &mut Frag,
        l: &mut Lists,
    ) -> R<()> {
        let class_directives: Vec<&Attribute> = attrs
            .iter()
            .filter(|a| matches!(a.value, AttrValue::Class(_)))
            .collect();
        for a in attrs {
            if let AttrValue::Bind(_) | AttrValue::Attach(_) | AttrValue::Class(_) = a.value {
                continue;
            }
            let raw_name = a.name.text(self.src);
            if let Some(handler) = event_attribute(self.src, a) {
                self.event(raw_name, handler, node, l);
                continue;
            }
            let attr_name = normalize_attribute(raw_name);
            let literal = match &a.value {
                AttrValue::Boolean => Some(None),
                AttrValue::Static(v) => Some(Some(v.to_string())),
                _ => None,
            };
            if !super::cannot_be_set_statically(raw_name)
                && (attr_name != "class" || class_directives.is_empty())
                && let Some(value) = literal
            {
                self.static_attribute(frag, id, raw_name, &attr_name, value);
            } else if attr_name == "class" {
                self.set_class(id, node, Some(a), &class_directives, frag, l);
            } else if attr_name == "autofocus" || attr_name == "style" {
                return unsupported(&format!("a dynamic `{attr_name}` attribute"), a.span);
            } else {
                let (value, has_state) = self.attribute_value(a, frag);
                let update = self.attribute_update(node, &attr_name, value);
                let s = self.stmt(update);
                if has_state {
                    l.update.push(s);
                } else {
                    l.init.push(s);
                }
            }
        }
        // Upstream's analysis appends `class=""` to such an element.
        let has_class = attrs.iter().any(|a| {
            !matches!(a.value, AttrValue::Class(_))
                && a.name.text(self.src).eq_ignore_ascii_case("class")
        });
        if !has_class && !class_directives.is_empty() {
            self.set_class(id, node, None, &class_directives, frag, l);
        } else if !has_class && self.an.scoped[id] {
            self.static_attribute(frag, id, "class", "class", Some(String::new()));
        }
        Ok(())
    }

    /// A `class` value written as one expression, through `$.clsx` when upstream's `needs_clsx`.
    fn class_expression(
        &mut self,
        expr: NodeId,
        unquoted: bool,
        frag: &mut Frag,
    ) -> (NodeId, bool) {
        let meta = self.an.meta(expr);
        let mut built = self.expr(expr);
        if unquoted && needs_clsx(self.js, expr) {
            built = self.call("clsx", vec![Some(built)]);
        }
        (self.memoize(frag, built, meta), meta.has_state)
    }

    /// Upstream `build_set_class`; `attr` is `None` for the empty `class` upstream's analysis adds.
    fn set_class(
        &mut self,
        id: HirId,
        node: &str,
        attr: Option<&Attribute>,
        directives: &[&Attribute],
        frag: &mut Frag,
        l: &mut Lists,
    ) {
        let (mut value, mut has_state) = match attr.map(|a| &a.value) {
            None => (self.out.str(""), false),
            Some(&AttrValue::Expression { expr, quoted }) => {
                self.class_expression(expr, !quoted, frag)
            }
            Some(&AttrValue::Shorthand(expr)) => self.class_expression(expr, true, frag),
            Some(_) => self.attribute_value(attr.expect("matched above"), frag),
        };
        let mut prev = None;
        let mut next = None;
        let mut previous_id = None;
        if !directives.is_empty() {
            let mut props = Vec::with_capacity(directives.len());
            for d in directives {
                let AttrValue::Class(e) = d.value else {
                    unreachable!("class directives")
                };
                let meta = self.an.meta(e);
                let built = self.expr(e);
                let v = self.memoize(frag, built, meta);
                has_state |= meta.has_state;
                props.push(init_property(&mut self.out, d.name.text(self.src), v));
            }
            next = Some(self.out.object(&props, Loc::SYNTHETIC));
            if has_state {
                let name = self.names.generate("classes");
                let x = self.out.id(&name);
                l.init.push(self.out.let_(flag::LET, x, None));
                prev = Some(self.out.id(&name));
                previous_id = Some(name);
            } else {
                prev = Some(self.out.object(&[], Loc::SYNTHETIC));
            }
        }
        let mut css_hash = None;
        if self.an.scoped[id]
            && let Some(hash) = self.an.css_hash.clone()
        {
            let literal = match self.out.kind(value) {
                Kind::Str => Some(self.out.str_value(value, self.src).to_owned()),
                Kind::Null => Some(String::new()),
                _ => None,
            };
            match literal {
                Some(v) if v.is_empty() => value = self.out.str(&hash),
                Some(v) => value = self.out.str(&format!("{} {hash}", escape_html(&v, true))),
                None => css_hash = Some(self.out.str(&hash)),
            }
        }
        if css_hash.is_none() && next.is_some() {
            css_hash = Some(self.out.null(Loc::SYNTHETIC));
        }
        let x = self.out.id(node);
        let is_html = self.num(1);
        let mut set_class = self.call(
            "set_class",
            vec![Some(x), Some(is_html), Some(value), css_hash, prev, next],
        );
        if let Some(name) = previous_id {
            let target = self.out.id(&name);
            set_class = self
                .out
                .assign(AssignOp::Assign, target, set_class, Loc::SYNTHETIC);
        }
        let s = self.stmt(set_class);
        if has_state {
            l.update.push(s);
        } else {
            l.init.push(s);
        }
    }

    /// The children half of upstream `RegularElement`, under the element's whitespace rule.
    fn element_children(&mut self, id: HirId, tag: &str, node: &str, frag: &mut Frag) -> R<Lists> {
        let hir = self.hir;
        let NodeKind::Element(el) = &hir.node(id).kind else {
            unreachable!()
        };
        let cleaned = clean_nodes(
            hir,
            self.src,
            Parent::Element(tag),
            hir.children(el.children),
            self.preserve_ws,
        );
        let items = cleaned.items;
        let mut child = Lists::default();
        let use_text_content = items.iter().all(|i| match i {
            Item::Text { .. } => true,
            Item::Expr(e) => !self.an.meta(*e).has_state,
            Item::Node(_) => false,
        }) && items.iter().any(|i| matches!(i, Item::Expr(_)));
        if use_text_content {
            let (value, _) = self.template_chunk(&items, frag);
            let empty = matches!(self.out.kind(value), Kind::Str)
                && self.out.str_value(value, self.src).is_empty();
            if !empty {
                let x = self.out.id(node);
                let target = self.out.dot(x, "textContent");
                let assign = self
                    .out
                    .assign(AssignOp::Assign, target, value, Loc::SYNTHETIC);
                child.init.push(self.stmt(assign));
            }
        } else {
            let needs_reset = items.iter().any(|i| match i {
                Item::Text { .. } => false,
                Item::Expr(_) => true,
                Item::Node(n) => !self.is_static_element(*n),
            });
            self.process_children(
                &items,
                Prev::Call {
                    method: "child",
                    of: node.to_owned(),
                },
                true,
                frag,
                &mut child,
            )?;
            if needs_reset && !self.fold_reset_into_child(&mut child.init, node) {
                let x = self.out.id(node);
                let call = self.call("reset", vec![Some(x)]);
                child.init.push(self.stmt(call));
            }
        }
        Ok(child)
    }

    /// Upstream `BindDirective` (client, non-dev) for the bindings [`check_binding`] admits.
    fn binding(&mut self, a: &Attribute, tag: &str, attrs: &[Attribute], node: &str) -> R<NodeId> {
        let e = check_binding(self.js, self.res, self.src, tag, attrs, a)?;
        let get = self.expr(e);
        let get = self.thunk(get);
        let value = self.out.id("$$value");
        let assignment = if let Kind::Ident(_) = self.js.kind(e) {
            // An element binding's value is a primitive: upstream never proxies it.
            let x = self.out.ident(self.js.name(e), self.js.loc(e));
            self.out.runtime("$", "set", &[x, value])
        } else {
            let target = self.expr(e);
            self.out
                .assign(AssignOp::Assign, target, value, Loc::SYNTHETIC)
        };
        let param = self.out.id("$$value");
        let set = self
            .out
            .arrow(&[param], assignment, true, false, Loc::SYNTHETIC);
        let set = self.unthunk(set);
        let x = self.out.id(node);
        let method = match a.name.text(self.src) {
            "value" => "bind_value",
            "checked" => "bind_checked",
            p => unreachable!("`check_binding` admits no `bind:{p}`"),
        };
        Ok(self.call(method, vec![Some(x), Some(get), Some(set)]))
    }

    /// Upstream `AttachTag` (client).
    fn attach(&mut self, e: NodeId, node: &str) -> NodeId {
        let value = self.expr(e);
        let thunk = self.thunk(value);
        let x = self.out.id(node);
        self.call("attach", vec![Some(x), Some(thunk)])
    }

    fn static_attribute(
        &self,
        frag: &mut Frag,
        id: HirId,
        raw_name: &str,
        attr_name: &str,
        value: Option<String>,
    ) {
        let mut value = value;
        if attr_name == "class"
            && self.an.scoped[id]
            && let Some(hash) = &self.an.css_hash
        {
            value = Some(match value.as_deref() {
                None | Some("") => hash.clone(),
                Some(v) => format!("{v} {hash}"),
            });
        }
        if attr_name != "class"
            || value.as_deref().is_some_and(|v| !v.is_empty())
            || value.is_none()
        {
            frag.tpl.set_prop(raw_name, Some(value.unwrap_or_default()));
        }
    }

    /// Upstream `build_attribute_value` (client).
    fn attribute_value(&mut self, a: &Attribute, frag: &mut Frag) -> (NodeId, bool) {
        match &a.value {
            AttrValue::Boolean => (self.tru(), false),
            AttrValue::Static(v) => (self.out.str(v), false),
            &(AttrValue::Expression { expr, .. } | AttrValue::Shorthand(expr)) => {
                let meta = self.an.meta(expr);
                let built = self.expr(expr);
                (self.memoize(frag, built, meta), meta.has_state)
            }
            AttrValue::Interpolated(parts) => {
                let items = self.chunk_items(parts);
                self.template_chunk(&items, frag)
            }
            AttrValue::Bind(_)
            | AttrValue::Attach(_)
            | AttrValue::Class(_)
            | AttrValue::Spread(_) => {
                unreachable!("directives are lowered by `element`")
            }
        }
    }

    fn chunk_items(&self, parts: &[Part]) -> Vec<Item<'a>> {
        parts
            .iter()
            .map(|p| match p {
                Part::Text(s) => {
                    let raw = s.text(self.src);
                    Item::Text {
                        data: decode_text(raw),
                        raw: raw.into(),
                    }
                }
                Part::Expr { expr, .. } => Item::Expr(*expr),
            })
            .collect()
    }

    /// Upstream `build_element_attribute_update`.
    fn attribute_update(&mut self, node: &str, name: &str, value: NodeId) -> NodeId {
        let x = self.out.id(node);
        match name {
            "muted" => {
                let target = self.out.dot(x, "muted");
                self.out
                    .assign(AssignOp::Assign, target, value, Loc::SYNTHETIC)
            }
            "value" => self.call("set_value", vec![Some(x), Some(value)]),
            "checked" => self.call("set_checked", vec![Some(x), Some(value)]),
            "selected" => self.call("set_selected", vec![Some(x), Some(value)]),
            _ if super::is_dom_property(name) => {
                let target = self.out.dot(x, name);
                self.out
                    .assign(AssignOp::Assign, target, value, Loc::SYNTHETIC)
            }
            _ => {
                let method = if name.starts_with("xlink") {
                    "set_xlink_attribute"
                } else {
                    "set_attribute"
                };
                let n = self.out.str(name);
                self.call(method, vec![Some(x), Some(n), Some(value)])
            }
        }
    }

    /// Upstream `fold_reset_into_child`: `var x = $.child(el)` + `$.reset(el)` →
    /// `$.only_child(el)`.
    fn fold_reset_into_child(&mut self, init: &mut [NodeId], node: &str) -> bool {
        let Some(&last) = init.last() else {
            return false;
        };
        let Kind::VarDecl { decls: [d], kind } = self.out.kind(last) else {
            return false;
        };
        let d = *d;
        let Kind::Declarator {
            id,
            init: Some(call),
        } = self.out.kind(d)
        else {
            return false;
        };
        let Kind::Call { callee, args, .. } = self.out.kind(call) else {
            return false;
        };
        let is_child = matches!(
            self.out.kind(callee),
            Kind::Member { object, property, computed: false, .. }
                if self.out.name(object) == "$" && self.out.name(property) == "child"
        );
        let first_is_node = args.first().is_some_and(|&a| {
            matches!(self.out.kind(a), Kind::Ident(_)) && self.out.name(a) == node
        });
        if !is_child || !first_is_node {
            return false;
        }
        let args = args.to_vec();
        let new_call = self.out.runtime("$", "only_child", &args);
        let decl = self.out.declarator(id, Some(new_call), Loc::SYNTHETIC);
        let var = self.out.var_decl(kind, &[decl], Loc::SYNTHETIC);
        *init.last_mut().expect("checked above") = var;
        true
    }

    /// Upstream `visit_event_attribute` + `build_event` + `build_event_handler` (non-dev).
    fn event(&mut self, raw_name: &str, handler: NodeId, node: &str, l: &mut Lists) {
        let mut event_name = &raw_name[2..];
        let capture = if event_name.ends_with("capture")
            && event_name != "gotpointercapture"
            && event_name != "lostpointercapture"
        {
            event_name = &event_name[..event_name.len() - 7];
            true
        } else {
            false
        };
        let meta = self.an.meta(handler);
        let built = self.expr(handler);
        let handler_expr = match self.js.kind(handler) {
            Kind::Arrow { .. } | Kind::Function { decl: false, .. } => built,
            Kind::Ident(_)
                if self.res.binding(handler).is_none_or(|(b, _)| {
                    self.res.sem.bindings[b].kind != rsv_js::scope::DeclKind::Import
                }) =>
            {
                built
            }
            _ => {
                let mut h = built;
                if meta.has_call {
                    let id = self.names.generate("event_handler");
                    let thunk = self.out.arrow(&[], h, true, false, Loc::SYNTHETIC);
                    let derived = self.call("derived", vec![Some(thunk)]);
                    l.init.push(self.var(&id, derived));
                    let x = self.out.id(&id);
                    h = self.call("get", vec![Some(x)]);
                }
                let apply = self.out.ident("apply", Loc::SYNTHETIC);
                let member = self.out.member(h, apply, false, true, Loc::SYNTHETIC);
                let this = self.out.this(Loc::SYNTHETIC);
                let args = self.out.id("$$args");
                let call = self.out.call(member, &[this, args], false, Loc::SYNTHETIC);
                let s = self.stmt(call);
                let body = self.out.block(&[s], Loc::SYNTHETIC);
                let rest_id = self.out.id("$$args");
                let rest = self.out.rest(rest_id, Loc::SYNTHETIC);
                self.out
                    .function(false, None, &[rest], body, false, Loc::SYNTHETIC)
            }
        };
        let delegated = DELEGATED_EVENTS.contains(&event_name);
        if delegated && !self.events.iter().any(|e| e == event_name) {
            self.events.push(event_name.to_owned());
        }
        let name = self.out.str(event_name);
        let x = self.out.id(node);
        let cap = capture.then(|| self.tru());
        let passive = PASSIVE_EVENTS.contains(&event_name).then(|| self.tru());
        let call = self.call(
            if delegated { "delegated" } else { "event" },
            vec![Some(name), Some(x), Some(handler_expr), cap, passive],
        );
        l.after.push(self.stmt(call));
    }

    /// Upstream `IfBlock` (client), with `{:else if}` chains flattened.
    fn if_block(&mut self, id: HirId, node: &str, frag: &mut Frag, l: &mut Lists) -> R<()> {
        frag.tpl.push_comment();
        let hir = self.hir;
        let NodeKind::If {
            branches,
            otherwise,
        } = hir.node(id).kind
        else {
            unreachable!()
        };
        let mut statements = Vec::new();
        let mut tests_and_renders: Vec<(NodeId, NodeId)> = Vec::new();
        for (index, b) in hir.branches(branches).iter().enumerate() {
            let test = b.test;
            let body = self.fragment(Parent::Block, hir.children(b.body))?;
            let cid = self.names.generate("consequent");
            let arrow = self.anchor_arrow(&body);
            statements.push(self.var(&cid, arrow));
            let meta = self.an.meta(test);
            let mut t = self.expr(test);
            if meta.has_call {
                let d = self.names.generate("d");
                let thunk = self.out.arrow(&[], t, true, false, Loc::SYNTHETIC);
                let derived = self.call("derived", vec![Some(thunk)]);
                statements.push(self.var(&d, derived));
                let x = self.out.id(&d);
                t = self.call("get", vec![Some(x)]);
            }
            let render = self.out.id("$$render");
            let c = self.out.id(&cid);
            let idx = (index != 0).then(|| self.num(index as u32));
            let mut args = vec![c];
            args.extend(idx);
            let call = self.out.call(render, &args, false, Loc::SYNTHETIC);
            tests_and_renders.push((t, self.out.expr_stmt(call)));
        }
        let else_stmt = if let Some(o) = otherwise {
            let body = self.fragment(Parent::Block, hir.children(o))?;
            let aid = self.names.generate("alternate");
            let arrow = self.anchor_arrow(&body);
            statements.push(self.var(&aid, arrow));
            let render = self.out.id("$$render");
            let x = self.out.id(&aid);
            let minus = self.out.num(-1.0, Loc::SYNTHETIC);
            let call = self.out.call(render, &[x, minus], false, Loc::SYNTHETIC);
            Some(self.out.expr_stmt(call))
        } else {
            None
        };
        let mut chain = else_stmt;
        for (t, r) in tests_and_renders.into_iter().rev() {
            chain = Some(self.out.if_(t, r, chain, Loc::SYNTHETIC));
        }
        let inner = self
            .out
            .block(&chain.into_iter().collect::<Vec<_>>(), Loc::SYNTHETIC);
        let render_param = self.out.id("$$render");
        let f = self
            .out
            .arrow(&[render_param], inner, false, false, Loc::SYNTHETIC);
        let x = self.out.id(node);
        // Upstream's third argument marks a nested `{:else if}` block; a chain is one node here.
        let call = self.call("if", vec![Some(x), Some(f)]);
        statements.push(self.stmt(call));
        l.init.push(self.out.block(&statements, Loc::SYNTHETIC));
        Ok(())
    }

    /// Upstream `EachBlock` (client, runes mode) for a block whose context is an identifier.
    #[expect(
        clippy::too_many_lines,
        reason = "ports upstream's `EachBlock` visitor in one piece"
    )]
    fn each_block(
        &mut self,
        id: HirId,
        node: &str,
        controlled: bool,
        frag: &mut Frag,
        l: &mut Lists,
    ) -> R<()> {
        let (hir, js, res) = (self.hir, self.js, self.res);
        let NodeKind::Each(each) = &hir.node(id).kind else {
            unreachable!()
        };
        let context = each.context().expect("the parser requires `as`");
        if !matches!(js.kind(context), Kind::Ident(_)) {
            let span = js.loc(context).span().expect("parsed from source");
            return unsupported("a destructuring `{#each}` context", span);
        }
        let collection = self.expr(each.collection);
        if !controlled {
            frag.tpl.push_comment();
        }
        let keyed = each.keyed(js);
        let mut flags = 0;
        if keyed && each.index().is_some() {
            flags |= EACH_INDEX_REACTIVE;
        }
        let key_is_item = each.key().is_some_and(|k| {
            matches!(js.kind(k), Kind::Ident(_)) && js.atom(k) == js.atom(context)
        });
        if !key_is_item && has_dependency(js, res, each.collection) {
            flags |= EACH_ITEM_REACTIVE;
        }
        flags |= EACH_ITEM_IMMUTABLE;
        if controlled {
            flags |= EACH_IS_CONTROLLED;
        }

        let item = res.sem.binding_of(context);
        let index = each.index().and_then(|i| res.sem.binding_of(i));
        let shadows = [item, index].into_iter().flatten().any(|b| {
            let s = &res.sem.bindings[b];
            res.sem.scopes[s.scope]
                .parent
                .is_some_and(|p| res.sem.lookup(p, s.name).is_some())
        });
        let collection_id = shadows.then(|| self.names.unique("$$array"));
        let index_name = each
            .index()
            .map_or_else(|| self.each_index[&id].clone(), |i| js.name(i).to_owned());

        let key_span = each.key().and_then(|k| js.loc(k).span());
        let in_key = |n: NodeId| {
            let at = js.loc(n).span();
            key_span.is_some_and(|k| at.is_some_and(|a| k.lo <= a.lo && a.hi <= k.hi))
        };
        let (mut uses_index, mut key_uses_index) = (false, false);
        if let Some(b) = index {
            for r in res.sem.references_to(b) {
                if in_key(r.node) {
                    key_uses_index = true;
                } else {
                    uses_index = true;
                }
            }
        }
        // Upstream's `assign` and `mutate` transforms of the item set `uses_index`.
        if let Some(b) = item {
            let s = &res.sem.bindings[b];
            uses_index |= s.writes > 0 || s.mutations > 0;
        }

        if let Some(b) = item {
            self.each.insert(b, flags & EACH_ITEM_REACTIVE != 0);
        }
        if let Some(b) = index {
            self.each.insert(b, flags & EACH_INDEX_REACTIVE != 0);
        }
        let outer = self.scope;
        self.scope = res
            .sem
            .scope_of(context)
            .expect("an `{#each}` context opens a scope");
        let body = self.fragment(Parent::Each, hir.children(each.body));
        self.scope = outer;
        let body = body?;

        let key_function = if keyed {
            for b in [item, index].into_iter().flatten() {
                self.each.insert(b, false);
            }
            let pattern = self.out.ident(js.name(context), js.loc(context));
            let key = self.expr(each.key().expect("a keyed block has a key"));
            let mut params = vec![pattern];
            if key_uses_index {
                params.push(self.out.id(&index_name));
            }
            self.out.arrow(&params, key, true, false, Loc::SYNTHETIC)
        } else {
            let ns = self.out.id("$");
            self.out.dot(ns, "index")
        };
        for b in [item, index].into_iter().flatten() {
            self.each.remove(&b);
        }

        let thunk = self.thunk(collection);
        let mut render_args = vec![
            self.out.id("$$anchor"),
            self.out.ident(js.name(context), js.loc(context)),
        ];
        if uses_index || collection_id.is_some() {
            render_args.push(self.out.id(&index_name));
        }
        if let Some(c) = &collection_id {
            render_args.push(self.out.id(c));
        }
        let block = self.out.block(&body, Loc::SYNTHETIC);
        let render = self
            .out
            .arrow(&render_args, block, false, false, Loc::SYNTHETIC);
        let x = self.out.id(node);
        let flags = self.num(flags);
        let mut args = vec![
            Some(x),
            Some(flags),
            Some(thunk),
            Some(key_function),
            Some(render),
        ];
        if let Some(f) = each.fallback {
            let fallback = self.fragment(Parent::Each, hir.children(f))?;
            args.push(Some(self.anchor_arrow(&fallback)));
        }
        let call = self.call("each", args);
        l.init.push(self.stmt(call));
        Ok(())
    }

    fn anchor_arrow(&mut self, body: &[NodeId]) -> NodeId {
        let block = self.out.block(body, Loc::SYNTHETIC);
        let anchor = self.out.id("$$anchor");
        self.out
            .arrow(&[anchor], block, false, false, Loc::SYNTHETIC)
    }
}

/// `b.call` for `$.method(…)`: trailing missing arguments are dropped, inner ones are `void 0`.
pub(super) fn runtime_call(out: &mut Ast, method: &str, args: Vec<Option<NodeId>>) -> NodeId {
    let mut args = args;
    while matches!(args.last(), Some(None)) {
        args.pop();
    }
    let args: Vec<NodeId> = args
        .into_iter()
        .map(|a| {
            a.unwrap_or_else(|| {
                let zero = out.num(0.0, Loc::SYNTHETIC);
                out.unary(UnaryOp::Void, zero, Loc::SYNTHETIC)
            })
        })
        .collect();
    out.runtime("$", method, &args)
}

/// `b.init(name, value)` as esrap prints it: an identifier key when `name` is one, a string key
/// otherwise, and the shorthand `{ name }` when the value is that identifier.
pub(super) fn init_property(out: &mut Ast, name: &str, value: NodeId) -> NodeId {
    if !is_valid_identifier(name) {
        let key = out.str(name);
        return out.property(key, value, 0, Loc::SYNTHETIC);
    }
    let key = out.id(name);
    let shorthand = matches!(out.kind(value), Kind::Ident(_)) && out.name(value) == name;
    out.property(
        key,
        value,
        if shorthand { flag::SHORTHAND } else { 0 },
        Loc::SYNTHETIC,
    )
}

/// Upstream `regex_is_valid_identifier`: `/^[a-zA-Z_$][a-zA-Z_$0-9]*$/`.
fn is_valid_identifier(name: &str) -> bool {
    let mut chars = name.chars();
    chars
        .next()
        .is_some_and(|c| c.is_ascii_alphabetic() || c == '_' || c == '$')
        && chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
}

struct Walk {
    prev: Prev,
    skipped: u32,
}

impl Walk {
    /// The node a static element would be visited with (upstream passes the parent's state).
    fn prev_name(&self) -> String {
        match &self.prev {
            Prev::Ident(n) => n.clone(),
            Prev::Call { of, .. } => of.clone(),
        }
    }
}
