//! Regression note for the store-subscription cluster (issue #461).
//!
//! Most findings in this cluster require routing detection through a real
//! AST walk after TypeScript strip (the issue itself suggests this); doing
//! that is a coordinated rewrite of the legacy store-subscription detection
//! and rewriting passes, on top of the M-005 byte-index fix that already
//! shipped.
//!
//! - **M-005** char-vs-byte index in subscription detection — merged
//!   (PR #522).
//! - **H-074..H-076 / M-049..M-051** all live downstream of the same
//!   text-based scanner and share the AST refactor; deferred.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: None,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn aliased_derived_import_still_subscribes() {
    // `import { derived as deriv } from "svelte/store"` — the resulting store
    // is still detected as a subscribable store via `$d`.
    let out = client(
        r#"<script>import { derived as deriv } from "svelte/store"; import { writable } from "svelte/store"; let w = writable(0); let d = deriv(w, $w => $w * 2);</script>{$d}"#,
    );
    assert!(out.contains("$.store_get(d, '$d'"), "got:\n{out}");
}

#[test]
fn store_in_template_subscribes() {
    let out = client(
        r#"<script>import { writable } from "svelte/store"; let w = writable(1);</script>{$w}"#,
    );
    assert!(out.contains("$.store_get(w, '$w'"), "got:\n{out}");
}
