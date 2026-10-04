use super::{
    Attribute, AttributeValue, BinaryOperator, DirectiveExpression, DirectiveName, Kind,
    LogicalOperator, Name, NodeIdentifier, PropertyKind, Span, SyntaxTree, Text, UnaryOperator,
    vue,
};

/// The event a binding's listener waits for.
pub(super) fn binding_event(property: &str) -> &'static str {
    match property {
        "value" => "input",
        "checked" | "group" => "change",
        _ => "",
    }
}

/// The `type` written as static text; `Some("text")` without one, `None` for a dynamic one.
pub(super) fn static_type<'a>(source_text: &str, attributes: &'a [Attribute]) -> Option<&'a str> {
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
pub(super) fn reads_this(javascript: &SyntaxTree, body: NodeIdentifier) -> bool {
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

/// An expression whose value is a boolean by construction.
pub(super) fn is_boolean(javascript: &SyntaxTree, e: NodeIdentifier) -> bool {
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
pub(super) fn is_primitive(javascript: &SyntaxTree, e: NodeIdentifier) -> bool {
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
pub(super) fn captured_event(event: &str, span: Span) -> vue::Property {
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

pub(super) fn spelled(text: &str, span: Span) -> Name {
    Name::Spelled {
        text: text.into(),
        span,
    }
}

pub(super) fn directive(
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

pub(super) fn bound(name: &str, at: Span, value: NodeIdentifier, span: Span) -> vue::Property {
    directive(
        DirectiveName::Bind,
        Some(spelled(name, at)),
        DirectiveExpression::Expression(value),
        span,
    )
}

pub(super) fn attribute(a: &Attribute, value: Option<&str>) -> vue::Property {
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
