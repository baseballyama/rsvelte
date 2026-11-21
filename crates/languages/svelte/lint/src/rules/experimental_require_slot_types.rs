use oxc_ast::AstKind;
use rsvelte_lint_runner::catalog::Category;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::{Component, TemplateNode};

use super::shared::markup::lang_attribute;
use super::shared::runes::runes;
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/experimental-require-slot-types",
    files: Files::Components,
    category: Category::Style,
    configure: without_options::<ExperimentalRequireSlotTypes>,
};

#[derive(Debug, Default)]
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
        let declared = file.nodes().iter().any(|node| match node.kind() {
            AstKind::TSTypeAliasDeclaration(alias) => alias.id.name == "$$Slots",
            AstKind::TSInterfaceDeclaration(interface) => interface.id.name == "$$Slots",
            _ => false,
        });
        if !declared {
            // Upstream reports at `{ line: 1, column: 1 }`, the document's second character.
            let offset = source.chars().next().map_or(0, char::len_utf8) as u32;
            reporter.report(Report::point(
                "The component must define the $$Slots interface.",
                offset,
            ));
        }
    }
}

/// The `lang` of the last `<script>`, which upstream's listener leaves set.
fn is_typescript(component: &Component, source: &str) -> bool {
    let last = component
        .scripts()
        .max_by_key(|script| script.span.start_offset);
    last.is_some_and(|script| {
        let lang = lang_attribute(&script.attributes, source)
            .and_then(|&(_, value)| value)
            .map(|value| value.text(source).to_ascii_lowercase());
        matches!(lang.as_deref(), Some("ts" | "typescript"))
    })
}
