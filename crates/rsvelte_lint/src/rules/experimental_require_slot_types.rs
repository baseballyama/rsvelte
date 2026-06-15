//! `svelte/experimental-require-slot-types` — require a `$$Slots` type
//! declaration when a TS component renders `<slot>`. Port of the
//! eslint-plugin-svelte rule.
//!
//! A cross-cutting (template + script) check, so it runs as a source-scan
//! meta-path in [`crate::runner::lint_source`]: TS `<script>` + a `<slot>`
//! element + no `interface`/`type $$Slots` ⇒ report at the start of the file
//! (upstream hardcodes `loc { line: 1, column: 1 }`).

use std::path::Path;

use rsvelte_core::svelte_check::diagnostic::{Diagnostic, Position, Range};

use crate::config::LintConfig;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::svelte_scan::{script_declares_type, script_is_ts};
use crate::validator::to_dsev;

pub static META: RuleMeta = RuleMeta {
    name: "svelte/experimental-require-slot-types",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    // Experimental (upstream `recommended: false`) — opt-in.
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "require slot type declaration using the `$$Slots` interface",
    options_schema: None,
};

pub fn diagnostics(source: &str, file: &Path, config: &LintConfig) -> Vec<Diagnostic> {
    let severity = config.resolve_code(META.name, META.default_severity);
    if severity == Severity::Off {
        return Vec::new();
    }
    if !(script_is_ts(source) && has_slot(source) && !script_declares_type(source, "$$Slots")) {
        return Vec::new();
    }
    vec![Diagnostic {
        file: file.to_path_buf(),
        severity: to_dsev(severity),
        range: Some(Range {
            start: Position { line: 1, column: 1 },
            end: Position { line: 1, column: 1 },
        }),
        message: "The component must define the $$Slots interface.".to_string(),
        code: Some(META.name.to_string()),
        source: "svelte",
    }]
}

/// Whether the source contains a `<slot …>` element (tag-name boundary).
fn has_slot(source: &str) -> bool {
    let bytes = source.as_bytes();
    let needle = b"<slot";
    let mut i = 0;
    while i + needle.len() <= bytes.len() {
        if &bytes[i..i + needle.len()] == needle {
            let after = bytes.get(i + needle.len()).copied();
            if matches!(after, Some(c) if c.is_ascii_whitespace() || c == b'>' || c == b'/') {
                return true;
            }
        }
        i += 1;
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn slot_detection() {
        assert!(has_slot("<slot />"));
        assert!(has_slot("<slot name=\"x\" />"));
        assert!(has_slot("a<slot></slot>"));
        assert!(!has_slot("<slotted />"));
        assert!(!has_slot("<div />"));
    }
}
