//! A declaration list whose printed length is exactly 51 must break across
//! lines, in a rewritten statement as much as an untouched one.
//!
//! esrap breaks when `measure() + 2 * (n - 1) > 50`, and its `measure` counts
//! every string command — including the `' '` written after an argument comma.
//! This port defers that space as a layout byte so it can be retracted into a
//! newline, and subtracted it from `measure`, so a list measuring 51 read as 50.
//! The expanded `let { a = 1 } = $state()` in a module script lands on exactly
//! that boundary, which is why it looked like the rewrite was printed verbatim:
//! the untouched declaration beside it is longer and broke, the rewritten one
//! measured one short and did not.
//!
//! Both expectations are the pinned official compiler's output.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

#[test]
fn a_rewritten_module_declaration_breaks_like_an_untouched_one() {
    let code = client(
        r#"<script module>
	let aaaaaaaaaaaaaaaa = 1, bbbbbbbbbbbbbbbbbb = 2, cccccccccccccc = 3;
	let { a = 1 } = $state();
</script>
<div>{aaaaaaaaaaaaaaaa}{a}</div>
"#,
    );
    assert!(
        code.contains(
            "let aaaaaaaaaaaaaaaa = 1,\n\tbbbbbbbbbbbbbbbbbb = 2,\n\tcccccccccccccc = 3;"
        ),
        "untouched declaration lost its break:\n{code}"
    );
    assert!(
        code.contains("let tmp = void 0,\n\ta = $.proxy($.fallback(tmp.a, 1));"),
        "rewritten declaration was not broken:\n{code}"
    );
}

/// The same boundary reached without any rewrite at all — an ordinary module
/// script, no rune involved. One character shorter and it must stay on one line.
#[test]
fn the_boundary_is_the_same_for_an_untouched_declaration() {
    let over = client(
        r#"<script module>
	let tmp = void 0, a = z.proxy(z.fallback(tmp.a, 1));
</script>
<div>{a}</div>
"#,
    );
    assert!(
        over.contains("let tmp = void 0,\n\ta = z.proxy(z.fallback(tmp.a, 1));"),
        "51 characters must break:\n{over}"
    );

    let under = client(
        r#"<script module>
	let tmp = void 0, a = z.proxy(z.fallbac(tmp.a, 1));
</script>
<div>{a}</div>
"#,
    );
    assert!(
        under.contains("let tmp = void 0, a = z.proxy(z.fallbac(tmp.a, 1));"),
        "50 characters must stay on one line:\n{under}"
    );
}
