//! A rune declared in a `for` head keeps reactive reads and writes on the client.
//!
//! This deliberately differs from the official compiler. Official lowers the
//! initializer to `$.state(...)` / `$.derived(...)`, but leaves references bare,
//! so a loop compares and mutates the Source/Derived object itself. The emitted
//! JavaScript parses but computes the wrong result at runtime. rsvelte must keep
//! the correct `$.get` / `$.update` lowering.
//!
//! See `upstream_issues/3300-svelte-client-never-rewrites-a-for-head-rune-read.md`.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(script: &str, dev: bool) -> String {
    let source = format!("<script>\n{script}\n</script>\n\n<p>ok</p>\n");
    compile(
        &source,
        CompileOptions {
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

#[track_caller]
fn assert_contains(code: &str, needle: &str) {
    assert!(
        code.contains(needle),
        "expected to find\n  {needle}\nin:\n{code}"
    );
}

/// The state source must be unwrapped in the loop test and body, and an update
/// must use the reactive update helper. Official leaves all three occurrences
/// as bare `i` and the loop body never runs because a Source is not `< 3`.
#[test]
fn state_declared_in_a_for_head_keeps_every_reference_transform() {
    let script = "let log = [];\nfor (let i = $state(0); i < 3; i++) {\n\tlog.push(i);\n}";

    for dev in [false, true] {
        let code = client(script, dev);
        assert_contains(&code, "$.state(0)");
        assert_contains(&code, "$.get(i) < 3");
        assert_contains(&code, "$.update(i)");
        assert_contains(&code, "log.push($.get(i))");
        assert!(!code.contains("i < 3"), "bare Source read in:\n{code}");
        assert!(!code.contains("i++"), "bare Source update in:\n{code}");

        if dev {
            assert_contains(&code, "$.tag($.state(0), 'i')");
        }
    }
}

/// Exercise every read host named by the report: the loop test, update, body,
/// and a closure in the body. Official leaves `d` bare in each of them.
#[test]
fn derived_declared_in_a_for_head_keeps_every_read_transform() {
    let script = "let base = $state(1);\nlet out = 0;\nfor (let d = $derived(base + 1); d < 4; out += d) {\n\tout += d;\n\tconst read = () => d;\n\tread();\n\tbreak;\n}";

    for dev in [false, true] {
        let code = client(script, dev);
        assert_contains(&code, "$.derived");
        assert_contains(&code, "$.get(d) < 4");
        assert_contains(&code, "out += $.get(d)");
        assert_contains(&code, "() => $.get(d)");

        if dev {
            assert!(
                code.contains("$.tag($.derived") || code.contains("$.tag($.derived_safe_equal"),
                "dev output must tag the derived declarator:\n{code}"
            );
        }
    }
}
