//! The template: Vue's HIR to Svelte's.

use rsv_js::ast::flag;
use rsv_js::ops::{AssignOp, BinOp, LogicalOp, UnaryOp};
use rsv_js::scope::{BindingId, DeclKind};
use rsv_js::{Ast, Kind, NodeId};
use rsv_kernel::source::{Loc, Span};
use rsv_svelte::hir::{
    self as svelte, AttrValue, Attribute, Branch, Each, Element as SElement, HirBuilder,
    HirId as SId, NodeKind as SKind,
};
use rsv_svelte::lower::Target;
use rsv_vue::ast::{DirExp, DirName};
use rsv_vue::hir::{Directive, Element, Hir, HirId, NodeKind, Prop, PropKind, TagType};
use rustc_hash::FxHashMap;

use crate::cx::{Class, Helper, Info, Names, R, Rewriter, span_of, unsupported};

/// The translated template, and the declarations the instance script needs for it.
#[derive(Debug)]
pub(crate) struct Template {
    pub(crate) hir: svelte::Hir,
    pub(crate) exprs: Vec<NodeId>,
    /// Statements that go before the script's own.
    pub(crate) hoisted: Vec<NodeId>,
}

/// runtime-core `getChildRoot` / `filterSingleRoot` in development: the elements that receive the
/// attributes that fall through, when the template renders a single element root (one element,
/// or one `v-if` chain of elements). Comments do not count.
#[must_use]
pub(crate) fn fallthrough_targets(hir: &Hir) -> Vec<HirId> {
    let roots: Vec<HirId> = hir
        .root()
        .iter()
        .copied()
        .filter(|&n| !matches!(hir.node(n).kind, NodeKind::Comment { .. }))
        .collect();
    let element = |n: HirId| match &hir.node(n).kind {
        NodeKind::Element(el) if el.tag_type == TagType::Element => {
            let dirs = directives(hir, el);
            (!dirs.iter().any(|d| d.name == DirName::For)).then(|| {
                dirs.iter()
                    .find(|d| matches!(d.name, DirName::If | DirName::ElseIf | DirName::Else))
                    .map(|d| d.name)
            })
        }
        _ => None,
    };
    match *roots.as_slice() {
        [one] if element(one) == Some(None) => vec![one],
        [first, ..] if element(first) == Some(Some(DirName::If)) => {
            let mut chain = vec![first];
            for &n in &roots[1..] {
                match element(n) {
                    Some(Some(DirName::ElseIf)) => chain.push(n),
                    Some(Some(DirName::Else)) => {
                        chain.push(n);
                        return if chain.len() == roots.len() {
                            chain
                        } else {
                            Vec::new()
                        };
                    }
                    _ => return Vec::new(),
                }
            }
            Vec::new()
        }
        _ => Vec::new(),
    }
}

fn directives<'h>(hir: &'h Hir, el: &Element) -> Vec<&'h Directive> {
    hir.props(el.props)
        .iter()
        .filter_map(|p| match &p.kind {
            PropKind::Directive(d) => Some(d),
            PropKind::Attribute { .. } => None,
        })
        .collect()
}

fn directive<'h>(hir: &'h Hir, el: &Element, name: DirName) -> Option<(&'h Prop, &'h Directive)> {
    hir.props(el.props).iter().find_map(|p| match &p.kind {
        PropKind::Directive(d) if d.name == name => Some((p, d)),
        _ => None,
    })
}

fn expr_of(d: &Directive, span: Span) -> R<NodeId> {
    match d.exp {
        DirExp::Expr(e) => Ok(e),
        _ => Err(unsupported("a directive without a value", span)),
    }
}

/// # Errors
///
/// A refusal for what the template does that svue does not translate.
pub(crate) fn translate(
    info: &Info<'_>,
    hir: Option<&Hir>,
    roots: &[HirId],
    attrs: Option<&str>,
    to: &mut Ast,
    names: &mut Names,
) -> R<Template> {
    let mut b = HirBuilder::new(info.src, 0, 0);
    let Some(vhir) = hir else {
        let root = b.children(&[]);
        return Ok(Template {
            hir: b.finish(root),
            exprs: Vec::new(),
            hoisted: Vec::new(),
        });
    };
    let mut t = T {
        info,
        vhir,
        src: info.src,
        to,
        names,
        b,
        exprs: Vec::new(),
        aliases: FxHashMap::default(),
        roots,
        attrs,
        select_model: None,
        hoisted: Vec::new(),
        vmodel: None,
        boolean_attr: None,
        renderable: None,
        in_pre: false,
    };
    let root = t.list(vhir.root(), None, None)?;
    let root = t.b.children(&root);
    let T {
        b, exprs, hoisted, ..
    } = t;
    Ok(Template {
        hir: b.finish(root),
        exprs,
        hoisted,
    })
}

struct T<'a, 'i> {
    info: &'a Info<'i>,
    vhir: &'a Hir,
    src: &'a str,
    to: &'a mut Ast,
    names: &'a mut Names,
    b: HirBuilder<'a>,
    exprs: Vec<NodeId>,
    /// The aliases of the enclosing `v-for`s with more than one: read through their block's entry.
    aliases: FxHashMap<BindingId, (String, u32)>,
    roots: &'a [HirId],
    attrs: Option<&'a str>,
    /// On the server, inside a `<select v-model>`: the model.
    select_model: Option<NodeId>,
    hoisted: Vec<NodeId>,
    vmodel: Option<String>,
    boolean_attr: Option<String>,
    renderable: Option<String>,
    /// Inside a `<pre>`, where neither compiler touches whitespace.
    in_pre: bool,
}

impl T<'_, '_> {
    /// A template expression, rewritten.
    fn expr(&mut self, e: NodeId) -> R<NodeId> {
        let aliases = std::mem::take(&mut self.aliases);
        let out = Rewriter::new(self.info, true, &aliases).copy(self.to, e);
        self.aliases = aliases;
        out
    }

    fn root_expr(&mut self, e: NodeId) -> NodeId {
        self.exprs.push(e);
        e
    }

    fn helper(&mut self, h: Helper) -> NodeId {
        let name = self.names.helper(self.info.from, h);
        self.to.id(&name)
    }

    /// One fragment's children; `tag` is the element they belong to, `None` for the root and the
    /// blocks.
    fn list(&mut self, kids: &[HirId], parent: Option<SId>, tag: Option<&str>) -> R<Vec<SId>> {
        let (vhir, src) = (self.vhir, self.src);
        if !self.in_pre {
            check_whitespace(vhir, src, kids, tag)?;
        }
        let mut out = Vec::with_capacity(kids.len());
        let mut at = 0;
        while at < kids.len() {
            let child = kids[at];
            let node = vhir.node(child);
            let origin = vhir.origin[child];
            match &node.kind {
                NodeKind::Text(t) => {
                    let kind = svelte::spelled_text(t.raw, t.text(src).into());
                    out.push(self.b.node(kind, node.span, parent, origin));
                }
                &NodeKind::Comment { data } => {
                    out.push(
                        self.b
                            .node(SKind::Comment { data }, node.span, parent, origin),
                    );
                }
                &NodeKind::Interpolation { expr } => {
                    let e = self.expr(expr)?;
                    let callee = self.helper(Helper::ToDisplayString);
                    let call = self.to.call(callee, &[e], false, Loc::from(node.span));
                    let call = self.root_expr(call);
                    out.push(
                        self.b
                            .node(SKind::Expr { expr: call }, node.span, parent, origin),
                    );
                }
                NodeKind::Element(el) => {
                    let cond = directives(vhir, el)
                        .into_iter()
                        .find(|d| matches!(d.name, DirName::If | DirName::ElseIf | DirName::Else));
                    match cond.map(|d| d.name) {
                        Some(DirName::If) => {
                            let mut chain = vec![child];
                            let mut next = at + 1;
                            let mut end = at;
                            while next < kids.len() {
                                match &vhir.node(kids[next]).kind {
                                    NodeKind::Comment { .. } => {}
                                    NodeKind::Text(t) if t.text(src).trim().is_empty() => {}
                                    NodeKind::Element(e) => {
                                        let branch = directive(vhir, e, DirName::ElseIf)
                                            .or_else(|| directive(vhir, e, DirName::Else));
                                        match branch.map(|(_, d)| d.name) {
                                            Some(DirName::ElseIf) => {
                                                chain.push(kids[next]);
                                                end = next;
                                            }
                                            Some(_) => {
                                                chain.push(kids[next]);
                                                end = next;
                                                break;
                                            }
                                            None => break,
                                        }
                                    }
                                    _ => break,
                                }
                                next += 1;
                            }
                            out.push(self.if_chain(&chain, parent)?);
                            at = end + 1;
                            continue;
                        }
                        Some(_) => {
                            return Err(unsupported(
                                "`v-else` or `v-else-if` without `v-if`",
                                node.span,
                            ));
                        }
                        None => out.push(self.element_or_each(child, parent)?),
                    }
                }
            }
            at += 1;
        }
        Ok(out)
    }

    fn if_chain(&mut self, chain: &[HirId], parent: Option<SId>) -> R<SId> {
        let vhir = self.vhir;
        let first = vhir.node(chain[0]).span;
        let last = vhir.node(chain[chain.len() - 1]).span;
        let span = Span::new(first.lo, last.hi);
        let placeholder = SKind::Comment {
            data: Span::default(),
        };
        let id = self
            .b
            .node(placeholder, span, parent, vhir.origin[chain[0]]);
        let mut branches = Vec::new();
        let mut otherwise = None;
        for &k in chain {
            let NodeKind::Element(el) = &vhir.node(k).kind else {
                unreachable!("a chain holds elements")
            };
            if directive(vhir, el, DirName::For).is_some() {
                return Err(unsupported(
                    "`v-if` and `v-for` on one element",
                    vhir.node(k).span,
                ));
            }
            let (p, d) = directive(vhir, el, DirName::If)
                .or_else(|| directive(vhir, el, DirName::ElseIf))
                .or_else(|| directive(vhir, el, DirName::Else))
                .expect("a chain's elements have a condition");
            let test = if d.name == DirName::Else {
                None
            } else {
                let e = expr_of(d, p.span)?;
                let e = self.expr(e)?;
                Some(self.root_expr(e))
            };
            let body = self.fragment_body(k, Some(id))?;
            let body = self.b.children(&body);
            match test {
                Some(test) => branches.push(Branch {
                    test,
                    body,
                    origin: vhir.origin[k],
                }),
                None => otherwise = Some(body),
            }
        }
        let branches = self.b.branches(branches);
        self.b.set_kind(
            id,
            SKind::If {
                branches,
                otherwise,
            },
        );
        Ok(id)
    }

    /// What a branch or a `v-for` renders: a `<template>`'s children, or the element itself.
    fn fragment_body(&mut self, k: HirId, parent: Option<SId>) -> R<Vec<SId>> {
        let vhir = self.vhir;
        let node = vhir.node(k);
        let NodeKind::Element(el) = &node.kind else {
            unreachable!("directives sit on elements")
        };
        if el.tag_type == TagType::Template {
            let structural = |p: &Prop| match &p.kind {
                PropKind::Directive(d) => {
                    matches!(
                        d.name,
                        DirName::If | DirName::ElseIf | DirName::Else | DirName::For
                    ) || (d.name == DirName::Bind
                        && d.arg.as_ref().is_some_and(|a| a.text(self.src) == "key"))
                }
                PropKind::Attribute { .. } => false,
            };
            if let Some(p) = vhir.props(el.props).iter().find(|p| !structural(p)) {
                return Err(unsupported(
                    "an attribute on a `<template>` fragment",
                    p.span,
                ));
            }
            return self.list(vhir.children(el.children), parent, None);
        }
        Ok(vec![self.element(k, parent)?])
    }

    fn element_or_each(&mut self, k: HirId, parent: Option<SId>) -> R<SId> {
        let vhir = self.vhir;
        let NodeKind::Element(el) = &vhir.node(k).kind else {
            unreachable!("called on elements")
        };
        match directive(vhir, el, DirName::For) {
            Some((p, d)) => self.each(k, p, d, parent),
            None => self.element(k, parent),
        }
    }

    /// `v-for`: an `{#each}` over `renderList`, which iterates arrays, strings, numbers and objects
    /// as Vue does. One alias is the block's context; with more, the context is an entry array
    /// the aliases are read from.
    fn each(&mut self, at: HirId, prop: &Prop, dir: &Directive, parent: Option<SId>) -> R<SId> {
        let (vhir, from) = (self.vhir, self.info.from);
        let node = vhir.node(at);
        let DirExp::For(f) = &dir.exp else {
            return Err(unsupported("a `v-for` without a value", prop.span));
        };
        if !dir.modifiers.is_empty() {
            return Err(unsupported("a `v-for` modifier", prop.span));
        }
        // `renderList` passes value, key and index; Vue leaves a fourth alias undefined.
        if !(1..=3).contains(&f.params.len()) {
            return Err(unsupported(
                "a `v-for` with no alias or more than three",
                prop.span,
            ));
        }
        for &param in &f.params {
            if !matches!(from.kind(param), Kind::Ident(_)) {
                return Err(unsupported(
                    "a destructuring `v-for` alias",
                    span_of(from, param),
                ));
            }
            if let Some(b) = self.info.res.sem.binding_of(param) {
                let binding = &self.info.res.sem.bindings[b];
                if binding.writes > 0 {
                    return Err(unsupported(
                        "a write to a `v-for` alias",
                        span_of(from, param),
                    ));
                }
            }
        }
        let source = self.expr(f.source)?;
        let count = f.params.len();
        let params: Vec<String> = (0..count)
            .map(|i| self.names.fresh(from, ["value", "key", "index"][i]))
            .collect();
        let param_ids: Vec<NodeId> = params.iter().map(|p| self.to.id(p)).collect();
        let body = if count <= 1 {
            self.to.id(&params[0])
        } else {
            let items: Vec<NodeId> = params.iter().map(|p| self.to.id(p)).collect();
            self.to.array(&items, Loc::SYNTHETIC)
        };
        let item = self.to.arrow(&param_ids, body, true, false, Loc::SYNTHETIC);
        let render_list = self.helper(Helper::RenderList);
        let collection = self
            .to
            .call(render_list, &[source, item], false, Loc::SYNTHETIC);
        let collection = self.root_expr(collection);
        let outer = self.aliases.clone();
        let context = if count == 1 {
            self.to.ident(from.name(f.params[0]), from.loc(f.params[0]))
        } else {
            let entry = self.names.fresh(from, "entry");
            for (i, &param) in f.params.iter().enumerate() {
                if let Some(b) = self.info.res.sem.binding_of(param) {
                    self.aliases.insert(b, (entry.clone(), i as u32));
                }
            }
            self.to.ident(&entry, from.loc(f.params[0]))
        };
        let NodeKind::Element(el) = &node.kind else {
            unreachable!("called on elements")
        };
        let key = match directive_key(vhir, el, self.src) {
            Some((kp, kd)) => {
                let key = expr_of(kd, kp.span)?;
                let key = self.expr(key)?;
                self.root_expr(key)
            }
            None => NodeId::NONE,
        };
        let placeholder = SKind::Comment {
            data: Span::default(),
        };
        let id = self.b.node(placeholder, node.span, parent, vhir.origin[at]);
        let body = self.fragment_body(at, Some(id))?;
        let body = self.b.children(&body);
        self.aliases = outer;
        self.b.set_kind(
            id,
            SKind::Each(Each {
                collection,
                context,
                index: NodeId::NONE,
                key,
                body,
                fallback: None,
            }),
        );
        Ok(id)
    }

    #[expect(
        clippy::too_many_lines,
        reason = "one arm per attribute shape Vue reads"
    )]
    fn element(&mut self, k: HirId, parent: Option<SId>) -> R<SId> {
        let (vhir, src) = (self.vhir, self.src);
        let node = vhir.node(k);
        let NodeKind::Element(el) = &node.kind else {
            unreachable!("called on elements")
        };
        if el.tag_type != TagType::Element {
            return Err(unsupported(
                "a component, `<slot>` or `<template>`",
                el.tag.span(),
            ));
        }
        let rsv_vue::hir::Name::Source(name) = el.tag else {
            return Err(unsupported("a spelled tag name", el.tag.span()));
        };
        let tag = name.text(src);
        if tag.bytes().any(|c| c.is_ascii_uppercase()) {
            return Err(unsupported("an element name with uppercase letters", name));
        }
        let kids = vhir.children(el.children);
        if tag == "pre"
            && let Some(NodeKind::Text(t)) = kids.first().map(|&c| &vhir.node(c).kind)
            && t.text(src).starts_with(['\n', '\r'])
        {
            return Err(unsupported(
                "a `<pre>` whose text starts with a line break (the HTML parser drops it)",
                node.span,
            ));
        }
        let fallthrough = self.roots.contains(&k).then_some(self.attrs).flatten();
        let start_tag = node.span;
        let kind = self.b.element_kind(tag, parent);
        let id = self.b.node(
            SKind::Comment {
                data: Span::default(),
            },
            node.span,
            parent,
            vhir.origin[k],
        );
        let props = vhir.props(el.props);
        let mut attrs: Vec<Attribute> = Vec::new();
        let mut class: Vec<NodeId> = Vec::new();
        let mut class_at: Option<(usize, Span, u32)> = None;
        let mut model: Option<(&Prop, &Directive)> = None;
        let mut events: Vec<String> = Vec::new();
        let static_attr = |name: &str| {
            props.iter().find_map(|p| match &p.kind {
                PropKind::Attribute { name: n, value } if n.text(src) == name => {
                    Some(value.as_ref().map_or("", |v| v.text(src)))
                }
                _ => None,
            })
        };
        let bound = |name: &str| {
            props.iter().any(|p| match &p.kind {
                PropKind::Directive(d) => {
                    d.name == DirName::Bind && d.arg.as_ref().is_some_and(|a| a.text(src) == name)
                }
                PropKind::Attribute { .. } => false,
            })
        };
        let attr = |name: svelte::Name, value: AttrValue, p: &Prop| Attribute {
            name,
            value,
            span: p.span,
            owner: id,
            origin: p.origin,
        };
        for p in props {
            match &p.kind {
                PropKind::Attribute { name: n, value } => {
                    let n_text = n.text(src);
                    let value_text = value.as_ref().map(|v| v.text(src));
                    check_name(n_text, p.span)?;
                    if attrs.iter().any(|a| a.name.text(src) == n_text) {
                        return Err(unsupported("an attribute written twice", p.span));
                    }
                    match n_text {
                        "class" => {
                            let v = self.to.str(value_text.unwrap_or_default());
                            class.push(v);
                            class_at = Some((attrs.len(), p.span, p.origin));
                            continue;
                        }
                        "style" if fallthrough.is_some() => {
                            return Err(unsupported(
                                "a `style` on an element attributes fall through to",
                                p.span,
                            ));
                        }
                        "key" | "ref" | "is" => {
                            return Err(unsupported(
                                format_args!("the attribute `{n_text}`"),
                                p.span,
                            ));
                        }
                        "value" if tag == "input" => {
                            let v = self.to.str(value_text.unwrap_or_default());
                            let v = self.root_expr(v);
                            attrs.push(attr(
                                svelte::Name::Source(n.span()),
                                AttrValue::Expression {
                                    expr: v,
                                    quoted: false,
                                },
                                p,
                            ));
                            continue;
                        }
                        "value" if tag != "option" => {
                            return Err(unsupported(
                                "a static `value` other than on `<input>` and `<option>`",
                                p.span,
                            ));
                        }
                        _ => {}
                    }
                    if !reflects_as_written(n_text, tag) {
                        return Err(unsupported(
                            format_args!(
                                "the static attribute `{n_text}` here (Vue sets it as a DOM \
                                 property that does not reflect it as written)"
                            ),
                            p.span,
                        ));
                    }
                    if is_boolean_attr(n_text) && value_text.is_some_and(|v| !v.is_empty()) {
                        return Err(unsupported(
                            format_args!("a value on the boolean attribute `{n_text}`"),
                            p.span,
                        ));
                    }
                    let value = value.as_ref().map_or(AttrValue::Boolean, |v| {
                        AttrValue::Static(v.text(src).into())
                    });
                    attrs.push(attr(svelte::Name::Source(n.span()), value, p));
                }
                PropKind::Directive(d) => match d.name {
                    DirName::If | DirName::ElseIf | DirName::Else | DirName::For => {}
                    DirName::Model => {
                        if model.is_some() {
                            return Err(unsupported("two `v-model`s on one element", p.span));
                        }
                        model = Some((p, d));
                    }
                    DirName::Bind => {
                        let arg = d
                            .arg
                            .as_ref()
                            .expect("the parser requires an argument")
                            .text(src);
                        if !d.modifiers.is_empty() {
                            return Err(unsupported("a `v-bind` modifier", p.span));
                        }
                        check_name(arg, p.span)?;
                        if attrs.iter().any(|a| a.name.text(src) == arg) {
                            return Err(unsupported("an attribute written twice", p.span));
                        }
                        let e = expr_of(d, p.span)?;
                        match arg {
                            "key" if directive(vhir, el, DirName::For).is_some() => continue,
                            "class" => {
                                class.push(self.expr(e)?);
                                if class_at.is_none() {
                                    class_at = Some((attrs.len(), p.span, p.origin));
                                }
                                continue;
                            }
                            "key" | "ref" | "is" | "style" | "hidden" | "autofocus" => {
                                return Err(unsupported(format_args!("`:{arg}`"), p.span));
                            }
                            "value"
                                if tag == "input"
                                    && model.is_none()
                                    && directive(vhir, el, DirName::Model).is_none() => {}
                            "value" => {
                                return Err(unsupported(
                                    "`:value` other than on an `<input>` without `v-model`",
                                    p.span,
                                ));
                            }
                            _ if !reflects_as_written(arg, tag) => {
                                return Err(unsupported(
                                    format_args!(
                                        "`:{arg}` here (Vue sets it as a DOM property that does \
                                         not reflect it as written)"
                                    ),
                                    p.span,
                                ));
                            }
                            _ => {}
                        }
                        let v = self.expr(e)?;
                        let v = if is_boolean_attr(arg) {
                            self.boolean_value(v)
                        } else if self.info.target == Target::Server {
                            self.renderable_value(v)
                        } else {
                            v
                        };
                        let v = self.root_expr(v);
                        attrs.push(attr(
                            svelte::Name::Spelled {
                                text: arg.into(),
                                span: p.span,
                            },
                            AttrValue::Expression {
                                expr: v,
                                quoted: false,
                            },
                            p,
                        ));
                    }
                    DirName::On => {
                        let (event, handler) = self.handler(p, d)?;
                        if events.contains(&event) {
                            return Err(unsupported("two listeners for one event", p.span));
                        }
                        let handler = self.root_expr(handler);
                        attrs.push(attr(
                            svelte::Name::Spelled {
                                text: format!("on{event}").into(),
                                span: p.span,
                            },
                            AttrValue::Expression {
                                expr: handler,
                                quoted: false,
                            },
                            p,
                        ));
                        events.push(event);
                    }
                },
            }
        }
        if let Some((p, d)) = model {
            if tag == "input"
                && static_attr("type").is_none_or(|t| !matches!(t, "checkbox" | "radio"))
            {
                for e in &events {
                    if matches!(e.as_str(), "compositionstart" | "compositionend") {
                        return Err(unsupported(
                            "a composition listener beside `v-model` (Svelte attaches it before \
                             Vue's own)",
                            p.span,
                        ));
                    }
                }
            }
            if bound("type")
                || bound("true-value")
                || bound("false-value")
                || static_attr("true-value").is_some()
                || static_attr("false-value").is_some()
            {
                return Err(unsupported(
                    "`v-model` with a bound `type`, `true-value` or `false-value`",
                    p.span,
                ));
            }
            let value = static_attr("value");
            let ty = static_attr("type");
            let attr_value = self.model(tag, ty, value, p, d)?;
            if let Some(v) = attr_value {
                attrs.push(v(id, p));
            }
        }
        if tag == "option"
            && let Some(m) = self.select_model
            && static_attr("selected").is_none()
            && !bound("selected")
        {
            attrs.push(self.ssr_option_selected(m, static_attr("value"), id, node.span)?);
        }
        if fallthrough.is_some()
            || class.len() > 1
            || class.iter().any(|&c| !matches!(self.to.kind(c), Kind::Str))
        {
            self.dynamic_class(&mut attrs, &class, class_at, fallthrough, id)?;
        } else if let (Some(&c), Some((at, span, origin))) = (class.first(), class_at) {
            let v = self.to.str_value(c, src).into();
            attrs.insert(
                at,
                Attribute {
                    name: svelte::Name::Spelled {
                        text: "class".into(),
                        span,
                    },
                    value: AttrValue::Static(v),
                    span,
                    owner: id,
                    origin,
                },
            );
        }
        let attrs = self.b.attributes(attrs);
        self.b.set_kind(
            id,
            SKind::Element(SElement {
                name,
                kind,
                attrs,
                children: svelte::Children::default(),
                start_tag,
            }),
        );
        let outer = self.select_model;
        self.select_model = match (tag, model) {
            ("optgroup", _) => outer,
            ("select", Some((p, d))) if self.info.target == Target::Server => {
                Some(expr_of(d, p.span)?)
            }
            _ => None,
        };
        let outer_pre = self.in_pre;
        self.in_pre |= tag == "pre";
        let children = self.list(kids, Some(id), Some(tag));
        self.in_pre = outer_pre;
        self.select_model = outer;
        let children = self.b.children(&children?);
        self.b.set_element_children(id, children);
        Ok(id)
    }

    /// `class={normalizeClass([…own, attrs.class])}`, at the own class's position or last.
    fn dynamic_class(
        &mut self,
        attrs: &mut Vec<Attribute>,
        class: &[NodeId],
        at: Option<(usize, Span, u32)>,
        fallthrough: Option<&str>,
        owner: SId,
    ) -> R<()> {
        let normalize = |t: &mut Self, items: &[NodeId]| {
            let list = t.to.array(items, Loc::SYNTHETIC);
            let callee = t.helper(Helper::NormalizeClass);
            t.to.call0(callee, &[list])
        };
        let own = match class {
            [] => None,
            &[only] if matches!(self.to.kind(only), Kind::Str) => Some(only),
            _ => Some(normalize(self, class)),
        };
        let value = match fallthrough {
            None => own,
            Some(a) => {
                // runtime-core `mergeProps` merges the class only when the attributes carry one.
                let key = self.to.str("class");
                let o = self.to.id(a);
                let has = self.to.binary(BinOp::In, key, o, Loc::SYNTHETIC);
                let mut items = class.to_vec();
                let o = self.to.id(a);
                items.push(self.to.dot(o, "class"));
                let merged = normalize(self, &items);
                let otherwise = own.unwrap_or_else(|| self.to.id("undefined"));
                let _merged_class = self.to.cond(has, merged, otherwise, Loc::SYNTHETIC);
                // `{...attrs}` before that class waits for the Svelte port to lower spreads.
                return Err(unsupported(
                    "attributes falling through to the root (they spread as `{...attrs}`, which \
                     the Svelte port does not lower yet)",
                    at.map_or_else(Span::default, |(_, span, _)| span),
                ));
            }
        };
        let Some(value) = value else {
            return Ok(());
        };
        let value = self.root_expr(value);
        let (index, span, origin) = match at {
            Some(at) if fallthrough.is_none() => at,
            Some((_, span, origin)) => (attrs.len(), span, origin),
            None => (attrs.len(), Span::default(), u32::MAX),
        };
        attrs.insert(
            index,
            Attribute {
                name: svelte::Name::Spelled {
                    text: "class".into(),
                    span,
                },
                value: AttrValue::Expression {
                    expr: value,
                    quoted: false,
                },
                span,
                owner,
                origin,
            },
        );
        Ok(())
    }

    /// runtime-dom `patchDOMProp` for a boolean property, and server-renderer's
    /// `includeBooleanAttr`: present for any truthy value and for `''`.
    fn boolean_value(&mut self, v: NodeId) -> NodeId {
        let callee = if self.info.target == Target::Server {
            self.helper(Helper::SsrIncludeBooleanAttr)
        } else {
            let name = if let Some(name) = &self.boolean_attr {
                name.clone()
            } else {
                let name = self.names.fresh(self.info.from, "includeBooleanAttr");
                let decl = include_boolean_attr(self.to, &name, self.names, self.info.from);
                self.hoisted.push(decl);
                self.boolean_attr = Some(name.clone());
                name
            };
            self.to.id(&name)
        };
        self.to.call0(callee, &[v])
    }

    /// server-renderer `isRenderableAttrValue`: Vue renders only strings, numbers and booleans.
    fn renderable_value(&mut self, v: NodeId) -> NodeId {
        let name = if let Some(name) = &self.renderable {
            name.clone()
        } else {
            let name = self.names.fresh(self.info.from, "renderable");
            let decl = renderable(self.to, &name, self.names, self.info.from);
            self.hoisted.push(decl);
            self.renderable = Some(name.clone());
            name
        };
        let callee = self.to.id(&name);
        self.to.call0(callee, &[v])
    }

    /// `@event.modifiers="handler"`, as compiler-core `transformOn` and compiler-dom's
    /// `resolveModifiers` build it.
    fn handler(&mut self, p: &Prop, d: &Directive) -> R<(String, NodeId)> {
        let (src, from) = (self.src, self.info.from);
        let event = d
            .arg
            .as_ref()
            .expect("the parser requires an argument")
            .text(src);
        if event.is_empty() || !event.bytes().all(|c| c.is_ascii_lowercase()) {
            return Err(unsupported(
                "an event name other than lowercase letters (Vue hyphenates it, Svelte \
                 lowercases it)",
                p.span,
            ));
        }
        let e = expr_of(d, p.span)?;
        let mut handler = match from.kind(e) {
            Kind::Arrow { .. } => self.expr(e)?,
            Kind::Function { .. } => {
                return Err(unsupported(
                    "a `function` expression as a handler (its `this` differs)",
                    span_of(from, e),
                ));
            }
            Kind::Ident(_) => {
                let function = self.info.res.sem.binding_of(e).is_some_and(|b| {
                    let binding = &self.info.res.sem.bindings[b];
                    binding.scope == rsv_js::scope::ScopeId::ROOT
                        && (binding.kind == DeclKind::Function
                            || (binding.kind == DeclKind::Const
                                && binding.init(from).is_some_and(|i| {
                                    matches!(
                                        from.kind(i),
                                        Kind::Arrow { .. } | Kind::Function { .. }
                                    )
                                })))
                });
                if !function {
                    return Err(unsupported(
                        "a handler named by something other than a function the script declares",
                        span_of(from, e),
                    ));
                }
                self.expr(e)?
            }
            Kind::Member { .. } => {
                return Err(unsupported(
                    "a member expression as a handler",
                    span_of(from, e),
                ));
            }
            _ => {
                let event_param = self.names.fresh(from, "event");
                let aliases = std::mem::take(&mut self.aliases);
                let mut rw = Rewriter::new(self.info, true, &aliases);
                rw.event = Some(&event_param);
                let body = rw.copy(self.to, e);
                self.aliases = aliases;
                let body = body?;
                let param = self.to.id(&event_param);
                self.to.arrow(&[param], body, true, false, Loc::SYNTHETIC)
            }
        };
        let mut non_key = Vec::new();
        let mut keys = Vec::new();
        for m in &d.modifiers {
            let m = m.text(src);
            match m {
                "stop" | "prevent" | "self" | "ctrl" | "shift" | "alt" | "meta" | "exact" => {
                    non_key.push(m);
                }
                "once" | "passive" | "capture" | "left" | "right" | "middle" | "native" => {
                    return Err(unsupported(
                        format_args!("the event modifier `.{m}`"),
                        p.span,
                    ));
                }
                _ => keys.push(m),
            }
        }
        if !non_key.is_empty() {
            let callee = self.helper(Helper::WithModifiers);
            let list: Vec<NodeId> = non_key.iter().map(|m| self.to.str(m)).collect();
            let list = self.to.array(&list, Loc::SYNTHETIC);
            handler = self.to.call0(callee, &[handler, list]);
        }
        if !keys.is_empty() && matches!(event, "keyup" | "keydown" | "keypress") {
            let callee = self.helper(Helper::WithKeys);
            let list: Vec<NodeId> = keys.iter().map(|m| self.to.str(m)).collect();
            let list = self.to.array(&list, Loc::SYNTHETIC);
            handler = self.to.call0(callee, &[handler, list]);
        }
        Ok((event.to_owned(), handler))
    }

    /// `v-model`. On the client, Vue's own directive runs on the element through an attachment;
    /// on the server, the attribute compiler-ssr's `ssrTransformModel` renders.
    #[expect(clippy::type_complexity, reason = "an attribute waiting for its owner")]
    fn model(
        &mut self,
        tag: &str,
        ty: Option<&str>,
        value: Option<&str>,
        p: &Prop,
        d: &Directive,
    ) -> R<Option<Box<dyn FnOnce(SId, &Prop) -> Attribute>>> {
        let (src, from) = (self.src, self.info.from);
        if d.arg.is_some() {
            return Err(unsupported("a `v-model` argument on an element", p.span));
        }
        let exp = expr_of(d, p.span)?;
        if !matches!(from.kind(exp), Kind::Ident(_) | Kind::Member { .. }) {
            return Err(unsupported(
                "a `v-model` value other than a variable or a member",
                span_of(from, exp),
            ));
        }
        self.check_model_target(exp)?;
        let dir = match (tag, ty) {
            ("input", Some("checkbox")) => Helper::VModelCheckbox,
            ("input", Some("radio")) => Helper::VModelRadio,
            ("input", Some("file")) => {
                return Err(unsupported("`v-model` on a file input", p.span));
            }
            ("input", _) => {
                if value.is_some() {
                    return Err(unsupported("`v-model` beside a `value`", p.span));
                }
                Helper::VModelText
            }
            ("select", _) => Helper::VModelSelect,
            _ => {
                return Err(unsupported(format_args!("`v-model` on `<{tag}>`"), p.span));
            }
        };
        let mut modifiers = Vec::new();
        for m in &d.modifiers {
            let m = m.text(src);
            if !matches!(m, "lazy" | "number" | "trim") {
                return Err(unsupported(
                    format_args!("the `v-model` modifier `.{m}`"),
                    p.span,
                ));
            }
            modifiers.push(m);
        }
        if self.info.target == Target::Server {
            return self.ssr_model(dir, exp, value);
        }
        let model = self.expr(exp)?;
        let callee = self.helper(dir);
        let mods: Vec<NodeId> = modifiers
            .iter()
            .map(|m| {
                let key = self.to.id(m);
                let yes = self.to.bool(true, Loc::SYNTHETIC);
                self.to.property(key, yes, 0, Loc::SYNTHETIC)
            })
            .collect();
        let mods = self.to.object(&mods, Loc::SYNTHETIC);
        let param = self.names.fresh(from, "value");
        let target = self.expr(exp)?;
        let new_value = self.to.id(&param);
        let assign = self
            .to
            .assign(AssignOp::Assign, target, new_value, Loc::SYNTHETIC);
        let param_id = self.to.id(&param);
        let assigner = self
            .to
            .arrow(&[param_id], assign, true, false, Loc::SYNTHETIC);
        let key = self.to.str("onUpdate:modelValue");
        let mut props = vec![self.to.property(key, assigner, 0, Loc::SYNTHETIC)];
        for (name, text) in [("type", ty), ("value", value)] {
            if let Some(text) = text {
                let key = self.to.id(name);
                let text = self.to.str(text);
                props.push(self.to.property(key, text, 0, Loc::SYNTHETIC));
            }
        }
        let props = self.to.object(&props, Loc::SYNTHETIC);
        let vmodel = self.vmodel_helper();
        let vmodel = self.to.id(&vmodel);
        let call = self.to.call(
            vmodel,
            &[callee, model, mods, props],
            false,
            Loc::from(p.span),
        );
        // The attachment `{@attach call}` waits for the Svelte port to lower `{@attach}`.
        let _attachment = self.root_expr(call);
        Err(unsupported(
            "`v-model` on the client (it runs as `{@attach}`, which the Svelte port does not lower \
             yet)",
            p.span,
        ))
    }

    #[expect(clippy::type_complexity, reason = "an attribute waiting for its owner")]
    fn ssr_model(
        &mut self,
        dir: Helper,
        e: NodeId,
        value: Option<&str>,
    ) -> R<Option<Box<dyn FnOnce(SId, &Prop) -> Attribute>>> {
        let (name, v) = match dir {
            Helper::VModelText => {
                let m = self.expr(e)?;
                ("value", self.renderable_value(m))
            }
            Helper::VModelCheckbox => {
                let value = self.value_or_null(value);
                let test = self.is_array(e)?;
                let m = self.expr(e)?;
                let contain = self.helper(Helper::SsrLooseContain);
                let contain = self.to.call0(contain, &[m, value]);
                let m = self.expr(e)?;
                let c = self.to.cond(test, contain, m, Loc::SYNTHETIC);
                ("checked", self.ssr_boolean(c))
            }
            Helper::VModelRadio => {
                let value = self.value_or_null(value);
                let m = self.expr(e)?;
                let eq = self.helper(Helper::SsrLooseEqual);
                let eq = self.to.call0(eq, &[m, value]);
                ("checked", self.ssr_boolean(eq))
            }
            _ => return Ok(None),
        };
        let v = self.root_expr(v);
        Ok(Some(Box::new(move |owner, p| Attribute {
            name: svelte::Name::Spelled {
                text: name.into(),
                span: p.span,
            },
            value: AttrValue::Expression {
                expr: v,
                quoted: false,
            },
            span: p.span,
            owner,
            origin: p.origin,
        })))
    }

    /// compiler-ssr `processOption`.
    fn ssr_option_selected(
        &mut self,
        model: NodeId,
        value: Option<&str>,
        owner: SId,
        span: Span,
    ) -> R<Attribute> {
        let test = self.is_array(model)?;
        let v = self.value_or_null(value);
        let m = self.expr(model)?;
        let contain = self.helper(Helper::SsrLooseContain);
        let contain = self.to.call0(contain, &[m, v]);
        let value = self.value_or_null(value);
        let m = self.expr(model)?;
        let eq = self.helper(Helper::SsrLooseEqual);
        let eq = self.to.call0(eq, &[m, value]);
        let c = self.to.cond(test, contain, eq, Loc::SYNTHETIC);
        let v = self.ssr_boolean(c);
        let v = self.root_expr(v);
        Ok(Attribute {
            name: svelte::Name::Spelled {
                text: "selected".into(),
                span,
            },
            value: AttrValue::Expression {
                expr: v,
                quoted: false,
            },
            span,
            owner,
            origin: u32::MAX,
        })
    }

    fn value_or_null(&mut self, value: Option<&str>) -> NodeId {
        match value {
            Some(v) => self.to.str(v),
            None => self.to.null(Loc::SYNTHETIC),
        }
    }

    fn is_array(&mut self, e: NodeId) -> R<NodeId> {
        let m = self.expr(e)?;
        let array = self.to.id("Array");
        let is_array = self.to.dot(array, "isArray");
        Ok(self.to.call0(is_array, &[m]))
    }

    fn ssr_boolean(&mut self, v: NodeId) -> NodeId {
        let callee = self.helper(Helper::SsrIncludeBooleanAttr);
        self.to.call0(callee, &[v])
    }

    /// What `v-model` may assign: not a prop, a computed, a `v-for` alias, a constant or an
    /// unresolved name.
    fn check_model_target(&self, e: NodeId) -> R<()> {
        let from = self.info.from;
        let mut root = e;
        while let Kind::Member { object, .. } = from.kind(root) {
            root = object;
        }
        if root == e {
            let ok = self.info.res.sem.binding_of(e).is_some_and(|b| {
                let binding = &self.info.res.sem.bindings[b];
                self.info.class.get(&b) == Some(&Class::Ref)
                    || (binding.scope == rsv_js::scope::ScopeId::ROOT
                        && matches!(binding.kind, DeclKind::Let | DeclKind::Var))
            });
            if !ok {
                return Err(unsupported(
                    "`v-model` on something other than a ref or a variable",
                    span_of(from, e),
                ));
            }
        } else if matches!(from.kind(root), Kind::Ident(_))
            && self
                .info
                .class_of(root)
                .is_some_and(|c| matches!(c, Class::Props | Class::Computed))
        {
            return Err(unsupported(
                "`v-model` on a prop or a computed",
                span_of(from, e),
            ));
        }
        Ok(())
    }

    fn vmodel_helper(&mut self) -> String {
        if let Some(n) = &self.vmodel {
            return n.clone();
        }
        let from = self.info.from;
        let name = self.names.fresh(from, "vmodel");
        let untrack = self.names.helper(from, Helper::Untrack);
        let decls = vmodel(self.to, &name, &untrack, self.names, from);
        self.hoisted.extend(decls);
        self.vmodel = Some(name.clone());
        name
    }
}

/// The `:key` of a `v-for` element.
fn directive_key<'h>(hir: &'h Hir, el: &Element, src: &str) -> Option<(&'h Prop, &'h Directive)> {
    hir.props(el.props).iter().find_map(|p| match &p.kind {
        PropKind::Directive(d)
            if d.name == DirName::Bind && d.arg.as_ref().is_some_and(|a| a.text(src) == "key") =>
        {
            Some((p, d))
        }
        _ => None,
    })
}

fn check_name(name: &str, span: Span) -> R<()> {
    if name.is_empty()
        || !name
            .bytes()
            .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == b'-')
    {
        return Err(unsupported(
            format_args!("the attribute name `{name}` (svue takes lowercase names)"),
            span,
        ));
    }
    Ok(())
}

/// `@vue/shared`'s `isBooleanAttr` with `isSpecialBooleanAttr`.
fn is_boolean_attr(name: &str) -> bool {
    matches!(
        name,
        "itemscope"
            | "allowfullscreen"
            | "formnovalidate"
            | "ismap"
            | "nomodule"
            | "novalidate"
            | "readonly"
            | "async"
            | "autofocus"
            | "autoplay"
            | "controls"
            | "default"
            | "defer"
            | "disabled"
            | "hidden"
            | "inert"
            | "loop"
            | "open"
            | "required"
            | "reversed"
            | "scoped"
            | "seamless"
            | "checked"
            | "muted"
            | "multiple"
            | "selected"
    )
}

/// Whether Vue's runtime leaves the attribute as written: runtime-dom's `shouldSetAsProp` sets
/// some names as DOM properties, and these properties either do not reflect to the attribute or
/// reflect it converted (to a number, or for `value` not at all).
fn reflects_as_written(name: &str, tag: &str) -> bool {
    match name {
        "checked" | "selected" | "muted" | "autofocus" | "indeterminate" | "start" | "size"
        | "span" | "high" | "low" | "optimum" | "srcobject" | "innerhtml" | "textcontent"
        | "innertext" => false,
        "min" | "max" => tag == "input",
        "width" | "height" => matches!(tag, "img" | "video" | "canvas" | "source"),
        _ => true,
    }
}

/// Vue's text is already condensed, and Svelte's `clean_nodes` cleans it again (the Svelte port
/// has no `preserveWhitespace` yet). Most of that is the identity on condensed text; refused are
/// the cases where it is not: text that opens or closes a fragment with a space (Svelte trims it),
/// a space alone in an element whose whitespace Svelte drops, and two texts a comment separates
/// (Svelte drops the comment and merges their spaces).
fn check_whitespace(vhir: &Hir, src: &str, kids: &[HirId], tag: Option<&str>) -> R<()> {
    let refuse = |span: Span| {
        Err(unsupported(
            "whitespace that Svelte cleans differently from Vue (the Svelte port has no \
             `preserveWhitespace` yet)",
            span,
        ))
    };
    let items: Vec<(Option<&str>, Span)> = kids
        .iter()
        .filter_map(|&k| {
            let node = vhir.node(k);
            match &node.kind {
                NodeKind::Comment { .. } => None,
                NodeKind::Text(t) => Some((Some(t.text(src)), node.span)),
                _ => Some((None, node.span)),
            }
        })
        .collect();
    let is_ws = |c: char| matches!(c, ' ' | '\t' | '\r' | '\n' | '\u{c}');
    let blank = |t: &str| t.chars().all(is_ws);
    for pair in items.windows(2) {
        if let [(Some(_), _), (Some(_), span)] = pair {
            return refuse(*span);
        }
    }
    if let Some(&(Some(t), span)) = items.first()
        && !blank(t)
        && t.starts_with(is_ws)
    {
        return refuse(span);
    }
    if let Some(&(Some(t), span)) = items.last()
        && !blank(t)
        && t.ends_with(is_ws)
    {
        return refuse(span);
    }
    let drops_spaces = matches!(
        tag,
        Some("select" | "tr" | "table" | "tbody" | "thead" | "tfoot" | "colgroup" | "datalist")
    );
    if drops_spaces && let Some(&(_, span)) = items.iter().find(|(t, _)| t.is_some_and(blank)) {
        return refuse(span);
    }
    Ok(())
}

fn function_decl(to: &mut Ast, name: &str, params: &[&str], body: &[NodeId]) -> NodeId {
    let name = to.id(name);
    let params: Vec<NodeId> = params.iter().map(|p| to.id(p)).collect();
    let block = to.block(body, Loc::SYNTHETIC);
    to.function(true, Some(name), &params, block, false, Loc::SYNTHETIC)
}

/// `function includeBooleanAttr(value) { return !!value || value === ''; }`
fn include_boolean_attr(to: &mut Ast, name: &str, names: &mut Names, from: &Ast) -> NodeId {
    let v = names.fresh(from, "value");
    let a = to.id(&v);
    let not = to.unary(UnaryOp::Not, a, Loc::SYNTHETIC);
    let not = to.unary(UnaryOp::Not, not, Loc::SYNTHETIC);
    let a = to.id(&v);
    let empty = to.str("");
    let eq = to.binary(BinOp::StrictEq, a, empty, Loc::SYNTHETIC);
    let or = to.logical(LogicalOp::Or, not, eq, Loc::SYNTHETIC);
    let ret = to.return_(Some(or), Loc::SYNTHETIC);
    function_decl(to, name, &[&v], &[ret])
}

/// `function renderable(value) { return typeof value === 'string' || … ? value : undefined; }`
fn renderable(to: &mut Ast, name: &str, names: &mut Names, from: &Ast) -> NodeId {
    let v = names.fresh(from, "value");
    let mut test = None;
    for ty in ["string", "number", "boolean"] {
        let a = to.id(&v);
        let t = to.unary(UnaryOp::TypeOf, a, Loc::SYNTHETIC);
        let s = to.str(ty);
        let eq = to.binary(BinOp::StrictEq, t, s, Loc::SYNTHETIC);
        test = Some(test.map_or(eq, |l| to.logical(LogicalOp::Or, l, eq, Loc::SYNTHETIC)));
    }
    let a = to.id(&v);
    let undefined = to.id("undefined");
    let c = to.cond(test.expect("three types"), a, undefined, Loc::SYNTHETIC);
    let ret = to.return_(Some(c), Loc::SYNTHETIC);
    function_decl(to, name, &[&v], &[ret])
}

/// Vue's directive hooks, run on a Svelte element:
///
/// ```js
/// const bindings = new WeakMap();
/// function vmodel(dir, value, modifiers, props) {
///   if (dir.deep) traverse(value);
///   return (el) => untrack(() => {
///     const vnode = { props };
///     let binding = bindings.get(el);
///     if (binding === undefined) {
///       binding = { value, oldValue: undefined, modifiers };
///       bindings.set(el, binding);
///       dir.created?.(el, binding, vnode);
///       dir.mounted?.(el, binding, vnode);
///     } else {
///       binding.oldValue = binding.value;
///       binding.value = value;
///       dir.beforeUpdate?.(el, binding, vnode);
///       dir.updated?.(el, binding, vnode);
///     }
///   });
/// }
/// function traverse(value, seen = new Set()) {
///   if (typeof value !== 'object' || value === null || seen.has(value)) return;
///   seen.add(value);
///   if (Array.isArray(value)) for (let i = 0; i < value.length; i++) traverse(value[i], seen);
///   else if (value instanceof Set || value instanceof Map)
///     value.forEach((v) => traverse(v, seen));
///   else if (Object.prototype.toString.call(value) === '[object Object]')
///     for (const key of Object.keys(value)) traverse(value[key], seen);
/// }
/// ```
///
/// The getter runs in the attachment's tracked scope, so a deep directive (`vModelCheckbox`,
/// `vModelSelect`) re-runs its update hooks when the value changes inside, as reactivity-core's
/// `traverse` makes a Vue render do; the hooks themselves run untracked, as Vue runs them with
/// tracking paused.
#[expect(
    clippy::too_many_lines,
    clippy::many_single_char_names,
    reason = "builds one helper, one node at a time"
)]
fn vmodel(to: &mut Ast, name: &str, untrack: &str, names: &mut Names, from: &Ast) -> Vec<NodeId> {
    let bindings = names.fresh(from, "vmodelBindings");
    let traverse = names.fresh(from, "traverse");
    let n = |names: &mut Names, base: &str| names.fresh(from, base);
    let (dir, value, modifiers, props) = (
        n(names, "dir"),
        n(names, "value"),
        n(names, "modifiers"),
        n(names, "props"),
    );
    let (el, vnode, binding) = (n(names, "el"), n(names, "vnode"), n(names, "binding"));
    let (seen, item, i) = (n(names, "seen"), n(names, "item"), n(names, "i"));
    let id = |to: &mut Ast, s: &str| to.id(s);
    let stmt = |to: &mut Ast, e: NodeId| to.expr_stmt(e);
    let hook = |to: &mut Ast, hook: &str| {
        let d = to.id(&dir);
        let h = to.id(hook);
        let callee = to.member(d, h, false, false, Loc::SYNTHETIC);
        let args = [to.id(&el), to.id(&binding), to.id(&vnode)];
        let call = to.call(callee, &args, true, Loc::SYNTHETIC);
        to.expr_stmt(call)
    };
    let set_prop = |to: &mut Ast, object: &str, prop: &str, value: NodeId| {
        let o = to.id(object);
        let target = to.dot(o, prop);
        let a = to.assign(AssignOp::Assign, target, value, Loc::SYNTHETIC);
        to.expr_stmt(a)
    };

    let weak_map = id(to, "WeakMap");
    let new_map = to.new_(weak_map, &[], Loc::SYNTHETIC);
    let b = id(to, &bindings);
    let bindings_decl = to.let_(flag::CONST, b, Some(new_map));

    // The hooks.
    let mut inner = Vec::new();
    let props_ref = id(to, &props);
    let props_key = id(to, "props");
    let vnode_props = to.property(props_key, props_ref, 0, Loc::SYNTHETIC);
    let vnode_obj = to.object(&[vnode_props], Loc::SYNTHETIC);
    let vn = id(to, &vnode);
    inner.push(to.let_(flag::CONST, vn, Some(vnode_obj)));
    let b = id(to, &bindings);
    let get = to.dot(b, "get");
    let e = id(to, &el);
    let get = to.call0(get, &[e]);
    let bn = id(to, &binding);
    inner.push(to.let_(flag::LET, bn, Some(get)));
    let bn = id(to, &binding);
    let undefined = id(to, "undefined");
    let test = to.binary(BinOp::StrictEq, bn, undefined, Loc::SYNTHETIC);
    let mut created = Vec::new();
    let fields: Vec<NodeId> = [
        ("value", value.as_str()),
        ("oldValue", "undefined"),
        ("modifiers", modifiers.as_str()),
    ]
    .iter()
    .map(|&(k, v)| {
        let key = to.id(k);
        let val = to.id(v);
        to.property(key, val, 0, Loc::SYNTHETIC)
    })
    .collect();
    let obj = to.object(&fields, Loc::SYNTHETIC);
    let bn = id(to, &binding);
    let a = to.assign(AssignOp::Assign, bn, obj, Loc::SYNTHETIC);
    created.push(stmt(to, a));
    let b = id(to, &bindings);
    let set = to.dot(b, "set");
    let args = [id(to, &el), id(to, &binding)];
    let set = to.call0(set, &args);
    created.push(stmt(to, set));
    created.push(hook(to, "created"));
    created.push(hook(to, "mounted"));
    let created = to.block(&created, Loc::SYNTHETIC);
    let mut updated = Vec::new();
    let bn = id(to, &binding);
    let old = to.dot(bn, "value");
    updated.push(set_prop(to, &binding, "oldValue", old));
    let v = id(to, &value);
    updated.push(set_prop(to, &binding, "value", v));
    updated.push(hook(to, "beforeUpdate"));
    updated.push(hook(to, "updated"));
    let updated = to.block(&updated, Loc::SYNTHETIC);
    inner.push(to.if_(test, created, Some(updated), Loc::SYNTHETIC));
    let inner = to.block(&inner, Loc::SYNTHETIC);
    let untracked = to.arrow(&[], inner, false, false, Loc::SYNTHETIC);
    let u = id(to, untrack);
    let call = to.call0(u, &[untracked]);
    let e = id(to, &el);
    let attachment = to.arrow(&[e], call, true, false, Loc::SYNTHETIC);
    let mut body = Vec::new();
    let d = id(to, &dir);
    let deep = to.dot(d, "deep");
    let t = id(to, &traverse);
    let v = id(to, &value);
    let call = to.call0(t, &[v]);
    let call = stmt(to, call);
    body.push(to.if_(deep, call, None, Loc::SYNTHETIC));
    body.push(to.return_(Some(attachment), Loc::SYNTHETIC));
    let vmodel = function_decl(to, name, &[&dir, &value, &modifiers, &props], &body);

    // traverse(value, seen = new Set())
    let mut body = Vec::new();
    let v = id(to, &value);
    let ty = to.unary(UnaryOp::TypeOf, v, Loc::SYNTHETIC);
    let object = to.str("object");
    let not_object = to.binary(BinOp::StrictNotEq, ty, object, Loc::SYNTHETIC);
    let v = id(to, &value);
    let null = to.null(Loc::SYNTHETIC);
    let is_null = to.binary(BinOp::StrictEq, v, null, Loc::SYNTHETIC);
    let s = id(to, &seen);
    let has = to.dot(s, "has");
    let v = id(to, &value);
    let has = to.call0(has, &[v]);
    let test = to.logical(LogicalOp::Or, not_object, is_null, Loc::SYNTHETIC);
    let test = to.logical(LogicalOp::Or, test, has, Loc::SYNTHETIC);
    let ret = to.return_(None, Loc::SYNTHETIC);
    body.push(to.if_(test, ret, None, Loc::SYNTHETIC));
    let s = id(to, &seen);
    let add = to.dot(s, "add");
    let v = id(to, &value);
    let add = to.call0(add, &[v]);
    body.push(stmt(to, add));
    let recurse = |to: &mut Ast, arg: NodeId| {
        let t = to.id(&traverse);
        let s = to.id(&seen);
        let call = to.call0(t, &[arg, s]);
        to.expr_stmt(call)
    };
    // for (let i = 0; i < value.length; i++) traverse(value[i], seen);
    let i0 = id(to, &i);
    let zero = to.num(0.0, Loc::SYNTHETIC);
    let init = to.let_(flag::LET, i0, Some(zero));
    let iv = id(to, &i);
    let v = id(to, &value);
    let len = to.dot(v, "length");
    let lt = to.binary(BinOp::Lt, iv, len, Loc::SYNTHETIC);
    let iv = id(to, &i);
    let inc = to.update(rsv_js::ops::UpdateOp::Inc, false, iv, Loc::SYNTHETIC);
    let v = id(to, &value);
    let iv = id(to, &i);
    let at = to.member(v, iv, true, false, Loc::SYNTHETIC);
    let each_index = recurse(to, at);
    let for_array = to.for_(Some(init), Some(lt), Some(inc), each_index, Loc::SYNTHETIC);
    let array = id(to, "Array");
    let is_array = to.dot(array, "isArray");
    let v = id(to, &value);
    let is_array = to.call0(is_array, &[v]);
    // value.forEach((item) => traverse(item, seen));
    let v = id(to, &value);
    let for_each = to.dot(v, "forEach");
    let it = id(to, &item);
    let t = id(to, &traverse);
    let s = id(to, &seen);
    let it2 = id(to, &item);
    let rec = to.call0(t, &[it2, s]);
    let cb = to.arrow(&[it], rec, true, false, Loc::SYNTHETIC);
    let for_each = to.call0(for_each, &[cb]);
    let for_each = stmt(to, for_each);
    let mut collection = None;
    for class in ["Set", "Map"] {
        let v = id(to, &value);
        let c = id(to, class);
        let is_instance = to.binary(BinOp::InstanceOf, v, c, Loc::SYNTHETIC);
        collection = Some(collection.map_or(is_instance, |l| {
            to.logical(LogicalOp::Or, l, is_instance, Loc::SYNTHETIC)
        }));
    }
    // for (const key in value) traverse(value[key], seen) — as a `for` over `Object.keys`, the
    // statement forms this tree has.
    let keys = n(names, "keys");
    let object = id(to, "Object");
    let object_keys = to.dot(object, "keys");
    let v = id(to, &value);
    let all_keys = to.call0(object_keys, &[v]);
    let k = id(to, &keys);
    let keys_decl = to.let_(flag::CONST, k, Some(all_keys));
    let i0 = id(to, &i);
    let zero = to.num(0.0, Loc::SYNTHETIC);
    let init = to.let_(flag::LET, i0, Some(zero));
    let iv = id(to, &i);
    let k = id(to, &keys);
    let len = to.dot(k, "length");
    let lt = to.binary(BinOp::Lt, iv, len, Loc::SYNTHETIC);
    let iv = id(to, &i);
    let inc = to.update(rsv_js::ops::UpdateOp::Inc, false, iv, Loc::SYNTHETIC);
    let v = id(to, &value);
    let k = id(to, &keys);
    let iv = id(to, &i);
    let key_at = to.member(k, iv, true, false, Loc::SYNTHETIC);
    let at = to.member(v, key_at, true, false, Loc::SYNTHETIC);
    let each_key = recurse(to, at);
    let for_keys = to.for_(Some(init), Some(lt), Some(inc), each_key, Loc::SYNTHETIC);
    let object_body = to.block(&[keys_decl, for_keys], Loc::SYNTHETIC);
    let object = id(to, "Object");
    let proto = to.dot(object, "prototype");
    let to_string = to.dot(proto, "toString");
    let call = to.dot(to_string, "call");
    let v = id(to, &value);
    let tag = to.call0(call, &[v]);
    let plain = to.str("[object Object]");
    let is_plain = to.binary(BinOp::StrictEq, tag, plain, Loc::SYNTHETIC);
    let object_branch = to.if_(is_plain, object_body, None, Loc::SYNTHETIC);
    let collection_branch = to.if_(
        collection.expect("two classes"),
        for_each,
        Some(object_branch),
        Loc::SYNTHETIC,
    );
    body.push(to.if_(is_array, for_array, Some(collection_branch), Loc::SYNTHETIC));
    let s = id(to, &seen);
    let set = id(to, "Set");
    let new_set = to.new_(set, &[], Loc::SYNTHETIC);
    let seen_param = to.assign_pat(s, new_set, Loc::SYNTHETIC);
    let tn = id(to, &traverse);
    let vp = id(to, &value);
    let block = to.block(&body, Loc::SYNTHETIC);
    let traverse_decl = to.function(
        true,
        Some(tn),
        &[vp, seen_param],
        block,
        false,
        Loc::SYNTHETIC,
    );
    vec![bindings_decl, vmodel, traverse_decl]
}
