//! A non-dev `$inspect(...)` is removed but its `ExpressionStatement` survives
//! upstream with `b.empty` as its expression, so esrap prints `;;` on one line
//! and a comment trailing the call stays on that line. Modelling the pair as two
//! separate empty statements put a blank line before the comment.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const SOURCE: &str = "<script>\n\
     \tlet a = 1;\n\
     \t$inspect(a); /* c */\n\
     \tconsole.log(2);\n\
     </script>\n\
     \n\
     <p>{a}</p>\n";

fn compile_to(generate: GenerateMode) -> String {
    compile(
        SOURCE,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

#[test]
fn the_removed_inspect_keeps_its_trailing_comment_on_one_line() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = compile_to(generate);
        assert!(
            out.contains(";; /* c */\n"),
            "{generate:?} split the `;;` hole from its trailing comment:\n{out}"
        );
    }
}
