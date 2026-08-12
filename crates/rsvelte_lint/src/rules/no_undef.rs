//! `svelte/no-undef` — report unresolved runtime references from OXC semantic analysis.

use javascript_globals::{GLOBALS, GLOBALS_BUILTIN};

use crate::config::{GlobalValue, LintConfig};
use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ProgramView, ScriptKind, ScriptRule};

pub static META: RuleMeta = RuleMeta {
    name: "svelte/no-undef",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    // Core ESLint owns this rule upstream; require an explicit Svelte-aware opt-in.
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow unresolved runtime references in component scripts",
    options_schema: Some(
        r#"{ "type": "object", "properties": { "typeof": { "type": "boolean" } }, "additionalProperties": false }"#,
    ),
};

#[derive(Default)]
pub struct NoUndef;

impl ScriptRule for NoUndef {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, _kind: ScriptKind) {
        let Some(scope) = ctx.scope_resolver() else {
            return;
        };
        let start = program
            .get("start")
            .and_then(serde_json::Value::as_u64)
            .unwrap_or(0) as u32;
        let end = program
            .get("end")
            .and_then(serde_json::Value::as_u64)
            .unwrap_or(ctx.source().len() as u64) as u32;
        let report_typeof = ctx.option_bool("typeof", false);
        for reference in scope.unresolved_references() {
            if !(start <= reference.start && reference.end <= end)
                || reference.arguments_in_function
                || (!report_typeof && reference.in_typeof)
                || is_svelte_implicit_global(&reference.name, scope)
                || is_configured_global(&reference.name, ctx.config())
            {
                continue;
            }
            ctx.report_with_help(
                reference.start,
                reference.end,
                format!("'{}' is not defined.", reference.name),
                format!(
                    "Either define '{}' or add it to the 'globals' configuration.",
                    reference.name
                ),
            );
        }
    }
}

fn is_configured_global(name: &str, config: &LintConfig) -> bool {
    match config.globals().value(name) {
        Some(GlobalValue::Off) => false,
        Some(_) => true,
        None if GLOBALS_BUILTIN.contains_key(name) => true,
        None => config.globals().enabled_environments().any(|environment| {
            GLOBALS
                .get(environment)
                .is_some_and(|globals| globals.contains_key(name))
        }),
    }
}

fn is_svelte_implicit_global(name: &str, scope: &crate::scope::ScopeResolver) -> bool {
    matches!(
        name,
        "$state"
            | "$derived"
            | "$effect"
            | "$props"
            | "$bindable"
            | "$inspect"
            | "$host"
            | "$untrack"
            | "$trace"
            | "$effect.tracking"
            | "$effect.root"
            | "$state.raw"
            | "$state.snapshot"
            | "$derived.by"
            | "$$props"
            | "$$restProps"
            | "$$slots"
    ) || name
        .strip_prefix('$')
        .is_some_and(|store| scope.is_component_binding(store))
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use crate::{LintConfig, Severity, lint_source_raw};

    fn findings(source: &str, config: LintConfig) -> Vec<(String, u32)> {
        lint_source_raw(source, Path::new("App.svelte"), &config)
            .into_iter()
            .filter(|diagnostic| diagnostic.rule == "svelte/no-undef")
            .map(|diagnostic| (diagnostic.message, diagnostic.start))
            .collect()
    }

    fn enabled() -> LintConfig {
        LintConfig::empty().with_override("svelte/no-undef", Severity::Error)
    }

    #[test]
    fn reports_unresolved_values_but_not_type_references_or_default_typeof() {
        let source = "<script lang=\"ts\">\nlet x: MissingType;\ntype T = MissingType;\nconst y = missingValue;\ntype U = typeof declared;\n</script>";
        let reports = findings(source, enabled());
        assert_eq!(reports.len(), 2, "{reports:?}");
        assert!(reports[0].0.contains("missingValue"));
        assert!(reports[1].0.contains("declared"));
    }

    #[test]
    fn typeof_option_and_arguments_match_eslint_semantics() {
        let source = "<script>\nconst a = typeof maybe;\nconst arrow = () => arguments;\nfunction regular() { return arguments.length; }\n</script>";
        let reports = findings(source, enabled());
        assert_eq!(reports.len(), 1, "{reports:?}");
        assert!(reports[0].0.contains("arguments"));
        let reports = findings(
            source,
            enabled().with_options("svelte/no-undef", serde_json::json!({ "typeof": true })),
        );
        assert_eq!(reports.len(), 2, "{reports:?}");
        assert!(reports.iter().any(|(message, _)| message.contains("maybe")));
    }

    #[test]
    fn honors_svelte_runes_store_subscriptions_and_configured_globals() {
        let source = "<script>\nlet count = $state(0);\nconst props = $props();\nconst value = $count + projectGlobal + document.title;\n</script>";
        let config = enabled()
            .with_global("projectGlobal", crate::config::GlobalValue::Readonly)
            .with_environment("browser", true);
        assert!(findings(source, config).is_empty());
    }

    #[test]
    fn explicit_off_overrides_an_environment_global() {
        let source = "<script>document.title;</script>";
        let reports = findings(
            source,
            enabled()
                .with_environment("browser", true)
                .with_global("document", crate::config::GlobalValue::Off),
        );
        assert_eq!(reports.len(), 1, "{reports:?}");
    }

    #[test]
    fn inline_disable_suppresses_the_rule() {
        let source = "<script>\n// eslint-disable-next-line svelte/no-undef\nmissing;\n</script>";
        assert!(findings(source, enabled()).is_empty());
    }

    #[test]
    fn reports_each_script_reference_once() {
        let source = "<script module>moduleMissing;</script><script>instanceMissing;</script>";
        let reports = findings(source, enabled());
        assert_eq!(reports.len(), 2, "{reports:?}");
    }
}
