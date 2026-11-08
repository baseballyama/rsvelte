//! Running rules over a document and putting their findings in `ESLint`'s order.

use rsvelte_kernel::performance::measurement;

use crate::finding::Finding;
use crate::rule::{Reporter, Rule};

/// Findings of one document, collected from rules over any number of layers.
#[derive(Default, Debug)]
pub struct Findings {
    out: Vec<Finding>,
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
    pub fn finish(self) -> Vec<Finding> {
        let mut out = self.out;
        out.sort_by_key(|f| f.diagnostic.span.start_offset);
        out
    }
}

#[cfg(test)]
mod tests;
