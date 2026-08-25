//! A single `let` declaration tag may omit its initializer (#3705).
//!
//! The multiple-declarator path already emitted `init: null`; the single
//! declarator used to reject the same legal JavaScript declaration before it
//! reached that builder.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_target(source: &str, generate: GenerateMode) -> Result<String, String> {
    compile(
        source,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .map_err(|error| error.to_string())
}

#[test]
fn uninitialised_let_compiles_in_every_template_slot_and_target() {
    for source in [
        "{let x}",
        "{#if true}{let x}{/if}",
        "{#each [1] as value}{let x}{/each}",
    ] {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            if let Err(error) = compile_target(source, generate) {
                panic!("{source:?} was rejected for {generate:?}: {error}");
            }
        }
    }
}

#[test]
fn neighbouring_declaration_shapes_keep_their_existing_outcomes() {
    for source in ["{let x = 1}", "{let x, y}", "{let x = 1, y}"] {
        compile_target(source, GenerateMode::Client)
            .unwrap_or_else(|error| panic!("{source:?} was rejected: {error}"));
    }

    for source in ["{const x}", "{let }", "{const }"] {
        assert!(
            compile_target(source, GenerateMode::Client).is_err(),
            "{source:?} unexpectedly compiled"
        );
    }
}
