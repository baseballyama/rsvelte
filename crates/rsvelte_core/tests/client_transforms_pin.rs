//! Regression note for the client-transforms cluster (issue #465).
//!
//! This is a large cluster of text-based client-side scanners. Many findings
//! were addressed by PR #531; the remaining items each need their own AST-
//! driven rewrite (the issue itself suggests this), making them coordinated
//! work tracked from the cluster overview at #431.
//!
//! - **H-024** logical / nullish compound assignment lowering — addressed
//!   in PR #531; verified semantically equivalent to upstream (the
//!   `$.set(x, $.get(x) ?? rhs)` shape only mutates when the test allows).
//! - **H-026** compound-assignment operator coverage — addressed in PR #531.
//! - **M-021** instance `export { ... }` stripping — addressed in PR #531
//!   for the common case; edge cases with embedded `$.get(...)` substitutions
//!   remain on the issue.
//! - **M-045** `$props()` destructuring split — addressed in PR #531.
//! - **H-025 / H-027 / H-028 / M-020 / M-022 / M-023 / M-042..M-044 /
//!   M-046..M-048** all share the AST-driven rewrite the issue itself
//!   recommends as the fix; deferred to the coordinated effort.

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
fn h024_nullish_compound_lowers_to_get_then_coalesce() {
    let out = client(r#"<script>let x = $state(null); function f(){ x ??= 5; }</script>{x}"#);
    assert!(out.contains("$.set(x, $.get(x) ?? 5)"), "got:\n{out}");
}

#[test]
fn h026_exponentiation_compound_lowers_correctly() {
    let out = client(r#"<script>let x = $state(2); function f(){ x **= 3; }</script>{x}"#);
    // Pin the lowered shape for the `**=` operator path.
    assert!(out.contains("$.set(x, $.get(x) ** 3)"), "got:\n{out}");
}

/// Regression for issue #1438: a logical compound assignment (`??=`/`||=`/`&&=`)
/// to a *private* `$state` field inside a regular method/getter was left
/// un-rewritten, so the read-wrap pass turned the LHS into `$.get(this.#x)`,
/// producing the invalid `$.get(this.#x) ??= rhs`. It must lower to
/// `$.set(this.#x, $.get(this.#x) ?? rhs, true)`, matching the official
/// compiler. (The `class-private-fields-assignment-shorthand` upstream fixture
/// only exercises the constructor path, which is compiled separately.)
#[test]
fn issue_1438_private_field_nullish_compound_in_method() {
    let out = client(
        r#"<script>
          class Query {
            #promise = $state(null);
            get() { return this.#promise ??= run(); }
          }
          function run() { return Promise.resolve(1); }
        </script>
        <p>{new Query().get()}</p>"#,
    );
    assert!(
        out.contains("$.set(this.#promise, $.get(this.#promise) ?? run(), true)"),
        "got:\n{out}"
    );
    // The buggy shape must be gone.
    assert!(!out.contains("??= run()"), "invalid `??=` remains:\n{out}");
}
