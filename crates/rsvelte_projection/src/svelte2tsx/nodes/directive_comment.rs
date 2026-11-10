//! `// @ts-check` / `// @ts-nocheck` hoisting — mirrors
//! `svelte2tsx/nodes/directiveComment.ts`.

/// `extractTsCheckComment`: the `// @ts-check` / `// @ts-nocheck` directives
/// among the script's leading comments, normalised to `// @<name>`.
pub fn extract_ts_check_comment(script_content: &str) -> Vec<&'static str> {
    let mut directives = Vec::new();
    for (start, end) in leading_single_line_comments(script_content) {
        let bytes = script_content.as_bytes();
        let mut index = start + 2;
        while let Some(ch) = script_content
            .get(index..)
            .and_then(|rest| rest.chars().next())
        {
            if !is_white_space_like(ch) {
                break;
            }
            index += ch.len_utf8();
        }
        if bytes.get(index) != Some(&b'@') {
            continue;
        }
        let name_start = index + 1;
        let mut name_end = name_start;
        while name_end < end && matches!(bytes[name_end], b'a'..=b'z' | b'-') {
            name_end += 1;
        }
        match &script_content[name_start..name_end.max(name_start)] {
            "ts-check" => directives.push("// @ts-check"),
            "ts-nocheck" => directives.push("// @ts-nocheck"),
            _ => {}
        }
    }
    directives
}

/// The `//` comments `ts.forEachLeadingCommentRange(text, 0, …)` reports: every
/// comment before the first token, as `(start, end)` with `end` before the line
/// break.
fn leading_single_line_comments(text: &str) -> Vec<(usize, usize)> {
    let bytes = text.as_bytes();
    let mut comments = Vec::new();
    let mut pos = if text.starts_with("#!") {
        text.find(is_line_break).unwrap_or(text.len())
    } else {
        0
    };
    while let Some(ch) = text.get(pos..).and_then(|rest| rest.chars().next()) {
        if ch == '/' && bytes.get(pos + 1) == Some(&b'/') {
            let start = pos;
            pos += 2;
            while let Some(ch) = text.get(pos..).and_then(|rest| rest.chars().next()) {
                if is_line_break(ch) {
                    break;
                }
                pos += ch.len_utf8();
            }
            comments.push((start, pos));
        } else if ch == '/' && bytes.get(pos + 1) == Some(&b'*') {
            pos = text[pos + 2..]
                .find("*/")
                .map_or(text.len(), |close| pos + 2 + close + 2);
        } else if is_white_space_like(ch) {
            pos += ch.len_utf8();
        } else {
            break;
        }
    }
    comments
}

/// `ts.isLineBreak`.
const fn is_line_break(ch: char) -> bool {
    matches!(ch, '\n' | '\r' | '\u{2028}' | '\u{2029}')
}

/// `ts.isWhiteSpaceLike`.
const fn is_white_space_like(ch: char) -> bool {
    is_line_break(ch)
        || matches!(
            ch,
            ' ' | '\t' | '\u{000B}' | '\u{000C}' | '\u{0085}' | '\u{00A0}' | '\u{1680}' | '\u{2000}'
                ..='\u{200B}' | '\u{202F}' | '\u{205F}' | '\u{3000}' | '\u{FEFF}'
        )
}

#[cfg(test)]
mod tests {
    use super::extract_ts_check_comment;

    #[test]
    fn matches_the_upstream_ts_check_sample() {
        // `test/svelte2tsx/samples/ts-check`: input lines and the expected
        // prepended directives.
        let content = "\n    // @ts-check dsaafd\n    // @ts-nocheck dsafs\n    // @dafts-check\n    // @ts-checkabc\n    //@ts-check\n    //    @ts-check\n";
        assert_eq!(
            extract_ts_check_comment(content),
            [
                "// @ts-check",
                "// @ts-nocheck",
                "// @ts-check",
                "// @ts-check"
            ]
        );
    }

    #[test]
    fn stops_at_the_first_token() {
        assert_eq!(
            extract_ts_check_comment("/* a */ // @ts-check\nlet a;\n// @ts-nocheck\n"),
            ["// @ts-check"]
        );
        assert!(extract_ts_check_comment("let a; // @ts-check\n").is_empty());
    }
}
