//! `{@const}` errors upstream raises only in another mode, where the code it emits without them
//! throws.

use rsvelte_svelte_compile::Target;

use super::compile_at;

#[test]
fn const_tag_errors_are_raised_where_upstream_raises_them() {
    for (source, expected) in [
        // Upstream checks this outside runes mode.
        (
            "<script>let x = 1;</script>{#if x}{@const a = b}{@const b = c}{@const c = b}{a}{/if}"
                .to_owned(),
            Some(("const_tag_cycle", (34, 48))),
        ),
        (
            "<script>let x = 1;</script>{#if x}{@const a = 1}{@const b = a}{b}{/if}".to_owned(),
            None,
        ),
    ] {
        for target in [Target::Client, Target::Server] {
            let actual = compile_at(&source, target).err();
            let actual = actual.as_ref().map(|(code, span)| (code.as_str(), *span));
            match expected {
                Some(expected) => assert_eq!(actual, Some(expected), "{source} on {target:?}"),
                None => assert!(
                    !actual.is_some_and(|(code, _)| code.starts_with("const_tag")),
                    "{source} on {target:?}: {actual:?}"
                ),
            }
        }
    }
}
