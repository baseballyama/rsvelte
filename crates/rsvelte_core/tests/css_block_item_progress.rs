use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// A block item that starts at `{` leaves `parse_rule` with an empty selector,
/// which records an error and consumes nothing — so a caller that loops without
/// a progress guard never terminates. Both callers are covered: an at-rule body
/// (`@media #{…}` splits the prelude at the interpolation's brace, leaving ` {`
/// inside the block) and a nested rule body.
#[test]
fn empty_block_item_selector_terminates_with_the_upstream_error() {
    for (source, code) in [
        (
            "<div class=\"card\"></div>\n<style>\n\t@media #{devices.$break1} {\n\t\t.card {\n\t\t\tbottom: 0.5rem;\n\t\t}\n\t}\n</style>",
            "css_empty_declaration",
        ),
        (
            "<div class=\"a\"></div>\n<style>\n\t.a {\n\t\t{ }\n\t}\n</style>",
            "css_expected_identifier",
        ),
    ] {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let error = compile(
                source,
                CompileOptions {
                    generate,
                    ..Default::default()
                },
            )
            .expect_err("upstream rejects this CSS");
            assert_eq!(error.diagnostic().code.as_deref(), Some(code));
            if code == "css_empty_declaration" {
                assert_eq!(
                    error.diagnostic().span,
                    Some((
                        source.find("devices.$break1").unwrap(),
                        source.find(" {\n\t\t.card").unwrap() + 1,
                    ))
                );
            }
        }
    }
}
