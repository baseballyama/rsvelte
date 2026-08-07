//! CRLF sources must compile identically to their LF twin, except inside
//! elements where whitespace is significant.
//!
//! The whitespace predicates are ports of official's `/[^ \t\r\n]/`,
//! `/^[ \t\r\n]+/` and `/[ \t\r\n]+$/`, so `\r` is part of their contract. No
//! test reached that: every existing input is LF-only, and dropping `\r` from
//! all twelve `matches!` whitespace sets in `crates/rsvelte_core/src` left the
//! entire unit-test suite green. It stops being green here — without `\r` a
//! CRLF text node is no longer whitespace-only, so inter-element whitespace
//! leaks into the template verbatim instead of collapsing to one space.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const SOURCE: &str = "<script>\n\tlet name = 'world';\n</script>\n\n<div>\n\t<span>{name}</span>\n\t\n\t<b>a</b>\n\t<i>b</i>\n</div>\n\n<pre>\n  keep   these\n  spaces\n</pre>\n";

fn compile_to_js(source: &str, generate: GenerateMode) -> String {
    let options = CompileOptions {
        filename: Some("App.svelte".to_string()),
        generate,
        ..Default::default()
    };
    compile(source, options)
        .unwrap_or_else(|e| panic!("compile failed: {e:?}"))
        .js
        .code
}

/// `<pre>` keeps its carriage returns, so the two outputs differ only by the
/// `\r`s inside it — stripping those must make them identical.
#[test]
fn crlf_matches_its_lf_twin_apart_from_significant_whitespace() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let lf = compile_to_js(SOURCE, generate);
        let crlf = compile_to_js(&SOURCE.replace('\n', "\r\n"), generate);

        assert!(
            crlf.contains('\r'),
            "the CRLF input must still reach the output via <pre>, or this \
             test is not exercising carriage returns at all"
        );
        assert_eq!(
            crlf.replace('\r', ""),
            lf,
            "{generate:?}: CRLF and LF sources must compile to the same code \
             once the <pre> carriage returns are removed"
        );
    }
}

/// The whitespace-only text nodes between `</span>`, `<b>` and `<i>` collapse
/// to a single space. With `\r` missing from the predicates they do not.
#[test]
fn crlf_whitespace_only_text_nodes_still_collapse() {
    let crlf = compile_to_js(&SOURCE.replace('\n', "\r\n"), GenerateMode::Client);
    assert!(
        crlf.contains("<b>a</b> <i>b</i>"),
        "CRLF whitespace between elements must collapse to one space; got:\n{crlf}"
    );
}
