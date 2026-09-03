//! One statement per declarator for the instance script's top-level
//! `let` / `const` / `var` declarations, the way upstream's
//! `VariableDeclaration` visitor emits them.
//!
//! The declarators come from OXC, and only the declarations that actually
//! carry more than one of them are rewritten: every other byte of the script —
//! and therefore every other statement's span — is passed through untouched.
//! The text pass this replaces rebuilt the whole script line by line, so a
//! single multi-declarator declaration invalidated every retained span, folded
//! CRLF to LF and dropped the trailing newline.
//!
//! Only the *rendering* of a split declaration is text work: the declarators of
//! a multi-line declaration collapse onto one line each, and every comment the
//! declaration carried — leading it, or sitting between two declarators — is
//! emitted after the keyword with the declarator on the next line, which is
//! where esrap flushes it and where it cannot comment the declarator out.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::{Declaration, Program, Statement, VariableDeclaration, VariableDeclarationKind};
use oxc_parser::ParseOptions;
use oxc_span::{GetSpan, Span};

use super::super::shared::ast_rewrite::{self, Edit};
use super::super::shared::js_scan;
use crate::compiler::phases::phase3_transform::shared::substring::Substring;

thread_local! {
    static DECLARATION_SPLIT_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// `Some` only when at least one top-level declaration was split.
pub(super) fn split_top_level_multi_declarators(
    script: &str,
    is_typescript: bool,
) -> Option<String> {
    let source_type = if is_typescript {
        oxc_span::SourceType::ts()
    } else {
        oxc_span::SourceType::mjs()
    };
    ast_rewrite::with_program(
        &DECLARATION_SPLIT_ALLOC,
        script,
        source_type,
        ParseOptions {
            allow_return_outside_function: true,
            ..ParseOptions::default()
        },
        |program| ast_rewrite::splice(script, collect_edits(script, program), false),
    )
}

fn collect_edits(script: &str, program: &Program<'_>) -> Vec<Edit> {
    let comments: Vec<Span> = program
        .comments
        .iter()
        .map(|comment| comment.span)
        .collect();
    // `ExportNamedDeclaration` is the specifier-only `export { … }` in this AST
    // (`export let` is `ExportDeclaration`, `export … from` is
    // `ExportFromDeclaration`). In an instance script it IS the prop
    // declaration and never reaches the output, so upstream's cursor sees no
    // node there and a comment before it flushes with the next statement's.
    let removed: Vec<Span> = program
        .body
        .iter()
        .filter_map(|statement| match statement {
            Statement::ExportNamedDeclaration(export) => Some(export.span),
            _ => None,
        })
        .collect();
    let mut edits = Vec::new();
    for statement in &program.body {
        let (exported, declaration) = match statement {
            Statement::VariableDeclaration(declaration) => (false, &**declaration),
            Statement::ExportDeclaration(export) => match &export.declaration {
                Declaration::VariableDeclaration(declaration) => (true, &**declaration),
                _ => continue,
            },
            _ => continue,
        };
        if let Some(edit) = split_declaration(
            script,
            statement.span(),
            exported,
            declaration,
            comments.as_slice(),
            removed.as_slice(),
        ) {
            edits.push(edit);
        }
    }
    edits
}

fn split_declaration(
    script: &str,
    statement: Span,
    exported: bool,
    declaration: &VariableDeclaration<'_>,
    comments: &[Span],
    removed: &[Span],
) -> Option<Edit> {
    if declaration.declarations.len() < 2 || declaration.declare {
        return None;
    }
    let keyword = match declaration.kind {
        VariableDeclarationKind::Const => "const",
        VariableDeclarationKind::Let => "let",
        VariableDeclarationKind::Var => "var",
        _ => return None,
    };
    let start = statement.start as usize;
    // A declaration sharing its line with earlier code is left alone: the
    // indentation the split declarators are emitted at would not be its own.
    let indent = line_indent(script, start)?;
    // Upstream rebuilds a split declaration, so the STATEMENT carries no `loc`
    // and esrap flushes its leading comments at the first located node inside
    // it — the declarator, which prints after the keyword. A comment trailing
    // the previous statement's line belongs to that statement and stays put.
    let (leading_start, leading_comments) =
        leading_own_line_comments(script, start, comments, removed);
    let keyword_start = declaration.span.start as usize;
    if !script[keyword_start..].starts_with(keyword) {
        return None;
    }

    let bytes = script.as_bytes();
    let mut end = statement.end as usize;
    let mut probe = end;
    while probe < bytes.len() && (bytes[probe] == b' ' || bytes[probe] == b'\t') {
        probe += 1;
    }
    if probe < bytes.len() && bytes[probe] == b';' {
        end = probe + 1;
    }

    let last_declarator_end = declaration.declarations.last()?.span().end as usize;
    let mut content_end = end;
    while content_end > last_declarator_end
        && matches!(bytes[content_end - 1], b';' | b' ' | b'\t' | b'\n' | b'\r')
    {
        content_end -= 1;
    }

    let last = declaration.declarations.len() - 1;
    let mut pieces = Vec::with_capacity(declaration.declarations.len());
    let mut piece_start = keyword_start + keyword.len();
    for (index, declarator) in declaration.declarations.iter().enumerate() {
        if index == last {
            pieces.push((piece_start, content_end));
            break;
        }
        let comma = find_separator_comma(
            script,
            declarator.span().end as usize,
            content_end,
            comments,
        )?;
        pieces.push((piece_start, comma));
        piece_start = comma + 1;
    }

    let prefix = if exported {
        format!("export {keyword} ")
    } else {
        format!("{keyword} ")
    };

    let mut replacement = String::new();
    let mut emitted = false;
    for (from, to) in pieces {
        let (comment_lines, raw) = split_leading_own_line_comments(&script[from..to]);
        let body = collapse_lines(raw);
        if body.is_empty() {
            continue;
        }
        if emitted {
            replacement.push('\n');
            replacement.push_str(indent);
        }
        replacement.push_str(&prefix);
        if !emitted {
            for (at, comment) in leading_comments.iter().enumerate() {
                if at > 0 {
                    replacement.push_str(indent);
                }
                replacement.push_str(comment);
                replacement.push('\n');
            }
            if !leading_comments.is_empty() {
                replacement.push_str(indent);
            }
        }
        for comment in comment_lines {
            replacement.push_str(&comment);
            replacement.push('\n');
            replacement.push_str(indent);
        }
        replacement.push_str(&body);
        replacement.push(';');
        emitted = true;
    }
    if !emitted {
        return None;
    }

    Some((leading_start as u32, end as u32, replacement))
}

/// The run of comments occupying their own lines immediately before `start`,
/// with the offset the run begins at. Blank lines inside the run are dropped,
/// matching what upstream's flush emits. Returns `(start, [])` when the
/// preceding text is anything else — notably a comment sharing a line with
/// earlier code, which belongs to that line's statement.
fn leading_own_line_comments(
    script: &str,
    start: usize,
    comments: &[Span],
    removed: &[Span],
) -> (usize, Vec<String>) {
    let mut run_start = start;
    let mut texts = Vec::new();
    // Only the comments BEFORE the declaration can lead it; walking the whole
    // list backwards would abort on the first later one.
    for comment in comments
        .iter()
        .rev()
        .skip_while(|comment| comment.end as usize > start)
    {
        let (from, to) = (comment.start as usize, comment.end as usize);
        if to > run_start {
            break;
        }
        let mut gap_start = run_start;
        // A statement the transform deletes leaves no node for the cursor to
        // stop at, so the run reaches across it.
        for span in removed.iter().rev() {
            let (s, e) = (span.start as usize, span.end as usize);
            if e <= gap_start
                && s >= to
                && script[e..gap_start]
                    .trim_start()
                    .trim_start_matches(';')
                    .trim()
                    .is_empty()
            {
                gap_start = s;
            }
        }
        if !script[to..gap_start].trim().is_empty() {
            break;
        }
        let line_start = script[..from].rfind('\n').map_or(0, |at| at + 1);
        if !script[line_start..from].trim().is_empty() {
            break;
        }
        texts.push(script[from..to].to_string());
        run_start = line_start;
    }
    texts.reverse();
    (run_start, texts)
}

/// The declaration's own indentation, or `None` when code precedes it on the
/// line.
fn line_indent(script: &str, start: usize) -> Option<&str> {
    let line_start = script[..start].rfind('\n').map_or(0, |at| at + 1);
    let indent = &script[line_start..start];
    indent
        .bytes()
        .all(|byte| byte == b' ' || byte == b'\t')
        .then_some(indent)
}

/// The `,` separating two declarators: the first comma outside a comment. Only
/// trivia can precede it, so anything else means the spans and the text
/// disagree and the declaration is left alone.
fn find_separator_comma(
    script: &str,
    from: usize,
    limit: usize,
    comments: &[Span],
) -> Option<usize> {
    let bytes = script.as_bytes();
    let mut i = from;
    while i < limit {
        if let Some(comment) = comments
            .iter()
            .find(|span| span.start as usize <= i && i < span.end as usize)
        {
            i = comment.end as usize;
            continue;
        }
        match bytes[i] {
            b',' => return Some(i),
            byte if byte.is_ascii_whitespace() => i += 1,
            _ => return None,
        }
    }
    None
}

/// Fold a declarator that spans several source lines onto one, joining on the
/// single space the text pass used — except after a `//` comment, where a space
/// would fold the rest of the declarator into it.
fn collapse_lines(text: &str) -> String {
    let mut out = String::new();
    for (i, line) in text.lines().enumerate() {
        if i > 0 {
            out.push(if js_scan::ends_inside_line_comment(&out) {
                '\n'
            } else {
                ' '
            });
        }
        out.push_str(line.trim());
    }
    out.trim().to_string()
}

/// Peel the comments a declarator starts with that ENDED their own line, off
/// the RAW slice — `collapse_lines` joins lines with a space, so asking after it
/// cannot tell a block comment that stood alone from one written beside the
/// declarator, and upstream prints only the first on its own line.
fn split_leading_own_line_comments(part: &str) -> (Vec<String>, &str) {
    let mut comments = Vec::new();
    let mut rest = part.trim_start_matches([' ', '\t', '\r', '\n']);
    loop {
        let end = if rest.starts_with("//") {
            match rest.find('\n') {
                Some(at) => at,
                // A trailing line comment has no declarator after it.
                None => {
                    comments.push(rest.trim_end().to_string());
                    return (comments, "");
                }
            }
        } else if rest.starts_with("/*") {
            match rest.find_sub("*/") {
                Some(at) => at + 2,
                None => break,
            }
        } else {
            break;
        };
        let after = &rest[end..];
        if !after
            .trim_start_matches([' ', '\t', '\r'])
            .starts_with('\n')
        {
            break;
        }
        comments.push(rest[..end].trim_end().to_string());
        rest = after.trim_start_matches([' ', '\t', '\r', '\n']);
    }
    (comments, rest)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn split(script: &str) -> String {
        split_top_level_multi_declarators(script, false).unwrap_or_else(|| script.to_string())
    }

    fn split_ts(script: &str) -> String {
        split_top_level_multi_declarators(script, true).unwrap_or_else(|| script.to_string())
    }

    #[test]
    fn splits_each_declaration_kind() {
        assert_eq!(split("let a = 1, b = 2;"), "let a = 1;\nlet b = 2;");
        assert_eq!(split("const a = 1, b = 2;"), "const a = 1;\nconst b = 2;");
        assert_eq!(split("var a = 1, b = 2;"), "var a = 1;\nvar b = 2;");
        assert_eq!(
            split("export let a = 1, b = 2;"),
            "export let a = 1;\nexport let b = 2;"
        );
    }

    #[test]
    fn keeps_declarator_order_and_uninitialized_declarators() {
        assert_eq!(
            split("let first, second = 2, third;"),
            "let first;\nlet second = 2;\nlet third;"
        );
    }

    #[test]
    fn splits_destructuring_patterns() {
        assert_eq!(
            split("const { a, b } = o, [c, d] = list;"),
            "const { a, b } = o;\nconst [c, d] = list;"
        );
    }

    #[test]
    fn keeps_typescript_annotations() {
        assert_eq!(
            split_ts("let a: number = 1, b: string = 'x';"),
            "let a: number = 1;\nlet b: string = 'x';"
        );
    }

    /// The comment prints AFTER the keyword, with the declarator on the next
    /// line: upstream rebuilds a split declaration, so its statement carries no
    /// `loc` and esrap flushes the comment at the first located node inside it.
    /// The newline is what keeps the declarator out of the comment.
    #[test]
    fn prints_a_declarator_comment_after_the_keyword() {
        assert_eq!(
            split("let a = 1, // why\n\tb = 2;"),
            "let a = 1;\nlet // why\nb = 2;"
        );
    }

    #[test]
    fn keeps_a_block_comment_inline() {
        assert_eq!(
            split("let a = 1, /* why */ b = 2;"),
            "let a = 1;\nlet /* why */ b = 2;"
        );
    }

    #[test]
    fn collapses_a_multi_line_declarator() {
        assert_eq!(
            split("let a = {\n\tx: 1\n}, b = 2;"),
            "let a = { x: 1 };\nlet b = 2;"
        );
    }

    #[test]
    fn indents_every_emitted_declaration_like_the_first() {
        assert_eq!(
            split("if (x) {\n}\n\tlet a = 1, b = 2;\n"),
            "if (x) {\n}\n\tlet a = 1;\n\tlet b = 2;\n"
        );
    }

    #[test]
    fn leaves_everything_else_byte_identical() {
        let script = "import { x } from 'y';\r\nlet a = 1, b = 2;\r\nfunction f() {\r\n\tlet c = 1, d = 2;\r\n}\r\n";
        assert_eq!(
            split(script),
            "import { x } from 'y';\r\nlet a = 1;\nlet b = 2;\r\nfunction f() {\r\n\tlet c = 1, d = 2;\r\n}\r\n"
        );
    }

    #[test]
    fn leaves_single_declarator_declarations_alone() {
        assert!(split_top_level_multi_declarators("let a = 1;\nlet b = 2;\n", false).is_none());
        assert!(
            split_top_level_multi_declarators("for (let i = 0, n = 1; ; ) {}", false).is_none()
        );
        assert!(
            split_top_level_multi_declarators("function f() {\n\tlet a = 1, b = 2;\n}", false)
                .is_none()
        );
    }

    #[test]
    fn leaves_an_unparseable_script_alone() {
        assert!(split_top_level_multi_declarators("let a = 1, b = ;", false).is_none());
    }
}
