//! `onabort={o?.events?.onabort}` must print `(…)?.apply(this, $$args)`.
//!
//! Upstream builds the `apply` member on top of the handler's own
//! `ChainExpression`, which terminates the optional chain and forces parens.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn optional_chain_handler_keeps_its_own_chain() {
    let out = client(
        "<script>let { o } = $props();</script><audio onabort={o?.events?.onabort}></audio>",
    );
    assert!(
        out.contains("($$props.o?.events?.onabort)?.apply(this, $$args)"),
        "{out}"
    );
}

/// Legacy `on:` directive whose prop accessor makes the chain root a call.
#[test]
fn legacy_directive_optional_chain_handler_keeps_its_own_chain() {
    let out = compile(
        "<script>export let componentOptions;</script>\
         <audio on:abort={componentOptions?.events?.onabort}></audio>",
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(false),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    assert!(
        out.contains("(componentOptions()?.events?.onabort)?.apply(this, $$args)"),
        "{out}"
    );
}

#[test]
fn non_optional_handler_stays_unparenthesised() {
    let out =
        client("<script>let { o } = $props();</script><audio onabort={o.events.onabort}></audio>");
    assert!(
        out.contains("$$props.o.events.onabort?.apply(this, $$args)"),
        "{out}"
    );
}
