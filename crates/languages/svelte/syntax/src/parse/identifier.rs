use unicode_id_start as unicode_identifier_start;

fn is_identifier_start(c: char) -> bool {
    c == '$' || c == '_' || unicode_identifier_start::is_id_start(c)
}

pub(super) fn is_identifier_continue(c: char) -> bool {
    c == '$' || c == '\u{200c}' || c == '\u{200d}' || unicode_identifier_start::is_id_continue(c)
}

/// The length of the identifier `s` starts with (`$` and `_` included), 0 if none.
pub(super) fn identifier_len(s: &str) -> usize {
    let mut chars = s.char_indices();
    match chars.next() {
        Some((_, c)) if is_identifier_start(c) => {}
        _ => return 0,
    }
    chars
        .find(|&(_, c)| !is_identifier_continue(c))
        .map_or(s.len(), |(i, _)| i)
}

/// The length of the bracketed text `s` starts with, through its matching bracket. Strings are
/// skipped, and a template literal's `${…}` is matched with the default brackets, as upstream
/// `match_bracket` does. `None` when a bracket does not match or `s` ends first.
pub(super) fn match_bracket(s: &str, open: u8, close: u8) -> Option<usize> {
    /// What closes an open construct, and whether the default brackets apply inside it.
    #[derive(Clone, Copy, PartialEq, Eq)]
    enum Open {
        Bracket { close: u8, default: bool },
        Template,
    }
    let opener = |c: u8, default: bool| match c {
        b'{' if default => Some(b'}'),
        b'(' if default => Some(b')'),
        b'[' if default => Some(b']'),
        c if !default && c == open => Some(close),
        _ => None,
    };
    let closes = |c: u8, default: bool| {
        if default {
            matches!(c, b'}' | b')' | b']')
        } else {
            c == close
        }
    };
    let default_brackets = matches!((open, close), (b'{', b'}') | (b'(', b')') | (b'[', b']'));
    let b = s.as_bytes();
    let mut stack: Vec<Open> = Vec::new();
    let mut i = 0;
    while i < b.len() {
        let c = b[i];
        i += 1;
        let default = match stack.last() {
            Some(Open::Template) => {
                match c {
                    b'\\' => i += 1,
                    b'`' => {
                        stack.pop();
                    }
                    b'$' if b.get(i) == Some(&b'{') => {
                        i += 1;
                        stack.push(Open::Bracket {
                            close: b'}',
                            default: true,
                        });
                    }
                    _ => {}
                }
                continue;
            }
            Some(&Open::Bracket { default, .. }) => default,
            None => default_brackets,
        };
        match c {
            b'"' | b'\'' => {
                while i < b.len() && b[i] != c {
                    i += if b[i] == b'\\' { 2 } else { 1 };
                }
                i += 1;
            }
            b'`' => stack.push(Open::Template),
            c if let Some(close) = opener(c, default) => {
                stack.push(Open::Bracket { close, default });
            }
            c if closes(c, default) => {
                if stack.pop() != Some(Open::Bracket { close: c, default }) {
                    return None;
                }
                if stack.is_empty() {
                    return Some(i);
                }
            }
            _ => {}
        }
    }
    None
}

/// Upstream `is_reserved` (`utils.js`): the words `read_identifier` refuses as a name.
pub(super) fn is_reserved(word: &str) -> bool {
    matches!(
        word,
        "arguments"
            | "await"
            | "break"
            | "case"
            | "catch"
            | "class"
            | "const"
            | "continue"
            | "debugger"
            | "default"
            | "delete"
            | "do"
            | "else"
            | "enum"
            | "eval"
            | "export"
            | "extends"
            | "false"
            | "finally"
            | "for"
            | "function"
            | "if"
            | "implements"
            | "import"
            | "in"
            | "instanceof"
            | "interface"
            | "let"
            | "new"
            | "null"
            | "package"
            | "private"
            | "protected"
            | "public"
            | "return"
            | "static"
            | "super"
            | "switch"
            | "this"
            | "throw"
            | "true"
            | "try"
            | "typeof"
            | "var"
            | "void"
            | "while"
            | "with"
            | "yield"
    )
}

#[cfg(test)]
mod tests;
