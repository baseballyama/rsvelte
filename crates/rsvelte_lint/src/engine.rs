//! The native rule engine, free of any `svelte_check` (native-only) types so it
//! can run both on the CLI and in the browser (wasm). It parses the component
//! and walks the template once, returning raw [`LintDiagnostic`]s (byte offsets,
//! fixes intact). Compiler/validator findings are layered on top by the
//! native-only [`runner`](crate::runner).

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::{ParseOptions, parse};
use serde_json::Value;

use crate::config::LintConfig;
use crate::context::LintContext;
use crate::diagnostic::LintDiagnostic;
use crate::registry::{all_rules, all_script_rules};
use crate::rule::{RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule};
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

/// Run every enabled script-AST rule over `source`, returning raw findings.
///
/// Each `<script>` block's ESTree program is materialised as an owned
/// `serde_json::Value` (with absolute byte offsets) inside the parse arena, then
/// handed to each rule's `check_program`.
pub fn run_script_rules(source: &str, config: &LintConfig) -> Vec<LintDiagnostic> {
    let rules = all_script_rules();
    let enabled: Vec<(&dyn ScriptRule, &'static RuleMeta, Severity)> = rules
        .iter()
        .filter_map(|r| {
            let meta = r.meta();
            let severity = config.severity_for(meta);
            (severity != Severity::Off).then_some((r.as_ref(), meta, severity))
        })
        .collect();
    if enabled.is_empty() {
        return Vec::new();
    }
    let Ok(root) = parse(source, ParseOptions::default()) else {
        return Vec::new();
    };

    // Materialise each script program to an owned ESTree JSON value. The
    // serialization MUST run inside the arena scope (the program body resolves
    // arena-indexed children) and BEFORE any out-of-scope `as_json` would cache
    // an empty body — so we parse fresh here and serialize immediately.
    let programs: Vec<(ScriptKind, Value)> = with_serialize_arena(&root.arena, || {
        let mut out = Vec::new();
        if let Some(s) = root.instance.as_ref() {
            out.push((ScriptKind::Instance, s.content.as_json().clone()));
        }
        if let Some(s) = root.module.as_ref() {
            out.push((ScriptKind::Module, s.content.as_json().clone()));
        }
        out
    });
    if programs.is_empty() {
        return Vec::new();
    }

    let mut ctx = LintContext::new(config, source);
    for (kind, program) in &programs {
        for (rule, meta, severity) in &enabled {
            ctx.enter_rule(meta, *severity);
            rule.check_program(&mut ctx, program, *kind);
        }
    }
    ctx.into_diagnostics()
}
