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
            let default = parameter.initializer.is_some();
            self.parameter_reads(&parameter.pattern, default, &mut result.saved_reads);
        }
        for (index, parameter) in parameters.iter().enumerate() {
            if let (BindingPattern::BindingIdentifier(name), None) =
                (&parameter.pattern, &parameter.initializer)
            {
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
                    cx: self,
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

    fn parameter_reads(
        &mut self,
        pattern: &BindingPattern<'_>,
        default: bool,
        saved: &mut Vec<(SymbolId, Option<Read>)>,
    ) {
        match pattern {
            BindingPattern::BindingIdentifier(identifier) => {
                let symbol = identifier.symbol_id.get().expect("a parameter binding");
                self.scope = self.res.scoping().symbol_scope_id(symbol);
                let read = if default { Read::Get } else { Read::Call };
                saved.push((symbol, self.reads.insert(symbol, read)));
            }
            BindingPattern::ObjectPattern(object) => {
                for property in &object.properties {
                    self.parameter_reads(&property.value, default, saved);
                }
                if let Some(rest) = &object.rest {
                    self.parameter_reads(&rest.argument, default, saved);
                }
            }
            BindingPattern::ArrayPattern(array) => {
                for element in array.elements.iter().flatten() {
                    self.parameter_reads(element, default, saved);
                }
                if let Some(rest) = &array.rest {
                    self.parameter_reads(&rest.argument, default, saved);
                }
            }
            BindingPattern::AssignmentPattern(assignment) => {
                self.parameter_reads(&assignment.left, true, saved);
            }
        }
    }
}

/// A snippet keeps an array its parameter destructures in a `var` derived, read with `$.get`.
struct Hooks<'c, 'x, 'o> {
    cx: &'c mut ClientCompilationContext<'x, 'o>,
    declarations: &'c mut Vec<Statement<'o>>,
}

impl<'o> Destructure<'o, 'o> for Hooks<'_, '_, 'o> {
    fn rewrite(&mut self, e: &'o Expression<'o>) -> Expression<'o> {
        self.cx.rewrite(e, true)
    }

    fn array(&mut self, value: Expression<'o>) -> Expression<'o> {
        let b = self.cx.b;
        let name = self.cx.names.generate("$$array");
        let derived = b.runtime("derived", [b.thunk(value)]);
        (self.declarations).push(b.declare(VariableDeclarationKind::Var, &name, Some(derived)));
        b.runtime("get", [b.id(&name)])
    }
}
