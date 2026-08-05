//! A `// svelte-ignore` comment must suppress warnings for the node that follows
//! it at *any* AST depth, not only for statements in a block body.

use rsvelte_core::{CompileOptions, compile};

fn warning_codes(src: &str) -> Vec<String> {
    match compile(
        src,
        CompileOptions {
            filename: Some("D.svelte".into()),
            dev: true,
            ..Default::default()
        },
    ) {
        Ok(r) => r.warnings.into_iter().map(|w| w.code).collect(),
        Err(e) => vec![format!("COMPILE_ERROR: {e:?}")],
    }
}

const CODE: &str = "state_referenced_locally";

#[test]
fn warning_is_emitted_without_ignore() {
    let src = "<script>\n\tconst { dims } = $props();\n\n\tconst opts = $state([\n\t\t{\n\t\t\tpropertyLevel: dims.length > 0\n\t\t}\n\t]);\n</script>\n\n{opts.length}";
    assert!(
        warning_codes(src).iter().any(|c| c == CODE),
        "expected the warning without an ignore"
    );
}

#[test]
fn statement_level_ignore_is_honoured() {
    let src = "<script>\n\tconst { dims } = $props();\n\n\t// svelte-ignore state_referenced_locally\n\tconst statementLevel = dims.length > 0;\n</script>\n\n{statementLevel}";
    assert!(
        !warning_codes(src).iter().any(|c| c == CODE),
        "statement-level svelte-ignore must suppress the warning"
    );
}

#[test]
fn object_property_level_ignore_is_honoured() {
    let src = "<script>\n\tconst { dims } = $props();\n\n\t// svelte-ignore state_referenced_locally\n\tconst statementLevel = dims.length > 0;\n\n\tconst opts = $state([\n\t\t{\n\t\t\t// svelte-ignore state_referenced_locally\n\t\t\tpropertyLevel: dims.length > 0\n\t\t}\n\t]);\n</script>\n\n{statementLevel}{opts.length}";
    let codes = warning_codes(src);
    assert!(
        !codes.iter().any(|c| c == CODE),
        "property-level svelte-ignore must suppress the warning, got {codes:?}"
    );
}

#[test]
fn array_element_level_ignore_is_honoured() {
    let src = "<script>\n\tconst { dims } = $props();\n\n\tconst opts = $state([\n\t\t// svelte-ignore state_referenced_locally\n\t\tdims.length > 0\n\t]);\n</script>\n\n{opts.length}";
    let codes = warning_codes(src);
    assert!(
        !codes.iter().any(|c| c == CODE),
        "array-element svelte-ignore must suppress the warning, got {codes:?}"
    );
}
