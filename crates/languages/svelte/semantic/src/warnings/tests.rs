use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;
use rsvelte_svelte_syntax::Parsed;

use super::{CompileWarnings, Options};
use crate::{Analyzed, Lowered, Resolved};

/// What `svelte.compile` with `runes: true` warns about `code`, as each warning's code, source
/// text and message.
pub(super) fn compiled(code: &str) -> Vec<(String, String, String)> {
    let (warnings, _) = compiled_with_errors(code, Some(true));
    warnings
}

/// [`compiled`] with the `runes` option, and the codes of the errors the analysis raises.
pub(super) fn compiled_with_errors(
    code: &str,
    runes: Option<bool>,
) -> (Vec<(String, String, String)>, Vec<String>) {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document = Document::new("Test.svelte".to_owned(), code.to_owned()).expect("small");
    let context = DocumentContext::new(&document, registry.artifacts());
    let component = context.get::<Parsed>().as_ref().expect("parses");
    let lowered = context.get::<Lowered>().as_ref().expect("lowers");
    let resolution = context.get::<Resolved>().as_ref().expect("resolves");
    let options = Options {
        runes,
        custom_element: false,
    };
    let analysis = context.get::<Analyzed>().as_ref();
    let found = super::warnings(
        component,
        lowered,
        resolution,
        analysis,
        code,
        Some("Test.svelte"),
        options,
    );
    let warnings = found
        .compiled()
        .map(|w| {
            let text = w.span.text(code).to_owned();
            (w.code.to_string(), text, w.message.clone())
        })
        .collect();
    let errors = found
        .errors
        .iter()
        .map(|(_, e)| e.code.to_string())
        .collect();
    (warnings, errors)
}

/// The source text of each `code` warning.
pub(super) fn texts(code: &str, source: &str) -> Vec<String> {
    compiled(source)
        .into_iter()
        .filter(|(c, ..)| c == code)
        .map(|(_, text, _)| text)
        .collect()
}

/// Each warning's code and message, its link left out.
pub(super) fn messages(source: &str) -> Vec<(String, String)> {
    compiled(source)
        .into_iter()
        .map(|(code, _, message)| {
            let message = message.split('\n').next().unwrap_or_default().to_owned();
            (code, message)
        })
        .collect()
}

#[test]
fn the_tables_come_from_the_svelte_the_oracle_installs() {
    let package = include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../../../tools/oracle/package.json"
    ));
    let pinned = package
        .split("\"svelte\": \"")
        .nth(1)
        .and_then(|rest| rest.split('"').next())
        .expect("the oracle pins svelte");
    for vendored in [
        include_str!("vendor/codes.rs"),
        include_str!("vendor/a11y.rs"),
    ] {
        let header = vendored.lines().next().expect("a header");
        assert_eq!(
            header
                .strip_prefix("// svelte ")
                .and_then(|rest| rest.split(',').next()),
            Some(pinned),
            "{header}: the oracle installs svelte {pinned}; run `node tools/oracle/oracle.ts \
                warnings`"
        );
    }
}

#[test]
fn every_checked_code_is_a_svelte_code() {
    for code in CompileWarnings::CODES {
        assert!(CompileWarnings::SVELTE_CODES.contains(code), "{code}");
    }
    assert!(CompileWarnings::SVELTE_CODES.contains(&"ownership_invalid_mutation"));
}

#[test]
fn a_module_file_warns_as_svelte_s_compile_module() {
    use crate::compiler_syntax_tree::{Children, CompilerSyntaxTreeBuilder};

    let code = "let count = $state(0);\n\
                let doubled = count * 2;\n\
                // svelte-ignore state_referenced_locally\n\
                let tripled = count * 3;\n\
                class A {}\n\
                function f() {\n\
                \tclass B {}\n\
                \tconst x = new class {};\n\
                \tfunction g() {\n\
                \t\tclass C {}\n\
                \t}\n\
                }\n\
                const y = new class {};\n";
    let document = Document::new("a.svelte.js".to_owned(), code.to_owned()).expect("small");
    let (tree, program) =
        rsvelte_typescript_tree::Tree::program(&document, oxc_span::SourceType::mjs())
            .expect("parses");
    let empty = CompilerSyntaxTreeBuilder::new(code, 0, 0).finish(Children::default());
    let resolution = crate::resolve::resolve(&tree, None, Some(program), &empty);
    let options = Options {
        runes: None,
        custom_element: false,
    };
    let found = super::module_warnings(&tree, program, &resolution, code, options);
    // `tripled`'s read is found, and the `svelte-ignore` before it drops it.
    assert_eq!(found.ignored, [false, true, false, false]);
    let warnings: Vec<_> = found
        .compiled()
        .map(|w| (w.code.to_string(), w.span.text(code).to_owned()))
        .collect();
    // What svelte 5's `compileModule` reports for the same text.
    assert_eq!(
        warnings,
        [
            ("state_referenced_locally", "count"),
            ("perf_avoid_inline_class", "new class {}"),
            ("perf_avoid_nested_class", "class C {}"),
        ]
        .map(|(code, text)| (code.to_owned(), text.to_owned()))
    );
}

#[test]
fn a_slot_beside_a_render_tag_is_a_conflict() {
    let errors = |code: &str| compiled_with_errors(code, None).1;
    let render = "{#snippet s()}x{/snippet}\n{@render s()}\n";
    assert_eq!(
        errors(&format!("<slot />\n{render}")),
        ["slot_snippet_conflict"]
    );
    assert_eq!(
        errors(&format!("{{$$slots.a}}\n{render}")),
        ["slot_snippet_conflict"]
    );
    assert_eq!(errors(render), Vec::<String>::new());
}

#[test]
fn an_event_directive_beside_an_event_attribute_is_mixed_syntax() {
    let errors = |code: &str| compiled_with_errors(code, None).1;
    assert_eq!(
        errors("<button on:click={f}>x</button>\n<button onclick={f}>y</button>\n"),
        ["mixed_event_handler_syntaxes"]
    );
    assert_eq!(
        errors("<Widget on:click={f} />\n<button onclick={f}>y</button>\n"),
        Vec::<String>::new()
    );
}
