use oxc_ast::ast::IdentifierReference;
use oxc_semantic::SymbolId;

use crate::evaluate::Evaluator;
use crate::resolve::Resolution;

/// Per symbol, whether its value is known: an identifier's evaluation depends on its symbol only.
pub(super) struct BindingValues<'r> {
    evaluator: Evaluator<'r>,
    symbols: usize,
    known: Vec<Option<bool>>,
}

impl<'r> BindingValues<'r> {
    pub(super) fn new(resolution: &'r Resolution) -> Self {
        Self {
            evaluator: Evaluator::new(resolution),
            symbols: resolution.scoping().symbols_len(),
            known: Vec::new(),
        }
    }

    pub(super) fn is_known(
        &mut self,
        symbol: SymbolId,
        identifier: &IdentifierReference<'_>,
    ) -> bool {
        if self.known.is_empty() {
            self.known = vec![None; self.symbols];
        }
        if let Some(known) = self.known[symbol.index()] {
            return known;
        }
        let known = self.evaluator.is_known_identifier(identifier);
        self.known[symbol.index()] = Some(known);
        known
    }
}
