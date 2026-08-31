//! The `?? ''` guard on a template hole, a `<title>` assignment and an
//! `option.value` is upstream's `scope.evaluate(value).is_defined`, and rsvelte
//! answered it in two places: the shared estree walk and a hand-written table of
//! binding shapes. The table was missing function bindings and every `$state`
//! binding that is never written, so the guard was added where upstream omits
//! it; `<title>` compounded that by evaluating the SOURCE expression, so a
//! legacy `$.untrack(…)` wrapper never made the chunk unknown and the guard was
//! omitted where upstream adds it. Every test below therefore has a control in
//! the opposite direction: a one-directional fix passes half of them.

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

#[test]
fn a_function_binding_needs_no_nullish_guard_and_a_reassigned_one_does() {
    let out = client(
        "<script>\n\tfunction fn() {}\n\tconst arrow = () => 1;\n\tlet reassigned = () => 2;\n\treassigned = () => 3;\n</script>\n\n<p>{fn}{arrow}{reassigned}</p>\n",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("`${fn}${arrow}${$.get(reassigned) ?? ''}`"),
        "{out}"
    );
}

#[test]
fn an_option_value_reads_bare_when_every_branch_is_defined() {
    let out = client(
        "<script>\n\tlet n = $state(1);\n\tlet maybe = $state();\n</script>\n\n<select><option value={n || 'a'}>logical</option></select>\n<select><option value={maybe}>maybe</option></select>\n",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("option.__value = n || 'a';"), "{out}");
    // The control: an unset `$state()` is `undefined`, so this one keeps it.
    assert!(out.contains("(option_1.__value = maybe) ?? ''"), "{out}");
}

#[test]
fn a_title_is_graded_on_the_value_that_was_built_not_on_its_source() {
    // Legacy: the chunk is built as `$.untrack(() => …)`, which upstream
    // evaluates as unknown however defined the source ternary looks.
    let untracked = client(
        "<script>\n\texport let data;\n\tconst region = data.props?.region || null;\n\tlet c = 0;\n\t$: d = c * 2;\n</script>\n\n<svelte:head>\n\t<title>{region ? `Cities in ${region.name}` : 'Cities'}</title>\n</svelte:head>\n<button on:click={() => c++}>{d}</button>\n",
    );
    assert!(!untracked.contains("COMPILE_ERROR"), "{untracked}");
    assert!(untracked.contains(") ?? '';"), "{untracked}");

    // The control: a template literal is a definite string on both sides, so
    // grading the built value must not append a guard to everything.
    let bare = client(
        "<script>\n\tlet x = $state(1);\n</script>\n\n<svelte:head>\n\t<title>{`a${x}`}</title>\n</svelte:head>\n<button onclick={() => x++}>go</button>\n",
    );
    assert!(!bare.contains("COMPILE_ERROR"), "{bare}");
    assert!(
        bare.contains("$.document.title = `a${$.get(x)}`;"),
        "{bare}"
    );
}
