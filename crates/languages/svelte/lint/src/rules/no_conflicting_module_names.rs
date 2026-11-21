use rsvelte_lint_runner::rule::Reporter;

use crate::project::{SameNamedFile, SameNamedFileOnDisk};
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-conflicting-module-names",
    files: Files::All,
    configure: without_options::<NoConflictingModuleNames>,
};

#[derive(Debug, Default)]
struct NoConflictingModuleNames;

impl SvelteRule for NoConflictingModuleNames {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let other = file
            .context
            .facet::<SameNamedFile>()
            .unwrap_or_else(|| file.context.get::<SameNamedFileOnDisk>());
        let Some(other) = other else {
            return;
        };
        let message = if file.is_component() {
            let path = file.path();
            let component = &path[path.rfind(['/', '\\']).map_or(0, |at| at + 1)..];
            format!(
                "The module `{other}` has the same name as this component. TypeScript resolves \
                 the import `./{component}` to that module, not to this component. Rename \
                 `{other}`."
            )
        } else {
            format!(
                "This module has the same name as the component `{other}`. TypeScript resolves \
                 the import `./{other}` to this module, not to the component. Rename this file."
            )
        };
        reporter.point(message, 0);
    }
}
