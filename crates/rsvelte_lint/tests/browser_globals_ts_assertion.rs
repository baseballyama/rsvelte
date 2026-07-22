//! Regression: `svelte/no-top-level-browser-globals` must still flag a browser
//! global that is wrapped in a TS assertion expression (`(window as any)`,
//! `document.dir as X`). Preserving those wrappers in `parse()` output made the
//! rule's `in_type_annotation` guard (a blanket `startsWith("TS")`) skip the
//! value-space operand; the guard now excludes the assertion wrappers.

use rsvelte_lint::line_index::LineIndex;
use rsvelte_lint::{LintConfig, Severity, lint_source_raw};
use std::path::Path;

const RULE: &str = "svelte/no-top-level-browser-globals";

/// Return `(line, column1based)` for every finding of the rule.
fn findings(source: &str) -> Vec<(u32, u32)> {
    let cfg = LintConfig::empty().with_override(RULE, Severity::Warn);
    let li = LineIndex::new(source);
    let mut out: Vec<(u32, u32)> = lint_source_raw(source, Path::new("Comp.svelte"), &cfg)
        .into_iter()
        .filter(|d| d.rule == RULE)
        .map(|d| {
            let (line, col) = li.position(d.start);
            (line, col + 1)
        })
        .collect();
    out.sort();
    out
}

#[test]
fn window_wrapped_in_as_and_non_null_is_flagged() {
    // Mirrors eslint-plugin-svelte no-add-event-listener/invalid/typescript01.
    let src = "<script lang=\"ts\">\n\
        \tconst handler = (ev: Event) => {\n\
        \t\tconsole.log(ev);\n\
        \t};\n\
        \n\
        \t(window as any).addEventListener('message', handler);\n\
        \t(window.addEventListener as any)('message', handler);\n\
        </script>\n\
        \n\
        <div>Hello</div>";
    // Upstream reports `window` at 6:3 and 7:3.
    assert_eq!(findings(src), vec![(6, 3), (7, 3)]);
}

#[test]
fn document_wrapped_in_as_is_flagged() {
    // Mirrors flowbite-svelte ExampleRTL.svelte: `document.dir as X`.
    let src = "<script lang=\"ts\">\n\
        \ttype Dir = \"ltr\" | \"rtl\";\n\
        \tlet dir: Dir = \"ltr\";\n\
        \tif (document.dir) {\n\
        \t\tdir = document.dir as Dir;\n\
        \t}\n\
        </script>";
    // Both `document` reads flagged: the plain one (4:6) and the `as`-wrapped one (5:9).
    assert_eq!(findings(src), vec![(4, 6), (5, 9)]);
}

#[test]
fn identifier_inside_a_real_type_annotation_is_still_skipped() {
    // A browser-global *name* used as a type (not a value) must stay unflagged —
    // the `in_type_annotation` guard still fires for genuine `TS*` type nodes.
    let src = "<script lang=\"ts\">\n\
        \tlet x: window.Foo;\n\
        </script>";
    assert_eq!(findings(src), Vec::<(u32, u32)>::new());
}
