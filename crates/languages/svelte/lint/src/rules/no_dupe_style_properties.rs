use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte::syntax::syntax_tree::TemplateNode;
use rustc_hash::{FxHashMap, FxHashSet};

use super::style_attribute::property_sets;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-dupe-style-properties",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoDupeStyleProperties))
}

#[derive(Debug)]
struct NoDupeStyleProperties;

impl SvelteRule for NoDupeStyleProperties {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let mut before: FxHashMap<&str, Span> = FxHashMap::default();
        let mut shown: FxHashSet<Span> = FxHashSet::default();
        for node in &component.nodes {
            let TemplateNode::Element { attributes, .. } = node else {
                continue;
            };
            before.clear();
            shown.clear();
            property_sets(file, *attributes, |set| {
                for &(name, span) in set {
                    if let Some(&already) = before.get(name) {
                        for at in [already, span] {
                            if shown.insert(at) {
                                reporter.report(
                                    Report::range(format!("Duplicate property '{name}'."), at)
                                        .message_id("unexpected"),
                                );
                            }
                        }
                    }
                }
                before.extend(set.iter().copied());
            });
        }
    }
}
