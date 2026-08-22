//! A minimal ECMAScript tokenizer, used where upstream eslint-plugin-svelte
//! reasons about *tokens* rather than about source text — `equalTokens` and
//! `sourceCode.getTokens(node, { includeComments: true })`.
//!
//! Character-level approximations of those two operations are not merely
//! imprecise, they invert: a `//` inside a regex literal reads as a line comment
//! and truncates everything after it, and `${ x }` compares unequal to `${x}`
//! even though espree emits the same three tokens for both.

/// The token classes this tokenizer distinguishes. Keyword / boolean / null
/// tokens are not split out of [`TokenKind::Word`] because their spelling
/// already determines the class, and comparison is over `(kind, text)` pairs.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum TokenKind {
    Punctuator,
    Word,
    Numeric,
    Str,
    /// One chunk of a template literal: `` `a${ ``, `` }b${ ``, `` }c` ``.
    Template,
    RegExp,
    Private,
    LineComment,
    BlockComment,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct Token<'a> {
    pub kind: TokenKind,
    pub text: &'a str,
}

impl Token<'_> {
    pub const fn is_comment(&self) -> bool {
        matches!(self.kind, TokenKind::LineComment | TokenKind::BlockComment)
    }
}

/// Punctuators, longest first so the scan is a greedy longest match.
const PUNCTUATORS: &[&str] = &[
    ">>>=", "...", "===", "!==", "**=", "<<=", ">>=", ">>>", "&&=", "||=", "??=", "=>", "==", "!=",
    "<=", ">=", "&&", "||", "??", "?.", "++", "--", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=",
    "**", "<<", ">>", "{", "}", "(", ")", "[", "]", ";", ",", "<", ">", "+", "-", "*", "/", "%",
    "&", "|", "^", "!", "~", "?", ":", "=", ".", "@",
];

/// Keywords after which a `/` starts a regular expression rather than a
/// division. Every other word (an identifier, `this`, `true`, …) is a value.
const REGEX_PRECEDING_KEYWORDS: &[&str] = &[
    "case",
    "delete",
    "do",
    "else",
    "in",
    "instanceof",
    "new",
    "of",
    "return",
    "throw",
    "typeof",
    "void",
    "await",
    "yield",
];

/// Byte index just past the character starting at `i`.
fn skip_char(src: &str, i: usize) -> usize {
    let mut j = i + 1;
    while j < src.len() && !src.is_char_boundary(j) {
        j += 1;
    }
    j
}

fn is_ident_start(ch: char) -> bool {
    ch == '_' || ch == '$' || ch.is_alphabetic()
}

fn is_ident_part(ch: char) -> bool {
    ch == '_' || ch == '$' || ch.is_alphanumeric() || ch == '\u{200c}' || ch == '\u{200d}'
}

/// End of the string literal opening at `start`; runs to EOF when unterminated.
fn scan_string(src: &str, start: usize) -> usize {
    let bytes = src.as_bytes();
    let quote = bytes[start];
    let mut i = start + 1;
    while i < bytes.len() {
        match bytes[i] {
            b'\\' => i = skip_char(src, skip_char(src, i)),
            c if c == quote => return i + 1,
            _ => i = skip_char(src, i),
        }
    }
    bytes.len()
}

/// End of the template chunk opening at `start` (a `` ` `` or the `}` closing a
/// substitution), plus whether it ended by opening a new `${` substitution.
fn scan_template_chunk(src: &str, start: usize) -> (usize, bool) {
    let bytes = src.as_bytes();
    let mut i = start + 1;
    while i < bytes.len() {
        match bytes[i] {
            b'\\' => i = skip_char(src, skip_char(src, i)),
            b'`' => return (i + 1, false),
            b'$' if bytes.get(i + 1) == Some(&b'{') => return (i + 2, true),
            _ => i = skip_char(src, i),
        }
    }
    (bytes.len(), false)
}

/// End of the regex literal opening at `start` (flags included), or `None` when
/// the `/` does not in fact open one.
fn scan_regex(src: &str, start: usize) -> Option<usize> {
    let bytes = src.as_bytes();
    let mut i = start + 1;
    let mut in_class = false;
    while i < bytes.len() {
        match bytes[i] {
            b'\\' => {
                i = skip_char(src, skip_char(src, i));
                continue;
            }
            b'\n' | b'\r' => return None,
            b'[' => in_class = true,
            b']' => in_class = false,
            b'/' if !in_class => {
                i += 1;
                while i < bytes.len() && is_ident_part(src[i..].chars().next()?) {
                    i = skip_char(src, i);
                }
                return Some(i);
            }
            _ => {}
        }
        i = skip_char(src, i);
    }
    None
}

/// End of the numeric literal starting at `start`.
fn scan_number(src: &str, start: usize) -> usize {
    let bytes = src.as_bytes();
    let n = bytes.len();
    let mut i = start;
    if bytes[i] == b'0'
        && matches!(
            bytes.get(i + 1),
            Some(b'x' | b'X' | b'b' | b'B' | b'o' | b'O')
        )
    {
        i += 2;
        while i < n && (bytes[i].is_ascii_alphanumeric() || bytes[i] == b'_') {
            i += 1;
        }
        return i;
    }
    while i < n {
        match bytes[i] {
            b'0'..=b'9' | b'_' | b'.' => i += 1,
            b'e' | b'E' => {
                i += 1;
                if matches!(bytes.get(i), Some(b'+' | b'-')) {
                    i += 1;
                }
            }
            b'n' => return i + 1,
            _ => break,
        }
    }
    i
}

/// Whether a `/` seen after `prev` opens a regex literal.
/// Whether a `/` here starts a regex literal rather than a division.
///
/// `)` and `}` are the two closers whose answer depends on what they close: a
/// `/` after the `)` of an `if (…)` head or after the `}` of a block starts a
/// regex, while after a parenthesised expression or an object literal it
/// divides. `last_close_opens_regex` carries that decision, made when the
/// matching opener was seen.
fn regex_allowed(prev: Option<&Token<'_>>, last_close_opens_regex: bool) -> bool {
    match prev {
        None => true,
        Some(t) => match t.kind {
            TokenKind::Punctuator => match t.text {
                ")" | "}" => last_close_opens_regex,
                "]" | "++" | "--" => false,
                _ => true,
            },
            TokenKind::Word => REGEX_PRECEDING_KEYWORDS.contains(&t.text),
            _ => false,
        },
    }
}

/// Keywords whose parenthesised head is a statement head, so the `)` that closes
/// it is followed by a statement — where a `/` starts a regex.
const CONTROL_HEAD_KEYWORDS: &[&str] = &["if", "while", "for", "with"];

/// Whether a `{` seen after `prev` opens a block (statement position) rather
/// than an object literal.
fn brace_opens_block(prev: Option<&Token<'_>>, last_close_opens_regex: bool) -> bool {
    match prev {
        None => true,
        Some(t) => match t.kind {
            TokenKind::Punctuator => match t.text {
                ")" => last_close_opens_regex,
                "{" | "}" | ";" | "=>" => true,
                _ => false,
            },
            TokenKind::Word => !matches!(t.text, "return" | "typeof" | "case" | "in" | "of"),
            _ => false,
        },
    }
}

/// Tokenize `src` as ECMAScript, comments included.
///
/// This is a lexical approximation — it is deliberately total (any input yields
/// a token stream) and never consults a grammar, so a construct it cannot
/// classify becomes a one-character punctuator rather than an error.
pub fn tokenize(src: &str) -> Vec<Token<'_>> {
    let bytes = src.as_bytes();
    let n = bytes.len();
    let mut tokens: Vec<Token<'_>> = Vec::new();
    let mut i = 0usize;
    // Brace nesting, and the depths at which a `${` substitution was opened, so
    // the `}` that resumes template text can be told from a plain `}`.
    let mut brace_depth = 0usize;
    let mut template_stack: Vec<usize> = Vec::new();
    // For each open `(` / `{`, whether the closer is followed by a position
    // where a `/` starts a regex; `last_close_opens_regex` holds the value the
    // most recent closer popped.
    let mut paren_stack: Vec<bool> = Vec::new();
    let mut brace_stack: Vec<bool> = Vec::new();
    let mut last_close_opens_regex = false;

    while i < n {
        let ch = match src[i..].chars().next() {
            Some(c) => c,
            None => break,
        };

        if ch.is_whitespace() || ch == '\u{feff}' {
            i = skip_char(src, i);
            continue;
        }

        // Comments.
        if ch == '/' && bytes.get(i + 1) == Some(&b'/') {
            let mut j = i + 2;
            // A `//` comment ends at any JavaScript line terminator, which
            // includes U+2028 and U+2029 — code after one on the same physical
            // line is code, not comment text.
            while j < n
                && bytes[j] != b'\n'
                && bytes[j] != b'\r'
                && !(bytes[j] == 0xE2
                    && bytes.get(j + 1) == Some(&0x80)
                    && matches!(bytes.get(j + 2), Some(0xA8 | 0xA9)))
            {
                j = skip_char(src, j);
            }
            tokens.push(Token {
                kind: TokenKind::LineComment,
                text: &src[i..j],
            });
            i = j;
            continue;
        }
        if ch == '/' && bytes.get(i + 1) == Some(&b'*') {
            let mut j = i + 2;
            while j + 1 < n && !(bytes[j] == b'*' && bytes[j + 1] == b'/') {
                j = skip_char(src, j);
            }
            let end = (j + 2).min(n);
            tokens.push(Token {
                kind: TokenKind::BlockComment,
                text: &src[i..end],
            });
            i = end;
            continue;
        }

        // String literals.
        if ch == '"' || ch == '\'' {
            let end = scan_string(src, i);
            tokens.push(Token {
                kind: TokenKind::Str,
                text: &src[i..end],
            });
            i = end;
            continue;
        }

        // Template literal head, and the `}` that resumes one.
        if ch == '`' || (ch == '}' && template_stack.last() == Some(&brace_depth)) {
            if ch == '}' {
                template_stack.pop();
                brace_depth -= 1;
            }
            let (end, opened) = scan_template_chunk(src, i);
            tokens.push(Token {
                kind: TokenKind::Template,
                text: &src[i..end],
            });
            if opened {
                brace_depth += 1;
                template_stack.push(brace_depth);
            }
            i = end;
            continue;
        }

        // Regex literal.
        if ch == '/'
            && regex_allowed(
                tokens.iter().rev().find(|t| !t.is_comment()),
                last_close_opens_regex,
            )
            && let Some(end) = scan_regex(src, i)
        {
            tokens.push(Token {
                kind: TokenKind::RegExp,
                text: &src[i..end],
            });
            i = end;
            continue;
        }

        // Numeric literal (including a leading-dot form such as `.5`).
        if ch.is_ascii_digit() || (ch == '.' && bytes.get(i + 1).is_some_and(u8::is_ascii_digit)) {
            let end = scan_number(src, i);
            tokens.push(Token {
                kind: TokenKind::Numeric,
                text: &src[i..end],
            });
            i = end;
            continue;
        }

        // Private name.
        if ch == '#' {
            let mut j = skip_char(src, i);
            while j < n && src[j..].chars().next().is_some_and(is_ident_part) {
                j = skip_char(src, j);
            }
            tokens.push(Token {
                kind: TokenKind::Private,
                text: &src[i..j],
            });
            i = j;
            continue;
        }

        // Identifier / keyword.
        if is_ident_start(ch) {
            let mut j = skip_char(src, i);
            while j < n && src[j..].chars().next().is_some_and(is_ident_part) {
                j = skip_char(src, j);
            }
            tokens.push(Token {
                kind: TokenKind::Word,
                text: &src[i..j],
            });
            i = j;
            continue;
        }

        // Punctuator, longest match first — except `?.` immediately before a
        // digit, which is a conditional with a leading-dot number (`p?.5:q` is
        // `p ? .5 : q`), not optional chaining.
        if let Some(p) = PUNCTUATORS.iter().find(|p| {
            src[i..].starts_with(**p)
                && !(**p == "?." && bytes.get(i + 2).is_some_and(u8::is_ascii_digit))
        }) {
            let prev = tokens.iter().rev().find(|t| !t.is_comment());
            match *p {
                "(" => paren_stack.push(prev.is_some_and(|t| {
                    t.kind == TokenKind::Word && CONTROL_HEAD_KEYWORDS.contains(&t.text)
                })),
                ")" => last_close_opens_regex = paren_stack.pop().unwrap_or(false),
                "{" => {
                    brace_depth += 1;
                    brace_stack.push(brace_opens_block(prev, last_close_opens_regex));
                }
                "}" => {
                    brace_depth = brace_depth.saturating_sub(1);
                    last_close_opens_regex = brace_stack.pop().unwrap_or(true);
                }
                _ => {}
            }
            tokens.push(Token {
                kind: TokenKind::Punctuator,
                text: &src[i..i + p.len()],
            });
            i += p.len();
            continue;
        }

        // Unclassifiable character: emit it so the scan always makes progress.
        let end = skip_char(src, i);
        tokens.push(Token {
            kind: TokenKind::Punctuator,
            text: &src[i..end],
        });
        i = end;
    }

    tokens
}

/// Upstream `equalTokens`: same token count, and every pair equal in type and
/// text. Comments are excluded, as `sourceCode.getTokens` excludes them.
pub fn equal_tokens(left: &str, right: &str) -> bool {
    let mut a = tokenize(left).into_iter().filter(|t| !t.is_comment());
    let mut b = tokenize(right).into_iter().filter(|t| !t.is_comment());
    loop {
        match (a.next(), b.next()) {
            (None, None) => return true,
            (Some(x), Some(y)) if x == y => {}
            _ => return false,
        }
    }
}

/// Whether `src` contains a comment token — upstream's
/// `getTokens(node, { includeComments: true }).some(t => t.type === 'Block' || t.type === 'Line')`.
pub fn has_comment(src: &str) -> bool {
    tokenize(src).iter().any(Token::is_comment)
}

#[cfg(test)]
mod tests {
    use super::{TokenKind, equal_tokens, has_comment, tokenize};

    fn kinds(src: &str) -> Vec<(TokenKind, &str)> {
        tokenize(src)
            .into_iter()
            .map(|t| (t.kind, t.text))
            .collect()
    }

    #[test]
    fn template_substitution_whitespace_is_not_a_token() {
        assert!(equal_tokens("`a${ x }`", "`a${x}`"));
        assert_eq!(
            kinds("`a${ x }`"),
            vec![
                (TokenKind::Template, "`a${"),
                (TokenKind::Word, "x"),
                (TokenKind::Template, "}`"),
            ]
        );
    }

    #[test]
    fn template_text_whitespace_is_significant() {
        assert!(!equal_tokens("`a ${x}`", "`a${x}`"));
    }

    #[test]
    fn regex_literal_is_not_a_comment() {
        assert!(!equal_tokens(
            "s.split(/\\/\\//).map(f)",
            "s.split(/\\/\\//).map(g)"
        ));
        assert!(!has_comment("`v${s.split(/\\/\\//)[0]}`"));
        assert_eq!(
            kinds("s.split(/\\/\\//)"),
            vec![
                (TokenKind::Word, "s"),
                (TokenKind::Punctuator, "."),
                (TokenKind::Word, "split"),
                (TokenKind::Punctuator, "("),
                (TokenKind::RegExp, "/\\/\\//"),
                (TokenKind::Punctuator, ")"),
            ]
        );
    }

    #[test]
    fn division_is_not_a_regex() {
        assert_eq!(
            kinds("a / b / c"),
            vec![
                (TokenKind::Word, "a"),
                (TokenKind::Punctuator, "/"),
                (TokenKind::Word, "b"),
                (TokenKind::Punctuator, "/"),
                (TokenKind::Word, "c"),
            ]
        );
    }

    #[test]
    fn comments_are_ignored_by_equality_but_visible_to_has_comment() {
        assert!(equal_tokens(
            "() => console.log('foo')",
            "() =>\n\t// foo\n\tconsole.log('foo')"
        ));
        assert!(has_comment("{/* c */ `v${b}`}"));
        assert!(has_comment("{`v${b}` /* c */}"));
        assert!(!has_comment("{`prefix /* text */ ${foo}`}"));
        assert!(!has_comment("{`v${f('//')}`}"));
    }

    #[test]
    fn nested_templates_track_their_own_braces() {
        assert!(equal_tokens(
            "`a${ { b: `c${ d }` } }`",
            "`a${{b:`c${d}`}}`"
        ));
    }

    #[test]
    fn distinct_expressions_differ() {
        assert!(!equal_tokens("{ a: 42 }", "{ b: 42 }"));
        assert!(!equal_tokens("{ a: 42 }", "{ a: 42, b: 42 }"));
        assert!(!equal_tokens("'a'", "\"a\""));
    }
}
