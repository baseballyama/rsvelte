//! `$inspect.trace(…)` in a `.svelte.(js|ts)` module.
//!
//! The dev lowering existed only for a component instance script, so a module
//! emitted the rune verbatim and threw `ReferenceError: $inspect is not
//! defined` the moment it ran — the one shape in this family that produces
//! code that does not run rather than code that differs by bytes. The non-dev
//! removal was a `memmem` scan, which deleted the same bytes out of a string
//! literal.

use rsvelte_core::{GenerateMode, ModuleCompileOptions, compile_module};

fn module(src: &str, dev: bool) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("m.svelte.js".into()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

/// The reported shape: nothing lowered it, so `$inspect` reached the output.
#[test]
fn a_dev_module_lowers_the_rune_into_a_trace_call() {
    let out = module(
        "let base = $state(1);\nexport function go() { $inspect.trace(\"t\"); return base; }\n",
        true,
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        !out.contains("$inspect"),
        "the rune survived into the output:\n{out}"
    );
    assert!(out.contains("$.trace(() => \"t\", () => {"), "{out}");
    assert!(
        out.contains("import 'svelte/internal/flags/tracing';"),
        "{out}"
    );
}

/// Without an argument the label is `get_function_label() ?? 'trace'` plus
/// `locate_node(fn)` — a position in the source the user wrote, which is why
/// the pass runs before the other module rewrites move the function.
#[test]
fn the_default_label_names_the_function_and_where_it_stands() {
    let out = module(
        "let base = $state(1);\nexport function go() { $inspect.trace(); return base; }\n",
        true,
    );
    assert!(out.contains("() => 'go (m.svelte.js:2:7)'"), "{out}");
}

/// Each call is located from its own function. The text predecessor searched
/// the whole source for the first `$inspect.trace(`, so both labels named the
/// first one.
#[test]
fn two_traced_functions_do_not_share_one_label() {
    let out = module(
        "let base = $state(1);\nexport function a() { $inspect.trace(); return base; }\nexport function b() { $inspect.trace(); return base; }\n",
        true,
    );
    assert!(out.contains("() => 'a (m.svelte.js:2:7)'"), "{out}");
    assert!(out.contains("() => 'b (m.svelte.js:3:7)'"), "{out}");
}

/// Both directions of the removal: non-dev drops the statement, and the same
/// bytes inside a string literal are not the rune in either mode.
#[test]
fn a_string_literal_is_not_a_trace_call() {
    for dev in [true, false] {
        let out = module(
            "let base = $state(1);\nexport const s = \"$inspect.trace()\";\nexport function go() { return base; }\n",
            dev,
        );
        assert!(!out.contains("COMPILE_ERROR"), "dev={dev}\n{out}");
        assert!(
            out.contains("\"$inspect.trace()\""),
            "the string literal was rewritten (dev={dev}):\n{out}"
        );
    }
}

#[test]
fn a_non_dev_module_only_drops_the_statement() {
    let out = module(
        "let base = $state(1);\nexport function go() { $inspect.trace(); return base; }\n",
        false,
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(!out.contains("$inspect"), "{out}");
    assert!(!out.contains("$.trace"), "{out}");
    assert!(!out.contains("flags/tracing"), "{out}");
    assert!(out.contains("return base;"), "{out}");
}

/// An `async` function awaits the traced thunk, which the instance path's
/// predecessor did not model at all.
#[test]
fn an_async_function_awaits_the_traced_body() {
    let out = module(
        "let base = $state(1);\nexport async function go() { $inspect.trace(); return base; }\n",
        true,
    );
    assert!(
        out.contains("return await $.trace(() => 'go (m.svelte.js:2:7)', async () => {"),
        "{out}"
    );
}

/// The rune reaches this pipeline through two entry points (a `.svelte.(js|ts)`
/// module and a component's `<script module>`) crossed with target and mode, and
/// only ONE of those eight cells lowers it — every other cell removes it. The
/// lowering therefore cannot replace the removal; both have to stand. Read off
/// the official compiler for all eight.
#[test]
fn every_target_and_mode_still_drops_the_rune() {
    use rsvelte_core::{CompileOptions, compile, compiler::CssMode};

    const SRC: &str =
        "let base = $state(1);\nexport function go() { $inspect.trace(); return base; }\n";
    const COMPONENT: &str = "<script module>\nlet base = $state(1);\nexport function go() { $inspect.trace(); return base; }\n</script>\n<p>x</p>\n";

    let component = |generate: GenerateMode, dev: bool| {
        compile(
            COMPONENT,
            CompileOptions {
                filename: Some("C.svelte".into()),
                generate,
                dev,
                css: CssMode::External,
                ..Default::default()
            },
        )
        .map(|r| r.js.code)
        .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
    };
    let module_target = |generate: GenerateMode, dev: bool| {
        compile_module(
            SRC,
            ModuleCompileOptions {
                filename: Some("m.svelte.js".into()),
                generate,
                dev,
                ..Default::default()
            },
        )
        .map(|r| r.js.code)
        .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
    };

    // The one cell that lowers.
    let lowered = module_target(GenerateMode::Client, true);
    assert!(lowered.contains("$.trace("), "{lowered}");

    for (name, out) in [
        (
            "module client prod",
            module_target(GenerateMode::Client, false),
        ),
        (
            "module server dev",
            module_target(GenerateMode::Server, true),
        ),
        (
            "module server prod",
            module_target(GenerateMode::Server, false),
        ),
        (
            "component <script module> client prod",
            component(GenerateMode::Client, false),
        ),
        (
            "component <script module> server dev",
            component(GenerateMode::Server, true),
        ),
        (
            "component <script module> server prod",
            component(GenerateMode::Server, false),
        ),
    ] {
        assert!(!out.contains("$inspect"), "{name} kept the rune:\n{out}");
        assert!(!out.contains("$.trace("), "{name} lowered it:\n{out}");
    }
}
