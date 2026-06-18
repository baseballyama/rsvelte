//! Top-level lint entry points: parse + analyze (validator wrap) + native rule
//! walk + suppression, merged into one sorted diagnostic list.

use std::path::Path;

use rsvelte_core::CompileOptions;
use rsvelte_core::svelte_check::diagnostic::Diagnostic;

use crate::config::LintConfig;
use crate::diagnostic::{LintDiagnostic, TextEdit};
use crate::engine::{run_native_rules, run_script_rules, run_script_rules_with_path};
use crate::line_index::LineIndex;
use crate::suppression::Suppressions;

/// Lint a single source string. `file` is used for diagnostic paths and
/// filename-gated rules (e.g. SvelteKit route file detection).
pub fn lint_source(
    source: &str,
    file: &Path,
    options: &CompileOptions,
    config: &LintConfig,
) -> Vec<Diagnostic> {
    let line_index = LineIndex::new(source);
    let filename = file
        .file_name()
        .map(|n| n.to_string_lossy())
        .unwrap_or_default()
        .into_owned();

    // Layer any inline `/* eslint <rule>: … */` config in this file on top of the
    // base config (ESLint per-file inline-config semantics). No-op when absent.
    let effective = crate::inline_config::apply(source, config);
    let config = &effective;

    let mut diagnostics = match crate::engine::classify_source(&file.to_string_lossy()) {
        // A standalone JS/TS module file (`*.svelte.js` / `*.svelte.ts` / `*.js`
        // / `*.ts`): no template or compiler-warning pass — only script-AST rules
        // run, over the whole-file module program.
        crate::engine::SourceKind::Module { ts } => {
            let mut diags = Vec::new();
            for d in crate::engine::run_script_rules_module(source, &filename, ts, config) {
                diags.push(d.to_output(file, &line_index));
            }
            diags
        }
        crate::engine::SourceKind::Svelte => {
            // 1. Validator wrap — compiler warnings/errors/a11y (config applied inside).
            let mut diags = crate::validator::validator_diagnostics(source, file, options, config);

            // 2. Native rule engine — single shared DFS over the template AST.
            for d in run_native_rules(source, &filename, config, Some(file)) {
                diags.push(d.to_output(file, &line_index));
            }

            // 2a. Script-AST rules — walk the `<script>` ESTree program(s).
            // Thread the full path so path-gated rules (e.g. SvelteKit route
            // file detection) can check whether the file lives under src/routes.
            for d in run_script_rules_with_path(source, &filename, config, Some(file)) {
                diags.push(d.to_output(file, &line_index));
            }

            // 2b. Scope-based rules (Wave 2). No-op until scope rules ship; this
            // skips the analysis pass entirely when none are enabled.
            for d in crate::scope::scope_diagnostics(source, config) {
                diags.push(d.to_output(file, &line_index));
            }

            // 2c. valid-compile (opt-in): surface compiler warnings/errors under
            // the single `svelte/valid-compile` id. Off by default, so this is a
            // no-op (and skips the extra compile) unless the rule is enabled.
            diags.extend(crate::rules::valid_compile::valid_compile_diagnostics(
                source, file, options, config,
            ));

            // 2d. valid-style-parse: report `<style>` blocks with an unsupported
            // `lang`. A source scan, so it runs even when the (invalid) style
            // body would otherwise abort the main parse.
            diags.extend(
                crate::rules::valid_style_parse::valid_style_parse_diagnostics(
                    source, file, config,
                ),
            );

            // 2d2. block-lang fallback: for files the Svelte parser can't fully
            // parse (e.g. unknown `<style lang="…">` bodies or invalid TypeScript),
            // the normal `check_root` path is skipped. Run a source-scan instead
            // to catch `<script lang="…">` / `<style lang="…">` violations.
            diags.extend(
                crate::rules::block_lang::block_lang_source_scan_diagnostics(source, file, config),
            );

            // 2e. Cross-cutting (template + script) source-scan meta-rules.
            diags.extend(crate::rules::experimental_require_slot_types::diagnostics(
                source, file, config,
            ));
            diags.extend(
                crate::rules::experimental_require_strict_events::diagnostics(source, file, config),
            );
            diags.extend(crate::rules::require_event_dispatcher_types::diagnostics(
                source, file, config,
            ));
            diags.extend(crate::rules::require_event_prefix::diagnostics(
                source, file, config,
            ));
            diags.extend(crate::rules::no_unused_props::diagnostics(
                source, file, config,
            ));
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
            .filter_map(|d| {
                let code = d.code.clone()?;
                let range = d.range?;
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
    let suppressions = Suppressions::collect(source);
    diagnostics.retain(|d| match (&d.code, &d.range) {
        (Some(code), Some(range)) => !suppressions.is_suppressed(code, range.start.line),
        _ => true,
    });

    // 4a. Append the unused-directive reports (not subject to the line-based
    //     suppression above).
    for d in cd_reports {
        diagnostics.push(d.to_output(file, &line_index));
    }

    // 5. Stable order: by line, then column.
    diagnostics.sort_by_key(|d| {
        d.range
            .map(|r| (r.start.line, r.start.column))
            .unwrap_or((0, 0))
    });
    diagnostics
}

/// Like [`lint_source`] but returns the raw native + script + scope rule
/// [`LintDiagnostic`]s (byte spans, carrying their `fix` and `suggestions`)
/// before conversion to the output diagnostic. The validator/compiler wrap is
/// omitted — only the ported plugin rules emit `svelte/*` codes — and
/// suppression directives are applied. Used by the compat oracle to assert
/// suggestion + fix parity, which the line/column output type cannot express.
pub fn lint_source_raw(source: &str, file: &Path, config: &LintConfig) -> Vec<LintDiagnostic> {
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
            crate::engine::run_script_rules_module(source, &filename, ts, config)
        }
        crate::engine::SourceKind::Svelte => {
            let mut d = run_native_rules(source, &filename, config, Some(file));
            d.extend(run_script_rules_with_path(
                source,
                &filename,
                config,
                Some(file),
            ));
            d.extend(crate::scope::scope_diagnostics(source, config));
            d
        }
    };

    let suppressions = Suppressions::collect(source);
    diags.retain(|d| !suppressions.is_suppressed(&d.rule, line_index.line(d.start)));
    diags.sort_by_key(|d| (line_index.line(d.start), d.start));
    diags
}

/// Result of an autofix pass.
pub struct FixResult {
    /// The fixed source (== input when nothing applied).
    pub output: String,
    /// How many fixes were applied.
    pub applied: usize,
}

/// Apply the autofixes from native rules to `source`. Only non-suppressed
/// findings contribute, and overlapping edits are resolved by taking the
/// earliest and skipping any that overlap it (a second pass picks up the rest).
pub fn fix_source(source: &str, config: &LintConfig) -> FixResult {
    let line_index = LineIndex::new(source);
    let suppressions = Suppressions::collect(source);
    let effective = crate::inline_config::apply(source, config);
    let config = &effective;

    // Gather candidate fixes from non-suppressed fixable findings — from both
    // the template-walk rules and the script-AST rules (e.g. the autofix of
    // `$derived.by(() => x)` → `$derived(x)`).
    // Each fix is kept as a unit (Vec<TextEdit>) to mirror ESLint's per-diagnostic
    // atomic conflict resolution: if the merged range of a fix conflicts with the
    // already-consumed range, the ENTIRE fix is dropped.
    // Fixes never come from filesystem-aware rules, so no path is threaded here.
    let mut fixes: Vec<Vec<TextEdit>> = run_native_rules(source, "", config, None)
        .into_iter()
        .chain(run_script_rules(source, "", config))
        .filter(|d| !suppressions.is_suppressed(&d.rule, line_index.line(d.start)))
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
            output: source.to_string(),
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
    FixResult { output, applied }
}

/// Whether `rule_id` names a rule rsvelte actually implements. Used by
/// comment-directive's unused-report to avoid flagging a directive that targets
/// a rule we cannot evaluate (e.g. core ESLint `no-undef`) as unused. In
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
pub fn lint_file(path: &Path, config: &LintConfig) -> std::io::Result<Vec<Diagnostic>> {
    let source = std::fs::read_to_string(path)?;
    let options = CompileOptions {
        filename: Some(path.display().to_string()),
        ..Default::default()
    };
    Ok(lint_source(&source, path, &options, config))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::rule::Severity;
    use rsvelte_core::svelte_check::diagnostic::DiagnosticSeverity;
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
    fn prefer_const_plain_separate_assignment_not_reported() {
        let cfg = LintConfig::recommended().with_override("svelte/prefer-const", Severity::Error);
        // A plain (non-destructuring) `let a; a = 1;` is never reported by ESLint.
        let src = "<script>\nfunction h() { let a; a = 1; use(a); }\n</script>";
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
