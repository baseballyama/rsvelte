//! `svelte/experimental-require-strict-events` — require a TS component to opt
//! into strict event typing via the `strictEvents` attribute or a `$$Events`
//! type declaration. Port of the eslint-plugin-svelte rule (Svelte 3/4 feature).
//!
//! Cross-cutting (script attribute + script type declaration), so it runs as a
//! source-scan meta-path in [`crate::runner::lint_source`]. Reported at the
//! `<script>` tag when a TS component has neither `strictEvents` nor `$$Events`.

use std::path::Path;

use rsvelte_core::svelte_check::diagnostic::Diagnostic;

use crate::config::LintConfig;
use crate::line_index::LineIndex;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::svelte_scan::{has_attr, open_tag_is_ts, script_blocks, script_declares_type};
use crate::validator::{range_from_byte, to_dsev};

pub static META: RuleMeta = RuleMeta {
    name: "svelte/experimental-require-strict-events",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "require the strictEvents attribute on `<script>` tags",
    options_schema: None,
};

pub fn diagnostics(source: &str, file: &Path, config: &LintConfig) -> Vec<Diagnostic> {
    let severity = config.resolve_code(META.name, META.default_severity);
    if severity == Severity::Off {
        return Vec::new();
    }
    // Upstream's `SvelteScriptElement` handler overwrites `isTs`/`hasAttribute`
    // on every visit, so the *last* `<script>` (in source order) decides both.
    // `hasDeclaredEvents` is set by any `$$Events` declaration across scripts.
    let blocks = script_blocks(source);
    let Some(last) = blocks.last() else {
        return Vec::new();
    };
    if !open_tag_is_ts(&last.open_tag_attrs) {
        return Vec::new();
    }
    let has_strict = has_attr(&last.open_tag_attrs, "strictEvents");
    if has_strict || script_declares_type(source, "$$Events") {
        return Vec::new();
    }
    let li = LineIndex::new(source);
    vec![Diagnostic {
        file: file.to_path_buf(),
        severity: to_dsev(severity),
        range: range_from_byte(&li, last.tag_start as u32, last.tag_start as u32),
        message: "The component must have the strictEvents attribute on its <script> tag or it must define the $$Events interface.".to_string(),
        code: Some(META.name.to_string()),
        source: "svelte",
    }]
}
