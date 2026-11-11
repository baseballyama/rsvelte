use oxc_ast::ast::{ArrowFunctionExpression, Expression, Function, IdentifierReference};
use oxc_ast_visit::{Visit, walk};
use oxc_syntax::scope::ScopeFlags;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{
    Attribute, AttributeValue, Children, CompilerNodeIdentifier, CompilerSyntaxTree, Element,
    NodeKind, Resolution,
};

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
pub(super) fn has_dependency(res: &Resolution, e: &Expression<'_>) -> bool {
    struct Dependency<'r> {
        res: &'r Resolution,
        found: bool,
    }
    impl<'a> Visit<'a> for Dependency<'_> {
        fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
            self.found |= self.res.symbol(it).is_some();
        }
        fn visit_function(&mut self, _: &Function<'a>, _: ScopeFlags) {}
        fn visit_arrow_function_expression(&mut self, _: &ArrowFunctionExpression<'a>) {}
        fn visit_expression(&mut self, it: &Expression<'a>) {
            if !self.found {
                walk::walk_expression(self, it);
            }
        }
    }
    let mut dependency = Dependency { res, found: false };
    dependency.visit_expression(e);
    dependency.found
}

/// Upstream `is_event_attribute` for this port's attribute shapes.
#[must_use]
pub(super) fn event_attribute(source_text: &str, a: &Attribute) -> Option<ExpressionIdentifier> {
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

/// A directive that adds behaviour to the element and renders no attribute, on either target.
#[must_use]
pub(super) const fn is_behaviour(v: &AttributeValue) -> bool {
    matches!(
        v,
        AttributeValue::On { .. }
            | AttributeValue::Use { .. }
            | AttributeValue::Transition { .. }
            | AttributeValue::Animate { .. }
            | AttributeValue::Attach(_)
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
) -> Option<ExpressionIdentifier> {
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
pub(super) const fn single_expression(v: &AttributeValue) -> Option<ExpressionIdentifier> {
    match *v {
        AttributeValue::Expression { expression, .. } | AttributeValue::Shorthand(expression) => {
            Some(expression)
        }
        _ => None,
    }
}
