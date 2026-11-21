//! Upstream's `transition_duplicate` and `transition_conflict`, which both the compile walk and
//! the warnings walk raise.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_compile::{CompileInput, Target, compile_to_javascript};
use rsvelte_svelte_semantic::analyze;
use rsvelte_svelte_semantic::input::ComponentInput;
use rsvelte_svelte_semantic::warnings::{Options, warnings};

#[test]
fn a_second_intro_or_outro_is_a_duplicate_or_a_conflict_whatever_its_modifiers() {
    for (markup, code) in [
        ("<div in:a|global in:b>x</div>", "transition_duplicate"),
        (
            "<div transition:a out:b|local>x</div>",
            "transition_conflict",
        ),
        ("<div in:a out:b>x</div>", ""),
        (
            "<svelte:element this=\"div\" in:a transition:b />",
            "transition_conflict",
        ),
    ] {
        let (compiled, warned) = compile_and_warn(markup);
        let key = |d: &Diagnostic| {
            let span = (d.span.start_offset, d.span.end_offset);
            (d.code.to_string(), span, d.message.clone())
        };
        // The compile walk and the warnings walk both raise it, and must agree on all of it.
        assert_eq!(
            compiled.as_ref().map(key),
            warned.as_ref().map(key),
            "{markup}"
        );
        let found = compiled.map(|d| d.code.to_string());
        assert_eq!(found.as_deref().unwrap_or(""), code, "{markup}");
    }
}

/// The error the compile walk stops at, and the first the warnings walk raises, as the compiler
/// is configured.
fn compile_and_warn(source: &str) -> (Option<Diagnostic>, Option<Diagnostic>) {
    let component = rsvelte_svelte_syntax::parse::parse(source).expect("parses");
    let tree = rsvelte_svelte_semantic::compiler_syntax_tree::lower(&component, source);
    let resolution = rsvelte_svelte_semantic::resolve_component(&component, &tree);
    let input = CompileInput::from(ComponentInput::new(&component, &tree, source, "App.svelte"));
    let analysis = analyze::analyze(&input.component, &resolution);
    let compiled = compile_to_javascript(&input, &resolution, &analysis, Target::Client).err();
    let options = Options {
        runes: Some(true),
        custom_element: false,
    };
    let found = warnings(
        &component,
        &tree,
        &resolution,
        Some(&analysis),
        source,
        Some("App.svelte"),
        options,
    );
    (compiled, found.first_error(&component, false))
}
