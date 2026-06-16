//! `svelte/no-companion-module-shadow` — flag a same-name `Foo.svelte.ts` /
//! `Foo.svelte.js` module sitting next to `Foo.svelte`.
//!
//! Such a companion shares the component's TypeScript base name, so
//! `import … from './Foo.svelte'` resolves to the companion instead of the
//! component. rsvelte `svelte-check` drives `tsgo` — a native binary with no
//! module-resolution host hook — so the component's default export and
//! `<script module>` named exports are then reported missing (see
//! [#800](https://github.com/baseballyama/rsvelte/issues/800)). Official
//! `svelte-check` avoids this via a TS language-server plugin
//! (`resolveModuleNameLiterals`); the pattern is otherwise a legitimate Svelte
//! idiom, so this rule is **off by default** (opt-in) and only fires when the
//! file path is known (never in the wasm playground, which has no filesystem).

use std::path::{Path, PathBuf};

use rsvelte_core::ast::template::Root;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-companion-module-shadow",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow a same-name `.svelte.ts`/`.svelte.js` companion next to a `.svelte` component (it shadows `./Foo.svelte` module resolution; see #800)",
    options_schema: None,
};

#[derive(Default)]
pub struct NoCompanionModuleShadow;

impl Rule for NoCompanionModuleShadow {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, _root: &Root) {
        // No filesystem (wasm / in-memory linting) → nothing to inspect.
        let Some(path) = ctx.path() else {
            return;
        };
        // Only `*.svelte` components can be shadowed by a `*.svelte.{ts,js}` sibling.
        if path.extension().and_then(|e| e.to_str()) != Some("svelte") {
            return;
        }
        let stem = path
            .file_name()
            .and_then(|s| s.to_str())
            .unwrap_or("Foo.svelte");
        for ext in ["ts", "js"] {
            let companion = append_extension(path, ext);
            if companion.is_file() {
                let companion_name = companion
                    .file_name()
                    .and_then(|s| s.to_str())
                    .unwrap_or("the companion module");
                ctx.report(
                    0,
                    0,
                    format!(
                        "Same-name companion module `{companion_name}` shadows `./{stem}`: \
                         `import … from './{stem}'` resolves to the companion, not the \
                         component, so the component's default export and `<script module>` \
                         exports are reported missing under tsgo-based svelte-check (#800). \
                         Give the companion a distinct name (e.g. a `*-helpers.ts` module)."
                    ),
                );
                // One diagnostic per component is enough; stop at the first hit.
                break;
            }
        }
    }
}

/// `Foo.svelte` + `ts` → `Foo.svelte.ts`. Appends the extension rather than
/// replacing it (`Path::with_extension` would yield `Foo.ts`).
fn append_extension(svelte_path: &Path, ext: &str) -> PathBuf {
    let mut os = svelte_path.as_os_str().to_os_string();
    os.push(".");
    os.push(ext);
    PathBuf::from(os)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::LintConfig;
    use crate::engine::run_native_rules;
    use std::fs;

    /// A unique scratch dir under the OS temp dir (no `tempfile` dev-dep).
    fn scratch(tag: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!(
            "rsvelte_lint_companion_{tag}_{}",
            std::process::id()
        ));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        dir
    }

    fn enabled() -> LintConfig {
        LintConfig::recommended()
            .with_override("svelte/no-companion-module-shadow", Severity::Error)
    }

    const SRC: &str =
        "<script module lang=\"ts\">export const ATTR = 'x';</script>\n<span>{ATTR}</span>";

    fn fires_at(dir: &Path, svelte_name: &str) -> bool {
        let path = dir.join(svelte_name);
        run_native_rules(SRC, svelte_name, &enabled(), Some(&path))
            .iter()
            .any(|d| d.rule == "svelte/no-companion-module-shadow")
    }

    #[test]
    fn fires_when_ts_companion_present() {
        let dir = scratch("ts");
        fs::write(dir.join("H.svelte"), SRC).unwrap();
        fs::write(dir.join("H.svelte.ts"), "export const useAttr = () => 1;").unwrap();
        assert!(
            fires_at(&dir, "H.svelte"),
            "should fire with a .svelte.ts companion"
        );
        fs::remove_dir_all(&dir).ok();
    }

    #[test]
    fn fires_when_js_companion_present() {
        let dir = scratch("js");
        fs::write(dir.join("H.svelte"), SRC).unwrap();
        fs::write(dir.join("H.svelte.js"), "export const useAttr = () => 1;").unwrap();
        assert!(
            fires_at(&dir, "H.svelte"),
            "should fire with a .svelte.js companion"
        );
        fs::remove_dir_all(&dir).ok();
    }

    #[test]
    fn silent_without_companion() {
        let dir = scratch("none");
        fs::write(dir.join("H.svelte"), SRC).unwrap();
        // A differently-named module is fine.
        fs::write(dir.join("h-helpers.ts"), "export const useAttr = () => 1;").unwrap();
        assert!(
            !fires_at(&dir, "H.svelte"),
            "should not fire without a same-name companion"
        );
        fs::remove_dir_all(&dir).ok();
    }

    #[test]
    fn silent_when_no_path() {
        // wasm / in-memory: no path → never fires even when enabled.
        let hits = run_native_rules(SRC, "H.svelte", &enabled(), None)
            .iter()
            .any(|d| d.rule == "svelte/no-companion-module-shadow");
        assert!(!hits, "should no-op when the file path is unknown");
    }

    #[test]
    fn off_by_default() {
        // Not opted in → not enabled → no fs access, no diagnostic.
        let dir = scratch("default_off");
        fs::write(dir.join("H.svelte"), SRC).unwrap();
        fs::write(dir.join("H.svelte.ts"), "export const x = 1;").unwrap();
        let path = dir.join("H.svelte");
        let hits = run_native_rules(SRC, "H.svelte", &LintConfig::recommended(), Some(&path))
            .iter()
            .any(|d| d.rule == "svelte/no-companion-module-shadow");
        assert!(
            !hits,
            "rule is opt-in; must be silent under the recommended preset"
        );
        fs::remove_dir_all(&dir).ok();
    }
}
