use super::CompileWarnings;

#[test]
fn the_codes_come_from_the_svelte_the_oracle_installs() {
    let package = include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../../../tools/oracle/package.json"
    ));
    let pinned = package
        .split("\"svelte\": \"")
        .nth(1)
        .and_then(|rest| rest.split('"').next())
        .expect("the oracle pins svelte");
    let header = include_str!("vendor/codes.rs")
        .lines()
        .next()
        .expect("a header");
    assert_eq!(
        header.strip_prefix("// svelte "),
        Some(pinned),
        "the oracle installs svelte {pinned}; run `node tools/oracle/oracle.ts warnings`"
    );
}

#[test]
fn every_checked_code_is_a_svelte_code() {
    for code in CompileWarnings::CODES {
        assert!(CompileWarnings::SVELTE_CODES.contains(code), "{code}");
    }
    assert!(CompileWarnings::SVELTE_CODES.contains(&"ownership_invalid_mutation"));
}
