use oxc_ast::AstKind;
use oxc_syntax::operator::UnaryOperator;
use rsvelte_lint_runner::catalog::Category;
use rsvelte_lint_runner::rule::Reporter;
use rsvelte_typescript_tree::document_span;
use rustc_hash::FxHashSet;
use serde::Deserialize;

use super::shared::svelte_names::{TopLevelNames, is_svelte_global, reactive_names};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

#[cfg(test)]
mod tests;

/// `ESLint`'s core rule over a component, with the names `svelte-eslint-parser` and
/// typescript-eslint declare.
pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "no-undef",
    files: Files::Components,
    category: Category::Correctness,
    configure,
};

#[derive(Debug, Default, Deserialize)]
#[serde(deny_unknown_fields)]
struct NoUndef {
    /// Reports a name `typeof` reads too.
    #[serde(default, rename = "typeof")]
    type_of: bool,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    Ok(Box::new(options.single::<NoUndef>()?))
}

impl SvelteRule for NoUndef {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let Some(top_level) = TopLevelNames::new(file) else {
            return;
        };
        let Some(resolution) = file.resolution() else {
            return;
        };
        let scoping = resolution.scoping();
        let nodes = resolution.semantic().nodes();
        let runes = file.runes() != Some(false);
        let globals = file.globals();
        let reactive: FxHashSet<&str> = reactive_names(file).collect();
        for (name, references) in scoping.root_unresolved_references() {
            let name = name.as_str();
            if is_svelte_global(name, runes)
                || top_level.stores(name, runes).next().is_some()
                || top_level.binding(name).is_some()
                || reactive.contains(name)
            {
                continue;
            }
            for &id in references {
                let reference = scoping.get_reference(id);
                if globals.resolves(name, reference.flags()) {
                    continue;
                }
                // A function's own `arguments`, which eslint-scope declares in every function.
                if name == "arguments"
                    && scoping
                        .scope_ancestors(reference.scope_id())
                        .map(|scope| scoping.scope_flags(scope))
                        .any(|flags| flags.is_function() && !flags.is_arrow())
                {
                    continue;
                }
                let read_by_typeof = matches!(
                    nodes.parent_kind(reference.node_id()),
                    AstKind::UnaryExpression(unary) if unary.operator == UnaryOperator::Typeof
                );
                if read_by_typeof && !self.type_of {
                    continue;
                }
                reporter.range(
                    format!("'{name}' is not defined."),
                    document_span(resolution.reference_span(id)),
                );
            }
        }
    }
}
