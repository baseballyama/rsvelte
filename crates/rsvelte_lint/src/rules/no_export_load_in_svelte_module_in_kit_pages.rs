//! `svelte/no-export-load-in-svelte-module-in-kit-pages` — disallow exporting
//! `load` functions in `*.svelte` module scripts in SvelteKit page components.
//!
//! The rule only applies to SvelteKit route files (`+page.svelte`,
//! `+layout.svelte`, `+error.svelte`) and only to `<script context="module">`
//! blocks. Within those it flags top-level exports whose declared name is
//! exactly `load`:
//!
//! - `export function load() {}`
//! - `export const load = ...`
//!
//! Port of
//! `eslint-plugin-svelte/src/rules/no-export-load-in-svelte-module-in-kit-pages.ts`.

use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_end, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-export-load-in-svelte-module-in-kit-pages",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow exporting load functions in *.svelte module in SvelteKit page components",
    options_schema: None,
};

const MESSAGE: &str =
    "disallow exporting load functions in `*.svelte` module in SvelteKit page components.";

/// Whether this file is a SvelteKit route file that the rule should run on.
///
/// Mirrors upstream's `svelteKitFileType` check: only applies when the file
/// is under a `routes` directory inside an `src` folder (default `src/routes`).
/// Files named `+page.svelte` etc. that live outside any `src/routes/` path
/// (e.g., test fixtures under an unrelated directory) are silently skipped
/// just as the oracle does.
///
/// When the path has no parent directory component (e.g. `path = "+page.svelte"`
/// in tests or wasm contexts), we fall back to the filename-only gate so that
/// oracle/unit-tests that pass just a bare filename still exercise the rule.
fn is_kit_route_file(ctx: &LintContext) -> bool {
    let filename = ctx.filename();
    if !matches!(
        filename,
        "+page.svelte" | "+layout.svelte" | "+error.svelte"
    ) {
        return false;
    }
    // Require the file to be under a `src/routes` directory segment, matching
    // upstream's `filePath.startsWith(path.join(projectRootDir, "src/routes"))`.
    if let Some(path) = ctx.path() {
        // If there is no parent directory (the path is a bare filename), treat
        // it as if it's in the right place — this preserves oracle-test behavior.
        if path.parent().is_none_or(|p| p == std::path::Path::new("")) {
            return true;
        }
        let path_str = path.to_string_lossy();
        // Accept `/…/src/routes/…` or a path starting with `src/routes/`.
        path_str.contains("/src/routes/") || path_str.starts_with("src/routes/")
    } else {
        // No filesystem path (wasm / in-memory): fall back to filename-only gate.
        true
    }
}

#[derive(Default)]
pub struct NoExportLoadInSvelteModuleInKitPages;

impl ScriptRule for NoExportLoadInSvelteModuleInKitPages {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, kind: ScriptKind) {
        // Only inspect the module script (`<script context="module">`).
        if kind != ScriptKind::Module {
            return;
        }

        if !is_kit_route_file(ctx) {
            return;
        }

        // Walk top-level ExportNamedDeclaration nodes and look for `load`
        // declared directly under them.
        let mut reports: Vec<(u32, u32)> = Vec::new();

        walk_js(program, |node, ancestors| {
            if node_type(node) != Some("ExportNamedDeclaration") {
                return;
            }

            // Must be a direct child of the program body (top-level export).
            // The closest ancestor with a type should be the Program node.
            let parent_is_program = ancestors
                .last()
                .is_some_and(|p| node_type(p) == Some("Program"));
            if !parent_is_program {
                return;
            }

            let Some(declaration) = node.get("declaration") else {
                return;
            };

            match node_type(declaration) {
                // export function load() {}
                Some("FunctionDeclaration") => {
                    if let Some(id) = declaration.get("id")
                        && node_type(id) == Some("Identifier")
                        && id.get("name").and_then(Value::as_str) == Some("load")
                        && let (Some(s), Some(e)) = (node_start(id), node_end(id))
                    {
                        reports.push((s, e));
                    }
                }
                // export const load = ...  /  export let load = ...
                Some("VariableDeclaration") => {
                    let Some(decls) = declaration.get("declarations").and_then(Value::as_array)
                    else {
                        return;
                    };
                    for decl in decls {
                        if node_type(decl) != Some("VariableDeclarator") {
                            continue;
                        }
                        let Some(id) = decl.get("id") else { continue };
                        if node_type(id) == Some("Identifier")
                            && id.get("name").and_then(Value::as_str) == Some("load")
                            && let (Some(s), Some(e)) = (node_start(id), node_end(id))
                        {
                            reports.push((s, e));
                        }
                    }
                }
                _ => {}
            }
        });

        for (start, end) in reports {
            ctx.report(start, end, MESSAGE);
        }
    }
}
