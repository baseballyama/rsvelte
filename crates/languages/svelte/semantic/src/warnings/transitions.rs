//! Upstream's `transition_duplicate` and `transition_conflict`, which both the compiler's
//! validation and this crate's error walk raise.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;

use super::error;

#[cfg(test)]
mod tests;

/// The directions an element's earlier transition directives run in, by their kind: one intro and
/// one outro per element, whatever their modifiers.
#[derive(Clone, Copy, Debug, Default)]
pub struct TransitionDirections {
    intro: Option<&'static str>,
    outro: Option<&'static str>,
}

impl TransitionDirections {
    /// Records the next `transition:` (both), `in:` or `out:` directive of the element, and returns
    /// the error when an earlier one already runs in one of its directions.
    pub fn visit(&mut self, intro: bool, outro: bool, span: Span) -> Option<Diagnostic> {
        let kind = match (intro, outro) {
            (true, true) => "transition",
            (true, false) => "in",
            _ => "out",
        };
        let existing = self
            .intro
            .filter(|_| intro)
            .or_else(|| self.outro.filter(|_| outro));
        if intro {
            self.intro = Some(kind);
        }
        if outro {
            self.outro = Some(kind);
        }
        existing.map(|existing| {
            if existing == kind {
                let message =
                    format!("Cannot use multiple `{kind}:` directives on a single element");
                error("transition_duplicate", &message, span)
            } else {
                let message =
                    format!("Cannot use `{existing}:` alongside existing `{kind}:` directive");
                error("transition_conflict", &message, span)
            }
        })
    }
}
