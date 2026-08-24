//! Three ways the client decided "is this read reactive state" without asking
//! upstream's `scope.evaluate(node).is_known` (issues #3263, #3289, #3298).
//!
//! Upstream's `Identifier` visitor is
//! `has_state ||= kind !== 'static' && (… || !binding.is_function()) &&
//! !scope.evaluate(node).is_known`, and `scope.evaluate` never consults how the
//! declaration was lowered — which is where all three diverged. Each expected
//! string below is what `submodules/svelte`'s compiler emits for the source.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

/// #3263: a `{@const}` bound to a function declaration. Upstream evaluates a
/// function to the `FUNCTION` symbol, and a symbol forces `is_known = false`,
/// so the read stays reactive and needs a `template_effect`.
#[test]
fn const_tag_bound_to_a_function_is_reactive() {
    let out = client(
        "<script>\n\tfunction a() { return 1; }\n</script>\n{#if true}{@const c = a}<i>{c}</i>{/if}\n",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("$.template_effect(() => $.set_text(text, $.get(c)))"),
        "expected a template_effect around the {{@const}} read: {out}"
    );
    assert!(
        out.contains("`<i> </i>`"),
        "expected the text placeholder in the template: {out}"
    );
}

/// The other half of the same term: a `{@const}` whose value *is* a function
/// literal reads as non-reactive, matching upstream's `!binding.is_function()`.
#[test]
fn const_tag_bound_to_a_function_literal_is_not_reactive() {
    let out = client("{#if true}{@const c = () => 1}<i>{c}</i>{/if}\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        !out.contains("template_effect"),
        "a function-literal {{@const}} read must not need an effect: {out}"
    );
}

/// #3289: `customElement` forces `accessors`, which keeps the `$.state(…)`
/// declaration — but the read of a never-written `$state` is still known.
#[test]
fn custom_element_keeps_the_declaration_but_not_the_read_reactive() {
    let out = client(
        "<svelte:options customElement=\"my-el\" />\n<script>\n\tlet n = $state(1);\n</script>\n<p>{n}</p>\n",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("let n = $.state(1);"), "{out}");
    assert!(
        out.contains("p.textContent = $.get(n);"),
        "expected a one-shot textContent write: {out}"
    );
    assert!(
        out.contains("`<p></p>`"),
        "expected no text placeholder in the template: {out}"
    );
}

/// Same cause one level down: a `$derived` over a never-written `$state` is
/// known too, so `customElement` must not make its read reactive either.
#[test]
fn custom_element_derived_read_is_not_reactive() {
    let out = client(
        "<svelte:options customElement=\"my-el\" />\n<script>\n\tlet n = $state(1);\n\tlet d = $derived(n * 2);\n</script>\n<p>{d}</p>\n",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("p.textContent = $.get(d);"),
        "expected a one-shot textContent write: {out}"
    );
}

/// A bare `$state()` evaluates to `undefined`, a known value, whatever
/// `is_state_source` decided about the declaration.
#[test]
fn custom_element_bare_state_read_is_not_reactive() {
    let out = client(
        "<svelte:options customElement=\"my-el\" />\n<script>\n\tlet n = $state();\n</script>\n<p>{n}</p>\n",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("let n = $.state(void 0);"), "{out}");
    assert!(
        out.contains("p.textContent = $.get(n);"),
        "expected a one-shot textContent write: {out}"
    );
}

/// A written `$state` under `customElement` is the negative control: its read
/// must stay reactive.
#[test]
fn custom_element_written_state_read_stays_reactive() {
    let out = client(
        "<svelte:options customElement=\"my-el\" />\n<script>\n\tlet n = $state(1);\n</script>\n<p onclick={() => n++}>{n}</p>\n",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("$.template_effect(() => $.set_text(text, $.get(n)))"),
        "a written $state read must keep its effect: {out}"
    );
}

/// #3298: upstream's `globals` table folds a pure global call over known
/// arguments to a known value, so the `{@const}` reading it needs no effect.
#[test]
fn const_tag_over_a_pure_global_call_is_not_reactive() {
    let out = client("{#if true}{@const w = \"A\"}{#if true}{@const c = String(w)}{c}{/if}{/if}\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("text.nodeValue = $.get(c);"),
        "expected a direct nodeValue assignment: {out}"
    );
    assert!(!out.contains("template_effect"), "{out}");
}

/// A global with no fold function contributes only a type marker, which is a
/// symbol and so never known — the negative control for the table above.
#[test]
fn const_tag_over_an_unfoldable_global_call_stays_reactive() {
    let out = client("{#if true}{@const c = Math.random()}{c}{/if}\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("$.template_effect(() => $.set_text(text, $.get(c)))"),
        "Math.random() is not a known value: {out}"
    );
}

/// A shadowed global is not a global: `get_global_keypath` returns null when the
/// root identifier resolves to a binding.
#[test]
fn a_shadowed_global_is_not_a_pure_call() {
    let out = client(
        "<script>\n\tlet n = $state(0);\n\tconst String = (v) => v + n;\n</script>\n{#if true}{@const c = String(\"A\")}{c}{/if}\n",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("template_effect"),
        "a shadowed `String` must not be folded as a global: {out}"
    );
}
