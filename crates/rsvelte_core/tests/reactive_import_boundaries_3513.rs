//! A mutated legacy instance import stays reactive when its declaration touches
//! either boundary of the instance script's content.
//!
//! **This is a deliberate divergence from the official compiler — do not "fix"
//! it toward official.** Svelte 5.56.10 identifies a hoisted instance import by
//! testing `node.start > program.start && node.end < program.end`. The strict
//! comparisons misclassify a real instance import when it is the first or last
//! thing in the script, and official then silently drops the live update.
//!
//! `upstream_issues/3513-svelte-instance-import-boundary-reactivity.md` records
//! the measured matrix and the runtime consequence. rsvelte uses the binding's
//! declaring scope instead of source layout, so all four layouts below must keep
//! exactly one `$.reactive_import` wrapper.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(script_content: &str, dev: bool) -> String {
    let source = format!("<script>{script_content}</script>\n<b onclick={{go}}>{{v}}</b>\n");
    compile(
        &source,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            runes: Some(false),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[track_caller]
fn assert_reactive_import(script_content: &str) {
    for dev in [false, true] {
        let code = client(script_content, dev);
        assert_eq!(
            code.matches("$.reactive_import").count(),
            1,
            "a mutated instance import must stay reactive (dev={dev}):\n{code}"
        );
    }
}

/// The start-boundary defect: official sees `import.start == program.start` and
/// mistakes this declaration for a module-script import.
#[test]
fn import_at_the_first_script_byte_stays_reactive() {
    assert_reactive_import("import { v } from \"./v.js\";\nfunction go() { v.x = 1; }");
}

/// One leading space is the discriminating control for the start comparison.
/// Official emits the wrapper here, proving the switch is the byte boundary and
/// not a newline-sensitive parse path.
#[test]
fn import_after_one_leading_space_stays_reactive() {
    assert_reactive_import(" import { v } from \"./v.js\";\nfunction go() { v.x = 1; }");
}

/// The end-boundary defect: imports are legal after other module statements,
/// and official sees `import.end == program.end` and skips the wrapper.
#[test]
fn import_at_the_last_script_byte_stays_reactive() {
    assert_reactive_import("function go() { v.x = 1; }\nimport { v } from \"./v.js\";");
}

/// One trailing space is the discriminating control for the end comparison.
#[test]
fn import_before_one_trailing_space_stays_reactive() {
    assert_reactive_import("function go() { v.x = 1; }\nimport { v } from \"./v.js\"; ");
}

/// The wrapper is for mutated imports, not for every import. This protects the
/// positive rows from passing because wrapper generation became unconditional.
#[test]
fn an_unmutated_boundary_import_is_not_wrapped() {
    for dev in [false, true] {
        let source = "<script>import { v } from \"./v.js\";</script>\n<b>{v}</b>\n";
        let code = compile(
            source,
            CompileOptions {
                filename: Some("X.svelte".to_string()),
                generate: GenerateMode::Client,
                dev,
                runes: Some(false),
                ..Default::default()
            },
        )
        .expect("compile")
        .js
        .code;
        assert!(
            !code.contains("$.reactive_import"),
            "an unmutated import must not be wrapped (dev={dev}):\n{code}"
        );
    }
}
