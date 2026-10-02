use super::{
    Attribute, AttributeValue, BOOLEAN_ATTRIBUTES, BindingKind, CompilerNodeIdentifier,
    CompilerSyntaxTree, Element, ElementKind, FxHashSet, Kind, NodeIdentifier, NodeKind, Part, R,
    REFUSED_ELEMENTS, Resolution, Span, SyntaxTree, VUE_GLOBALS, check_table_part,
    is_text_attribute, span_of, unsupported, walk,
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

pub(super) fn check_attribute_references(source_text: &str, a: &Attribute) -> R<()> {
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
pub(super) fn check_character_references(raw: &str, attribute: bool, at: Span) -> R<()> {
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
pub(super) fn check_element(
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
    if let Err(d) = rsvelte_svelte_compile::lower::check_foreign_element(source_text, el.name) {
        return Err(unsupported(&d.message, d.span));
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
    if name == "textarea" && !compiler_syntax_tree.children(el.children).is_empty() {
        return Err(unsupported("a <textarea> with children", el.name));
    }
    Ok(())
}

/// The parser's `attribute_duplicate`, which the Svelte plugin's parser does not report: an
/// attribute or binding, or a `class:` directive, named twice (`bind:this` is not recorded).
pub(super) fn check_unique(source_text: &str, attributes: &[Attribute]) -> R<()> {
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
pub(super) fn check_attribute(source_text: &str, tag: &str, a: &Attribute, spread: bool) -> R<()> {
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
