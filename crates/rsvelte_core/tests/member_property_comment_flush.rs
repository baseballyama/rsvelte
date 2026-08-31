//! A comment sitting between a member expression's object and its property must
//! be flushed before the property, not carried into the call's arguments.
//!
//! Upstream reaches the property through `context.visit(node.property)`
//! (`esrap/src/languages/ts/index.js`, `MemberExpression`), and `visit` performs
//! the leading comment flush. rsvelte's `static_member` wrote the property with
//! `write_node`, which emits source locations but never flushes — so the comment
//! stayed pending until the next location check, which is the call's first
//! argument.
//!
//! Reduced by measurement from the ha-fusion `History.svelte` mutation entry
//! (`client` and `client-dev`), whose chain is written one `.method` per line.
//! Every expectation here is the official compiler's bytes (5.56.10).

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

const CHAIN_WITH_COMMENT: &str = "<script>\n\t$: if (entity_id) {\n\t\tconnection.subscribe((conn) => {\n\t\t\tconn\n\t\t\t\t// } c\n\t\t\t\t.catch((error) => {\n\t\t\t\t});\n\t\t});\n\t}\n</script>\n";

const CHAIN_WITHOUT_COMMENT: &str = "<script>\n\t$: if (entity_id) {\n\t\tconnection.subscribe((conn) => {\n\t\t\tconn\n\t\t\t\t.catch((error) => {\n\t\t\t\t});\n\t\t});\n\t}\n</script>\n";

#[test]
fn the_comment_is_flushed_before_the_member_property() {
    let out = client(CHAIN_WITH_COMMENT);
    assert!(
        out.contains("conn.// } c"),
        "the comment must sit between the `.` and the property:\n{out}"
    );
}

#[test]
fn the_comment_does_not_land_in_the_argument_list() {
    let out = client(CHAIN_WITH_COMMENT);
    assert!(
        !out.contains("conn.catch("),
        "the property was written before the comment was flushed:\n{out}"
    );
}

#[test]
fn the_call_is_otherwise_unchanged() {
    let out = client(CHAIN_WITH_COMMENT);
    assert!(
        out.contains("catch((error) => {});"),
        "the call and its argument must be printed as upstream does:\n{out}"
    );
}

#[test]
fn a_chain_without_a_comment_is_unaffected() {
    // CONTROL: no pending comment, so the flush is a no-op and the member
    // expression prints on one line.
    let out = client(CHAIN_WITHOUT_COMMENT);
    assert!(
        out.contains("conn.catch((error) => {});"),
        "an uncommented chain must be unchanged:\n{out}"
    );
}

#[test]
fn a_comment_before_the_object_still_leads_the_statement() {
    // CONTROL: a comment that precedes the whole member expression is flushed
    // by the statement, not by the property, and was never affected.
    let out = client(
        "<script>\n\t$: if (entity_id) {\n\t\tconnection.subscribe((conn) => {\n\t\t\t// lead\n\t\t\tconn.catch((error) => {\n\t\t\t});\n\t\t});\n\t}\n</script>\n",
    );
    assert!(
        out.contains("// lead"),
        "a leading comment must survive:\n{out}"
    );
    assert!(
        out.contains("conn.catch("),
        "and must not split the member expression:\n{out}"
    );
}
