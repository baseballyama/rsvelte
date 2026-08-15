//! Regression tests for #2986 — a `class ` occurrence inside a comment or a
//! string located the "class header" for the SSR module transform.
//!
//! `transform_class_fields_server` found the class with `memmem::find(b"class ")`
//! and its body brace with `str::find('{')`, both raw byte scans over the whole
//! script. The step after them, `find_matching_bracket`, has been comment- and
//! string-aware since #2253 — but where the class *starts* had never been given
//! the same treatment, so a doc comment reading "we avoid class here" made
//! everything up to the next `{` a class header and the following factory
//! function a class body. Its local `const flag = $derived(…)` was then lowered
//! to `#const_flag = $.derived(…)` in statement position, with
//! `get const flag()` accessors: output no JS parser accepts, from a
//! `compileModule` call that returned successfully.
//!
//! Both offsets now come from `class_body::find_class_header`, which scans code
//! bytes only and requires `class` to be a keyword token rather than a substring.
//!
//! Measured against the broken tree, one test below reproduces
//! (`…_in_a_module`) and the rest do not — they are stated as what they are,
//! because a test that passes either way reads as a repro it is not.

use rsvelte_core::{CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module};

fn compile_module_server(src: &str) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            generate: GenerateMode::Server,
            filename: Some("m.svelte.js".to_string()),
            ..Default::default()
        },
    )
    .expect("module should compile")
    .js
    .code
}

fn compile_component_server(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            generate: GenerateMode::Server,
            filename: Some("App.svelte".to_string()),
            ..Default::default()
        },
    )
    .expect("component should compile")
    .js
    .code
}

#[track_caller]
fn assert_parses(code: &str, what: &str) {
    let allocator = oxc_allocator::Allocator::default();
    let ret = oxc_parser::Parser::new(&allocator, code, oxc_span::SourceType::mjs()).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "{what}: emitted JS does not parse: {:?}\n--- output ---\n{code}",
        ret.diagnostics
    );
}

#[track_caller]
fn assert_local_not_privatized(code: &str, what: &str) {
    assert!(
        !code.contains("#const_") && !code.contains("get const "),
        "{what}: a local declaration was lowered into a class field:\n{code}"
    );
    assert!(
        code.contains("const flag = $.derived("),
        "{what}: the local derived is missing from the output:\n{code}"
    );
}

/// A factory function with a local `$derived`, preceded by `%s`.
fn factory_after(carrier: &str) -> String {
    format!(
        "let a = 1;\nlet b = 2;\n{carrier}\nexport function make() {{\n\
         \tconst flag = $derived(a !== b);\n\
         \treturn {{ read: () => flag }};\n\
         }}\n"
    )
}

/// Every way of writing `class ` where it is text and not code. The regex row
/// carries the literal bytes (`/class /` needs no escape), so it exercises the
/// one branch of `skip_opaque` that has a heuristic in it.
const OPAQUE_CARRIERS: &[(&str, &str)] = &[
    ("line comment", "// we avoid class here"),
    ("block comment", "/* we avoid class here */"),
    ("jsdoc", "/** we avoid class here */"),
    ("string", "const label = 'class name';"),
    ("template", "const label = `class name`;"),
    ("regex", "const pattern = /class /;"),
];

#[test]
fn opaque_class_keyword_does_not_start_a_class_header_in_a_module() {
    for (what, carrier) in OPAQUE_CARRIERS {
        let out = compile_module_server(&factory_after(carrier));
        assert_parses(&out, what);
        assert_local_not_privatized(&out, what);
    }
}

/// Passes on the broken tree: `transform_class_fields_server` is reached from
/// the `.svelte.(js|ts)` entry point only, so the component instance script
/// never had this defect. It is here as the entry-point boundary — #2547 is the
/// recorded case of a fix that was complete on one entry point and absent on
/// the other — not as a second reproduction.
#[test]
fn opaque_class_keyword_does_not_start_a_class_header_in_a_component() {
    for (what, carrier) in OPAQUE_CARRIERS {
        let source = format!(
            "<script>\n{}</script>\n\n<p>ok</p>\n",
            factory_after(carrier)
                .lines()
                .map(|l| format!("\t{l}\n"))
                .collect::<String>()
        );
        let out = compile_component_server(&source);
        assert_parses(&out, what);
        assert_local_not_privatized(&out, what);
    }
}

/// The negative control: with no `class ` anywhere the same input already
/// compiled correctly before the fix, so a test that only ran this row would
/// pass on the broken tree.
#[test]
fn factory_without_the_keyword_is_unchanged() {
    let out = compile_module_server(&factory_after("// nothing special"));
    assert_parses(&out, "control");
    assert_local_not_privatized(&out, "control");
}

/// A real class still has its fields lowered — the keyword scan was narrowed,
/// not disabled.
#[test]
fn a_real_class_is_still_transformed() {
    for carrier in ["", "// a class mention", "const label = 'class name';"] {
        let out = compile_module_server(&format!(
            "{carrier}\nexport class Store {{\n\tvalue = $state(0);\n\tdouble = $derived(this.value * 2);\n}}\n"
        ));
        assert_parses(&out, carrier);
        assert!(
            out.contains("#double = $.derived(") && out.contains("get double()"),
            "{carrier:?}: the class field was not lowered:\n{out}"
        );
    }
}

/// Passes on the broken tree too, and the reason is worth pinning: a
/// mis-located header was re-emitted **verbatim**, so whenever a real class
/// followed, the wrong `class_pos` healed itself in the output. That is why the
/// reproduction needs a file with no class in it at all — and why this row,
/// which the old scan got wrong and printed right, guards the new scan rather
/// than reproducing the old one.
#[test]
fn a_comment_with_a_brace_does_not_move_the_class_body() {
    let out = compile_module_server(
        "/* class Foo { */\nexport class Store {\n\tvalue = $state(0);\n\tdouble = $derived(this.value * 2);\n}\n",
    );
    assert_parses(&out, "brace in comment");
    assert!(
        out.contains("#double = $.derived(") && out.contains("get double()"),
        "the class field was not lowered:\n{out}"
    );
}

/// `class` as an object key or a property name is not a class declaration —
/// the shape that made "require a trailing space" look sufficient.
#[test]
fn class_as_a_property_name_is_not_a_class() {
    for source in [
        "export function make() {\n\tconst o = { class: 'a' };\n\tconst flag = $derived(o.class !== '');\n\treturn { read: () => flag };\n}\n",
        "export function make() {\n\tconst o = { class() { return 1; } };\n\tconst flag = $derived(o.class() !== 0);\n\treturn { read: () => flag };\n}\n",
    ] {
        let out = compile_module_server(source);
        assert_parses(&out, source);
        assert!(
            !out.contains("#const_") && !out.contains("get const "),
            "a local declaration was lowered into a class field:\n{out}"
        );
    }
}
