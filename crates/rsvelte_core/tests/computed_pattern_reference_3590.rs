//! A reference inside a destructuring pattern is not itself a declaration.
//!
//! The analyzer approximated upstream's `node !== binding.node` check by treating every
//! identifier inside a `VariableDeclarator`'s `id` range as a declaration. That swallowed the
//! `$state` reference in a computed key even though the binding it resolves to was declared on
//! the preceding line.

use rsvelte_core::{CompileOptions, GenerateMode, Warning, compile};

const CODE: &str = "state_referenced_locally";

fn state_reference_warnings(src: &str) -> Vec<Warning> {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .warnings
    .into_iter()
    .filter(|warning| warning.code == CODE)
    .collect()
}

#[test]
fn a_computed_pattern_key_is_a_reference_at_the_identifier() {
    let warnings = state_reference_warnings(
        "<script>\nlet s = $state(1);\nconst { [s]: value } = {};\n</script>",
    );

    assert_eq!(warnings.len(), 1);
    let warning = &warnings[0];
    let start = warning.start.as_ref().expect("warning has a start");
    let end = warning.end.as_ref().expect("warning has an end");
    assert_eq!((start.line, start.column), (3, 9));
    assert_eq!((end.line, end.column), (3, 10));
}

#[test]
fn destructured_binding_identifiers_remain_declarations() {
    assert!(
        state_reference_warnings("<script>\nconst { value } = $props();\n</script>",).is_empty()
    );
}
