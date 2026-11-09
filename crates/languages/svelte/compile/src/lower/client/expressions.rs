use super::{
    ClientCompilationContext, ExpressionMetadata, Frag, NodeIdentifier, ScriptRewrite,
    SourceLocation, Target, copy, flag, runtime_call, unthunk,
};

impl ClientCompilationContext<'_> {
    pub(super) fn expression(&mut self, e: NodeIdentifier) -> NodeIdentifier {
        self.expression_with_rest_reads(e, true)
    }

    pub(super) fn expression_with_rest_reads(
        &mut self,
        e: NodeIdentifier,
        rest_reads: bool,
    ) -> NodeIdentifier {
        let mut rw = ScriptRewrite {
            target: Target::Client,
            accessors: self.custom_element.is_some(),
            rest_reads: rest_reads.then_some(self.rest_reads),
            res: self.res,
            source_text: self.source_text,
            template: Some(&self.reads),
        };
        copy(self.javascript, &mut self.out, &mut rw, e)
    }

    /// `b.thunk`: `() => e`, or `f` for `() => f()`.
    pub(super) fn thunk(&mut self, e: NodeIdentifier) -> NodeIdentifier {
        let arrow = self
            .out
            .arrow(&[], e, true, false, SourceLocation::SYNTHETIC);
        unthunk(&self.out, arrow)
    }

    /// `b.call` drops trailing missing arguments and turns inner ones into `void 0`.
    pub(super) fn call(
        &mut self,
        method: &str,
        arguments: Vec<Option<NodeIdentifier>>,
    ) -> NodeIdentifier {
        runtime_call(&mut self.out, method, arguments)
    }

    pub(super) fn statement(&mut self, e: NodeIdentifier) -> NodeIdentifier {
        self.out.expression_statement(e)
    }

    pub(super) fn var(&mut self, name: &str, initializer: NodeIdentifier) -> NodeIdentifier {
        let identifier = self.out.identifier(name);
        self.out.let_(flag::VAR, identifier, Some(initializer))
    }

    pub(super) fn write_number(&mut self, v: u32) -> NodeIdentifier {
        self.out
            .write_number(f64::from(v), SourceLocation::SYNTHETIC)
    }

    pub(super) fn tru(&mut self) -> NodeIdentifier {
        self.out.write_boolean(true, SourceLocation::SYNTHETIC)
    }

    pub(super) fn memoize(
        &mut self,
        frag: &mut Frag,
        value: NodeIdentifier,
        meta: ExpressionMetadata,
    ) -> NodeIdentifier {
        if !meta.has_call {
            return value;
        }
        let identifier = self.out.identifier(&format!("${}", frag.memo.len()));
        frag.memo.push(value);
        identifier
    }
}
