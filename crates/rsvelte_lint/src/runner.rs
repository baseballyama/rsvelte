//! Top-level lint entry points: parse + analyze (validator wrap) + native rule
//! walk + suppression, merged into one sorted diagnostic list.

use std::path::Path;

use rsvelte_core::CompileOptions;
use rsvelte_diagnostics::Diagnostic;

use crate::config::LintConfig;
use crate::diagnostic::{LintDiagnostic, LintMessage, TextEdit};
use crate::engine::{
    lint_parse_options, maybe_scope_resolver, run_native_rules, run_native_rules_on_root,
    run_script_rules, run_script_rules_on_root,
};
use crate::line_index::LineIndex;
use crate::suppression::Suppressions;

/// Parse the component once and run every AST-driven rule pass over it: the
/// native template walk, the `<script>` walk and the scope rules. The flag
/// reports whether the lenient parse succeeded, which gates the source-scan
/// fallbacks that stand in for the walks when it did not.
fn svelte_rule_findings(
    source: &str,
    file: &Path,
    filename: &str,
    config: &LintConfig,
) -> (Vec<LintDiagnostic>, bool) {
    // One lenient parse shared by the native-template walk, the script-AST walk
    // and the block-lang fallback's success probe. The validator wrap compiles
    // independently (it needs a full analyze pass), so it keeps its own parse.
    let parsed = rsvelte_core::parse(
        source,
        &rsvelte_core::Allocator::default(),
        lint_parse_options(),
    )
    .ok();

    let mut diags = Vec::new();
    if let Some(root) = &parsed {
        // Build the oxc-semantic scope resolver ONCE (when the rule that needs
        // it is on) and share it across both passes, so the semantic build isn't
        // paid twice.
        let resolver = maybe_scope_resolver(root, source, config);
        diags.extend(run_native_rules_on_root(
            root,
            source,
            filename,
            config,
            Some(file),
            resolver.as_ref(),
        ));
        // Thread the full path so path-gated rules (e.g. SvelteKit route file
        // detection) can check whether the file lives under src/routes.
        diags.extend(run_script_rules_on_root(
            root,
            source,
            filename,
            config,
            Some(file),
            resolver.as_ref(),
        ));
    }

    // Scope-based rules (Wave 2). No-op until scope rules ship; this skips the
    // analysis pass entirely when none are enabled.
    diags.extend(crate::scope::scope_diagnostics(source, config));

    (diags, parsed.is_some())
}

/// Lint a single source string. `file` is used for diagnostic paths and
/// filename-gated rules (e.g. `SvelteKit` route file detection).
#[must_use]
pub fn lint_source(
    source: &str,
    file: &Path,
    options: &CompileOptions,
    config: &LintConfig,
) -> Vec<Diagnostic> {
    lint_source_messages(source, file, options, config)
        .into_iter()
        .map(|m| m.diagnostic)
        .collect()
}

/// Run linting with diagnostic payloads.
///
/// The full lint pass behind [`lint_source`]: the same diagnostics in the same
/// order, each paired with the `fix` / `suggestions` / `help` payload of the
/// rule that produced it. Findings from the validator wrap and the source-scan
/// meta rules carry no payload. Editors use this to drive `publishDiagnostics`
/// and `codeAction` from a single pass.
pub fn lint_source_messages(
    source: &str,
    file: &Path,
    options: &CompileOptions,
    config: &LintConfig,
) -> Vec<LintMessage> {
    // The compiler's parser strips a leading BOM, so its offsets are relative to
    // the stripped text; ESLint's `SourceCode` does the same. Mixing the two
    // slices inside the BOM.
    let source = rsvelte_core::remove_bom(source);
    let line_index = LineIndex::new(source);
    let filename = lint_filename(file);

    let effective = effective_config(source, config);
    let config = &effective;

    let mut diagnostics = match crate::engine::classify_source(&file.to_string_lossy()) {
        crate::engine::SourceKind::Module { ts } => {
            module_lint_messages(source, &filename, ts, config, file, &line_index)
        }
        crate::engine::SourceKind::Svelte => {
            // 1. Validator wrap — compiler warnings/errors/a11y (config applied inside).
            let mut diags: Vec<LintMessage> =
                crate::validator::validator_diagnostics(source, file, options, config)
                    .into_iter()
                    .map(LintMessage::from_diagnostic)
                    .collect();

            // 2. Native template walk + script-AST rules + scope rules.
            let (findings, parsed_ok) = svelte_rule_findings(source, file, &filename, config);
            diags.extend(
                findings
                    .into_iter()
                    .map(|d| LintMessage::from_lint(d, file, &line_index)),
            );

            // The source-scan meta rules below report in output coordinates and
            // never carry a fix.
            let mut meta: Vec<Diagnostic> = Vec::new();

            // 2c. valid-compile (opt-in): surface compiler warnings/errors under
            // the single `svelte/valid-compile` id. Off by default, so this is a
            // no-op (and skips the extra compile) unless the rule is enabled.
            meta.extend(crate::rules::valid_compile::valid_compile_diagnostics(
                source, file, options, config,
            ));

            // 2d. valid-style-parse: report `<style>` blocks with an unsupported
            // `lang`. A source scan, so it runs even when the (invalid) style
            // body would otherwise abort the main parse.
            meta.extend(
                crate::rules::valid_style_parse::valid_style_parse_diagnostics(
                    source, file, config,
                ),
            );

            // 2d2. block-lang fallback: for files the Svelte parser can't fully
            // parse (e.g. unknown `<style lang="…">` bodies or invalid TypeScript),
            // the normal `check_root` path is skipped. Run a source-scan instead
            // to catch `<script lang="…">` / `<style lang="…">` violations.
            meta.extend(
                crate::rules::block_lang::block_lang_source_scan_diagnostics(
                    source, file, config, parsed_ok,
                ),
            );

            // 2e. Cross-cutting (template + script) source-scan meta-rules.
            meta.extend(crate::rules::experimental_require_slot_types::diagnostics(
                source, file, config,
            ));
            if crate::svelte_version::supports_svelte5(
                crate::rules::experimental_require_strict_events::META.name,
            ) {
                meta.extend(
                    crate::rules::experimental_require_strict_events::diagnostics(
                        source, file, config,
                    ),
                );
            }
            if crate::svelte_version::supports_svelte5(
                crate::rules::require_event_dispatcher_types::META.name,
            ) {
                meta.extend(crate::rules::require_event_dispatcher_types::diagnostics(
                    source, file, config,
                ));
            }
            meta.extend(crate::rules::require_event_prefix::diagnostics(
                source, file, config,
            ));
            meta.extend(crate::rules::no_unused_props::diagnostics(
                source, file, config,
            ));

            // 2f. no-unused-svelte-ignore: compile + match svelte-ignore comments
            // against the warnings they would suppress; report the unused ones.
            meta.extend(
                crate::rules::no_unused_svelte_ignore::no_unused_svelte_ignore_diagnostics(
                    source,
                    file,
                    options,
                    config,
                    &line_index,
                ),
            );

            diags.extend(meta.into_iter().map(LintMessage::from_diagnostic));
            diags
        }
    };

    // 3. comment-directive meta-rule: compute unused-directive reports from the
    //    full pre-suppression finding set. Emitted *after* suppression so the
    //    directives don't suppress their own reports (upstream's position-based
    //    filter keeps them; our line-based suppression would not).
    let cd = &crate::rules::comment_directive::META;
    let cd_severity = config.resolve_code(cd.name, cd.default_severity);
    let cd_reports: Vec<LintDiagnostic> = if cd_severity != crate::rule::Severity::Off
        && crate::rules::comment_directive::report_unused_enabled(config.options_for(cd.name))
    {
        let findings: Vec<(u32, u32, String)> = diagnostics
            .iter()
            .filter_map(|m| {
                let code = m.diagnostic.code.clone()?;
                let range = m.diagnostic.range?;
                Some((range.start.line, range.start.column, code))
            })
            .collect();
        crate::rules::comment_directive::unused_directive_diagnostics(
            source,
            &line_index,
            &findings,
            cd_severity,
            &rule_is_implemented,
        )
    } else {
        Vec::new()
    };

    // 4. Suppression directives (eslint-disable* + svelte-ignore).
    let suppressions = Suppressions::collect_for(source, &file.to_string_lossy());
    diagnostics.retain(|m| match (&m.diagnostic.code, &m.diagnostic.range) {
        (Some(code), Some(range)) => !suppressions.is_suppressed(code, range.start.line),
        _ => true,
    });

    // 4a. Append the unused-directive reports (not subject to the line-based
    //     suppression above).
    for d in cd_reports {
        diagnostics.push(LintMessage::from_lint(d, file, &line_index));
    }

    // 5. Stable order: by line, then column.
    diagnostics.sort_by_key(|m| {
        m.diagnostic
            .range
            .map_or((0, 0), |r| (r.start.line, r.start.column))
    });
    diagnostics
}

fn module_lint_messages(
    source: &str,
    filename: &str,
    ts: bool,
    config: &LintConfig,
    file: &Path,
    line_index: &LineIndex,
) -> Vec<LintMessage> {
    crate::engine::run_script_rules_module(source, filename, ts, config, Some(file))
        .into_iter()
        .map(|diagnostic| LintMessage::from_lint(diagnostic, file, line_index))
        .collect()
}

fn lint_filename(file: &Path) -> String {
    file.file_name()
        .map(|name| name.to_string_lossy())
        .unwrap_or_default()
        .into_owned()
}

fn effective_config(source: &str, config: &LintConfig) -> LintConfig {
    crate::inline_config::apply(source, config)
}

/// Return raw rule diagnostics.
///
/// Like [`lint_source`] but returns the raw native + script + scope rule
/// [`LintDiagnostic`]s (byte spans, carrying their `fix` and `suggestions`)
/// before conversion to the output diagnostic. The validator/compiler wrap is
/// omitted — only the ported plugin rules emit `svelte/*` codes — and
/// suppression directives are applied. Used by the compat oracle to assert
/// suggestion + fix parity against eslint-plugin-svelte, whose fixtures cover
/// the ported rules only. Editors want [`lint_source_messages`] instead.
#[must_use]
pub fn lint_source_raw(source: &str, file: &Path, config: &LintConfig) -> Vec<LintDiagnostic> {
    let source = rsvelte_core::remove_bom(source);
    let line_index = LineIndex::new(source);
    let filename = file
        .file_name()
        .map(|n| n.to_string_lossy())
        .unwrap_or_default()
        .into_owned();

    let effective = crate::inline_config::apply(source, config);
    let config = &effective;

    let mut diags = match crate::engine::classify_source(&file.to_string_lossy()) {
        crate::engine::SourceKind::Module { ts } => {
            crate::engine::run_script_rules_module(source, &filename, ts, config, Some(file))
        }
        crate::engine::SourceKind::Svelte => {
            svelte_rule_findings(source, file, &filename, config).0
        }
    };

    let suppressions = Suppressions::collect_for(source, &file.to_string_lossy());
    diags.retain(|d| !suppressions.is_suppressed(&d.rule, d.report_line(&line_index)));
    diags.sort_by_key(|d| (d.report_line(&line_index), d.start));
    diags
}

/// Result of an autofix pass.
pub struct FixResult {
    /// The fixed source (== input when nothing applied).
    pub output: String,
    /// How many fixes were applied.
    pub applied: usize,
}

/// Apply native-rule autofixes.
///
/// Apply the autofixes from native rules to `source`. Only non-suppressed
/// findings contribute, and overlapping edits are resolved by taking the
/// earliest and skipping any that overlap it (a second pass picks up the rest).
#[must_use]
pub fn fix_source(source: &str, config: &LintConfig) -> FixResult {
    fix_source_at(source, config, "")
}

/// [`fix_source`] for a named file.
///
/// The name selects the rule set the same way linting does: a `.svelte.js` /
/// `.svelte.ts` module is not a component, and running the component pass over
/// it yields no findings and therefore no fixes — reporting on those files while
/// fixing nothing.
#[must_use]
pub fn fix_source_at(source: &str, config: &LintConfig, filename: &str) -> FixResult {
    // The rules report on BOM-stripped offsets (the parser strips it, as ESLint's
    // `SourceCode` does), so the edits have to be applied to the stripped text —
    // three bytes off otherwise, splicing inside the BOM. ESLint's `--fix` keeps
    // the BOM, so it goes back on the output.
    let had_bom = source.len() != rsvelte_core::remove_bom(source).len();
    let source = rsvelte_core::remove_bom(source);
    let restore_bom = |text: String| {
        if had_bom {
            format!("\u{feff}{text}")
        } else {
            text
        }
    };
    let line_index = LineIndex::new(source);
    let suppressions = Suppressions::collect_for(source, filename);
    let effective = crate::inline_config::apply(source, config);
    let config = &effective;

    // Gather candidate fixes from non-suppressed fixable findings — from both
    // the template-walk rules and the script-AST rules (e.g. the autofix of
    // `$derived.by(() => x)` → `$derived(x)`).
    // Each fix is kept as a unit (Vec<TextEdit>) to mirror ESLint's per-diagnostic
    // atomic conflict resolution: if the merged range of a fix conflicts with the
    // already-consumed range, the ENTIRE fix is dropped.
    // A filesystem-aware rule can still be *disabled* by the environment, so the
    // path is threaded even though no fix depends on it.
    let raw: Vec<LintDiagnostic> = match crate::engine::classify_source(filename) {
        crate::engine::SourceKind::Module { ts } => crate::engine::run_script_rules_module(
            source,
            filename,
            ts,
            config,
            Some(Path::new(filename)),
        ),
        crate::engine::SourceKind::Svelte => run_native_rules(source, "", config, None)
            .into_iter()
            .chain(run_script_rules(source, "", config))
            .collect(),
    };
    let mut fixes: Vec<Vec<TextEdit>> = raw
        .into_iter()
        .filter(|d| !suppressions.is_suppressed(&d.rule, d.report_line(&line_index)))
        .filter_map(|d| d.fix)
        .map(|f| f.edits)
        .collect();

    // Sort fixes by the minimum start offset of their edits (mirrors ESLint's
    // `compareMessagesByFixRange` which sorts by `fix.range[0]`).
    fixes.sort_by_key(|edits| edits.iter().map(|e| e.start).min().unwrap_or(u32::MAX));

    // Greedily select fixes using ESLint's conflict rule: a fix is rejected when
    // its merged-range start <= `last_end` (i.e. `last_end >= fix_start`).
    // Mirrors ESLint's `source-code-fixer.js`: `if (lastPos >= start) { conflict }`,
    // where `lastPos` starts at `Number.NEGATIVE_INFINITY` (no prior end).
    let mut selected: Vec<TextEdit> = Vec::new();
    let mut last_end: Option<u32> = None; // None = NEGATIVE_INFINITY (no prior fix)
    let mut applied: usize = 0; // count of fix-groups actually applied
    for fix_edits in fixes {
        // Skip fix-groups that have no edits at all.
        if fix_edits.is_empty() {
            continue;
        }
        let fix_start = fix_edits.iter().map(|e| e.start).min().unwrap_or(u32::MAX);
        let fix_end = fix_edits.iter().map(|e| e.end).max().unwrap_or(0);
        // Conflict: lastPos >= start (ESLint semantics).
        let conflict = last_end.is_some_and(|le| le >= fix_start);
        if !conflict {
            last_end = Some(fix_end.max(last_end.unwrap_or(0)));
            selected.extend(fix_edits);
            applied += 1; // count per non-conflicting fix-group
        }
    }

    if applied == 0 {
        return FixResult {
            output: restore_bom(source.to_string()),
            applied: 0,
        };
    }

    // Apply right-to-left so earlier offsets stay valid.
    selected.sort_by_key(|e| std::cmp::Reverse(e.start));
    let mut output = source.to_string();
    for e in selected {
        let (s, en) = (e.start as usize, e.end as usize);
        if s <= en
            && en <= output.len()
            && output.is_char_boundary(s)
            && output.is_char_boundary(en)
        {
            output.replace_range(s..en, &e.new_text);
        }
    }
    FixResult {
        output: restore_bom(output),
        applied,
    }
}

/// How many times [`fix_all`] re-lints its own output. ESLint's
/// `Linter.verifyAndFix` uses the same bound.
const MAX_AUTOFIX_PASSES: usize = 10;

/// Apply autofixes until the source stops changing (at most
/// `MAX_AUTOFIX_PASSES` passes), the way `eslint --fix` does.
///
/// [`fix_source`] is deliberately one pass, because that is what upstream's
/// `RuleTester` records in its `*-output.svelte` fixtures. A single pass is not
/// what a user gets from `eslint --fix`, though: two fixes whose ranges conflict
/// leave the second unapplied, and a fix can expose a shape that is itself
/// fixable — so one pass under-fixes exactly where a file needs fixing most.
#[must_use]
pub fn fix_all(source: &str, config: &LintConfig, filename: &str) -> FixResult {
    let mut output = source.to_string();
    let mut applied = 0;
    for _ in 0..MAX_AUTOFIX_PASSES {
        let pass = fix_source_at(&output, config, filename);
        if pass.applied == 0 || pass.output == output {
            break;
        }
        output = pass.output;
        applied += pass.applied;
    }
    FixResult { output, applied }
}

/// Whether `rule_id` names a rule rsvelte actually implements. Used by
/// comment-directive's unused-report to avoid flagging a directive that targets
/// a rule we cannot evaluate (e.g. core `ESLint` `no-undef`) as unused. In
/// non-native builds there is no rule registry, so we conservatively treat every
/// rule as implemented (preserving the prior finding-based approximation).
#[cfg(feature = "native")]
fn rule_is_implemented(rule_id: &str) -> bool {
    use std::sync::LazyLock;
    static IDS: LazyLock<std::collections::HashSet<&'static str>> = LazyLock::new(|| {
        crate::registry::registered_rule_metas()
            .iter()
            .map(|m| m.name)
            .collect()
    });
    IDS.contains(rule_id)
}

#[cfg(not(feature = "native"))]
fn rule_is_implemented(_rule_id: &str) -> bool {
    true
}

/// Lint a file on disk.
///
/// # Errors
///
/// Returns an error when the file cannot be read.
pub fn lint_file(path: &Path, config: &LintConfig) -> std::io::Result<Vec<Diagnostic>> {
    let source = std::fs::read_to_string(path)?;
    let options = CompileOptions {
        filename: Some(path.display().to_string()),
        ..Default::default()
    };
    Ok(lint_source(&source, path, &options, config))
}

/// Lint a file on disk, keeping each finding's `fix` / `suggestions` payload.
///
/// # Errors
///
/// Returns an error when the file cannot be read.
#[cfg(feature = "native")]
pub fn lint_file_messages(
    path: &Path,
    config: &LintConfig,
) -> std::io::Result<Vec<crate::diagnostic::LintMessage>> {
    let source = std::fs::read_to_string(path)?;
    let options = CompileOptions {
        filename: Some(path.display().to_string()),
        ..Default::default()
    };
    Ok(lint_source_messages(&source, path, &options, config))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::rule::Severity;
    use rsvelte_diagnostics::DiagnosticSeverity;
    use std::path::PathBuf;

    fn lint(src: &str, config: &LintConfig) -> Vec<Diagnostic> {
        lint_source(
            src,
            &PathBuf::from("Test.svelte"),
            &CompileOptions::default(),
            config,
        )
    }

    fn codes(diags: &[Diagnostic]) -> Vec<String> {
        diags.iter().filter_map(|d| d.code.clone()).collect()
    }

    #[test]
    fn fix_honours_a_directive_across_a_js_line_separator() {
        // `html-quotes` reports on ESLint's line table, where U+2028 ends a line.
        // The fix path must resolve the directive against that same table, or it
        // rewrites what the report suppressed (and vice versa for U+2029).
        let cfg = LintConfig::from_json_str(
            r#"{ "extends": ["none"], "rules": { "svelte/html-quotes": "warn" } }"#,
        )
        .unwrap();
        let next_line =
            "<!-- eslint-disable-next-line svelte/html-quotes -->\u{2028}<div id=a>t</div>\n";
        assert_eq!(
            fix_source_at(next_line, &cfg, "Test.svelte").output,
            next_line
        );
        let disable_line = "<!-- eslint-disable-line svelte/html-quotes --><div id=a>t</div>\u{2029}<div id=b>t</div>\n";
        assert_eq!(
            fix_source_at(disable_line, &cfg, "Test.svelte").output,
            "<!-- eslint-disable-line svelte/html-quotes --><div id=a>t</div>\u{2029}<div id=\"b\">t</div>\n"
        );
    }

    #[test]
    fn native_no_at_html_tags_fires() {
        let diags = lint("<div>{@html userInput}</div>", &LintConfig::recommended());
        assert!(codes(&diags).contains(&"svelte/no-at-html-tags".to_string()));
    }

    #[test]
    fn native_require_each_key_fires_only_when_unkeyed() {
        let unkeyed = lint(
            "{#each items as item}{item}{/each}",
            &LintConfig::recommended(),
        );
        assert!(codes(&unkeyed).contains(&"svelte/require-each-key".to_string()));

        let keyed = lint(
            "{#each items as item (item.id)}{item}{/each}",
            &LintConfig::recommended(),
        );
        assert!(!codes(&keyed).contains(&"svelte/require-each-key".to_string()));
    }

    #[test]
    fn validator_wrap_surfaces_a11y_warning() {
        // `<img>` without alt → compiler a11y warning, surfaced by the wrap.
        let diags = lint("<img src=\"x.png\" />", &LintConfig::recommended());
        assert!(
            codes(&diags).iter().any(|c| c.starts_with("a11y")),
            "expected an a11y_* code, got {:?}",
            codes(&diags)
        );
    }

    #[test]
    fn config_can_turn_a_rule_off() {
        let cfg = LintConfig::recommended().with_override("svelte/no-at-html-tags", Severity::Off);
        let diags = lint("<div>{@html x}</div>", &cfg);
        assert!(!codes(&diags).contains(&"svelte/no-at-html-tags".to_string()));
    }

    #[test]
    fn config_can_escalate_to_error() {
        let cfg =
            LintConfig::recommended().with_override("svelte/no-at-html-tags", Severity::Error);
        let diags = lint("<div>{@html x}</div>", &cfg);
        let d = diags
            .iter()
            .find(|d| d.code.as_deref() == Some("svelte/no-at-html-tags"))
            .unwrap();
        assert_eq!(d.severity, DiagnosticSeverity::Error);
    }

    #[test]
    fn eslint_disable_next_line_suppresses() {
        let src =
            "<div>\n<!-- eslint-disable-next-line svelte/no-at-html-tags -->\n{@html x}\n</div>";
        let diags = lint(src, &LintConfig::recommended());
        assert!(!codes(&diags).contains(&"svelte/no-at-html-tags".to_string()));
    }

    #[test]
    fn no_at_debug_tags_fires() {
        let diags = lint("{@debug foo}", &LintConfig::recommended());
        assert!(codes(&diags).contains(&"svelte/no-at-debug-tags".to_string()));
    }

    /// Count `svelte/prefer-const` reports whose message names `var`.
    fn prefer_const_hits(diags: &[Diagnostic], var: &str) -> usize {
        let needle = format!("'{var}' is never reassigned");
        diags
            .iter()
            .filter(|d| {
                d.code.as_deref() == Some("svelte/prefer-const") && d.message.contains(&needle)
            })
            .count()
    }

    #[test]
    fn prefer_const_destructuring_assignment_same_scope_reported() {
        let cfg = LintConfig::recommended().with_override("svelte/prefer-const", Severity::Error);
        // `a` declared + assigned-once via destructuring in the SAME function.
        let src = "<script>\nfunction h() {\n  let o = { a: 1 };\n  let a;\n  ({ [\"a\"]: a } = o);\n}\n</script>";
        assert_eq!(prefer_const_hits(&lint(src, &cfg), "a"), 1);
    }

    #[test]
    fn prefer_const_destructuring_cross_scope_not_reported() {
        let cfg = LintConfig::recommended().with_override("svelte/prefer-const", Severity::Error);
        // `a` declared at the top but assigned in a NESTED function — ESLint's
        // scope-aware rule cannot `const` it, so neither do we (no FP).
        let src = "<script>\nlet a;\nfunction f() { ({ [\"a\"]: a } = getX()); }\n</script>";
        assert_eq!(prefer_const_hits(&lint(src, &cfg), "a"), 0);
    }

    #[test]
    fn prefer_const_plain_separate_assignment_reported_at_the_write() {
        let cfg = LintConfig::recommended().with_override("svelte/prefer-const", Severity::Error);
        // ESLint's `canBecomeVariableDeclaration` accepts a plain `let a; a = 1;`
        // whose sole write is a whole statement in the declaration's own scope,
        // and reports at the write, not at the declaration. `Diagnostic` columns
        // are 0-based (SARIF's 2:23 is 2:22 here).
        let src = "<script>\nfunction h() { let a; a = 1; use(a); }\n</script>";
        let diagnostics = lint(src, &cfg);
        assert_eq!(prefer_const_hits(&diagnostics, "a"), 1);
        let range = diagnostics
            .iter()
            .find(|d| d.code.as_deref() == Some("svelte/prefer-const"))
            .and_then(|d| d.range.as_ref())
            .expect("the report carries a range");
        assert_eq!((range.start.line, range.start.column), (2, 22));
    }

    #[test]
    fn prefer_const_plain_separate_assignment_at_script_top_level_not_reported() {
        let cfg = LintConfig::recommended().with_override("svelte/prefer-const", Severity::Error);
        // The instance script's top level is a `SvelteScriptElement` body
        // upstream, not a `Program` body, so the same shape fails
        // `canBecomeVariableDeclaration` there.
        let src = "<script>\nlet a;\na = 1;\nuse(a);\n</script>";
        assert_eq!(prefer_const_hits(&lint(src, &cfg), "a"), 0);
    }

    #[test]
    fn prefer_svelte_reactivity_cross_script_set_mutation() {
        // `new Set()` declared in the module script, mutated in the instance
        // script — only visible when both scripts are analysed together.
        let cfg = LintConfig::recommended()
            .with_override("svelte/prefer-svelte-reactivity", Severity::Error);
        let src = "<script context=\"module\">\n  const elements = new Set();\n</script>\n<script>\n  elements.add(1);\n</script>";
        let hits = lint(src, &cfg)
            .iter()
            .filter(|d| d.code.as_deref() == Some("svelte/prefer-svelte-reactivity"))
            .count();
        assert_eq!(
            hits, 1,
            "exactly one cross-script Set report (no double, no miss)"
        );
    }

    #[test]
    fn block_lang_non_css_lang_reports_once() {
        // A `<style lang="stylus">` parses leniently (so `check_root` fires) but
        // not strictly — the source-scan fallback must NOT also fire (regression
        // test for the double-report fixed by guarding the fallback on the
        // lenient parse).
        let cfg = LintConfig::recommended()
            .with_override("svelte/block-lang", Severity::Error)
            .with_options("svelte/block-lang", serde_json::json!([{ "style": null }]));
        let src = "<style lang=\"stylus\">\ndiv\n  color: red\n</style>";
        let hits = lint(src, &cfg)
            .iter()
            .filter(|d| d.code.as_deref() == Some("svelte/block-lang"))
            .count();
        assert_eq!(hits, 1, "block-lang must report once, not twice");
    }

    #[test]
    fn button_has_type_flags_missing_and_respects_type_and_spread() {
        // `button-has-type` is opt-in (off by default), so enable it.
        let cfg = LintConfig::recommended().with_override("svelte/button-has-type", Severity::Warn);
        let missing = lint("<button>x</button>", &cfg);
        assert!(codes(&missing).contains(&"svelte/button-has-type".to_string()));

        let typed = lint("<button type=\"button\">x</button>", &cfg);
        assert!(!codes(&typed).contains(&"svelte/button-has-type".to_string()));

        let spread = lint("<button {...rest}>x</button>", &cfg);
        assert!(!codes(&spread).contains(&"svelte/button-has-type".to_string()));
    }

    fn messages(src: &str, config: &LintConfig) -> Vec<LintMessage> {
        lint_source_messages(
            src,
            &PathBuf::from("Test.svelte"),
            &CompileOptions::default(),
            config,
        )
    }

    #[test]
    fn messages_pair_the_validator_wrap_with_rule_fixes_in_one_pass() {
        let cfg =
            LintConfig::recommended().with_override("svelte/no-useless-mustaches", Severity::Warn);
        let src = "<img src=\"x.png\" />\n<p>{'foo'}</p>";
        let msgs = messages(src, &cfg);

        // Validator wrap: positioned, no fix payload.
        let a11y = msgs
            .iter()
            .find(|m| {
                m.diagnostic
                    .code
                    .as_deref()
                    .is_some_and(|c| c.starts_with("a11y"))
            })
            .expect("expected an a11y_* diagnostic from the validator wrap");
        assert!(a11y.diagnostic.range.is_some());
        assert!(a11y.span.is_none());
        assert!(a11y.fix.is_none());
        assert!(a11y.suggestions.is_empty());

        // Native rule: fix + byte span, from the same call.
        let mustache = msgs
            .iter()
            .find(|m| m.diagnostic.code.as_deref() == Some("svelte/no-useless-mustaches"))
            .expect("expected the rule finding alongside the validator wrap");
        let (start, end) = mustache.span.expect("rule findings carry a byte span");
        assert_eq!(&src[start as usize..end as usize], "{'foo'}");
        let fix = mustache.fix.as_ref().expect("rule offers an autofix");
        assert_eq!(fix.apply(src), "<img src=\"x.png\" />\n<p>foo</p>");
    }

    #[test]
    fn messages_carry_suggestions() {
        let msgs = messages("<p>{@debug foo}</p>", &LintConfig::recommended());
        let debug = msgs
            .iter()
            .find(|m| m.diagnostic.code.as_deref() == Some("svelte/no-at-debug-tags"))
            .expect("no-at-debug-tags fires");
        assert!(debug.fix.is_none(), "offered as a suggestion, not a fix");
        assert!(!debug.suggestions.is_empty());
    }

    #[test]
    fn messages_reproduce_lint_source_output_verbatim() {
        // Covers ordering, suppression and the unused-directive meta-rule: a
        // source whose findings come from the validator wrap, the template walk,
        // the script walk and a source-scan meta rule at once.
        let cfg = LintConfig::recommended()
            .with_override("svelte/no-useless-mustaches", Severity::Warn)
            .with_override("svelte/valid-compile", Severity::Warn);
        let src = concat!(
            "<script>\n  let a;\n  a = 1;\n</script>\n",
            "<!-- eslint-disable-next-line svelte/no-at-html-tags -->\n",
            "{@html a}\n",
            "<img src=\"x.png\" />\n",
            "{#each items as item}{item}{/each}\n",
            "<p>{'foo'}</p>\n",
            "{@debug a}\n",
        );
        let via_messages: Vec<String> = messages(src, &cfg)
            .iter()
            .map(|m| format!("{:?}", m.diagnostic))
            .collect();
        let direct: Vec<String> = lint(src, &cfg).iter().map(|d| format!("{d:?}")).collect();
        assert_eq!(via_messages, direct);
        assert!(
            !direct.iter().any(|d| d.contains("no-at-html-tags")),
            "the eslint-disable directive still applies"
        );
        assert!(direct.len() > 3, "expected findings from several sources");
    }

    #[test]
    fn no_at_debug_tags_is_not_autofixed() {
        // Upstream offers `{@debug}` removal only as a *suggestion*
        // (`hasSuggestions`), never as a `--fix` autofix, so `fix_source` must
        // leave the tag untouched.
        let res = fix_source("<p>{@debug foo}</p>", &LintConfig::recommended());
        assert_eq!(res.applied, 0);
        assert_eq!(res.output, "<p>{@debug foo}</p>");
    }

    #[test]
    fn fix_skips_suppressed_findings() {
        // `no-useless-mustaches` is a genuine autofix rule; suppressing it on
        // the mustache's line must stop the fix from applying.
        let cfg =
            LintConfig::recommended().with_override("svelte/no-useless-mustaches", Severity::Warn);
        let src = "<!-- eslint-disable-next-line svelte/no-useless-mustaches -->\n<p>{'foo'}</p>";
        let res = fix_source(src, &cfg);
        assert_eq!(res.applied, 0);
        assert_eq!(res.output, src);
    }

    #[test]
    fn fix_is_noop_when_rule_disabled() {
        let cfg =
            LintConfig::recommended().with_override("svelte/no-useless-mustaches", Severity::Off);
        let res = fix_source("<p>{'foo'}</p>", &cfg);
        assert_eq!(res.applied, 0);
    }

    fn fires(src: &str, code: &str) -> bool {
        codes(&lint(src, &LintConfig::recommended()))
            .iter()
            .any(|c| c == code)
    }

    #[test]
    fn no_object_in_text_mustaches_distinguishes_object_from_identifier() {
        // Relies on template expressions being resolved after parse() so
        // `node_type()` is available to the rule.
        assert!(fires("{{ a }}", "svelte/no-object-in-text-mustaches"));
        assert!(fires("{[a]}", "svelte/no-object-in-text-mustaches"));
        assert!(fires("{() => a}", "svelte/no-object-in-text-mustaches"));
        assert!(!fires("{a}", "svelte/no-object-in-text-mustaches"));
    }

    #[test]
    fn no_dupe_else_if_blocks_covers_subset_conditions() {
        assert!(fires(
            "{#if foo}a{:else if foo}b{/if}",
            "svelte/no-dupe-else-if-blocks"
        ));
        // `a || b` then `a` — a is covered by (a || b).
        assert!(fires(
            "{#if a || b}1{:else if a}2{/if}",
            "svelte/no-dupe-else-if-blocks"
        ));
        // Distinct conditions must not fire.
        assert!(!fires(
            "{#if a}1{:else if b}2{:else if c}3{/if}",
            "svelte/no-dupe-else-if-blocks"
        ));
        // A bare `{#if}` nested in an `{:else}` continues the chain (matching
        // eslint-plugin-svelte), so a condition it repeats is flagged.
        assert!(fires(
            "{#if a}1{:else}{#if a}2{/if}{/if}",
            "svelte/no-dupe-else-if-blocks"
        ));
        // …but a genuinely new condition in the nested `{#if}` is fine.
        assert!(!fires(
            "{#if a}1{:else}{#if b}2{/if}{/if}",
            "svelte/no-dupe-else-if-blocks"
        ));
    }

    #[test]
    fn no_dupe_style_properties_static_and_directive() {
        assert!(fires(
            "<div style=\"background: green; background: red\">x</div>",
            "svelte/no-dupe-style-properties"
        ));
        assert!(fires(
            "<div style:background=\"green\" style=\"background: red\">x</div>",
            "svelte/no-dupe-style-properties"
        ));
        assert!(!fires(
            "<div style=\"background: green; color: red\">x</div>",
            "svelte/no-dupe-style-properties"
        ));
    }

    #[test]
    fn button_has_type_options_forbid_and_invalid() {
        // Forbidden valid value via options.
        let cfg = LintConfig::from_json_str(
            r#"{ "rules": { "svelte/button-has-type": ["error", { "submit": false }] } }"#,
        )
        .unwrap();
        let d = lint("<button type=\"submit\">x</button>", &cfg);
        assert!(
            d.iter()
                .any(|d| d.message.contains("forbidden value for button type")),
            "{:?}",
            d.iter().map(|d| &d.message).collect::<Vec<_>>()
        );

        // Invalid value (rule enabled without further options).
        let on = LintConfig::recommended().with_override("svelte/button-has-type", Severity::Error);
        assert!(
            lint("<button type=\"foo\">x</button>", &on)
                .iter()
                .any(|d| d.message.contains("invalid value for button type"))
        );
    }

    #[test]
    fn no_restricted_html_elements_uses_options() {
        let cfg = LintConfig::from_json_str(
            r#"{ "rules": { "svelte/no-restricted-html-elements": ["error", "marquee"] } }"#,
        )
        .unwrap();
        assert!(
            codes(&lint("<marquee>x</marquee>", &cfg))
                .iter()
                .any(|c| c == "svelte/no-restricted-html-elements")
        );
        // Inert without options.
        assert!(!fires(
            "<marquee>x</marquee>",
            "svelte/no-restricted-html-elements"
        ));
    }
}
