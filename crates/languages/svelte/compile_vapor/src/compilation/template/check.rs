use oxc_ast::ast::{Expression, IdentifierReference, ThisExpression};
use oxc_ast_visit::{Visit, walk};
use oxc_semantic::NodeId;
use rsvelte_svelte_semantic::compiler_syntax_tree::MetadataTag;
use rsvelte_svelte_syntax::syntax_tree::Component;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{
    Attribute, AttributeValue, Children, CompilerNodeIdentifier, CompilerSyntaxTree, Element,
    ElementKind, FxHashSet, NodeKind, R, Resolution, Span, span_of, unsupported,
};

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

/// Element names whose content or namespace the translation does not handle. Svelte's client
/// template drops `<html>`, `<head>` and `<body>` when the browser parses it.
const REFUSED_ELEMENTS: &[&str] = &[
    "script", "slot", "noscript", "iframe", "object", "html", "head", "body",
];

fn is_options(el: &Element) -> bool {
    el.kind == ElementKind::Metadata(Some(MetadataTag::Options))
}

/// The cheap checks, before anything is built: element kinds and names, attribute shapes, the
/// names template expressions read.
///
/// # Errors
///
/// A `vuelte_unsupported` diagnostic at the first construct outside the mapping.
pub(crate) fn check(
    c: &Component,
    compiler_syntax_tree: &CompilerSyntaxTree,
    res: &Resolution,
    source_text: &str,
    namespaces: &rsvelte_svelte_compile::render_plan::Namespaces,
) -> R<super::Options> {
    let javascript = &c.javascript;
    let mut options = super::Options::default();
    let mut option_expressions = FxHashSet::default();
    for (_, node) in compiler_syntax_tree.nodes.iter_enumerated() {
        if let NodeKind::Element(element) = &node.kind
            && is_options(element)
        {
            let attributes = compiler_syntax_tree.attributes(element.attributes);
            options = super::options::read(javascript, attributes, source_text)?;
            option_expressions.extend(attributes.iter().filter_map(|a| match a.value {
                AttributeValue::Expression { expression, .. } => Some(expression),
                _ => None,
            }));
        }
    }
    for (identifier, n) in compiler_syntax_tree.nodes.iter_enumerated() {
        let NodeKind::Element(el) = &n.kind else {
            continue;
        };
        if is_options(el) {
            continue;
        }
        let name = el.name.text(source_text);
        let foreign = namespaces.get(identifier) != super::Namespace::Html;
        check_element(
            compiler_syntax_tree,
            source_text,
            identifier,
            el,
            foreign,
            options.custom_element.is_some(),
        )?;
        let attributes = compiler_syntax_tree.attributes(el.attributes);
        let spread = attributes
            .iter()
            .any(|a| matches!(a.value, AttributeValue::Spread(_)));
        for a in attributes {
            if name == "slot" {
                check_slot_attribute(source_text, a)?;
            }
            check_await_directive(javascript, a)?;
            if name == "svelte:boundary" {
                if !matches!(a.name.text(source_text), "onerror" | "failed" | "pending")
                    || !matches!(
                        a.value,
                        AttributeValue::Expression { .. } | AttributeValue::Shorthand(_)
                    )
                {
                    return Err(unsupported("this boundary attribute", a.span));
                }
            } else if el.kind != ElementKind::Component {
                check_attribute(source_text, name, a, spread, foreign)?;
            }
            if matches!(a.value, AttributeValue::Animate { .. }) {
                let valid = n.parent.is_some_and(|parent| {
                    matches!(&compiler_syntax_tree.node(parent).kind,
                        NodeKind::Each(each) if each.key.is_some())
                });
                if !valid {
                    return Err(unsupported(
                        "an animation outside an immediate child of a keyed each block",
                        a.span,
                    ));
                }
            }
        }
    }
    let mut names = Names {
        res,
        rune_roots: FxHashSet::default(),
        result: Ok(()),
    };
    for (e, expression) in javascript.expressions() {
        if !option_expressions.contains(&e) {
            names.visit_expression(expression);
        }
    }
    names.result?;
    Ok(options)
}

/// The `$` names and `this` a template expression reads.
struct Names<'r> {
    res: &'r Resolution,
    /// The callees' roots of the rune calls seen so far.
    rune_roots: FxHashSet<NodeId>,
    result: R<()>,
}

impl<'a> Visit<'a> for Names<'_> {
    fn visit_expression(&mut self, it: &Expression<'a>) {
        if let Expression::CallExpression(call) = it
            && self.res.rune(it).is_some_and(|(name, _)| {
                crate::script::runes::local(name).is_some()
                    || crate::script::runes::eager(name)
                    || crate::script::runes::value(name)
            })
        {
            let mut callee = call.callee.get_inner_expression();
            while let Expression::StaticMemberExpression(m) = callee {
                callee = m.object.get_inner_expression();
            }
            if let Expression::Identifier(id) = callee {
                self.rune_roots.insert(id.node_id.get());
            }
        }
        walk::walk_expression(self, it);
    }

    fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
        if self.result.is_ok()
            && self.res.symbol(it).is_none()
            && !self.rune_roots.contains(&it.node_id.get())
            && it.name.starts_with('$')
        {
            self.result = Err(unsupported(
                format_args!("the rune or store subscription `{}`", it.name),
                span_of(it.span),
            ));
        }
    }

    fn visit_this_expression(&mut self, it: &ThisExpression) {
        if self.result.is_ok() {
            self.result = Err(unsupported("`this` in the template", span_of(it.span)));
        }
    }
}

fn check_slot_attribute(source_text: &str, a: &Attribute) -> R<()> {
    if !matches!(
        a.value,
        AttributeValue::Boolean
            | AttributeValue::Static(_)
            | AttributeValue::Expression { .. }
            | AttributeValue::Shorthand(_)
            | AttributeValue::Interpolated(_)
            | AttributeValue::Spread(_)
            | AttributeValue::Let(_)
    ) {
        return Err(unsupported(
            "slot_element_invalid_attribute: a directive on <slot>",
            a.span,
        ));
    }
    if a.name.text(source_text) == "name" {
        let text = match &a.value {
            AttributeValue::Static(value) => Some(value.as_ref()),
            _ => None,
        };
        if let Some((code, _)) = rsvelte_svelte_semantic::warnings::slot_name_error(text) {
            return Err(unsupported(code, a.span));
        }
    }
    Ok(())
}

fn check_await_directive(
    javascript: &rsvelte_typescript_tree::Tree,
    attribute: &Attribute,
) -> R<()> {
    let (first, second): (Option<ExpressionIdentifier>, Option<ExpressionIdentifier>) =
        match attribute.value {
            AttributeValue::Attach(expression) | AttributeValue::Bind(expression) => {
                (Some(expression), None)
            }
            AttributeValue::Use { action, argument } => (Some(action), argument),
            AttributeValue::Transition {
                function, argument, ..
            }
            | AttributeValue::Animate { function, argument } => (Some(function), argument),
            _ => return Ok(()),
        };
    if first.into_iter().chain(second).any(|expression| {
        crate::compilation::asynchronous::has_await(javascript.get_expression(expression))
    }) {
        if matches!(attribute.value, AttributeValue::Bind(_)) {
            return Err(unsupported(
                "an await expression in a binding (Svelte rejects it as `bind_invalid_expression`)",
                attribute.span,
            ));
        }
        return Err(unsupported(
            "an await expression in an action, attachment, transition or animation (Svelte \
             rejects it as `illegal_await_expression`)",
            attribute.span,
        ));
    }
    Ok(())
}

/// The element's name, its place in the browser's parse of Svelte's template, its children.
pub(super) fn check_element(
    compiler_syntax_tree: &CompilerSyntaxTree,
    source_text: &str,
    identifier: CompilerNodeIdentifier,
    el: &Element,
    foreign: bool,
    custom_element: bool,
) -> R<()> {
    let name = el.name.text(source_text);
    let children = compiler_syntax_tree.children(el.children);
    let only = |allowed: fn(&NodeKind) -> bool| {
        children
            .iter()
            .all(|&child| allowed(&compiler_syntax_tree.node(child).kind))
    };
    let text_like = |kind: &NodeKind| {
        matches!(
            kind,
            NodeKind::Text { .. } | NodeKind::Expression { .. } | NodeKind::Comment { .. }
        )
    };
    if name == "slot" && custom_element {
        return Ok(());
    }
    if name == "style" && !only(|kind| matches!(kind, NodeKind::Text { .. })) {
        return Err(unsupported("a nested style with non-text content", el.name));
    }
    if el.kind == ElementKind::Title && !only(text_like) {
        return Err(unsupported(
            "a title containing elements or blocks",
            el.name,
        ));
    }
    if matches!(
        name,
        "svelte:window"
            | "svelte:document"
            | "svelte:body"
            | "svelte:head"
            | "svelte:element"
            | "svelte:boundary"
    ) || el.kind == ElementKind::Component
    {
        return Ok(());
    }
    let refused = !matches!(el.kind, ElementKind::Regular | ElementKind::Title)
        || REFUSED_ELEMENTS.contains(&name)
        || (!foreign && name.contains(':'));
    if refused {
        return Err(unsupported(format_args!("the element <{name}>"), el.name));
    }
    check_table_part(compiler_syntax_tree, source_text, identifier, name, el.name)?;
    if rsvelte_svelte_compile::lower::is_customizable_select(compiler_syntax_tree, source_text, el)
    {
        return Err(unsupported(
            format_args!("rich content in <{name}>"),
            el.name,
        ));
    }
    if name == "textarea" && !only(text_like) {
        return Err(unsupported("a block inside <textarea>", el.name));
    }
    Ok(())
}

/// `spread`: the element has a spread attribute, so all its attributes are one object that
/// Svelte's `set_attributes` (client) and `attributes` (server) apply, which [`helpers`] port.
///
/// [`helpers`]: crate::helpers
pub(super) fn check_attribute(
    source_text: &str,
    tag: &str,
    a: &Attribute,
    spread: bool,
    foreign: bool,
) -> R<()> {
    let name = a.name.text(source_text);
    if name.eq_ignore_ascii_case("defaultValue") || name.eq_ignore_ascii_case("defaultChecked") {
        return Ok(());
    }
    match a.value {
        AttributeValue::Bind(_)
            if tag.starts_with("svelte:")
                || super::property_bindings::media(name).is_some()
                || super::property_bindings::resize(name)
                || matches!(
                    name,
                    "videoWidth"
                        | "videoHeight"
                        | "indeterminate"
                        | "files"
                        | "open"
                        | "naturalWidth"
                        | "naturalHeight"
                        | "focused"
                        | "innerHTML"
                        | "innerText"
                        | "textContent"
                ) =>
        {
            return Ok(());
        }
        // Svelte runs an attachment as an effect that tracks what it reads and tears down on a
        // change; a Vue function ref is called on every patch and tracks nothing of its own.
        AttributeValue::Spread(_) if matches!(tag, "input" | "textarea" | "select" | "option") => {
            return Err(unsupported(
                format_args!("a spread attribute on <{tag}>"),
                a.span,
            ));
        }
        AttributeValue::Attach(_)
        | AttributeValue::Use { .. }
        | AttributeValue::Spread(_)
        | AttributeValue::Transition { .. }
        | AttributeValue::Animate { .. } => {
            return Ok(());
        }
        AttributeValue::Class(_) if !name.is_empty() => return Ok(()),
        AttributeValue::Bind(_) if spread && name != "this" => {
            return Err(unsupported("a binding beside a spread attribute", a.span));
        }
        _ => {}
    }
    match &a.value {
        AttributeValue::Bind(_) => {
            if !matches!(name, "value" | "checked" | "group" | "this")
                && !tag.starts_with("svelte:")
            {
                return Err(unsupported(format_args!("`bind:{name}`"), a.span));
            }
        }
        AttributeValue::Style { .. } => return Ok(()),
        AttributeValue::On { .. } | AttributeValue::Let(_) => {
            return Err(unsupported(format_args!("this directive"), a.span));
        }
        AttributeValue::Boolean
        | AttributeValue::Static(_)
        | AttributeValue::Attach(_)
        | AttributeValue::Use { .. }
        | AttributeValue::Transition { .. }
        | AttributeValue::Animate { .. }
        | AttributeValue::Class(_)
        | AttributeValue::Spread(_) => {}
        AttributeValue::Expression { .. } | AttributeValue::Shorthand(_) if spread => {}
        AttributeValue::Expression { .. }
        | AttributeValue::Shorthand(_)
        | AttributeValue::Interpolated(_) => {
            let interpolated = matches!(a.value, AttributeValue::Interpolated(_));
            let allowed = if foreign || matches!(name, "class" | "style") {
                true
            } else if name.starts_with("on") {
                !interpolated
            } else if name == "value" {
                !interpolated && matches!(tag, "input" | "textarea")
            } else {
                true
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
