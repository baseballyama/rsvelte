//! How a reactive statement's label is spelled in the wrapped form.
//!
//! Upstream `ImplicitTopLevelNames.handleReactiveStatement` wraps a
//! non-assignment reactive statement with `prependLeft(start, ';() => {')` and
//! a `}` at the end — it never rewrites the label, so `$ :`, `$\t:` and
//! `$/*c*/:` all keep their own spelling. rsvelte overwrote a fixed two-byte
//! `$:` instead, which turned `$ : f(n)` into `$:: f(n)` and ate the comment in
//! `$/*c*/: f(n)`.
//!
//! Every expectation is the official svelte2tsx's measured output for that
//! input (`submodules/language-tools`, svelte2tsx 092af3826, parsing with the
//! mirrored svelte 5.56.10).

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn wrapped_line(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "p.svelte".to_string(),
        ..Default::default()
    };
    let code = svelte2tsx(src, opts).expect("svelte2tsx").code;
    code.lines()
        .find(|l| l.contains(";() => {"))
        .unwrap_or_else(|| panic!("no wrapped reactive statement in:\n{code}"))
        .to_string()
}

/// `sep` is what sits between the `$` label and its `:`.
fn component(sep: &str, body: &str) -> String {
    format!(
        "<script>\n\tlet n = 1;\n\tfunction f(x) {{}}\n\t${sep} {body}\n</script>\n<p>{{n}}</p>\n"
    )
}

fn check(rows: &[(&str, &str, &str)]) {
    let mut failures = Vec::new();
    for (sep, body, expected) in rows {
        let got = wrapped_line(&component(sep, body));
        if got.trim() != *expected {
            failures.push(format!(
                "  ${sep} {body}\n    official {expected:?}\n    rsvelte  {:?}",
                got.trim()
            ));
        }
    }
    assert!(
        failures.is_empty(),
        "{} of {} inputs diverge from official svelte2tsx:\n{}",
        failures.len(),
        rows.len(),
        failures.join("\n")
    );
}

#[test]
fn the_label_keeps_the_spelling_the_source_gave_it() {
    check(&[
        (" :", "f(n)", ";() => {$ : f(n)}"),
        ("  :", "f(n)", ";() => {$  : f(n)}"),
        ("\t:", "f(n)", ";() => {$\t: f(n)}"),
        ("/*c*/:", "f(n)", ";() => {$/*c*/: f(n)}"),
    ]);
}

#[test]
fn the_body_shape_does_not_change_the_answer() {
    check(&[
        (" :", "{ f(n); }", ";() => {$ : { f(n); }}"),
        (" :", "if (n) f(n);", ";() => {$ : if (n) f(n);}"),
        (" :", "console.log(n)", ";() => {$ : console.log(n)}"),
        ("/*c*/:", "{ f(n); }", ";() => {$/*c*/: { f(n); }}"),
    ]);
}

#[test]
fn the_tight_spelling_is_unchanged() {
    // The control: `$:` with no separator was already right, and a fix that
    // inserts the wrapper rather than rewriting the label must keep it so.
    check(&[
        (":", "f(n)", ";() => {$: f(n)}"),
        (":", "{ f(n); }", ";() => {$: { f(n); }}"),
        (":", "if (n) f(n);", ";() => {$: if (n) f(n);}"),
    ]);
}

#[test]
fn an_assignment_reactive_statement_still_takes_the_other_path() {
    // Controls for the paths this change does not touch: a plain assignment is
    // rewritten (RHS wrapped in `__sveltets_2_invalidate`), and an *undeclared*
    // target additionally has the label replaced by `let ` — including
    // upstream's own two-byte overwrite, which leaves `let : doubled` for a
    // `$ :` source. rsvelte reproduces that deliberately.
    let opts = || Svelte2TsxOptions {
        filename: "p.svelte".to_string(),
        ..Default::default()
    };
    let declared = svelte2tsx(
        "<script>\n\tlet n = 1;\n\tlet doubled;\n\t$ : doubled = n * 2;\n</script>\n<p>{doubled}</p>\n",
        opts(),
    )
    .expect("svelte2tsx")
    .code;
    assert!(
        declared.contains("$ : doubled = __sveltets_2_invalidate(() => n * 2);"),
        "declared-target assignment changed:\n{declared}"
    );
    let implicit = svelte2tsx(
        "<script>\n\tlet n = 1;\n\t$ : doubled = n * 2;\n</script>\n<p>{doubled}</p>\n",
        opts(),
    )
    .expect("svelte2tsx")
    .code;
    assert!(
        implicit.contains("let : doubled = __sveltets_2_invalidate(() => n * 2);"),
        "implicit-declaration assignment changed:\n{implicit}"
    );
}
