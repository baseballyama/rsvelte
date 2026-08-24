//! Logical assignment to a private `$state` field must short-circuit.
//!
//! Ported from upstream #18594: `this.#x ||= v` compiled to an unconditional
//! `$.set(this.#x, $.get(this.#x) || v)`, so the setter ran — and the field was
//! marked dirty — even when the operator was not supposed to assign.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// In a method body the field reads through `$.get`.
#[test]
fn a_method_body_short_circuits_around_the_setter() {
    let out = client(
        "<script>\n\
         \tclass C {\n\
         \t\t#or = $state.raw('t');\n\
         \t\t#and = $state.raw('');\n\
         \t\t#nullish = $state.raw('v');\n\
         \t\tget or() { return (this.#or ||= 'a'); }\n\
         \t\tget and() { return (this.#and &&= 'a'); }\n\
         \t\tget nullish() { return (this.#nullish ??= 'a'); }\n\
         \t}\n\
         </script>",
    );

    assert!(
        out.contains("$.get(this.#or) || $.set(this.#or, 'a')"),
        "`||=` must short-circuit, got:\n{out}"
    );
    assert!(
        out.contains("$.get(this.#and) && $.set(this.#and, 'a')"),
        "`&&=` must short-circuit, got:\n{out}"
    );
    assert!(
        out.contains("$.get(this.#nullish) ?? $.set(this.#nullish, 'a')"),
        "`??=` must short-circuit, got:\n{out}"
    );
}

/// In the constructor the field reads through `.v`, and an object RHS still
/// gets the `, true` proxy flag — `should_proxy` now traces the bare RHS
/// instead of the (always-proxied) folded logical expression.
#[test]
fn a_constructor_body_short_circuits_and_keeps_the_proxy_flag() {
    let out = client(
        "<script>\n\
         \tclass C {\n\
         \t\t#a = $state();\n\
         \t\tconstructor() { this.#a ||= { val: 0 }; }\n\
         \t}\n\
         </script>",
    );

    assert!(
        out.contains("this.#a.v || $.set(this.#a, { val: 0 }, true)"),
        "expected a short-circuited, proxied set, got:\n{out}"
    );
}

/// Control: an arithmetic compound is *not* a logical one — it still folds the
/// read into the setter argument, and never proxies.
#[test]
fn an_arithmetic_compound_still_folds_into_the_setter() {
    let out = client(
        "<script>\n\
         \tclass C {\n\
         \t\t#n = $state(0);\n\
         \t\tinc() { this.#n += 3; }\n\
         \t}\n\
         </script>",
    );

    assert!(
        out.contains("$.set(this.#n, $.get(this.#n) + 3)"),
        "expected the folded form, got:\n{out}"
    );
    assert!(
        !out.contains("$.get(this.#n) + $.set("),
        "an arithmetic compound must not short-circuit, got:\n{out}"
    );
}
