use super::{
    Attribute, AttributeValue, CompilerNodeIdentifier, Directive, DirectiveName, Expression,
    NodeKind, Property, PropertyKind, R, Span, SvelteElement, SvelteNodeIdentifier, SvelteNodeKind,
    T, TagType, Target, directive, expression_of, is_boolean_attribute, svelte, unsupported,
};

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

impl T<'_, '_, '_, '_> {
    #[expect(
        clippy::too_many_lines,
        reason = "one arm per attribute shape Vue reads"
    )]
    pub(super) fn element(
        &mut self,
        k: CompilerNodeIdentifier,
        parent: Option<SvelteNodeIdentifier>,
    ) -> R<SvelteNodeIdentifier> {
        let (vue_tree, source_text) = (self.vue_tree, self.source_text);
        let node = vue_tree.node(k);
        let NodeKind::Element(el) = &node.kind else {
            unreachable!("called on elements")
        };
        if el.tag_type != TagType::Element {
            return Err(unsupported(
                "a component, `<slot>` or `<template>`",
                el.tag.span(),
            ));
        }
        let rsvelte_vue_semantic::compiler_syntax_tree::Name::Source(name) = el.tag else {
            return Err(unsupported("a spelled tag name", el.tag.span()));
        };
        let tag = name.text(source_text);
        if tag.bytes().any(|c| c.is_ascii_uppercase()) {
            return Err(unsupported("an element name with uppercase letters", name));
        }
        let child_nodes = vue_tree.children(el.children);
        if tag == "pre"
            && let Some(NodeKind::Text(t)) = child_nodes.first().map(|&c| &vue_tree.node(c).kind)
            && t.text(source_text).starts_with(['\n', '\r'])
        {
            return Err(unsupported(
                "a `<pre>` whose text starts with a line break (the HTML parser drops it)",
                node.span,
            ));
        }
        let fallthrough = self.roots.contains(&k).then_some(self.attributes).flatten();
        let start_tag = node.span;
        let kind = self.builder.element_kind(tag, parent);
        let identifier = self.builder.node(
            SvelteNodeKind::Comment {
                data: Span::default(),
            },
            node.span,
            parent,
            vue_tree.origin[k],
        );
        let props = vue_tree.props(el.props);
        let mut attributes: Vec<Attribute> = Vec::new();
        let mut class: Vec<Expression<'_>> = Vec::new();
        let mut class_at: Option<(usize, Span, u32)> = None;
        let mut model: Option<(&Property, &Directive)> = None;
        let mut events: Vec<String> = Vec::new();
        let static_attribute = |name: &str| {
            props.iter().find_map(|p| match &p.kind {
                PropertyKind::Attribute { name: n, value } if n.text(source_text) == name => {
                    Some(value.as_ref().map_or("", |v| v.text(source_text)))
                }
                _ => None,
            })
        };
        let bound = |name: &str| {
            props.iter().any(|p| match &p.kind {
                PropertyKind::Directive(d) => {
                    d.name == DirectiveName::Bind
                        && d.arg.as_ref().is_some_and(|a| a.text(source_text) == name)
                }
                PropertyKind::Attribute { .. } => false,
            })
        };
        let attribute = |name: svelte::Name, value: AttributeValue, p: &Property| Attribute {
            name,
            value,
            span: p.span,
            owner: identifier,
            origin: p.origin,
        };
        for p in props {
            match &p.kind {
                PropertyKind::Attribute { name: n, value } => {
                    let n_text = n.text(source_text);
                    let value_text = value.as_ref().map(|v| v.text(source_text));
                    check_name(n_text, p.span)?;
                    if attributes
                        .iter()
                        .any(|a| a.name.text(source_text) == n_text)
                    {
                        return Err(unsupported("an attribute written twice", p.span));
                    }
                    match n_text {
                        "class" => {
                            class.push(self.b.string(value_text.unwrap_or_default()));
                            class_at = Some((attributes.len(), p.span, p.origin));
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
                            let v = self.keep(self.b.string(value_text.unwrap_or_default()));
                            attributes.push(attribute(
                                svelte::Name::Source(n.span()),
                                AttributeValue::Expression {
                                    expression: v,
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
                    if is_boolean_attribute(n_text) && value_text.is_some_and(|v| !v.is_empty()) {
                        return Err(unsupported(
                            format_args!("a value on the boolean attribute `{n_text}`"),
                            p.span,
                        ));
                    }
                    let value = value.as_ref().map_or(AttributeValue::Boolean, |v| {
                        AttributeValue::Static(v.text(source_text).into())
                    });
                    attributes.push(attribute(svelte::Name::Source(n.span()), value, p));
                }
                PropertyKind::Directive(d) => match d.name {
                    DirectiveName::If
                    | DirectiveName::ElseIf
                    | DirectiveName::Else
                    | DirectiveName::For => {}
                    DirectiveName::Model => {
                        if model.is_some() {
                            return Err(unsupported("two `v-model`s on one element", p.span));
                        }
                        model = Some((p, d));
                    }
                    DirectiveName::Bind => {
                        let arg = d
                            .arg
                            .as_ref()
                            .expect("the parser requires an argument")
                            .text(source_text);
                        if !d.modifiers.is_empty() {
                            return Err(unsupported("a `v-bind` modifier", p.span));
                        }
                        check_name(arg, p.span)?;
                        if attributes.iter().any(|a| a.name.text(source_text) == arg) {
                            return Err(unsupported("an attribute written twice", p.span));
                        }
                        let e = expression_of(d, p.span)?;
                        match arg {
                            "key" if directive(vue_tree, el, DirectiveName::For).is_some() => {
                                continue;
                            }
                            "class" => {
                                class.push(self.expression(e)?);
                                if class_at.is_none() {
                                    class_at = Some((attributes.len(), p.span, p.origin));
                                }
                                continue;
                            }
                            "key" | "ref" | "is" | "style" | "hidden" | "autofocus" => {
                                return Err(unsupported(format_args!("`:{arg}`"), p.span));
                            }
                            "value"
                                if tag == "input"
                                    && model.is_none()
                                    && directive(vue_tree, el, DirectiveName::Model).is_none() => {}
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
                        let v = self.expression(e)?;
                        let v = if is_boolean_attribute(arg) {
                            self.boolean_value(v)
                        } else if self.info.target == Target::Server {
                            self.renderable_value(v)
                        } else {
                            v
                        };
                        let v = self.keep(v);
                        attributes.push(attribute(
                            svelte::Name::Spelled {
                                text: arg.into(),
                                span: p.span,
                            },
                            AttributeValue::Expression {
                                expression: v,
                                quoted: false,
                            },
                            p,
                        ));
                    }
                    DirectiveName::On => {
                        let (event, handler) = self.handler(p, d)?;
                        if events.contains(&event) {
                            return Err(unsupported("two listeners for one event", p.span));
                        }
                        let handler = self.keep(handler);
                        attributes.push(attribute(
                            svelte::Name::Spelled {
                                text: format!("on{event}").into(),
                                span: p.span,
                            },
                            AttributeValue::Expression {
                                expression: handler,
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
                && static_attribute("type").is_none_or(|t| !matches!(t, "checkbox" | "radio"))
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
                || static_attribute("true-value").is_some()
                || static_attribute("false-value").is_some()
            {
                return Err(unsupported(
                    "`v-model` with a bound `type`, `true-value` or `false-value`",
                    p.span,
                ));
            }
            let value = static_attribute("value");
            let ty = static_attribute("type");
            let attribute_value = self.model(tag, ty, value, p, d)?;
            if let Some(v) = attribute_value {
                attributes.push(v(identifier, p));
            }
        }
        if tag == "option"
            && let Some(m) = self.select_model
            && static_attribute("selected").is_none()
            && !bound("selected")
        {
            attributes.push(self.ssr_option_selected(
                m,
                static_attribute("value"),
                identifier,
                node.span,
            )?);
        }
        // One string literal, and nothing to merge it with, is a static class.
        let static_class: Option<Box<str>> = match class.as_slice() {
            [Expression::StringLiteral(s)] if fallthrough.is_none() => {
                s.value.as_str().map(Into::into)
            }
            _ => None,
        };
        if let Some(v) = static_class {
            let Some((at, span, origin)) = class_at else {
                unreachable!("a class records where it was written")
            };
            attributes.insert(
                at,
                Attribute {
                    name: svelte::Name::Spelled {
                        text: "class".into(),
                        span,
                    },
                    value: AttributeValue::Static(v),
                    span,
                    owner: identifier,
                    origin,
                },
            );
        } else if fallthrough.is_some() || !class.is_empty() {
            self.dynamic_class(&mut attributes, class, class_at, fallthrough, identifier);
        }
        let attributes = self.builder.attributes(attributes);
        self.builder.set_kind(
            identifier,
            SvelteNodeKind::Element(SvelteElement {
                name,
                kind,
                attributes,
                children: svelte::Children::default(),
                start_tag,
                this: None,
            }),
        );
        let outer = self.select_model;
        self.select_model = match (tag, model) {
            ("optgroup", _) => outer,
            ("select", Some((p, d))) if self.info.target == Target::Server => {
                Some(expression_of(d, p.span)?)
            }
            _ => None,
        };
        let children = self.list(child_nodes, Some(identifier));
        self.select_model = outer;
        let children = self.builder.children(&children?);
        self.builder.set_element_children(identifier, children);
        Ok(identifier)
    }
}
