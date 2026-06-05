//! Regression test for baseballyama/rsvelte#648.
//!
//! A class method whose signature contains a `=` — most commonly a default
//! parameter such as `getTimeline(opts = {}) {` — was not recognised as a
//! method by the server class-field scanner (`transform_class_fields_server`).
//! Two compounding bugs:
//!
//!   1. The `is_method_start` heuristic required `!trimmed.contains('=')`, so a
//!      default-parameter method was never treated as a method start.
//!   2. Even once recognised, the curly-brace depth counter naively counted the
//!      `{}` of an object-literal default parameter (`opts = {}`), so the block
//!      closed on the *signature* line before the body `{` ever opened.
//!
//! Either way the method body's local `const x = $derived(…)` was then parsed
//! as a private derived *class field* and emitted as `#const_x = $.derived(…)`
//! in statement position — invalid JS (`#name` is the private-in operator
//! outside a class field), so the compiler's own output failed to parse with
//! `Expected 'in' but found '='`.
//!
//! After the fix the local declaration is preserved verbatim and lowered as an
//! ordinary local binding (`const x = $.derived(…)`, read via `x()` on the
//! server / `$.get(x)` on the client).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_component(src: &str, mode: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("App.svelte".to_string()),
            generate: mode,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn assert_no_private_local(out: &str) {
    assert!(
        !out.contains("#const_") && !out.contains("#let_"),
        "local declaration leaked into a private class field:\n{out}"
    );
}

const DEFAULT_PARAM: &str = r#"<script>
class Service {
  data = $state([]);
  getTimeline(opts = {}) {
    const auditTimeline = $derived.by(() => {
      return this.data;
    });
    return auditTimeline;
  }
}
</script>"#;

#[test]
fn default_param_method_server() {
    let out = compile_component(DEFAULT_PARAM, GenerateMode::Server);
    assert_no_private_local(&out);
    // The local derived survives as a local binding, read via `name()` on the server.
    assert!(
        out.contains("const auditTimeline = $.derived("),
        "expected local `const auditTimeline = $.derived(...)`. Got:\n{out}"
    );
    assert!(
        out.contains("return auditTimeline()"),
        "expected server read `return auditTimeline()`. Got:\n{out}"
    );
}

#[test]
fn default_param_method_client() {
    let out = compile_component(DEFAULT_PARAM, GenerateMode::Client);
    assert_no_private_local(&out);
    assert!(
        out.contains("const auditTimeline = $.derived("),
        "expected local `const auditTimeline = $.derived(...)`. Got:\n{out}"
    );
    assert!(
        out.contains("$.get(auditTimeline)"),
        "expected client read `$.get(auditTimeline)`. Got:\n{out}"
    );
}

#[test]
fn destructuring_default_param_method_server() {
    // A destructuring default whose default value is itself an object literal —
    // exercises both the `=`-in-signature path and brace-skipping inside parens.
    let src = r#"<script>
class Service {
  data = $state([]);
  getTimeline({ limit = 10 } = {}) {
    const view = $derived.by(() => this.data.slice(0, limit));
    return view;
  }
}
</script>"#;
    let out = compile_component(src, GenerateMode::Server);
    assert_no_private_local(&out);
    assert!(
        out.contains("const view = $.derived("),
        "expected local `const view = $.derived(...)`. Got:\n{out}"
    );
}

#[test]
fn plain_method_still_works_server() {
    // Guard: a method with no `=` in its signature must keep working.
    let src = r#"<script>
class Service {
  data = $state([]);
  getTimeline() {
    const auditTimeline = $derived.by(() => this.data);
    return auditTimeline;
  }
}
</script>"#;
    let out = compile_component(src, GenerateMode::Server);
    assert_no_private_local(&out);
    assert!(out.contains("const auditTimeline = $.derived("));
}

#[test]
fn real_derived_field_with_default_param_method_server() {
    // Guard: a genuine `$derived` *class field* must still be lowered to a
    // private backing field + getter, even when a default-param method is
    // present in the same class.
    let src = r#"<script>
class Service {
  data = $state([]);
  total = $derived(this.data.length);
  getTimeline(opts = {}) {
    const auditTimeline = $derived.by(() => this.data);
    return auditTimeline;
  }
}
</script>"#;
    let out = compile_component(src, GenerateMode::Server);
    // The local stays local…
    assert!(
        out.contains("const auditTimeline = $.derived("),
        "local derived should stay local:\n{out}"
    );
    // …while the real field becomes a private backing field.
    assert!(
        out.contains("#total = $.derived("),
        "real derived field should lower to a private backing field:\n{out}"
    );
}
