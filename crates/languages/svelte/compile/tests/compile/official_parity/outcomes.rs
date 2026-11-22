//! The assertions the parity tables share: what svelte 5.57.3 raises for each source.

use rsvelte_svelte_compile::{CompileOptions, ModuleCompileOptions};

/// The code, the first line of the message and where svelte's error is, or `None` where svelte
/// compiles.
pub(super) type Outcome<'a> = Option<(&'a str, &'a str, u32)>;

/// Asserts each `(module, message, at)`, acorn's error from svelte 5.57.3, in a component's script
/// (offset by `<script>`) and in a `.svelte.js` module.
pub(super) fn assert_script_and_module_errors(cases: &[(&str, &str, u32)]) {
    let raised = |error: rsvelte_kernel::diagnostics::Diagnostic| {
        (
            error.code.to_string(),
            error.message.lines().next().map(str::to_owned),
            error.span.start_offset,
        )
    };
    for &(module, message, at) in cases {
        let expected = |at| ("js_parse_error".to_owned(), Some(message.to_owned()), at);
        let script = format!("<script>{module}</script>");
        let component =
            rsvelte_svelte_compile::compile(&script, &CompileOptions::default()).map(|_| ());
        assert_eq!(component.map_err(raised), Err(expected(at + 8)), "{script}");
        let module_options = ModuleCompileOptions::default();
        let compiled = rsvelte_svelte_compile::compile_module(module, &module_options).map(|_| ());
        assert_eq!(compiled.map_err(raised), Err(expected(at)), "{module}");
    }
}

/// Asserts what compiling each component gives: the code, the first line of the message and where
/// the error is, from svelte 5.57.3 in runes mode, or `None` where it compiles.
pub(super) fn assert_component_outcomes(cases: &[(&str, Outcome<'_>)]) {
    for &(source, expected) in cases {
        let outcome = rsvelte_svelte_compile::compile(source, &CompileOptions::default());
        let raised = outcome.err().map(|error| {
            (
                error.code.to_string(),
                error.message.lines().next().map(str::to_owned),
                error.span.start_offset,
            )
        });
        let expected =
            expected.map(|(code, message, at)| (code.to_owned(), Some(message.to_owned()), at));
        assert_eq!(raised, expected, "{source}");
    }
}
