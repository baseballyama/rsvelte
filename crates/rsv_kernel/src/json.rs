//! A small streaming JSON writer. Output JSON is written directly; no intermediate value tree.

pub struct JsonWriter {
    out: String,
    /// Per open container: has at least one member been written.
    stack: Vec<bool>,
    /// A key was just written; the next value belongs to it.
    after_key: bool,
    pretty: bool,
}

impl JsonWriter {
    pub fn new(pretty: bool) -> JsonWriter {
        JsonWriter {
            out: String::new(),
            stack: Vec::new(),
            after_key: false,
            pretty,
        }
    }

    pub fn finish(mut self) -> String {
        if self.pretty {
            self.out.push('\n');
        }
        self.out
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
        write_str(&mut self.out, k);
        self.out.push(':');
        if self.pretty {
            self.out.push(' ');
        }
        self.after_key = true;
        self
    }

    pub fn str(&mut self, s: &str) -> &mut Self {
        self.before_value();
        write_str(&mut self.out, s);
        self
    }

    pub fn num(&mut self, n: impl std::fmt::Display) -> &mut Self {
        self.before_value();
        use std::fmt::Write;
        let _ = write!(self.out, "{n}");
        self
    }

    pub fn bool(&mut self, b: bool) -> &mut Self {
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

pub fn write_str(out: &mut String, s: &str) {
    out.push('"');
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => {
                use std::fmt::Write;
                let _ = write!(out, "\\u{:04x}", c as u32);
            }
            c => out.push(c),
        }
    }
    out.push('"');
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn nested_values_and_keys() {
        let mut w = JsonWriter::new(false);
        w.begin_object()
            .key("a")
            .num(1)
            .key("b")
            .begin_array()
            .str("x\n")
            .null()
            .end_array()
            .key("c")
            .begin_object()
            .end_object()
            .end_object();
        assert_eq!(w.finish(), r#"{"a":1,"b":["x\n",null],"c":{}}"#);
        let mut w = JsonWriter::new(true);
        w.begin_array()
            .begin_object()
            .key("k")
            .bool(true)
            .end_object()
            .end_array();
        assert_eq!(w.finish(), "[\n\t{\n\t\t\"k\": true\n\t}\n]\n");
    }
}
