use oxc_ast::ast::{
    BindingPattern, Expression, FormalParameter, Statement, VariableDeclarationKind,
};
use oxc_semantic::SymbolId;
use rsvelte_svelte_semantic::compiler_syntax_tree::Snippet;

use crate::lower::builder::Runtime;
use crate::lower::client::{ClientCompilationContext, Read};
use crate::lower::paths::{Destructure, Paths};

pub(super) struct Parameters<'o> {
    pub(super) arguments: Vec<FormalParameter<'o>>,
    pub(super) declarations: Vec<Statement<'o>>,
    pub(super) saved_reads: Vec<(SymbolId, Option<Read>)>,
}

impl<'o> ClientCompilationContext<'_, 'o> {
    pub(super) fn snippet_parameters(&mut self, snippet: &Snippet) -> Parameters<'o> {
        let b = self.b;
        let parameters: &'o [FormalParameter<'o>] = snippet
            .parameters
            .map_or(&[], |p| self.javascript.get_parameters(p).items.as_slice());
        let mut arguments = Vec::with_capacity(parameters.len() + 1);
        arguments.push(b.parameter(b.binding("$$anchor")));
        let mut result = Parameters {
            arguments,
            declarations: Vec::new(),
            saved_reads: Vec::with_capacity(parameters.len()),
        };
        for parameter in parameters {
            self.parameter_reads(&parameter.pattern, &mut result.saved_reads);
        }
        for (index, parameter) in parameters.iter().enumerate() {
            if let (BindingPattern::BindingIdentifier(name), None) =
                (&parameter.pattern, &parameter.initializer)
            {
                self.reads.insert(name.symbol_id(), Read::Call);
                let noop = b.member(b.id("$"), "noop");
                result.arguments.push(b.default_parameter(&name.name, noop));
                continue;
            }
            let alias = format!("$$arg{index}");
            let value = b.optional_call(b.id(&alias), []);
            result.arguments.push(b.parameter(b.binding(&alias)));
            let mut paths = Vec::new();
            let mut walker = Paths {
                b,
                res: self.res,
                hooks: Hooks {
                    context: self,
                    declarations: &mut result.declarations,
                },
            };
            match &parameter.initializer {
                Some(fallback) => {
                    let value = walker.fallback(fallback, value);
                    walker.extract(&parameter.pattern, value, true, &mut paths);
                }
                None => walker.extract(&parameter.pattern, value, false, &mut paths),
            }
            for path in paths {
                let mut value = b.thunk(path.value);
                if path.default {
                    value = b.runtime("derived_safe_equal", [value]);
                }
                result
                    .declarations
                    .push(b.let_(&path.binding.name, Some(value)));
            }
        }
        result
    }

    /// Reads every name a parameter binds as it is, until its path is read.
    fn parameter_reads(
        &mut self,
        pattern: &BindingPattern<'_>,
        saved: &mut Vec<(SymbolId, Option<Read>)>,
    ) {
        crate::lower::paths::bound_names(pattern, false, &mut |binding, _| {
            let symbol = binding.symbol_id();
            self.scope = self.res.scoping().symbol_scope_id(symbol);
            saved.push((symbol, self.reads.insert(symbol, Read::Plain)));
        });
    }
}

/// A snippet or an `{#each}` keeps an array its pattern destructures in a `var` derived, read
/// with `$.get`.
pub(in crate::lower::client) struct Hooks<'c, 'x, 'o> {
    pub(in crate::lower::client) context: &'c mut ClientCompilationContext<'x, 'o>,
    pub(in crate::lower::client) declarations: &'c mut Vec<Statement<'o>>,
}

impl<'o> Destructure<'o, 'o> for Hooks<'_, '_, 'o> {
    fn rewrite(&mut self, e: &'o Expression<'o>) -> Expression<'o> {
        self.context.rewrite(e, true)
    }

    fn bound(&mut self, binding: &'o oxc_ast::ast::BindingIdentifier<'o>, default: bool) {
        let read = if default { Read::Get } else { Read::Call };
        self.context.reads.insert(binding.symbol_id(), read);
    }

    fn array(&mut self, value: Expression<'o>) -> Expression<'o> {
        let b = self.context.b;
        let name = self.context.names.generate("$$array");
        let derived = b.runtime("derived", [b.thunk(value)]);
        (self.declarations).push(b.declare(VariableDeclarationKind::Var, &name, Some(derived)));
        b.runtime("get", [b.id(&name)])
    }
}
