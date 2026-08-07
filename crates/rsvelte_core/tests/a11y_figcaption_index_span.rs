//! Upstream raises `a11y_figcaption_index` while visiting the `<figure>` but
//! passes the offending `<figcaption>` child as the warn target
//! (`2-analyze/visitors/shared/a11y/index.js`). rsvelte constructed the warning
//! without a span, so the caller's element-span fallback stamped the `<figure>`
//! — a plausible but wrong location.

use rsvelte_core::{CompileOptions, GenerateMode, Warning, compile};

/// The upstream fixture `validator/samples/a11y-figcaption-wrong-place`.
const SRC: &str = "<figure>\n\t<img src='foo.jpg' alt='a foo'>\n\n\t<figcaption>\n\t\ta foo in its natural habitat\n\t</figcaption>\n\n\t<p>this should not be here</p>\n</figure>\n";

fn warnings(src: &str) -> Vec<Warning> {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .warnings
}

/// `(start line, start column, end line, end column)` of the first `code`
/// warning, plus the source text the start points at.
fn span<'a>(src: &'a str, ws: &[Warning], code: &str) -> ((usize, usize, usize, usize), &'a str) {
    let w = ws.iter().find(|w| w.code == code).unwrap_or_else(|| {
        panic!(
            "no `{code}` warning in {:?}",
            ws.iter().map(|w| &w.code).collect::<Vec<_>>()
        )
    });
    let start = w
        .start
        .as_ref()
        .unwrap_or_else(|| panic!("`{code}` has no start"));
    let end = w
        .end
        .as_ref()
        .unwrap_or_else(|| panic!("`{code}` has no end"));
    let line = src.lines().nth(start.line - 1).unwrap_or("");
    (
        (start.line, start.column, end.line, end.column),
        &line[start.column.min(line.len())..],
    )
}

#[test]
fn figcaption_index_points_at_the_figcaption_not_the_figure() {
    let ws = warnings(SRC);
    let (pos, text) = span(SRC, &ws, "a11y_figcaption_index");
    assert!(
        text.starts_with("<figcaption"),
        "expected the `<figcaption>`, got {pos:?} -> {text:?}"
    );
    // Upstream's `warnings.json` for the fixture: 4:1..6:14.
    assert_eq!(pos, (4, 1, 6, 14), "span pointed at {text:?}");
}

/// Pin: the sibling rule is raised *on* the `<figcaption>`, so the element-span
/// fallback is already correct there and must stay untouched.
#[test]
fn figcaption_parent_still_points_at_the_figcaption() {
    let src = "<div>\n\t<figcaption>x</figcaption>\n</div>\n";
    let ws = warnings(src);
    let (pos, text) = span(src, &ws, "a11y_figcaption_parent");
    assert!(
        text.starts_with("<figcaption"),
        "expected the `<figcaption>`, got {pos:?} -> {text:?}"
    );
}

/// Negative control: a `<figcaption>` in a legal position raises nothing, so a
/// span fix cannot be mistaken for a changed firing condition.
#[test]
fn correctly_placed_figcaption_raises_no_index_warning() {
    let src =
        "<figure>\n\t<figcaption>x</figcaption>\n\t<img src='foo.jpg' alt='a foo'>\n</figure>\n";
    let ws = warnings(src);
    assert!(
        !ws.iter().any(|w| w.code == "a11y_figcaption_index"),
        "unexpected warning in {:?}",
        ws.iter().map(|w| &w.code).collect::<Vec<_>>()
    );
}
