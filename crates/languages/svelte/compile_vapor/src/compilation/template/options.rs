use super::{Attribute, AttributeValue, Kind, R, SyntaxTree, unsupported};

mod custom_element;
pub(crate) use custom_element::copy_options;

#[derive(Clone, Debug)]
pub struct CustomElement {
    pub tag: Option<String>,
    pub shadow_root: bool,
    pub shadow: Option<super::NodeIdentifier>,
    pub props: Option<super::NodeIdentifier>,
    pub extend: Option<super::NodeIdentifier>,
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum CssMode {
    #[default]
    External,
    Injected,
}

#[derive(Debug, Default)]
pub struct Options {
    pub preserve_whitespace: bool,
    pub css_mode: CssMode,
    pub custom_element: Option<CustomElement>,
}

pub(super) fn read(tree: &SyntaxTree, attributes: &[Attribute], source_text: &str) -> R<Options> {
    let mut options = Options::default();
    for attribute in attributes {
        let name = attribute.name.text(source_text);
        let boolean = match attribute.value {
            AttributeValue::Boolean => Some(true),
            AttributeValue::Expression { expression, .. }
                if matches!(tree.kind(expression), Kind::Boolean(_)) =>
            {
                let Kind::Boolean(value) = tree.kind(expression) else {
                    unreachable!()
                };
                Some(value)
            }
            _ => None,
        };
        let namespace = match &attribute.value {
            AttributeValue::Static(value) => Some(value.as_ref()),
            AttributeValue::Expression { expression, .. }
                if matches!(tree.kind(*expression), Kind::String) =>
            {
                Some(tree.str_value(*expression, source_text))
            }
            _ => None,
        };
        if name == "customElement" {
            options.custom_element = Some(custom_element(tree, attribute, source_text)?);
            continue;
        }
        match (name, boolean) {
            ("preserveWhitespace", Some(value)) => options.preserve_whitespace = value,
            ("runes", Some(true)) | ("immutable" | "accessors", Some(_)) => {}
            ("css", _) if namespace == Some("injected") => options.css_mode = CssMode::Injected,
            ("namespace", _)
                if namespace.is_some_and(|value| {
                    matches!(
                        value,
                        "html"
                            | "svg"
                            | "mathml"
                            | "http://www.w3.org/2000/svg"
                            | "http://www.w3.org/1998/Math/MathML"
                    )
                }) => {}
            _ => {
                return Err(unsupported(
                    format_args!("this `{name}` component option"),
                    attribute.span,
                ));
            }
        }
    }
    Ok(options)
}

fn custom_element(tree: &SyntaxTree, attribute: &Attribute, source_text: &str) -> R<CustomElement> {
    let mut options = CustomElement {
        tag: None,
        shadow_root: true,
        shadow: None,
        props: None,
        extend: None,
    };
    match &attribute.value {
        AttributeValue::Static(tag) => options.tag = Some(tag.to_string()),
        AttributeValue::Expression { expression, .. } => {
            let Kind::Object(properties) = tree.kind(*expression) else {
                return Err(unsupported("these custom element options", attribute.span));
            };
            for &property in properties {
                let Kind::Property {
                    key,
                    value,
                    computed: false,
                    method: false,
                    ..
                } = tree.kind(property)
                else {
                    return Err(unsupported("this custom element option", attribute.span));
                };
                if !matches!(tree.kind(key), Kind::Identifier(_) | Kind::String) {
                    return Err(unsupported("this custom element option", attribute.span));
                }
                let name = if matches!(tree.kind(key), Kind::String) {
                    tree.str_value(key, source_text)
                } else {
                    tree.name(key)
                };
                match (name, tree.kind(value)) {
                    ("tag", Kind::String) => {
                        options.tag = Some(tree.str_value(value, source_text).to_owned());
                    }
                    ("shadow", Kind::String) if tree.str_value(value, source_text) == "none" => {
                        options.shadow_root = false;
                    }
                    ("shadow", Kind::String) if tree.str_value(value, source_text) == "open" => {}
                    ("shadow", Kind::Object(_)) => options.shadow = Some(value),
                    ("props", Kind::Object(_)) => {
                        check_properties(tree, value, source_text, attribute.span)?;
                        options.props = Some(value);
                    }
                    (
                        "extend",
                        Kind::Arrow { .. } | Kind::Function { .. } | Kind::Identifier(_),
                    ) => options.extend = Some(value),
                    _ => return Err(unsupported("this custom element option", attribute.span)),
                }
            }
        }
        _ => return Err(unsupported("these custom element options", attribute.span)),
    }
    Ok(options)
}

fn check_properties(
    tree: &SyntaxTree,
    value: super::NodeIdentifier,
    source_text: &str,
    span: rsvelte_kernel::source::positions::Span,
) -> R<()> {
    let Kind::Object(properties) = tree.kind(value) else {
        unreachable!("custom element props are an object");
    };
    for &property in properties {
        let Kind::Property {
            key,
            value,
            computed: false,
            method: false,
            ..
        } = tree.kind(property)
        else {
            return Err(unsupported("this custom element prop", span));
        };
        if !matches!(tree.kind(key), Kind::Identifier(_) | Kind::String) {
            return Err(unsupported("this custom element prop name", span));
        }
        let Kind::Object(fields) = tree.kind(value) else {
            return Err(unsupported("these custom element prop options", span));
        };
        for &field in fields {
            let Kind::Property {
                key,
                value,
                computed: false,
                method: false,
                ..
            } = tree.kind(field)
            else {
                return Err(unsupported("this custom element prop option", span));
            };
            let name = match tree.kind(key) {
                Kind::Identifier(_) => tree.name(key),
                Kind::String => tree.str_value(key, source_text),
                _ => return Err(unsupported("this custom element prop option", span)),
            };
            let valid = match (name, tree.kind(value)) {
                ("attribute", Kind::String) | ("reflect", Kind::Boolean(_)) => true,
                ("type", Kind::String) => matches!(
                    tree.str_value(value, source_text),
                    "String" | "Boolean" | "Number" | "Array" | "Object"
                ),
                _ => false,
            };
            if !valid {
                return Err(unsupported("this custom element prop option", span));
            }
        }
    }
    Ok(())
}
