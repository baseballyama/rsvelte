//! Upstream walks an assignment target's `.object` chain **only while it is a
//! `MemberExpression`** and then requires an `Identifier`
//! (`3-transform/client/visitors/AssignmentExpression.js:104-112`), so
//! `stage.container().style.cursor = 'grab'` has no root binding and is not a
//! mutation. rsvelte's template-expression port walked through a `Call` via its
//! callee, so the same write came out as `$.mutate(stage, …)`.
//!
//! The two ports are the discriminator: an arrow declared in `<script>` reaches
//! a different implementation and was already right, so only an arrow written
//! inline in the template diverged.
//!
//! Every expected fragment was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn cursor_line(src: &str) -> String {
    let js = compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    js.lines()
        .find(|l| l.contains("cursor"))
        .unwrap_or_else(|| panic!("no cursor assignment in:\n{js}"))
        .trim()
        .to_string()
}

#[test]
fn a_method_call_in_the_chain_is_not_a_mutation_from_an_inline_handler() {
    let line = cursor_line(
        "<script>\n\tlet stage;\n</script>\n\
         <div bind:this={stage} on:mouseenter={() => { stage.container().style.cursor = \"grab\"; }}></div>",
    );
    assert_eq!(line, "$.get(stage).container().style.cursor = \"grab\";");
}

#[test]
fn a_method_call_in_the_chain_is_not_a_mutation_from_a_component_property() {
    let line = cursor_line(
        "<script>\n\timport Stage from './S.svelte';\n\tlet stage;\n</script>\n\
         <Stage bind:handle={stage} f={() => { stage.container().style.cursor = \"grab\"; }} />",
    );
    assert_eq!(line, "$.get(stage).container().style.cursor = \"grab\";");
}

/// The port that was already right. It has to keep being right: the fix is in
/// the other port, so a regression here would mean the wrong one was changed.
#[test]
fn a_method_call_in_the_chain_is_not_a_mutation_from_a_script_function() {
    let line = cursor_line(
        "<script>\n\timport Stage from './S.svelte';\n\tlet stage;\n\
         \tfunction go(){ stage.container().style.cursor = \"grab\"; }\n</script>\n\
         <Stage bind:handle={stage} on:x={go} />",
    );
    assert_eq!(line, "$.get(stage).container().style.cursor = \"grab\";");
}

/// The control: an identical chain with no call still mutates, so the fix
/// cannot have been "stop wrapping member writes".
#[test]
fn a_plain_member_chain_from_an_inline_handler_is_still_a_mutation() {
    let line = cursor_line(
        "<script>\n\tlet stage;\n</script>\n\
         <div bind:this={stage} on:mouseenter={() => { stage.style.cursor = \"grab\"; }}></div>",
    );
    assert_eq!(
        line,
        "$.mutate(stage, $.get(stage).style.cursor = \"grab\");"
    );
}
