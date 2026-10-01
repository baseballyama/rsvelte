//! Server lowering: the component becomes string pushes onto `$$renderer`. Mirrors upstream
//! `3-transform/server` (Fragment, `RegularElement`, `IfBlock`, `EachBlock`, shared/utils,
//! shared/element).

use rsv_html::decode_text;
use rsv_js::ast::flag;
use rsv_js::copy::copy;
use rsv_js::ops::{BinOp, UpdateOp};
use rsv_js::scope::ScopeId;
use rsv_js::{Ast, Kind, NodeId};
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::source::Loc;
use rustc_hash::FxHashMap;

use super::client::{call_arguments, init_property, runtime_call};
use super::names::Names;
use super::script::{ScriptRewrite, lower_instance};
use super::{
    CompileInput, Item, Parent, Target, check_binding, check_foreign_element, check_runes,
    check_stores, clean_nodes, each_index_names, escape_html, event_attribute,
    is_boolean_attribute, is_customizable_select, is_directive, is_load_error_element, needs_clsx,
    sanitize_template_string, synthetic_value,
};
use crate::analyze::Analysis;
use crate::hir::{AttrValue, Attribute, Element, ElementKind, Hir, HirId, NodeKind, Part};
use crate::parse::is_void;
use crate::resolve::{BindKind, Resolution};

type R<T> = Result<T, Diagnostic>;

const BLOCK_OPEN: &str = "<!--[-->";
const BLOCK_OPEN_ELSE: &str = "<!--[!-->";
const BLOCK_CLOSE: &str = "<!--]-->";
const EMPTY_COMMENT: &str = "<!---->";
const ELEMENT_IS_INPUT: u32 = 1 << 2;

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
    js: &'a Ast,
    hir: &'a Hir,
    src: &'a str,
    res: &'a Resolution,
    an: &'a Analysis,
    out: Ast,
    names: Names,
    each_index: FxHashMap<HirId, String>,
    /// Upstream `state.preserve_whitespace`: inside `<pre>` or `<textarea>`.
    preserve_ws: bool,
}

/// # Errors
///
/// An `unsupported` [`Diagnostic`] if the component uses an element or attribute the server
/// lowering does not handle yet.
pub fn lower(input: &CompileInput<'_>, res: &Resolution, an: &Analysis) -> R<(Ast, NodeId)> {
    let js = input.js;
    check_stores(js, res, input.src, input.program)?;
    check_runes(input, res, Target::Server)?;
    let declared = res.sem.bindings.iter().map(|b| js.atoms.get(b.name));
    let referenced = res.sem.references.iter().map(|r| js.name(r.node));
    let mut names = Names::new(declared, referenced);
    let each_index = each_index_names(input.hir, &mut names);
    let mut sx = Sx {
        js,
        hir: input.hir,
        src: input.src,
        res,
        an,
        out: Ast::new(),
        names,
        each_index,
        preserve_ws: false,
    };
    let mut hoisted = Vec::new();
    let mut rw = ScriptRewrite {
        target: Target::Server,
        res,
        src: input.src,
        each: None,
    };
    let instance = lower_instance(
        input.js,
        &mut sx.out,
        &mut rw,
        input.program,
        &mut hoisted,
        &mut sx.names,
    )?;
    let template = sx.fragment(Parent::Root, input.hir.children(input.hir.root))?;

    let o = &mut sx.out;
    let mut body: Vec<NodeId> = instance;
    body.extend(template);
    // Upstream: in runes mode this only throws when `undefined` is passed to a bound prop that
    // has a default.
    let mut bound = Vec::new();
    for (b, binding) in res.sem.bindings.iter_enumerated() {
        let info = &res.bindings[b];
        let name = js.atoms.get(binding.name);
        if binding.scope != ScopeId::ROOT
            || info.kind != BindKind::BindableProp
            || name.starts_with("$$")
        {
            continue;
        }
        let key = info.prop_key.map_or_else(
            || name.to_owned(),
            |k| match js.kind(k) {
                Kind::Ident(_) => js.name(k).to_owned(),
                _ => js.str_value(k, input.src).to_owned(),
            },
        );
        let value = o.id(name);
        bound.push(init_property(o, &key, value));
    }
    if !bound.is_empty() {
        let props = o.id("$$props");
        let object = o.object(&bound, Loc::SYNTHETIC);
        let call = o.runtime("$", "bind_props", &[props, object]);
        body.push(o.expr_stmt(call));
    }
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
    if an.needs_context || res.uses_props {
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
            res: self.res,
            src: self.src,
            each: None,
        };
        copy(self.js, &mut self.out, &mut rw, e)
    }

    fn fragment(&mut self, parent: Parent<'_>, list: &[HirId]) -> R<Vec<NodeId>> {
        let cleaned = clean_nodes(self.hir, self.src, parent, list, self.preserve_ws);
        let mut template = Vec::new();
        if cleaned.text_first {
            template.push(Piece::Text(EMPTY_COMMENT.into()));
        }
        self.process_children(&cleaned.items, &mut template)?;
        Ok(self.build_template(template))
    }

    /// Upstream `process_children` (server).
    fn process_children(&mut self, items: &[Item<'_>], template: &mut Vec<Piece>) -> R<()> {
        let mut sequence: Vec<&Item<'_>> = Vec::new();
        for item in items {
            match item {
                Item::Text { .. } | Item::Expr(_) => sequence.push(item),
                Item::Node(id) => {
                    self.flush(&mut sequence, template);
                    match self.hir.node(*id).kind {
                        NodeKind::Element(_) => self.element(*id, template)?,
                        NodeKind::If { .. } => self.if_block(*id, template)?,
                        NodeKind::Each(_) => self.each_block(*id, template)?,
                        _ => unreachable!("clean_nodes keeps only elements and blocks as nodes"),
                    }
                }
            }
        }
        self.flush(&mut sequence, template);
        Ok(())
    }

    fn flush(&mut self, sequence: &mut Vec<&Item<'_>>, template: &mut Vec<Piece>) {
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
                    let evaluated = self.res.evaluate(self.js, self.src, *e);
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
                        self.push_call(&std::mem::take(&mut strings), &std::mem::take(&mut exprs)),
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
            statements.push(self.push_call(&strings, &exprs));
        }
        statements
    }

    fn push_call(&mut self, strings: &[String], exprs: &[NodeId]) -> NodeId {
        let n = strings.len();
        let quasis: Vec<NodeId> = strings
            .iter()
            .enumerate()
            .map(|(i, s)| {
                self.out
                    .template_elem(&sanitize_template_string(s), i + 1 == n)
            })
            .collect();
        let t = self.out.template(&quasis, exprs, Loc::SYNTHETIC);
        let r = self.out.id("$$renderer");
        let callee = self.out.dot(r, "push");
        let call = self.out.call(callee, &[t], false, Loc::SYNTHETIC);
        self.out.expr_stmt(call)
    }

    /// Upstream `RegularElement` + `build_element_attributes` (server, no spread).
    fn element(&mut self, id: HirId, template: &mut Vec<Piece>) -> R<()> {
        let hir = self.hir;
        let NodeKind::Element(el) = &hir.node(id).kind else {
            unreachable!()
        };
        if el.kind != ElementKind::Regular {
            return Err(Diagnostic::error(
                "unsupported",
                "components, `<slot>` and `svelte:` elements are not supported yet",
                el.name,
            ));
        }
        let tag = el.name.text(self.src).to_ascii_lowercase();
        if matches!(
            tag.as_str(),
            "svg" | "math" | "script" | "style" | "textarea" | "template"
        ) || tag.contains('-')
        {
            return Err(Diagnostic::error(
                "unsupported",
                format!("`<{tag}>` is not supported yet"),
                el.name,
            ));
        }
        if is_customizable_select(hir, self.src, &tag, el) {
            return Err(Diagnostic::error(
                "unsupported",
                format!("rich content in `<{tag}>` is not supported yet"),
                el.name,
            ));
        }
        check_foreign_element(self.src, el.name)?;
        let select_special = tag == "select"
            && hir.attrs(el.attrs).iter().any(|a| match a.value {
                AttrValue::Spread(_) => true,
                AttrValue::Attach(_) | AttrValue::Class(_) => false,
                _ => {
                    let name = a.name.text(self.src);
                    name == "value" || name.eq_ignore_ascii_case("defaultvalue")
                }
            });
        if select_special || tag == "option" {
            return self.select_element(id, el, &tag, template);
        }
        template.push(Piece::Text(format!("<{tag}")));
        self.element_attributes(id, &tag, hir.attrs(el.attrs), template)?;
        let void = is_void(&tag);
        template.push(Piece::Text(if void { "/>".into() } else { ">".into() }));
        let outer_preserve = self.preserve_ws;
        self.preserve_ws |= tag == "pre" || tag == "textarea";
        let cleaned = clean_nodes(
            hir,
            self.src,
            Parent::Element(&tag),
            hir.children(el.children),
            self.preserve_ws,
        );
        let children = self.process_children(&cleaned.items, template);
        self.preserve_ws = outer_preserve;
        children?;
        if !void {
            template.push(Piece::Text(format!("</{tag}>")));
        }
        Ok(())
    }

    /// Upstream `RegularElement`'s `is_select_special` / `is_option_special` branches: the
    /// renderer writes the element, so it can mark the selected option.
    fn select_element(
        &mut self,
        id: HirId,
        el: &Element,
        tag: &str,
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let hir = self.hir;
        let body = if let Some(e) = synthetic_value(hir, self.src, tag, el) {
            self.expr(e)
        } else {
            let cleaned = clean_nodes(
                hir,
                self.src,
                Parent::Element(tag),
                hir.children(el.children),
                self.preserve_ws,
            );
            let mut inner = Vec::new();
            self.process_children(&cleaned.items, &mut inner)?;
            let statements = self.build_template(inner);
            let block = self.out.block(&statements, Loc::SYNTHETIC);
            let param = self.out.id("$$renderer");
            self.out
                .arrow(&[param], block, false, false, Loc::SYNTHETIC)
        };
        let (mut args, _) = self.spread_args(id, tag, hir.attrs(el.attrs), true)?;
        args.insert(1, Some(body));
        let args = call_arguments(&mut self.out, args);
        let r = self.out.id("$$renderer");
        let callee = self.out.dot(r, tag);
        let call = self.out.call(callee, &args, false, Loc::SYNTHETIC);
        template.push(Piece::Stmt(self.out.expr_stmt(call)));
        Ok(())
    }

    /// Upstream `build_element_attributes` (no spread).
    fn element_attributes(
        &mut self,
        id: HirId,
        tag: &str,
        list: &'a [Attribute],
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let src = self.src;
        // A `defaultValue` on an `<input>` deopts to the spread path, which orders it at runtime.
        let has_spread = list.iter().any(|a| {
            matches!(a.value, AttrValue::Spread(_))
                || (tag == "input"
                    && !is_directive(&a.value)
                    && matches!(a.name.text(src), "defaultValue" | "defaultChecked"))
        });
        if has_spread {
            return self.spread_attributes(id, tag, list, template);
        }
        let hash = if self.an.scoped[id] {
            self.an.css_hash.clone()
        } else {
            None
        };
        let mut events = Vec::new();
        let class_directives: Vec<&Attribute> = list
            .iter()
            .filter(|a| matches!(a.value, AttrValue::Class(_)))
            .collect();
        for a in list {
            let raw_name = a.name.text(self.src);
            match a.value {
                AttrValue::Bind(_) => {
                    let e = check_binding(self.js, self.res, self.src, tag, list, a)?;
                    let name = raw_name.to_ascii_lowercase();
                    let value = self.expr(e);
                    let n = self.out.str(&name);
                    let mut args = vec![n, value];
                    if is_boolean_attribute(&name) {
                        args.push(self.out.bool(true, Loc::SYNTHETIC));
                    }
                    template.push(Piece::Expr(self.out.runtime("$", "attr", &args)));
                    continue;
                }
                AttrValue::Attach(_) | AttrValue::Class(_) => continue,
                AttrValue::Spread(_) => unreachable!("spreads take the spread path"),
                _ if event_attribute(self.src, a).is_some() => {
                    capture_event(&mut events, tag, raw_name);
                    continue;
                }
                _ if matches!(raw_name, "defaultValue" | "defaultChecked") => continue,
                _ => {}
            }
            let name = raw_name.to_ascii_lowercase();
            let trim = matches!(name.as_str(), "class" | "style");
            let can_use_literal = name != "class" || class_directives.is_empty();
            let literal = match &a.value {
                AttrValue::Boolean => Some(None),
                AttrValue::Static(v) => {
                    Some(Some(escape_html(&attr_text(v, trim), true).into_owned()))
                }
                _ => None,
            };
            if can_use_literal && let Some(v) = literal {
                Self::literal_attribute(template, &name, v, hash.as_deref());
                continue;
            }
            if name == "style" {
                return Err(Diagnostic::error(
                    "unsupported",
                    "a dynamic `style` attribute is not supported yet",
                    a.span,
                ));
            }
            let value = self.attribute_value(a, trim, raw_name == "class");
            if can_use_literal && matches!(self.out.kind(value), Kind::Str) {
                let mut v = self.out.str_value(value, self.src).to_owned();
                if name == "class"
                    && let Some(h) = &hash
                {
                    format!("{v} {h}").trim().clone_into(&mut v);
                }
                let v = escape_html(&v, true);
                template.push(Piece::Text(format!(" {name}=\"{v}\"")));
            } else if name == "class" {
                let call = self.attr_class(&class_directives, value, hash.as_deref());
                template.push(Piece::Expr(call));
            } else {
                let n = self.out.str(&name);
                let mut args = vec![n, value];
                if is_boolean_attribute(&name) {
                    args.push(self.out.bool(true, Loc::SYNTHETIC));
                }
                template.push(Piece::Expr(self.out.runtime("$", "attr", &args)));
            }
        }
        // Upstream's analysis appends `class=""` to such an element.
        let has_class = list.iter().any(|a| {
            !matches!(a.value, AttrValue::Class(_))
                && a.name.text(self.src).eq_ignore_ascii_case("class")
        });
        if !has_class && !class_directives.is_empty() {
            let value = self.out.str("");
            let call = self.attr_class(&class_directives, value, hash.as_deref());
            template.push(Piece::Expr(call));
        } else if !has_class && self.an.scoped[id] {
            Self::literal_attribute(template, "class", Some(String::new()), hash.as_deref());
        }
        push_captured_events(template, &events);
        Ok(())
    }

    /// Upstream `build_element_attributes`' spread path: `build_element_spread_attributes` and
    /// `prepare_element_spread`.
    fn spread_attributes(
        &mut self,
        id: HirId,
        tag: &str,
        list: &'a [Attribute],
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let (args, events) = self.spread_args(id, tag, list, false)?;
        let call = runtime_call(&mut self.out, "attributes", args);
        template.push(Piece::Expr(call));
        push_captured_events(template, &events);
        Ok(())
    }

    /// Upstream `prepare_element_spread`'s arguments. `all` is `prepare_element_spread_object`,
    /// which keeps every attribute; otherwise the spread path of `build_element_attributes`
    /// filters events (returned for capture) and the values the runtime sets elsewhere.
    fn spread_args(
        &mut self,
        id: HirId,
        tag: &str,
        list: &'a [Attribute],
        all: bool,
    ) -> R<(Vec<Option<NodeId>>, Vec<&'a str>)> {
        let mut events = Vec::new();
        let mut props = Vec::with_capacity(list.len());
        let mut class_directives = Vec::new();
        for a in list {
            let raw_name = a.name.text(self.src);
            match a.value {
                AttrValue::Bind(_) => {
                    let e = check_binding(self.js, self.res, self.src, tag, list, a)?;
                    let value = self.expr(e);
                    let name = raw_name.to_ascii_lowercase();
                    props.push(init_property(&mut self.out, &name, value));
                    continue;
                }
                AttrValue::Attach(_) => continue,
                AttrValue::Class(e) => {
                    class_directives.push((raw_name, e));
                    continue;
                }
                AttrValue::Spread(e) => {
                    let v = self.expr(e);
                    props.push(self.out.spread(v, Loc::SYNTHETIC));
                    if is_load_error_element(tag) {
                        capture_event(&mut events, tag, "onload");
                        capture_event(&mut events, tag, "onerror");
                    }
                    continue;
                }
                _ if all => {}
                _ if raw_name == "value" && tag == "select" => continue,
                _ if event_attribute(self.src, a).is_some() => {
                    capture_event(&mut events, tag, raw_name);
                    continue;
                }
                _ if tag != "input" && matches!(raw_name, "defaultValue" | "defaultChecked") => {
                    continue;
                }
                _ => {}
            }
            let mut name = raw_name.to_ascii_lowercase();
            if tag == "select" && name == "defaultvalue" {
                "defaultValue".clone_into(&mut name);
            }
            let trim = matches!(name.as_str(), "class" | "style");
            let value = self.attribute_value(a, trim, raw_name == "class");
            props.push(init_property(&mut self.out, &name, value));
        }
        // Upstream's analysis appends `class=""` to such an element.
        let has_class = list.iter().any(|a| {
            !is_directive(&a.value) && a.name.text(self.src).eq_ignore_ascii_case("class")
        });
        let has_spread = list.iter().any(|a| matches!(a.value, AttrValue::Spread(_)));
        if !has_spread && !has_class && (self.an.scoped[id] || !class_directives.is_empty()) {
            let empty = self.out.str("");
            props.push(init_property(&mut self.out, "class", empty));
        }
        let object = self.out.object(&props, Loc::SYNTHETIC);
        let classes = (!class_directives.is_empty()).then(|| {
            let props: Vec<NodeId> = class_directives
                .iter()
                .map(|&(name, e)| {
                    let v = self.expr(e);
                    init_property(&mut self.out, name, v)
                })
                .collect();
            self.out.object(&props, Loc::SYNTHETIC)
        });
        let hash = if self.an.scoped[id] {
            self.an.css_hash.clone()
        } else {
            None
        };
        let hash = hash.map(|h| self.out.str(&h));
        let flags =
            (tag == "input").then(|| self.out.num(f64::from(ELEMENT_IS_INPUT), Loc::SYNTHETIC));
        Ok((vec![Some(object), hash, classes, None, flags], events))
    }

    /// Upstream `build_attr_class`.
    fn attr_class(
        &mut self,
        directives: &[&Attribute],
        value: NodeId,
        hash: Option<&str>,
    ) -> NodeId {
        let directives = (!directives.is_empty()).then(|| {
            let props: Vec<NodeId> = directives
                .iter()
                .map(|d| {
                    let AttrValue::Class(e) = d.value else {
                        unreachable!("class directives")
                    };
                    let key = self.out.str(d.name.text(self.src));
                    let v = self.expr(e);
                    self.out.property(key, v, 0, Loc::SYNTHETIC)
                })
                .collect();
            self.out.object(&props, Loc::SYNTHETIC)
        });
        let mut value = value;
        let mut css_hash = None;
        if let Some(h) = hash {
            if matches!(self.out.kind(value), Kind::Str) {
                let v = self.out.str_value(value, self.src);
                value = self.out.str(format!("{v} {h}").trim());
            } else {
                css_hash = Some(self.out.str(h));
            }
        }
        runtime_call(
            &mut self.out,
            "attr_class",
            vec![Some(value), css_hash, directives],
        )
    }

    fn literal_attribute(
        template: &mut Vec<Piece>,
        name: &str,
        value: Option<String>,
        hash: Option<&str>,
    ) {
        let mut value = value;
        if name == "class"
            && let Some(h) = hash
        {
            let base = value
                .as_deref()
                .map_or_else(|| "true".to_owned(), str::to_owned);
            value = Some(format!("{base} {h}").trim().to_owned());
        }
        if name != "class" || value.as_deref() != Some("") {
            template.push(Piece::Text(format!(
                " {name}=\"{}\"",
                value.unwrap_or_default()
            )));
        }
    }

    /// Upstream `build_attribute_value` (server); a `class`
    /// written as one unquoted expression goes through `$.clsx` when upstream's `needs_clsx`.
    fn attribute_value(&mut self, a: &Attribute, trim: bool, class: bool) -> NodeId {
        let parts = match &a.value {
            &AttrValue::Expression { expr, quoted } => {
                let v = self.expr(expr);
                return if class && !quoted && needs_clsx(self.js, expr) {
                    self.out.runtime("$", "clsx", &[v])
                } else {
                    v
                };
            }
            &AttrValue::Shorthand(expr) => {
                let v = self.expr(expr);
                return if class && needs_clsx(self.js, expr) {
                    self.out.runtime("$", "clsx", &[v])
                } else {
                    v
                };
            }
            AttrValue::Interpolated(parts) => parts,
            AttrValue::Boolean => return self.out.bool(true, Loc::SYNTHETIC),
            AttrValue::Static(v) => {
                return self.out.str(&escape_html(&attr_text(v, trim), true));
            }
            AttrValue::Bind(_)
            | AttrValue::Attach(_)
            | AttrValue::Class(_)
            | AttrValue::Spread(_) => {
                unreachable!("directives are handled by the caller")
            }
        };
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
                    let evaluated = self.res.evaluate(self.js, self.src, *expr);
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
    fn if_block(&mut self, id: HirId, template: &mut Vec<Piece>) -> R<()> {
        let hir = self.hir;
        let NodeKind::If {
            branches,
            otherwise,
        } = hir.node(id).kind
        else {
            unreachable!()
        };
        let mut arms = Vec::new();
        for (index, b) in hir.branches(branches).iter().enumerate() {
            let body = self.fragment(Parent::Block, hir.children(b.body))?;
            let marker = format!("<!--[{index}-->");
            let block = self.prepend_block_marker(body, &marker);
            let t = self.expr(b.test);
            arms.push((t, block));
        }
        let final_body = match otherwise {
            Some(o) => self.fragment(Parent::Block, hir.children(o))?,
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

    /// Upstream `EachBlock` (server) for a block whose context is an identifier.
    fn each_block(&mut self, id: HirId, template: &mut Vec<Piece>) -> R<()> {
        let (hir, js) = (self.hir, self.js);
        let NodeKind::Each(each) = &hir.node(id).kind else {
            unreachable!()
        };
        let context = each.context().expect("the parser requires `as`");
        if !matches!(js.kind(context), Kind::Ident(_)) {
            return Err(Diagnostic::error(
                "unsupported",
                "a destructuring `{#each}` context is not supported yet",
                js.loc(context).span().expect("parsed from source"),
            ));
        }
        let collection = self.expr(each.collection);
        let index = each
            .index()
            .map_or_else(|| self.each_index[&id].clone(), |i| js.name(i).to_owned());
        let array_id = self.names.unique("each_array");
        let ensure = self.out.runtime("$", "ensure_array_like", &[collection]);
        let array = self.out.id(&array_id);
        let array_decl = self.out.let_(flag::CONST, array, Some(ensure));

        let mut body = Vec::new();
        let item = self.out.ident(js.name(context), js.loc(context));
        let array = self.out.id(&array_id);
        let at = self.out.id(&index);
        let element = self.out.member(array, at, true, false, Loc::SYNTHETIC);
        body.push(self.out.let_(flag::LET, item, Some(element)));
        body.extend(self.fragment(Parent::Each, hir.children(each.body))?);

        let i = self.out.id(&index);
        let zero = self.out.num(0.0, Loc::SYNTHETIC);
        let first = self.out.declarator(i, Some(zero), Loc::SYNTHETIC);
        let length = self.out.id("$$length");
        let array = self.out.id(&array_id);
        let array_length = self.out.dot(array, "length");
        let second = self
            .out
            .declarator(length, Some(array_length), Loc::SYNTHETIC);
        let init = self
            .out
            .var_decl(flag::LET, &[first, second], Loc::SYNTHETIC);
        let i = self.out.id(&index);
        let length = self.out.id("$$length");
        let test = self.out.binary(BinOp::Lt, i, length, Loc::SYNTHETIC);
        let i = self.out.id(&index);
        let update = self.out.update(UpdateOp::Inc, false, i, Loc::SYNTHETIC);
        let block = self.out.block(&body, Loc::SYNTHETIC);
        let for_loop = self
            .out
            .for_(Some(init), Some(test), Some(update), block, Loc::SYNTHETIC);

        if let Some(f) = each.fallback {
            let open = self.push_literal(BLOCK_OPEN);
            let fallback = self.fragment(Parent::Each, hir.children(f))?;
            let fallback = self.prepend_block_marker(fallback, BLOCK_OPEN_ELSE);
            let array = self.out.id(&array_id);
            let array_length = self.out.dot(array, "length");
            let zero = self.out.num(0.0, Loc::SYNTHETIC);
            let test = self
                .out
                .binary(BinOp::StrictNotEq, array_length, zero, Loc::SYNTHETIC);
            let cons = self.out.block(&[open, for_loop], Loc::SYNTHETIC);
            let stmt = self.out.if_(test, cons, Some(fallback), Loc::SYNTHETIC);
            template.push(Piece::Stmt(array_decl));
            template.push(Piece::Stmt(stmt));
        } else {
            template.push(Piece::Text(BLOCK_OPEN.into()));
            template.push(Piece::Stmt(array_decl));
            template.push(Piece::Stmt(for_loop));
        }
        template.push(Piece::Text(BLOCK_CLOSE.into()));
        Ok(())
    }

    /// `$$renderer.push('…')`.
    fn push_literal(&mut self, text: &str) -> NodeId {
        let r = self.out.id("$$renderer");
        let callee = self.out.dot(r, "push");
        let m = self.out.str(text);
        let call = self.out.call(callee, &[m], false, Loc::SYNTHETIC);
        self.out.expr_stmt(call)
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
        if let Some(s) = folded {
            body[0] = s;
        } else {
            let r = self.out.id("$$renderer");
            let callee = self.out.dot(r, "push");
            let m = self.out.str(marker);
            let call = self.out.call(callee, &[m], false, Loc::SYNTHETIC);
            body.insert(0, self.out.expr_stmt(call));
        }
        self.out.block(&body, Loc::SYNTHETIC)
    }
}

/// Upstream's `events_to_capture`: a load or error event on an element that emits them is
/// replayed after hydration, so the server marks it.
fn capture_event<'a>(events: &mut Vec<&'a str>, tag: &str, name: &'a str) {
    if matches!(name, "onload" | "onerror") && is_load_error_element(tag) && !events.contains(&name)
    {
        events.push(name);
    }
}

fn push_captured_events(template: &mut Vec<Piece>, events: &[&str]) {
    for e in events {
        template.push(Piece::Text(format!(" {e}=\"this.__e=event\"")));
    }
}

/// `String(value ?? '')` for a known value.
fn known_string(v: &crate::evaluate::Val) -> String {
    match v {
        crate::evaluate::Val::Null | crate::evaluate::Val::Undefined => String::new(),
        v => v.to_js_string(),
    }
}

fn attr_text(data: &str, trim: bool) -> String {
    if trim {
        collapse_ws(data).trim().to_owned()
    } else {
        data.to_owned()
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
