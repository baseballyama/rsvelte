use super::{NodeIdentifier, ScriptRewrite, ServerCompilationContext, Target, copy};

impl ServerCompilationContext<'_> {
    pub(super) fn expression(&mut self, e: NodeIdentifier) -> NodeIdentifier {
        let mut rw = ScriptRewrite {
            target: Target::Server,
            res: self.res,
            source_text: self.source_text,
            each: None,
        };
        copy(self.javascript, &mut self.out, &mut rw, e)
    }
}
