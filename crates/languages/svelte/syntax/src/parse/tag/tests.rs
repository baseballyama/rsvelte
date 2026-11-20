use crate::parse::parse;
use crate::syntax_tree::TemplateNode;

/// Whether `source`'s last node is a declaration tag, or the error code and byte span it fails
/// with.
fn read(source: &str) -> Result<bool, (String, u32, u32)> {
    match parse(source) {
        Ok(component) => Ok(matches!(
            component.nodes.last(),
            Some(TemplateNode::Declaration { .. })
        )),
        Err(error) => Err((
            error.code.into_owned(),
            error.span.start_offset,
            error.span.end_offset,
        )),
    }
}

#[test]
fn a_declaration_keyword_ends_where_an_ascii_word_ends() {
    // What svelte 5.57.3's `parse` gives, in bytes of each source.
    let invalid = "declaration_tag_invalid_type";
    for (source, expected) in [
        ("{let$: 1}", Err((invalid, 1, 8))),
        ("{constñ: 1}", Err((invalid, 1, 11))),
        ("{typeñ: 1}", Err((invalid, 1, 10))),
        ("{letñ: 1}", Err((invalid, 1, 9))),
        ("{let_: 1}", Err(("expected_token", 5, 5))),
        ("{let1: 1}", Err(("expected_token", 5, 5))),
        ("{let$}", Ok(false)),
        ("{constñ}", Ok(false)),
        ("{typeñ}", Ok(false)),
        ("{let x = 1}", Ok(true)),
        ("{const x = 1}", Ok(true)),
        ("{var$}", Err((invalid, 1, 4))),
        ("{varñ: 1}", Err((invalid, 1, 4))),
        ("{enumñ}", Err((invalid, 1, 5))),
        ("{interface$}", Err((invalid, 1, 10))),
        (
            "<script lang=\"ts\"></script>{typeñ: 1}",
            Err((invalid, 28, 37)),
        ),
        ("<script lang=\"ts\"></script>{type$}", Ok(false)),
    ] {
        let expected = expected.map_err(|(code, start, end)| (code.to_owned(), start, end));
        assert_eq!(read(source), expected, "{source:?}");
    }
}
