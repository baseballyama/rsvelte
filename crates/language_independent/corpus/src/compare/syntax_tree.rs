//! An AST against the official one, which the corpus keeps as the sha256 of its canonical JSON:
//! every object's keys sorted as JavaScript sorts strings, and strings and numbers written as
//! `JSON.stringify` writes them.

use std::fmt::Write as _;

use sha2::{Digest, Sha256};

/// Whether the AST in `json` hashes to `official`.
///
/// # Errors
///
/// `json` is not JSON.
pub(super) fn same_hash(official: &str, json: &str) -> Result<bool, String> {
    let canonical = canonical(json)?;
    let digest = Sha256::digest(canonical.as_bytes());
    let hex: String = digest
        .iter()
        .flat_map(|byte| [byte >> 4, byte & 0xF])
        .map(|digit| char::from_digit(u32::from(digit), 16).unwrap_or('?'))
        .collect();
    Ok(official.trim() == hex)
}

/// `json` as the oracle's `canonical` writes the same value.
///
/// # Errors
///
/// `json` is not JSON.
pub(super) fn canonical(json: &str) -> Result<String, String> {
    let mut reader = Reader { json, at: 0 };
    let value = reader.value()?;
    reader.blank();
    if reader.at != json.len() {
        return Err(format!("text after the value at {}", reader.at));
    }
    let mut out = String::with_capacity(json.len());
    write(&value, &mut out);
    Ok(out)
}

enum Value<'j> {
    /// A number, `true`, `false` or `null`, as written.
    Atom(&'j str),
    /// A string, as UTF-16 code units, which a lone surrogate needs.
    String(Vec<u16>),
    Array(Vec<Self>),
    Object(Vec<(Vec<u16>, Self)>),
}

struct Reader<'j> {
    json: &'j str,
    at: usize,
}

impl<'j> Reader<'j> {
    fn blank(&mut self) {
        let rest = &self.json[self.at..];
        self.at += rest.len() - rest.trim_start_matches([' ', '\t', '\n', '\r']).len();
    }

    fn peek(&self) -> Option<u8> {
        self.json.as_bytes().get(self.at).copied()
    }

    fn expect(&mut self, byte: u8) -> Result<(), String> {
        self.blank();
        if self.peek() == Some(byte) {
            self.at += 1;
            Ok(())
        } else {
            Err(format!("expected `{}` at {}", byte as char, self.at))
        }
    }

    fn value(&mut self) -> Result<Value<'j>, String> {
        self.blank();
        match self.peek() {
            Some(b'{') => {
                self.at += 1;
                let mut entries = Vec::new();
                self.blank();
                if self.peek() == Some(b'}') {
                    self.at += 1;
                    return Ok(Value::Object(entries));
                }
                loop {
                    self.blank();
                    let key = self.string()?;
                    self.expect(b':')?;
                    let value = self.value()?;
                    // `JSON.parse` keeps the last of a repeated key.
                    entries.retain(|(k, _)| *k != key);
                    entries.push((key, value));
                    self.blank();
                    match self.peek() {
                        Some(b',') => self.at += 1,
                        Some(b'}') => {
                            self.at += 1;
                            return Ok(Value::Object(entries));
                        }
                        _ => return Err(format!("expected `,` or `}}` at {}", self.at)),
                    }
                }
            }
            Some(b'[') => {
                self.at += 1;
                let mut elements = Vec::new();
                self.blank();
                if self.peek() == Some(b']') {
                    self.at += 1;
                    return Ok(Value::Array(elements));
                }
                loop {
                    elements.push(self.value()?);
                    self.blank();
                    match self.peek() {
                        Some(b',') => self.at += 1,
                        Some(b']') => {
                            self.at += 1;
                            return Ok(Value::Array(elements));
                        }
                        _ => return Err(format!("expected `,` or `]` at {}", self.at)),
                    }
                }
            }
            Some(b'"') => Ok(Value::String(self.string()?)),
            Some(_) => {
                let rest = &self.json[self.at..];
                let length = rest
                    .find(|c: char| matches!(c, ',' | ']' | '}') || c.is_ascii_whitespace())
                    .unwrap_or(rest.len());
                if length == 0 {
                    return Err(format!("expected a value at {}", self.at));
                }
                self.at += length;
                Ok(Value::Atom(&rest[..length]))
            }
            None => Err("expected a value at the end".to_owned()),
        }
    }

    fn string(&mut self) -> Result<Vec<u16>, String> {
        if self.peek() != Some(b'"') {
            return Err(format!("expected a string at {}", self.at));
        }
        self.at += 1;
        let mut units = Vec::new();
        loop {
            let rest = &self.json[self.at..];
            let plain = rest.find(['"', '\\']).ok_or("an unterminated string")?;
            units.extend(rest[..plain].encode_utf16());
            self.at += plain;
            if self.peek() == Some(b'"') {
                self.at += 1;
                return Ok(units);
            }
            let escape = self.json.as_bytes().get(self.at + 1).copied();
            self.at += 2;
            units.push(match escape {
                Some(b'"') => u16::from(b'"'),
                Some(b'\\') => u16::from(b'\\'),
                Some(b'/') => u16::from(b'/'),
                Some(b'b') => 0x08,
                Some(b'f') => 0x0C,
                Some(b'n') => u16::from(b'\n'),
                Some(b'r') => u16::from(b'\r'),
                Some(b't') => u16::from(b'\t'),
                Some(b'u') => {
                    let hex = self
                        .json
                        .get(self.at..self.at + 4)
                        .ok_or("a short `\\u` escape")?;
                    self.at += 4;
                    u16::from_str_radix(hex, 16).map_err(|e| e.to_string())?
                }
                _ => return Err(format!("an unknown escape at {}", self.at - 2)),
            });
        }
    }
}

fn write(value: &Value<'_>, out: &mut String) {
    match value {
        Value::Atom(atom) => out.push_str(atom),
        Value::String(units) => string(units, out),
        Value::Array(elements) => {
            out.push('[');
            for (index, element) in elements.iter().enumerate() {
                if index > 0 {
                    out.push(',');
                }
                write(element, out);
            }
            out.push(']');
        }
        Value::Object(entries) => {
            let mut sorted: Vec<_> = entries.iter().collect();
            // JavaScript sorts strings by their UTF-16 code units.
            sorted.sort_by(|(a, _), (b, _)| a.cmp(b));
            out.push('{');
            for (index, (key, value)) in sorted.into_iter().enumerate() {
                if index > 0 {
                    out.push(',');
                }
                string(key, out);
                out.push(':');
                write(value, out);
            }
            out.push('}');
        }
    }
}

/// A string as `JSON.stringify` writes it: a lone surrogate and a control character escaped.
fn string(units: &[u16], out: &mut String) {
    out.push('"');
    for decoded in char::decode_utf16(units.iter().copied()) {
        match decoded {
            Ok('"') => out.push_str("\\\""),
            Ok('\\') => out.push_str("\\\\"),
            Ok('\u{8}') => out.push_str("\\b"),
            Ok('\u{c}') => out.push_str("\\f"),
            Ok('\n') => out.push_str("\\n"),
            Ok('\r') => out.push_str("\\r"),
            Ok('\t') => out.push_str("\\t"),
            Ok(c) if (c as u32) < 0x20 => {
                write!(out, "\\u{:04x}", c as u32).expect("writing to a string");
            }
            Ok(c) => out.push(c),
            Err(lone) => {
                write!(out, "\\u{:04x}", lone.unpaired_surrogate()).expect("writing to a string");
            }
        }
    }
    out.push('"');
}

#[cfg(test)]
mod tests;
