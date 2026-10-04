use super::{NodeIdentifier, ScriptRewrite, ServerCompilationContext, Target, copy};

impl ServerCompilationContext<'_> {
    pub(super) fn expression(&mut self, e: NodeIdentifier) -> NodeIdentifier {
        let mut rw = ScriptRewrite {
            target: Target::Server,
            accessors: false,
            rest_reads: None,
            res: self.res,
            source_text: self.source_text,
            template: None,
        };
        copy(self.javascript, &mut self.out, &mut rw, e)
    }
}
