//! The native rule engine, free of any `svelte_check` (native-only) types so it
//! can run both on the CLI and in the browser (wasm). It parses the component
//! and walks the template once, returning raw [`LintDiagnostic`]s (byte offsets,
//! fixes intact). Compiler/validator findings are layered on top by the
//! native-only [`runner`](crate::runner).

use rsvelte_core::{ParseOptions, parse};

use crate::config::LintConfig;
use crate::context::LintContext;
use crate::diagnostic::LintDiagnostic;
use crate::registry::all_rules;
use crate::rule::Severity;
use crate::visitor::{EnabledRule, LintVisitor};

/// Run every enabled native rule over `source`, returning raw findings.
pub fn run_native_rules(source: &str, config: &LintConfig) -> Vec<LintDiagnostic> {
    let rules = all_rules();
    let enabled: Vec<EnabledRule> = rules
        .iter()
        .filter_map(|r| {
            let meta = r.meta();
            let severity = config.severity_for(meta);
            if severity == Severity::Off {
                return None;
            }
            Some(EnabledRule {
                rule: r.as_ref(),
                meta,
                severity,
            })
        })
        .collect();

    if enabled.is_empty() {
        return Vec::new();
    }
    let Ok(root) = parse(source, ParseOptions::default()) else {
        return Vec::new();
    };
    let mut ctx = LintContext::new(config, source);
    LintVisitor::new(enabled).visit_root(&mut ctx, &root);
    ctx.into_diagnostics()
}
