//! `svelte/no-navigation-without-resolve` was a template-only rule, so a
//! `.svelte.(js|ts)` module — a separate entry point through
//! `run_script_rules_module` — never ran it at all. Its sibling
//! `no-goto-without-base` has carried both halves since it shipped.

use rsvelte_lint::line_index::LineIndex;
use rsvelte_lint::{LintConfig, Severity, lint_source_raw};
use std::path::Path;

const RULE: &str = "svelte/no-navigation-without-resolve";

fn findings(source: &str, file: &str) -> Vec<(u32, u32)> {
    let cfg = LintConfig::empty().with_override(RULE, Severity::Error);
    let li = LineIndex::new(source);
    let mut out: Vec<(u32, u32)> = lint_source_raw(source, Path::new(file), &cfg)
        .into_iter()
        .filter(|d| d.rule == RULE)
        .map(|d| {
            let (line, col) = li.position(d.start);
            (line, col + 1)
        })
        .collect();
    out.sort_unstable();
    out
}

const MODULE_BODY: &str = "import { goto } from '$app/navigation';\n\
export function bad() {\n\
\treturn goto('/module-bad');\n\
}\n";

#[test]
fn a_module_file_is_linted() {
    assert_eq!(findings(MODULE_BODY, "nav.svelte.js").len(), 1);
    assert_eq!(findings(MODULE_BODY, "nav.svelte.ts").len(), 1);
}

#[test]
fn the_same_body_in_a_component_is_reported_once() {
    // The rule is registered twice (template + script). A component must not
    // collect the finding from both passes, which is the failure mode the
    // module hook could have introduced.
    let component = format!("<script>\n{MODULE_BODY}</script>\n");
    assert_eq!(findings(&component, "Comp.svelte").len(), 1);
}

const SIBLING: &str = "svelte/no-goto-without-base";

fn findings_of(rule: &str, source: &str, file: &str) -> usize {
    let cfg = LintConfig::empty().with_override(rule, Severity::Error);
    lint_source_raw(source, Path::new(file), &cfg)
        .into_iter()
        .filter(|d| d.rule == rule)
        .count()
}

#[test]
fn the_module_hook_runs_on_exactly_the_files_its_sibling_does() {
    // Which files a script rule runs on is `classify_source`, asked once per
    // rule — so the answer drifts per rule unless something compares them. The
    // oracle here is the other port, which cannot see a fault both share; the
    // absolute answers are pinned by the two tests above (`.svelte.js` and
    // `.svelte.ts` report, a component reports once) and, for which files reach
    // a rule at all, by `is_lintable` in `main.rs`.
    for file in ["nav.svelte.js", "nav.svelte.ts", "nav.js", "nav.ts"] {
        assert_eq!(
            findings_of(RULE, MODULE_BODY, file) > 0,
            findings_of(SIBLING, MODULE_BODY, file) > 0,
            "{file}: the two module hooks disagree about whether they run"
        );
    }
}

#[test]
fn a_resolved_url_in_a_module_is_allowed() {
    // The accepting control: without it, a hook that reported unconditionally
    // would pass every assertion above.
    let ok = "import { goto } from '$app/navigation';\n\
import { resolve } from '$app/paths';\n\
export function fine() {\n\
\treturn goto(resolve('/ok'));\n\
}\n";
    assert!(findings(ok, "nav.svelte.js").is_empty());
}
