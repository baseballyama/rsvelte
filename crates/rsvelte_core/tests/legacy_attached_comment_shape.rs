//! Upstream's `add_comments` re-maps every attached comment to
//! `{ type, value, start, end }`, dropping the `loc` acorn handed `onComment`.
//! The legacy conversion walks the whole tree adding `loc`, so it has to skip
//! the two comment arrays or it re-introduces a field official does not emit.

use rsvelte_core::ast::arena::CommentCaptureGuard;
use rsvelte_core::{ParseOptions, convert_to_legacy, parse};
use serde_json::Value;

const SOURCE: &str = "{items.map((x) => {\n\t// inner\n\treturn x;\n})}";

fn legacy_ast(source: &str) -> Value {
    let _capture = CommentCaptureGuard::new();
    let ast = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions {
            modern: true,
            // The legacy JSON boundary only rebuilds ESTree locations when the
            // parse skipped them, which is what the public `parse()` does.
            skip_expression_loc: true,
            capture_comments: true,
            ..Default::default()
        },
    )
    .expect("parse should succeed");
    convert_to_legacy(source, ast)
}

#[test]
fn an_attached_comment_carries_no_loc() {
    let ast = legacy_ast(SOURCE);
    let comment = &ast["html"]["children"][0]["expression"]["arguments"][0]["body"]["body"][0]["leadingComments"]
        [0];

    assert_eq!(comment["type"], "Line", "unexpected shape: {comment}");
    assert_eq!(comment["value"], " inner");
    let inner = SOURCE.find("// inner").unwrap();
    assert_eq!(comment["start"], inner);
    assert_eq!(comment["end"], inner + "// inner".len());
    assert!(
        comment.get("loc").is_none(),
        "an attached comment carries no loc: {comment}"
    );
}

#[test]
fn the_node_that_owns_it_still_gets_one() {
    let ast = legacy_ast(SOURCE);
    let owner = &ast["html"]["children"][0]["expression"]["arguments"][0]["body"]["body"][0];

    assert_eq!(owner["type"], "ReturnStatement");
    assert!(owner.get("loc").is_some(), "the owner keeps its loc");
}
