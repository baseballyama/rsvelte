//! The `await` acorn rejects in a class static block, which oxc's parser leaves to its checker.

use oxc_ast::AstKind;
use oxc_ast_visit::Visit;
use oxc_span::GetSpan;

use super::locator::governed;
use super::word::Home;

/// The first `await` a walk meets in a class static block, where acorn rejects it.
pub(crate) struct StaticBlockAwaits {
    /// The homes around the node entered last, from the outermost static block in.
    around: Vec<(oxc_span::Span, Home)>,
    pub(crate) first: Option<u32>,
}

impl StaticBlockAwaits {
    pub(crate) const fn new() -> Self {
        Self {
            around: Vec::new(),
            first: None,
        }
    }

    /// For a walk of the nodes in `span` on their own, which acorn reads in `home`.
    pub(super) fn within(span: oxc_span::Span, home: Home) -> Self {
        Self {
            around: vec![(span, home)],
            first: None,
        }
    }

    /// Takes in `kind`, which the walk enters in the order of the source: where acorn rejects it,
    /// if it is an `await` acorn reads in a static block.
    pub(crate) fn enter(&mut self, kind: AstKind<'_>) -> Option<u32> {
        let span = kind.span();
        while (self.around.last()).is_some_and(|(governs, _)| governs.end <= span.start) {
            self.around.pop();
        }
        let outside = self.around.is_empty();
        let governs =
            governed(kind).filter(|(_, home)| !outside || matches!(home, Home::StaticBlock));
        self.around.extend(governs);
        if !matches!(kind, AstKind::AwaitExpression(_)) {
            return None;
        }
        let (_, home) =
            (self.around.iter().rev()).find(|(governs, _)| governs.contains_inclusive(span))?;
        matches!(home, Home::StaticBlock).then_some(span.start)
    }
}

impl<'a> Visit<'a> for StaticBlockAwaits {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        let rejected = self.enter(kind);
        self.first = self.first.or(rejected);
    }
}
