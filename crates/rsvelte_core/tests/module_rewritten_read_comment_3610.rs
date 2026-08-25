use rsvelte_core::{GenerateMode, ModuleCompileOptions, compile_module};

fn client(body: &str) -> String {
    compile_module(
        &format!(
            "let a = $state(1);\nconst d = $derived(a + 1);\nexport function read() {{\n\t{body}\n}}"
        ),
        ModuleCompileOptions {
            filename: Some("X.svelte.js".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("module should compile")
    .js
    .code
}

#[test]
fn trailing_line_comment_follows_a_rewritten_derived_read() {
    let direct = client("return d; // trailing");
    assert!(
        direct.contains("return $.get(d // trailing\n\t);"),
        "comment did not land in the synthesized getter:\n{direct}"
    );

    let array = client("return [a, d]; // trailing");
    assert!(
        array.contains("return [a, // trailing\n\t$.get(d)];"),
        "comment did not follow esrap's sequence cursor:\n{array}"
    );

    let nested = client("return String(d); // trailing");
    assert!(
        nested.contains("return String($.get(d // trailing\n\t));"),
        "comment did not land inside the nested getter:\n{nested}"
    );
}

#[test]
fn trailing_block_comment_follows_a_rewritten_derived_read() {
    let out = client("return [a, d]; /* trailing */");
    assert!(
        out.contains("return [a, /* trailing */ $.get(d)];"),
        "block comment did not follow esrap's sequence cursor:\n{out}"
    );
}
