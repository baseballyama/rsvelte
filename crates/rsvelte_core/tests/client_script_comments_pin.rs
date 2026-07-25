//! Client codegen keeps `<script>` comments, byte-for-byte with the official
//! compiler.
//!
//! These go through `to_oxc`'s comment coordinate space (`Synth`): the script
//! chunk is re-parsed at its own region of a unified buffer so esrap can place
//! its comments positionally, while the surrounding synthesized nodes carry no
//! location. Before that existed, a comment-bearing chunk bailed to the string
//! codegen — which produced *different* output for every one of these.
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

#[test]
fn leading_script_comment_matches_upstream() {
    let source = "<script>\n\t// leading note\n\tlet x = 1;\n</script>\n\n<p>{x}</p>\n";
    let expected = "import 'svelte/internal/disclose-version';\nimport 'svelte/internal/flags/legacy';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<p></p>`);\n\nexport default function Leading($$anchor) {\n\t// leading note\n\tlet x = 1;\n\n\tvar p = root();\n\n\tp.textContent = '1';\n\t$.append($$anchor, p);\n}";
    assert_eq!(client("leading", source), expected);
}

/// KNOWN DIVERGENCE (#1784): a comment after the script's last statement
/// migrates to the end of the enclosing function body, because the only span
/// bracketing it is the function body's. Upstream flushes it at the next
/// generated node instead (`var // trailing note\n\tp = root();`). The comment is
/// never lost — only repositioned. Pinned so the position cannot drift further
/// unnoticed.
#[test]
fn trailing_script_comment_moves_to_the_body_tail() {
    let source =
        "<script>\n\t// leading note\n\tlet x = 1;\n\t// trailing note\n</script>\n\n<p>{x}</p>\n";
    let actual = client("leading_and_trailing", source);
    assert!(
        actual.contains("\t// leading note\n\tlet x = 1;"),
        "{actual}"
    );
    assert!(
        actual.contains("\t$.append($$anchor, p);\n\t// trailing note\n}"),
        "{actual}"
    );
}

#[test]
fn module_and_instance_script_comments() {
    let source = "<script module>\n\t// module note\n\texport const version = 1;\n</script>\n\n<script>\n\t/* instance note */\n\tlet n = 0;\n</script>\n\n<button onclick={() => n++}>{n}</button>\n";
    let expected = "import 'svelte/internal/disclose-version';\nimport 'svelte/internal/flags/legacy';\nimport * as $ from 'svelte/internal/client';\n\nexport const version = 1;\n\nvar root = $.from_html(`<button> </button>`);\n\nexport default function Module_and_instance($$anchor) {\n\t/* instance note */\n\tlet n = $.mutable_source(0);\n\n\tvar button = root();\n\tvar text = $.child(button, true);\n\n\t$.reset(button);\n\t$.template_effect(() => $.set_text(text, $.get(n)));\n\t$.delegated('click', button, () => $.update(n));\n\t$.append($$anchor, button);\n}\n\n$.delegate(['click']);";
    assert_eq!(client("module_and_instance", source), expected);
}
