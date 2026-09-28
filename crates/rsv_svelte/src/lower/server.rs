//! Server lowering: the component becomes string pushes onto `$$renderer`. Mirrors upstream
//! `3-transform/server` (Fragment, RegularElement, IfBlock, shared/utils, shared/element).

use super::script::{ScriptRewrite, lower_instance};
use super::{
    Item, Parent, Target, clean_nodes, escape_html, event_attribute, is_boolean_attribute,
    sanitize_template_string,
};
use crate::analyze::Analysis;
use crate::ast::{AttrValue, Component, Part, TId, TNode, decode_text};
use crate::parse::is_void;
use rsv_js::copy::copy;
use rsv_js::{Ast, Kind, NodeId};
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::source::Loc;

type R<T> = Result<T, Diagnostic>;

const BLOCK_CLOSE: &str = "<!--]-->";
const EMPTY_COMMENT: &str = "<!---->";

/// One piece of a server template before it is folded into `$$renderer.push(…)` calls.
enum Piece {
    /// Cooked text.
    Text(String),
    /// A template literal, as cooked quasis and expressions.
    Template(Vec<String>, Vec<NodeId>),
    Expr(NodeId),
    Stmt(NodeId),
}

struct Sx<'a> {
    c: &'a Component,
    src: &'a str,
    an: &'a Analysis,
    out: Ast,
}

pub fn lower(c: &Component, src: &str, an: &Analysis) -> R<(Ast, NodeId)> {
    let mut sx = Sx {
        c,
        src,
        an,
        out: Ast::new(),
    };
    let mut hoisted = Vec::new();
    let mut rw = ScriptRewrite {
        target: Target::Server,
        an,
    };
    let instance = lower_instance(&c.js, &mut sx.out, &mut rw, c.program, &mut hoisted)?;
    let template = sx.fragment(Parent::Root, c.children(c.root))?;

    let o = &mut sx.out;
    let mut body: Vec<NodeId> = instance;
    body.extend(template);
    if an.needs_context {
        let block = o.block(&body, Loc::SYNTHETIC);
        let param = o.id("$$renderer");
        let f = o.arrow(&[param], block, false, false, Loc::SYNTHETIC);
        let r = o.id("$$renderer");
        let callee = o.dot(r, "component");
        let call = o.call(callee, &[f], false, Loc::SYNTHETIC);
        body = vec![o.expr_stmt(call)];
    }
    let mut params = vec![o.id("$$renderer")];
    if an.needs_context || an.uses_props {
        params.push(o.id("$$props"));
    }
    let block = o.block(&body, Loc::SYNTHETIC);
    let name = o.id(&an.name);
    let func = o.function(true, Some(name), &params, block, false, Loc::SYNTHETIC);

    let ns = o.id("$");
    let spec = o.import_namespace(ns, Loc::SYNTHETIC);
    let source = o.str("svelte/internal/server");
    let mut program = vec![o.import(&[spec], source, false, Loc::SYNTHETIC)];
    program.extend(hoisted);
    program.push(o.export_default(func, Loc::SYNTHETIC));
    let root = o.program(&program, Loc::SYNTHETIC);
    Ok((sx.out, root))
}

impl<'a> Sx<'a> {
    fn expr(&mut self, e: NodeId) -> NodeId {
        let mut rw = ScriptRewrite {
            target: Target::Server,
            an: self.an,
        };
        copy(&self.c.js, &mut self.out, &mut rw, e)
    }

    fn fragment(&mut self, parent: Parent, list: &[TId]) -> R<Vec<NodeId>> {
        let cleaned = clean_nodes(self.c, self.src, parent, list, false);
        let mut template = Vec::new();
        if cleaned.text_first {
            template.push(Piece::Text(EMPTY_COMMENT.into()));
        }
        self.process_children(&cleaned.items, &mut template)?;
        Ok(self.build_template(template))
    }

    /// Upstream `process_children` (server).
    fn process_children(&mut self, items: &[Item], template: &mut Vec<Piece>) -> R<()> {
        let mut sequence: Vec<&Item> = Vec::new();
        for item in items {
            match item {
                Item::Text { .. } | Item::Expr(_) => sequence.push(item),
                Item::Node(id) => {
                    self.flush(&mut sequence, template);
                    match self.c.node(*id) {
                        TNode::Element { .. } => self.element(*id, template)?,
                        TNode::If { .. } => self.if_block(*id, template)?,
                        _ => unreachable!("clean_nodes keeps only elements and blocks as nodes"),
                    }
                }
            }
        }
        self.flush(&mut sequence, template);
        Ok(())
    }

    fn flush(&mut self, sequence: &mut Vec<&Item>, template: &mut Vec<Piece>) {
        if sequence.is_empty() {
            return;
        }
        let mut quasis = vec![String::new()];
        let mut exprs = Vec::new();
        for item in sequence.drain(..) {
            match item {
                Item::Text { data, .. } => quasis
                    .last_mut()
                    .expect("never empty")
                    .push_str(&escape_html(data, false)),
                Item::Expr(e) => {
                    let evaluated = self.an.evaluate(&self.c.js, self.src, *e);
                    if evaluated.is_known {
                        let s = known_string(&evaluated.value);
                        quasis
                            .last_mut()
                            .expect("never empty")
                            .push_str(&escape_html(&s, false));
                    } else {
                        let v = self.expr(*e);
                        exprs.push(self.out.runtime("$", "escape", &[v]));
                        quasis.push(String::new());
                    }
                }
                Item::Node(_) => unreachable!("sequences hold text and expressions"),
            }
        }
        template.push(Piece::Template(quasis, exprs));
    }

    /// Upstream `build_template`: adjacent pieces fold into one `$$renderer.push(`…`)`.
    fn build_template(&mut self, template: Vec<Piece>) -> Vec<NodeId> {
        let mut statements = Vec::new();
        let mut strings: Vec<String> = Vec::new();
        let mut exprs: Vec<NodeId> = Vec::new();
        for piece in template {
            if let Piece::Stmt(s) = piece {
                if !strings.is_empty() {
                    statements.push(
                        self.push_call(std::mem::take(&mut strings), std::mem::take(&mut exprs)),
                    );
                }
                statements.push(s);
                continue;
            }
            if strings.is_empty() {
                strings.push(String::new());
            }
            match piece {
                Piece::Text(t) => strings.last_mut().expect("never empty").push_str(&t),
                Piece::Template(q, e) => {
                    let mut q = q.into_iter();
                    strings
                        .last_mut()
                        .expect("never empty")
                        .push_str(&q.next().expect("at least one quasi"));
                    strings.extend(q);
                    exprs.extend(e);
                }
                Piece::Expr(e) => {
                    exprs.push(e);
                    strings.push(String::new());
                }
                Piece::Stmt(_) => unreachable!("handled above"),
            }
        }
        if !strings.is_empty() {
            statements.push(self.push_call(strings, exprs));
        }
        statements
    }

    fn push_call(&mut self, strings: Vec<String>, exprs: Vec<NodeId>) -> NodeId {
        let n = strings.len();
        let quasis: Vec<NodeId> = strings
            .iter()
            .enumerate()
            .map(|(i, s)| {
                self.out
                    .template_elem(&sanitize_template_string(s), i + 1 == n)
            })
            .collect();
        let t = self.out.template(&quasis, &exprs, Loc::SYNTHETIC);
        let r = self.out.id("$$renderer");
        let callee = self.out.dot(r, "push");
        let call = self.out.call(callee, &[t], false, Loc::SYNTHETIC);
        self.out.expr_stmt(call)
    }

    /// Upstream `RegularElement` + `build_element_attributes` (server, no spread).
    fn element(&mut self, id: TId, template: &mut Vec<Piece>) -> R<()> {
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
            "svg" | "math" | "script" | "style" | "select" | "option" | "textarea" | "template"
        ) || tag.contains('-')
        {
            return Err(Diagnostic::error(
                "unsupported",
                format!("`<{tag}>` is not supported yet"),
                *name,
            ));
        }
        template.push(Piece::Text(format!("<{tag}")));
        let hash = if self.an.scoped[id as usize] {
            self.an.css_hash.clone()
        } else {
            None
        };
        let list = self.c.attrs(*attrs);
        for a in list {
            let raw_name = a.name.text(self.src);
            if event_attribute(self.c, self.src, a).is_some() {
                continue;
            }
            let attr_name = super::client::normalize_attribute(raw_name);
            let trim = matches!(attr_name.as_str(), "class" | "style");
            let literal = match a.value {
                AttrValue::True => Some(None),
                AttrValue::Parts(r) => match self.c.parts(r) {
                    [Part::Text(s)] => Some(Some(
                        escape_html(&attr_text(s.text(self.src), trim), true).into_owned(),
                    )),
                    _ => None,
                },
            };
            if let Some(v) = literal {
                self.literal_attribute(template, &attr_name, v, hash.as_deref());
                continue;
            }
            if attr_name == "class" || attr_name == "style" {
                return Err(Diagnostic::error(
                    "unsupported",
                    format!("a dynamic `{attr_name}` attribute is not supported yet"),
                    a.span,
                ));
            }
            let value = self.attribute_value(a, trim);
            let n = self.out.str(&attr_name);
            let mut args = vec![n, value];
            if is_boolean_attribute(&attr_name) {
                args.push(self.out.bool(true, Loc::SYNTHETIC));
            }
            template.push(Piece::Expr(self.out.runtime("$", "attr", &args)));
        }
        let has_class = list
            .iter()
            .any(|a| a.name.text(self.src).eq_ignore_ascii_case("class"));
        if !has_class && self.an.scoped[id as usize] {
            self.literal_attribute(template, "class", Some(String::new()), hash.as_deref());
        }
        let void = is_void(&tag);
        template.push(Piece::Text(if void { "/>".into() } else { ">".into() }));
        let preserve = tag == "pre" || tag == "textarea";
        let cleaned = clean_nodes(
            self.c,
            self.src,
            Parent::Element(&tag),
            self.c.children(*children),
            preserve,
        );
        self.process_children(&cleaned.items, template)?;
        if !void {
            template.push(Piece::Text(format!("</{tag}>")));
        }
        Ok(())
    }

    fn literal_attribute(
        &mut self,
        template: &mut Vec<Piece>,
        name: &str,
        value: Option<String>,
        hash: Option<&str>,
    ) {
        let mut value = value;
        if name == "class"
            && let Some(h) = hash
        {
            let base = value.as_deref().map_or("true".to_owned(), str::to_owned);
            value = Some(format!("{base} {h}").trim().to_owned());
        }
        if name != "class" || value.as_deref() != Some("") {
            template.push(Piece::Text(format!(
                " {name}=\"{}\"",
                value.unwrap_or_default()
            )));
        }
    }

    /// Upstream `build_attribute_value` (server) for a value with at least one expression.
    fn attribute_value(&mut self, a: &crate::ast::Attr, trim: bool) -> NodeId {
        let AttrValue::Parts(r) = a.value else {
            unreachable!("literal values are handled by the caller")
        };
        let parts = self.c.parts(r);
        if let [Part::Expr { expr, .. }] = parts {
            return self.expr(*expr);
        }
        let mut quasis = vec![String::new()];
        let mut exprs = Vec::new();
        for p in parts {
            match p {
                Part::Text(s) => {
                    let data = decode_text(s.text(self.src));
                    let data = if trim {
                        collapse_ws(&data)
                    } else {
                        data.into_owned()
                    };
                    quasis.last_mut().expect("never empty").push_str(&data);
                }
                Part::Expr { expr, .. } => {
                    let evaluated = self.an.evaluate(&self.c.js, self.src, *expr);
                    if evaluated.is_known {
                        quasis
                            .last_mut()
                            .expect("never empty")
                            .push_str(&known_string(&evaluated.value));
                    } else {
                        let v = self.expr(*expr);
                        let v = if evaluated.is_string && evaluated.is_defined {
                            v
                        } else {
                            self.out.runtime("$", "stringify", &[v])
                        };
                        exprs.push(v);
                        quasis.push(String::new());
                    }
                }
            }
        }
        if exprs.is_empty() {
            return self.out.str(&quasis[0]);
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
        self.out.template(&elems, &exprs, Loc::SYNTHETIC)
    }

    /// Upstream `IfBlock` (server).
    fn if_block(&mut self, id: TId, template: &mut Vec<Piece>) -> R<()> {
        let branches = self.c.if_branches(id);
        let mut arms = Vec::new();
        for (index, &b) in branches.iter().enumerate() {
            let TNode::If { test, cons, .. } = self.c.node(b) else {
                unreachable!()
            };
            let (test, cons) = (*test, *cons);
            let body = self.fragment(Parent::Block, self.c.children(cons))?;
            let marker = format!("<!--[{index}-->");
            let block = self.prepend_block_marker(body, &marker);
            let t = self.expr(test);
            arms.push((t, block));
        }
        let last = *branches.last().expect("non-empty");
        let TNode::If { alt, .. } = self.c.node(last) else {
            unreachable!()
        };
        let final_body = match alt {
            Some(a) => self.fragment(Parent::Block, self.c.children(*a))?,
            None => Vec::new(),
        };
        let mut chain = self.prepend_block_marker(final_body, "<!--[-1-->");
        for (t, block) in arms.into_iter().rev() {
            chain = self.out.if_(t, block, Some(chain), Loc::SYNTHETIC);
        }
        template.push(Piece::Stmt(chain));
        template.push(Piece::Text(BLOCK_CLOSE.into()));
        Ok(())
    }

    /// Upstream `prepend_block_marker`: folds the marker into a leading static push.
    fn prepend_block_marker(&mut self, mut body: Vec<NodeId>, marker: &str) -> NodeId {
        let folded = body.first().and_then(|&first| {
            let Kind::ExprStmt(call) = self.out.kind(first) else {
                return None;
            };
            let Kind::Call {
                callee,
                args: [arg],
                ..
            } = self.out.kind(call)
            else {
                return None;
            };
            let is_push = matches!(self.out.kind(callee), Kind::Member { object, property, .. }
                if self.out.name(object) == "$$renderer" && self.out.name(property) == "push");
            let Kind::Template { quasis, exprs } = self.out.kind(*arg) else {
                return None;
            };
            if !is_push {
                return None;
            }
            let (quasis, exprs) = (quasis.to_vec(), exprs.to_vec());
            let n = quasis.len();
            let mut new_quasis = Vec::with_capacity(n);
            for (i, &q) in quasis.iter().enumerate() {
                let raw = self.out.str_value(q, self.src).to_owned();
                let raw = if i == 0 {
                    format!("{}{raw}", sanitize_template_string(marker))
                } else {
                    raw
                };
                new_quasis.push(self.out.template_elem(&raw, i + 1 == n));
            }
            let t = self.out.template(&new_quasis, &exprs, Loc::SYNTHETIC);
            let r = self.out.id("$$renderer");
            let callee = self.out.dot(r, "push");
            let call = self.out.call(callee, &[t], false, Loc::SYNTHETIC);
            Some(self.out.expr_stmt(call))
        });
        match folded {
            Some(s) => body[0] = s,
            None => {
                let r = self.out.id("$$renderer");
                let callee = self.out.dot(r, "push");
                let m = self.out.str(marker);
                let call = self.out.call(callee, &[m], false, Loc::SYNTHETIC);
                body.insert(0, self.out.expr_stmt(call));
            }
        }
        self.out.block(&body, Loc::SYNTHETIC)
    }
}

/// `String(value ?? '')` for a known value.
fn known_string(v: &crate::evaluate::Val) -> String {
    match v {
        crate::evaluate::Val::Null | crate::evaluate::Val::Undefined => String::new(),
        v => v.to_js_string(),
    }
}

fn attr_text(raw: &str, trim: bool) -> String {
    let data = decode_text(raw);
    if trim {
        collapse_ws(&data).trim().to_owned()
    } else {
        data.into_owned()
    }
}

/// `regex_whitespaces_strict` → `' '`.
fn collapse_ws(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut in_ws = false;
    for ch in s.chars() {
        if matches!(ch, ' ' | '\t' | '\n' | '\r' | '\u{c}') {
            if !in_ws {
                out.push(' ');
            }
            in_ws = true;
        } else {
            out.push(ch);
            in_ws = false;
        }
    }
    out
}
