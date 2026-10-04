mod support;

#[test]
fn supported_rules_match_the_configured_oracle() {
    support::verify_strict();
}
