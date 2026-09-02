//! Dev-mode `$.assign` is not emitted for a member chain rooted at a global.
//!
//! Upstream's `build_assignment` walks the assignment target down to its root
//! identifier and stops at `const binding = context.state.scope.get(name); if
//! (!binding) return null` (`visitors/AssignmentExpression.js:104-118`), so
//! `document.body.onfocus = handler` is left alone. rsvelte's settled-script
//! pass had no binding test and wrapped every member assignment.
//!
//! The axis is what declares the root, because a name test alone cannot answer
//! it: a global that a `let` shadows *is* a binding, and an import is a binding
//! this pass's fragment no longer contains — the instance body it walks has had
//! its imports hoisted out. So the guard reads the fragment's own resolution
//! **and** the component's binding set, and the two rows that separate those
//! halves are `shadowed global` and `import`.
//!
//! Every expectation is the official compiler's own count for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn assign_calls(body: &str) -> usize {
    let src = format!(
        "<script>\nimport imp from './i.js';\nlet {{ p }} = $props();\nlet o = $state({{}});\nlet loc = {{}};\nlet s = {{}};\n{body}\n</script>{{f}}"
    );
    let out = compile(
        &src,
        CompileOptions {
            filename: Some("P.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    out.matches("$.assign(").count()
}

fn check(cells: &[(&str, &str, usize)]) {
    let mut failures = Vec::new();
    for (name, body, expected) in cells {
        let got = assign_calls(body);
        if got != *expected {
            failures.push(format!("{name}: official {expected}, rsvelte {got}"));
        }
    }
    assert!(failures.is_empty(), "\n{}", failures.join("\n"));
}

/// The rows the fix changes: nothing declares the root, so upstream never
/// reaches the `$.assign` builder.
#[test]
fn a_chain_rooted_at_a_global_is_not_instrumented() {
    check(&[
        (
            "document",
            "function f(){ return (document.body.q = s.v); }",
            0,
        ),
        (
            "window",
            "function f(){ return (window.location.q = s.v); }",
            0,
        ),
        (
            "globalThis",
            "function f(){ return (globalThis.x.q = s.v); }",
            0,
        ),
        (
            "undeclared",
            "function f(){ return (someGlobal.x.q = s.v); }",
            0,
        ),
        (
            "nested global",
            "function f(){ return (document.body.style.x = s.v); }",
            0,
        ),
    ]);
}

/// The rows that must not move, and they are the reason the guard is a union.
/// `shadowed global` is answered only by the fragment's own resolution;
/// `import` only by the component's bindings, because the instance body this
/// pass walks has had its imports hoisted out of it.
#[test]
fn a_chain_rooted_at_a_declared_name_still_is() {
    check(&[
        (
            "fn-local let",
            "function f(){ let t = {}; return (t.q = s.v); }",
            1,
        ),
        ("fn param", "function f(t){ return (t.q = s.v); }", 1),
        ("arrow param", "const f = (t) => (t.q = s.v);", 1),
        (
            "catch binding",
            "function f(){ try { g(); } catch (e) { return (e.q = s.v); } } function g(){}",
            1,
        ),
        (
            "for-of binding",
            "function f(){ for (const t of []) { return (t.q = s.v); } }",
            1,
        ),
        (
            "shadowed global",
            "function f(){ let document = {}; return (document.body = s.v); }",
            1,
        ),
        (
            "module-level let",
            "function f(){ return (loc.q = s.v); }",
            1,
        ),
        ("state", "function f(){ return (o.q = s.v); }", 1),
        ("import", "function f(){ return (imp.q = s.v); }", 1),
    ]);
}

/// Two rows that already agreed before the fix, kept because a grid assembled
/// from the cells a defect breaks has no cell left to report a regression.
#[test]
fn the_rows_that_already_agreed_still_do() {
    check(&[
        ("this member", "function f(){ return (this.q = s.v); }", 0),
        // A prop root leaves through `transform.assign` / the ownership
        // validator, not through the `$.assign` builder.
        ("prop", "function f(){ return (p.q = s.v); }", 0),
        ("statement, not a value", "function f(){ loc.q = s.v; }", 0),
    ]);
}
