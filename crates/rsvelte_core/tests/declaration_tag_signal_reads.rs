//! A declaration-tag signal keeps its `$.get` reads when another binding in the
//! component has the same name. Every expected line is the official compiler's
//! client output for `SOURCE`.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const SOURCE: &str = include_str!(
    "../../../compatibility/pattern-corpus/issues/declaration-tag-signal-shares-a-name.svelte"
);

#[test]
fn reads_updates_and_props_go_through_the_signal() {
    let result = compile(
        SOURCE,
        CompileOptions {
            filename: Some("declaration-tag-signal-shares-a-name.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("official compiles it");
    let code = result.js.code;
    for line in [
        "const name = $.derived(() => $.get(selected));",
        "let count = $.state(1);",
        "const label = $.derived(() => $.get(name) + '!');",
        "return $.get(name);",
        "$.template_effect(() => $.set_text(text_1, `${$.get(count) ?? ''} ${$.get(label) ?? ''}`));",
        "$.delegated('click', button_1, () => $.update(count));",
    ] {
        assert!(code.contains(line), "missing `{line}` in\n{code}");
    }
}
