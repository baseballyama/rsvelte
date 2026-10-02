use super::{
    ClientCompilationContext, ExpressionMetadata, Frag, Kind, NodeIdentifier, ScriptRewrite,
    SourceLocation, Target, copy, flag, runtime_call,
};

impl ClientCompilationContext<'_> {
    pub(super) fn expression(&mut self, e: NodeIdentifier) -> NodeIdentifier {
        let mut rw = ScriptRewrite {
            target: Target::Client,
            res: self.res,
            source_text: self.source_text,
            each: Some(&self.each),
        };
        copy(self.javascript, &mut self.out, &mut rw, e)
    }

    /// `b.thunk`: `() => e`, or `f` for `() => f()`.
    pub(super) fn thunk(&mut self, e: NodeIdentifier) -> NodeIdentifier {
        let arrow = self
            .out
            .arrow(&[], e, true, false, SourceLocation::SYNTHETIC);
        self.unthunk(arrow)
    }

    /// `b.unthunk`: `(a, b) => f(a, b)` is `f`.
    pub(super) fn unthunk(&self, arrow: NodeIdentifier) -> NodeIdentifier {
        let o = &self.out;
        let Kind::Arrow {
            parameters,
            body,
            expression_body: true,
            is_async: false,
            ..
        } = o.kind(arrow)
        else {
            return arrow;
        };
        let Kind::Call {
            callee,
            arguments,
            optional: false,
            ..
        } = o.kind(body)
        else {
            return arrow;
        };
        let same = matches!(o.kind(callee), Kind::Identifier(_))
            && parameters.len() == arguments.len()
            && parameters.iter().zip(arguments).all(|(&p, &a)| {
                matches!(o.kind(p), Kind::Identifier(_))
                    && matches!(o.kind(a), Kind::Identifier(_))
                    && o.name(p) == o.name(a)
            });
        if same { callee } else { arrow }
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
