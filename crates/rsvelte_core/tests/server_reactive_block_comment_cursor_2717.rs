//! Server-side legacy reactive block comments follow esrap's cursor semantics.
//!
//! Upstream's located nested block rewinds the comment cursor after its comment
//! has already re-homed. A script successor therefore receives one copy and the
//! reactive block receives the other; if the template expression is the next
//! located node, only that expression receives the copy.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn server(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .expect("component should compile")
    .js
    .code
}

fn body(code: &str) -> &str {
    code.find("import * as $")
        .map_or(code, |start| &code[start..])
        .trim_end()
}

#[test]
fn block_body_trailing_comment_rehomes_then_rewinds_with_a_script_successor() {
    let out = server(
        "<script>\n\tlet total = 10;\n\tlet half;\n\t$: { half = total / 2; } // C\n\tlet z = 1;\n\tconsole.log(z);\n</script>\n\n<p>x</p>",
    );
    assert_eq!(
        body(&out),
        "import * as $ from 'svelte/internal/server';\n\nexport default function A($$renderer) {\n\tlet total = 10;\n\tlet half;\n\n\t// C\n\tlet z = 1;\n\n\tconsole.log(z);\n\n\t$: {\n\t\thalf = total / 2;\n\t}\n\n\t$$renderer.push(`<p>x</p>`);\n\t// C\n}"
    );
}

#[test]
fn if_body_trailing_block_comment_rehomes_then_rewinds() {
    let out = server(
        "<script>\n\tlet total = 10;\n\tlet half;\n\t$: if (total) { half = total / 2; } /* C */\n\tlet z = 1;\n</script>\n\n<p>x</p>",
    );
    assert_eq!(
        body(&out),
        "import * as $ from 'svelte/internal/server';\n\nexport default function A($$renderer) {\n\tlet total = 10;\n\tlet half;\n\n\t/* C */\n\tlet z = 1;\n\n\t$: if (total) {\n\t\thalf = total / 2;\n\t}\n\n\t$$renderer.push(`<p>x</p>`);\n\t/* C */\n}"
    );
}

#[test]
fn block_body_trailing_comment_lands_in_the_template_expression() {
    let out = server(
        "<script>\n\tlet total = 10;\n\tlet half;\n\t$: { half = total / 2; } // C\n</script>\n\n<p>{half}</p>",
    );
    assert_eq!(
        body(&out),
        "import * as $ from 'svelte/internal/server';\n\nexport default function A($$renderer) {\n\tlet total = 10;\n\tlet half;\n\n\t$: {\n\t\thalf = total / 2;\n\t}\n\n\t$$renderer.push(`<p>${$.escape(\n\t\t// C\n\t\thalf\n\t)}</p>`);\n}"
    );
}

#[test]
fn block_body_trailing_comment_falls_back_to_the_component_tail() {
    let out = server(
        "<script>\n\tlet total = 10;\n\tlet half;\n\t$: { half = total / 2; } // C\n</script>\n\n<p>x</p>",
    );
    assert_eq!(
        body(&out),
        "import * as $ from 'svelte/internal/server';\n\nexport default function A($$renderer) {\n\tlet total = 10;\n\tlet half;\n\n\t$: {\n\t\thalf = total / 2;\n\t}\n\n\t$$renderer.push(`<p>x</p>`);\n\t// C\n}"
    );
}
