//! The template: the Svelte HIR, read with Svelte's meaning, as a Vue template HIR built through
//! [`rsvelte_vue::compiler_syntax_tree::CompilerSyntaxTreeBuilder`].
//!
//! Text is what Svelte's [`clean_nodes`] leaves; the Vue HIR is post-condense, so the Vue compiler
//! keeps it as is. Expressions are copied into the component's tree; a reference to a prop becomes
//! `$$props.<key>` and everything else is left to the Vue compiler, which unwraps setup refs.
//!
//! The client and the server output differ where Svelte's client and server runtimes do: the
//! client mirrors what Svelte's DOM updates do (`set_text`, `set_attribute`, `set_value`, the
//! binding effects), the server what its renderer prints (`escape`, `attr`, `stringify`).

use rsvelte_javascript::copy::{Rewrite, Verbatim, copy};
use rsvelte_javascript::operators::{
    AssignmentOperator, BinaryOperator, LogicalOperator, UnaryOperator,
};
use rsvelte_javascript::scope::{BindingIdentifier, DeclarationKind, ScopeIdentifier};
use rsvelte_javascript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_kernel::source::index::TypedIndex;
use rsvelte_kernel::source::positions::{SourceLocation, Span};
use rsvelte_svelte::compilation::compiler_syntax_tree::{
    Attribute, AttributeValue, Children, CompilerNodeIdentifier, CompilerSyntaxTree, Element,
    ElementKind, NodeKind, Part,
};
use rsvelte_svelte::compilation::lower::{Item, Parent, clean_nodes, sanitize_template_string};
use rsvelte_svelte::semantic::analyze::Analysis;
use rsvelte_svelte::semantic::evaluate::Value;
use rsvelte_svelte::semantic::resolve::{BindingKind, Resolution};
use rsvelte_vue::compiler_syntax_tree::{
    self as vue, CompilerSyntaxTreeBuilder, Name, PropertyKind, Text,
};
use rsvelte_vue::syntax_tree::{DirectiveExpression, DirectiveName, LoopExpression};
use rustc_hash::FxHashSet;

use crate::helpers::{self, Helper};
use crate::script::{Plan, VUE_GLOBALS, prop_member, walk};
use crate::{R, unsupported};

#[derive(Debug)]
pub struct Built {
    pub compiler_syntax_tree: vue::CompilerSyntaxTree,
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
fn check_table_part(
    compiler_syntax_tree: &CompilerSyntaxTree,
    source_text: &str,
    identifier: CompilerNodeIdentifier,
    tag: &str,
    at: Span,
) -> R<()> {
    let Some(parents) = table_parents(tag) else {
        return Ok(());
    };
    let parent = compiler_syntax_tree.node(identifier).parent;
    let lists: Vec<Children> = match parent.map(|p| &compiler_syntax_tree.node(p).kind) {
        None => vec![compiler_syntax_tree.root],
        Some(NodeKind::Element(el)) => {
            if parents.contains(&el.name.text(source_text)) {
                return Ok(());
            }
            vec![el.children]
        }
        Some(NodeKind::If {
            branches,
            otherwise,
        }) => compiler_syntax_tree
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
        .map(|&l| compiler_syntax_tree.children(l))
        .find(|l| l.contains(&identifier))
        .is_some_and(|l| {
            l.iter().all(|&s| match &compiler_syntax_tree.node(s).kind {
                NodeKind::Text { raw, .. } => {
                    s == identifier || raw.text(source_text).trim().is_empty()
                }
                NodeKind::Comment { .. } => true,
                _ => s == identifier,
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
pub fn check(
    compiler_syntax_tree: &CompilerSyntaxTree,
    javascript: &SyntaxTree,
    resolution: &Resolution,
    expressions: &[NodeIdentifier],
    source_text: &str,
) -> R<()> {
    let mut has_binding = false;
    let mut can_reset = false;
    let mut spread_args = FxHashSet::default();
    for (identifier, n) in compiler_syntax_tree.nodes.iter_enumerated() {
        match &n.kind {
            NodeKind::Element(el) => {
                let name = el.name.text(source_text);
                check_element(compiler_syntax_tree, source_text, identifier, el)?;
                let attributes = compiler_syntax_tree.attributes(el.attributes);
                let spread = attributes
                    .iter()
                    .any(|a| matches!(a.value, AttributeValue::Spread(_)));
                check_unique(source_text, attributes)?;
                for a in attributes {
                    check_attribute(source_text, name, a, spread)?;
                    check_attribute_references(source_text, a)?;
                    if let AttributeValue::Spread(e) = a.value {
                        spread_args.insert(e);
                    }
                    let attribute = a.name.text(source_text);
                    has_binding |=
                        matches!(a.value, AttributeValue::Bind(_)) && attribute != "this";
                    if attribute == "type" && matches!(name, "button" | "input") {
                        can_reset |=
                            !matches!(&a.value, AttributeValue::Static(v) if &**v != "reset");
                    }
                }
            }
            NodeKind::Text { raw, .. } => {
                check_character_references(raw.text(source_text), false, *raw)?;
            }
            NodeKind::Each(each) => {
                let simple = each
                    .context()
                    .is_some_and(|c| matches!(javascript.kind(c), Kind::Identifier(_)));
                if !simple {
                    return Err(unsupported("an {#each} without a plain item name", n.span));
                }
            }
            _ => {}
        }
    }
    let is_rest = |n: NodeIdentifier| {
        resolution
            .binding(n)
            .is_some_and(|(_, info)| info.kind == BindingKind::RestProperty)
    };
    for &e in expressions {
        walk(javascript, e, &mut |n| match javascript.kind(n) {
            Kind::Identifier(_) if is_rest(n) && !spread_args.contains(&n) => Err(unsupported(
                "the rest of `$props()` other than as a spread attribute",
                span_of(javascript, n),
            )),
            Kind::Identifier(_) if resolution.sem.binding_of(n).is_none() => {
                let name = javascript.name(n);
                if name.starts_with('$') {
                    return Err(unsupported(
                        format_args!("the rune or store subscription `{name}`"),
                        span_of(javascript, n),
                    ));
                }
                if !VUE_GLOBALS.contains(&name) {
                    return Err(unsupported(
                        format_args!(
                            "the global `{name}` in the template (Vue's template reads it from \
                             the component instance)"
                        ),
                        span_of(javascript, n),
                    ));
                }
                Ok(())
            }
            Kind::Member {
                property,
                computed: false,
                ..
            } => {
                can_reset |= javascript.name(property) == "reset";
                Ok(())
            }
            Kind::This => Err(unsupported(
                "`this` in the template",
                span_of(javascript, n),
            )),
            Kind::New { .. } => Err(unsupported(
                "a `new` expression (Svelte proxies only plain objects and arrays, Vue more)",
                span_of(javascript, n),
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

fn check_attribute_references(source_text: &str, a: &Attribute) -> R<()> {
    match &a.value {
        AttributeValue::Static(_) => {
            let value = Span::new(a.name.span().end_offset, a.span.end_offset);
            check_character_references(value.text(source_text), true, value)
        }
        AttributeValue::Interpolated(parts) => parts.iter().try_for_each(|p| match *p {
            Part::Text(s) => check_character_references(s.text(source_text), true, s),
            Part::Expression { .. } => Ok(()),
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
fn check_element(
    compiler_syntax_tree: &CompilerSyntaxTree,
    source_text: &str,
    identifier: CompilerNodeIdentifier,
    el: &Element,
) -> R<()> {
    let name = el.name.text(source_text);
    let refused = el.kind != ElementKind::Regular
        || REFUSED_ELEMENTS.contains(&name)
        || name.contains([':', '-'])
        || name.bytes().any(|b| b.is_ascii_uppercase());
    if refused {
        return Err(unsupported(format_args!("the element <{name}>"), el.name));
    }
    if let Err(d) = rsvelte_svelte::compilation::lower::check_foreign_element(source_text, el.name)
    {
        return Err(unsupported(&d.message, d.span));
    }
    check_table_part(compiler_syntax_tree, source_text, identifier, name, el.name)?;
    if rsvelte_svelte::compilation::lower::is_customizable_select(
        compiler_syntax_tree,
        source_text,
        name,
        el,
    ) {
        return Err(unsupported(
            format_args!("rich content in <{name}>"),
            el.name,
        ));
    }
    if name == "textarea" && !compiler_syntax_tree.children(el.children).is_empty() {
        return Err(unsupported("a <textarea> with children", el.name));
    }
    Ok(())
}

/// The parser's `attribute_duplicate`, which the Svelte plugin's parser does not report: an
/// attribute or binding, or a `class:` directive, named twice (`bind:this` is not recorded).
fn check_unique(source_text: &str, attributes: &[Attribute]) -> R<()> {
    let mut seen: Vec<(bool, &str)> = Vec::new();
    for a in attributes {
        let key = match a.value {
            AttributeValue::Spread(_) | AttributeValue::Attach(_) => continue,
            AttributeValue::Class(_) => (true, a.name.text(source_text)),
            _ => (false, a.name.text(source_text)),
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
#[expect(
    clippy::too_many_lines,
    reason = "one arm per attribute shape Svelte reads"
)]
fn check_attribute(source_text: &str, tag: &str, a: &Attribute, spread: bool) -> R<()> {
    let name = a.name.text(source_text);
    match a.value {
        // Svelte runs an attachment as an effect that tracks what it reads and tears down on a
        // change; a Vue function ref is called on every patch and tracks nothing of its own.
        AttributeValue::Attach(_) => return Err(unsupported("an {@attach} tag", a.span)),
        AttributeValue::Spread(_) if matches!(tag, "input" | "textarea" | "select" | "option") => {
            return Err(unsupported(
                format_args!("a spread attribute on <{tag}>"),
                a.span,
            ));
        }
        AttributeValue::Spread(_) => return Ok(()),
        AttributeValue::Class(_) if spread => {
            return Err(unsupported(
                "a `class:` directive beside a spread attribute",
                a.span,
            ));
        }
        AttributeValue::Class(_) if !name.is_empty() => return Ok(()),
        AttributeValue::Bind(_) if spread && name != "this" => {
            return Err(unsupported("a binding beside a spread attribute", a.span));
        }
        AttributeValue::Interpolated(_) if spread => {
            return Err(unsupported(
                "an attribute with text and expressions beside a spread attribute",
                a.span,
            ));
        }
        AttributeValue::Expression { .. } | AttributeValue::Shorthand(_)
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
        AttributeValue::Bind(_) => {
            if !matches!(name, "value" | "checked" | "this") {
                return Err(unsupported(format_args!("`bind:{name}`"), a.span));
            }
        }
        AttributeValue::Static(v) if matches!(name, "class" | "style") => {
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
        AttributeValue::Boolean
        | AttributeValue::Static(_)
        | AttributeValue::Attach(_)
        | AttributeValue::Class(_)
        | AttributeValue::Spread(_) => {}
        AttributeValue::Expression { .. } | AttributeValue::Shorthand(_) if spread => {}
        AttributeValue::Expression { .. }
        | AttributeValue::Shorthand(_)
        | AttributeValue::Interpolated(_) => {
            let interpolated = matches!(a.value, AttributeValue::Interpolated(_));
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
    pub compiler_syntax_tree: &'a CompilerSyntaxTree,
    pub resolution: &'a Resolution,
    pub analysis: &'a Analysis,
    pub javascript: &'a SyntaxTree,
    pub source_text: &'a str,
    pub plan: &'a Plan,
    pub server: bool,
}

/// Builds the Vue HIR.
///
/// # Errors
///
/// A `vuelte_unsupported` diagnostic for a construct outside the mapping.
pub fn build(input: Input<'_>, to: &mut SyntaxTree) -> R<Built> {
    let compiler_syntax_tree = input.compiler_syntax_tree;
    let mut b = Builder {
        i: input,
        to,
        vb: CompilerSyntaxTreeBuilder::new(
            compiler_syntax_tree.nodes.len(),
            compiler_syntax_tree.attributes.len(),
        ),
        helpers: FxHashSet::default(),
        visited: FxHashSet::default(),
    };
    let root = b.list(
        Parent::Root,
        compiler_syntax_tree.children(compiler_syntax_tree.root),
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
        compiler_syntax_tree: b.vb.finish(root),
        helpers,
    })
}

/// What an element's function ref runs: steps that need the element, and `bind:this`.
#[derive(Default)]
struct Steps {
    mounted: Vec<NodeIdentifier>,
    this: Vec<NodeIdentifier>,
}

struct Builder<'a, 't> {
    i: Input<'a>,
    to: &'t mut SyntaxTree,
    vb: CompilerSyntaxTreeBuilder,
    helpers: FxHashSet<Helper>,
    /// The top-level functions already checked for what they read.
    visited: FxHashSet<BindingIdentifier>,
}

impl Builder<'_, '_> {
    fn list(
        &mut self,
        parent: Parent<'_>,
        ids: &[CompilerNodeIdentifier],
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        preserve_whitespace: bool,
        at: Span,
    ) -> R<vue::Children> {
        let (compiler_syntax_tree, source_text) = (self.i.compiler_syntax_tree, self.i.source_text);
        let items = clean_nodes(
            compiler_syntax_tree,
            source_text,
            parent,
            ids,
            preserve_whitespace,
        )
        .items;
        let mut out = Vec::with_capacity(items.len());
        let mut i = 0;
        while i < items.len() {
            if let Item::Node(identifier) = items[i] {
                match &compiler_syntax_tree.node(identifier).kind {
                    NodeKind::Element(_) => {
                        out.push(self.element(
                            identifier,
                            vue_parent,
                            preserve_whitespace,
                            Vec::new(),
                            None,
                        )?);
                    }
                    NodeKind::If { .. } => {
                        self.if_chain(identifier, vue_parent, preserve_whitespace, &mut out)?;
                    }
                    NodeKind::Each(_) => {
                        self.each(identifier, vue_parent, preserve_whitespace, &mut out)?;
                    }
                    NodeKind::Text { .. }
                    | NodeKind::Comment { .. }
                    | NodeKind::Expression { .. } => {
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
            self.sequence(&items[start..i], vue_parent, at, &mut out)?;
        }
        Ok(self.vb.children(&out))
    }

    /// A run of text and `{expression}` tags: one text node in both runtimes.
    fn sequence(
        &mut self,
        items: &[Item<'_>],
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        at: Span,
        out: &mut Vec<vue::CompilerNodeIdentifier>,
    ) -> R<()> {
        let lone = items.len() == 1;
        let mut text = String::new();
        for item in items {
            match item {
                Item::Text { data, .. } => text.push_str(data),
                Item::Expression(e) => {
                    if !text.is_empty() {
                        out.push(self.text(std::mem::take(&mut text), vue_parent, at));
                    }
                    self.render_read(*e)?;
                    let expression = self.text_value(*e, lone);
                    let span = self.i.javascript.source_location(*e).span().unwrap_or(at);
                    let kind = vue::NodeKind::Interpolation { expression };
                    out.push(self.vb.node(kind, span, vue_parent, 0));
                }
                Item::Node(_) => unreachable!("a sequence holds text and expressions"),
            }
        }
        if !text.is_empty() {
            out.push(self.text(text, vue_parent, at));
        }
        Ok(())
    }

    fn text(
        &mut self,
        data: String,
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        at: Span,
    ) -> vue::CompilerNodeIdentifier {
        let t = Text {
            raw: at,
            cooked: Some(data.into_boxed_str()),
        };
        self.vb.node(vue::NodeKind::Text(t), at, vue_parent, 0)
    }

    /// The string an `{expression}` contributes: Svelte's `build_template_chunk` with `set_text`
    /// or a one-time `nodeValue` (client), or its server `escape`.
    fn text_value(&mut self, e: NodeIdentifier, lone: bool) -> NodeIdentifier {
        let (javascript, source_text, resolution) =
            (self.i.javascript, self.i.source_text, self.i.resolution);
        let evaluated = resolution.evaluate(javascript, source_text, e);
        if evaluated.is_known {
            let s = known_string(&evaluated.value);
            return self.to.write_string(&s);
        }
        let x = self.template_expression(e);
        if self.i.server {
            let empty = self.to.write_string("");
            let v = self.to.logical(
                LogicalOperator::Nullish,
                x,
                empty,
                SourceLocation::SYNTHETIC,
            );
            return self.call("String", &[v]);
        }
        if lone && !self.i.analysis.meta(e).has_state {
            self.helpers.insert(Helper::NodeValue);
            return self.call("$$node", &[x]);
        }
        let value = if lone || !evaluated.is_defined {
            let empty = self.to.write_string("");
            self.to.logical(
                LogicalOperator::Nullish,
                x,
                empty,
                SourceLocation::SYNTHETIC,
            )
        } else {
            x
        };
        let head = self.to.template_element("", false);
        let tail = self.to.template_element("", true);
        self.to
            .template(&[head, tail], &[value], SourceLocation::SYNTHETIC)
    }

    /// The one element a block's fragment must be.
    fn only_element(
        &self,
        parent: Parent<'_>,
        ids: &[CompilerNodeIdentifier],
        at: Span,
    ) -> R<CompilerNodeIdentifier> {
        let items = clean_nodes(
            self.i.compiler_syntax_tree,
            self.i.source_text,
            parent,
            ids,
            false,
        )
        .items;
        match items.as_slice() {
            [Item::Node(identifier)]
                if matches!(
                    self.i.compiler_syntax_tree.node(*identifier).kind,
                    NodeKind::Element(_)
                ) =>
            {
                Ok(*identifier)
            }
            _ => Err(unsupported(
                "a block whose content is not exactly one element",
                at,
            )),
        }
    }

    fn if_chain(
        &mut self,
        identifier: CompilerNodeIdentifier,
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        preserve_whitespace: bool,
        out: &mut Vec<vue::CompilerNodeIdentifier>,
    ) -> R<()> {
        let compiler_syntax_tree = self.i.compiler_syntax_tree;
        let node = compiler_syntax_tree.node(identifier);
        let NodeKind::If {
            branches,
            otherwise,
        } = &node.kind
        else {
            unreachable!("called on an if")
        };
        for (i, b) in compiler_syntax_tree.branches(*branches).iter().enumerate() {
            let el = self.only_element(
                Parent::Block,
                compiler_syntax_tree.children(b.body),
                node.span,
            )?;
            self.render_read(b.test)?;
            let test = self.template_expression(b.test);
            let name = if i == 0 {
                DirectiveName::If
            } else {
                DirectiveName::ElseIf
            };
            let lead = vec![directive(
                name,
                None,
                DirectiveExpression::Expression(test),
                node.span,
            )];
            out.push(self.element(el, vue_parent, preserve_whitespace, lead, None)?);
        }
        if let Some(o) = otherwise {
            let el =
                self.only_element(Parent::Block, compiler_syntax_tree.children(*o), node.span)?;
            let lead = vec![directive(
                DirectiveName::Else,
                None,
                DirectiveExpression::None,
                node.span,
            )];
            out.push(self.element(el, vue_parent, preserve_whitespace, lead, None)?);
        }
        Ok(())
    }

    fn each(
        &mut self,
        identifier: CompilerNodeIdentifier,
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        preserve_whitespace: bool,
        out: &mut Vec<vue::CompilerNodeIdentifier>,
    ) -> R<()> {
        let (compiler_syntax_tree, javascript) = (self.i.compiler_syntax_tree, self.i.javascript);
        let node = compiler_syntax_tree.node(identifier);
        let NodeKind::Each(each) = &node.kind else {
            unreachable!("called on an each")
        };
        let context = each
            .context()
            .expect("checked: an {#each} has an item name");
        let el = self.only_element(
            Parent::Each,
            compiler_syntax_tree.children(each.body),
            node.span,
        )?;
        let fallback = match each.fallback {
            Some(f) => {
                if !is_name_chain(javascript, each.collection) {
                    return Err(unsupported(
                        "an {#each} fallback over a collection that is not a name or a chain of \
                         names",
                        node.span,
                    ));
                }
                Some(self.only_element(
                    Parent::Each,
                    compiler_syntax_tree.children(f),
                    node.span,
                )?)
            }
            None => None,
        };
        self.render_read(each.collection)?;
        let source = self.each_source(each.collection);
        let mut parameters = vec![copy(javascript, self.to, &mut Verbatim, context)];
        if let Some(i) = each.index() {
            parameters.push(copy(javascript, self.to, &mut Verbatim, i));
        }
        let mut lead = Vec::new();
        if fallback.is_some() {
            let list = self.each_source(each.collection);
            let length = self.to.dot(list, "length");
            lead.push(directive(
                DirectiveName::If,
                None,
                DirectiveExpression::Expression(length),
                node.span,
            ));
        }
        lead.push(directive(
            DirectiveName::For,
            None,
            DirectiveExpression::For(LoopExpression { parameters, source }),
            node.span,
        ));
        if let Some(k) = each.key().filter(|_| each.keyed(javascript)) {
            self.render_read(k)?;
            let exp = self.template_expression(k);
            let span = javascript.source_location(k).span().unwrap_or(node.span);
            lead.push(bound("key", span, exp, span));
        }
        out.push(self.element(el, vue_parent, preserve_whitespace, lead, None)?);
        if let Some(f) = fallback {
            let lead = vec![directive(
                DirectiveName::Else,
                None,
                DirectiveExpression::None,
                node.span,
            )];
            out.push(self.element(f, vue_parent, preserve_whitespace, lead, None)?);
        }
        Ok(())
    }

    fn each_source(&mut self, collection: NodeIdentifier) -> NodeIdentifier {
        self.helpers.insert(if self.i.server {
            Helper::EachServer
        } else {
            Helper::Each
        });
        let c = self.template_expression(collection);
        self.call("$$each", &[c])
    }

    fn element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        preserve_whitespace: bool,
        lead: Vec<vue::Property>,
        extra: Option<vue::Property>,
    ) -> R<vue::CompilerNodeIdentifier> {
        let (compiler_syntax_tree, source_text) = (self.i.compiler_syntax_tree, self.i.source_text);
        let node = compiler_syntax_tree.node(identifier);
        let NodeKind::Element(el) = &node.kind else {
            unreachable!("called on an element")
        };
        let tag = el.name.text(source_text);
        let attributes = compiler_syntax_tree.attributes(el.attributes);
        let mut props = lead;
        let mut steps = Steps::default();
        let mut select_target = None;
        let spread = attributes
            .iter()
            .any(|a| matches!(a.value, AttributeValue::Spread(_)));
        let directives = attributes
            .iter()
            .any(|a| matches!(a.value, AttributeValue::Class(_)));
        if spread {
            self.spread(tag, attributes, &mut props, &mut steps)?;
        } else {
            if directives {
                self.class_directives(el.name, attributes, &mut props, &mut steps)?;
            }
            for a in attributes {
                if let AttributeValue::Bind(t) = a.value
                    && tag == "select"
                {
                    select_target = Some(t);
                }
                let class = matches!(a.value, AttributeValue::Class(_))
                    || a.name.text(source_text) == "class";
                if !(directives && class) {
                    self.attribute(tag, attributes, a, &mut props, &mut steps)?;
                }
            }
        }
        props.extend(extra);
        if self.i.server && !spread && LOAD_ERROR_ELEMENTS.contains(&tag) {
            for a in attributes {
                let name = a.name.text(source_text);
                let event = matches!(
                    a.value,
                    AttributeValue::Expression { .. } | AttributeValue::Shorthand(_)
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
        let tag_type = self.vb.tag_type(tag, range, source_text);
        let kind = vue::NodeKind::Element(vue::Element {
            tag: Name::Source(el.name),
            tag_type,
            props: range,
            children: vue::Children::default(),
        });
        let origin = identifier.index() as u32;
        let v = self.vb.node(kind, node.span, vue_parent, origin);
        let children = if let Some(target) = select_target {
            self.options(el.children, v, target, node.span)?
        } else {
            let preserve = preserve_whitespace || tag == "pre" || tag == "textarea";
            if tag == "pre" {
                self.check_pre(el.children, preserve, node.span)?;
            }
            self.list(
                Parent::Element(tag),
                compiler_syntax_tree.children(el.children),
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
        attributes: &[Attribute],
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
    ) -> R<()> {
        let source_text = self.i.source_text;
        let mut fields = Vec::with_capacity(attributes.len());
        for a in attributes {
            let name = a.name.text(source_text);
            let value = match &a.value {
                &AttributeValue::Spread(e) => {
                    self.render_read(e)?;
                    let x = self.template_expression(e);
                    fields.push(self.to.spread(x, SourceLocation::SYNTHETIC));
                    continue;
                }
                &AttributeValue::Bind(t) => {
                    self.bind_this(a, t, steps)?;
                    continue;
                }
                AttributeValue::Boolean => self.to.write_boolean(true, SourceLocation::SYNTHETIC),
                AttributeValue::Static(v) => self.to.write_string(v),
                &(AttributeValue::Expression { expression, .. }
                | AttributeValue::Shorthand(expression)) => {
                    self.render_read(expression)?;
                    let x = self.template_expression(expression);
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
            let key = self.to.write_string(name);
            fields.push(self.to.property(key, value, 0, SourceLocation::SYNTHETIC));
        }
        let object = self.to.object(&fields, SourceLocation::SYNTHETIC);
        if self.i.server {
            self.helpers.insert(Helper::Spread);
            let mut arguments = vec![object];
            if LOAD_ERROR_ELEMENTS.contains(&tag) {
                let events = ["onload", "onerror"].map(|e| self.to.write_string(e));
                arguments.push(self.to.array(&events, SourceLocation::SYNTHETIC));
            }
            let v = self.call("$$spread", &arguments);
            let span = attributes.first().map_or_else(Span::default, |a| a.span);
            props.push(directive(
                DirectiveName::Bind,
                None,
                DirectiveExpression::Expression(v),
                span,
            ));
        } else {
            self.helpers.insert(Helper::Attributes);
            let el = self.to.identifier("$$el");
            steps.mounted.push(self.call("$$attributes", &[el, object]));
        }
        Ok(())
    }

    /// `class:` directives with the `class` attribute: `set_class` (client, after each patch) or
    /// `attr_class` (server), both `to_class` of the value and the directives.
    fn class_directives(
        &mut self,
        at: Span,
        attributes: &[Attribute],
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
    ) -> R<()> {
        let source_text = self.i.source_text;
        let mut value = None;
        let mut fields = Vec::new();
        for a in attributes {
            let name = a.name.text(source_text);
            match &a.value {
                &AttributeValue::Class(e) => {
                    self.render_read(e)?;
                    let x = self.template_expression(e);
                    let key = self.to.write_string(name);
                    fields.push(self.to.property(key, x, 0, SourceLocation::SYNTHETIC));
                }
                AttributeValue::Static(v) if name == "class" => {
                    value = Some(self.to.write_string(v));
                }
                &(AttributeValue::Expression { expression, .. }
                | AttributeValue::Shorthand(expression))
                    if name == "class" =>
                {
                    self.render_read(expression)?;
                    let x = self.template_expression(expression);
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
        let value = value.unwrap_or_else(|| self.to.write_string(""));
        let object = self.to.object(&fields, SourceLocation::SYNTHETIC);
        if self.i.server {
            self.helpers.insert(Helper::ToClass);
            let v = self.call("$$to_class", &[value, object]);
            props.push(bound("CLASS", at, v, at));
        } else {
            self.helpers.insert(Helper::SetClass);
            let el = self.to.identifier("$$el");
            steps
                .mounted
                .push(self.call("$$set_class", &[el, value, object]));
        }
        Ok(())
    }

    /// `($$el) => { if ($$el !== null) { …mounted } …this }`: Vue calls a function ref with the
    /// element after every patch of it and with `null` on unmount, which is when Svelte's effects
    /// and `bind:this` run.
    fn ref_function(&mut self, steps: Steps) -> Option<NodeIdentifier> {
        if steps.mounted.is_empty() && steps.this.is_empty() {
            return None;
        }
        let mut body = Vec::new();
        if !steps.mounted.is_empty() {
            let statements: Vec<NodeIdentifier> = steps
                .mounted
                .into_iter()
                .map(|s| self.to.expression_statement(s))
                .collect();
            let block = self.to.block(&statements, SourceLocation::SYNTHETIC);
            let el = self.to.identifier("$$el");
            let null = self.to.null(SourceLocation::SYNTHETIC);
            let test = self.to.binary(
                BinaryOperator::StrictNotEq,
                el,
                null,
                SourceLocation::SYNTHETIC,
            );
            body.push(self.to.if_(test, block, None, SourceLocation::SYNTHETIC));
        }
        body.extend(
            steps
                .this
                .into_iter()
                .map(|s| self.to.expression_statement(s)),
        );
        let block = self.to.block(&body, SourceLocation::SYNTHETIC);
        let param = self.to.identifier("$$el");
        Some(
            self.to
                .arrow(&[param], block, false, false, SourceLocation::SYNTHETIC),
        )
    }

    /// A `<pre>` whose content starts with a newline: the HTML parser drops it from the server's
    /// markup, the DOM keeps it in the client's.
    fn check_pre(&self, children: Children, preserve: bool, at: Span) -> R<()> {
        let items = clean_nodes(
            self.i.compiler_syntax_tree,
            self.i.source_text,
            Parent::Element("pre"),
            self.i.compiler_syntax_tree.children(children),
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
        attributes: &[Attribute],
        a: &Attribute,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
    ) -> R<()> {
        let name = a.name.text(self.i.source_text);
        let at = a.name.span();
        match &a.value {
            &AttributeValue::Bind(e) => self.binding(tag, attributes, a, e, props, steps),
            AttributeValue::Attach(_) | AttributeValue::Class(_) | AttributeValue::Spread(_) => {
                Err(unsupported("this attribute", a.span))
            }
            AttributeValue::Boolean => {
                props.push(attribute(a, None));
                Ok(())
            }
            AttributeValue::Static(v) => {
                if tag == "select" && name == "value" {
                    return Err(unsupported("a `value` attribute on a <select>", a.span));
                }
                if !(name == "class" && v.is_empty()) {
                    props.push(attribute(a, Some(v)));
                }
                Ok(())
            }
            &(AttributeValue::Expression { expression, .. }
            | AttributeValue::Shorthand(expression)) => {
                if let Some(event) = name.strip_prefix("on") {
                    return self.handler(attributes, a, event, expression, props);
                }
                self.render_read(expression)?;
                let x = self.template_expression(expression);
                if name == "class" {
                    self.helpers.insert(Helper::Class);
                    let v = self.call("$$class", &[x]);
                    props.push(bound("CLASS", at, v, a.span));
                } else if name == "value" {
                    if self.i.server {
                        let v = self.attribute_value(expression, x);
                        props.push(bound("value", at, v, a.span));
                    } else {
                        self.helpers.insert(Helper::Value);
                        let el = self.to.identifier("$$el");
                        steps.mounted.push(self.call("$$value", &[el, x]));
                    }
                } else if is_text_attribute(name) {
                    let v = self.attribute_value(expression, x);
                    props.push(bound(name, at, v, a.span));
                } else {
                    let v = self.boolean(expression, x);
                    props.push(bound(name, at, v, a.span));
                }
                Ok(())
            }
            AttributeValue::Interpolated(parts) => {
                for p in parts {
                    if let Part::Expression { expression, .. } = *p {
                        self.render_read(expression)?;
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
    fn attribute_value(&mut self, expression: NodeIdentifier, x: NodeIdentifier) -> NodeIdentifier {
        if is_primitive(self.i.javascript, expression) {
            return x;
        }
        self.helpers.insert(if self.i.server {
            Helper::AttributeServer
        } else {
            Helper::Attribute
        });
        self.call("$$attr", &[x])
    }

    /// A boolean attribute's value: Svelte's client assigns the property (`Boolean`), its server
    /// renders `''` as present (`$$bool`).
    fn boolean(&mut self, expression: NodeIdentifier, x: NodeIdentifier) -> NodeIdentifier {
        if is_boolean(self.i.javascript, expression) {
            return x;
        }
        if self.i.server {
            self.helpers.insert(Helper::BooleanServer);
            self.call("$$bool", &[x])
        } else {
            self.call("Boolean", &[x])
        }
    }

    fn handler(
        &mut self,
        attributes: &[Attribute],
        a: &Attribute,
        event: &str,
        expression: NodeIdentifier,
        props: &mut Vec<vue::Property>,
    ) -> R<()> {
        let source_text = self.i.source_text;
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
        let bound_event = attributes.iter().any(|o| {
            matches!(o.value, AttributeValue::Bind(_))
                && binding_event(o.name.text(source_text)) == event
        });
        if bound_event {
            return Err(unsupported(
                format_args!("`on{event}` beside a binding that listens to `{event}`"),
                a.span,
            ));
        }
        self.check_handler(expression, a.span)?;
        if self.i.server {
            return Ok(());
        }
        let value = self.template_expression(expression);
        let name = spelled(event, a.name.span());
        props.push(directive(
            DirectiveName::On,
            Some(name),
            DirectiveExpression::Expression(value),
            a.span,
        ));
        Ok(())
    }

    /// Svelte calls a handler with the element as `this`, Vue with none: only handlers that
    /// cannot read `this`.
    fn check_handler(&self, expression: NodeIdentifier, span: Span) -> R<()> {
        let (javascript, resolution) = (self.i.javascript, self.i.resolution);
        let refused = || {
            Err(unsupported(
                "an event handler that is not an arrow, a function or a top-level function that \
                 does not read `this`",
                span,
            ))
        };
        match javascript.kind(expression) {
            Kind::Arrow { .. } => Ok(()),
            Kind::Function { body, .. } if !reads_this(javascript, body) => Ok(()),
            Kind::Identifier(_) => {
                let Some((b, info)) = resolution.binding(expression) else {
                    return refused();
                };
                if resolution.sem.bindings[b].scope != ScopeIdentifier::ROOT || !info.is_function {
                    return refused();
                }
                match self.function_of(b) {
                    Some(f) if !reads_this(javascript, f) => Ok(()),
                    _ => refused(),
                }
            }
            _ => refused(),
        }
    }

    /// The function a top-level function binding holds: its declaration or initialiser.
    fn function_of(&self, b: BindingIdentifier) -> Option<NodeIdentifier> {
        let javascript = self.i.javascript;
        let binding = &self.i.resolution.sem.bindings[b];
        if binding.kind == DeclarationKind::Function {
            return self.i.plan.functions.get(&b).copied();
        }
        binding.initializer(javascript).filter(|&i| {
            matches!(
                javascript.kind(i),
                Kind::Function { .. } | Kind::Arrow { .. }
            )
        })
    }

    fn binding(
        &mut self,
        tag: &str,
        attributes: &[Attribute],
        a: &Attribute,
        target: NodeIdentifier,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
    ) -> R<()> {
        let source_text = self.i.source_text;
        let property = a.name.text(source_text);
        if property == "this" {
            return self.bind_this(a, target, steps);
        }
        let beside = attributes.iter().any(|o| {
            let other = o.name.text(source_text);
            !std::ptr::eq(o, a)
                && (matches!(other, "value" | "checked" | "group")
                    || (matches!(o.value, AttributeValue::Bind(_)) && other != "this"))
        });
        if beside {
            return Err(unsupported(
                "a binding beside a `value`, `checked` or another binding",
                a.span,
            ));
        }
        self.check_target(target, a.span)?;
        self.render_read(target)?;
        match (property, tag, static_type(source_text, attributes)) {
            ("value", "input", Some(t)) if TEXT_INPUT_TYPES.contains(&t) => {
                self.bind_text(a, target, props, steps);
                Ok(())
            }
            ("value", "textarea", _) => {
                self.bind_text(a, target, props, steps);
                Ok(())
            }
            ("value", "select", _) => {
                if attributes
                    .iter()
                    .any(|o| o.name.text(source_text) == "multiple")
                {
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
    fn check_target(&self, target: NodeIdentifier, span: Span) -> R<()> {
        let (javascript, resolution) = (self.i.javascript, self.i.resolution);
        let mut root = target;
        while let Kind::Member { object, .. } = javascript.kind(root) {
            root = object;
        }
        let kind = matches!(javascript.kind(root), Kind::Identifier(_))
            .then(|| resolution.binding(root).map(|(_, info)| info.kind))
            .flatten();
        let member = root != target;
        let ok = match kind {
            Some(BindingKind::State | BindingKind::RawState) => true,
            Some(BindingKind::Each) => member,
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
        target: NodeIdentifier,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
    ) {
        let at = a.name.span();
        let x = self.template_expression(target);
        if self.i.server {
            let v = self.attribute_value(target, x);
            props.push(bound("value", at, v, a.span));
            return;
        }
        let el = self.to.identifier("$$el");
        let dom = self.to.dot(el, "value");
        let differs = self.to.binary(
            BinaryOperator::StrictNotEq,
            x,
            dom,
            SourceLocation::SYNTHETIC,
        );
        let el = self.to.identifier("$$el");
        let dom = self.to.dot(el, "value");
        let current = self.template_expression(target);
        let empty = self.to.write_string("");
        let value = self.to.logical(
            LogicalOperator::Nullish,
            current,
            empty,
            SourceLocation::SYNTHETIC,
        );
        let assign = self.to.assign(
            AssignmentOperator::Assign,
            dom,
            value,
            SourceLocation::SYNTHETIC,
        );
        steps.mounted.push(self.to.logical(
            LogicalOperator::And,
            differs,
            assign,
            SourceLocation::SYNTHETIC,
        ));
        let handler = self.assign_from_event(target, "value");
        let name = spelled("input", at);
        props.push(directive(
            DirectiveName::On,
            Some(name),
            DirectiveExpression::Expression(handler),
            a.span,
        ));
    }

    /// `bind_checked` (client): a `change` listener, on mount a nullish value set to the element's
    /// state, and after each patch its render effect (`input.checked = Boolean(value)`). The
    /// server prints `checked` as `attr(…, true)` does.
    fn bind_checked(
        &mut self,
        a: &Attribute,
        target: NodeIdentifier,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
    ) {
        let at = a.name.span();
        let x = self.template_expression(target);
        if self.i.server {
            self.helpers.insert(Helper::BooleanServer);
            let v = self.call("$$bool", &[x]);
            props.push(bound("checked", at, v, a.span));
            return;
        }
        let handler = self.assign_from_event(target, "checked");
        let name = spelled("change", at);
        props.push(directive(
            DirectiveName::On,
            Some(name),
            DirectiveExpression::Expression(handler),
            a.span,
        ));
        self.helpers.insert(Helper::Once);
        let current = self.template_expression(target);
        let null = self.to.null(SourceLocation::SYNTHETIC);
        let is_null = self
            .to
            .binary(BinaryOperator::Eq, current, null, SourceLocation::SYNTHETIC);
        let lhs = self.template_expression(target);
        let el = self.to.identifier("$$el");
        let checked = self.to.dot(el, "checked");
        let assign = self.to.assign(
            AssignmentOperator::Assign,
            lhs,
            checked,
            SourceLocation::SYNTHETIC,
        );
        let adopt = self.to.logical(
            LogicalOperator::And,
            is_null,
            assign,
            SourceLocation::SYNTHETIC,
        );
        let step = self
            .to
            .arrow(&[], adopt, true, false, SourceLocation::SYNTHETIC);
        let el = self.to.identifier("$$el");
        steps.mounted.push(self.call("$$once", &[el, step]));
        let el = self.to.identifier("$$el");
        let dom = self.to.dot(el, "checked");
        let value = self.call("Boolean", &[x]);
        steps.mounted.push(self.to.assign(
            AssignmentOperator::Assign,
            dom,
            value,
            SourceLocation::SYNTHETIC,
        ));
    }

    /// `bind_select_value` (client): a `change` listener reading the chosen option, and after each
    /// patch `select_option`, with the browser's choice adopted for `undefined` on mount.
    fn bind_select(
        &mut self,
        a: &Attribute,
        target: NodeIdentifier,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps,
    ) {
        self.helpers.insert(Helper::Select);
        self.helpers.insert(Helper::Option);
        let at = a.name.span();
        let event = self.to.identifier("$$e");
        let lhs = self.template_expression(target);
        let e = self.to.identifier("$$e");
        let select = self.to.dot(e, "currentTarget");
        let value = self.call("$$option", &[select]);
        let assign = self.to.assign(
            AssignmentOperator::Assign,
            lhs,
            value,
            SourceLocation::SYNTHETIC,
        );
        let handler = self
            .to
            .arrow(&[event], assign, true, false, SourceLocation::SYNTHETIC);
        let name = spelled("change", at);
        props.push(directive(
            DirectiveName::On,
            Some(name),
            DirectiveExpression::Expression(handler),
            a.span,
        ));
        let v = self.to.identifier("$$v");
        let lhs = self.template_expression(target);
        let v2 = self.to.identifier("$$v");
        let set_body = self.to.assign(
            AssignmentOperator::Assign,
            lhs,
            v2,
            SourceLocation::SYNTHETIC,
        );
        let set = self
            .to
            .arrow(&[v], set_body, true, false, SourceLocation::SYNTHETIC);
        let el = self.to.identifier("$$el");
        let current = self.template_expression(target);
        steps
            .mounted
            .push(self.call("$$select", &[el, current, set]));
    }

    /// `bind:this={x}` on a top-level `$state`: `x = $$el` after each patch, `null` on unmount.
    fn bind_this(&mut self, a: &Attribute, target: NodeIdentifier, steps: &mut Steps) -> R<()> {
        let (javascript, resolution) = (self.i.javascript, self.i.resolution);
        let state = matches!(javascript.kind(target), Kind::Identifier(_))
            && resolution.binding(target).is_some_and(|(b, info)| {
                matches!(info.kind, BindingKind::State | BindingKind::RawState)
                    && resolution.sem.bindings[b].scope == ScopeIdentifier::ROOT
            });
        if !state {
            return Err(unsupported(
                "`bind:this` to anything but a top-level `$state`",
                a.span,
            ));
        }
        if !self.i.server {
            let lhs = self.template_expression(target);
            let el = self.to.identifier("$$el");
            steps.this.push(self.to.assign(
                AssignmentOperator::Assign,
                lhs,
                el,
                SourceLocation::SYNTHETIC,
            ));
        }
        Ok(())
    }

    /// `($$e) => (target = $$e.currentTarget.<property>)`.
    fn assign_from_event(&mut self, target: NodeIdentifier, property: &str) -> NodeIdentifier {
        let event = self.to.identifier("$$e");
        let lhs = self.template_expression(target);
        let e = self.to.identifier("$$e");
        let el = self.to.dot(e, "currentTarget");
        let value = self.to.dot(el, property);
        let assign = self.to.assign(
            AssignmentOperator::Assign,
            lhs,
            value,
            SourceLocation::SYNTHETIC,
        );
        self.to
            .arrow(&[event], assign, true, false, SourceLocation::SYNTHETIC)
    }

    /// The options of a bound `<select>`, each an `<option>` with a static `value`; on the server
    /// each is `selected` when the value is the bound one (`===`, as Svelte's renderer compares).
    fn options(
        &mut self,
        children: Children,
        select: vue::CompilerNodeIdentifier,
        target: NodeIdentifier,
        at: Span,
    ) -> R<vue::Children> {
        let (compiler_syntax_tree, source_text) = (self.i.compiler_syntax_tree, self.i.source_text);
        let items = clean_nodes(
            compiler_syntax_tree,
            source_text,
            Parent::Element("select"),
            compiler_syntax_tree.children(children),
            false,
        )
        .items;
        let mut out = Vec::with_capacity(items.len());
        for item in &items {
            let Item::Node(identifier) = *item else {
                return Err(unsupported(
                    "a bound <select> with content other than options",
                    at,
                ));
            };
            let NodeKind::Element(el) = &compiler_syntax_tree.node(identifier).kind else {
                return Err(unsupported("a block in a bound <select>", at));
            };
            let value = compiler_syntax_tree
                .attributes(el.attributes)
                .iter()
                .find_map(|a| {
                    (a.name.text(source_text) == "value").then_some(match &a.value {
                        AttributeValue::Static(v) => Some(v.clone()),
                        _ => None,
                    })
                });
            let (true, Some(Some(value))) = (el.name.text(source_text) == "option", value) else {
                return Err(unsupported(
                    "a bound <select> with content other than options with a static `value`",
                    el.name,
                ));
            };
            let extra = self.i.server.then(|| {
                let x = self.template_expression(target);
                let v = self.to.write_string(&value);
                let test =
                    self.to
                        .binary(BinaryOperator::StrictEq, x, v, SourceLocation::SYNTHETIC);
                bound("selected", el.name, test, el.name)
            });
            out.push(self.element(identifier, Some(select), false, Vec::new(), extra)?);
        }
        Ok(self.vb.children(&out))
    }

    /// `a="s{e}t"`: Svelte's attribute chunk, with `?? ''` (client) or `stringify` (server)
    /// around each expression it cannot prove a string.
    fn interpolated(&mut self, parts: &[Part]) -> NodeIdentifier {
        let (javascript, source_text, resolution) =
            (self.i.javascript, self.i.source_text, self.i.resolution);
        let mut quasis = Vec::with_capacity(parts.len() + 1);
        let mut expressions = Vec::with_capacity(parts.len());
        let mut text = String::new();
        for p in parts {
            match *p {
                Part::Text(span) => {
                    text.push_str(&rsvelte_svelte::syntax::syntax_tree::decode_text(
                        span.text(source_text),
                    ));
                }
                Part::Expression { expression, .. } => {
                    let evaluated = resolution.evaluate(javascript, source_text, expression);
                    if evaluated.is_known {
                        text.push_str(&known_string(&evaluated.value));
                        continue;
                    }
                    quasis.push(
                        self.to
                            .template_element(&sanitize_template_string(&text), false),
                    );
                    text.clear();
                    let x = self.template_expression(expression);
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
                        let empty = self.to.write_string("");
                        self.to.logical(
                            LogicalOperator::Nullish,
                            x,
                            empty,
                            SourceLocation::SYNTHETIC,
                        )
                    };
                    expressions.push(value);
                }
            }
        }
        if expressions.is_empty() {
            return self.to.write_string(&text);
        }
        quasis.push(
            self.to
                .template_element(&sanitize_template_string(&text), true),
        );
        self.to
            .template(&quasis, &expressions, SourceLocation::SYNTHETIC)
    }

    fn call(&mut self, name: &str, arguments: &[NodeIdentifier]) -> NodeIdentifier {
        let callee = self.to.identifier(name);
        self.to.call0(callee, arguments)
    }

    /// A template expression in the Vue tree.
    fn template_expression(&mut self, e: NodeIdentifier) -> NodeIdentifier {
        copy(
            self.i.javascript,
            self.to,
            &mut TemplateRewrite {
                resolution: self.i.resolution,
            },
            e,
        )
    }

    /// Refuses an expression evaluated while rendering that reads, directly or through the
    /// component's functions, a top-level binding that changes without being reactive: Svelte
    /// keeps what it rendered, a Vue re-render would show the new value.
    fn render_read(&mut self, e: NodeIdentifier) -> R<()> {
        let javascript = self.i.javascript;
        let mut reads = Vec::new();
        walk(javascript, e, &mut |n| match javascript.kind(n) {
            Kind::Identifier(_) => {
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
                span_of(javascript, n),
            )),
            _ => Ok(()),
        })?;
        for n in reads {
            self.read_binding(n)?;
        }
        Ok(())
    }

    fn read_binding(&mut self, identifier: NodeIdentifier) -> R<()> {
        let (javascript, resolution) = (self.i.javascript, self.i.resolution);
        let Some((b, info)) = resolution.binding(identifier) else {
            return Ok(());
        };
        let binding = &resolution.sem.bindings[b];
        if binding.scope != ScopeIdentifier::ROOT || binding.node == identifier {
            return Ok(());
        }
        let changes = match info.kind {
            BindingKind::Normal => binding.writes > 0 || binding.mutations > 0,
            BindingKind::RawState => binding.mutations > 0,
            _ => false,
        };
        if changes {
            return Err(unsupported(
                format_args!(
                    "the template reads `{}`, which changes without being reactive",
                    javascript.name(identifier)
                ),
                span_of(javascript, identifier),
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

    fn is_impure_global(&self, object: NodeIdentifier, property: NodeIdentifier) -> bool {
        let javascript = self.i.javascript;
        matches!(javascript.kind(object), Kind::Identifier(_))
            && self.i.resolution.binding(object).is_none()
            && matches!(
                (javascript.name(object), javascript.name(property)),
                ("Math", "random") | ("Date" | "performance", "now")
            )
    }
}

fn known_string(v: &Value) -> String {
    match v {
        Value::Null | Value::Undefined => String::new(),
        v => v.to_javascript_string(),
    }
}

fn span_of(javascript: &SyntaxTree, n: NodeIdentifier) -> Span {
    javascript.source_location(n).span().unwrap_or_default()
}

/// Template references to props read `$$props.<key>`; the Vue compiler handles the rest.
struct TemplateRewrite<'a> {
    resolution: &'a Resolution,
}

impl Rewrite for TemplateRewrite<'_> {
    fn rewrite(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        match from.kind(identifier) {
            Kind::Identifier(_) => prop_member(self.resolution, from, to, identifier),
            Kind::Property {
                key,
                value,
                shorthand: true,
                computed: false,
                ..
            } => {
                let v = prop_member(self.resolution, from, to, value)?;
                let k = to.ident(from.name(key), from.source_location(key));
                Some(to.property(k, v, 0, from.source_location(identifier)))
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
fn static_type<'a>(source_text: &str, attributes: &'a [Attribute]) -> Option<&'a str> {
    let mut ty = Some("text");
    for a in attributes {
        if a.name.text(source_text) == "type" {
            ty = match &a.value {
                AttributeValue::Static(v) => Some(&**v),
                _ => None,
            };
        }
    }
    ty
}

/// Whether a function body reads `this`, outside the nested functions that rebind it.
fn reads_this(javascript: &SyntaxTree, body: NodeIdentifier) -> bool {
    let mut stack = vec![body];
    while let Some(n) = stack.pop() {
        match javascript.kind(n) {
            Kind::This => return true,
            Kind::Function { .. } if n != body => {}
            _ => javascript.for_each_child(n, |k| stack.push(k)),
        }
    }
    false
}

/// An identifier or a chain of non-computed members: evaluating it twice reads the same value.
fn is_name_chain(javascript: &SyntaxTree, e: NodeIdentifier) -> bool {
    match javascript.kind(e) {
        Kind::Identifier(_) => true,
        Kind::Member {
            object,
            computed: false,
            optional: false,
            ..
        } => is_name_chain(javascript, object),
        _ => false,
    }
}

/// An expression whose value is a boolean by construction.
fn is_boolean(javascript: &SyntaxTree, e: NodeIdentifier) -> bool {
    match javascript.kind(e) {
        Kind::Boolean(_) | Kind::Unary(UnaryOperator::Not, _) => true,
        Kind::Binary(op, ..) => matches!(
            op,
            BinaryOperator::Eq
                | BinaryOperator::NotEq
                | BinaryOperator::StrictEq
                | BinaryOperator::StrictNotEq
                | BinaryOperator::Lt
                | BinaryOperator::LtEq
                | BinaryOperator::Gt
                | BinaryOperator::GtEq
                | BinaryOperator::In
                | BinaryOperator::InstanceOf
        ),
        Kind::Logical(LogicalOperator::And | LogicalOperator::Or, l, r) => {
            is_boolean(javascript, l) && is_boolean(javascript, r)
        }
        Kind::Conditional {
            consequent,
            alternate,
            ..
        } => is_boolean(javascript, consequent) && is_boolean(javascript, alternate),
        _ => false,
    }
}

/// An expression whose value is a string, number or boolean by construction. Arithmetic is not:
/// it can be a `bigint`, which Vue's server drops from an attribute and Svelte's prints.
fn is_primitive(javascript: &SyntaxTree, e: NodeIdentifier) -> bool {
    let is_string =
        |n: NodeIdentifier| matches!(javascript.kind(n), Kind::String | Kind::Template { .. });
    match javascript.kind(e) {
        Kind::String | Kind::Number(_) | Kind::Template { .. } => true,
        Kind::Unary(op, _) => {
            matches!(op, UnaryOperator::Plus | UnaryOperator::TypeOf) || is_boolean(javascript, e)
        }
        Kind::Binary(BinaryOperator::Add, l, r) => is_string(l) || is_string(r),
        Kind::Logical(_, l, r) => is_primitive(javascript, l) && is_primitive(javascript, r),
        Kind::Conditional {
            consequent,
            alternate,
            ..
        } => is_primitive(javascript, consequent) && is_primitive(javascript, alternate),
        _ => is_boolean(javascript, e),
    }
}

/// `` ${event}="this.__e=event"``, which Svelte's server prints for a load or error event.
fn captured_event(event: &str, span: Span) -> vue::Property {
    vue::Property {
        kind: PropertyKind::Attribute {
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

fn directive(
    name: DirectiveName,
    arg: Option<Name>,
    exp: DirectiveExpression,
    span: Span,
) -> vue::Property {
    vue::Property {
        kind: PropertyKind::Directive(vue::Directive {
            name,
            arg,
            modifiers: Box::new([]),
            exp,
        }),
        span,
        origin: 0,
    }
}

fn bound(name: &str, at: Span, value: NodeIdentifier, span: Span) -> vue::Property {
    directive(
        DirectiveName::Bind,
        Some(spelled(name, at)),
        DirectiveExpression::Expression(value),
        span,
    )
}

fn attribute(a: &Attribute, value: Option<&str>) -> vue::Property {
    vue::Property {
        kind: PropertyKind::Attribute {
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
