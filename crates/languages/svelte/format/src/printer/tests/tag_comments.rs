//! prettier-plugin-svelte's `tag-comments.ts`: a comment between an opening tag's name and its `>`
//! under each `bracketSameLine` and `htmlWhitespaceSensitivity`, with the expected outputs from
//! Prettier 3.10.1 with prettier-plugin-svelte 4.2.0 and `tabWidth: 4`.

use super::*;

#[test]
fn a_comment_in_an_opening_tag_prints_as_the_plugin_prints_it() {
    let cases: Vec<(String, bool, String, String)> =
        serde_json::from_str(include_str!("tag_comments.json")).expect("valid cases");
    for (input, bracket_same_line, sensitivity, expected) in cases {
        let options: Options = serde_json::from_value(serde_json::json!({
            "tabWidth": 4,
            "bracketSameLine": bracket_same_line,
            "htmlWhitespaceSensitivity": sensitivity,
        }))
        .expect("valid options");
        assert_eq!(
            formatted_with(&input, &options),
            expected,
            "{input:?} bracketSameLine={bracket_same_line} whitespace={sensitivity}"
        );
    }
}
