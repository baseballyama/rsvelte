use super::{
    Attribute, AttributeValue, Children, CompilerNodeIdentifier, CompilerSyntaxTree, Cow, Element,
    Kind, NodeIdentifier, NodeKind, Resolution, SyntaxTree,
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

pub const DOM_BOOLEAN_ATTRIBUTES: &[&str] = &[
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
pub fn is_boolean_attribute(name: &str) -> bool {
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
    !matches!(
        v,
        AttributeValue::Boolean
            | AttributeValue::Static(_)
            | AttributeValue::Expression { .. }
            | AttributeValue::Shorthand(_)
            | AttributeValue::Interpolated(_)
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
                NodeKind::Comment { .. }
                | NodeKind::Expression { .. }
                | NodeKind::Snippet(_)
                | NodeKind::Debug { .. }
                | NodeKind::Const { .. }
                | NodeKind::Declaration { .. } => {}
                kind @ NodeKind::Text { .. } => {
                    if !kind.is_blank_text(source_text) {
                        out.push(identifier);
                    }
                }
                NodeKind::If { .. }
                | NodeKind::Each(_)
                | NodeKind::Key { .. }
                | NodeKind::Await(_) => {
                    for c in compiler_syntax_tree.child_lists(identifier) {
                        descendants(compiler_syntax_tree, source_text, c, out);
                    }
                }
                NodeKind::Element(_) | NodeKind::Render { .. } | NodeKind::Html { .. } => {
                    out.push(identifier);
                }
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
            NodeKind::Text { .. } => tag != "option",
            _ => true,
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
