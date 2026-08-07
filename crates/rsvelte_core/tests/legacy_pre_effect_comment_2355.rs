//! A comment inside a `$:` statement body is dropped: upstream rewrites the
//! reactive statement into a synthesized `$.legacy_pre_effect(...)` call, so
//! comments attached to the original statement have no node to re-home onto.
//!
//! Expected outputs are the official Svelte compiler's, verbatim.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(name: &str, source: &str) -> String {
    compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            filename: Some(format!("{name}/index.svelte")),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const EXPECTED: &str = "import 'svelte/internal/disclose-version';\nimport 'svelte/internal/flags/legacy';\nimport * as $ from 'svelte/internal/client';\n\nexport default function Comment_block($$anchor, $$props) {\n\t$.push($$props, false);\n\n\tlet bar = $.mutable_source();\n\n\t$.legacy_pre_effect(() => {}, () => {\n\t\t$.set(bar, []);\n\t});\n\n\t$.legacy_pre_effect_reset();\n\t$.pop();\n}";

#[test]
fn block_comment_inside_a_reactive_block_is_dropped() {
    let source = "<script>\n\tlet bar\n\t$: {\n\t\t/* c */\n\t\tbar = []\n\t}\n</script>\n";
    assert_eq!(client("comment_block", source), EXPECTED);
}

#[test]
fn line_comment_inside_a_reactive_block_is_dropped() {
    let source = "<script>\n\tlet bar\n\t$: {\n\t\t// c\n\t\tbar = []\n\t}\n</script>\n";
    assert_eq!(client("comment_block", source), EXPECTED);
}

/// A `$:` whose predecessor already ends in `;` was recognized before; the ASI
/// shape must reach the same output.
#[test]
fn a_semicolon_terminated_predecessor_behaves_the_same() {
    let source = "<script>\n\tlet bar;\n\t$: {\n\t\t/* c */\n\t\tbar = []\n\t}\n</script>\n";
    assert_eq!(client("comment_block", source), EXPECTED);
}
