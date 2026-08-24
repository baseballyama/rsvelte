use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// Upstream's `b.key` tests `/^[a-zA-Z_$][a-zA-Z_$0-9]*$/`, which is ASCII-only,
/// so a prop whose name contains a non-ASCII letter is emitted as a **quoted**
/// key even though it is a legal JS identifier. Two of rsvelte's three copies of
/// that predicate used Rust's Unicode-aware `char::is_alphabetic`, so the key
/// came out bare. The corpus gate cannot see it: oxfmt's `quote-props: as-needed`
/// unquotes the official side back to the rsvelte spelling.
#[test]
fn a_non_ascii_prop_name_is_a_quoted_accessor_key() {
    let source = "<script>\n\
                  \timport Child from './Child.svelte';\n\
                  \texport let forciblyСollapsed = false;\n\
                  </script>\n\n\
                  <Child {forciblyСollapsed} />\n";

    let code = compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code;

    assert!(
        code.contains("get 'forciblyСollapsed'()"),
        "expected a quoted accessor key for a Cyrillic-bearing prop name, got:\n{code}"
    );
}
