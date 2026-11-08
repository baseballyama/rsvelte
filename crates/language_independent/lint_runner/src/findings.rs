//! Running rules over a document and putting their findings in `ESLint`'s order.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::performance::measurement;

use crate::rule::{Reporter, Rule};

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
    pub fn run<'r, C, R>(
        &mut self,
        rules: impl IntoIterator<Item = &'r R>,
        context: &C,
    ) -> &mut Self
    where
        C: ?Sized,
        R: Rule<C> + ?Sized + 'r,
    {
        for rule in rules {
            let _phase = measurement::phase(rule.identifier());
            rule.check(context, &mut Reporter::new(rule, &mut self.out));
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

#[cfg(test)]
mod tests {
    use rsvelte_kernel::diagnostics::Severity;
    use rsvelte_kernel::source::positions::Span;

    use super::*;

    struct Every(&'static str, u32);

    impl Rule<str> for Every {
        fn identifier(&self) -> &'static str {
            self.0
        }

        fn check(&self, context: &str, reporter: &mut Reporter<'_>) {
            for (i, _) in context.match_indices('x') {
                let at = i as u32 + self.1;
                reporter.range("x", Span::new(at, at + 1));
            }
        }
    }

    fn codes(findings: &[Diagnostic]) -> Vec<(&str, u32)> {
        findings
            .iter()
            .map(|d| (&*d.code, d.span.start_offset))
            .collect()
    }

    #[test]
    fn findings_are_ordered_by_offset_and_ties_keep_rule_order() {
        let (a, b) = (Every("a", 0), Every("b", 0));
        let mut f = Findings::new();
        let rules: [&dyn Rule<str>; 2] = [&b, &a];
        f.run(rules, "x.x");
        let got = f.finish();
        assert_eq!(codes(&got), [("b", 0), ("a", 0), ("b", 2), ("a", 2)]);
    }

    struct Len;

    impl Rule<[u8]> for Len {
        fn identifier(&self) -> &'static str {
            "len"
        }

        fn severity(&self) -> Severity {
            Severity::Warning
        }

        fn check(&self, context: &[u8], reporter: &mut Reporter<'_>) {
            reporter.range("n", Span::new(0, context.len() as u32));
        }
    }

    #[test]
    fn layers_report_into_one_ordering() {
        let x = Every("x", 0);
        let mut f = Findings::new();
        f.run([&x], ".x").run([&Len], b"ab".as_slice());
        let got = f.finish();
        assert_eq!(codes(&got), [("len", 0), ("x", 1)]);
    }

    #[test]
    fn findings_carry_the_rule_identifier_and_severity() {
        let mut f = Findings::new();
        f.run([&Len], b"ab".as_slice()).run([&Every("x", 0)], "x");
        let got = f.finish();
        let stamped: Vec<_> = got.iter().map(|d| (&*d.code, d.severity)).collect();
        assert_eq!(
            stamped,
            [("len", Severity::Warning), ("x", Severity::Error)]
        );
    }
}
