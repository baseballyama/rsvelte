//! Lint rules as a plugin contract. A language supplies a context type (its trees and analyses,
//! computed once per document) and rules over it; the kernel runs them, times each one, orders the
//! findings and renders them. A finding is a [`Diagnostic`] whose code is the rule id.
//!
//! A language with several layers has one context per layer, and a rule is written against the
//! layer that answers its question: an *early* rule reads the surface tree, because it needs what
//! was written (parents, token kinds, a shorthand as a shorthand); a *late* rule reads a lowered
//! layer, because it needs what the code means (an element's kind, a resolved name, a type). Both
//! kinds report into one [`Findings`].

use crate::diag::Diagnostic;
use crate::json::JsonWriter;
use crate::metrics;
use crate::source::LineIndex;

pub trait Rule<C: ?Sized>: Send + Sync {
    /// The rule id as the upstream tool spells it (`no-unused-vars`, `svelte/button-has-type`).
    fn id(&self) -> &'static str;
    fn check(&self, cx: &C, out: &mut Vec<Diagnostic>);
}

/// Findings of one document, collected from rules over any number of layers.
#[derive(Default)]
pub struct Findings {
    out: Vec<Diagnostic>,
}

impl Findings {
    pub fn new() -> Findings {
        Findings::default()
    }

    /// Runs `rules` over one layer's context, in order.
    pub fn run<C: ?Sized>(&mut self, rules: &[&dyn Rule<C>], cx: &C) -> &mut Findings {
        for rule in rules {
            let _p = metrics::phase(rule.id());
            let before = self.out.len();
            rule.check(cx, &mut self.out);
            assert!(
                self.out[before..].iter().all(|d| d.code == rule.id()),
                "rule {} reported under another id",
                rule.id()
            );
        }
        self
    }

    /// Sorted by start offset; ties keep report order (layers in the order they ran, then rules
    /// in order), which is how ESLint sorts (by line, then column, stable).
    pub fn finish(self) -> Vec<Diagnostic> {
        let mut out = self.out;
        out.sort_by_key(|d| d.span.lo);
        out
    }
}

/// [`Findings`] over a single layer.
pub fn run<C: ?Sized>(rules: &[&dyn Rule<C>], cx: &C) -> Vec<Diagnostic> {
    let mut f = Findings::new();
    f.run(rules, cx);
    f.finish()
}

/// `[{rule, message, start: {line, column}, end: {line, column}}]` with ESLint's positions:
/// 1-based lines and 1-based UTF-16 columns.
pub fn render_json(src: &str, lines: &LineIndex, findings: &[Diagnostic]) -> String {
    let mut w = JsonWriter::new(true);
    w.begin_array();
    for d in findings {
        w.begin_object()
            .key("rule")
            .str(&d.code)
            .key("message")
            .str(&d.message);
        for (key, at) in [("start", d.span.lo), ("end", d.span.hi)] {
            let lc = lines.line_col(src, at);
            w.key(key)
                .begin_object()
                .key("line")
                .num(lc.line)
                .key("column")
                .num(lc.column + 1)
                .end_object();
        }
        w.end_object();
    }
    w.end_array();
    w.finish()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::source::Span;

    struct Every(&'static str, u32);

    impl Rule<str> for Every {
        fn id(&self) -> &'static str {
            self.0
        }
        fn check(&self, cx: &str, out: &mut Vec<Diagnostic>) {
            for (i, _) in cx.match_indices('x') {
                let at = i as u32 + self.1;
                out.push(Diagnostic::error(self.0, "x", Span::new(at, at + 1)));
            }
        }
    }

    #[test]
    fn findings_are_ordered_by_offset_and_ties_keep_rule_order() {
        let (a, b) = (Every("a", 0), Every("b", 0));
        let got = run::<str>(&[&b, &a], "x.x");
        let codes: Vec<(&str, u32)> = got.iter().map(|d| (&*d.code, d.span.lo)).collect();
        assert_eq!(codes, [("b", 0), ("a", 0), ("b", 2), ("a", 2)]);
    }

    struct Len;

    impl Rule<[u8]> for Len {
        fn id(&self) -> &'static str {
            "len"
        }
        fn check(&self, cx: &[u8], out: &mut Vec<Diagnostic>) {
            out.push(Diagnostic::error("len", "n", Span::new(0, cx.len() as u32)));
        }
    }

    #[test]
    fn layers_report_into_one_ordering() {
        let x = Every("x", 0);
        let mut f = Findings::new();
        f.run::<str>(&[&x], ".x").run::<[u8]>(&[&Len], b"ab");
        let got = f.finish();
        let codes: Vec<(&str, u32)> = got.iter().map(|d| (&*d.code, d.span.lo)).collect();
        assert_eq!(codes, [("len", 0), ("x", 1)]);
    }

    #[test]
    fn columns_are_one_based_utf16() {
        let src = "é\n😀x";
        let at = src.find('x').unwrap() as u32;
        let d = Diagnostic::error("r", "m", Span::new(at, at + 1));
        let json = render_json(src, &LineIndex::new(src), &[d]);
        assert!(json.contains("\"line\": 2,\n\t\t\t\"column\": 3"), "{json}");
    }
}
