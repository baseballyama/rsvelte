//! Language rules share execution and ordering without depending on each other.

use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::performance::measurement;

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

#[cfg(test)]
mod tests {
    use rsvelte_kernel::source::positions::Span;

    use super::*;

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

    struct WrongCode;

    impl Rule<()> for WrongCode {
        fn identifier(&self) -> &'static str {
            "expected"
        }

        fn check(&self, (): &(), out: &mut Vec<Diagnostic>) {
            out.push(Diagnostic::error("other", "message", Span::new(0, 0)));
        }
    }

    #[test]
    #[should_panic(expected = "rule expected reported under another id")]
    fn a_rule_cannot_report_another_rules_code() {
        run(&[&WrongCode], &());
    }
}
