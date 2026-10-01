//! The template: the Svelte HIR, read with Svelte's meaning, as a Vue template HIR built through
//! [`rsv_vue::hir::HirBuilder`].
//!
//! Text is what Svelte's [`clean_nodes`] leaves; the Vue HIR is post-condense, so the Vue compiler
//! keeps it as is. Expressions are copied into the component's tree; a reference to a prop becomes
//! `$$props.<key>` and everything else is left to the Vue compiler, which unwraps setup refs.
//!
//! The client and the server output differ where Svelte's client and server runtimes do: the
//! client mirrors what Svelte's DOM updates do (`set_text`, `set_attribute`, `set_value`, the
//! binding effects), the server what its renderer prints (`escape`, `attr`, `stringify`).

use rsv_js::copy::{Rewrite, Verbatim, copy};
use rsv_js::ops::{AssignOp, BinOp, LogicalOp, UnaryOp};
use rsv_js::scope::{BindingId, DeclKind, ScopeId};
use rsv_js::{Ast, Kind, NodeId};
use rsv_kernel::idx::Idx;
use rsv_kernel::source::{Loc, Span};
use rsv_svelte::analyze::Analysis;
use rsv_svelte::evaluate::Val;
use rsv_svelte::hir::{
    AttrValue, Attribute, Children, Element, ElementKind, Hir, HirId, NodeKind, Part,
};
use rsv_svelte::lower::{Item, Parent, clean_nodes, sanitize_template_string};
use rsv_svelte::resolve::{BindKind, Resolution};
use rsv_vue::ast::{DirExp, DirName, ForExp};
use rsv_vue::hir::{self as vue, HirBuilder, Name, PropKind, Text};
use rustc_hash::FxHashSet;

use crate::helpers::{self, Helper};
use crate::script::{Plan, VUE_GLOBALS, prop_member, walk};
use crate::{R, unsupported};

#[derive(Debug)]
pub struct Built {
    pub hir: vue::Hir,
    /// The helpers the template calls, sorted.
    pub helpers: Vec<Helper>,
}

/// Svelte's passive events: a listener for them cannot prevent the default.
const PASSIVE_EVENTS: &[&str] = &["touchstart", "touchmove"];

/// The text-like input types whose `bind:value` is Svelte's string binding.
const TEXT_INPUT_TYPES: &[&str] = &["text", "search", "email", "url", "tel", "password"];

/// Svelte's boolean attributes that are a boolean property of these elements (where Svelte's
/// client assigns the property and Vue's sets the property or the boolean attribute), that Vue's
/// server renders as a boolean attribute, and that the user cannot change.
const BOOLEAN_ATTRIBUTES: &[(&str, &[&str])] = &[
    (
        "disabled",
        &[
            "button", "fieldset", "input", "optgroup", "option", "select", "textarea",
        ],
    ),
    ("required", &["input", "select", "textarea"]),
    ("readonly", &["input", "textarea"]),
    ("multiple", &["input", "select"]),
    ("formnovalidate", &["button", "input"]),
    ("novalidate", &["form"]),
    ("reversed", &["ol"]),
    ("ismap", &["img"]),
    ("autoplay", &["audio", "video"]),
    ("controls", &["audio", "video"]),
    ("loop", &["audio", "video"]),
];

/// Attributes that reflect a string property of every element that has one, or are no property
/// at all: Svelte's `set_attribute` and Vue's `patchProp` give the same DOM for a string value.
fn is_text_attribute(name: &str) -> bool {
    matches!(
        name,
        "id" | "title"
            | "lang"
            | "href"
            | "src"
            | "alt"
            | "name"
            | "placeholder"
            | "role"
            | "rel"
            | "target"
            | "for"
            | "tabindex"
    ) || name.starts_with("aria-")
        || name.starts_with("data-")
}

/// Svelte's `LOAD_ERROR_ELEMENTS`: its server marks `onload` / `onerror` on them so that the
/// client can replay an event that fired before hydration.
const LOAD_ERROR_ELEMENTS: &[&str] = &[
    "body", "embed", "iframe", "img", "link", "object", "script", "style", "track",
];

/// Element names whose content or namespace the translation does not handle. Svelte's client
/// template drops `<html>`, `<head>` and `<body>` when the browser parses it.
const REFUSED_ELEMENTS: &[&str] = &[
    "template", "script", "style", "svg", "math", "slot", "noscript", "iframe", "object", "html",
    "head", "body",
];

/// The parents a table part needs for the browser to parse it where it is written.
fn table_parents(tag: &str) -> Option<&'static [&'static str]> {
    Some(match tag {
        "caption" | "colgroup" | "tbody" | "thead" | "tfoot" => &["table"],
        "col" => &["colgroup"],
        "tr" => &["tbody", "thead", "tfoot"],
        "td" | "th" => &["tr"],
        _ => return None,
    })
}

/// A table part outside its parent, which the browser reparents or drops when it parses Svelte's
/// client template, unless the part is alone in its template (the template element's own
/// insertion mode then fits it).
fn check_table_part(hir: &Hir, src: &str, id: HirId, tag: &str, at: Span) -> R<()> {
    let Some(parents) = table_parents(tag) else {
        return Ok(());
    };
    let parent = hir.node(id).parent;
    let lists: Vec<Children> = match parent.map(|p| &hir.node(p).kind) {
        None => vec![hir.root],
        Some(NodeKind::Element(el)) => {
            if parents.contains(&el.name.text(src)) {
                return Ok(());
            }
            vec![el.children]
        }
        Some(NodeKind::If {
            branches,
            otherwise,
        }) => hir
            .branches(*branches)
            .iter()
            .map(|b| b.body)
            .chain(*otherwise)
            .collect(),
        Some(NodeKind::Each(each)) => std::iter::once(each.body).chain(each.fallback).collect(),
        Some(_) => Vec::new(),
    };
    let alone = lists
        .iter()
        .map(|&l| hir.children(l))
        .find(|l| l.contains(&id))
        .is_some_and(|l| {
            l.iter().all(|&s| match &hir.node(s).kind {
                NodeKind::Text { raw, .. } => s == id || raw.text(src).trim().is_empty(),
                NodeKind::Comment { .. } => true,
                _ => s == id,
            })
        });
    if alone {
        return Ok(());
    }
    Err(unsupported(
        format_args!(
            "a <{tag}> outside {} beside other content",
            parents.join(" or ")
        ),
        at,
    ))
}

/// The cheap checks, before anything is built: element kinds and names, attribute shapes, the
/// names template expressions read.
///
/// # Errors
///
/// A `vuelte_unsupported` diagnostic at the first construct outside the mapping.
pub fn check(hir: &Hir, js: &Ast, res: &Resolution, exprs: &[NodeId], src: &str) -> R<()> {
    let mut has_binding = false;
    let mut can_reset = false;
    let mut spread_args = FxHashSet::default();
    for (id, n) in hir.nodes.iter_enumerated() {
        match &n.kind {
            NodeKind::Element(el) => {
                let name = el.name.text(src);
                check_element(hir, src, id, el)?;
                let attrs = hir.attrs(el.attrs);
                let spread = attrs
                    .iter()
                    .any(|a| matches!(a.value, AttrValue::Spread(_)));
                check_unique(src, attrs)?;
                for a in attrs {
                    check_attribute(src, name, a, spread)?;
                    check_attribute_references(src, a)?;
                    if let AttrValue::Spread(e) = a.value {
                        spread_args.insert(e);
                    }
                    let attr = a.name.text(src);
                    has_binding |= matches!(a.value, AttrValue::Bind(_)) && attr != "this";
                    if attr == "type" && matches!(name, "button" | "input") {
                        can_reset |= !matches!(&a.value, AttrValue::Static(v) if &**v != "reset");
                    }
                }
            }
            NodeKind::Text { raw, .. } => check_character_references(raw.text(src), false, *raw)?,
            NodeKind::Each(each) => {
                let simple = each
                    .context()
                    .is_some_and(|c| matches!(js.kind(c), Kind::Ident(_)));
                if !simple {
                    return Err(unsupported("an {#each} without a plain item name", n.span));
                }
            }
            _ => {}
        }
    }
    let is_rest = |n: NodeId| {
        res.binding(n)
            .is_some_and(|(_, info)| info.kind == BindKind::RestProp)
    };
    for &e in exprs {
        walk(js, e, &mut |n| match js.kind(n) {
            Kind::Ident(_) if is_rest(n) && !spread_args.contains(&n) => Err(unsupported(
                "the rest of `$props()` other than as a spread attribute",
                span_of(js, n),
            )),
            Kind::Ident(_) if res.sem.binding_of(n).is_none() => {
                let name = js.name(n);
                if name.starts_with('$') {
                    return Err(unsupported(
                        format_args!("the rune or store subscription `{name}`"),
                        span_of(js, n),
                    ));
                }
                if !VUE_GLOBALS.contains(&name) {
                    return Err(unsupported(
                        format_args!(
                            "the global `{name}` in the template (Vue's template reads it from \
                             the component instance)"
                        ),
                        span_of(js, n),
                    ));
                }
                Ok(())
            }
            Kind::Member {
                property,
                computed: false,
                ..
            } => {
                can_reset |= js.name(property) == "reset";
                Ok(())
            }
            Kind::This => Err(unsupported("`this` in the template", span_of(js, n))),
            Kind::New { .. } => Err(unsupported(
                "a `new` expression (Svelte proxies only plain objects and arrays, Vue more)",
                span_of(js, n),
            )),
            _ => Ok(()),
        })?;
    }
    if has_binding && can_reset {
        return Err(unsupported(
            "a binding in a component that can reset a form (Svelte's bindings follow a form \
             reset, Vue's state does not)",
            Span::default(),
        ));
    }
    Ok(())
}

fn check_attribute_references(src: &str, a: &Attribute) -> R<()> {
    match &a.value {
        AttrValue::Static(_) => {
            let value = Span::new(a.name.span().hi, a.span.hi);
            check_character_references(value.text(src), true, value)
        }
        AttrValue::Interpolated(parts) => parts.iter().try_for_each(|p| match *p {
            Part::Text(s) => check_character_references(s.text(src), true, s),
            Part::Expr { .. } => Ok(()),
        }),
        _ => Ok(()),
    }
}

/// Character references that the shared decoder reads as Svelte does. Svelte knows every HTML
/// named reference, with and without `;`, and remaps numeric ones (`&#10;` in text, 0, 128-159,
/// surrogates, the unassigned planes); the decoder knows six names and no remapping.
fn check_character_references(raw: &str, attribute: bool, at: Span) -> R<()> {
    let refused = || unsupported("a character reference Svelte decodes differently", at);
    let mut rest = raw;
    while let Some(i) = rest.find('&') {
        rest = &rest[i + 1..];
        let next = rest.bytes().next();
        if next.is_some_and(|b| b.is_ascii_alphabetic()) {
            let named = ["amp;", "lt;", "gt;", "quot;", "apos;", "nbsp;"]
                .iter()
                .any(|n| rest.starts_with(n));
            if !named {
                return Err(refused());
            }
        } else if next == Some(b'#') {
            let num = &rest[1..];
            let (digits, radix) = num
                .strip_prefix(['x', 'X'])
                .map_or((num, 10), |hex| (hex, 16));
            let len = digits
                .bytes()
                .take_while(|b| {
                    if radix == 16 {
                        b.is_ascii_hexdigit()
                    } else {
                        b.is_ascii_digit()
                    }
                })
                .count();
            if len == 0 {
                continue;
            }
            let exact = digits[len..].starts_with(';')
                && u32::from_str_radix(&digits[..len], radix).is_ok_and(|c| {
                    matches!(c, 1..=9 | 11..=127 | 160..=55_295 | 57_344..=196_607)
                        || (c == 10 && attribute)
                });
            if !exact {
                return Err(refused());
            }
        }
    }
    Ok(())
}

/// The element's name, its place in the browser's parse of Svelte's template, its children.
fn check_element(hir: &Hir, src: &str, id: HirId, el: &Element) -> R<()> {
    let name = el.name.text(src);
    let refused = el.kind != ElementKind::Regular
        || REFUSED_ELEMENTS.contains(&name)
        || name.contains([':', '-'])
        || name.bytes().any(|b| b.is_ascii_uppercase());
    if refused {
        return Err(unsupported(format_args!("the element <{name}>"), el.name));
    }
    if let Err(d) = rsv_svelte::lower::check_foreign_element(src, el.name) {
        return Err(unsupported(&d.message, d.span));
    }
    check_table_part(hir, src, id, name, el.name)?;
    if rsv_svelte::lower::is_customizable_select(hir, src, name, el) {
        return Err(unsupported(
            format_args!("rich content in <{name}>"),
            el.name,
        ));
    }
    if name == "textarea" && !hir.children(el.children).is_empty() {
        return Err(unsupported("a <textarea> with children", el.name));
    }
    Ok(())
}

/// The parser's `attribute_duplicate`, which the Svelte plugin's parser does not report: an
/// attribute or binding, or a `class:` directive, named twice (`bind:this` is not recorded).
fn check_unique(src: &str, attrs: &[Attribute]) -> R<()> {
    let mut seen: Vec<(bool, &str)> = Vec::new();
    for a in attrs {
        let key = match a.value {
            AttrValue::Spread(_) | AttrValue::Attach(_) => continue,
            AttrValue::Class(_) => (true, a.name.text(src)),
            _ => (false, a.name.text(src)),
        };
        if seen.contains(&key) {
            return Err(unsupported(
                "a duplicate attribute (Svelte rejects it as `attribute_duplicate`)",
                a.span,
            ));
        }
        if key.1 != "this" {
            seen.push(key);
        }
    }
    Ok(())
}

/// `spread`: the element has a spread attribute, so all its attributes are one object that
/// Svelte's `set_attributes` (client) and `attributes` (server) apply, which [`helpers`] port.
///
/// [`helpers`]: crate::helpers
fn check_attribute(src: &str, tag: &str, a: &Attribute, spread: bool) -> R<()> {
    let name = a.name.text(src);
    match a.value {
        // Svelte runs an attachment as an effect that tracks what it reads and tears down on a
        // change; a Vue function ref is called on every patch and tracks nothing of its own.
        AttrValue::Attach(_) => return Err(unsupported("an {@attach} tag", a.span)),
        AttrValue::Spread(_) if matches!(tag, "input" | "textarea" | "select" | "option") => {
            return Err(unsupported(
                format_args!("a spread attribute on <{tag}>"),
                a.span,
            ));
        }
        AttrValue::Spread(_) => return Ok(()),
        AttrValue::Class(_) if spread => {
            return Err(unsupported(
                "a `class:` directive beside a spread attribute",
                a.span,
            ));
        }
        AttrValue::Class(_) if !name.is_empty() => return Ok(()),
        AttrValue::Bind(_) if spread && name != "this" => {
            return Err(unsupported("a binding beside a spread attribute", a.span));
        }
        AttrValue::Interpolated(_) if spread => {
            return Err(unsupported(
                "an attribute with text and expressions beside a spread attribute",
                a.span,
            ));
        }
        AttrValue::Expression { .. } | AttrValue::Shorthand(_)
            if spread && name.starts_with("on") =>
        {
            return Err(unsupported(
                "an event attribute beside a spread attribute",
                a.span,
            ));
        }
        _ => {}
    }
    let plain = !name.is_empty()
        && name
            .bytes()
            .all(|b| b.is_ascii_lowercase() || b.is_ascii_digit() || b == b'-');
    let refused = !plain
        || matches!(
            name,
            "key"
                | "ref"
                | "is"
                | "slot"
                | "autofocus"
                | "muted"
                | "defaultvalue"
                | "defaultchecked"
        );
    if refused {
        return Err(unsupported(format_args!("the attribute `{name}`"), a.span));
    }
    match &a.value {
        AttrValue::Bind(_) => {
            if !matches!(name, "value" | "checked" | "this") {
                return Err(unsupported(format_args!("`bind:{name}`"), a.span));
            }
        }
        AttrValue::Static(v) if matches!(name, "class" | "style") => {
            let collapsed = v
                .split([' ', '\t', '\n', '\r', '\u{c}'])
                .all(|w| !w.is_empty());
            if !collapsed && !v.is_empty() {
                return Err(unsupported(
                    format_args!("a `{name}` value with whitespace Svelte collapses"),
                    a.span,
                ));
            }
        }
        AttrValue::Boolean
        | AttrValue::Static(_)
        | AttrValue::Attach(_)
        | AttrValue::Class(_)
        | AttrValue::Spread(_) => {}
        AttrValue::Expression { .. } | AttrValue::Shorthand(_) if spread => {}
        AttrValue::Expression { .. } | AttrValue::Shorthand(_) | AttrValue::Interpolated(_) => {
            let interpolated = matches!(a.value, AttrValue::Interpolated(_));
            let allowed = if name.starts_with("on") || name == "class" {
                !interpolated
            } else if name == "value" {
                !interpolated && matches!(tag, "input" | "textarea")
            } else {
                is_text_attribute(name)
                    || (!interpolated
                        && BOOLEAN_ATTRIBUTES
                            .iter()
                            .any(|(n, tags)| *n == name && tags.contains(&tag)))
            };
            if !allowed {
                return Err(unsupported(
                    format_args!("a dynamic `{name}` attribute on <{tag}>"),
                    a.span,
                ));
            }
        }
    }
    Ok(())
}

/// What [`build`] reads.
#[derive(Clone, Copy, Debug)]
pub struct Input<'a> {
    pub hir: &'a Hir,
    pub res: &'a Resolution,
    pub an: &'a Analysis,
    pub js: &'a Ast,
    pub src: &'a str,
    pub plan: &'a Plan,
    pub server: bool,
}

/// Builds the Vue HIR.
///
/// # Errors
///
/// A `vuelte_unsupported` diagnostic for a construct outside the mapping.
pub fn build(input: Input<'_>, to: &mut Ast) -> R<Built> {
    let hir = input.hir;
    let mut b = Builder {
        i: input,
        to,
        vb: HirBuilder::new(hir.nodes.len(), hir.attrs.len()),
        helpers: FxHashSet::default(),
        visited: FxHashSet::default(),
    };
    let root = b.list(
        Parent::Root,
        hir.children(hir.root),
        None,
        false,
        Span::default(),
    )?;
    let required: Vec<Helper> = b
        .helpers
        .iter()
        .flat_map(|&h| helpers::requires(h).iter().copied())
        .collect();
    b.helpers.extend(required);
    let mut helpers: Vec<Helper> = b.helpers.into_iter().collect();
    helpers.sort_unstable();
    Ok(Built {
        hir: b.vb.finish(root),
        helpers,
    })
}

/// What an element's function ref runs: steps that need the element, and `bind:this`.
#[derive(Default)]
struct Steps {
    mounted: Vec<NodeId>,
    this: Vec<NodeId>,
}

struct Builder<'a, 't> {
    i: Input<'a>,
    to: &'t mut Ast,
    vb: HirBuilder,
    helpers: FxHashSet<Helper>,
    /// The top-level functions already checked for what they read.
    visited: FxHashSet<BindingId>,
}

impl Builder<'_, '_> {
    fn list(
        &mut self,
        parent: Parent<'_>,
        ids: &[HirId],
        vparent: Option<vue::HirId>,
        preserve_ws: bool,
        at: Span,
    ) -> R<vue::Children> {
        let (hir, src) = (self.i.hir, self.i.src);
        let items = clean_nodes(hir, src, parent, ids, preserve_ws).items;
        let mut out = Vec::with_capacity(items.len());
        let mut i = 0;
        while i < items.len() {
            if let Item::Node(id) = items[i] {
                match &hir.node(id).kind {
                    NodeKind::Element(_) => {
                        out.push(self.element(id, vparent, preserve_ws, Vec::new(), None)?);
                    }
                    NodeKind::If { .. } => self.if_chain(id, vparent, preserve_ws, &mut out)?,
                    NodeKind::Each(_) => self.each(id, vparent, preserve_ws, &mut out)?,
                    NodeKind::Text { .. } | NodeKind::Comment { .. } | NodeKind::Expr { .. } => {
                        unreachable!("clean_nodes keeps only elements and blocks as nodes")
                    }
                }
                i += 1;
                continue;
            }
            let start = i;
            while i < items.len() && !matches!(items[i], Item::Node(_)) {
                i += 1;
            }
            self.sequence(&items[start..i], vparent, at, &mut out)?;
        }
        Ok(self.vb.children(&out))
    }

    /// A run of text and `{expression}` tags: one text node in both runtimes.
    fn sequence(
        &mut self,
        items: &[Item<'_>],
        vparent: Option<vue::HirId>,
        at: Span,
        out: &mut Vec<vue::HirId>,
    ) -> R<()> {
        let lone = items.len() == 1;
        let mut text = String::new();
        for item in items {
            match item {
                Item::Text { data, .. } => text.push_str(data),
                Item::Expr(e) => {
                    if !text.is_empty() {
                        out.push(self.text(std::mem::take(&mut text), vparent, at));
                    }
                    self.render_read(*e)?;
                    let expr = self.text_value(*e, lone);
                    let span = self.i.js.loc(*e).span().unwrap_or(at);
                    let kind = vue::NodeKind::Interpolation { expr };
                    out.push(self.vb.node(kind, span, vparent, 0));
                }
                Item::Node(_) => unreachable!("a sequence holds text and expressions"),
            }
        }
        if !text.is_empty() {
            out.push(self.text(text, vparent, at));
        }
        Ok(())
    }

    fn text(&mut self, data: String, vparent: Option<vue::HirId>, at: Span) -> vue::HirId {
        let t = Text {
            raw: at,
            cooked: Some(data.into_boxed_str()),
        };
        self.vb.node(vue::NodeKind::Text(t), at, vparent, 0)
    }

    /// The string an `{expression}` contributes: Svelte's `build_template_chunk` with `set_text`
    /// or a one-time `nodeValue` (client), or its server `escape`.
    fn text_value(&mut self, e: NodeId, lone: bool) -> NodeId {
        let (js, src, res) = (self.i.js, self.i.src, self.i.res);
        let evaluated = res.evaluate(js, src, e);
        if evaluated.is_known {
            let s = known_string(&evaluated.value);
            return self.to.str(&s);
        }
        let x = self.template_expr(e);
        if self.i.server {
            let empty = self.to.str("");
            let v = self
                .to
                .logical(LogicalOp::Nullish, x, empty, Loc::SYNTHETIC);
            return self.call("String", &[v]);
        }
        if lone && !self.i.an.meta(e).has_state {
            self.helpers.insert(Helper::NodeValue);
            return self.call("$$node", &[x]);
        }
        let value = if lone || !evaluated.is_defined {
            let empty = self.to.str("");
            self.to
                .logical(LogicalOp::Nullish, x, empty, Loc::SYNTHETIC)
        } else {
            x
        };
        let head = self.to.template_elem("", false);
        let tail = self.to.template_elem("", true);
        self.to.template(&[head, tail], &[value], Loc::SYNTHETIC)
    }

    /// The one element a block's fragment must be.
    fn only_element(&self, parent: Parent<'_>, ids: &[HirId], at: Span) -> R<HirId> {
        let items = clean_nodes(self.i.hir, self.i.src, parent, ids, false).items;
        match items.as_slice() {
            [Item::Node(id)] if matches!(self.i.hir.node(*id).kind, NodeKind::Element(_)) => {
                Ok(*id)
            }
            _ => Err(unsupported(
                "a block whose content is not exactly one element",
                at,
            )),
        }
    }

    fn if_chain(
        &mut self,
        id: HirId,
        vparent: Option<vue::HirId>,
        preserve_ws: bool,
        out: &mut Vec<vue::HirId>,
    ) -> R<()> {
        let hir = self.i.hir;
        let node = hir.node(id);
        let NodeKind::If {
            branches,
            otherwise,
        } = &node.kind
        else {
            unreachable!("called on an if")
        };
        for (i, b) in hir.branches(*branches).iter().enumerate() {
            let el = self.only_element(Parent::Block, hir.children(b.body), node.span)?;
            self.render_read(b.test)?;
            let test = self.template_expr(b.test);
            let name = if i == 0 { DirName::If } else { DirName::ElseIf };
            let lead = vec![directive(name, None, DirExp::Expr(test), node.span)];
            out.push(self.element(el, vparent, preserve_ws, lead, None)?);
        }
        if let Some(o) = otherwise {
            let el = self.only_element(Parent::Block, hir.children(*o), node.span)?;
            let lead = vec![directive(DirName::Else, None, DirExp::None, node.span)];
            out.push(self.element(el, vparent, preserve_ws, lead, None)?);
        }
        Ok(())
    }

    fn each(
        &mut self,
        id: HirId,
        vparent: Option<vue::HirId>,
        preserve_ws: bool,
        out: &mut Vec<vue::HirId>,
    ) -> R<()> {
        let (hir, js) = (self.i.hir, self.i.js);
        let node = hir.node(id);
        let NodeKind::Each(each) = &node.kind else {
            unreachable!("called on an each")
        };
        let context = each
            .context()
            .expect("checked: an {#each} has an item name");
        let el = self.only_element(Parent::Each, hir.children(each.body), node.span)?;
        let fallback = match each.fallback {
            Some(f) => {
                if !is_name_chain(js, each.collection) {
                    return Err(unsupported(
                        "an {#each} fallback over a collection that is not a name or a chain of \
                         names",
                        node.span,
                    ));
                }
                Some(self.only_element(Parent::Each, hir.children(f), node.span)?)
            }
            None => None,
        };
        self.render_read(each.collection)?;
        let source = self.each_source(each.collection);
        let mut params = vec![copy(js, self.to, &mut Verbatim, context)];
        if let Some(i) = each.index() {
            params.push(copy(js, self.to, &mut Verbatim, i));
        }
        let mut lead = Vec::new();
        if fallback.is_some() {
            let list = self.each_source(each.collection);
            let length = self.to.dot(list, "length");
            lead.push(directive(
                DirName::If,
                None,
                DirExp::Expr(length),
                node.span,
            ));
        }
        lead.push(directive(
            DirName::For,
            None,
            DirExp::For(ForExp { params, source }),
            node.span,
        ));
        if let Some(k) = each.key().filter(|_| each.keyed(js)) {
            self.render_read(k)?;
            let exp = self.template_expr(k);
            let span = js.loc(k).span().unwrap_or(node.span);
            lead.push(bound("key", span, exp, span));
        }
        out.push(self.element(el, vparent, preserve_ws, lead, None)?);
        if let Some(f) = fallback {
            let lead = vec![directive(DirName::Else, None, DirExp::None, node.span)];
            out.push(self.element(f, vparent, preserve_ws, lead, None)?);
        }
        Ok(())
    }

    fn each_source(&mut self, collection: NodeId) -> NodeId {
        self.helpers.insert(if self.i.server {
            Helper::EachServer
        } else {
            Helper::Each
        });
        let c = self.template_expr(collection);
        self.call("$$each", &[c])
    }

    fn element(
        &mut self,
        id: HirId,
        vparent: Option<vue::HirId>,
        preserve_ws: bool,
        lead: Vec<vue::Prop>,
        extra: Option<vue::Prop>,
    ) -> R<vue::HirId> {
        let (hir, src) = (self.i.hir, self.i.src);
        let node = hir.node(id);
        let NodeKind::Element(el) = &node.kind else {
            unreachable!("called on an element")
        };
        let tag = el.name.text(src);
        let attrs = hir.attrs(el.attrs);
        let mut props = lead;
        let mut steps = Steps::default();
        let mut select_target = None;
        let spread = attrs
            .iter()
            .any(|a| matches!(a.value, AttrValue::Spread(_)));
        let directives = attrs.iter().any(|a| matches!(a.value, AttrValue::Class(_)));
        if spread {
            self.spread(tag, attrs, &mut props, &mut steps)?;
        } else {
            if directives {
                self.class_directives(el.name, attrs, &mut props, &mut steps)?;
            }
            for a in attrs {
                if let AttrValue::Bind(t) = a.value
                    && tag == "select"
                {
                    select_target = Some(t);
                }
                let class = matches!(a.value, AttrValue::Class(_)) || a.name.text(src) == "class";
                if !(directives && class) {
                    self.attribute(tag, attrs, a, &mut props, &mut steps)?;
                }
            }
        }
        props.extend(extra);
        if self.i.server && !spread && LOAD_ERROR_ELEMENTS.contains(&tag) {
            for a in attrs {
                let name = a.name.text(src);
                let event = matches!(
                    a.value,
                    AttrValue::Expression { .. } | AttrValue::Shorthand(_)
                ) && matches!(name, "onload" | "onerror");
                if event {
                    props.push(captured_event(name, a.span));
                }
            }
        }
        if let Some(f) = self.ref_function(steps) {
            props.push(bound("ref", el.name, f, el.name));
        }
        let range = self.vb.props(props);
        let tag_type = self.vb.tag_type(tag, range, src);
        let kind = vue::NodeKind::Element(vue::Element {
            tag: Name::Source(el.name),
            tag_type,
            props: range,
            children: vue::Children::default(),
        });
        let origin = id.index() as u32;
        let v = self.vb.node(kind, node.span, vparent, origin);
        let children = if let Some(target) = select_target {
            self.options(el.children, v, target, node.span)?
        } else {
            let preserve = preserve_ws || tag == "pre" || tag == "textarea";
            if tag == "pre" {
                self.check_pre(el.children, preserve, node.span)?;
            }
            self.list(
                Parent::Element(tag),
                hir.children(el.children),
                Some(v),
                preserve,
                node.span,
            )?
        };
        self.vb.set_element_children(v, children);
        Ok(v)
    }

    /// An element with a spread attribute: all its attributes as one object, in order, which
    /// Svelte applies with `set_attributes` (client, after each patch) or prints with
    /// `attributes` (server). Vue is given none of them.
    fn spread(
        &mut self,
        tag: &str,
        attrs: &[Attribute],
        props: &mut Vec<vue::Prop>,
        steps: &mut Steps,
    ) -> R<()> {
        let src = self.i.src;
        let mut fields = Vec::with_capacity(attrs.len());
        for a in attrs {
            let name = a.name.text(src);
            let value = match &a.value {
                &AttrValue::Spread(e) => {
                    self.render_read(e)?;
                    let x = self.template_expr(e);
                    fields.push(self.to.spread(x, Loc::SYNTHETIC));
                    continue;
                }
                &AttrValue::Bind(t) => {
                    self.bind_this(a, t, steps)?;
                    continue;
                }
                AttrValue::Boolean => self.to.bool(true, Loc::SYNTHETIC),
                AttrValue::Static(v) => self.to.str(v),
                &(AttrValue::Expression { expr, .. } | AttrValue::Shorthand(expr)) => {
                    self.render_read(expr)?;
                    let x = self.template_expr(expr);
                    if self.i.server && name == "class" {
                        self.helpers.insert(Helper::Clsx);
                        self.call("$$sclsx", &[x])
                    } else {
                        x
                    }
                }
                _ => {
                    return Err(unsupported(
                        "this attribute beside a spread attribute",
                        a.span,
                    ));
                }
            };
            let key = self.to.str(name);
            fields.push(self.to.property(key, value, 0, Loc::SYNTHETIC));
        }
        let object = self.to.object(&fields, Loc::SYNTHETIC);
        if self.i.server {
            self.helpers.insert(Helper::Spread);
            let mut args = vec![object];
            if LOAD_ERROR_ELEMENTS.contains(&tag) {
                let events = ["onload", "onerror"].map(|e| self.to.str(e));
                args.push(self.to.array(&events, Loc::SYNTHETIC));
            }
            let v = self.call("$$spread", &args);
            let span = attrs.first().map_or_else(Span::default, |a| a.span);
            props.push(directive(DirName::Bind, None, DirExp::Expr(v), span));
        } else {
            self.helpers.insert(Helper::Attributes);
            let el = self.to.id("$$el");
            steps.mounted.push(self.call("$$attributes", &[el, object]));
        }
        Ok(())
    }

    /// `class:` directives with the `class` attribute: `set_class` (client, after each patch) or
    /// `attr_class` (server), both `to_class` of the value and the directives.
    fn class_directives(
        &mut self,
        at: Span,
        attrs: &[Attribute],
        props: &mut Vec<vue::Prop>,
        steps: &mut Steps,
    ) -> R<()> {
        let src = self.i.src;
        let mut value = None;
        let mut fields = Vec::new();
        for a in attrs {
            let name = a.name.text(src);
            match &a.value {
                &AttrValue::Class(e) => {
                    self.render_read(e)?;
                    let x = self.template_expr(e);
                    let key = self.to.str(name);
                    fields.push(self.to.property(key, x, 0, Loc::SYNTHETIC));
                }
                AttrValue::Static(v) if name == "class" => value = Some(self.to.str(v)),
                &(AttrValue::Expression { expr, .. } | AttrValue::Shorthand(expr))
                    if name == "class" =>
                {
                    self.render_read(expr)?;
                    let x = self.template_expr(expr);
                    self.helpers.insert(Helper::Clsx);
                    value = Some(self.call("$$sclsx", &[x]));
                }
                _ if name == "class" => {
                    return Err(unsupported(
                        "this `class` beside a `class:` directive",
                        a.span,
                    ));
                }
                _ => {}
            }
        }
        let value = value.unwrap_or_else(|| self.to.str(""));
        let object = self.to.object(&fields, Loc::SYNTHETIC);
        if self.i.server {
            self.helpers.insert(Helper::ToClass);
            let v = self.call("$$to_class", &[value, object]);
            props.push(bound("CLASS", at, v, at));
        } else {
            self.helpers.insert(Helper::SetClass);
            let el = self.to.id("$$el");
            steps
                .mounted
                .push(self.call("$$set_class", &[el, value, object]));
        }
        Ok(())
    }

    /// `($$el) => { if ($$el !== null) { …mounted } …this }`: Vue calls a function ref with the
    /// element after every patch of it and with `null` on unmount, which is when Svelte's effects
    /// and `bind:this` run.
    fn ref_function(&mut self, steps: Steps) -> Option<NodeId> {
        if steps.mounted.is_empty() && steps.this.is_empty() {
            return None;
        }
        let mut body = Vec::new();
        if !steps.mounted.is_empty() {
            let stmts: Vec<NodeId> = steps
                .mounted
                .into_iter()
                .map(|s| self.to.expr_stmt(s))
                .collect();
            let block = self.to.block(&stmts, Loc::SYNTHETIC);
            let el = self.to.id("$$el");
            let null = self.to.null(Loc::SYNTHETIC);
            let test = self.to.binary(BinOp::StrictNotEq, el, null, Loc::SYNTHETIC);
            body.push(self.to.if_(test, block, None, Loc::SYNTHETIC));
        }
        body.extend(steps.this.into_iter().map(|s| self.to.expr_stmt(s)));
        let block = self.to.block(&body, Loc::SYNTHETIC);
        let param = self.to.id("$$el");
        Some(self.to.arrow(&[param], block, false, false, Loc::SYNTHETIC))
    }

    /// A `<pre>` whose content starts with a newline: the HTML parser drops it from the server's
    /// markup, the DOM keeps it in the client's.
    fn check_pre(&self, children: Children, preserve: bool, at: Span) -> R<()> {
        let items = clean_nodes(
            self.i.hir,
            self.i.src,
            Parent::Element("pre"),
            self.i.hir.children(children),
            preserve,
        )
        .items;
        if let Some(Item::Text { data, .. }) = items.first()
            && data.starts_with(['\n', '\r'])
        {
            return Err(unsupported("a <pre> whose text starts with a newline", at));
        }
        Ok(())
    }

    fn attribute(
        &mut self,
        tag: &str,
        attrs: &[Attribute],
        a: &Attribute,
        props: &mut Vec<vue::Prop>,
        steps: &mut Steps,
    ) -> R<()> {
        let name = a.name.text(self.i.src);
        let at = a.name.span();
        match &a.value {
            &AttrValue::Bind(e) => self.binding(tag, attrs, a, e, props, steps),
            AttrValue::Attach(_) | AttrValue::Class(_) | AttrValue::Spread(_) => {
                Err(unsupported("this attribute", a.span))
            }
            AttrValue::Boolean => {
                props.push(attribute(a, None));
                Ok(())
            }
            AttrValue::Static(v) => {
                if tag == "select" && name == "value" {
                    return Err(unsupported("a `value` attribute on a <select>", a.span));
                }
                if !(name == "class" && v.is_empty()) {
                    props.push(attribute(a, Some(v)));
                }
                Ok(())
            }
            &(AttrValue::Expression { expr, .. } | AttrValue::Shorthand(expr)) => {
                if let Some(event) = name.strip_prefix("on") {
                    return self.handler(attrs, a, event, expr, props);
                }
                self.render_read(expr)?;
                let x = self.template_expr(expr);
                if name == "class" {
                    self.helpers.insert(Helper::Class);
                    let v = self.call("$$class", &[x]);
                    props.push(bound("CLASS", at, v, a.span));
                } else if name == "value" {
                    if self.i.server {
                        let v = self.attr_value(expr, x);
                        props.push(bound("value", at, v, a.span));
                    } else {
                        self.helpers.insert(Helper::Value);
                        let el = self.to.id("$$el");
                        steps.mounted.push(self.call("$$value", &[el, x]));
                    }
                } else if is_text_attribute(name) {
                    let v = self.attr_value(expr, x);
                    props.push(bound(name, at, v, a.span));
                } else {
                    let v = self.boolean(expr, x);
                    props.push(bound(name, at, v, a.span));
                }
                Ok(())
            }
            AttrValue::Interpolated(parts) => {
                for p in parts {
                    if let Part::Expr { expr, .. } = *p {
                        self.render_read(expr)?;
                    }
                }
                let value = self.interpolated(parts);
                props.push(bound(name, at, value, a.span));
                Ok(())
            }
        }
    }

    /// A text attribute's value: as is when it is a string, number or boolean by construction,
    /// else through `$$attr`.
    fn attr_value(&mut self, expr: NodeId, x: NodeId) -> NodeId {
        if is_primitive(self.i.js, expr) {
            return x;
        }
        self.helpers.insert(if self.i.server {
            Helper::AttrServer
        } else {
            Helper::Attr
        });
        self.call("$$attr", &[x])
    }

    /// A boolean attribute's value: Svelte's client assigns the property (`Boolean`), its server
    /// renders `''` as present (`$$bool`).
    fn boolean(&mut self, expr: NodeId, x: NodeId) -> NodeId {
        if is_boolean(self.i.js, expr) {
            return x;
        }
        if self.i.server {
            self.helpers.insert(Helper::BoolServer);
            self.call("$$bool", &[x])
        } else {
            self.call("Boolean", &[x])
        }
    }

    fn handler(
        &mut self,
        attrs: &[Attribute],
        a: &Attribute,
        event: &str,
        expr: NodeId,
        props: &mut Vec<vue::Prop>,
    ) -> R<()> {
        let src = self.i.src;
        if event.is_empty() || !event.bytes().all(|b| b.is_ascii_lowercase()) {
            return Err(unsupported(
                format_args!("the event attribute `on{event}`"),
                a.span,
            ));
        }
        let capture = event.ends_with("capture")
            && !matches!(event, "gotpointercapture" | "lostpointercapture");
        if capture || PASSIVE_EVENTS.contains(&event) {
            return Err(unsupported(
                format_args!("the capture or passive event `on{event}`"),
                a.span,
            ));
        }
        let bound_event = attrs.iter().any(|o| {
            matches!(o.value, AttrValue::Bind(_)) && binding_event(o.name.text(src)) == event
        });
        if bound_event {
            return Err(unsupported(
                format_args!("`on{event}` beside a binding that listens to `{event}`"),
                a.span,
            ));
        }
        self.check_handler(expr, a.span)?;
        if self.i.server {
            return Ok(());
        }
        let value = self.template_expr(expr);
        let name = spelled(event, a.name.span());
        props.push(directive(
            DirName::On,
            Some(name),
            DirExp::Expr(value),
            a.span,
        ));
        Ok(())
    }

    /// Svelte calls a handler with the element as `this`, Vue with none: only handlers that
    /// cannot read `this`.
    fn check_handler(&self, expr: NodeId, span: Span) -> R<()> {
        let (js, res) = (self.i.js, self.i.res);
        let refused = || {
            Err(unsupported(
                "an event handler that is not an arrow, a function or a top-level function that \
                 does not read `this`",
                span,
            ))
        };
        match js.kind(expr) {
            Kind::Arrow { .. } => Ok(()),
            Kind::Function { body, .. } if !reads_this(js, body) => Ok(()),
            Kind::Ident(_) => {
                let Some((b, info)) = res.binding(expr) else {
                    return refused();
                };
                if res.sem.bindings[b].scope != ScopeId::ROOT || !info.is_function {
                    return refused();
                }
                match self.function_of(b) {
                    Some(f) if !reads_this(js, f) => Ok(()),
                    _ => refused(),
                }
            }
            _ => refused(),
        }
    }

    /// The function a top-level function binding holds: its declaration or initialiser.
    fn function_of(&self, b: BindingId) -> Option<NodeId> {
        let js = self.i.js;
        let binding = &self.i.res.sem.bindings[b];
        if binding.kind == DeclKind::Function {
            return self.i.plan.functions.get(&b).copied();
        }
        binding
            .init(js)
            .filter(|&i| matches!(js.kind(i), Kind::Function { .. } | Kind::Arrow { .. }))
    }

    fn binding(
        &mut self,
        tag: &str,
        attrs: &[Attribute],
        a: &Attribute,
        target: NodeId,
        props: &mut Vec<vue::Prop>,
        steps: &mut Steps,
    ) -> R<()> {
        let src = self.i.src;
        let property = a.name.text(src);
        if property == "this" {
            return self.bind_this(a, target, steps);
        }
        let beside = attrs.iter().any(|o| {
            let other = o.name.text(src);
            !std::ptr::eq(o, a)
                && (matches!(other, "value" | "checked" | "group")
                    || (matches!(o.value, AttrValue::Bind(_)) && other != "this"))
        });
        if beside {
            return Err(unsupported(
                "a binding beside a `value`, `checked` or another binding",
                a.span,
            ));
        }
        self.check_target(target, a.span)?;
        self.render_read(target)?;
        match (property, tag, static_type(src, attrs)) {
            ("value", "input", Some(t)) if TEXT_INPUT_TYPES.contains(&t) => {
                self.bind_text(a, target, props, steps);
                Ok(())
            }
            ("value", "textarea", _) => {
                self.bind_text(a, target, props, steps);
                Ok(())
            }
            ("value", "select", _) => {
                if attrs.iter().any(|o| o.name.text(src) == "multiple") {
                    return Err(unsupported("`bind:value` on a <select multiple>", a.span));
                }
                if !self.i.server {
                    self.bind_select(a, target, props, steps);
                }
                Ok(())
            }
            ("checked", "input", Some("checkbox")) => {
                self.bind_checked(a, target, props, steps);
                Ok(())
            }
            _ => Err(unsupported(
                format_args!("`bind:{property}` on this <{tag}>"),
                a.span,
            )),
        }
    }

    /// Svelte's `check_binding`: `$state`, or a member of `$state` or of an `{#each}` item.
    fn check_target(&self, target: NodeId, span: Span) -> R<()> {
        let (js, res) = (self.i.js, self.i.res);
        let mut root = target;
        while let Kind::Member { object, .. } = js.kind(root) {
            root = object;
        }
        let kind = matches!(js.kind(root), Kind::Ident(_))
            .then(|| res.binding(root).map(|(_, info)| info.kind))
            .flatten();
        let member = root != target;
        let ok = match kind {
            Some(BindKind::State | BindKind::RawState) => true,
            Some(BindKind::Each) => member,
            _ => false,
        };
        if ok {
            Ok(())
        } else {
            Err(unsupported(
                "a binding to anything but `$state` or a member of `$state` or of an {#each} item",
                span,
            ))
        }
    }

    /// `bind_value` (client): an `input` listener, and after each patch its render effect
    /// (`value !== input.value && (input.value = value ?? '')`); a fresh element is empty, so the
    /// adoption of a non-empty DOM value never fires. The server prints the value.
    fn bind_text(
        &mut self,
        a: &Attribute,
        target: NodeId,
        props: &mut Vec<vue::Prop>,
        steps: &mut Steps,
    ) {
        let at = a.name.span();
        let x = self.template_expr(target);
        if self.i.server {
            let v = self.attr_value(target, x);
            props.push(bound("value", at, v, a.span));
            return;
        }
        let el = self.to.id("$$el");
        let dom = self.to.dot(el, "value");
        let differs = self.to.binary(BinOp::StrictNotEq, x, dom, Loc::SYNTHETIC);
        let el = self.to.id("$$el");
        let dom = self.to.dot(el, "value");
        let current = self.template_expr(target);
        let empty = self.to.str("");
        let value = self
            .to
            .logical(LogicalOp::Nullish, current, empty, Loc::SYNTHETIC);
        let assign = self.to.assign(AssignOp::Assign, dom, value, Loc::SYNTHETIC);
        steps.mounted.push(
            self.to
                .logical(LogicalOp::And, differs, assign, Loc::SYNTHETIC),
        );
        let handler = self.assign_from_event(target, "value");
        let name = spelled("input", at);
        props.push(directive(
            DirName::On,
            Some(name),
            DirExp::Expr(handler),
            a.span,
        ));
    }

    /// `bind_checked` (client): a `change` listener, on mount a nullish value set to the element's
    /// state, and after each patch its render effect (`input.checked = Boolean(value)`). The
    /// server prints `checked` as `attr(…, true)` does.
    fn bind_checked(
        &mut self,
        a: &Attribute,
        target: NodeId,
        props: &mut Vec<vue::Prop>,
        steps: &mut Steps,
    ) {
        let at = a.name.span();
        let x = self.template_expr(target);
        if self.i.server {
            self.helpers.insert(Helper::BoolServer);
            let v = self.call("$$bool", &[x]);
            props.push(bound("checked", at, v, a.span));
            return;
        }
        let handler = self.assign_from_event(target, "checked");
        let name = spelled("change", at);
        props.push(directive(
            DirName::On,
            Some(name),
            DirExp::Expr(handler),
            a.span,
        ));
        self.helpers.insert(Helper::Once);
        let current = self.template_expr(target);
        let null = self.to.null(Loc::SYNTHETIC);
        let is_null = self.to.binary(BinOp::Eq, current, null, Loc::SYNTHETIC);
        let lhs = self.template_expr(target);
        let el = self.to.id("$$el");
        let checked = self.to.dot(el, "checked");
        let assign = self
            .to
            .assign(AssignOp::Assign, lhs, checked, Loc::SYNTHETIC);
        let adopt = self
            .to
            .logical(LogicalOp::And, is_null, assign, Loc::SYNTHETIC);
        let step = self.to.arrow(&[], adopt, true, false, Loc::SYNTHETIC);
        let el = self.to.id("$$el");
        steps.mounted.push(self.call("$$once", &[el, step]));
        let el = self.to.id("$$el");
        let dom = self.to.dot(el, "checked");
        let value = self.call("Boolean", &[x]);
        steps
            .mounted
            .push(self.to.assign(AssignOp::Assign, dom, value, Loc::SYNTHETIC));
    }

    /// `bind_select_value` (client): a `change` listener reading the chosen option, and after each
    /// patch `select_option`, with the browser's choice adopted for `undefined` on mount.
    fn bind_select(
        &mut self,
        a: &Attribute,
        target: NodeId,
        props: &mut Vec<vue::Prop>,
        steps: &mut Steps,
    ) {
        self.helpers.insert(Helper::Select);
        self.helpers.insert(Helper::Option);
        let at = a.name.span();
        let event = self.to.id("$$e");
        let lhs = self.template_expr(target);
        let e = self.to.id("$$e");
        let select = self.to.dot(e, "currentTarget");
        let value = self.call("$$option", &[select]);
        let assign = self.to.assign(AssignOp::Assign, lhs, value, Loc::SYNTHETIC);
        let handler = self.to.arrow(&[event], assign, true, false, Loc::SYNTHETIC);
        let name = spelled("change", at);
        props.push(directive(
            DirName::On,
            Some(name),
            DirExp::Expr(handler),
            a.span,
        ));
        let v = self.to.id("$$v");
        let lhs = self.template_expr(target);
        let v2 = self.to.id("$$v");
        let set_body = self.to.assign(AssignOp::Assign, lhs, v2, Loc::SYNTHETIC);
        let set = self.to.arrow(&[v], set_body, true, false, Loc::SYNTHETIC);
        let el = self.to.id("$$el");
        let current = self.template_expr(target);
        steps
            .mounted
            .push(self.call("$$select", &[el, current, set]));
    }

    /// `bind:this={x}` on a top-level `$state`: `x = $$el` after each patch, `null` on unmount.
    fn bind_this(&mut self, a: &Attribute, target: NodeId, steps: &mut Steps) -> R<()> {
        let (js, res) = (self.i.js, self.i.res);
        let state = matches!(js.kind(target), Kind::Ident(_))
            && res.binding(target).is_some_and(|(b, info)| {
                matches!(info.kind, BindKind::State | BindKind::RawState)
                    && res.sem.bindings[b].scope == ScopeId::ROOT
            });
        if !state {
            return Err(unsupported(
                "`bind:this` to anything but a top-level `$state`",
                a.span,
            ));
        }
        if !self.i.server {
            let lhs = self.template_expr(target);
            let el = self.to.id("$$el");
            steps
                .this
                .push(self.to.assign(AssignOp::Assign, lhs, el, Loc::SYNTHETIC));
        }
        Ok(())
    }

    /// `($$e) => (target = $$e.currentTarget.<property>)`.
    fn assign_from_event(&mut self, target: NodeId, property: &str) -> NodeId {
        let event = self.to.id("$$e");
        let lhs = self.template_expr(target);
        let e = self.to.id("$$e");
        let el = self.to.dot(e, "currentTarget");
        let value = self.to.dot(el, property);
        let assign = self.to.assign(AssignOp::Assign, lhs, value, Loc::SYNTHETIC);
        self.to.arrow(&[event], assign, true, false, Loc::SYNTHETIC)
    }

    /// The options of a bound `<select>`, each an `<option>` with a static `value`; on the server
    /// each is `selected` when the value is the bound one (`===`, as Svelte's renderer compares).
    fn options(
        &mut self,
        children: Children,
        select: vue::HirId,
        target: NodeId,
        at: Span,
    ) -> R<vue::Children> {
        let (hir, src) = (self.i.hir, self.i.src);
        let items = clean_nodes(
            hir,
            src,
            Parent::Element("select"),
            hir.children(children),
            false,
        )
        .items;
        let mut out = Vec::with_capacity(items.len());
        for item in &items {
            let Item::Node(id) = *item else {
                return Err(unsupported(
                    "a bound <select> with content other than options",
                    at,
                ));
            };
            let NodeKind::Element(el) = &hir.node(id).kind else {
                return Err(unsupported("a block in a bound <select>", at));
            };
            let value = hir.attrs(el.attrs).iter().find_map(|a| {
                (a.name.text(src) == "value").then_some(match &a.value {
                    AttrValue::Static(v) => Some(v.clone()),
                    _ => None,
                })
            });
            let (true, Some(Some(value))) = (el.name.text(src) == "option", value) else {
                return Err(unsupported(
                    "a bound <select> with content other than options with a static `value`",
                    el.name,
                ));
            };
            let extra = self.i.server.then(|| {
                let x = self.template_expr(target);
                let v = self.to.str(&value);
                let test = self.to.binary(BinOp::StrictEq, x, v, Loc::SYNTHETIC);
                bound("selected", el.name, test, el.name)
            });
            out.push(self.element(id, Some(select), false, Vec::new(), extra)?);
        }
        Ok(self.vb.children(&out))
    }

    /// `a="s{e}t"`: Svelte's attribute chunk, with `?? ''` (client) or `stringify` (server)
    /// around each expression it cannot prove a string.
    fn interpolated(&mut self, parts: &[Part]) -> NodeId {
        let (js, src, res) = (self.i.js, self.i.src, self.i.res);
        let mut quasis = Vec::with_capacity(parts.len() + 1);
        let mut exprs = Vec::with_capacity(parts.len());
        let mut text = String::new();
        for p in parts {
            match *p {
                Part::Text(span) => {
                    text.push_str(&rsv_svelte::ast::decode_text(span.text(src)));
                }
                Part::Expr { expr, .. } => {
                    let evaluated = res.evaluate(js, src, expr);
                    if evaluated.is_known {
                        text.push_str(&known_string(&evaluated.value));
                        continue;
                    }
                    quasis.push(
                        self.to
                            .template_elem(&sanitize_template_string(&text), false),
                    );
                    text.clear();
                    let x = self.template_expr(expr);
                    let value = if self.i.server {
                        if evaluated.is_string && evaluated.is_defined {
                            x
                        } else {
                            self.helpers.insert(Helper::Stringify);
                            self.call("$$stringify", &[x])
                        }
                    } else if evaluated.is_defined {
                        x
                    } else {
                        let empty = self.to.str("");
                        self.to
                            .logical(LogicalOp::Nullish, x, empty, Loc::SYNTHETIC)
                    };
                    exprs.push(value);
                }
            }
        }
        if exprs.is_empty() {
            return self.to.str(&text);
        }
        quasis.push(
            self.to
                .template_elem(&sanitize_template_string(&text), true),
        );
        self.to.template(&quasis, &exprs, Loc::SYNTHETIC)
    }

    fn call(&mut self, name: &str, args: &[NodeId]) -> NodeId {
        let callee = self.to.id(name);
        self.to.call0(callee, args)
    }

    /// A template expression in the Vue tree.
    fn template_expr(&mut self, e: NodeId) -> NodeId {
        copy(
            self.i.js,
            self.to,
            &mut TemplateRewrite { res: self.i.res },
            e,
        )
    }

    /// Refuses an expression evaluated while rendering that reads, directly or through the
    /// component's functions, a top-level binding that changes without being reactive: Svelte
    /// keeps what it rendered, a Vue re-render would show the new value.
    fn render_read(&mut self, e: NodeId) -> R<()> {
        let js = self.i.js;
        let mut reads = Vec::new();
        walk(js, e, &mut |n| match js.kind(n) {
            Kind::Ident(_) => {
                reads.push(n);
                Ok(())
            }
            Kind::Member {
                object,
                property,
                computed: false,
                ..
            } if self.is_impure_global(object, property) => Err(unsupported(
                "a value that changes on every read",
                span_of(js, n),
            )),
            _ => Ok(()),
        })?;
        for n in reads {
            self.read_binding(n)?;
        }
        Ok(())
    }

    fn read_binding(&mut self, id: NodeId) -> R<()> {
        let (js, res) = (self.i.js, self.i.res);
        let Some((b, info)) = res.binding(id) else {
            return Ok(());
        };
        let binding = &res.sem.bindings[b];
        if binding.scope != ScopeId::ROOT || binding.node == id {
            return Ok(());
        }
        let changes = match info.kind {
            BindKind::Normal => binding.writes > 0 || binding.mutations > 0,
            BindKind::RawState => binding.mutations > 0,
            _ => false,
        };
        if changes {
            return Err(unsupported(
                format_args!(
                    "the template reads `{}`, which changes without being reactive",
                    js.name(id)
                ),
                span_of(js, id),
            ));
        }
        if info.is_function
            && self.visited.insert(b)
            && let Some(f) = self.function_of(b)
        {
            self.render_read(f)?;
        }
        Ok(())
    }

    fn is_impure_global(&self, object: NodeId, property: NodeId) -> bool {
        let js = self.i.js;
        matches!(js.kind(object), Kind::Ident(_))
            && self.i.res.binding(object).is_none()
            && matches!(
                (js.name(object), js.name(property)),
                ("Math", "random") | ("Date" | "performance", "now")
            )
    }
}

fn known_string(v: &Val) -> String {
    match v {
        Val::Null | Val::Undefined => String::new(),
        v => v.to_js_string(),
    }
}

fn span_of(js: &Ast, n: NodeId) -> Span {
    js.loc(n).span().unwrap_or_default()
}

/// Template references to props read `$$props.<key>`; the Vue compiler handles the rest.
struct TemplateRewrite<'a> {
    res: &'a Resolution,
}

impl Rewrite for TemplateRewrite<'_> {
    fn rewrite(&mut self, from: &Ast, to: &mut Ast, id: NodeId) -> Option<NodeId> {
        match from.kind(id) {
            Kind::Ident(_) => prop_member(self.res, from, to, id),
            Kind::Property {
                key,
                value,
                shorthand: true,
                computed: false,
                ..
            } => {
                let v = prop_member(self.res, from, to, value)?;
                let k = to.ident(from.name(key), from.loc(key));
                Some(to.property(k, v, 0, from.loc(id)))
            }
            _ => None,
        }
    }
}

/// The event a binding's listener waits for.
fn binding_event(property: &str) -> &'static str {
    match property {
        "value" => "input",
        "checked" => "change",
        _ => "",
    }
}

/// The `type` written as static text; `Some("text")` without one, `None` for a dynamic one.
fn static_type<'a>(src: &str, attrs: &'a [Attribute]) -> Option<&'a str> {
    let mut ty = Some("text");
    for a in attrs {
        if a.name.text(src) == "type" {
            ty = match &a.value {
                AttrValue::Static(v) => Some(&**v),
                _ => None,
            };
        }
    }
    ty
}

/// Whether a function body reads `this`, outside the nested functions that rebind it.
fn reads_this(js: &Ast, body: NodeId) -> bool {
    let mut stack = vec![body];
    while let Some(n) = stack.pop() {
        match js.kind(n) {
            Kind::This => return true,
            Kind::Function { .. } if n != body => {}
            _ => js.for_each_child(n, |k| stack.push(k)),
        }
    }
    false
}

/// An identifier or a chain of non-computed members: evaluating it twice reads the same value.
fn is_name_chain(js: &Ast, e: NodeId) -> bool {
    match js.kind(e) {
        Kind::Ident(_) => true,
        Kind::Member {
            object,
            computed: false,
            optional: false,
            ..
        } => is_name_chain(js, object),
        _ => false,
    }
}

/// An expression whose value is a boolean by construction.
fn is_boolean(js: &Ast, e: NodeId) -> bool {
    match js.kind(e) {
        Kind::Bool(_) | Kind::Unary(UnaryOp::Not, _) => true,
        Kind::Binary(op, ..) => matches!(
            op,
            BinOp::Eq
                | BinOp::NotEq
                | BinOp::StrictEq
                | BinOp::StrictNotEq
                | BinOp::Lt
                | BinOp::LtEq
                | BinOp::Gt
                | BinOp::GtEq
                | BinOp::In
                | BinOp::InstanceOf
        ),
        Kind::Logical(LogicalOp::And | LogicalOp::Or, l, r) => {
            is_boolean(js, l) && is_boolean(js, r)
        }
        Kind::Cond { cons, alt, .. } => is_boolean(js, cons) && is_boolean(js, alt),
        _ => false,
    }
}

/// An expression whose value is a string, number or boolean by construction. Arithmetic is not:
/// it can be a `bigint`, which Vue's server drops from an attribute and Svelte's prints.
fn is_primitive(js: &Ast, e: NodeId) -> bool {
    let is_string = |n: NodeId| matches!(js.kind(n), Kind::Str | Kind::Template { .. });
    match js.kind(e) {
        Kind::Str | Kind::Num(_) | Kind::Template { .. } => true,
        Kind::Unary(op, _) => matches!(op, UnaryOp::Plus | UnaryOp::TypeOf) || is_boolean(js, e),
        Kind::Binary(BinOp::Add, l, r) => is_string(l) || is_string(r),
        Kind::Logical(_, l, r) => is_primitive(js, l) && is_primitive(js, r),
        Kind::Cond { cons, alt, .. } => is_primitive(js, cons) && is_primitive(js, alt),
        _ => is_boolean(js, e),
    }
}

/// `` ${event}="this.__e=event"``, which Svelte's server prints for a load or error event.
fn captured_event(event: &str, span: Span) -> vue::Prop {
    vue::Prop {
        kind: PropKind::Attribute {
            name: spelled(event, span),
            value: Some(Text {
                raw: span,
                cooked: Some("this.__e=event".into()),
            }),
        },
        span,
        origin: 0,
    }
}

fn spelled(text: &str, span: Span) -> Name {
    Name::Spelled {
        text: text.into(),
        span,
    }
}

fn directive(name: DirName, arg: Option<Name>, exp: DirExp, span: Span) -> vue::Prop {
    vue::Prop {
        kind: PropKind::Directive(vue::Directive {
            name,
            arg,
            modifiers: Box::new([]),
            exp,
        }),
        span,
        origin: 0,
    }
}

fn bound(name: &str, at: Span, value: NodeId, span: Span) -> vue::Prop {
    directive(
        DirName::Bind,
        Some(spelled(name, at)),
        DirExp::Expr(value),
        span,
    )
}

fn attribute(a: &Attribute, value: Option<&str>) -> vue::Prop {
    vue::Prop {
        kind: PropKind::Attribute {
            name: Name::Source(a.name.span()),
            value: value.map(|v| Text {
                raw: a.span,
                cooked: Some(v.into()),
            }),
        },
        span: a.span,
        origin: a.origin,
    }
}
