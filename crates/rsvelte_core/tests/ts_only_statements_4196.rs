//! Three TypeScript-only STATEMENT forms are not type annotations, so upstream's
//! eraser leaves them alone and emits them verbatim into the generated
//! JavaScript — output that no JS parser accepts, on both targets, measured
//! against `submodules/svelte`. rsvelte's server instead ran its classification
//! parse in plain-JS mode, rejected the erased text, and failed the compile with
//! an error carrying no `code` (issue #4196).
//!
//! The assertion is that the compile SUCCEEDS and the statement survives, which
//! is what parity means here: matching upstream's unparseable output is the
//! goal, and refusing to emit it is the divergence. The control is an ordinary
//! `import`, which both targets already emitted.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

/// `import x = require(…)`, `export =` and `export as namespace` are TypeScript
/// module syntax with no runtime erasure — upstream copies each one through.
const TS_ONLY_STATEMENTS: [&str; 3] = [
    "import fs = require('fs');",
    "export = a;",
    "export as namespace N;",
];

/// An ordinary import is the control: it must keep compiling, and it reaches the
/// same classification parse.
const CONTROL: &str = "import { b } from './b';";

fn source(statement: &str) -> String {
    format!("<script lang=\"ts\">\n\tlet a = 1;\n\t{statement}\n</script>\n{{a}}\n")
}

fn compile_to(statement: &str, generate: GenerateMode) -> Result<String, String> {
    compile(
        &source(statement),
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .map_err(|e| {
        let d = e.diagnostic();
        format!("{:?}: {}", d.code, d.message)
    })
}

#[test]
fn a_typescript_only_statement_compiles_on_both_targets() {
    for statement in TS_ONLY_STATEMENTS {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let code = compile_to(statement, generate)
                .unwrap_or_else(|e| panic!("{statement:?} on {generate:?} failed to compile: {e}"));
            assert!(
                code.contains(statement),
                "{statement:?} on {generate:?} did not survive into the output:\n{code}"
            );
        }
    }
}

#[test]
fn an_ordinary_import_still_compiles_on_both_targets() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let code = compile_to(CONTROL, generate)
            .unwrap_or_else(|e| panic!("the control on {generate:?} failed to compile: {e}"));
        assert!(
            code.contains("from './b'"),
            "the control's import is missing from the {generate:?} output:\n{code}"
        );
    }
}
