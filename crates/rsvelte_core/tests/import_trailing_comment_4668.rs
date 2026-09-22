//! A comment after a semicolon-free `import` does not continue the statement
//! (#4668). The client extractor read the line as unfinished and merged the
//! next one into it, so the emitted module did not parse and the swallowed
//! statement never reached the component function. Expected values are the
//! official compiler's output for the same input.

use rsvelte_core::compiler::{CompileOptions, GenerateMode, compile};

fn client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .unwrap()
    .js
    .code
}

/// `<script>` holding `import_lines`, then a `$state` declaration the import
/// must not swallow.
fn component(import_lines: &str) -> String {
    format!("<script>\n\t{import_lines}\n\tlet n = $state(x)\n</script>\n\n<p>{{n}}</p>\n")
}

#[test]
fn a_line_comment_after_the_specifier_ends_the_import() {
    let code = client(&component(r#"import x from "m" // c"#));
    assert!(code.contains("\nimport x from \"m\";\n"), "{code}");
    assert!(code.contains("let n = $.proxy(x);"), "{code}");
}

#[test]
fn a_block_comment_after_the_specifier_ends_the_import() {
    let code = client(&component(r#"import x from "m" /* c */"#));
    assert!(code.contains("\nimport x from \"m\";\n"), "{code}");
    assert!(code.contains("let n = $.proxy(x);"), "{code}");
}

#[test]
fn a_block_comment_that_runs_past_the_line_ends_it_too() {
    let code = client(&component("import x from \"m\" /* c\n\tmore */"));
    assert!(code.contains("\nimport x from \"m\";\n"), "{code}");
    assert!(code.contains("let n = $.proxy(x);"), "{code}");
}

#[test]
fn a_named_import_is_read_the_same_way() {
    let code = client(&component("import { y } from \"m\" // c\n\tlet x = y"));
    assert!(code.contains("\nimport { y } from \"m\";\n"), "{code}");
    assert!(code.contains("let x = y;"), "{code}");
}

#[test]
fn a_namespace_import_is_read_the_same_way() {
    let code = client(&component("import * as ns from \"m\" // c\n\tlet x = ns"));
    assert!(code.contains("\nimport * as ns from \"m\";\n"), "{code}");
    assert!(code.contains("let x = ns;"), "{code}");
}

#[test]
fn a_side_effect_import_is_read_the_same_way() {
    let code = client(&component("import \"m\" // c\n\tlet x = 1"));
    assert!(code.contains("\nimport \"m\";\n"), "{code}");
    assert!(code.contains("let x = 1;"), "{code}");
}

#[test]
fn the_import_on_the_next_line_is_hoisted_on_its_own() {
    let code = client(&component(
        "import x from \"m\" // c\n\timport y from \"n\"",
    ));
    assert!(
        code.contains("\nimport x from \"m\";\nimport y from \"n\";\n"),
        "{code}"
    );
    assert!(code.contains("let n = $.proxy(x);"), "{code}");
}

#[test]
fn an_import_attributes_clause_on_the_next_line_still_joins() {
    let code = client(&component(
        "import x from \"m\" // c\n\twith { type: \"json\" }",
    ));
    assert!(
        code.contains("\nimport x from \"m\" with { type: \"json\" };\n"),
        "{code}"
    );
    assert!(code.contains("let n = $.proxy(x);"), "{code}");
}

#[test]
fn a_comment_inside_a_multi_line_specifier_list_still_joins() {
    let code = client(&component("import {\n\t\tx // c\n\t} from \"m\""));
    assert!(code.contains("\nimport { x } from \"m\";\n"), "{code}");
    assert!(code.contains("let n = $.proxy(x);"), "{code}");
}

#[test]
fn the_semicolon_form_is_unchanged() {
    let code = client(&component(r#"import x from "m"; // c"#));
    assert!(code.contains("\nimport x from \"m\";\n"), "{code}");
    assert!(code.contains("let n = $.proxy(x);"), "{code}");
}
