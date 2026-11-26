//! acorn fails at the token after a node of a template part, which oxc read to end the part.

use rsvelte_svelte_syntax::parse::parse;

#[test]
fn acorn_fails_at_the_token_after_the_node() {
    // What svelte 5.57.3 reports, in bytes of each source.
    for (source, at) in [
        ("{const x}", 8),
        ("{const [a]}", 10),
        ("{const {a} }", 11),
        ("<script lang=\"ts\"></script>{const x }", 36),
        ("{x = class { readonly m() {} }}", 22),
        ("{x = class { public a = 1 }}", 20),
        ("{x = class { declare a }}", 21),
        ("{(class { private m() {} })}", 18),
    ] {
        let error = parse(source).expect_err(source);
        assert_eq!(
            error.code, "js_parse_error",
            "{source:?}: svelte says so at {at}"
        );
    }
}
