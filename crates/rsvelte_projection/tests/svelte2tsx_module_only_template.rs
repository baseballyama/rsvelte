//! #3307: a component whose only script is `<script module>` kept its template
//! whitespace blanked, so the generated template arrow lost the newline (and,
//! with two whitespace runs around the script, one of them entirely).
//!
//! Expectations were measured against the official `svelte2tsx` from
//! `submodules/language-tools` on the same sources.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn convert(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "Probe.svelte".to_string(),
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx ok").code
}

#[test]
fn a_whitespace_only_template_keeps_its_text_in_the_arrow() {
    for (src, body) in [
        ("<script module>void x;</script>\n", "\n"),
        ("<script module>void x;</script>\n\n\n", "\n\n\n"),
        ("<script module>void x;</script>   ", "   "),
        ("<script module>void x;</script>\n\t\n", "\n\t\n"),
        ("<script module>void x;</script>", ""),
    ] {
        let code = convert(src);
        assert!(
            code.contains(&format!("async () => {{{body}}};")),
            "{src:?} must keep its template text:\n{code}"
        );
    }
}

/// Whitespace on BOTH sides of the module script is two runs, and only the
/// trailing one used to be blanked — so the arrow held one newline instead of
/// two.
#[test]
fn whitespace_before_and_after_the_module_script_both_survive() {
    let code = convert("\n<script module>void x;</script>\n");
    assert!(code.contains("async () => {\n\n};"), "{code}");

    let code = convert("<style>a{color:red}</style>\n<script module>void x;</script>\n");
    assert!(code.contains("async () => {\n\n};"), "{code}");
}

/// Negative controls: a content-bearing template node and an instance script
/// both already worked, and must keep working.
#[test]
fn a_content_bearing_template_and_an_instance_script_are_unchanged() {
    let code = convert("<script module>void x;</script>\n<div></div>\n");
    assert!(
        code.contains("async () => {\n { svelteHTML.createElement(\"div\", {}); }\n};"),
        "{code}"
    );

    let code = convert("<script>void x;</script>\n");
    assert!(code.contains("async () => {\n};"), "{code}");
}
