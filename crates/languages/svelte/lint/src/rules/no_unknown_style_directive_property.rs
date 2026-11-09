use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_stylesheet::properties::{is_known, vendor_prefix};
use rsvelte_svelte::syntax::syntax_tree::AttributeKind;
use serde::Deserialize;

use crate::Pattern;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-unknown-style-directive-property",
    files: Files::Components,
    configure,
};

#[derive(Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Options {
    #[serde(default)]
    ignore_properties: Vec<String>,
    ignore_prefixed: Option<bool>,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    Ok(Box::new(NoUnknownStyleDirectiveProperty {
        ignore_properties: options
            .ignore_properties
            .iter()
            .map(|p| Pattern::new(p))
            .collect::<Result<_, _>>()?,
        ignore_prefixed: options.ignore_prefixed.unwrap_or(true),
    }))
}

#[derive(Debug)]
struct NoUnknownStyleDirectiveProperty {
    ignore_properties: Vec<Pattern>,
    ignore_prefixed: bool,
}

impl SvelteRule for NoUnknownStyleDirectiveProperty {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        for attribute in &component.attributes {
            if attribute.kind != AttributeKind::Style {
                continue;
            }
            let name = attribute
                .directive_name(&component.modifiers)
                .expect("a directive has a name");
            let property = name.text(source);
            if property.starts_with("--")
                || is_known(property)
                || self.ignore_properties.iter().any(|p| p.matches(property))
                || (self.ignore_prefixed && !vendor_prefix(property).is_empty())
            {
                continue;
            }
            reporter.report(
                Report::range(
                    format!("Unexpected unknown style directive property '{property}'."),
                    name,
                )
                .message_id("unknown"),
            );
        }
    }
}
