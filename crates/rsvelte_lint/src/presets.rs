//! Coexistence helpers (design doc §D course correction 2): a generated
//! "disable these in ESLint" flat-config so exactly one engine owns each rule
//! id, plus a human-readable rule listing for `--list-rules`.

use std::fmt::Write as _;

use serde_json::{Map, Value, json};

use crate::registry::registered_rule_metas;
use crate::rule::{Fixable, RuleCategory, Severity};

/// A flat-config snippet that turns every native-owned `svelte/*` rule **off**
/// in ESLint, so running rsvelte-lint alongside eslint-plugin-svelte doesn't
/// double-report. Emitted by `--print-eslint-config`.
pub fn eslint_disable_config() -> String {
    let mut rules = Map::new();
    for m in registered_rule_metas() {
        rules.insert(m.name.to_string(), json!("off"));
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
    let mut metas = registered_rule_metas();
    metas.sort_by_key(|m| m.name);
    for m in metas {
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
        let cfg = eslint_disable_config();
        let v: Value = serde_json::from_str(&cfg).unwrap();
        let rules = &v[0]["rules"];
        // Every registered rule — template-AST *and* script-AST — must appear
        // in both the human listing and the ESLint-disable config.
        for m in registered_rule_metas() {
            assert!(listing.contains(m.name), "list-rules missing {}", m.name);
            assert_eq!(rules[m.name], "off", "disable-config missing {}", m.name);
        }
    }

    #[test]
    fn rule_names_are_unique() {
        let metas = registered_rule_metas();
        let mut seen = std::collections::HashSet::new();
        for m in &metas {
            assert!(
                seen.insert(m.name),
                "duplicate rule id registered: {}",
                m.name
            );
        }
    }
}
