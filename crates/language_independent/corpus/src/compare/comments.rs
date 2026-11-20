//! Where JavaScript's comments are, which the syntax-tree comparison does not see: each comment
//! is keyed by its text, the tokens on either side of it, the nearest word on either side, which
//! of the places with those neighbours it is, and whether a line break comes before and after it.
//! The two outputs agree when they hold the same keys. Other layout does not count.

use std::collections::HashMap;

use oxc_allocator::Allocator;
use oxc_ast::Comment;
use oxc_parser::config::TokensParserConfig;
use oxc_parser::{Kind, Parser, Token};
use oxc_span::SourceType;

use super::javascript::Unparsed;

/// How the comments of two texts differ.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub(crate) struct Difference {
    /// Places only the expected text has.
    pub(crate) missing: usize,
    /// Places only the actual text has.
    pub(crate) extra: usize,
}

/// The places each text has and the other lacks, counted with multiplicity.
pub(crate) fn difference(expected: &str, actual: &str) -> Result<Difference, Unparsed> {
    let mut expected = places(expected).map_err(Unparsed::Expected)?;
    let mut actual = places(actual).map_err(Unparsed::Actual)?;
    expected.sort_unstable();
    actual.sort_unstable();
    let (mut e, mut a) = (expected.iter().peekable(), actual.iter().peekable());
    let mut difference = Difference {
        missing: 0,
        extra: 0,
    };
    loop {
        match (e.peek(), a.peek()) {
            (None, None) => return Ok(difference),
            (Some(x), Some(y)) if x == y => {
                e.next();
                a.next();
            }
            (Some(x), y) if y.is_none_or(|y| x < y) => {
                difference.missing += 1;
                e.next();
            }
            _ => {
                difference.extra += 1;
                a.next();
            }
        }
    }
}

/// One key per comment: `<comment> | <word> <token> ^ <token> <word> #<k> | <before> <after>`,
/// where the tokens are the ones next to it, the words the nearest identifiers or keywords, `k`
/// counts the places between tokens before it with the same tokens and words around them,
/// `before` is `own` when a line break separates it from the token before it and `trail`
/// otherwise, and `after` is `eol` when a line break separates it from the token after it and
/// `inline` otherwise.
pub(crate) fn places(text: &str) -> Result<Vec<String>, String> {
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, text, SourceType::mjs())
        .with_config(TokensParserConfig)
        .parse();
    if let Some(d) = parsed.diagnostics.first() {
        return Err(d.to_string());
    }
    if parsed.fatal_error {
        return Err("the parser stopped".to_owned());
    }
    let tokens: Vec<Token> = (parsed.tokens.iter())
        .copied()
        .filter(|t| t.kind() != Kind::Eof)
        .collect();
    let comments: Vec<&Comment> = (parsed.program.comments.iter())
        .filter(|c| !annotation(c) && !module_header(text, c, &tokens))
        .collect();
    if comments.is_empty() {
        return Ok(Vec::new());
    }
    let gaps = gaps(text, &tokens);
    Ok(comments
        .into_iter()
        .map(|c| {
            let after = tokens.partition_point(|t| t.end() <= c.span.start);
            let (context, k) = &gaps[after];
            let from = after.checked_sub(1).map(|i| tokens[i].end() as usize);
            let to = tokens.get(after).map_or(text.len(), |t| t.start() as usize);
            let own_line = from.is_none_or(|from| breaks(&text[from..c.span.start as usize]));
            let ends_line =
                c.is_line() || to == text.len() || breaks(&text[c.span.end as usize..to]);
            format!(
                "{} | {} {} ^ {} {} #{k} | {} {}",
                c.span
                    .source_text(text)
                    .split_whitespace()
                    .collect::<Vec<_>>()
                    .join(" "),
                context[0],
                context[1],
                context[2],
                context[3],
                if own_line { "own" } else { "trail" },
                if ends_line { "eol" } else { "inline" },
            )
        })
        .collect())
}

fn breaks(text: &str) -> bool {
    text.contains(['\n', '\r', '\u{2028}', '\u{2029}'])
}

/// For each place between tokens, from before the first to after the last: the nearest word
/// before it, the tokens on either side, the nearest word after it, and how many places before it
/// have the same four.
fn gaps<'t>(text: &'t str, tokens: &[Token]) -> Vec<([&'t str; 4], u32)> {
    let is_word = |t: &Token| t.kind().is_identifier_name();
    let spell = |t: Option<&Token>| t.map_or("EOF", |t| spelling(text, t));
    let mut next_word = vec![None; tokens.len() + 1];
    for i in (0..tokens.len()).rev() {
        next_word[i] = if is_word(&tokens[i]) {
            Some(i)
        } else {
            next_word[i + 1]
        };
    }
    let mut seen: HashMap<[&str; 4], u32> = HashMap::new();
    let mut last_word = None;
    (0..=tokens.len())
        .map(|g| {
            if g > 0 && is_word(&tokens[g - 1]) {
                last_word = Some(g - 1);
            }
            let context = [
                spell(last_word.map(|i| &tokens[i])),
                spell(g.checked_sub(1).map(|i| &tokens[i])),
                spell(tokens.get(g)),
                spell(next_word[g].map(|i| &tokens[i])),
            ];
            let count = seen.entry(context).or_default();
            let k = *count;
            *count += 1;
            (context, k)
        })
        .collect()
}

/// A string token without its quotes, as the two printers quote strings differently.
fn spelling<'t>(text: &'t str, token: &Token) -> &'t str {
    let raw = &text[token.start() as usize..token.end() as usize];
    if token.kind() == Kind::Str {
        &raw[1..raw.len() - 1]
    } else {
        raw
    }
}

/// `@__PURE__` and `@__NO_SIDE_EFFECTS__` marks are part of the syntax-tree comparison.
fn annotation(comment: &Comment) -> bool {
    comment.is_pure() || comment.is_no_side_effects()
}

/// The `/* <file> generated by Svelte v<version> */` line upstream writes above a module, which is
/// not a comment of the source.
fn module_header(text: &str, comment: &Comment, tokens: &[Token]) -> bool {
    tokens
        .first()
        .is_some_and(|t| comment.span.end <= t.start())
        && comment.is_block()
        && comment
            .span
            .source_text(text)
            .contains(" generated by Svelte v")
}

#[cfg(test)]
mod tests;
