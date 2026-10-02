use std::collections::HashMap;

use rsvelte_kernel::output::document::{
    GroupIdentifier, LayoutInstructionIdentifier, LayoutInstructions,
};

#[derive(Debug)]
pub(crate) struct Parsed {
    pub docs: LayoutInstructions,
    pub root: LayoutInstructionIdentifier,
    pub origins: Vec<(u32, usize)>,
}

#[derive(Debug)]
pub(crate) struct LayoutExpressionError {
    pub message: String,
    pub at: usize,
}

#[derive(Clone, Debug)]
enum TokenKind {
    String(String),
    Identifier(String),
    Punct(char),
}

#[derive(Clone, Debug)]
struct Token {
    kind: TokenKind,
    at_utf16: usize,
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
    Parser {
        source,
        tokens: lex(source)?,
        cursor: 0,
        docs: LayoutInstructions::new(),
        groups: HashMap::new(),
        origins: Vec::new(),
    }
    .parse()
}

struct Parser<'a> {
    source: &'a str,
    tokens: Vec<Token>,
    cursor: usize,
    docs: LayoutInstructions,
    groups: HashMap<String, GroupIdentifier>,
    origins: Vec<Option<usize>>,
}

impl Parser<'_> {
    fn parse(mut self) -> Result<Parsed, LayoutExpressionError> {
        let at = self.peek().map_or(0, |token| token.at_utf16);
        let value = self.value()?;
        let root = self.as_doc(value, at);
        if let Some(token) = self.peek() {
            return Err(Self::error(
                "式のあとに余分なものがあります",
                token.at_utf16,
            ));
        }
        let origins = self
            .origins
            .into_iter()
            .enumerate()
            .filter_map(|(document, at)| at.map(|at| (document as u32, at)))
            .collect();
        Ok(Parsed {
            docs: self.docs,
            root,
            origins,
        })
    }

    fn value(&mut self) -> Result<Value, LayoutExpressionError> {
        let Some(token) = self.next() else {
            return Err(Self::error(
                "式が途中で終わっています",
                self.source.encode_utf16().count(),
            ));
        };
        match token.kind {
            TokenKind::String(value) => Ok(Value::String(value)),
            TokenKind::Punct('[') => self.list(),
            TokenKind::Punct(other) => {
                Err(Self::error(&format!("予期しない {other}"), token.at_utf16))
            }
            TokenKind::Identifier(name) => self.call_or_atom(&name, token.at_utf16),
        }
    }

    fn list(&mut self) -> Result<Value, LayoutExpressionError> {
        let mut items = Vec::new();
        while !self.next_is_punct(']') {
            let Some(token) = self.peek() else {
                return Err(Self::error(
                    "] が必要です",
                    self.source.encode_utf16().count(),
                ));
            };
            let at = token.at_utf16;
            match self.value()? {
                Value::List(nested) => items.extend(nested),
                value => {
                    let document = self.as_doc(value, at);
                    items.push(document);
                }
            }
            if self.next_is_punct(',') {
                self.cursor += 1;
            } else {
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
            let Some(token) = self.peek() else {
                return Err(Self::error(
                    ") が必要です",
                    self.source.encode_utf16().count(),
                ));
            };
            let at = token.at_utf16;
            arguments.push(Arg {
                value: self.value()?,
                at,
            });
            if self.next_is_punct(',') {
                self.cursor += 1;
            } else {
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
                    return Err(Self::error("groupId の引数が足りません", at));
                }
                let first = arguments.remove(0);
                let name = Self::as_string(first.value, first.at)?;
                let docs = self.all_docs(arguments);
                let group = self.group_identifier(name);
                Ok(Value::LayoutInstruction(
                    self.docs.group_with_identifier(&docs, group),
                ))
            }
            "indent" | "dedent" | "flatOnly" => {
                Self::need(name, &arguments, 1, at)?;
                let arg = arguments.remove(0);
                let document = self.as_doc(arg.value, arg.at);
                Ok(Value::LayoutInstruction(match name {
                    "indent" => self.docs.indent(document),
                    "dedent" => self.docs.dedent(document),
                    "flatOnly" => self.docs.flat_only(document),
                    _ => unreachable!("the outer match limits these names"),
                }))
            }
            "ifBreak" => {
                Self::need(name, &arguments, 2, at)?;
                let flat = arguments.pop().expect("two arguments were checked");
                let broken = arguments.pop().expect("two arguments were checked");
                let broken = self.as_doc(broken.value, broken.at);
                let flat = self.as_doc(flat.value, flat.at);
                Ok(Value::LayoutInstruction(self.docs.if_break(broken, flat)))
            }
            "ifBreakOf" => {
                Self::need(name, &arguments, 3, at)?;
                let flat = arguments.pop().expect("three arguments were checked");
                let broken = arguments.pop().expect("three arguments were checked");
                let group = arguments.pop().expect("three arguments were checked");
                let name = Self::as_string(group.value, group.at)?;
                let broken = self.as_doc(broken.value, broken.at);
                let flat = self.as_doc(flat.value, flat.at);
                let group = self.group_identifier(name);
                Ok(Value::LayoutInstruction(
                    self.docs.if_break_of(broken, flat, group),
                ))
            }
            "indentIfBreak" => {
                Self::need(name, &arguments, 2, at)?;
                let document = arguments.pop().expect("two arguments were checked");
                let group = arguments.pop().expect("two arguments were checked");
                let name = Self::as_string(group.value, group.at)?;
                let document = self.as_doc(document.value, document.at);
                let group = self.group_identifier(name);
                Ok(Value::LayoutInstruction(
                    self.docs.indent_if_break(document, group),
                ))
            }
            "join" => {
                Self::need(name, &arguments, 2, at)?;
                let items = arguments.pop().expect("two arguments were checked");
                let separator = arguments.pop().expect("two arguments were checked");
                let separator = self.as_doc(separator.value, separator.at);
                let items = match items.value {
                    Value::List(items) => items,
                    value => vec![self.as_doc(value, items.at)],
                };
                Ok(Value::List(self.docs.join(separator, &items)))
            }
            _ => Err(Self::error(&format!("知らない関数 {name}"), at)),
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

    fn as_string(value: Value, at: usize) -> Result<String, LayoutExpressionError> {
        if let Value::String(text) = value {
            Ok(text)
        } else {
            Err(Self::error("ここには文字列（グループ名）が必要です", at))
        }
    }

    fn group_identifier(&mut self, name: String) -> GroupIdentifier {
        if let Some(&group) = self.groups.get(&name) {
            group
        } else {
            let group = self.docs.new_group_identifier();
            self.groups.insert(name, group);
            group
        }
    }

    fn set_origin(&mut self, document: LayoutInstructionIdentifier, at: usize) {
        let index = document.index() as usize;
        if self.origins.len() <= index {
            self.origins.resize(index + 1, None);
        }
        self.origins[index] = Some(at);
    }

    fn need(
        name: &str,
        arguments: &[Arg],
        count: usize,
        at: usize,
    ) -> Result<(), LayoutExpressionError> {
        if arguments.len() == count {
            Ok(())
        } else {
            Err(Self::error(
                &format!("{name} は引数を {count} 個とります"),
                at,
            ))
        }
    }

    fn expect_punct(&mut self, punct: char) -> Result<(), LayoutExpressionError> {
        let Some(token) = self.peek() else {
            return Err(Self::error(
                &format!("{punct} が必要です"),
                self.source.encode_utf16().count(),
            ));
        };
        if matches!(token.kind, TokenKind::Punct(value) if value == punct) {
            self.cursor += 1;
            Ok(())
        } else {
            Err(Self::error(&format!("{punct} が必要です"), token.at_utf16))
        }
    }

    fn next_is_punct(&self, punct: char) -> bool {
        self.peek()
            .is_some_and(|token| matches!(token.kind, TokenKind::Punct(value) if value == punct))
    }

    fn peek(&self) -> Option<&Token> {
        self.tokens.get(self.cursor)
    }

    fn next(&mut self) -> Option<Token> {
        let token = self.tokens.get(self.cursor).cloned();
        self.cursor += usize::from(token.is_some());
        token
    }

    fn error(message: &str, at: usize) -> LayoutExpressionError {
        LayoutExpressionError {
            message: message.to_owned(),
            at,
        }
    }
}

fn lex(source: &str) -> Result<Vec<Token>, LayoutExpressionError> {
    let mut tokens = Vec::new();
    let mut byte = 0;
    while let Some(ch) = char_at(source, byte) {
        if ch.is_whitespace() {
            byte += ch.len_utf8();
            continue;
        }
        if source[byte..].starts_with("//") {
            byte = source[byte..]
                .find('\n')
                .map_or(source.len(), |end| byte + end);
            continue;
        }
        let at_byte = byte;
        let at_utf16 = source[..byte].encode_utf16().count();
        let kind = if ch == '"' {
            let (value, end) = string_token(source, byte, at_utf16)?;
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
            TokenKind::Identifier(source[at_byte..byte].to_owned())
        } else if matches!(ch, '(' | ')' | '[' | ']' | ',') {
            byte += 1;
            TokenKind::Punct(ch)
        } else {
            return Err(LayoutExpressionError {
                message: format!("使えない文字 {ch:?}"),
                at: at_utf16,
            });
        };
        tokens.push(Token { kind, at_utf16 });
    }
    Ok(tokens)
}

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
            byte += 1;
            let Some(escaped) = char_at(source, byte) else {
                break;
            };
            value.push(match escaped {
                'n' => '\n',
                't' => '\t',
                other => other,
            });
            byte += escaped.len_utf8();
        } else {
            value.push(ch);
            byte += ch.len_utf8();
        }
    }
    Err(LayoutExpressionError {
        message: "文字列が閉じていません".to_owned(),
        at,
    })
}

fn char_at(source: &str, byte: usize) -> Option<char> {
    source.get(byte..)?.chars().next()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn print(source: &str, width: usize) -> Result<String, LayoutExpressionError> {
        let parsed = parse(source)?;
        parsed
            .docs
            .print(
                parsed.root,
                &rsvelte_kernel::output::document::PrintOptions {
                    width,
                    ..rsvelte_kernel::output::document::PrintOptions::default()
                },
            )
            .map_err(|_refused| LayoutExpressionError {
                message: "flat-only layout refused".to_owned(),
                at: 0,
            })
    }

    #[test]
    fn builds_documents_and_named_groups() {
        let call = concat!(
            r#"group("f(", indent([softline, "#,
            r#"join([",", line], ["aaaa", "bbbb"])]), softline, ")")"#
        );
        assert_eq!(print(call, 80).expect("valid DSL"), "f(aaaa, bbbb)");
        assert_eq!(
            print(call, 10).expect("valid DSL"),
            "f(\n  aaaa,\n  bbbb\n)"
        );
        assert_eq!(
            print(
                r#"[groupId("g", "x", line, "y"), ifBreakOf("g", "!", "?")]"#,
                3,
            )
            .expect("valid DSL"),
            "x\ny!"
        );
    }

    #[test]
    fn reports_utf16_offsets() {
        let error = parse("[\"日\", @]").expect_err("invalid character");
        assert_eq!(error.at, 6);
    }
}
