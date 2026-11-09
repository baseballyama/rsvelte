use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte::syntax::syntax_tree::{Component, TemplateNode};

use rsvelte_typescript::syntax_tree::TypeDeclarationKind;

use super::runes::runes;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/experimental-require-slot-types",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(ExperimentalRequireSlotTypes))
}

#[derive(Debug)]
struct ExperimentalRequireSlotTypes;

impl SvelteRule for ExperimentalRequireSlotTypes {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        // Upstream runs on Svelte 5 only outside runes mode.
        if runes(file) != Some(false) || !is_typescript(component, source) {
            return;
        }
        let has_slot = component.nodes.iter().any(|node| {
            matches!(node, TemplateNode::Element { name, .. } if name.text(source) == "slot")
        });
        if !has_slot {
            return;
        }
        let tree = file.javascript();
        let declared = tree.type_declarations.iter().any(|d| {
            matches!(
                d.kind,
                TypeDeclarationKind::Alias | TypeDeclarationKind::Interface
            ) && tree.atoms.get(d.name) == "$$Slots"
        });
        if !declared {
            // Upstream reports at `{ line: 1, column: 1 }`, the document's second character.
            let offset = source.chars().next().map_or(0, char::len_utf8) as u32;
            reporter.report(
                Report::point("The component must define the $$Slots interface.", offset)
                    .message_id("missingSlotsInterface"),
            );
        }
    }
}

/// The `lang` of the last `<script>`, which upstream's listener leaves set.
fn is_typescript(component: &Component, source: &str) -> bool {
    let last = component
        .module
        .iter()
        .chain(&component.instance)
        .max_by_key(|script| script.span.start_offset);
    last.is_some_and(|script| {
        let lang = script
            .attributes
            .iter()
            .find(|(name, _)| name.text(source) == "lang")
            .and_then(|(_, value)| *value)
            .map(|value| value.text(source).to_ascii_lowercase());
        matches!(lang.as_deref(), Some("ts" | "typescript"))
    })
}
