use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// Upstream's `b.key` tests `/^[a-zA-Z_$][a-zA-Z_$0-9]*$/`, which is ASCII-only,
/// so a prop whose name contains a non-ASCII letter is emitted as a **quoted**
/// key even though it is a legal JS identifier. Two of rsvelte's three copies of
/// that predicate used Rust's Unicode-aware `char::is_alphabetic`, so the key
/// came out bare. The corpus gate cannot see it: oxfmt's `quote-props: as-needed`
/// unquotes the official side back to the rsvelte spelling.
///
/// One builder is not the predicate: this file asserted only the accessor
/// spelling, and `b::prop` — every plain `init` property — kept the
/// Unicode-aware copy until the assertion below was added.
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

/// The accessor spelling above comes from `b::getter`; a plain `init` property
/// comes from `b::prop`, which is a different call site of the same predicate.
#[test]
fn a_non_ascii_prop_name_is_a_quoted_init_key() {
    let source = "<script>\n\
                  \timport Child from './Child.svelte';\n\
                  </script>\n\n\
                  <Child forciblyСollapsed asciiOnly />\n";

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
        code.contains("'forciblyСollapsed':"),
        "expected a quoted init key for a Cyrillic-bearing prop name, got:\n{code}"
    );
    // An ASCII sibling in the same object stays bare, so the assertion above
    // cannot pass by quoting every key.
    assert!(
        code.contains("asciiOnly:"),
        "expected an ASCII sibling key to stay bare, got:\n{code}"
    );
}
