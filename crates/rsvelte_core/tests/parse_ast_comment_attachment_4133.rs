//! `parse()` comment attachment shapes that diverged from upstream's
//! `add_comments` (`1-parse/acorn.js`) and the `element.js` scan for a
//! top-level `<script>`'s leading HTML comment (#4133).
//!
//! Every expected value below was printed by the official compiler
//! (`submodules/svelte/.../compiler/index.js`) and pasted.

use rsvelte_core::ast::arena::{CommentCaptureGuard, with_serialize_arena};
use rsvelte_core::{ParseOptions, convert_to_legacy, parse};
use serde_json::{Value, json};

fn ast(source: &str, modern: bool) -> Value {
    let _capture = CommentCaptureGuard::new();
    let parsed = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions {
            modern,
            skip_expression_loc: true,
            capture_comments: true,
            ..Default::default()
        },
    )
    .expect("parse should succeed");
    if modern {
        with_serialize_arena(&parsed.arena, || serde_json::to_value(&parsed).unwrap())
    } else {
        convert_to_legacy(source, parsed)
    }
}

fn without_loc(mut value: Value) -> Value {
    match &mut value {
        Value::Object(map) => {
            map.remove("loc");
            for child in map.values_mut() {
                *child = without_loc(child.take());
            }
        }
        Value::Array(items) => {
            for item in items {
                *item = without_loc(item.take());
            }
        }
        _ => {}
    }
    value
}

fn block(value: &str, start: u64, end: u64) -> Value {
    json!({ "type": "Block", "value": value, "start": start, "end": end })
}

#[test]
fn snippet_parameters_carry_and_record_their_comments() {
    let source =
        "{#snippet row(/* p */ a /* q */, b = /* r */ 2 /* s */)}\n\t<td>{a}{b}</td>\n{/snippet}\n";
    for modern in [true, false] {
        let root = ast(source, modern);
        let (snippet, comments) = if modern {
            (&root["fragment"]["nodes"][0], &root["comments"])
        } else {
            (&root["html"]["children"][0], &root["_comments"])
        };
        let params = &snippet["parameters"];
        assert_eq!(params[0]["leadingComments"], json!([block(" p ", 14, 21)]));
        assert_eq!(params[0]["trailingComments"], json!([block(" q ", 24, 31)]));
        assert_eq!(
            params[1]["right"]["leadingComments"],
            json!([block(" r ", 37, 44)])
        );
        assert_eq!(params[1]["trailingComments"], json!([block(" s ", 47, 54)]));
        assert_eq!(
            comments.as_array().map(Vec::len),
            Some(4),
            "modern={modern}: {comments}"
        );
    }
}

#[test]
fn a_comment_before_a_parenthesized_template_expression_is_dropped_with_the_parens() {
    let source = "<div onclick={() => { const x = /** @type {T} */ (y); }}></div>";
    let root = ast(source, true);
    let init = &root["fragment"]["nodes"][0]["attributes"][0]["value"]["expression"]["body"]["body"]
        [0]["declarations"][0]["init"];
    assert_eq!(init["type"], "Identifier");
    assert!(init.get("leadingComments").is_none(), "{init}");
    assert_eq!(root["comments"].as_array().map(Vec::len), Some(1));

    let root = ast("{/* c */ (a)}", true);
    let expression = &root["fragment"]["nodes"][0]["expression"];
    assert!(expression.get("leadingComments").is_none(), "{expression}");
}

#[test]
fn comments_inside_or_after_parens_still_reach_the_expression() {
    let root = ast("{( /* c */ a)}", true);
    assert_eq!(
        root["fragment"]["nodes"][0]["expression"]["leadingComments"],
        json!([block(" c ", 3, 10)])
    );
    let root = ast("{(a) /* c */}", true);
    assert_eq!(
        root["fragment"]["nodes"][0]["expression"]["trailingComments"],
        json!([block(" c ", 5, 12)])
    );
}

#[test]
fn a_leading_comment_of_an_empty_body_swallows_the_comments_inside_it() {
    let source = "<script>\nif (a) {\n  // x\n} else {\n  // y\n}\n</script>";
    for modern in [true, false] {
        let root = without_loc(ast(source, modern));
        let statement = &root["instance"]["content"]["body"][0];
        assert!(statement.get("trailingComments").is_none(), "{statement}");
        assert_eq!(
            statement["alternate"]["leadingComments"],
            json!([{
                "type": "Line", "value": " x", "start": 20, "end": 24,
                "trailingComments": [{ "type": "Line", "value": " y", "start": 36, "end": 40 }]
            }])
        );
    }

    let root = without_loc(ast(
        "<script>\nlet v = /* a */ [ /* b */ ];\n</script>",
        true,
    ));
    let statement = &root["instance"]["content"]["body"][0];
    assert!(statement.get("trailingComments").is_none(), "{statement}");
    assert_eq!(
        statement["declarations"][0]["init"]["leadingComments"],
        json!([{
            "type": "Block", "value": " a ", "start": 17, "end": 24,
            "trailingComments": [block(" b ", 27, 34)]
        }])
    );
}

#[test]
fn the_html_comment_before_a_script_must_be_the_last_node_before_it() {
    for source in [
        "<!-- c -->\n<svelte:options runes />\n<script>\nlet a;\n</script>",
        "<!-- c --><svelte:options runes /><script>let a;</script>",
        "<!-- c --><style>a{}</style><script>let b;</script>",
    ] {
        let root = ast(source, true);
        let program = &root["instance"]["content"];
        assert!(
            program.get("leadingComments").is_none(),
            "{source:?}: {program}"
        );
    }

    let root = ast("<!-- c -->\n<script>\nlet a;\n</script>", true);
    assert_eq!(
        root["instance"]["content"]["leadingComments"],
        json!([{ "type": "Line", "value": " c " }])
    );
    let root = ast("<!-- c --><style>a{}</style><script>let b;</script>", true);
    assert_eq!(
        root["css"]["content"]["comment"],
        json!({ "type": "Comment", "start": 0, "end": 10, "data": " c " })
    );
}

#[test]
fn a_custom_element_shadow_object_keeps_its_comments() {
    let source = "<svelte:options customElement={{ tag: 'x-a', shadow: { mode: 'open', clonable: true, // c\n } }} />";
    let root = ast(source, true);
    assert_eq!(
        root["options"]["customElement"]["shadow"]["properties"][1]["trailingComments"],
        json!([{ "type": "Line", "value": " c", "start": 85, "end": 89 }])
    );
}
