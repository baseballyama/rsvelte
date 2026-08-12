//! `svelte/no-unused-vars` — flag top-level `<script>` bindings that are never
//! read anywhere in the component (script, template, or `<style>` directives).
//!
//! `ESLint` core's `no-unused-vars` and oxlint both stop at the `.svelte`
//! boundary, so a component's script variables go unchecked unless a project
//! keeps a Svelte-aware `ESLint` around (issue #1732). This rule closes that gap
//! using the compiler's own Phase-2 scope tree, which already resolves template
//! reads, `$store` auto-subscriptions and `bind:` targets back to their binding.
//!
//! Deliberately conservative — a false positive on a real component is worse
//! than a miss:
//!
//! - only **top-level** module/instance-script bindings are considered (each
//!   items, snippet params, `let:` directives and function locals live in child
//!   scopes and are never reported);
//! - props (`export let`, `$props()` destructuring, `$$props`/`$$restProps`/
//!   `$$slots`), stores read as `$name`, reactive `$:` declarations, exported
//!   declarations and reassigned/mutated bindings are all treated as used;
//! - a name that occurs anywhere else in the source is treated as used, which
//!   covers reads Phase 2 does not record as references (TypeScript type
//!   positions, `JSDoc` `@type`, generics).

use serde_json::Value;

use rsvelte_core::compiler::phases::phase2_analyze::{Binding, BindingKind, DeclarationKind};
use rsvelte_core::compiler::utils::{char_at, char_before, is_js_ident_continue};

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ProgramView, ScriptKind, ScriptRule};

pub static META: RuleMeta = RuleMeta {
    name: "svelte/no-unused-vars",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow top-level `<script>` variables that are never used in the script or the template",
    options_schema: None,
};

#[derive(Default)]
pub struct NoUnusedVars;

impl ScriptRule for NoUnusedVars {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, kind: ScriptKind) {
        let Some(analysis) = ctx.scope_analysis() else {
            return;
        };
        let root = &analysis.root;

        // Scope 0 is the module script; the instance script gets its own child
        // scope (see `scope_builder::visit_root`).
        let target_scope = match kind {
            ScriptKind::Module => 0,
            ScriptKind::Instance => root.instance_scope_index,
        };
        if kind == ScriptKind::Instance && target_scope == 0 {
            return;
        }

        let exported = exported_names(program.value());
        let source = ctx.source();

        let mut reports: Vec<(u32, String)> = Vec::new();
        for binding in &root.bindings {
            if binding.scope_index != target_scope {
                continue;
            }
            let Some(start) = binding.declaration_start else {
                continue;
            };
            if exported.iter().any(|n| n == &binding.name) {
                continue;
            }
            if !is_reportable(binding) {
                continue;
            }
            // A `$name` binding means the store is auto-subscribed somewhere.
            if root
                .bindings_by_name
                .contains_key(&format!("${}", binding.name))
            {
                continue;
            }
            if binding
                .references
                .iter()
                .any(|r| !r.is_self_declaration && r.start != start)
            {
                continue;
            }
            if occurs_outside(source, &binding.name, start) {
                continue;
            }
            reports.push((start, binding.name.clone()));
        }

        reports.sort_unstable();
        for (start, name) in reports {
            let end = start
                + u32::try_from(name.len()).expect("identifier widths are represented as u32");
            ctx.report(start, end, format!("'{name}' is defined but never used."));
        }
    }
}

/// Whether a binding is the kind of declaration this rule judges at all.
/// Everything Svelte gives an implicit external meaning to (props, stores read
/// via `$`, reactive declarations, template-owned bindings) is excluded.
fn is_reportable(binding: &Binding) -> bool {
    if binding.name.starts_with('$') {
        return false;
    }
    if binding.reassigned || binding.mutated {
        return false;
    }
    if !matches!(
        binding.declaration_kind,
        DeclarationKind::Let
            | DeclarationKind::Const
            | DeclarationKind::Var
            | DeclarationKind::Function
            | DeclarationKind::Import
    ) {
        return false;
    }
    matches!(
        binding.kind,
        BindingKind::Normal
            | BindingKind::State
            | BindingKind::RawState
            | BindingKind::Derived
            | BindingKind::Static
    )
}

/// Names re-exported by this program, in any of the forms that make a
/// declaration part of the module's public surface.
fn exported_names(program: &Value) -> Vec<String> {
    let mut out = Vec::new();
    let Some(body) = program.get("body").and_then(Value::as_array) else {
        return out;
    };
    for stmt in body {
        let ty = stmt.get("type").and_then(Value::as_str).unwrap_or("");
        if !matches!(
            ty,
            "ExportNamedDeclaration" | "ExportDefaultDeclaration" | "ExportAllDeclaration"
        ) {
            continue;
        }
        if let Some(decl) = stmt.get("declaration") {
            collect_declared_names(decl, &mut out);
        }
        if let Some(specs) = stmt.get("specifiers").and_then(Value::as_array) {
            for spec in specs {
                if let Some(local) = spec
                    .get("local")
                    .and_then(|l| l.get("name"))
                    .and_then(Value::as_str)
                {
                    out.push(local.to_string());
                }
            }
        }
    }
    out
}

fn collect_declared_names(decl: &Value, out: &mut Vec<String>) {
    match decl.get("type").and_then(Value::as_str) {
        Some("VariableDeclaration") => {
            if let Some(decls) = decl.get("declarations").and_then(Value::as_array) {
                for d in decls {
                    collect_pattern_names(d.get("id"), out);
                }
            }
        }
        Some(_) => {
            if let Some(name) = decl
                .get("id")
                .and_then(|i| i.get("name"))
                .and_then(Value::as_str)
            {
                out.push(name.to_string());
            }
        }
        None => {}
    }
}

fn collect_pattern_names(pat: Option<&Value>, out: &mut Vec<String>) {
    let Some(pat) = pat else { return };
    match pat.get("type").and_then(Value::as_str) {
        Some("Identifier") => {
            if let Some(name) = pat.get("name").and_then(Value::as_str) {
                out.push(name.to_string());
            }
        }
        Some("ObjectPattern") => {
            if let Some(props) = pat.get("properties").and_then(Value::as_array) {
                for p in props {
                    collect_pattern_names(p.get("value").or_else(|| p.get("argument")), out);
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(elems) = pat.get("elements").and_then(Value::as_array) {
                for e in elems {
                    collect_pattern_names(Some(e), out);
                }
            }
        }
        Some("AssignmentPattern") => collect_pattern_names(pat.get("left"), out),
        Some("RestElement") => collect_pattern_names(pat.get("argument"), out),
        _ => {}
    }
}

/// Whether `name` appears as a standalone identifier anywhere in `source` other
/// than at `decl_start`. Phase 2 records no reference for reads that the
/// TypeScript stripper removes (type annotations, generics) or that live in
/// `JSDoc`, so a textual hit anywhere else vetoes the report.
fn occurs_outside(source: &str, name: &str, decl_start: u32) -> bool {
    let mut from = 0usize;
    while let Some(rel) = source[from..].find(name) {
        let at = from + rel;
        from = at + name.len();
        if u32::try_from(at).expect("source offsets are represented as u32") == decl_start {
            continue;
        }
        // A neighbour is glue only if it could continue the identifier; every
        // other character (including non-ASCII space) is a word boundary.
        let before_ok = char_before(source, at).is_none_or(|c| !is_js_ident_continue(c));
        let after_ok = char_at(source, at + name.len()).is_none_or(|c| !is_js_ident_continue(c));
        if before_ok && after_ok {
            return true;
        }
    }
    false
}

#[cfg(test)]
mod tests {
    use crate::config::LintConfig;
    use crate::engine::run_script_rules;
    use crate::rule::Severity;

    fn unused(src: &str) -> Vec<String> {
        let config =
            LintConfig::recommended().with_override("svelte/no-unused-vars", Severity::Warn);
        run_script_rules(src, "Test.svelte", &config)
            .into_iter()
            .filter(|d| d.rule == "svelte/no-unused-vars")
            .map(|d| d.message)
            .collect()
    }

    fn assert_clean(src: &str) {
        let found = unused(src);
        assert!(
            found.is_empty(),
            "expected no findings, got {found:?}\n--- source ---\n{src}"
        );
    }

    fn assert_reports(src: &str, name: &str) {
        let found = unused(src);
        assert!(
            found.iter().any(|m| m.contains(&format!("'{name}'"))),
            "expected a finding for '{name}', got {found:?}\n--- source ---\n{src}"
        );
    }

    #[test]
    fn reports_unused_top_level_const() {
        assert_reports(
            "<script>\n  const unused = 1;\n</script>\n<p>hi</p>",
            "unused",
        );
    }

    #[test]
    fn reports_unused_import() {
        assert_reports(
            "<script>\n  import { tick } from 'svelte';\n</script>\n<p>hi</p>",
            "tick",
        );
    }

    #[test]
    fn issue_example() {
        let src = "<script>\n  import { writable } from 'svelte/store';\n\n  const count = writable(0);\n  const current = $count;\n  const unused = 1;\n</script>\n\n<p>{current}</p>";
        let found = unused(src);
        assert_eq!(found.len(), 1, "got {found:?}");
        assert!(found[0].contains("'unused'"), "got {found:?}");
    }

    #[test]
    fn legacy_export_let_prop_is_not_unused() {
        assert_clean("<script>\n  export let name;\n</script>\n<p>hi</p>");
    }

    #[test]
    fn props_rune_destructuring_is_not_unused() {
        assert_clean("<script>\n  let { a, b = 1, ...rest } = $props();\n</script>\n<p>hi</p>");
    }

    #[test]
    fn template_only_reference_is_not_unused() {
        assert_clean("<script>\n  const greeting = 'hi';\n</script>\n<p>{greeting}</p>");
    }

    #[test]
    fn dollar_dollar_props_are_not_unused() {
        assert_clean(
            "<script>\n  const a = $$props;\n  const b = $$restProps;\n  const c = $$slots;\n</script>\n<p>{a}{b}{c}</p>",
        );
    }

    #[test]
    fn snippet_params_are_not_unused() {
        assert_clean(
            "{#snippet row(item, i)}\n  <li>{item}</li>\n{/snippet}\n{@render row('a', 0)}",
        );
    }

    #[test]
    fn each_binding_used_only_in_template_is_not_unused() {
        assert_clean(
            "<script>\n  const items = [1, 2];\n</script>\n{#each items as item, i}\n  <li>{item}</li>\n{/each}",
        );
    }

    #[test]
    fn store_auto_subscription_keeps_the_store_used() {
        assert_clean(
            "<script>\n  import { writable } from 'svelte/store';\n  const count = writable(0);\n</script>\n<p>{$count}</p>",
        );
    }

    #[test]
    fn bind_target_is_not_unused() {
        assert_clean("<script>\n  let value = '';\n</script>\n<input bind:value />");
    }

    #[test]
    fn exported_module_declaration_is_not_unused() {
        assert_clean(
            "<script module>\n  export const VERSION = 1;\n  export function helper() {}\n</script>\n<p>hi</p>",
        );
    }

    #[test]
    fn export_specifier_is_not_unused() {
        assert_clean("<script module>\n  const a = 1;\n  export { a };\n</script>\n<p>hi</p>");
    }

    #[test]
    fn reactive_declaration_is_not_unused() {
        assert_clean(
            "<script>\n  export let n;\n  $: doubled = n * 2;\n</script>\n<p>{doubled}</p>",
        );
    }

    #[test]
    fn typescript_type_only_usage_is_not_unused() {
        assert_clean(
            "<script lang=\"ts\">\n  type Item = { id: number };\n  let rows: Item[] = [];\n</script>\n<p>{rows.length}</p>",
        );
    }

    #[test]
    fn function_locals_are_not_reported() {
        assert_clean(
            "<script>\n  function go() {\n    const scratch = 1;\n  }\n  go();\n</script>\n<p>hi</p>",
        );
    }

    #[test]
    fn state_read_in_template_is_not_unused() {
        assert_clean("<script>\n  let count = $state(0);\n</script>\n<p>{count}</p>");
    }

    #[test]
    fn style_directive_reference_is_not_unused() {
        assert_clean("<script>\n  const color = 'red';\n</script>\n<p style:color>hi</p>");
    }

    #[test]
    fn component_used_only_in_template_is_not_unused() {
        assert_clean("<script>\n  import Child from './Child.svelte';\n</script>\n<Child />");
    }

    /// A `JSDoc` `@type` is the shape this rule's textual fallback exists for, and
    /// a non-ASCII space in it must not hide the use.
    #[test]
    fn nbsp_separated_jsdoc_use_is_not_unused() {
        assert_clean(
            "<script>\n  import { Foo } from './x';\n  /** @type {\u{a0}Foo} */\n  let v = null;\n</script>\n<p>{v}</p>",
        );
    }

    /// A neighbour that can continue an identifier keeps the hit non-standalone,
    /// so the binding stays reported — the direction a blanket
    /// "non-ASCII is a boundary" rule would break.
    #[test]
    fn identifier_neighbour_still_hides_the_occurrence() {
        assert_reports(
            "<script>\n  const foo = 1;\n</script>\n<p>foo\u{7dcf}</p>",
            "foo",
        );
        assert_reports(
            "<script>\n  const foo = 1;\n</script>\n<p>foo\u{e9}</p>",
            "foo",
        );
    }

    /// Boundary characters: an occurrence flanked by them is standalone.
    /// `U+0085` is here because it is not `ID_Continue`, independent of the
    /// separate question of whether a JS parser accepts it as whitespace.
    #[test]
    fn non_identifier_neighbours_are_word_boundaries() {
        for sep in [
            ' ',
            '\n',
            '.',
            '\u{85}',
            '\u{a0}',
            '\u{1680}',
            '\u{2000}',
            '\u{2009}',
            '\u{2028}',
            '\u{2029}',
            '\u{202f}',
            '\u{205f}',
            '\u{3000}',
            '\u{feff}',
            '\u{2014}',
            '\u{3001}',
            '\u{1f600}',
        ] {
            let src = format!("x{sep}foo{sep}y");
            assert!(
                super::occurs_outside(&src, "foo", u32::MAX),
                "U+{:04X} must be a word boundary",
                sep as u32
            );
        }
    }

    /// The other direction of the same predicate: `ID_Start` / `ID_Continue`
    /// characters, `$`, `_` and the zero-width joiners are identifier glue.
    #[test]
    fn identifier_neighbours_are_glue() {
        for glue in [
            'a', 'Z', '0', '_', '$', '\u{e9}', '\u{7dcf}', '\u{5d0}', '\u{3005}', '\u{200c}',
            '\u{200d}',
        ] {
            let src = format!("x{glue}foo{glue}y");
            assert!(
                !super::occurs_outside(&src, "foo", u32::MAX),
                "U+{:04X} must be identifier glue",
                glue as u32
            );
        }
    }
}
