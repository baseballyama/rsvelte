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
#[derive(Deserialize, PartialEq, Eq)]
#[serde(untagged)]
enum Restriction {
    Name(String),
    Group(Group),
}

#[derive(Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
struct Group {
    elements: Vec<String>,
    message: Option<String>,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    if options.options.is_empty() {
        return Err("takes at least one element".to_owned());
    }
    let mut seen: Vec<Restriction> = Vec::new();
    for index in 0..options.options.len() {
        let restriction = options
            .get::<Restriction>(index)?
            .expect("an option at each index");
        if let Restriction::Group(group) = &restriction {
            if group.elements.is_empty() {
                return Err("`elements` names at least one element".to_owned());
            }
            if group.message.as_deref() == Some("") {
                return Err("`message` is not empty".to_owned());
            }
            if let Some(name) = repeated(&group.elements) {
                return Err(format!("`elements` names `{name}` twice"));
            }
        }
        // Configuration is checked once, and option lists are short.
        if seen.contains(&restriction) {
            return Err(format!("option {index} repeats an earlier option"));
        }
        seen.push(restriction);
    }
    let restrictions = seen
        .into_iter()
        .map(|restriction| match restriction {
            Restriction::Name(name) => (vec![name], None),
            Restriction::Group(group) => (group.elements, group.message),
        })
        .collect();
    Ok(Box::new(NoRestrictedHtmlElements(restrictions)))
}

/// A name that `names` holds twice (the schema's `uniqueItems`).
fn repeated(names: &[String]) -> Option<&str> {
    names
        .iter()
        .enumerate()
        .find(|&(index, name)| names[..index].contains(name))
        .map(|(_, name)| name.as_str())
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

#[cfg(test)]
mod tests;
