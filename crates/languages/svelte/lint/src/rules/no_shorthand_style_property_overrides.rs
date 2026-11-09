use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_stylesheet_syntax::properties::{longhands, vendor_prefix};
use rsvelte_svelte_syntax::syntax_tree::TemplateNode;
use rustc_hash::FxHashSet;

use super::style_attribute::property_sets;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-shorthand-style-property-overrides",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoShorthandStylePropertyOverrides))
}

#[derive(Debug)]
struct NoShorthandStylePropertyOverrides;

impl SvelteRule for NoShorthandStylePropertyOverrides {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let mut before: FxHashSet<&str> = FxHashSet::default();
        let mut prefixed = String::new();
        for node in &component.nodes {
            let TemplateNode::Element { attributes, .. } = node else {
                continue;
            };
            before.clear();
            property_sets(file, *attributes, |set| {
                for &(name, span) in set {
                    let prefix = vendor_prefix(name);
                    for longhand in longhands(&name[prefix.len()..]) {
                        prefixed.clear();
                        prefixed.push_str(prefix);
                        prefixed.push_str(longhand);
                        if before.contains(prefixed.as_str()) {
                            reporter.report(
                                Report::range(
                                    format!("Unexpected shorthand '{name}' after '{prefixed}'."),
                                    span,
                                )
                                .message_id("unexpected"),
                            );
                        }
                    }
                }
                before.extend(set.iter().map(|(name, _)| *name));
            });
        }
    }
}
