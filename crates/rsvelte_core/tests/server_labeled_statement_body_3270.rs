//! Svelte 5.56.10 (`sveltejs/svelte#18617`) added the missing `context.next()` to the
//! server `LabeledStatement` visitor. Before it, the early-return branch — runes mode,
//! a nested label, or any label that is not `$` — returned without visiting the body,
//! so every rune under a label survived into the server output: `outer: { let r =
//! $state(5); }` rendered as `let r = $state(5);`, which is not a function that exists
//! at runtime. rsvelte replicated that bug deliberately (a `in_labeled` flag that
//! switched the nested-rune lowering off); with the fix upstream, the label must no
//! longer stop the descent.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_server(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Server,
            dev,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

#[test]
fn a_state_rune_under_a_label_is_lowered() {
    let src = "<script>\n\tlet out = 0;\n\touter: {\n\t\tlet r = $state(5);\n\t\tout = r;\n\t\tbreak outer;\n\t}\n</script>\n\n<p>{out}</p>\n";
    for dev in [false, true] {
        let out = compile_server(src, dev);
        assert!(!out.contains("COMPILE_ERROR"), "dev={dev}: {out}");
        assert!(out.contains("let r = 5;"), "dev={dev}: {out}");
        assert!(!out.contains("$state("), "dev={dev}: {out}");
        // The label itself is not a casualty of the descent.
        assert!(out.contains("outer: {"), "dev={dev}: {out}");
        assert!(out.contains("break outer;"), "dev={dev}: {out}");
    }
}

#[test]
fn a_label_inside_a_function_does_not_stop_the_descent_either() {
    let src = "<script>\n\tfunction pick() {\n\t\tlet out = 0;\n\t\tinner: {\n\t\t\tlet r = $state(6);\n\t\t\tout = r;\n\t\t\tbreak inner;\n\t\t}\n\t\treturn out;\n\t}\n</script>\n\n<p>{pick()}</p>\n";
    for dev in [false, true] {
        let out = compile_server(src, dev);
        assert!(!out.contains("COMPILE_ERROR"), "dev={dev}: {out}");
        assert!(out.contains("let r = 6;"), "dev={dev}: {out}");
        assert!(!out.contains("$state("), "dev={dev}: {out}");
        assert!(out.contains("inner: {"), "dev={dev}: {out}");
    }
}

/// `$derived` under a label lowers to `$.derived(() => …)` and its later reads become
/// calls — the same two-part rewrite the unlabeled form gets. A fix that only taught
/// the `$state` arm to descend passes the tests above and fails this one.
#[test]
fn a_derived_rune_under_a_label_lowers_and_its_reads_become_calls() {
    let src = "<script>\n\tlet out = 0;\n\touter: {\n\t\tlet n = $state(2);\n\t\tlet d = $derived(n * 3);\n\t\tout = d;\n\t\tbreak outer;\n\t}\n</script>\n\n<p>{out}</p>\n";
    let out = compile_server(src, false);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("$.derived(() => n * 3)"), "{out}");
    assert!(out.contains("out = d();"), "{out}");
}

/// Not a control — measured to pass both before and after the flag was removed, so a
/// statement-position `$effect(…)` under a label was already being dropped by another
/// path. It is here as a guard: the descent must not start emitting one.
#[test]
fn an_effect_statement_under_a_label_is_still_removed() {
    let src = "<script>\n\tlet n = $state(1);\n\touter: {\n\t\t$effect(() => {\n\t\t\tconsole.log(n);\n\t\t});\n\t\tbreak outer;\n\t}\n</script>\n\n<p>{n}</p>\n";
    let out = compile_server(src, false);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(!out.contains("$effect("), "{out}");
}
