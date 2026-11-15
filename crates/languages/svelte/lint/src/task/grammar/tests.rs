use rsvelte_typescript_tree::TYPESCRIPT_ESLINT_CHECKS;

/// The tree keeps only the errors of these codes that its host lets pass.
#[test]
fn every_thrown_code_is_one_the_tree_keeps() {
    for (code, _) in super::THROWN {
        assert!(TYPESCRIPT_ESLINT_CHECKS.contains(&code), "{code}");
    }
}
