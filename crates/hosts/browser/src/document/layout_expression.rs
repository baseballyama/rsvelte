use std::collections::HashMap;

use rsvelte_document_printer::{GroupIdentifier, LayoutInstructionIdentifier, LayoutInstructions};

/// Values nested deeper than this are refused; the parser recurses once per level.
const MAX_DEPTH: usize = 256;

#[derive(Debug)]
pub(crate) struct Parsed {
    pub docs: LayoutInstructions,
    pub root: LayoutInstructionIdentifier,
    /// (layout instruction, UTF-16 offset of the source that built it).
    pub origins: Vec<(u32, usize)>,
}

#[derive(Debug)]
pub(crate) struct LayoutExpressionError {
    pub message: String,
    /// UTF-16 offset, as JavaScript strings count.
    pub at: usize,
}

#[derive(Debug)]
enum TokenKind {
    String(String),
    Identifier(String),
    Punct(char),
}

#[derive(Debug)]
struct Token {
    kind: TokenKind,
    at: usize,
}

#[derive(Debug)]
enum Value {
    LayoutInstruction(LayoutInstructionIdentifier),
    List(Vec<LayoutInstructionIdentifier>),
    String(String),
}

#[derive(Debug)]
struct Arg {
    value: Value,
    at: usize,
}

pub(crate) fn parse(source: &str) -> Result<Parsed, LayoutExpressionError> {
    let (tokens, end) = lex(source)?;
    Parser {
        tokens: tokens.into_iter().peekable(),
        end,
        depth: 0,
        docs: LayoutInstructions::new(),
        groups: HashMap::new(),
        origins: Vec::new(),
    }
    .parse()
}

struct Parser {
    tokens: std::iter::Peekable<std::vec::IntoIter<Token>>,
    /// UTF-16 length of the source, where "ended too early" errors point.
    end: usize,
    depth: usize,
    docs: LayoutInstructions,
    groups: HashMap<String, GroupIdentifier>,
    origins: Vec<(u32, usize)>,
}

impl Parser {
    fn parse(mut self) -> Result<Parsed, LayoutExpressionError> {
        let at = self.tokens.peek().map_or(0, |token| token.at);
        let value = self.value()?;
        let root = self.as_doc(value, at);
        if let Some(token) = self.tokens.peek() {
            return Err(error("式のあとに余分なものがあります", token.at));
        }
        Ok(Parsed {
            docs: self.docs,
            root,
            origins: self.origins,
        })
    }

    fn value(&mut self) -> Result<Value, LayoutExpressionError> {
        let Some(token) = self.tokens.next() else {
            return Err(error("式が途中で終わっています", self.end));
        };
        if self.depth == MAX_DEPTH {
            return Err(error(
                &format!("入れ子が深すぎます（{MAX_DEPTH} 段まで）"),
                token.at,
            ));
        }
        self.depth += 1;
        let value = match token.kind {
            TokenKind::String(value) => Ok(Value::String(value)),
            TokenKind::Punct('[') => self.list(),
            TokenKind::Punct(other) => Err(error(&format!("予期しない {other}"), token.at)),
            TokenKind::Identifier(name) => self.call_or_atom(&name, token.at),
        };
        self.depth -= 1;
        value
    }

    fn list(&mut self) -> Result<Value, LayoutExpressionError> {
        let mut items = Vec::new();
        while !self.next_is_punct(']') {
            let at = self.tokens.peek().map_or(self.end, |token| token.at);
            match self.value()? {
                Value::List(nested) => items.extend(nested),
                value => {
                    let document = self.as_doc(value, at);
                    items.push(document);
                }
            }
            if !self.skip_punct(',') {
                break;
            }
        }
        self.expect_punct(']')?;
        Ok(Value::List(items))
    }

    fn call_or_atom(&mut self, name: &str, at: usize) -> Result<Value, LayoutExpressionError> {
        let atom = match name {
            "line" => Some(self.docs.line()),
            "softline" => Some(self.docs.softline()),
            "hardline" => Some(self.docs.hardline()),
            "literalline" => Some(self.docs.literalline()),
            "breakParent" => Some(self.docs.break_parent()),
            "nil" => Some(self.docs.nil()),
            _ => None,
        };
        let value = if let Some(identifier) = atom {
            Value::LayoutInstruction(identifier)
        } else {
            let arguments = self.arguments()?;
            self.call(name, arguments, at)?
        };
        if let Value::LayoutInstruction(identifier) = value {
            self.set_origin(identifier, at);
        }
        Ok(value)
    }

    fn arguments(&mut self) -> Result<Vec<Arg>, LayoutExpressionError> {
        self.expect_punct('(')?;
        let mut arguments = Vec::new();
        while !self.next_is_punct(')') {
            let at = self.tokens.peek().map_or(self.end, |token| token.at);
            arguments.push(Arg {
                value: self.value()?,
                at,
            });
            if !self.skip_punct(',') {
                break;
            }
        }
        self.expect_punct(')')?;
        Ok(arguments)
    }

    fn call(
        &mut self,
        name: &str,
        mut arguments: Vec<Arg>,
        at: usize,
    ) -> Result<Value, LayoutExpressionError> {
        match name {
            "concat" | "group" | "groupBroken" | "fill" => {
                let docs = self.all_docs(arguments);
                Ok(Value::LayoutInstruction(match name {
                    "concat" => self.docs.concat(&docs),
                    "group" => self.docs.group(&docs),
                    "groupBroken" => self.docs.group_broken(&docs),
                    "fill" => self.docs.fill(&docs),
                    _ => unreachable!("the outer match limits these names"),
                }))
            }
            "groupId" => {
                if arguments.is_empty() {
                    return Err(error("groupId の引数が足りません", at));
                }
                let first = arguments.remove(0);
                let name = as_string(first.value, first.at)?;
                let docs = self.all_docs(arguments);
                let group = self.group_identifier(name);
                Ok(Value::LayoutInstruction(
                    self.docs.group_with_identifier(&docs, group),
                ))
            }
            "indent" | "dedent" | "flatOnly" => {
                let [arg] = take(name, arguments, at)?;
                let document = self.as_doc(arg.value, arg.at);
                Ok(Value::LayoutInstruction(match name {
                    "indent" => self.docs.indent(document),
                    "dedent" => self.docs.dedent(document),
                    "flatOnly" => self.docs.flat_only(document),
                    _ => unreachable!("the outer match limits these names"),
                }))
            }
            "ifBreak" => {
                let [broken, flat] = take(name, arguments, at)?;
                let broken = self.as_doc(broken.value, broken.at);
                let flat = self.as_doc(flat.value, flat.at);
                Ok(Value::LayoutInstruction(self.docs.if_break(broken, flat)))
            }
            "ifBreakOf" => {
                let [group, broken, flat] = take(name, arguments, at)?;
                let name = as_string(group.value, group.at)?;
                let broken = self.as_doc(broken.value, broken.at);
                let flat = self.as_doc(flat.value, flat.at);
                let group = self.group_identifier(name);
                Ok(Value::LayoutInstruction(
                    self.docs.if_break_of(broken, flat, group),
                ))
            }
            "indentIfBreak" => {
                let [group, document] = take(name, arguments, at)?;
                let name = as_string(group.value, group.at)?;
                let document = self.as_doc(document.value, document.at);
                let group = self.group_identifier(name);
                Ok(Value::LayoutInstruction(
                    self.docs.indent_if_break(document, group),
                ))
            }
            "join" => {
                let [separator, items] = take(name, arguments, at)?;
                let separator = self.as_doc(separator.value, separator.at);
                let items = match items.value {
                    Value::List(items) => items,
                    value => vec![self.as_doc(value, items.at)],
                };
                Ok(Value::List(self.docs.join(separator, &items)))
            }
            _ => Err(error(&format!("知らない関数 {name}"), at)),
        }
    }

    fn all_docs(&mut self, arguments: Vec<Arg>) -> Vec<LayoutInstructionIdentifier> {
        let mut docs = Vec::new();
        for arg in arguments {
            match arg.value {
                Value::List(items) => docs.extend(items),
                value => {
                    let document = self.as_doc(value, arg.at);
                    docs.push(document);
                }
            }
        }
        docs
    }

    fn as_doc(&mut self, value: Value, at: usize) -> LayoutInstructionIdentifier {
        match value {
            Value::LayoutInstruction(document) => document,
            Value::String(text) => self.docs.text(&text),
            Value::List(items) => {
                let document = self.docs.concat(&items);
                self.set_origin(document, at);
                document
            }
        }
    }

    fn group_identifier(&mut self, name: String) -> GroupIdentifier {
        *self
            .groups
            .entry(name)
            .or_insert_with(|| self.docs.new_group_identifier())
    }

    fn set_origin(&mut self, document: LayoutInstructionIdentifier, at: usize) {
        self.origins.push((document.index(), at));
    }

    fn expect_punct(&mut self, punct: char) -> Result<(), LayoutExpressionError> {
        if self.skip_punct(punct) {
            Ok(())
        } else {
            let at = self.tokens.peek().map_or(self.end, |token| token.at);
            Err(error(&format!("{punct} が必要です"), at))
        }
    }

    fn skip_punct(&mut self, punct: char) -> bool {
        let found = self.next_is_punct(punct);
        if found {
            self.tokens.next();
        }
        found
    }

    fn next_is_punct(&mut self, punct: char) -> bool {
        self.tokens
            .peek()
            .is_some_and(|token| matches!(token.kind, TokenKind::Punct(value) if value == punct))
    }
}

/// The arguments of a call that takes exactly `N` of them.
fn take<const N: usize>(
    name: &str,
    arguments: Vec<Arg>,
    at: usize,
) -> Result<[Arg; N], LayoutExpressionError> {
    arguments
        .try_into()
        .map_err(|_arguments| error(&format!("{name} は引数を {N} 個とります"), at))
}

fn as_string(value: Value, at: usize) -> Result<String, LayoutExpressionError> {
    if let Value::String(text) = value {
        Ok(text)
    } else {
        Err(error("ここには文字列（グループ名）が必要です", at))
    }
}

fn error(message: &str, at: usize) -> LayoutExpressionError {
    LayoutExpressionError {
        message: message.to_owned(),
        at,
    }
}

/// The tokens and the UTF-16 length of `source`.
fn lex(source: &str) -> Result<(Vec<Token>, usize), LayoutExpressionError> {
    let mut tokens = Vec::new();
    let mut byte = 0;
    // Counted as the cursor moves, so each byte is converted to UTF-16 once.
    let mut utf16 = 0;
    while let Some(ch) = char_at(source, byte) {
        let start = byte;
        if ch.is_whitespace() {
            byte += ch.len_utf8();
        } else if source[byte..].starts_with("//") {
            byte = source[byte..]
                .find('\n')
                .map_or(source.len(), |end| byte + end);
        } else {
            let kind = if ch == '"' {
                let (value, end) = string_token(source, byte, utf16)?;
                byte = end;
                TokenKind::String(value)
            } else if ch.is_ascii_alphabetic() || ch == '_' {
                byte += 1;
                while source
                    .as_bytes()
                    .get(byte)
                    .is_some_and(|next| next.is_ascii_alphanumeric() || *next == b'_')
                {
                    byte += 1;
                }
                TokenKind::Identifier(source[start..byte].to_owned())
            } else if matches!(ch, '(' | ')' | '[' | ']' | ',') {
                byte += 1;
                TokenKind::Punct(ch)
            } else {
                return Err(error(&format!("使えない文字 {ch:?}"), utf16));
            };
            tokens.push(Token { kind, at: utf16 });
        }
        utf16 += source[start..byte].encode_utf16().count();
    }
    Ok((tokens, utf16))
}

/// The value of the string starting at byte `start` (UTF-16 offset `at`) and the byte after it.
fn string_token(
    source: &str,
    start: usize,
    at: usize,
) -> Result<(String, usize), LayoutExpressionError> {
    let mut value = String::new();
    let mut byte = start + 1;
    while let Some(ch) = char_at(source, byte) {
        if ch == '"' {
            return Ok((value, byte + 1));
        }
        if ch == '\\' {
            let Some(escaped) = char_at(source, byte + 1) else {
                break;
            };
            value.push(match escaped {
                'n' => '\n',
                't' => '\t',
                '"' | '\\' => escaped,
                _ => {
                    let at = at + source[start..byte].encode_utf16().count();
                    return Err(error(&format!("知らないエスケープ \\{escaped}"), at));
                }
            });
            byte += 1 + escaped.len_utf8();
        } else {
            value.push(ch);
            byte += ch.len_utf8();
        }
    }
    Err(error("文字列が閉じていません", at))
}

fn char_at(source: &str, byte: usize) -> Option<char> {
    source.get(byte..)?.chars().next()
}

#[cfg(test)]
mod tests;
