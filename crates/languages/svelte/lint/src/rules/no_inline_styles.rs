use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte::syntax::syntax_tree::{AttributeKind, TemplateNode};
use serde::Deserialize;

use super::element_kind::{ElementKind, element_kind};
use super::style_attribute::is_style;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-inline-styles",
    files: Files::Components,
    configure,
};

#[derive(Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Options {
    allow_transitions: Option<bool>,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    Ok(Box::new(NoInlineStyles {
        allow_transitions: options.allow_transitions.unwrap_or(true),
    }))
}

#[derive(Debug)]
struct NoInlineStyles {
    allow_transitions: bool,
}

impl SvelteRule for NoInlineStyles {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        for node in &component.nodes {
            let TemplateNode::Element { attributes, .. } = node else {
                continue;
            };
            if element_kind(node, source) != Some(ElementKind::Html) {
                continue;
            }
            for attribute in component.attributes(*attributes) {
                let message = match attribute.kind {
                    AttributeKind::Style => "Found disallowed style directive.",
                    AttributeKind::Transition { .. } if !self.allow_transitions => {
                        "Found disallowed transition."
                    }
                    _ if is_style(attribute, source) => "Found disallowed style attribute.",
                    _ => continue,
                };
                reporter.range(message, attribute.span);
            }
        }
    }
}
