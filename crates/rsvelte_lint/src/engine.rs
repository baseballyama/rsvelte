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
    // Re-install the arena pointer so that `Expression::Typed::as_json()` can
    // resolve arena-indexed children while the visitor walks the template.
    // The pointer was cleared when `parse()` dropped its `SerializeArenaGuard`.
    with_serialize_arena(&root.arena, || {
        LintVisitor::new(enabled).visit_root(&mut ctx, &root);
    });
    ctx.into_diagnostics()
}

/// What kind of file the linter is processing, derived from its extension.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SourceKind {
    /// A `.svelte` component (template + optional `<script>` blocks).
    Svelte,
    /// A standalone JS/TS module (`.svelte.js`, `.svelte.ts`, `.js`, `.ts`, …).
    Module {
        /// Whether the module is TypeScript.
        ts: bool,
    },
}

/// Classify a file by name/extension. `.svelte` → component; `.ts`/`.mts`/`.cts`
/// (incl. `.svelte.ts`) → TS module; `.js`/`.mjs`/`.cjs` (incl. `.svelte.js`) →
/// JS module; anything else defaults to a component.
pub fn classify_source(filename: &str) -> SourceKind {
    if filename.ends_with(".svelte") {
        SourceKind::Svelte
    } else if filename.ends_with(".ts") || filename.ends_with(".mts") || filename.ends_with(".cts")
    {
        SourceKind::Module { ts: true }
    } else if filename.ends_with(".js") || filename.ends_with(".mjs") || filename.ends_with(".cjs")
    {
        SourceKind::Module { ts: false }
    } else {
        SourceKind::Svelte
    }
}

type EnabledScriptRule<'a> = (&'a dyn ScriptRule, &'static RuleMeta, Severity);

/// The enabled (non-`Off`) script rules for `config`.
fn enabled_script_rules<'a>(
    rules: &'a [Box<dyn ScriptRule>],
    config: &LintConfig,
) -> Vec<EnabledScriptRule<'a>> {
    rules
        .iter()
        .filter_map(|r| {
            let meta = r.meta();
            let severity = config.severity_for(meta);
            (severity != Severity::Off).then_some((r.as_ref(), meta, severity))
        })
        .collect()
}

/// Run each enabled script rule over every `(kind, program)` pair.
fn run_over_programs(
    programs: &[(ScriptKind, Value)],
    source: &str,
    config: &LintConfig,
    enabled: &[EnabledScriptRule<'_>],
) -> Vec<LintDiagnostic> {
    let mut ctx = LintContext::new(config, source);
    for (kind, program) in programs {
        for (rule, meta, severity) in enabled {
            ctx.enter_rule(meta, *severity);
            rule.check_program(&mut ctx, program, *kind);
        }
    }
    ctx.into_diagnostics()
}

/// Run every enabled script-AST rule over a Svelte component's `<script>`
/// block(s), returning raw findings.
///
/// Each program is materialised as an owned `serde_json::Value` (with absolute
/// byte offsets) inside the parse arena, then handed to each rule's
/// `check_program`.
pub fn run_script_rules(source: &str, config: &LintConfig) -> Vec<LintDiagnostic> {
    let rules = all_script_rules();
    let enabled = enabled_script_rules(&rules, config);
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
    run_over_programs(&programs, source, config, &enabled)
}

/// Run every enabled script-AST rule over a standalone JS/TS **module** file
/// (`*.svelte.js` / `*.svelte.ts` / `*.js` / `*.ts`), returning raw findings.
///
/// The whole file is parsed as a module program (byte offsets relative to the
/// file), so script rules report at file-accurate positions.
pub fn run_script_rules_module(
    source: &str,
    is_ts: bool,
    config: &LintConfig,
) -> Vec<LintDiagnostic> {
    let rules = all_script_rules();
    let enabled = enabled_script_rules(&rules, config);
    if enabled.is_empty() {
        return Vec::new();
    }
    let program = rsvelte_core::compiler::phases::parse_module_to_estree(source, is_ts);
    let programs = [(ScriptKind::Module, program)];
    run_over_programs(&programs, source, config, &enabled)
}
