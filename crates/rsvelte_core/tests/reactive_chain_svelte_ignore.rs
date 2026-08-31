//! A `svelte-ignore` comment written INSIDE a legacy `$:` statement.
//!
//! `rehome_reactive_statement_comments` copies a `$:`'s comments onto the
//! statement that survives after it, because upstream replaces the label with a
//! synthesized effect and the comment has no node left to attach to. It skipped
//! every comment spelling `svelte-ignore`, so that later text passes could find
//! one by scanning backwards from the node it annotates — but that reason only
//! covers a comment LEADING the statement. One written inside it annotates
//! nothing there, and staying behind lost it with the rebuilt label.
//!
//! Reduced by measurement from the huly `TemplateStep.svelte` mutation entry.
//!
//! Every expectation is the official compiler's bytes (5.56.10).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

fn assert_has(output: &str, fragment: &str) {
    assert!(
        output.contains(fragment),
        "expected to find\n  {fragment}\nin:\n{output}"
    );
}

const INTERIOR: &str = "<script>\n\timport { client } from \"./client.js\";\n\n\tlet ids = [];\n\n\t$: void client\n\t\t.findAll()\n\t\t// svelte-ignore state_referenced_locally\n\t\t.then((res) => {\n\t\t\tids = res;\n\t\t});\n\n\tlet pending = false;\n</script>\n\n<span>{ids.length}{pending}</span>\n";

const LEADING_LAST: &str = "<script>\n\tlet a = 1;\n\t// svelte-ignore state_referenced_locally\n\t$: b = a;\n</script>\n<span>{b}</span>\n";

#[test]
fn a_svelte_ignore_inside_a_reactive_statement_rehomes_like_any_other_comment() {
    assert_has(
        &client(INTERIOR),
        "\t// svelte-ignore state_referenced_locally\n\tlet pending = false;",
    );
}

/// CONTROL: a `svelte-ignore` LEADING the statement is what the skip exists for
/// — the later text passes locate it by scanning backwards from the node it
/// annotates — and it is what keeps the rule from becoming "rehome every
/// `svelte-ignore`". Both compilers drop it from the output here.
#[test]
fn a_svelte_ignore_leading_the_last_reactive_statement_is_unchanged() {
    let output = client(LEADING_LAST);
    assert!(
        !output.contains("svelte-ignore"),
        "expected the leading comment to stay out of the output:\n{output}"
    );
    assert_has(&output, "\tconst b = $.mutable_source();\n\tlet a = 1;");
}

/// CONTROL: an ordinary comment in the same interior position already rehomed,
/// so this pins that the fix did not move it.
#[test]
fn an_ordinary_interior_comment_is_unchanged() {
    let source = INTERIOR.replace("// svelte-ignore state_referenced_locally", "// plain");
    assert_has(&client(&source), "\t// plain\n\tlet pending = false;");
}
