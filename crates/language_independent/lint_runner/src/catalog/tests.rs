use rsvelte_kernel::diagnostics::Severity;

use super::{Definition, EnabledRules, Plugin, check_plugins, find, levels};

#[derive(Debug)]
struct Named(&'static str);

impl Definition for Named {
    fn name(&self) -> &'static str {
        self.0
    }
}

fn plugin(prefix: &'static str, rule: &'static str) -> &'static Plugin<Named> {
    let rules: &'static [&'static Named] =
        Box::leak(Box::new([&*Box::leak(Box::new(Named(rule)))]));
    Box::leak(Box::new(Plugin { prefix, rules }))
}

#[test]
fn plugins_keep_to_their_own_prefix() {
    let good = plugin("org", "org/a");
    assert_eq!(check_plugins("svelte", &[good]), Ok(()));
    assert!(check_plugins("svelte", &[plugin("svelte", "svelte/a")]).is_err());
    assert!(check_plugins("svelte", &[plugin("org", "other/a")]).is_err());
    assert!(check_plugins("svelte", &[plugin("org", "org/")]).is_err());
    assert!(check_plugins("svelte", &[plugin("a/b", "a/b/c")]).is_err());
    assert!(check_plugins("svelte", &[good, plugin("org", "org/b")]).is_err());
}

#[test]
fn built_in_rules_come_before_plugin_rules() {
    static BUILT_IN: Named = Named("org/a");
    let found = find(&[&BUILT_IN], &[plugin("org", "org/a")], "org/a").expect("found");
    assert!(std::ptr::eq(found, &raw const BUILT_IN));
    assert!(find::<Named>(&[], &[], "org/a").is_none());
}

#[test]
fn a_rule_is_enabled_once() {
    let mut rules = EnabledRules::<str, ()>::default();
    rules
        .push("a", Severity::Error, (), "x".into())
        .expect("first");
    rules
        .push("a", Severity::Warning, (), "y".into())
        .expect_err("second");
    assert_eq!(rules.as_slice().len(), 1);
    assert_eq!(rules.as_slice()[0].name(), "a");
}

#[test]
fn levels_turn_on_the_named_rules_in_order() {
    let known: [&Named; 2] = [&Named("a"), &Named("b")];
    let name = |rule: &Named| rule.0;
    let warn = |_: &Named| Severity::Warning;
    let all = levels(&known, name, warn, None).expect("defaults");
    assert_eq!(all.len(), 2);
    assert_eq!(all[0].severity, Severity::Warning);
    let rules = serde_json::from_str(r#"{"b": "error", "a": "off", "missing": 0}"#).expect("rules");
    let on = levels(&known, name, warn, Some(rules)).expect("configured");
    assert_eq!(on.len(), 1);
    assert_eq!((on[0].rule.0, on[0].severity), ("b", Severity::Error));
    let unknown = serde_json::from_str(r#"{"missing": "warn"}"#).expect("rules");
    levels(&known, name, warn, Some(unknown)).expect_err("unknown rule");
    let options = serde_json::from_str(r#"{"a": ["warn", {}]}"#).expect("rules");
    levels(&known, name, warn, Some(options)).expect_err("options");
}
