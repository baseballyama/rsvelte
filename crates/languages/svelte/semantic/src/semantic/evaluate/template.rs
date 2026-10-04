use super::{Evaluator, NodeIdentifier, SyntaxTree};

impl Evaluator<'_> {
    pub(super) fn cooked(&self, syntax_tree: &SyntaxTree, quasi: NodeIdentifier) -> Option<String> {
        let raw = syntax_tree.str_value(quasi, self.source_text);
        let raw = raw.replace("\r\n", "\n");
        if raw.contains('\\') {
            rsvelte_typescript::lexer::decode_string(&raw)
        } else {
            Some(raw)
        }
    }
}
