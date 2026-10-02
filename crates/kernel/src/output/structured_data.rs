//! A small streaming JSON writer. Output JSON is written directly; no intermediate value tree.

use crate::performance::buffer_pool;

#[derive(Debug)]
pub struct StructuredDataWriter {
    out: String,
    /// Per open container: has at least one member been written.
    stack: Vec<bool>,
    /// A key was just written; the next value belongs to it.
    after_key: bool,
    pretty: bool,
}

/// A number [`StructuredDataWriter::write_number`] writes exactly: an integer. A fraction goes
/// through [`StructuredDataWriter::fixed`], which can say what it does with a value JSON cannot
/// hold.
pub trait Integer: Copy + std::fmt::Display {}

macro_rules! integers {
    ($($t:ty),*) => { $(impl Integer for $t {})* };
}
integers!(u8, u16, u32, u64, usize, i8, i16, i32, i64, isize);

impl StructuredDataWriter {
    #[must_use]
    pub fn new(pretty: bool) -> Self {
        Self {
            out: String::new(),
            stack: buffer_pool::take_keyed::<Self, bool>(),
            after_key: false,
            pretty,
        }
    }

    #[must_use]
    pub fn finish(mut self) -> String {
        if self.pretty {
            self.out.push('\n');
        }
        std::mem::take(&mut self.out)
    }

    fn newline(&mut self) {
        if self.pretty {
            self.out.push('\n');
            for _ in 0..self.stack.len() {
                self.out.push('\t');
            }
        }
    }

    fn before_value(&mut self) {
        if self.after_key {
            self.after_key = false;
            return;
        }
        if let Some(has) = self.stack.last_mut() {
            let comma = *has;
            *has = true;
            if comma {
                self.out.push(',');
            }
            self.newline();
        }
    }

    pub fn begin_object(&mut self) -> &mut Self {
        self.before_value();
        self.out.push('{');
        self.stack.push(false);
        self
    }

    pub fn end_object(&mut self) -> &mut Self {
        self.close('}')
    }

    pub fn begin_array(&mut self) -> &mut Self {
        self.before_value();
        self.out.push('[');
        self.stack.push(false);
        self
    }

    pub fn end_array(&mut self) -> &mut Self {
        self.close(']')
    }

    fn close(&mut self, c: char) -> &mut Self {
        if self.stack.pop() == Some(true) {
            self.newline();
        }
        self.out.push(c);
        self
    }

    pub fn key(&mut self, k: &str) -> &mut Self {
        self.before_value();
        write_string(&mut self.out, k);
        self.out.push(':');
        if self.pretty {
            self.out.push(' ');
        }
        self.after_key = true;
        self
    }

    pub fn write_string(&mut self, s: &str) -> &mut Self {
        self.before_value();
        write_string(&mut self.out, s);
        self
    }

    pub fn write_number(&mut self, n: impl Integer) -> &mut Self {
        use std::fmt::Write;
        self.before_value();
        // Writing to a `String` cannot fail.
        _ = write!(self.out, "{n}");
        self
    }

    /// `n` with `decimals` digits after the point, or `null` when it is not finite: JSON has no
    /// `NaN` or infinity.
    pub fn fixed(&mut self, n: f64, decimals: usize) -> &mut Self {
        use std::fmt::Write;
        if !n.is_finite() {
            return self.null();
        }
        self.before_value();
        _ = write!(self.out, "{n:.decimals$}");
        self
    }

    pub fn write_boolean(&mut self, b: bool) -> &mut Self {
        self.before_value();
        self.out.push_str(if b { "true" } else { "false" });
        self
    }

    pub fn null(&mut self) -> &mut Self {
        self.before_value();
        self.out.push_str("null");
        self
    }
}

impl Drop for StructuredDataWriter {
    fn drop(&mut self) {
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.stack));
    }
}

/// `s` as a JSON string. The text between escapes is copied a run at a time; every byte that needs
/// an escape is ASCII, so a run always ends on a character boundary.
pub fn write_string(out: &mut String, s: &str) {
    const HEX: &[u8; 16] = b"0123456789abcdef";
    out.reserve(s.len() + 2);
    out.push('"');
    let mut run = 0;
    for (i, &b) in s.as_bytes().iter().enumerate() {
        let esc = match b {
            b'"' => "\\\"",
            b'\\' => "\\\\",
            b'\n' => "\\n",
            b'\r' => "\\r",
            b'\t' => "\\t",
            0..0x20 => "",
            _ => continue,
        };
        out.push_str(&s[run..i]);
        if esc.is_empty() {
            out.push_str("\\u00");
            out.push(char::from(HEX[usize::from(b >> 4)]));
            out.push(char::from(HEX[usize::from(b & 0xF)]));
        } else {
            out.push_str(esc);
        }
        run = i + 1;
    }
    out.push_str(&s[run..]);
    out.push('"');
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The definition the run-copying [`write_str`] replaced.
    fn by_char(s: &str) -> String {
        use std::fmt::Write;
        let mut out = String::from('"');
        for c in s.chars() {
            match c {
                '"' => out.push_str("\\\""),
                '\\' => out.push_str("\\\\"),
                '\n' => out.push_str("\\n"),
                '\r' => out.push_str("\\r"),
                '\t' => out.push_str("\\t"),
                c if (c as u32) < 0x20 => _ = write!(out, "\\u{:04x}", c as u32),
                c => out.push(c),
            }
        }
        out.push('"');
        out
    }

    #[test]
    fn strings_are_escaped_as_one_character_at_a_time() {
        let mut cases: Vec<String> = (0u8..0x80).map(|b| char::from(b).to_string()).collect();
        cases.extend(
            [
                "",
                "plain",
                "a\"b\\c\nd",
                "é\u{1}日本\u{1F600}\t",
                "\u{7f}\u{80}\u{1f}x",
            ]
            .map(String::from),
        );
        let all: String = cases.concat();
        cases.push(all);
        for s in &cases {
            let mut out = String::new();
            write_string(&mut out, s);
            assert_eq!(out, by_char(s), "{s:?}");
        }
    }

    #[test]
    fn a_fraction_json_cannot_hold_is_null() {
        let mut w = StructuredDataWriter::new(false);
        w.begin_array()
            .fixed(1.0 / 3.0, 3)
            .fixed(f64::NAN, 3)
            .fixed(f64::INFINITY, 1)
            .write_number(7u32)
            .end_array();
        assert_eq!(w.finish(), "[0.333,null,null,7]");
    }

    #[test]
    fn nested_values_and_keys() {
        let mut w = StructuredDataWriter::new(false);
        w.begin_object()
            .key("a")
            .write_number(1)
            .key("b")
            .begin_array()
            .write_string("x\n")
            .null()
            .end_array()
            .key("c")
            .begin_object()
            .end_object()
            .end_object();
        assert_eq!(w.finish(), r#"{"a":1,"b":["x\n",null],"c":{}}"#);
        let mut w = StructuredDataWriter::new(true);
        w.begin_array()
            .begin_object()
            .key("k")
            .write_boolean(true)
            .end_object()
            .end_array();
        assert_eq!(w.finish(), "[\n\t{\n\t\t\"k\": true\n\t}\n]\n");
    }

    #[test]
    fn deep_nesting_is_supported() {
        let mut w = StructuredDataWriter::new(false);
        for _ in 0..100 {
            w.begin_array();
        }
        w.null();
        for _ in 0..100 {
            w.end_array();
        }
        let out = w.finish();
        assert_eq!(out.len(), 204);
        assert!(out.starts_with(&"[".repeat(100)));
        assert!(out.ends_with(&"]".repeat(100)));
    }
}
