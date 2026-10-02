//! Lint rules as a plugin contract.
//!
//! A language supplies a context type (its trees and analyses,
//! computed once per document) and rules over it; the kernel runs them, times each one, orders the
//! findings and renders them. A finding is a [`Diagnostic`] whose code is the rule identifier.
//!
//! A language with several layers has one context per layer, and a rule is written against the
//! layer that answers its question: an *early* rule reads the surface tree, because it needs what
//! was written (parents, token kinds, a shorthand as a shorthand); a *late* rule reads a lowered
//! layer, because it needs what the code means (an element's kind, a resolved name, a type). Both
//! kinds report into one [`Findings`].

use crate::diagnostics::diagnostic::Diagnostic;
use crate::output::structured_data::StructuredDataWriter;
use crate::performance::measurement;
use crate::source::positions::LineIndex;

pub trait Rule<C: ?Sized>: Send + Sync {
    /// The rule identifier as the upstream tool spells it (`no-unused-variables`,
    /// `svelte/button-has-type`).
    fn identifier(&self) -> &'static str;
    fn check(&self, context: &C, out: &mut Vec<Diagnostic>);
}

/// Findings of one document, collected from rules over any number of layers.
#[derive(Default, Debug)]
pub struct Findings {
    out: Vec<Diagnostic>,
}

impl Findings {
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// Runs `rules` over one layer's context, in order.
    ///
    /// # Panics
    ///
    /// If a rule reports a diagnostic under a code other than its own identifier.
    pub fn run<C: ?Sized>(&mut self, rules: &[&dyn Rule<C>], context: &C) -> &mut Self {
        for rule in rules {
            let _p = measurement::phase(rule.identifier());
            let before = self.out.len();
            rule.check(context, &mut self.out);
            assert!(
                self.out[before..]
                    .iter()
                    .all(|d| d.code == rule.identifier()),
                "rule {} reported under another id",
                rule.identifier()
            );
        }
        self
    }

    /// Sorted by start offset; ties keep report order (layers in the order they ran, then rules
    /// in order), which is how `ESLint` sorts (by line, then column, stable).
    #[must_use]
    pub fn finish(self) -> Vec<Diagnostic> {
        let mut out = self.out;
        out.sort_by_key(|d| d.span.start_offset);
        out
    }
}

/// [`Findings`] over a single layer.
pub fn run<C: ?Sized>(rules: &[&dyn Rule<C>], context: &C) -> Vec<Diagnostic> {
    let mut f = Findings::new();
    f.run(rules, context);
    f.finish()
}

/// `{rules, findings: [{rule, message, start: {line, column}, end: {line, column}}]}` with
/// `ESLint`'s positions: 1-based lines and 1-based UTF-16 columns.
///
/// `end` is `null` for a finding without one ([`Diagnostic::has_end`]).
///
/// `rules` are the rules that ran, so a comparison can tell a rule that found nothing from one
/// that was never run.
#[must_use]
pub fn render_json(lines: &LineIndex, rules: &[&str], findings: &[Diagnostic]) -> String {
    let mut w = StructuredDataWriter::new(true);
    w.begin_object().key("rules").begin_array();
    for r in rules {
        w.write_string(r);
    }
    w.end_array().key("findings").begin_array();
    for d in findings {
        w.begin_object()
            .key("rule")
            .write_string(&d.code)
            .key("message")
            .write_string(&d.message);
        for (key, at) in [("start", d.span.start_offset), ("end", d.span.end_offset)] {
            w.key(key);
            if key == "end" && !d.has_end {
                w.null();
                continue;
            }
            let lc = lines.line_column(at);
            w.begin_object()
                .key("line")
                .write_number(lc.line)
                .key("column")
                .write_number(lc.column + 1)
                .end_object();
        }
        w.end_object();
    }
    w.end_array().end_object();
    w.finish()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::source::positions::Span;

    struct Every(&'static str, u32);

    impl Rule<str> for Every {
        fn identifier(&self) -> &'static str {
            self.0
        }

        fn check(&self, context: &str, out: &mut Vec<Diagnostic>) {
            for (i, _) in context.match_indices('x') {
                let at = i as u32 + self.1;
                out.push(Diagnostic::error(self.0, "x", Span::new(at, at + 1)));
            }
        }
    }

    #[test]
    fn findings_are_ordered_by_offset_and_ties_keep_rule_order() {
        let (a, b) = (Every("a", 0), Every("b", 0));
        let got = run::<str>(&[&b, &a], "x.x");
        let codes: Vec<(&str, u32)> = got
            .iter()
            .map(|d| (&*d.code, d.span.start_offset))
            .collect();
        assert_eq!(codes, [("b", 0), ("a", 0), ("b", 2), ("a", 2)]);
    }

    struct Len;

    impl Rule<[u8]> for Len {
        fn identifier(&self) -> &'static str {
            "len"
        }

        fn check(&self, context: &[u8], out: &mut Vec<Diagnostic>) {
            out.push(Diagnostic::error(
                "len",
                "n",
                Span::new(0, context.len() as u32),
            ));
        }
    }

    #[test]
    fn layers_report_into_one_ordering() {
        let x = Every("x", 0);
        let mut f = Findings::new();
        f.run::<str>(&[&x], ".x").run::<[u8]>(&[&Len], b"ab");
        let got = f.finish();
        let codes: Vec<(&str, u32)> = got
            .iter()
            .map(|d| (&*d.code, d.span.start_offset))
            .collect();
        assert_eq!(codes, [("len", 0), ("x", 1)]);
    }

    #[test]
    fn columns_are_one_based_utf16() {
        let source_text = "é\n😀x";
        let at = source_text.find('x').unwrap() as u32;
        let d = Diagnostic::error("r", "m", Span::new(at, at + 1));
        let json = render_json(&LineIndex::new(source_text), &["r"], &[d]);
        assert!(
            json.contains("\"line\": 2,\n\t\t\t\t\"column\": 3"),
            "{json}"
        );
    }
}
