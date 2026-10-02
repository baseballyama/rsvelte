use super::{
    Attribute, AttributeValue, BindingKind, Children, CompilerNodeIdentifier, CompilerSyntaxTree,
    Cow, Diagnostic, Element, Kind, NodeIdentifier, NodeKind, Resolution, SyntaxTree, unsupported,
};

/// Upstream `sanitize_template_string`: cooked text → raw template literal text.
#[must_use]
pub fn sanitize_template_string(s: &str) -> Cow<'_, str> {
    if !s.contains(['`', '\\']) && !s.contains("${") {
        return Cow::Borrowed(s);
    }
    let mut out = String::with_capacity(s.len() + 4);
    let b = s.as_bytes();
    for (i, ch) in s.char_indices() {
        if ch == '`' || ch == '\\' || (ch == '$' && b.get(i + 1) == Some(&b'{')) {
            out.push('\\');
        }
        out.push(ch);
    }
    Cow::Owned(out)
}

const DOM_BOOLEAN_ATTRIBUTES: &[&str] = &[
    "allowfullscreen",
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "controls",
    "default",
    "disabled",
    "formnovalidate",
    "indeterminate",
    "inert",
    "ismap",
    "loop",
    "multiple",
    "muted",
    "nomodule",
    "novalidate",
    "open",
    "playsinline",
    "readonly",
    "required",
    "reversed",
    "seamless",
    "selected",
    "webkitdirectory",
    "defer",
    "disablepictureinpicture",
    "disableremoteplayback",
];

#[must_use]
pub(super) fn is_boolean_attribute(name: &str) -> bool {
    DOM_BOOLEAN_ATTRIBUTES.contains(&name)
}

/// Upstream `is_dom_property`: the boolean attributes plus the aliased property names.
#[must_use]
pub(super) fn is_dom_property(name: &str) -> bool {
    is_boolean_attribute(name)
        || matches!(
            name,
            "formNoValidate"
                | "isMap"
                | "noModule"
                | "playsInline"
                | "readOnly"
                | "value"
                | "volume"
                | "defaultValue"
                | "defaultChecked"
                | "srcObject"
                | "noValidate"
                | "allowFullscreen"
                | "disablePictureInPicture"
                | "disableRemotePlayback"
        )
}

/// Upstream's `EACH_ITEM_REACTIVE` test: the collection reads a binding (references inside a
/// function of the expression are not its dependencies).
#[must_use]
pub(super) fn has_dependency(javascript: &SyntaxTree, res: &Resolution, e: NodeIdentifier) -> bool {
    match javascript.kind(e) {
        Kind::Identifier(_) => res
            .binding(e)
            .is_some_and(|(b, _)| res.sem.bindings[b].node != e),
        Kind::Function { .. } | Kind::Arrow { .. } => false,
        _ => {
            let mut any = false;
            javascript.for_each_child(e, |c| any = any || has_dependency(javascript, res, c));
            any
        }
    }
}

/// The checks this port makes before lowering a `bind:` directive.
///
/// A supported property on a supported element, and a target that is `$state` or a member of
/// `$state` or of an `{#each}` item. Upstream validates more and accepts more.
///
/// # Errors
///
/// An `unsupported` [`Diagnostic`] for anything else.
pub(super) fn check_binding(
    javascript: &SyntaxTree,
    res: &Resolution,
    source_text: &str,
    tag: &str,
    attributes: &[Attribute],
    a: &Attribute,
) -> Result<NodeIdentifier, Diagnostic> {
    let AttributeValue::Bind(e) = a.value else {
        unreachable!("called on bindings")
    };
    let property = a.name.text(source_text);
    if !supported_binding(source_text, tag, attributes, property) {
        return unsupported(&format!("`bind:{property}` on this `<{tag}>`"), a.span);
    }
    let beside = attributes.iter().any(|o| {
        !std::ptr::eq(o, a) && matches!(o.name.text(source_text), "value" | "checked" | "group")
    });
    if beside {
        return unsupported(
            "a binding beside a `value`, `checked` or `group` attribute",
            a.span,
        );
    }
    let mut root = e;
    while let Kind::Member { object, .. } = javascript.kind(root) {
        root = object;
    }
    let kind = matches!(javascript.kind(root), Kind::Identifier(_))
        .then(|| res.binding(root).map(|(_, info)| info.kind))
        .flatten();
    let member = root != e;
    let ok = match kind {
        Some(BindingKind::State | BindingKind::RawState) => true,
        Some(BindingKind::Each) => member,
        _ => false,
    };
    if !ok {
        return unsupported(
            "a binding to anything but `$state` or a member of `$state` or of an `{#each}` item",
            a.span,
        );
    }
    Ok(e)
}

/// Upstream `binding_properties` that this port lowers, by element.
///
/// `bind:value` on `<input>` (not a checkbox, radio or file input) and `bind:checked` on a
/// checkbox, with the `type` written as static text; `bind:value` on a `<select>` whose
/// `multiple` is static.
#[must_use]
pub(super) fn supported_binding(
    source_text: &str,
    tag: &str,
    attributes: &[Attribute],
    property: &str,
) -> bool {
    if tag != "input" && tag != "select" {
        return false;
    }
    // Upstream rejects a `multiple` that is not static on a bound `<select>`.
    let static_multiple = attributes.iter().all(|a| {
        a.name.text(source_text) != "multiple"
            || matches!(a.value, AttributeValue::Boolean | AttributeValue::Static(_))
    });
    let mut ty = Some("text");
    for a in attributes {
        if a.name.text(source_text) == "type" && !matches!(a.value, AttributeValue::Bind(_)) {
            ty = match &a.value {
                AttributeValue::Static(v) => Some(&**v),
                _ => None,
            };
        }
    }
    match (property, ty) {
        ("value", Some(t)) if tag == "input" => !matches!(t, "checkbox" | "radio" | "file"),
        ("value", _) => tag == "select" && static_multiple,
        ("checked", Some(t)) => tag == "input" && t == "checkbox",
        _ => false,
    }
}

/// Upstream `is_event_attribute` for this port's attribute shapes.
#[must_use]
pub(super) fn event_attribute(source_text: &str, a: &Attribute) -> Option<NodeIdentifier> {
    let expression = single_expression(&a.value)?;
    a.name
        .text(source_text)
        .starts_with("on")
        .then_some(expression)
}

/// A directive, a spread or an `{@attach}`: not an attribute with a name of its own.
#[must_use]
pub(super) const fn is_directive(v: &AttributeValue) -> bool {
    matches!(
        v,
        AttributeValue::Bind(_)
            | AttributeValue::Attach(_)
            | AttributeValue::Class(_)
            | AttributeValue::Spread(_)
    )
}

/// Upstream analysis' `synthetic_value_node`: an `<option>` without a `value` attribute whose
/// only child is an expression tag takes that expression as its value.
#[must_use]
pub(super) fn synthetic_value(
    compiler_syntax_tree: &CompilerSyntaxTree,
    source_text: &str,
    tag: &str,
    el: &Element,
) -> Option<NodeIdentifier> {
    if tag != "option"
        || compiler_syntax_tree
            .attributes(el.attributes)
            .iter()
            .any(|a| !is_directive(&a.value) && a.name.text(source_text) == "value")
    {
        return None;
    }
    match compiler_syntax_tree.children(el.children) {
        &[only] => match compiler_syntax_tree.node(only).kind {
            NodeKind::Expression { expression } => Some(expression),
            _ => None,
        },
        _ => None,
    }
}

/// Upstream `is_customizable_select_element`: a `<select>`, `<optgroup>` or `<option>` holding
/// more than plain options and text.
#[must_use]
pub fn is_customizable_select(
    compiler_syntax_tree: &CompilerSyntaxTree,
    source_text: &str,
    tag: &str,
    el: &Element,
) -> bool {
    fn descendants(
        compiler_syntax_tree: &CompilerSyntaxTree,
        source_text: &str,
        list: Children,
        out: &mut Vec<CompilerNodeIdentifier>,
    ) {
        for &identifier in compiler_syntax_tree.children(list) {
            match &compiler_syntax_tree.node(identifier).kind {
                NodeKind::Comment { .. } | NodeKind::Expression { .. } => {}
                NodeKind::Text { raw, decoded, .. } => {
                    let data = decoded.as_deref().unwrap_or_else(|| raw.text(source_text));
                    if !data.trim().is_empty() {
                        out.push(identifier);
                    }
                }
                NodeKind::If {
                    branches,
                    otherwise,
                } => {
                    for b in compiler_syntax_tree.branches(*branches) {
                        descendants(compiler_syntax_tree, source_text, b.body, out);
                    }
                    if let Some(o) = otherwise {
                        descendants(compiler_syntax_tree, source_text, *o, out);
                    }
                }
                NodeKind::Each(each) => {
                    descendants(compiler_syntax_tree, source_text, each.body, out);
                    if let Some(f) = each.fallback {
                        descendants(compiler_syntax_tree, source_text, f, out);
                    }
                }
                NodeKind::Element(_) => out.push(identifier),
            }
        }
    }
    if !matches!(tag, "select" | "optgroup" | "option") {
        return false;
    }
    let mut found = Vec::new();
    descendants(compiler_syntax_tree, source_text, el.children, &mut found);
    found.iter().any(
        |&identifier| match &compiler_syntax_tree.node(identifier).kind {
            NodeKind::Element(child) => {
                let name = child.name.text(source_text);
                match tag {
                    "select" => name != "option" && name != "optgroup",
                    "optgroup" => name != "option",
                    _ => true,
                }
            }
            _ => tag != "option",
        },
    )
}

/// Upstream `is_load_error_element`.
#[must_use]
pub(super) fn is_load_error_element(name: &str) -> bool {
    matches!(
        name,
        "body" | "embed" | "iframe" | "img" | "link" | "object" | "script" | "style" | "track"
    )
}

/// The expression of a value written as exactly one `{expression}`.
#[must_use]
pub(super) const fn single_expression(v: &AttributeValue) -> Option<NodeIdentifier> {
    match *v {
        AttributeValue::Expression { expression, .. } | AttributeValue::Shorthand(expression) => {
            Some(expression)
        }
        _ => None,
    }
}
