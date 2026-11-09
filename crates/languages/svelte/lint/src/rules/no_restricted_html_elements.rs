use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte::syntax::syntax_tree::TemplateNode;
use serde::Deserialize;

use super::markup::is_html;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-restricted-html-elements",
    files: Files::Components,
    configure,
};

/// One option: an element name, or names that share a message.
#[derive(Deserialize)]
#[serde(untagged)]
enum Restriction {
    Name(String),
    Group(Group),
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Group {
    elements: Vec<String>,
    message: Option<String>,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    if options.options.is_empty() {
        return Err("takes at least one element".to_owned());
    }
    let mut restrictions = Vec::new();
    for index in 0..options.options.len() {
        let restriction = options
            .get::<Restriction>(index)?
            .expect("an option at each index");
        restrictions.push(match restriction {
            Restriction::Name(name) => (vec![name], None),
            Restriction::Group(group) => {
                if group.elements.is_empty() {
                    return Err("`elements` names at least one element".to_owned());
                }
                (group.elements, group.message.filter(|m| !m.is_empty()))
            }
        });
    }
    Ok(Box::new(NoRestrictedHtmlElements(restrictions)))
}

/// Each option's names and its message.
#[derive(Debug)]
struct NoRestrictedHtmlElements(Vec<(Vec<String>, Option<String>)>);

impl SvelteRule for NoRestrictedHtmlElements {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        for node in &component.nodes {
            let TemplateNode::Element {
                name, start_tag, ..
            } = *node
            else {
                continue;
            };
            let name = name.text(source);
            if !is_html(name) {
                continue;
            }
            for (elements, message) in &self.0 {
                for element in elements {
                    if element == name {
                        let message = message.clone().unwrap_or_else(|| {
                            format!("Unexpected use of forbidden HTML element {name}.")
                        });
                        reporter.report(Report::range(message, start_tag));
                    }
                }
            }
        }
    }
}
