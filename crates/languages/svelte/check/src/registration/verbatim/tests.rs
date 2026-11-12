use super::{blanked, bodies};

fn blank(source: &str) -> Option<String> {
    let found = bodies(source);
    (!found.is_empty()).then(|| blanked(source, &found))
}

#[test]
fn bodies_are_blanked_with_their_offsets_kept() {
    let source =
        "<script lang=\"ts\">let 日本 = ;\nlet b;\n</script>\n<style>/* </style> */ p {}</style>";
    let out = blank(source).expect("a script and a style");
    assert_eq!(out.len(), source.len());
    // The first `</style>` ends the style, as the regular expression is lazy.
    assert!(
        out.ends_with("<style>   </style> */ p {}</style>"),
        "{out:?}"
    );
    assert!(out.starts_with("<script lang=\"ts\">"), "{out:?}");
    let script = &out[18..out.find("</script>").expect("closed")];
    assert!(
        script.chars().all(|c| matches!(c, ' ' | '\n' | '/' | '*')),
        "{script:?}"
    );
    assert!(script.contains("/**/\n"), "{script:?}");
}

#[test]
fn comments_and_malformed_start_tags_are_not_bodies() {
    assert_eq!(blank("<!-- <script>a</script> --><p>x</p>"), None);
    assert_eq!(blank("<script />x</script>"), None);
    assert_eq!(blank("<scriptx>a</script>"), None);
    assert_eq!(blank("<script>a"), None);
}
