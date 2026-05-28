//! Issue #450 H-083: the public `warning_filter` option must actually be
//! applied — a filter that returns false drops the warning.

use std::sync::Arc;
use svelte_compiler_rust::{CompileOptions, Warning, compile};

fn warning_codes(
    src: &str,
    filter: Option<Arc<dyn Fn(&Warning) -> bool + Send + Sync>>,
) -> Vec<String> {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            warning_filter: filter,
            ..Default::default()
        },
    )
    .unwrap()
    .warnings
    .into_iter()
    .map(|w| w.code)
    .collect()
}

// `<img>` without `alt` reliably produces an a11y warning.
const SRC: &str = "<img src=\"x.png\">";

#[test]
fn warning_filter_none_keeps_warnings() {
    let codes = warning_codes(SRC, None);
    assert!(!codes.is_empty(), "expected at least one warning");
}

#[test]
fn warning_filter_false_drops_all() {
    let codes = warning_codes(SRC, Some(Arc::new(|_w: &Warning| false)));
    assert!(
        codes.is_empty(),
        "warning_filter returning false should drop: {codes:?}"
    );
}

#[test]
fn warning_filter_can_drop_by_code() {
    // Keep everything except a11y_* warnings.
    let codes = warning_codes(
        SRC,
        Some(Arc::new(|w: &Warning| !w.code.starts_with("a11y"))),
    );
    assert!(
        !codes.iter().any(|c| c.starts_with("a11y")),
        "a11y warnings should have been filtered out: {codes:?}"
    );
}
