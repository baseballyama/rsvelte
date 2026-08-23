//! Which of two live checks wins: `export const` writes (#3262) and a spread
//! next to an invalid `bind:` on `<svelte:window|document|body>` (#3268).
//!
//! Both are cases where **both** compilers reject and only the code, message and
//! span differ, so the corpus output verdict — which compares an error's `code`
//! and nothing else — is blind to them by construction.
//!
//! - #3268 (**fixed here**): `SvelteWindow`/`SvelteDocument`/`SvelteBody` run
//!   their whole "does this element take arbitrary attributes at all" loop before
//!   `context.next()` descends into any `bind:`. rsvelte validated the `bind:`
//!   target first.
//! - #3262 (**open**, pinned in `KNOWN_3262` below): upstream promotes a legacy
//!   `export const` that the template writes to `state` (`2-analyze/index.js`
//!   L627-645) and then rejects the **export** from `ExportNamedDeclaration`
//!   during the *instance* walk. rsvelte cannot do that yet — see the comment on
//!   `KNOWN_3262` for the measurement that says why.
//!
//! Every expectation was measured on the official compiler in a fresh process,
//! and is compared on `(code, message, start, end)` for an error and on the full
//! `(code, start, end)` shape for a warning, on both targets.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[derive(Debug, PartialEq, Eq)]
enum Expect {
    /// Compiles, emitting these `(code, start, end)` warnings in order.
    Ok(&'static [(&'static str, usize, usize)]),
    /// Rejected with this `(code, message, span)`.
    Err(&'static str, &'static str, (u32, u32)),
}

type Observed = Result<Vec<(String, usize, usize)>, (String, String, Option<(u32, u32)>)>;

fn observed(src: &str, generate: GenerateMode) -> Observed {
    match compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate,
            dev: false,
            ..Default::default()
        },
    ) {
        Ok(result) => Ok(result
            .warnings
            .into_iter()
            .map(|w| {
                let at = |p: Option<rsvelte_core::compiler::Position>| {
                    p.map(|p| p.character).unwrap_or(usize::MAX)
                };
                (w.code, at(w.start), at(w.end))
            })
            .collect()),
        Err(err) => {
            let d = err.diagnostic();
            Err((d.code.unwrap_or_default(), d.message, d.span))
        }
    }
}

/// Cells rsvelte still gets wrong, recorded with the answer it produces today.
/// A two-sided pin: if rsvelte's answer changes at all — including to upstream's —
/// the assertion fails and the row has to move into the grid proper.
///
/// #3262 stays open because closing it needs binding **references** to be
/// collected before the visitor walk, the way upstream's `create_scopes` does.
/// rsvelte collects them *during* the walk (`visitors/identifier.rs`), so when
/// `ExportNamedDeclaration` is visited a legacy `export const` the template writes
/// to is still `Normal` — `promote_legacy_state_bindings` cannot have run yet — and
/// `state_invalid_export` therefore cannot fire. The template-reference half of
/// upstream's criterion is load-bearing rather than incidental: the
/// `export_const_written_not_in_template` row is `constant_assignment` on both
/// sides, so "is it updated" alone does not decide it.
#[rustfmt::skip]
const KNOWN_3262: &[(&str, &str, (u32, u32))] = &[
    ("export_const/handler_assign", "constant_assignment", (63, 68)),
    ("export_const/handler_update", "constant_assignment", (63, 66)),
    ("export_const/script_fn_assign", "constant_assignment", (46, 51)),
    ("export_const/bind_value", "constant_binding", (47, 61)),
    ("export_const_destructured/handler_assign", "constant_assignment", (74, 79)),
    ("export_const_destructured/handler_update", "constant_assignment", (74, 77)),
    ("export_const_destructured/script_fn_assign", "constant_assignment", (57, 62)),
    ("export_const_destructured/bind_value", "constant_binding", (58, 72)),
    ("export_const_array/handler_assign", "constant_assignment", (67, 72)),
    ("export_const_array/handler_update", "constant_assignment", (67, 70)),
    ("export_const_array/script_fn_assign", "constant_assignment", (50, 55)),
    ("export_const_array/bind_value", "constant_binding", (51, 65)),
];

fn check(id: &str, src: &str, expect: &Expect) {
    if let Some((_, want_code, want_span)) = KNOWN_3262.iter().find(|(i, _, _)| *i == id) {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let Err((code, _, span)) = observed(src, generate) else {
                panic!("[{id}] generate={generate:?}: #3262 row unexpectedly compiles");
            };
            assert_eq!(code, *want_code, "[{id}] generate={generate:?} #3262 code");
            assert_eq!(
                span,
                Some(*want_span),
                "[{id}] generate={generate:?} #3262 span"
            );
        }
        return;
    }
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        match (observed(src, generate), expect) {
            (Ok(warnings), Expect::Ok(want)) => {
                let want: Vec<(String, usize, usize)> = want
                    .iter()
                    .map(|(c, s, e)| ((*c).to_string(), *s, *e))
                    .collect();
                assert_eq!(warnings, want, "[{id}] generate={generate:?} warnings");
            }
            (Err((code, message, span)), Expect::Err(want_code, want_message, want_span)) => {
                assert_eq!(code, *want_code, "[{id}] generate={generate:?} code");
                assert_eq!(
                    message, *want_message,
                    "[{id}] generate={generate:?} message"
                );
                assert_eq!(span, Some(*want_span), "[{id}] generate={generate:?} span");
            }
            (got, want) => panic!("[{id}] generate={generate:?}: got {got:?}, want {want:?}"),
        }
    }
}

fn run(name: &str, grid: &[(&str, &str, Expect)]) {
    let hook = std::panic::take_hook();
    std::panic::set_hook(Box::new(|_| {}));
    let mut failures = Vec::new();
    for (id, src, expect) in grid {
        if let Err(payload) = std::panic::catch_unwind(|| check(id, src, expect)) {
            let msg = payload
                .downcast_ref::<String>()
                .cloned()
                .or_else(|| payload.downcast_ref::<&str>().map(|s| (*s).to_string()))
                .unwrap_or_else(|| "<non-string panic>".to_string());
            failures.push(format!("  {msg}"));
        }
    }
    std::panic::set_hook(hook);
    assert!(
        failures.is_empty(),
        "{name}: {} of {} cells diverge:\n{}",
        failures.len(),
        grid.len(),
        failures.join("\n")
    );
}

/// #3262: declaration form x how the template writes to the binding.
#[rustfmt::skip]
const EXPORT_WRITE: &[(&str, &str, Expect)] = &[
    ("export_const/handler_assign", "<script>\n\texport const a = 1;\n</script>\n<button onclick={() => a = 2}>{a}</button>", Expect::Err("state_invalid_export", "Cannot export state from a module if it is reassigned. Either export a function returning the state value or only mutate the state value's properties\nhttps://svelte.dev/e/state_invalid_export", (10, 29))),
    ("export_const/handler_update", "<script>\n\texport const a = 1;\n</script>\n<button onclick={() => a++}>{a}</button>", Expect::Err("state_invalid_export", "Cannot export state from a module if it is reassigned. Either export a function returning the state value or only mutate the state value's properties\nhttps://svelte.dev/e/state_invalid_export", (10, 29))),
    ("export_const/script_fn_assign", "<script>\n\texport const a = 1;\n\tfunction f() { a = 2; }\n</script>\n<button onclick={f}>{a}</button>", Expect::Err("state_invalid_export", "Cannot export state from a module if it is reassigned. Either export a function returning the state value or only mutate the state value's properties\nhttps://svelte.dev/e/state_invalid_export", (10, 29))),
    ("export_const/bind_value", "<script>\n\texport const a = 1;\n</script>\n<input bind:value={a} />\n{a}", Expect::Err("state_invalid_export", "Cannot export state from a module if it is reassigned. Either export a function returning the state value or only mutate the state value's properties\nhttps://svelte.dev/e/state_invalid_export", (10, 29))),
    ("export_const/read_only", "<script>\n\texport const a = 1;\n</script>\n<p>{a}</p>", Expect::Ok(&[])),
    ("plain_const/handler_assign", "<script>\n\tconst a = 1;\n</script>\n<button onclick={() => a = 2}>{a}</button>", Expect::Err("constant_assignment", "Cannot assign to constant\nhttps://svelte.dev/e/constant_assignment", (56, 61))),
    ("plain_const/handler_update", "<script>\n\tconst a = 1;\n</script>\n<button onclick={() => a++}>{a}</button>", Expect::Err("constant_assignment", "Cannot assign to constant\nhttps://svelte.dev/e/constant_assignment", (56, 59))),
    ("plain_const/script_fn_assign", "<script>\n\tconst a = 1;\n\tfunction f() { a = 2; }\n</script>\n<button onclick={f}>{a}</button>", Expect::Err("constant_assignment", "Cannot assign to constant\nhttps://svelte.dev/e/constant_assignment", (39, 44))),
    ("plain_const/bind_value", "<script>\n\tconst a = 1;\n</script>\n<input bind:value={a} />\n{a}", Expect::Err("constant_binding", "Cannot bind to constant\nhttps://svelte.dev/e/constant_binding", (40, 54))),
    ("plain_const/read_only", "<script>\n\tconst a = 1;\n</script>\n<p>{a}</p>", Expect::Ok(&[])),
    ("export_let/handler_assign", "<script>\n\texport let a = 1;\n</script>\n<button onclick={() => a = 2}>{a}</button>", Expect::Ok(&[])),
    ("export_let/handler_update", "<script>\n\texport let a = 1;\n</script>\n<button onclick={() => a++}>{a}</button>", Expect::Ok(&[])),
    ("export_let/script_fn_assign", "<script>\n\texport let a = 1;\n\tfunction f() { a = 2; }\n</script>\n<button onclick={f}>{a}</button>", Expect::Ok(&[])),
    ("export_let/bind_value", "<script>\n\texport let a = 1;\n</script>\n<input bind:value={a} />\n{a}", Expect::Ok(&[])),
    ("export_let/read_only", "<script>\n\texport let a = 1;\n</script>\n<p>{a}</p>", Expect::Ok(&[])),
    ("export_function/handler_assign", "<script>\n\texport function a() {}\n</script>\n<button onclick={() => a = 2}>{a}</button>", Expect::Ok(&[])),
    ("export_function/handler_update", "<script>\n\texport function a() {}\n</script>\n<button onclick={() => a++}>{a}</button>", Expect::Ok(&[])),
    ("export_function/script_fn_assign", "<script>\n\texport function a() {}\n\tfunction f() { a = 2; }\n</script>\n<button onclick={f}>{a}</button>", Expect::Ok(&[])),
    ("export_function/bind_value", "<script>\n\texport function a() {}\n</script>\n<input bind:value={a} />\n{a}", Expect::Ok(&[])),
    ("export_function/read_only", "<script>\n\texport function a() {}\n</script>\n<p>{a}</p>", Expect::Ok(&[])),
    ("export_class/handler_assign", "<script>\n\texport class a {}\n</script>\n<button onclick={() => a = 2}>{a}</button>", Expect::Ok(&[])),
    ("export_class/handler_update", "<script>\n\texport class a {}\n</script>\n<button onclick={() => a++}>{a}</button>", Expect::Ok(&[])),
    ("export_class/script_fn_assign", "<script>\n\texport class a {}\n\tfunction f() { a = 2; }\n</script>\n<button onclick={f}>{a}</button>", Expect::Ok(&[])),
    ("export_class/bind_value", "<script>\n\texport class a {}\n</script>\n<input bind:value={a} />\n{a}", Expect::Ok(&[])),
    ("export_class/read_only", "<script>\n\texport class a {}\n</script>\n<p>{a}</p>", Expect::Ok(&[])),
    ("export_const_destructured/handler_assign", "<script>\n\texport const { a } = { a: 1 };\n</script>\n<button onclick={() => a = 2}>{a}</button>", Expect::Err("state_invalid_export", "Cannot export state from a module if it is reassigned. Either export a function returning the state value or only mutate the state value's properties\nhttps://svelte.dev/e/state_invalid_export", (10, 40))),
    ("export_const_destructured/handler_update", "<script>\n\texport const { a } = { a: 1 };\n</script>\n<button onclick={() => a++}>{a}</button>", Expect::Err("state_invalid_export", "Cannot export state from a module if it is reassigned. Either export a function returning the state value or only mutate the state value's properties\nhttps://svelte.dev/e/state_invalid_export", (10, 40))),
    ("export_const_destructured/script_fn_assign", "<script>\n\texport const { a } = { a: 1 };\n\tfunction f() { a = 2; }\n</script>\n<button onclick={f}>{a}</button>", Expect::Err("state_invalid_export", "Cannot export state from a module if it is reassigned. Either export a function returning the state value or only mutate the state value's properties\nhttps://svelte.dev/e/state_invalid_export", (10, 40))),
    ("export_const_destructured/bind_value", "<script>\n\texport const { a } = { a: 1 };\n</script>\n<input bind:value={a} />\n{a}", Expect::Err("state_invalid_export", "Cannot export state from a module if it is reassigned. Either export a function returning the state value or only mutate the state value's properties\nhttps://svelte.dev/e/state_invalid_export", (10, 40))),
    ("export_const_destructured/read_only", "<script>\n\texport const { a } = { a: 1 };\n</script>\n<p>{a}</p>", Expect::Ok(&[])),
    ("export_const_array/handler_assign", "<script>\n\texport const [a] = [1];\n</script>\n<button onclick={() => a = 2}>{a}</button>", Expect::Err("state_invalid_export", "Cannot export state from a module if it is reassigned. Either export a function returning the state value or only mutate the state value's properties\nhttps://svelte.dev/e/state_invalid_export", (10, 33))),
    ("export_const_array/handler_update", "<script>\n\texport const [a] = [1];\n</script>\n<button onclick={() => a++}>{a}</button>", Expect::Err("state_invalid_export", "Cannot export state from a module if it is reassigned. Either export a function returning the state value or only mutate the state value's properties\nhttps://svelte.dev/e/state_invalid_export", (10, 33))),
    ("export_const_array/script_fn_assign", "<script>\n\texport const [a] = [1];\n\tfunction f() { a = 2; }\n</script>\n<button onclick={f}>{a}</button>", Expect::Err("state_invalid_export", "Cannot export state from a module if it is reassigned. Either export a function returning the state value or only mutate the state value's properties\nhttps://svelte.dev/e/state_invalid_export", (10, 33))),
    ("export_const_array/bind_value", "<script>\n\texport const [a] = [1];\n</script>\n<input bind:value={a} />\n{a}", Expect::Err("state_invalid_export", "Cannot export state from a module if it is reassigned. Either export a function returning the state value or only mutate the state value's properties\nhttps://svelte.dev/e/state_invalid_export", (10, 33))),
    ("export_const_array/read_only", "<script>\n\texport const [a] = [1];\n</script>\n<p>{a}</p>", Expect::Ok(&[])),
    ("export_const_renamed/handler_assign", "<script>\n\tconst a = 1;\n\texport { a as b };\n</script>\n<button onclick={() => a = 2}>{a}</button>", Expect::Err("constant_assignment", "Cannot assign to constant\nhttps://svelte.dev/e/constant_assignment", (76, 81))),
    ("export_const_renamed/handler_update", "<script>\n\tconst a = 1;\n\texport { a as b };\n</script>\n<button onclick={() => a++}>{a}</button>", Expect::Err("constant_assignment", "Cannot assign to constant\nhttps://svelte.dev/e/constant_assignment", (76, 79))),
    ("export_const_renamed/script_fn_assign", "<script>\n\tconst a = 1;\n\texport { a as b };\n\tfunction f() { a = 2; }\n</script>\n<button onclick={f}>{a}</button>", Expect::Err("constant_assignment", "Cannot assign to constant\nhttps://svelte.dev/e/constant_assignment", (59, 64))),
    ("export_const_renamed/bind_value", "<script>\n\tconst a = 1;\n\texport { a as b };\n</script>\n<input bind:value={a} />\n{a}", Expect::Err("constant_binding", "Cannot bind to constant\nhttps://svelte.dev/e/constant_binding", (60, 74))),
    ("export_const_renamed/read_only", "<script>\n\tconst a = 1;\n\texport { a as b };\n</script>\n<p>{a}</p>", Expect::Ok(&[])),
    ("import_binding/handler_assign", "<script>\n\timport { a } from './x.js';\n</script>\n<button onclick={() => a = 2}>{a}</button>", Expect::Err("constant_assignment", "Cannot assign to import\nhttps://svelte.dev/e/constant_assignment", (71, 76))),
    ("import_binding/handler_update", "<script>\n\timport { a } from './x.js';\n</script>\n<button onclick={() => a++}>{a}</button>", Expect::Err("constant_assignment", "Cannot assign to import\nhttps://svelte.dev/e/constant_assignment", (71, 74))),
    ("import_binding/script_fn_assign", "<script>\n\timport { a } from './x.js';\n\tfunction f() { a = 2; }\n</script>\n<button onclick={f}>{a}</button>", Expect::Err("constant_assignment", "Cannot assign to import\nhttps://svelte.dev/e/constant_assignment", (54, 59))),
    ("import_binding/bind_value", "<script>\n\timport { a } from './x.js';\n</script>\n<input bind:value={a} />\n{a}", Expect::Err("constant_binding", "Cannot bind to import\nhttps://svelte.dev/e/constant_binding", (55, 69))),
    ("import_binding/read_only", "<script>\n\timport { a } from './x.js';\n</script>\n<p>{a}</p>", Expect::Ok(&[])),
    ("export_const_runes/handler_assign", "<script>\n\texport const a = 1;\n\tlet n = $state(1);\n</script>\n<button onclick={() => a = 2}>{a}</button>", Expect::Err("constant_assignment", "Cannot assign to constant\nhttps://svelte.dev/e/constant_assignment", (83, 88))),
    ("export_const_runes/handler_update", "<script>\n\texport const a = 1;\n\tlet n = $state(1);\n</script>\n<button onclick={() => a++}>{a}</button>", Expect::Err("constant_assignment", "Cannot assign to constant\nhttps://svelte.dev/e/constant_assignment", (83, 86))),
    ("export_const_runes/script_fn_assign", "<script>\n\texport const a = 1;\n\tlet n = $state(1);\n\tfunction f() { a = 2; }\n</script>\n<button onclick={f}>{a}</button>", Expect::Err("constant_assignment", "Cannot assign to constant\nhttps://svelte.dev/e/constant_assignment", (66, 71))),
    ("export_const_runes/bind_value", "<script>\n\texport const a = 1;\n\tlet n = $state(1);\n</script>\n<input bind:value={a} />\n{a}", Expect::Err("constant_binding", "Cannot bind to constant\nhttps://svelte.dev/e/constant_binding", (67, 81))),
    ("export_const_runes/read_only", "<script>\n\texport const a = 1;\n\tlet n = $state(1);\n</script>\n<p>{a}</p>", Expect::Ok(&[])),
    ("plain_const_runes/handler_assign", "<script>\n\tconst a = 1;\n\tlet n = $state(1);\n</script>\n<button onclick={() => a = 2}>{a}</button>", Expect::Err("constant_assignment", "Cannot assign to constant\nhttps://svelte.dev/e/constant_assignment", (76, 81))),
    ("plain_const_runes/handler_update", "<script>\n\tconst a = 1;\n\tlet n = $state(1);\n</script>\n<button onclick={() => a++}>{a}</button>", Expect::Err("constant_assignment", "Cannot assign to constant\nhttps://svelte.dev/e/constant_assignment", (76, 79))),
    ("plain_const_runes/script_fn_assign", "<script>\n\tconst a = 1;\n\tlet n = $state(1);\n\tfunction f() { a = 2; }\n</script>\n<button onclick={f}>{a}</button>", Expect::Err("constant_assignment", "Cannot assign to constant\nhttps://svelte.dev/e/constant_assignment", (59, 64))),
    ("plain_const_runes/bind_value", "<script>\n\tconst a = 1;\n\tlet n = $state(1);\n</script>\n<input bind:value={a} />\n{a}", Expect::Err("constant_binding", "Cannot bind to constant\nhttps://svelte.dev/e/constant_binding", (60, 74))),
    ("plain_const_runes/read_only", "<script>\n\tconst a = 1;\n\tlet n = $state(1);\n</script>\n<p>{a}</p>", Expect::Ok(&[])),
    ("derived_export_const_instance", "<script>\n\tlet x = $state(1);\n\texport const a = $derived(x);\n</script>\n<p>{a}</p>", Expect::Err("derived_invalid_export", "Cannot export derived state from a module. To expose the current derived value, export a function returning its value\nhttps://svelte.dev/e/derived_invalid_export", (30, 59))),
    ("derived_export_specifier_instance", "<script>\n\tlet x = $state(1);\n\tconst a = $derived(x);\n\texport { a };\n</script>\n<p>{a}</p>", Expect::Ok(&[])),
    ("state_export_specifier_reassigned", "<script>\n\tlet a = $state(1);\n\texport { a };\n</script>\n<button onclick={() => a = 2}>{a}</button>", Expect::Ok(&[])),
    ("state_export_const_not_reassigned", "<script>\n\tlet x = $state(1);\n\tconst a = 1;\n\texport { a };\n</script>\n<p>{a}{x}</p>", Expect::Ok(&[("non_reactive_update", 36, 37)])),
    ("export_const_written_not_in_template", "<script>\n\texport const a = 1;\n\tfunction f() { a = 2; }\n</script>\n<button onclick={f}>b</button>", Expect::Err("constant_assignment", "Cannot assign to constant\nhttps://svelte.dev/e/constant_assignment", (46, 51))),
    ("derived_export_module", "<script module>\n\tlet x = $state(1);\n\texport const a = $derived(x);\n</script>\n<p>{a}</p>", Expect::Err("derived_invalid_export", "Cannot export derived state from a module. To expose the current derived value, export a function returning its value\nhttps://svelte.dev/e/derived_invalid_export", (37, 66))),
];

/// #3268: host element x attribute set. `svelte_element/spread_then_let` is not
/// generated: upstream throws a bare `Error("Not implemented: LetDirective")`
/// there, which is not a diagnostic to compare against.
#[rustfmt::skip]
const HOST_ATTRS: &[(&str, &str, Expect)] = &[
    ("svelte_window/spread_then_bind", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:window {...rest} bind:value={v} />\n<p>{v}</p>", Expect::Err("illegal_element_attribute", "`<svelte:window>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/illegal_element_attribute", (118, 127))),
    ("svelte_window/bind_then_spread", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:window bind:value={v} {...rest} />\n<p>{v}</p>", Expect::Err("illegal_element_attribute", "`<svelte:window>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/illegal_element_attribute", (133, 142))),
    ("svelte_window/spread_only", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:window {...rest} />\n<p>{v}</p>", Expect::Err("illegal_element_attribute", "`<svelte:window>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/illegal_element_attribute", (118, 127))),
    ("svelte_window/bind_only", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:window bind:value={v} />\n<p>{v}</p>", Expect::Err("bind_invalid_target", "`bind:value` can only be used with `<input>`, `<textarea>`, `<select>`\nhttps://svelte.dev/e/bind_invalid_target", (118, 132))),
    ("svelte_window/attr_then_bind", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:window title=\"t\" bind:value={v} />\n<p>{v}</p>", Expect::Err("illegal_element_attribute", "`<svelte:window>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/illegal_element_attribute", (118, 127))),
    ("svelte_window/bind_then_attr", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:window bind:value={v} title=\"t\" />\n<p>{v}</p>", Expect::Err("illegal_element_attribute", "`<svelte:window>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/illegal_element_attribute", (133, 142))),
    ("svelte_window/spread_then_on", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:window {...rest} on:click={f} />\n<p>{v}</p>", Expect::Err("illegal_element_attribute", "`<svelte:window>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/illegal_element_attribute", (118, 127))),
    ("svelte_window/spread_then_let", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:window {...rest} let:x />\n<p>{v}</p>", Expect::Err("illegal_element_attribute", "`<svelte:window>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/illegal_element_attribute", (118, 127))),
    ("svelte_document/spread_then_bind", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:document {...rest} bind:value={v} />\n<p>{v}</p>", Expect::Err("illegal_element_attribute", "`<svelte:document>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/illegal_element_attribute", (120, 129))),
    ("svelte_document/bind_then_spread", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:document bind:value={v} {...rest} />\n<p>{v}</p>", Expect::Err("illegal_element_attribute", "`<svelte:document>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/illegal_element_attribute", (135, 144))),
    ("svelte_document/spread_only", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:document {...rest} />\n<p>{v}</p>", Expect::Err("illegal_element_attribute", "`<svelte:document>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/illegal_element_attribute", (120, 129))),
    ("svelte_document/bind_only", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:document bind:value={v} />\n<p>{v}</p>", Expect::Err("bind_invalid_target", "`bind:value` can only be used with `<input>`, `<textarea>`, `<select>`\nhttps://svelte.dev/e/bind_invalid_target", (120, 134))),
    ("svelte_document/attr_then_bind", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:document title=\"t\" bind:value={v} />\n<p>{v}</p>", Expect::Err("illegal_element_attribute", "`<svelte:document>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/illegal_element_attribute", (120, 129))),
    ("svelte_document/bind_then_attr", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:document bind:value={v} title=\"t\" />\n<p>{v}</p>", Expect::Err("illegal_element_attribute", "`<svelte:document>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/illegal_element_attribute", (135, 144))),
    ("svelte_document/spread_then_on", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:document {...rest} on:click={f} />\n<p>{v}</p>", Expect::Err("illegal_element_attribute", "`<svelte:document>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/illegal_element_attribute", (120, 129))),
    ("svelte_document/spread_then_let", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:document {...rest} let:x />\n<p>{v}</p>", Expect::Err("illegal_element_attribute", "`<svelte:document>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/illegal_element_attribute", (120, 129))),
    ("svelte_body/spread_then_bind", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:body {...rest} bind:value={v} />\n<p>{v}</p>", Expect::Err("svelte_body_illegal_attribute", "`<svelte:body>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/svelte_body_illegal_attribute", (116, 125))),
    ("svelte_body/bind_then_spread", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:body bind:value={v} {...rest} />\n<p>{v}</p>", Expect::Err("svelte_body_illegal_attribute", "`<svelte:body>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/svelte_body_illegal_attribute", (131, 140))),
    ("svelte_body/spread_only", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:body {...rest} />\n<p>{v}</p>", Expect::Err("svelte_body_illegal_attribute", "`<svelte:body>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/svelte_body_illegal_attribute", (116, 125))),
    ("svelte_body/bind_only", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:body bind:value={v} />\n<p>{v}</p>", Expect::Err("bind_invalid_target", "`bind:value` can only be used with `<input>`, `<textarea>`, `<select>`\nhttps://svelte.dev/e/bind_invalid_target", (116, 130))),
    ("svelte_body/attr_then_bind", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:body title=\"t\" bind:value={v} />\n<p>{v}</p>", Expect::Err("svelte_body_illegal_attribute", "`<svelte:body>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/svelte_body_illegal_attribute", (116, 125))),
    ("svelte_body/bind_then_attr", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:body bind:value={v} title=\"t\" />\n<p>{v}</p>", Expect::Err("svelte_body_illegal_attribute", "`<svelte:body>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/svelte_body_illegal_attribute", (131, 140))),
    ("svelte_body/spread_then_on", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:body {...rest} on:click={f} />\n<p>{v}</p>", Expect::Err("svelte_body_illegal_attribute", "`<svelte:body>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/svelte_body_illegal_attribute", (116, 125))),
    ("svelte_body/spread_then_let", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:body {...rest} let:x />\n<p>{v}</p>", Expect::Err("svelte_body_illegal_attribute", "`<svelte:body>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/svelte_body_illegal_attribute", (116, 125))),
    ("svelte_head/spread_then_bind", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:head {...rest} bind:value={v} />\n<p>{v}</p>", Expect::Err("svelte_head_illegal_attribute", "`<svelte:head>` cannot have attributes nor directives\nhttps://svelte.dev/e/svelte_head_illegal_attribute", (116, 125))),
    ("svelte_head/bind_then_spread", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:head bind:value={v} {...rest} />\n<p>{v}</p>", Expect::Err("svelte_head_illegal_attribute", "`<svelte:head>` cannot have attributes nor directives\nhttps://svelte.dev/e/svelte_head_illegal_attribute", (116, 130))),
    ("svelte_head/spread_only", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:head {...rest} />\n<p>{v}</p>", Expect::Err("svelte_head_illegal_attribute", "`<svelte:head>` cannot have attributes nor directives\nhttps://svelte.dev/e/svelte_head_illegal_attribute", (116, 125))),
    ("svelte_head/bind_only", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:head bind:value={v} />\n<p>{v}</p>", Expect::Err("svelte_head_illegal_attribute", "`<svelte:head>` cannot have attributes nor directives\nhttps://svelte.dev/e/svelte_head_illegal_attribute", (116, 130))),
    ("svelte_head/attr_then_bind", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:head title=\"t\" bind:value={v} />\n<p>{v}</p>", Expect::Err("svelte_head_illegal_attribute", "`<svelte:head>` cannot have attributes nor directives\nhttps://svelte.dev/e/svelte_head_illegal_attribute", (116, 125))),
    ("svelte_head/bind_then_attr", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:head bind:value={v} title=\"t\" />\n<p>{v}</p>", Expect::Err("svelte_head_illegal_attribute", "`<svelte:head>` cannot have attributes nor directives\nhttps://svelte.dev/e/svelte_head_illegal_attribute", (116, 130))),
    ("svelte_head/spread_then_on", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:head {...rest} on:click={f} />\n<p>{v}</p>", Expect::Err("svelte_head_illegal_attribute", "`<svelte:head>` cannot have attributes nor directives\nhttps://svelte.dev/e/svelte_head_illegal_attribute", (116, 125))),
    ("svelte_head/spread_then_let", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:head {...rest} let:x />\n<p>{v}</p>", Expect::Err("svelte_head_illegal_attribute", "`<svelte:head>` cannot have attributes nor directives\nhttps://svelte.dev/e/svelte_head_illegal_attribute", (116, 125))),
    ("div/spread_then_bind", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<div {...rest} bind:value={v} />\n<p>{v}</p>", Expect::Err("bind_invalid_target", "`bind:value` can only be used with `<input>`, `<textarea>`, `<select>`\nhttps://svelte.dev/e/bind_invalid_target", (118, 132))),
    ("div/bind_then_spread", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<div bind:value={v} {...rest} />\n<p>{v}</p>", Expect::Err("bind_invalid_target", "`bind:value` can only be used with `<input>`, `<textarea>`, `<select>`\nhttps://svelte.dev/e/bind_invalid_target", (108, 122))),
    ("div/spread_only", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<div {...rest} />\n<p>{v}</p>", Expect::Ok(&[("element_invalid_self_closing_tag", 103, 120)])),
    ("div/bind_only", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<div bind:value={v} />\n<p>{v}</p>", Expect::Err("bind_invalid_target", "`bind:value` can only be used with `<input>`, `<textarea>`, `<select>`\nhttps://svelte.dev/e/bind_invalid_target", (108, 122))),
    ("div/attr_then_bind", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<div title=\"t\" bind:value={v} />\n<p>{v}</p>", Expect::Err("bind_invalid_target", "`bind:value` can only be used with `<input>`, `<textarea>`, `<select>`\nhttps://svelte.dev/e/bind_invalid_target", (118, 132))),
    ("div/bind_then_attr", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<div bind:value={v} title=\"t\" />\n<p>{v}</p>", Expect::Err("bind_invalid_target", "`bind:value` can only be used with `<input>`, `<textarea>`, `<select>`\nhttps://svelte.dev/e/bind_invalid_target", (108, 122))),
    ("div/spread_then_on", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<div {...rest} on:click={f} />\n<p>{v}</p>", Expect::Ok(&[("element_invalid_self_closing_tag", 103, 133)])),
    ("div/spread_then_let", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<div {...rest} let:x />\n<p>{v}</p>", Expect::Ok(&[("element_invalid_self_closing_tag", 103, 126)])),
    ("input/spread_then_bind", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<input {...rest} bind:value={v} />\n<p>{v}</p>", Expect::Ok(&[])),
    ("input/bind_then_spread", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<input bind:value={v} {...rest} />\n<p>{v}</p>", Expect::Ok(&[])),
    ("input/spread_only", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<input {...rest} />\n<p>{v}</p>", Expect::Ok(&[])),
    ("input/bind_only", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<input bind:value={v} />\n<p>{v}</p>", Expect::Ok(&[])),
    ("input/attr_then_bind", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<input title=\"t\" bind:value={v} />\n<p>{v}</p>", Expect::Ok(&[])),
    ("input/bind_then_attr", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<input bind:value={v} title=\"t\" />\n<p>{v}</p>", Expect::Ok(&[])),
    ("input/spread_then_on", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<input {...rest} on:click={f} />\n<p>{v}</p>", Expect::Ok(&[])),
    ("input/spread_then_let", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<input {...rest} let:x />\n<p>{v}</p>", Expect::Ok(&[])),
    ("svelte_element/spread_then_bind", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:element this=\"div\" {...rest} bind:value={v} />\n<p>{v}</p>", Expect::Err("bind_invalid_target", "`bind:value` can only be used with `<input>`, `<textarea>`, `<select>`\nhttps://svelte.dev/e/bind_invalid_target", (140, 154))),
    ("svelte_element/bind_then_spread", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:element this=\"div\" bind:value={v} {...rest} />\n<p>{v}</p>", Expect::Err("bind_invalid_target", "`bind:value` can only be used with `<input>`, `<textarea>`, `<select>`\nhttps://svelte.dev/e/bind_invalid_target", (130, 144))),
    ("svelte_element/spread_only", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:element this=\"div\" {...rest} />\n<p>{v}</p>", Expect::Ok(&[("svelte_element_invalid_this", 119, 129)])),
    ("svelte_element/bind_only", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:element this=\"div\" bind:value={v} />\n<p>{v}</p>", Expect::Err("bind_invalid_target", "`bind:value` can only be used with `<input>`, `<textarea>`, `<select>`\nhttps://svelte.dev/e/bind_invalid_target", (130, 144))),
    ("svelte_element/attr_then_bind", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:element this=\"div\" title=\"t\" bind:value={v} />\n<p>{v}</p>", Expect::Err("bind_invalid_target", "`bind:value` can only be used with `<input>`, `<textarea>`, `<select>`\nhttps://svelte.dev/e/bind_invalid_target", (140, 154))),
    ("svelte_element/bind_then_attr", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:element this=\"div\" bind:value={v} title=\"t\" />\n<p>{v}</p>", Expect::Err("bind_invalid_target", "`bind:value` can only be used with `<input>`, `<textarea>`, `<select>`\nhttps://svelte.dev/e/bind_invalid_target", (130, 144))),
    ("svelte_element/spread_then_on", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<svelte:element this=\"div\" {...rest} on:click={f} />\n<p>{v}</p>", Expect::Ok(&[("svelte_element_invalid_this", 119, 129)])),
    ("component/spread_then_bind", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<Comp {...rest} bind:value={v} />\n<p>{v}</p>", Expect::Ok(&[])),
    ("component/bind_then_spread", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<Comp bind:value={v} {...rest} />\n<p>{v}</p>", Expect::Ok(&[])),
    ("component/spread_only", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<Comp {...rest} />\n<p>{v}</p>", Expect::Ok(&[])),
    ("component/bind_only", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<Comp bind:value={v} />\n<p>{v}</p>", Expect::Ok(&[])),
    ("component/attr_then_bind", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<Comp title=\"t\" bind:value={v} />\n<p>{v}</p>", Expect::Ok(&[])),
    ("component/bind_then_attr", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<Comp bind:value={v} title=\"t\" />\n<p>{v}</p>", Expect::Ok(&[])),
    ("component/spread_then_on", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<Comp {...rest} on:click={f} />\n<p>{v}</p>", Expect::Ok(&[])),
    ("component/spread_then_let", "<script>\n\timport Comp from './Comp.svelte';\n\tlet rest = {};\n\tlet v = 1;\n\tconst f = () => {};\n</script>\n<Comp {...rest} let:x />\n<p>{v}</p>", Expect::Ok(&[])),
];

#[test]
fn export_const_write_matches_official() {
    run("export_write", EXPORT_WRITE);
}

#[test]
fn host_attribute_precedence_matches_official() {
    run("host_attrs", HOST_ATTRS);
}
