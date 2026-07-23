//! Regression test for issue #1697.
//!
//! The `hash` argument handed to a user `cssHash` callback (`CssHashInput.hash`)
//! must be the raw digest, without the `svelte-` prefix — matching upstream's
//! default `cssHash` (`svelte-${hash(...)}`), where the prefix is applied by the
//! default implementation, not carried by `hash`. Before the fix this field
//! reproduced the fully-prefixed scope class, so any consumer trusting it would
//! double-prefix.

use std::sync::{Arc, Mutex};

use rsvelte_core::{
    CompileOptions, GenerateMode, compile,
    compiler::{CssHashInput, CssMode},
};

#[test]
fn css_hash_callback_receives_unprefixed_raw_digest() {
    let seen: Arc<Mutex<Option<String>>> = Arc::new(Mutex::new(None));
    let seen_cb = Arc::clone(&seen);

    let css_hash = Arc::new(move |input: &CssHashInput| -> String {
        let raw = (input.hash)(&input.css);
        *seen_cb.lock().unwrap() = Some(raw.clone());
        format!("x-{raw}")
    });

    let result = compile(
        "<h1>hi</h1><style>h1{color:red}</style>",
        CompileOptions {
            filename: Some("App.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::Injected,
            runes: Some(true),
            css_hash: Some(css_hash),
            ..Default::default()
        },
    )
    .expect("compile");

    let raw = seen.lock().unwrap().clone().expect("callback ran");
    assert!(
        !raw.starts_with("svelte-"),
        "hash arg must be the raw digest, not the svelte- scope class; got {raw}"
    );
    assert!(!raw.is_empty(), "raw digest must be non-empty");

    // The callback's returned scope class must reach the output verbatim.
    let scope = format!("x-{raw}");
    assert!(
        result.js.code.contains(&scope),
        "custom scope class {scope} must appear in output"
    );
}
