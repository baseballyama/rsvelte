//! What both targets read off an element and its attributes.

use std::borrow::Cow;

use oxc_ast::ast::{ArrowFunctionExpression, Expression, Function, IdentifierReference};
use oxc_ast_visit::{Visit, walk};
use oxc_syntax::scope::ScopeFlags;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    Attribute, AttributeValue, CompilerSyntaxTree, Element, Modifiers, NodeKind,
};
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::Builder;
use crate::input::Target;

#[cfg(test)]
mod tests;

/// `name` in lowercase, borrowed when it has nothing to lower.
pub(super) fn lowercase(name: &str) -> Cow<'_, str> {
    if name
        .bytes()
        .any(|byte| !byte.is_ascii() || byte.is_ascii_uppercase())
    {
        Cow::Owned(name.to_lowercase())
    } else {
        Cow::Borrowed(name)
    }
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

/// Upstream's `EACH_ITEM_REACTIVE` test: the collection reads a binding or a store subscription
/// (references inside a function of the expression are not its dependencies).
#[must_use]
pub(super) fn has_dependency(res: &Resolution, e: &Expression<'_>) -> bool {
    struct Dependency<'r> {
        res: &'r Resolution,
        found: bool,
    }
    impl<'a> Visit<'a> for Dependency<'_> {
        fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
            self.found |= self.res.symbol(it).is_some() || self.res.is_store_subscription(&it.name);
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

/// Upstream `needs_clsx`.
#[must_use]
pub(super) const fn needs_clsx(e: &Expression<'_>) -> bool {
    !matches!(
        e,
        Expression::StringLiteral(_)
            | Expression::NumericLiteral(_)
            | Expression::BooleanLiteral(_)
            | Expression::NullLiteral(_)
            | Expression::TemplateLiteral(_)
            | Expression::BinaryExpression(_)
    )
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

/// The empty attributes upstream's analysis gives an element, which both targets then render as
/// if written: `class` when it is scoped or has a `class:`, `style` when it has a `style:`, each
/// unless an attribute has that name, and neither beside a spread.
#[derive(Clone, Copy)]
pub(super) struct Implicit {
    pub class: bool,
    pub style: bool,
}

#[must_use]
pub(super) fn implicit_attributes(
    source_text: &str,
    attributes: &[Attribute],
    scoped: bool,
) -> Implicit {
    let (mut class, mut style) = (false, false);
    let (mut class_directive, mut style_directive) = (false, false);
    for a in attributes {
        match &a.value {
            AttributeValue::Spread(_) => {
                return Implicit {
                    class: false,
                    style: false,
                };
            }
            AttributeValue::Class(_) => class_directive = true,
            AttributeValue::Style { .. } => style_directive = true,
            value if !is_directive(value) => {
                let name = a.name.text(source_text);
                class |= name.eq_ignore_ascii_case("class");
                style |= name.eq_ignore_ascii_case("style");
            }
            _ => {}
        }
    }
    Implicit {
        class: !class && (scoped || class_directive),
        style: !style && style_directive,
    }
}

/// A literal class value with the stylesheet's hash after it, or the hash alone for an empty one.
/// The server trims the value's start as upstream's server does with `.trim()`; the client keeps
/// it. The hash has no whitespace to trim.
#[must_use]
pub(super) fn scoped_class(value: &str, hash: &str, target: Target) -> String {
    let value = match target {
        Target::Client => value,
        Target::Server => value.trim_start_matches(is_ecmascript_whitespace),
    };
    if value.is_empty() {
        hash.to_owned()
    } else {
        format!("{value} {hash}")
    }
}

/// Upstream's style directive object: `{ name: value }`, or `[normal, important]` when one is
/// `|important`. The server's `build_attr_style` lowercases a name that is not a custom property;
/// the client's `build_style_directives_object` keeps it as written.
pub(super) fn style_directives_object<'o>(
    b: &Builder<'o>,
    source_text: &str,
    directives: &[&Attribute],
    target: Target,
    mut value: impl FnMut(&Attribute) -> Expression<'o>,
) -> Expression<'o> {
    let mut normal = Vec::new();
    let mut important = Vec::new();
    for d in directives {
        let AttributeValue::Style { modifiers, .. } = &d.value else {
            unreachable!("style directives")
        };
        let name = d.name.text(source_text);
        let property = if target == Target::Server && !name.starts_with("--") {
            b.init(&name.to_lowercase(), value(d))
        } else {
            b.init(name, value(d))
        };
        if modifiers.contains(Modifiers::IMPORTANT) {
            important.push(property);
        } else {
            normal.push(property);
        }
    }
    if important.is_empty() {
        b.object(normal)
    } else {
        b.array([b.object(normal), b.object(important)])
    }
}

/// Upstream's `can_use_literal`: a `class` or `style` with directives needs the runtime.
#[must_use]
pub(super) fn can_use_literal(name: &str, classes: &[&Attribute], styles: &[&Attribute]) -> bool {
    (name != "class" || classes.is_empty()) && (name != "style" || styles.is_empty())
}

/// A directive that renders no attribute: one that adds behaviour to the element, or a `let:`,
/// on either target.
#[must_use]
pub(super) const fn is_behaviour(v: &AttributeValue) -> bool {
    matches!(
        v,
        AttributeValue::On { .. }
            | AttributeValue::Let(_)
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

/// What a `<svelte:element>` renders as its tag.
pub(super) enum DynamicTag<'a> {
    Text(Cow<'a, str>),
    Expression(ExpressionIdentifier),
}

/// The tag `this` names: its text, or its expression.
pub(super) fn dynamic_tag(value: &AttributeValue) -> DynamicTag<'_> {
    match value {
        AttributeValue::Static(text) => DynamicTag::Text(Cow::Borrowed(text)),
        value => DynamicTag::Expression(
            single_expression(value).expect("validation keeps an expression in `this`"),
        ),
    }
}
