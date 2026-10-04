use rsvelte_kernel::source::index::IndexVector;
use rsvelte_typescript::NodeIdentifier;
use rsvelte_typescript::scope::BindingIdentifier;

use crate::semantic::evaluate::{Evaluator, Tree};
use crate::semantic::input::ComponentInput;
use crate::semantic::resolve::Resolution;

pub(super) struct BindingValues<'a> {
    evaluator: Evaluator<'a>,
    bindings: usize,
    known: IndexVector<BindingIdentifier, Option<bool>>,
}

impl<'a> BindingValues<'a> {
    pub(super) const fn new(input: &ComponentInput<'a>, resolution: &'a Resolution) -> Self {
        Self {
            evaluator: Evaluator::new(input.javascript, input.source_text, resolution),
            bindings: resolution.bindings.len(),
            known: IndexVector::new(),
        }
    }

    pub(super) fn is_known(
        &mut self,
        binding: BindingIdentifier,
        expression: NodeIdentifier,
    ) -> bool {
        if self.known.is_empty() {
            self.known = IndexVector::from_element_n(None, self.bindings);
        }
        if let Some(known) = self.known[binding] {
            return known;
        }
        let known = self.evaluator.is_known(Tree::Source, expression);
        self.known[binding] = Some(known);
        known
    }
}
