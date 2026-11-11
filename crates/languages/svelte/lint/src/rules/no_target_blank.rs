use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, Component, Part, TemplateNode, decode_attribute,
};
use serde::Deserialize;

use super::markup::{is_attribute, parts};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-target-blank",
    files: Files::Components,
    configure,
};

#[derive(Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Options {
    #[serde(default)]
    allow_referrer: bool,
    enforce_dynamic_links: Option<EnforceDynamicLinks>,
}

#[derive(Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
enum EnforceDynamicLinks {
    Always,
    Never,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    Ok(Box::new(NoTargetBlank {
        allow_referrer: options.allow_referrer,
        dynamic_links: options.enforce_dynamic_links != Some(EnforceDynamicLinks::Never),
    }))
}

#[derive(Debug)]
struct NoTargetBlank {
    allow_referrer: bool,
    /// A link written as an expression counts as external.
    dynamic_links: bool,
}

impl SvelteRule for NoTargetBlank {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        for node in &component.nodes {
            let TemplateNode::Element {
                name, attributes, ..
            } = *node
            else {
                continue;
            };
            let element = name.text(source);
            let attributes = component.attributes(attributes);
            let plain =
                |attribute: &&Attribute| is_attribute(component, source, element, attribute);
            let named = |name: &str| {
                attributes
                    .iter()
                    .filter(plain)
                    .find(|attribute| attribute.name.text(source) == name)
            };
            for target in attributes.iter().filter(plain) {
                if target.name.text(source) != "target"
                    || static_value(component, source, target).as_deref() != Some("_blank")
                    || named("rel").is_some_and(|rel| self.secure(component, source, rel))
                {
                    continue;
                }
                let external = attributes.iter().filter(plain).any(|attribute| {
                    attribute.name.text(source) == "href"
                        && match parts(component, attribute).first() {
                            Some(Part::Text(text)) => {
                                is_external(&decode_attribute(text.text(source)))
                            }
                            _ => false,
                        }
                });
                let dynamic = named("href").map_or_else(
                    || {
                        attributes.iter().any(|attribute| {
                            let kind = attribute.kind;
                            (kind == AttributeKind::Attribute && attribute.shorthand
                                || kind == AttributeKind::Bind)
                                && attribute
                                    .directive_name(&component.modifiers)
                                    .unwrap_or(attribute.name)
                                    .text(source)
                                    == "href"
                        })
                    },
                    |href| {
                        parts(component, href)
                            .iter()
                            .any(|part| matches!(part, Part::Expression { .. }))
                    },
                );
                if external || (self.dynamic_links && dynamic) {
                    reporter.report(Report::range(
                        "Using target=\"_blank\" without rel=\"noopener noreferrer\" is a security \
                         risk.",
                        target.span,
                    ));
                }
            }
        }
    }
}

impl NoTargetBlank {
    /// `rel` lists `noopener`, and `noreferrer` unless the referrer is allowed; only its text
    /// counts.
    fn secure(&self, component: &Component, source: &str, rel: &Attribute) -> bool {
        let mut opener = false;
        let mut referrer = false;
        for part in parts(component, rel) {
            if let Part::Text(text) = part {
                for word in decode_attribute(text.text(source))
                    .to_lowercase()
                    .split(' ')
                {
                    opener |= word == "noopener";
                    referrer |= word == "noreferrer";
                }
            }
        }
        opener && (self.allow_referrer || referrer)
    }
}

/// The value when it is all text; `""` for `<a target>`.
fn static_value(component: &Component, source: &str, attribute: &Attribute) -> Option<String> {
    let mut value = String::new();
    for part in parts(component, attribute) {
        let Part::Text(text) = part else {
            return None;
        };
        value.push_str(&decode_attribute(text.text(source)));
    }
    Some(value)
}

/// `/^(?:\w+:|\/\/)/`: a scheme or a protocol-relative link.
fn is_external(href: &str) -> bool {
    if href.starts_with("//") {
        return true;
    }
    let word = href
        .bytes()
        .take_while(|b| b.is_ascii_alphanumeric() || *b == b'_')
        .count();
    word > 0 && href.as_bytes().get(word) == Some(&b':')
}
