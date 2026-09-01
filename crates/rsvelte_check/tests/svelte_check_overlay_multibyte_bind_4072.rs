//! #4072: `rsvelte-check --tsgo` aborted (SIGABRT) while materializing the
//! overlay for a component whose `bind:` value expression starts with a
//! multi-byte char. The overlay maps a svelte2tsx *error* to a diagnostic, but a
//! UTF-8 char-boundary **panic** aborts the process under `panic = "abort"`, so
//! the whole check dies with no output.
//!
//! This pins the reported entry point: the shadow must materialize, and it must
//! carry the identifier.

use rsvelte_check::overlay::materialize_overlay;
use std::fs;
use std::path::PathBuf;

fn workspace(tag: &str) -> PathBuf {
    let ws = std::env::temp_dir().join(format!("svc_4072_{}_{}", tag, std::process::id()));
    let _ = fs::remove_dir_all(&ws);
    fs::create_dir_all(&ws).unwrap();
    ws
}

#[test]
fn overlay_materializes_a_bind_on_a_multibyte_identifier() {
    let ws = workspace("bind");
    let src = include_str!(
        "../../../compatibility/pattern-corpus/issues/4072-bind-value-multibyte-boundary.svelte"
    );
    fs::write(ws.join("Astral.svelte"), src).unwrap();

    let files = vec![ws.join("Astral.svelte")];
    materialize_overlay(&ws, &files, None).expect("overlay");

    let tsx = fs::read_to_string(ws.join(".svelte-check/svelte/Astral.svelte.tsx")).unwrap();
    assert!(tsx.contains('値'), "shadow missing the binding:\n{tsx}");
}
