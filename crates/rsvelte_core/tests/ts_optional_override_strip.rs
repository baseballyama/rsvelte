//! Regression test: the TS optional marker `?` and the `override` modifier on
//! class members must be erased (issue #1992).
//!
//! Bug: `x?: string` / `m?(): void {}` kept the `?` and `override x = 2` kept the
//! modifier, emitting invalid JS that the bundler cannot re-parse.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_ts(src: &str, generate: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("OptionalOverride.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const SOURCE: &str = "<script lang=\"ts\">\n\tclass Foo {\n\t\tx?: string;\n\t\ty?;\n\t\tm?(): void {}\n\t}\n\tclass B {\n\t\tx = 1;\n\t\tm() {}\n\t}\n\tclass Bar extends B {\n\t\toverride x = 2;\n\t\toverride m(): void {}\n\t\tpublic override readonly z: string = 'override';\n\t\ts = 'override';\n\t}\n\tconsole.log(new Foo(), new Bar());\n</script>\n";

#[test]
fn optional_markers_are_stripped() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = compile_ts(SOURCE, generate);
        for leftover in ["x?", "y?", "m?"] {
            assert!(!out.contains(leftover), "leftover `?` in:\n{out}");
        }
        for expected in ["x;", "y;", "m() {}"] {
            assert!(out.contains(expected), "missing `{expected}` in:\n{out}");
        }
    }
}

#[test]
fn override_modifiers_are_stripped() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = compile_ts(SOURCE, generate);
        for leftover in ["override x", "override m", "override readonly", "public "] {
            assert!(
                !out.contains(leftover),
                "leftover modifier `{leftover}` in:\n{out}"
            );
        }
        for expected in ["x = 2;", "z = 'override';"] {
            assert!(out.contains(expected), "missing `{expected}` in:\n{out}");
        }
    }
}

/// The keyword search must be bounded to the modifiers before the key, so a
/// member whose value merely contains `'override'` is left alone.
#[test]
fn override_inside_a_string_literal_survives() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = compile_ts(SOURCE, generate);
        assert!(
            out.contains("s = 'override';"),
            "string literal was mangled in:\n{out}"
        );
    }
}
