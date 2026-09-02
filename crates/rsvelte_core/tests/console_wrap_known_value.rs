//! Dev-mode `console.*` is wrapped only when an argument can evaluate to
//! `UNKNOWN`.
//!
//! Upstream asks `node.arguments.some(arg => arg.type === 'SpreadElement' ||
//! context.state.scope.evaluate(arg).has_unknown)`
//! (`visitors/CallExpression.js:91-104`), and `scope.evaluate` resolves a rune
//! declaration by evaluating the rune's ARGUMENT (`scope.js:465-500`), so
//! `let c = $state(0); console.log(c)` is left alone.
//!
//! rsvelte's script paths rewrite generated text, where the same declaration
//! has been lowered, and they read the lowered call as an opaque one. Two
//! things went wrong at once and only a grid separates them: the lowered
//! spellings were never inverted, and the declarator verdicts were keyed by
//! NAME — so two declarations sharing a name silenced each other's verdict and
//! the missing-verdict fallback is `UNKNOWN`.
//!
//! The host axis is what localises the defect: the same body inside an arrow or
//! a template expression already agreed, so the cells here are the two script
//! hosts. There is no `.svelte.ts` host because there is no such input class —
//! `compileModule` rejects TS syntax on both sides (`0 as number` and `import
//! type` are `js_parse_error` for official and for rsvelte alike), so the
//! toolchain strips types before the compiler sees the file.
//!
//! Every expectation is the official compiler's own count for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module};

fn opts(filename: &str) -> CompileOptions {
    CompileOptions {
        filename: Some(filename.to_string()),
        generate: GenerateMode::Client,
        dev: true,
        ..Default::default()
    }
}

fn wrap_calls_component(body: &str) -> usize {
    let src = format!("<script>\nimport imported from './i.js';\n{body}\n</script>");
    compile(&src, opts("P.svelte"))
        .expect("compile")
        .js
        .code
        .matches("$.log_if_contains_state(")
        .count()
}

fn wrap_calls_module(body: &str) -> usize {
    let src = format!("import imported from './i.js';\n{body}\n");
    let options = ModuleCompileOptions {
        filename: Some("m.svelte.js".to_string()),
        generate: GenerateMode::Client,
        dev: true,
        ..Default::default()
    };
    compile_module(&src, options)
        .expect("compile_module")
        .js
        .code
        .matches("$.log_if_contains_state(")
        .count()
}

fn check(host: &str, f: fn(&str) -> usize, cells: &[(&str, &str, usize)]) {
    let mut failures = Vec::new();
    for (name, body, expected) in cells {
        let got = f(body);
        if got != *expected {
            failures.push(format!("{host}/{name}: official {expected}, rsvelte {got}"));
        }
    }
    assert!(failures.is_empty(), "\n{}", failures.join("\n"));
}

/// The rows the fix moves, plus the ones that pin each half of it.
/// `state, unknown initializer` and `fn-local shadowing, unknown` are the
/// controls: they share the shape of the rows above them and must keep their
/// wrap, so a fix that simply stops wrapping runes cannot pass.
const CELLS: &[(&str, &str, usize)] = &[
    (
        "state, known literal",
        "let c = $state(0); console.log(c);",
        0,
    ),
    (
        "derived of a known state",
        "let c = $state(0); let d = $derived(c * 2); console.log(d);",
        0,
    ),
    (
        "derived.by, expression body",
        "let c = $state(0); let d = $derived.by(() => c + 1); console.log(d);",
        0,
    ),
    ("state, no argument", "let c = $state(); console.log(c);", 0),
    (
        "state, unknown initializer",
        "function g() { return 1; } let c = $state(g()); console.log(c);",
        1,
    ),
    // Every lowered write spelling. The lowering turns a write into a CALL
    // (`$.set` / `$.update` / `$.update_pre`), which oxc scores as a read — so
    // the whole row set exists because a fix for the rows above it silently
    // dropped upstream's `!binding.updated` test on this one.
    (
        "state, written",
        "let c = $state(0); c = 1; console.log(c);",
        1,
    ),
    (
        "state, compound-assigned",
        "let c = $state(0); c += 2; console.log(c);",
        1,
    ),
    (
        "state, postfix update",
        "let c = $state(0); c++; console.log(c);",
        1,
    ),
    (
        "state, prefix update",
        "let c = $state(0); ++c; console.log(c);",
        1,
    ),
    (
        "state, logical-assigned",
        "let c = $state(0); c &&= 1; console.log(c);",
        1,
    ),
    (
        "state, nullish-assigned",
        "let c = $state(0); c ??= 1; console.log(c);",
        1,
    ),
    (
        "derived, never written",
        "let c = $state(0); let d = $derived(c); console.log(d);",
        0,
    ),
    (
        "raw state, known literal",
        "let c = $state.raw(0); console.log(c);",
        0,
    ),
    (
        "fn-local shadowing a state",
        "let c = $state(0); function f() { let c = 1; console.log(c); } f();",
        0,
    ),
    (
        "fn-local shadowing, unknown",
        "let c = $state(0); function f(q) { let c = q; console.log(c); } f(1);",
        1,
    ),
    (
        "two locals, same name, both known",
        "function f() { let c = 1; console.log(c); } function g() { let c = 2; console.log(c); } f(); g();",
        0,
    ),
    ("fn param", "function f(a) { console.log(a); } f(1);", 1),
    ("plain let, never written", "let n = 1; console.log(n);", 0),
    ("plain let, written", "let n = 1; n = 2; console.log(n);", 1),
    ("import", "console.log(imported);", 1),
    ("spread", "const a = [1]; console.log(...a);", 1),
    ("global call", "console.log(Math.random());", 0),
    (
        "shadowed Math",
        "const Math = { random: () => 1 }; console.log(Math.random());",
        1,
    ),
    (
        "unknown call",
        "function g() { return 1; } console.log(g());",
        1,
    ),
];

#[test]
fn an_instance_script_agrees_with_the_oracle() {
    let mut cells = CELLS.to_vec();
    // `$props()` has no module spelling, so it rides only on this host.
    cells.push(("prop", "let { p } = $props(); console.log(p);", 1));
    check("instance", wrap_calls_component, &cells);
}

#[test]
fn a_module_agrees_with_the_oracle() {
    check("module", wrap_calls_module, CELLS);
}
