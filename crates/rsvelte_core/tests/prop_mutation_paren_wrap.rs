//! Upstream's `validate_mutation` (`3-transform/client/visitors/shared/utils.js:390`)
//! is applied to the FULLY BUILT expression — `AssignmentExpression.js:27` calls
//! it on the result of `build_assignment`, so the prop setter call is inside the
//! `$$ownership_validator.mutation(...)` and not the other way round.
//!
//! rsvelte's port over the settled script matched the setter call's first
//! argument as an `Argument::AssignmentExpression` only, and `ParseOptions`
//! preserve parens — so a source-level `(p.x = 1)` fell through to the
//! assignment visitor and the wrap landed INSIDE the setter. The axis is the
//! parenthesis, not the host: `const q = p.x = 1` was already correct and
//! `const q = (p.x = 1)` was not, which is why a grid over declaration hosts
//! that spells its assignments one way measures its own held constant.
//!
//! Every expected string is the oracle's own output
//! (`submodules/svelte/…/src/compiler/index.js`, `generate: 'client'`,
//! `dev: true`). Two real components carried it — `svelte-lexical`'s
//! `NestedComposer.svelte` (`const parentNodes = (initialEditor._nodes = …)`)
//! and immich's `Timeline.svelte` (`() => (timelineManager.scrolling = true)`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn mutation_lines(body: &str) -> Vec<String> {
    let src = format!(
        "<script>\n\tlet {{ p = $bindable() }} = $props();\n\t{body}\n</script>\n<p>{{p}}</p>\n"
    );
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    js.lines()
        .map(|l| l.trim().to_string())
        .filter(|l| l.contains("ownership_validator.mutation"))
        .collect()
}

#[test]
fn a_parenthesised_prop_mutation_is_wrapped_outside_its_setter() {
    let cells: [(&str, &str, &str); 11] = [
        (
            "statement",
            "p.x = 1;",
            "$$ownership_validator.mutation('p', ['p', 'x'], p(p().x = 1, true), 3, 1);",
        ),
        (
            "const initializer",
            "const q = (p.x = 1);",
            "const q = $$ownership_validator.mutation('p', ['p', 'x'], p(p().x = 1, true), 3, 12);",
        ),
        (
            // The control that makes the parenthesis an axis rather than a
            // detail: the same declaration host, already correct before the fix.
            "arrow body bare",
            "const f = () => p.x = 1;",
            "const f = () => $$ownership_validator.mutation('p', ['p', 'x'], p(p().x = 1, true), 3, 17);",
        ),
        (
            "arrow body parens",
            "const f = () => (p.x = 1);",
            "const f = () => $$ownership_validator.mutation('p', ['p', 'x'], p(p().x = 1, true), 3, 18);",
        ),
        (
            "arrow const-init",
            "const f = () => { const q = (p.x = 1); return q; };",
            "const q = $$ownership_validator.mutation('p', ['p', 'x'], p(p().x = 1, true), 3, 30);",
        ),
        (
            "let initializer",
            "let q = (p.x = 1);",
            "let q = $$ownership_validator.mutation('p', ['p', 'x'], p(p().x = 1, true), 3, 10);",
        ),
        (
            "var initializer",
            "var q = (p.x = 1);",
            "var q = $$ownership_validator.mutation('p', ['p', 'x'], p(p().x = 1, true), 3, 10);",
        ),
        (
            "two declarators",
            "const a = 1, q = (p.x = 1);",
            "const q = $$ownership_validator.mutation('p', ['p', 'x'], p(p().x = 1, true), 3, 19);",
        ),
        (
            // The second control: no parenthesis, correct before and after.
            "no parens",
            "const q = p.x = 1;",
            "const q = $$ownership_validator.mutation('p', ['p', 'x'], p(p().x = 1, true), 3, 11);",
        ),
        (
            // The setter's first argument can be an update as readily as an
            // assignment, and it takes the same paren-unwrapping arm.
            "update in parens",
            "const q = (p.x++);",
            "const q = $$ownership_validator.mutation('p', ['p', 'x'], p(p().x++, true), 3, 12);",
        ),
        (
            // A single unwrap is not enough — the source may nest them.
            "nested parens",
            "const q = ((p.x = 1));",
            "const q = $$ownership_validator.mutation('p', ['p', 'x'], p(p().x = 1, true), 3, 13);",
        ),
    ];

    let mut wrong = Vec::new();
    for (name, body, expected) in cells {
        let got = mutation_lines(body);
        if got.as_slice() != [expected.to_string()] {
            wrong.push(format!("{name}\n  want [{expected:?}]\n  got  {got:?}"));
        }
    }
    assert!(wrong.is_empty(), "{}", wrong.join("\n"));
}
