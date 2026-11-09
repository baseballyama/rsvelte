use super::{Evaluator, NodeIdentifier, SyntaxTree};

impl Evaluator<'_> {
    pub(super) fn cooked(&self, syntax_tree: &SyntaxTree, quasi: NodeIdentifier) -> String {
        let raw = syntax_tree.str_value(quasi, self.source_text);
        rsvelte_typescript::lexer::cook_template(raw).into_owned()
    }
}
