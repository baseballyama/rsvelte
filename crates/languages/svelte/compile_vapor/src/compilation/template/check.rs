use super::{
    Attribute, AttributeValue, CompilerNodeIdentifier, CompilerSyntaxTree, Element, ElementKind,
    FxHashSet, Kind, NodeIdentifier, NodeKind, R, REFUSED_ELEMENTS, Resolution, SyntaxTree,
    check_table_part, span_of, unsupported, walk,
};

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
    namespaces: &rsvelte_svelte_compile::render_plan::NamespacePlan,
) -> R<super::Options> {
    let options = read_options(compiler_syntax_tree, javascript, source_text)?;
    let option_expressions = option_expressions(compiler_syntax_tree, source_text);
    let mut rune_roots = FxHashSet::default();
    for &expression in expressions {
        walk(javascript, expression, &mut |identifier| {
            if let Kind::Call { callee, .. } = javascript.kind(identifier)
                && rsvelte_svelte::semantic::resolve::rune_call(javascript, identifier).is_some_and(
                    |(name, _)| {
                        crate::script::runes::local(name).is_some()
                            || crate::script::runes::eager(name)
                            || crate::script::runes::value(name)
                    },
                )
            {
                let root = match javascript.kind(callee) {
                    Kind::Member { object, .. } => object,
                    _ => callee,
                };
                rune_roots.insert(root);
            }
            Ok(())
        })?;
    }
    for (identifier, n) in compiler_syntax_tree.nodes.iter_enumerated() {
        if let NodeKind::Element(el) = &n.kind {
            let name = el.name.text(source_text);
            if name == "svelte:options" {
                continue;
            }
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
            check_unique(source_text, attributes)?;
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
                    let valid = n.parent.is_some_and(|parent| matches!(&compiler_syntax_tree.node(parent).kind, NodeKind::Each(each) if each.key().is_some()));
                    if !valid {
                        return Err(unsupported(
                            "an animation outside an immediate child of a keyed each block",
                            a.span,
                        ));
                    }
                }
            }
        }
    }
    for &e in expressions {
        if option_expressions.contains(&e) {
            continue;
        }
        walk(javascript, e, &mut |n| match javascript.kind(n) {
            Kind::Identifier(_) if resolution.sem.binding_of(n).is_none() => {
                if rune_roots.contains(&n) {
                    return Ok(());
                }
                let name = javascript.name(n);
                if name.starts_with('$') {
                    return Err(unsupported(
                        format_args!("the rune or store subscription `{name}`"),
                        span_of(javascript, n),
                    ));
                }
                Ok(())
            }
            Kind::This => Err(unsupported(
                "`this` in the template",
                span_of(javascript, n),
            )),
            _ => Ok(()),
        })?;
    }
    Ok(options)
}

fn option_expressions(tree: &CompilerSyntaxTree, source_text: &str) -> FxHashSet<NodeIdentifier> {
    tree.nodes
        .iter()
        .filter_map(|node| {
            let NodeKind::Element(element) = &node.kind else {
                return None;
            };
            (element.name.text(source_text) == "svelte:options").then_some(element)
        })
        .flat_map(|element| tree.attributes(element.attributes))
        .filter_map(|attribute| match attribute.value {
            AttributeValue::Expression { expression, .. } => Some(expression),
            _ => None,
        })
        .collect()
}

fn read_options(
    compiler_syntax_tree: &CompilerSyntaxTree,
    javascript: &SyntaxTree,
    source_text: &str,
) -> R<super::Options> {
    let mut options = super::Options::default();
    for node in &compiler_syntax_tree.nodes {
        if let NodeKind::Element(element) = &node.kind
            && element.name.text(source_text) == "svelte:options"
        {
            options = super::options::read(
                javascript,
                compiler_syntax_tree.attributes(element.attributes),
                source_text,
            )?;
        }
    }
    Ok(options)
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
        match &a.value {
            AttributeValue::Static(value) if value.as_ref() == "default" => {
                return Err(unsupported("slot_element_invalid_name_default", a.span));
            }
            AttributeValue::Static(_) => {}
            _ => return Err(unsupported("slot_element_invalid_name", a.span)),
        }
    }
    Ok(())
}

fn check_await_directive(javascript: &SyntaxTree, attribute: &Attribute) -> R<()> {
    let (first, second) = match attribute.value {
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
    if first
        .into_iter()
        .chain(second)
        .any(|expression| crate::compilation::asynchronous::has_await(javascript, expression))
    {
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
    if name == "slot" && custom_element {
        return Ok(());
    }
    if name == "style"
        && compiler_syntax_tree
            .children(el.children)
            .iter()
            .any(|&child| !matches!(compiler_syntax_tree.node(child).kind, NodeKind::Text { .. }))
    {
        return Err(unsupported("a nested style with non-text content", el.name));
    }
    if el.kind == ElementKind::Title
        && compiler_syntax_tree
            .children(el.children)
            .iter()
            .any(|&child| {
                !matches!(
                    compiler_syntax_tree.node(child).kind,
                    NodeKind::Text { .. } | NodeKind::Expression { .. } | NodeKind::Comment { .. }
                )
            })
    {
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
    if rsvelte_svelte_compile::lower::is_customizable_select(
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
    if name == "textarea"
        && compiler_syntax_tree
            .children(el.children)
            .iter()
            .any(|&child| {
                !matches!(
                    compiler_syntax_tree.node(child).kind,
                    NodeKind::Text { .. } | NodeKind::Expression { .. } | NodeKind::Comment { .. }
                )
            })
    {
        return Err(unsupported("a block inside <textarea>", el.name));
    }
    Ok(())
}

/// The parser's `attribute_duplicate`, which the Svelte plugin's parser does not report: an
/// attribute or binding, or a `class:` directive, named twice (`bind:this` is not recorded).
pub(super) fn check_unique(source_text: &str, attributes: &[Attribute]) -> R<()> {
    let mut seen = FxHashSet::default();
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
            seen.insert(key);
        }
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
