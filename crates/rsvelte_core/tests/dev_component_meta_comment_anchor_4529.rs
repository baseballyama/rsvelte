//! In dev, a component call is wrapped in `$.add_svelte_meta(() => …, …)`. The
//! wrapper is synthesized on both sides, so the only node upstream can flush a
//! pending instance-script comment at is the **callee** of the wrapped call —
//! which is why official emits `() => // c` and then the call, rather than
//! putting the comment in front of the statement.
//!
//! rsvelte's non-dev branch has carried `b::stmt_anchored` since #4529 was
//! filed; the dev branch built a fresh `b::stmt`, so no site was ever offered a
//! source offset and the comment fell to the end of the function body.
//!
//! The anchor has to sit on the callee and not on the call: esrap runs an
//! arrow's parameter sequence `until` the body's start, so a **located** body
//! makes an empty parameter list claim the comment and emit `(// c\n) =>`.
//! Both wrong placements are one line apart and in opposite directions, so each
//! is pinned below.
//!
//! Every expected string is official Svelte 5.57.0's own output for the same
//! source (`submodules/svelte`, pin `7bc0a70fe`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client_dev(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("C.svelte".into()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .unwrap_or_else(|error| format!("COMPILE_ERROR: {error:?}"))
}

const ALONE: &str = "\t$.add_svelte_meta(\n\t\t() => // c\n\t\tX($$anchor, {}),\n\t\t'component',\n\t\tC,\n\t\t4,\n\t\t0,\n\t\t{ componentTag: 'X' }\n\t);";

/// The reported cell.
#[test]
fn the_comment_is_the_wrapped_calls_leading_comment() {
    let out = client_dev("<script>\n\t// c\n</script>\n<X />\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains(ALONE), "{out}");
    assert_eq!(out.matches("// c").count(), 1, "{out}");
}

/// Neither of the two placements this defect and its first repair produced.
#[test]
fn it_is_neither_after_the_body_nor_inside_the_empty_parameter_list() {
    let out = client_dev("<script>\n\t// c\n</script>\n<X />\n");
    assert!(!out.contains("return $.pop($$exports);\n\t// c"), "{out}");
    assert!(!out.contains("(// c"), "{out}");
}

/// A preceding statement does not change where the comment goes.
#[test]
fn a_preceding_statement_does_not_move_it() {
    let out = client_dev("<script>\n\tlet p = 1;\n\t// c\n</script>\n<X {p} />\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("\t\t() => // c\n\t\tX($$anchor, { p }),"),
        "{out}"
    );
}

/// Two components: only the FIRST one in print order claims the comment, which
/// is what says the anchor is consumed rather than reused.
#[test]
fn only_the_first_component_claims_it() {
    let out = client_dev("<script>\n\t// c\n</script>\n<X /><Y />\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("\t\t() => // c\n\t\tX(node, {}),"), "{out}");
    assert!(
        out.contains(
            "\t$.add_svelte_meta(() => Y(node_1, {}), 'component', C, 4, 5, { componentTag: 'Y' });"
        ),
        "{out}"
    );
    assert_eq!(out.matches("// c").count(), 1, "{out}");
}

/// A block comment reaches the same place, so the rule is not "a line comment
/// swallows the rest of the line".
#[test]
fn a_block_comment_reaches_the_same_place() {
    let out = client_dev("<script>\n\t/* c */\n</script>\n<X />\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("\t\t() => /* c */\n\t\tX($$anchor, {}),"),
        "{out}"
    );
}

/// The negative: with no comment pending, the wrapper stays on one line. A
/// change that merely made the call multiline would pass every assertion above
/// and fail here.
#[test]
fn a_component_with_no_pending_comment_is_unchanged() {
    let out = client_dev("<script>\n\tlet p = 1;\n</script>\n<X {p} />\n");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains(
            "\t$.add_svelte_meta(() => X($$anchor, { p }), 'component', C, 4, 0, { componentTag: 'X' });"
        ),
        "{out}"
    );
}

/// The non-dev sibling, unchanged by this: the statement itself carries the
/// anchor there, so the comment precedes the whole call.
#[test]
fn the_non_dev_target_still_puts_it_in_front_of_the_statement() {
    let out = compile(
        "<script>\n\t// c\n</script>\n<X />\n",
        CompileOptions {
            filename: Some("C.svelte".into()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .unwrap_or_else(|error| format!("COMPILE_ERROR: {error:?}"));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("\t// c\n\tX($$anchor, {});"), "{out}");
}
