//! Upstream resolves the component name against the module scope
//! (`module.scope.generate`) *before* the template walk, so a diagnostic emitted
//! during the walk interpolates the deconflicted name. rsvelte applied the
//! conflict suffix after the walk, so `svelte_self_deprecated` printed the
//! pre-conflict name while codegen used the suffixed one.
//!
//! `svelte_self_deprecated` is the only phase-2 diagnostic that reads
//! `analysis.name`, so it is also the only observer of the ordering; the corpus
//! warning gate compares `(code, line, column)` and never the message.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// `input.svelte` yields the component name `Input`, which the instance script
/// already declares — upstream therefore names the component `Input_1`.
const CONFLICTING: &str = "<script>\n\
\tlet { n = 5 } = $props();\n\
\tconst Input = 1;\n\
\tconsole.log(Input);\n\
</script>\n\
\n\
{#if n === 0}\n\
\t<p>lift-off!</p>\n\
{:else}\n\
\t<svelte:self n={n - 1} />\n\
{/if}\n";

/// Same component with nothing shadowing `Input`, as the negative control: the
/// name must stay unsuffixed, so a fix that suffixes unconditionally fails here.
const CLEAN: &str = "<script>\n\
\tlet { n = 5 } = $props();\n\
</script>\n\
\n\
{#if n === 0}\n\
\t<p>lift-off!</p>\n\
{:else}\n\
\t<svelte:self n={n - 1} />\n\
{/if}\n";

fn compiled(src: &str) -> (String, String) {
    let result = compile(
        src,
        CompileOptions {
            filename: Some("input.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile");

    let message = result
        .warnings
        .iter()
        .find(|w| w.code == "svelte_self_deprecated")
        .expect("svelte_self_deprecated was not emitted")
        .message
        .clone();

    (message, result.js.code)
}

#[test]
fn warning_names_the_deconflicted_component() {
    let (message, _) = compiled(CONFLICTING);
    assert!(
        message.contains("import Input_1 "),
        "expected the deconflicted name `Input_1`, got: {message}"
    );
}

/// The warning and the emitted function must agree — that agreement is what the
/// ordering buys, and asserting only the message would let them drift apart.
#[test]
fn warning_and_codegen_agree_on_the_name() {
    let (message, js) = compiled(CONFLICTING);
    assert!(
        js.contains("function Input_1("),
        "codegen must still deconflict to `Input_1`, got:\n{js}"
    );
    assert!(
        message.contains("import Input_1 "),
        "warning must name what codegen emitted, got: {message}"
    );
}

#[test]
fn unconflicted_component_keeps_its_plain_name() {
    let (message, js) = compiled(CLEAN);
    assert!(
        message.contains("import Input "),
        "expected the plain name `Input`, got: {message}"
    );
    assert!(
        js.contains("function Input("),
        "codegen must not suffix an unconflicted name, got:\n{js}"
    );
}
