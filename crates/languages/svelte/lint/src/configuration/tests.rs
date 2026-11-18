use super::*;

fn plugin(prefix: &'static str, rules: &'static [&'static RuleDefinition]) -> &'static LintPlugin {
    Box::leak(Box::new(LintPlugin { prefix, rules }))
}

fn rule(name: &'static str) -> &'static RuleDefinition {
    Box::leak(Box::new(RuleDefinition {
        name,
        files: Files::Components,
        configure: |_| Err("unused".to_owned()),
    }))
}

#[test]
fn plugins_keep_to_their_own_prefix() {
    let good = plugin("org", Box::leak(Box::new([rule("org/a")])));
    assert_eq!(check_plugins(&[good]), Ok(()));
    let svelte = plugin(
        "svelte",
        Box::leak(Box::new([rule("svelte/button-has-type")])),
    );
    assert!(check_plugins(&[svelte]).is_err());
    let outside = plugin("org", Box::leak(Box::new([rule("other/a")])));
    assert!(check_plugins(&[outside]).is_err());
    let bare = plugin("org", Box::leak(Box::new([rule("org/")])));
    assert!(check_plugins(&[bare]).is_err());
    let again = plugin("org", Box::leak(Box::new([rule("org/b")])));
    assert!(check_plugins(&[good, again]).is_err());
}
