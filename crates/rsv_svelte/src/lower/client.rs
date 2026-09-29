//! Client lowering: a DOM template per fragment plus the statements that walk it and keep it up to
//! date. Mirrors upstream `3-transform/client` (Fragment, RegularElement, IfBlock, shared/fragment).

use super::names::Names;
use super::script::{ScriptRewrite, lower_instance};
use super::{
    Item, Parent, Target, clean_nodes, escape_html, event_attribute, sanitize_template_string,
};
use crate::analyze::{Analysis, ExprMeta};
use crate::ast::{AttrValue, Component, Part, TId, TNode, decode_text};
use crate::parse::is_void;
use crate::resolve::Resolution;
use rsv_js::ast::flag;
use rsv_js::copy::copy;
use rsv_js::ops::{AssignOp, LogicalOp};
use rsv_js::{Ast, Kind, NodeId};
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::source::{Loc, Span};
use rustc_hash::FxHashMap;

const TEMPLATE_FRAGMENT: u32 = 1;
const TEMPLATE_USE_IMPORT_NODE: u32 = 2;
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
    c: &'a Component,
    src: &'a str,
    res: &'a Resolution,
    an: &'a Analysis,
    out: Ast,
    names: Names,
    hoisted: Vec<NodeId>,
    templates: FxHashMap<String, String>,
    events: Vec<String>,
}

pub fn lower(c: &Component, src: &str, res: &Resolution, an: &Analysis) -> R<(Ast, NodeId)> {
    let declared = res.sem.bindings.iter().map(|b| c.js.atoms.get(b.name));
    let referenced = res.sem.references.iter().map(|r| c.js.name(r.node));
    let mut cx = Cx {
        c,
        src,
        res,
        an,
        out: Ast::new(),
        names: Names::new(declared, referenced),
        hoisted: Vec::new(),
        templates: FxHashMap::default(),
        events: Vec::new(),
    };
    let mut rw = ScriptRewrite {
        target: Target::Client,
        res,
    };
    let instance = lower_instance(&c.js, &mut cx.out, &mut rw, c.program, &mut cx.hoisted)?;
    let template = cx.fragment(Parent::Root, c.children(c.root))?;

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
        };
        copy(&self.c.js, &mut self.out, &mut rw, e)
    }

    /// `b.call` drops trailing missing arguments and turns inner ones into `undefined`.
    fn call(&mut self, method: &str, args: Vec<Option<NodeId>>) -> NodeId {
        let mut args = args;
        while matches!(args.last(), Some(None)) {
            args.pop();
        }
        let args: Vec<NodeId> = args
            .into_iter()
            .map(|a| a.unwrap_or_else(|| self.out.id("undefined")))
            .collect();
        self.out.runtime("$", method, &args)
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

    fn is_static_element(&self, id: TId) -> bool {
        let TNode::Element { name, attrs, .. } = self.c.node(id) else {
            return false;
        };
        if self.an.dynamic[id as usize] {
            return false;
        }
        let tag = name.text(self.src);
        if tag.contains('-') {
            return false;
        }
        for a in self.c.attrs(*attrs) {
            let n = a.name.text(self.src);
            if event_attribute(self.c, self.src, a).is_some()
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
            if !matches!(a.value, AttrValue::True) && self.text_attribute(a).is_none() {
                return false;
            }
        }
        true
    }

    /// Upstream `is_text_attribute`: exactly one text chunk.
    fn text_attribute(&self, a: &crate::ast::Attr) -> Option<Span> {
        match a.value {
            AttrValue::Parts(r) => match self.c.parts(r) {
                [Part::Text(s)] => Some(*s),
                _ => None,
            },
            AttrValue::True => None,
        }
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
    fn fragment(&mut self, parent: Parent, list: &[TId]) -> R<Vec<NodeId>> {
        let cleaned = clean_nodes(self.c, self.src, parent, list, false);
        let items = cleaned.items;
        if items.is_empty() {
            return Ok(Vec::new());
        }
        let mut frag = Frag::default();
        let mut l = Lists::default();
        let close;

        let single_element = match items.as_slice() {
            [Item::Node(id)] if matches!(self.c.node(*id), TNode::Element { .. }) => Some(*id),
            _ => None,
        };
        if let Some(el) = single_element {
            let TNode::Element { name, .. } = self.c.node(el) else {
                unreachable!()
            };
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
                self.process_children(&items, Prev::Ident(text.clone()), &mut frag, &mut l)?;
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
            let effect = self.render_statement(&mut frag, std::mem::take(&mut l.update));
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
    fn render_statement(&mut self, frag: &mut Frag, update: Vec<NodeId>) -> NodeId {
        let ids: Vec<NodeId> = (0..frag.memo.len())
            .map(|i| self.out.id(&format!("${i}")))
            .collect();
        let single = match update.as_slice() {
            [s] => match self.out.kind(*s) {
                Kind::ExprStmt(e) => Some(e),
                _ => None,
            },
            _ => None,
        };
        let body = match single {
            Some(e) => self.out.arrow(&ids, e, true, false, Loc::SYNTHETIC),
            None => {
                let b = self.out.block(&update, Loc::SYNTHETIC);
                self.out.arrow(&ids, b, false, false, Loc::SYNTHETIC)
            }
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
        items: &[Item],
        initial: Prev,
        frag: &mut Frag,
        l: &mut Lists,
    ) -> R<()> {
        let mut st = Walk {
            prev: initial,
            skipped: 0,
        };
        let mut sequence: Vec<Item> = Vec::new();
        for item in items {
            if matches!(item, Item::Text { .. } | Item::Expr(_)) {
                sequence.push(item.clone());
                continue;
            }
            if !sequence.is_empty() {
                self.flush_sequence(&std::mem::take(&mut sequence), &mut st, frag, l)?;
            }
            let Item::Node(id) = item else {
                unreachable!("text is part of a sequence")
            };
            let id = *id;
            if self.is_static_element(id) {
                st.skipped += 1;
                self.visit(id, &st.prev_name(), frag, l)?;
            } else {
                let name = match self.c.node(id) {
                    TNode::Element { name, .. } => name.text(self.src).to_owned(),
                    _ => "node".to_owned(),
                };
                let node = self.flush_node(&mut st, false, &name, l);
                self.visit(id, &node, frag, l)?;
            }
        }
        if !sequence.is_empty() {
            self.flush_sequence(&sequence, &mut st, frag, l)?;
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
        let id = match self.out.kind(expression) {
            Kind::Ident(_) => self.out.name(expression).to_owned(),
            _ => {
                let id = self.names.generate(name);
                let decl = self.var(&id, expression);
                l.init.push(decl);
                id
            }
        };
        st.prev = Prev::Ident(id.clone());
        st.skipped = 1;
        id
    }

    fn flush_sequence(
        &mut self,
        seq: &[Item],
        st: &mut Walk,
        frag: &mut Frag,
        l: &mut Lists,
    ) -> R<()> {
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
            return Ok(());
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
        Ok(())
    }

    /// Upstream `build_template_chunk`.
    fn template_chunk(&mut self, values: &[Item], frag: &mut Frag) -> (NodeId, bool) {
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
            let js = &self.c.js;
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
            let evaluated = self.res.evaluate_output(js, self.src, &self.out, value);
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
            match known {
                Some(k) => {
                    let s = match &k.value {
                        crate::evaluate::Val::Null | crate::evaluate::Val::Undefined => {
                            String::new()
                        }
                        v => v.to_js_string(),
                    };
                    quasis.last_mut().expect("never empty").push_str(&s);
                }
                None => {
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

    fn visit(&mut self, id: TId, node: &str, frag: &mut Frag, l: &mut Lists) -> R<()> {
        match self.c.node(id) {
            TNode::Element { .. } => self.element(id, node, frag, l),
            TNode::If { .. } => self.if_block(id, node, frag, l),
            _ => unreachable!("clean_nodes keeps only elements and blocks as nodes"),
        }
    }

    /// Upstream `RegularElement`.
    fn element(&mut self, id: TId, node: &str, frag: &mut Frag, l: &mut Lists) -> R<()> {
        let TNode::Element {
            name,
            attrs,
            children,
            ..
        } = self.c.node(id)
        else {
            unreachable!()
        };
        let tag = name.text(self.src).to_ascii_lowercase();
        if matches!(
            tag.as_str(),
            "svg" | "math" | "script" | "select" | "option" | "textarea" | "template"
        ) || tag.contains('-')
        {
            return unsupported(&format!("`<{tag}>`"), *name);
        }
        frag.tpl.push_element(&tag);
        if tag == "noscript" {
            frag.tpl.pop_element();
            return Ok(());
        }
        frag.tpl.needs_import_node |= tag == "video";

        let attr_list = self.c.attrs(*attrs);
        let has_class = attr_list
            .iter()
            .any(|a| a.name.text(self.src).eq_ignore_ascii_case("class"));
        let synthetic_class = !has_class && self.an.scoped[id as usize];

        for a in attr_list {
            let raw_name = a.name.text(self.src);
            if let Some(handler) = event_attribute(self.c, self.src, a) {
                self.event(raw_name, handler, node, l);
                continue;
            }
            let attr_name = normalize_attribute(raw_name);
            let text = self.text_attribute(a);
            if !super::cannot_be_set_statically(raw_name)
                && (matches!(a.value, AttrValue::True) || text.is_some())
            {
                let value = text.map(|s| decode_text(s.text(self.src)).into_owned());
                self.static_attribute(frag, id, raw_name, &attr_name, value);
            } else if attr_name == "autofocus" || attr_name == "class" || attr_name == "style" {
                return unsupported(&format!("a dynamic `{attr_name}` attribute"), a.span);
            } else {
                let (value, has_state) = self.attribute_value(a, frag);
                let update = self.attribute_update(node, &attr_name, value);
                let s = self.stmt(update);
                if has_state {
                    l.update.push(s)
                } else {
                    l.init.push(s)
                }
            }
        }
        if synthetic_class {
            self.static_attribute(frag, id, "class", "class", Some(String::new()));
        }

        let preserve = tag == "pre" || tag == "textarea";
        let cleaned = clean_nodes(
            self.c,
            self.src,
            Parent::Element(&tag),
            self.c.children(*children),
            preserve,
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
                frag,
                &mut child,
            )?;
            if needs_reset && !self.fold_reset_into_child(&mut child.init, node) {
                let x = self.out.id(node);
                let call = self.call("reset", vec![Some(x)]);
                child.init.push(self.stmt(call));
            }
        }
        if self.an.dynamic[id as usize] {
            l.init.append(&mut child.init);
            l.update.append(&mut child.update);
            l.after.append(&mut child.after);
        }
        frag.tpl.pop_element();
        Ok(())
    }

    fn static_attribute(
        &mut self,
        frag: &mut Frag,
        id: TId,
        raw_name: &str,
        attr_name: &str,
        value: Option<String>,
    ) {
        let mut value = value;
        if attr_name == "class"
            && self.an.scoped[id as usize]
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
    fn attribute_value(&mut self, a: &crate::ast::Attr, frag: &mut Frag) -> (NodeId, bool) {
        let AttrValue::Parts(r) = a.value else {
            return (self.tru(), false);
        };
        let parts = self.c.parts(r);
        match parts {
            [Part::Text(s)] => {
                let v = decode_text(s.text(self.src)).into_owned();
                (self.out.str(&v), false)
            }
            [Part::Expr { expr, .. }] => {
                let meta = self.an.meta(*expr);
                let built = self.expr(*expr);
                (self.memoize(frag, built, meta), meta.has_state)
            }
            _ => {
                let items = self.chunk_items(parts);
                self.template_chunk(&items, frag)
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

    /// Upstream `fold_reset_into_child`: `var x = $.child(el)` + `$.reset(el)` → `$.only_child(el)`.
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
        let is_child = matches!(self.out.kind(callee), Kind::Member { object, property, computed: false, .. }
            if self.out.name(object) == "$" && self.out.name(property) == "child");
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
        let mut capture = false;
        if event_name.ends_with("capture")
            && event_name != "gotpointercapture"
            && event_name != "lostpointercapture"
        {
            event_name = &event_name[..event_name.len() - 7];
            capture = true;
        }
        let meta = self.an.meta(handler);
        let built = self.expr(handler);
        let handler_expr = match self.c.js.kind(handler) {
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
    fn if_block(&mut self, id: TId, node: &str, frag: &mut Frag, l: &mut Lists) -> R<()> {
        frag.tpl.push_comment();
        let TNode::If { elseif, .. } = self.c.node(id) else {
            unreachable!()
        };
        let elseif = *elseif;
        let branches = self.c.if_branches(id);
        let mut statements = Vec::new();
        let mut tests_and_renders: Vec<(NodeId, NodeId)> = Vec::new();
        for (index, &b) in branches.iter().enumerate() {
            let TNode::If { test, cons, .. } = self.c.node(b) else {
                unreachable!()
            };
            let (test, cons) = (*test, *cons);
            let body = self.fragment(Parent::Block, self.c.children(cons))?;
            let cid = self.names.generate("consequent");
            let arrow = self.anchor_arrow(body);
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
        let last = *branches.last().expect("non-empty");
        let TNode::If { alt, .. } = self.c.node(last) else {
            unreachable!()
        };
        let mut else_stmt = None;
        if let Some(a) = alt {
            let body = self.fragment(Parent::Block, self.c.children(*a))?;
            let aid = self.names.generate("alternate");
            let arrow = self.anchor_arrow(body);
            statements.push(self.var(&aid, arrow));
            let render = self.out.id("$$render");
            let x = self.out.id(&aid);
            let minus = self.out.num(-1.0, Loc::SYNTHETIC);
            let call = self.out.call(render, &[x, minus], false, Loc::SYNTHETIC);
            else_stmt = Some(self.out.expr_stmt(call));
        }
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
        let flag_arg = elseif.then(|| self.tru());
        let call = self.call("if", vec![Some(x), Some(f), flag_arg]);
        statements.push(self.stmt(call));
        l.init.push(self.out.block(&statements, Loc::SYNTHETIC));
        Ok(())
    }

    fn anchor_arrow(&mut self, body: Vec<NodeId>) -> NodeId {
        let block = self.out.block(&body, Loc::SYNTHETIC);
        let anchor = self.out.id("$$anchor");
        self.out
            .arrow(&[anchor], block, false, false, Loc::SYNTHETIC)
    }
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
