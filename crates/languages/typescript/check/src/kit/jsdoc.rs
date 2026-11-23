//! The `JSDoc` tags TypeScript reads where svelte2tsx asks whether a JavaScript export declares
//! its type: `getJSDocType`, `getJSDocTags` and `getJSDocParameterTags`.

use oxc_ast::Comment;

/// A tag that declares a type.
#[derive(Clone, Debug, PartialEq, Eq)]
pub(super) enum Tag<'s> {
    /// `@type`, with or without braces.
    Type,
    Satisfies,
    /// `@param`, `@arg` or `@argument`, with its name; `None` for a qualified name such as
    /// `a.b`, which names no parameter.
    Parameter(Option<&'s str>),
}

/// What precedes the node at `token`: TypeScript reads every comment before an expression or a
/// declaration name, and only those after a line break before a statement.
#[derive(Clone, Copy)]
pub(super) enum Host {
    Statement,
    Expression,
}

/// The tags of the last `JSDoc` comment of the node at `token`: TypeScript reads the tags of
/// that one only (`filterOwnedJSDocTags`).
pub(super) fn tags<'s>(
    source: &'s str,
    comments: &[Comment],
    token: u32,
    host: Host,
) -> Vec<Tag<'s>> {
    let end = comments.partition_point(|c| c.span.start < token);
    let mut start = end;
    let mut boundary = token as usize;
    while let Some(comment) = start.checked_sub(1).map(|i| &comments[i]) {
        let gap = source.get(comment.span.end as usize..boundary);
        if !gap.is_some_and(|gap| gap.trim().is_empty()) {
            break;
        }
        start -= 1;
        boundary = comment.span.start as usize;
    }
    let mut run = &comments[start..end];
    if matches!(host, Host::Statement) {
        run = after_line_break(source, run);
    }
    run.iter()
        .map(|comment| &source[comment.span.start as usize..comment.span.end as usize])
        .rfind(|text| text.starts_with("/**") && !text.starts_with("/**/"))
        .map_or_else(Vec::new, |text| parse(&text[3..text.len() - 2]))
}

/// The comments of `run` that `getLeadingCommentRanges` collects: from the first after a line
/// break, or all where nothing precedes them in the file.
fn after_line_break<'c>(source: &str, run: &'c [Comment]) -> &'c [Comment] {
    let Some(first) = run.first() else {
        return run;
    };
    let before = &source[..first.span.start as usize];
    let code = before.trim_end();
    if code.is_empty() || before[code.len()..].contains('\n') {
        return run;
    }
    let next = run.windows(2).position(|pair| {
        source[pair[0].span.end as usize..pair[1].span.start as usize].contains('\n')
    });
    next.map_or(&[], |i| &run[i + 1..])
}

/// The tags of a `JSDoc` comment's text: a tag starts with `@` at the start of a line, after
/// its asterisk, or after a space and before a character that is not one.
fn parse(text: &str) -> Vec<Tag<'_>> {
    let bytes = text.as_bytes();
    let mut tags = Vec::new();
    let mut line_start = true;
    let mut asterisk = true;
    let mut backticks = false;
    let mut in_tag = false;
    let mut i = 0;
    while i < bytes.len() {
        let c = bytes[i];
        match c {
            b'\n' | b'\r' => {
                line_start = true;
                asterisk = false;
            }
            b' ' | b'\t' => {}
            b'*' if line_start && !asterisk => asterisk = true,
            b'`' if in_tag => {
                backticks = !backticks;
                line_start = false;
            }
            b'@' if line_start
                || (!backticks
                    && i > 0
                    && matches!(bytes[i - 1], b' ' | b'\t')
                    && !bytes.get(i + 1).is_some_and(u8::is_ascii_whitespace)) =>
            {
                let name = identifier(text, i + 1);
                i += 1 + name.len();
                if let Some(tag) = tag(text, name, &mut i) {
                    tags.push(tag);
                }
                in_tag = true;
                backticks = false;
                line_start = false;
                continue;
            }
            _ => line_start = false,
        }
        i += 1;
    }
    tags
}

/// The tag named `name`, whose text continues at `at`, which moves past its type expression.
fn tag<'s>(text: &'s str, name: &str, at: &mut usize) -> Option<Tag<'s>> {
    match name {
        "type" => {
            skip_type_expression(text, at);
            Some(Tag::Type)
        }
        "satisfies" => {
            skip_type_expression(text, at);
            Some(Tag::Satisfies)
        }
        "param" | "arg" | "argument" => {
            skip_type_expression(text, at);
            skip_white_space_or_asterisk(text, at);
            Some(Tag::Parameter(parameter_name(text, at)))
        }
        _ => None,
    }
}

/// `parseBracketNameInPropertyAndParamTag`: an identifier, maybe in brackets or backticks.
fn parameter_name<'s>(text: &'s str, at: &mut usize) -> Option<&'s str> {
    let bytes = text.as_bytes();
    if bytes.get(*at) == Some(&b'[') {
        *at += 1;
        skip_white_space_or_asterisk(text, at);
    }
    if bytes.get(*at) == Some(&b'`') {
        *at += 1;
    }
    let name = identifier(text, *at);
    *at += name.len();
    (bytes.get(*at) != Some(&b'.')).then_some(name)
}

/// TypeScript's `JSDoc` identifier at `at`, which may hold `-`; empty where there is none.
fn identifier(text: &str, at: usize) -> &str {
    let rest = &text[at..];
    let mut chars = rest.char_indices();
    let end = match chars.next() {
        Some((_, c)) if c.is_alphabetic() || c == '_' || c == '$' => chars
            .find(|&(_, c)| !(c.is_alphanumeric() || matches!(c, '_' | '$' | '-')))
            .map_or(rest.len(), |(end, _)| end),
        _ => 0,
    };
    &rest[..end]
}

/// Moves `at` past the `{...}` that may follow, with the space before it.
fn skip_type_expression(text: &str, at: &mut usize) {
    let bytes = text.as_bytes();
    let mut i = *at;
    while matches!(bytes.get(i), Some(b' ' | b'\t')) {
        i += 1;
    }
    if bytes.get(i) != Some(&b'{') {
        return;
    }
    let mut depth = 0usize;
    while let Some(&c) = bytes.get(i) {
        i += 1;
        match c {
            b'{' => depth += 1,
            b'}' => {
                depth -= 1;
                if depth == 0 {
                    break;
                }
            }
            _ => {}
        }
    }
    *at = i;
}

/// `skipWhitespaceOrAsterisk`: spaces, line breaks and each line's asterisk.
fn skip_white_space_or_asterisk(text: &str, at: &mut usize) {
    let bytes = text.as_bytes();
    let mut line_start = false;
    while let Some(&c) = bytes.get(*at) {
        match c {
            b' ' | b'\t' => {}
            b'\n' | b'\r' => line_start = true,
            b'*' if line_start => line_start = false,
            _ => break,
        }
        *at += 1;
    }
}
