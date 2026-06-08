//! Coexistence helpers (design doc §D course correction 2): a generated
//! "disable these in ESLint" flat-config so exactly one engine owns each rule
//! id, plus a human-readable rule listing for `--list-rules`.

use std::fmt::Write as _;

use serde_json::{Map, Value, json};

use crate::registry::all_rules;
use crate::rule::{Fixable, RuleCategory, Severity};

/// A flat-config snippet that turns every native-owned `svelte/*` rule **off**
/// in ESLint, so running rsvelte-lint alongside eslint-plugin-svelte doesn't
/// double-report. Emitted by `--print-eslint-config`.
pub fn eslint_disable_config() -> String {
    let mut rules = Map::new();
    for r in all_rules() {
        rules.insert(r.meta().name.to_string(), json!("off"));
    }
    let doc = json!([{
        "name": "rsvelte-lint/disable-overlapping",
        "rules": Value::Object(rules),
    }]);
    serde_json::to_string_pretty(&doc).unwrap_or_else(|_| "[]".to_string())
}

/// A human-readable listing of the native rules and their metadata.
pub fn list_rules() -> String {
    let mut out = String::new();
    for r in all_rules() {
        let m = r.meta();
        let _ = writeln!(
            out,
            "{}  [{}{}{}]\n    {}",
            m.name,
            category_label(m.category),
            severity_suffix(m.default_severity),
            fixable_suffix(m.fixable),
            m.docs,
        );
        if m.options_schema.is_some() {
            let _ = writeln!(out, "    (options)");
        }
    }
    out
}

fn category_label(c: RuleCategory) -> &'static str {
    match c {
        RuleCategory::Correctness => "correctness",
        RuleCategory::A11y => "a11y",
        RuleCategory::Style => "style",
        RuleCategory::Formatting => "formatting",
    }
}

fn severity_suffix(s: Severity) -> &'static str {
    match s {
        Severity::Error => ", error",
        Severity::Warn => ", warn",
        Severity::Off => ", off",
    }
}

fn fixable_suffix(f: Fixable) -> &'static str {
    match f {
        Fixable::No => "",
        Fixable::Code => ", fixable",
        Fixable::Suggestion => ", suggestion",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn disable_config_is_valid_json_and_turns_rules_off() {
        let cfg = eslint_disable_config();
        let v: Value = serde_json::from_str(&cfg).unwrap();
        let rules = &v[0]["rules"];
        assert_eq!(rules["svelte/no-at-html-tags"], "off");
        assert_eq!(rules["svelte/no-dupe-else-if-blocks"], "off");
    }

    #[test]
    fn list_includes_every_rule() {
        let listing = list_rules();
        for r in all_rules() {
            assert!(listing.contains(r.meta().name), "missing {}", r.meta().name);
        }
    }
}
