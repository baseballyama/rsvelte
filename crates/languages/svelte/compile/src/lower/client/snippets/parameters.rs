use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{
    BindingPattern, BindingProperty, BindingRestElement, Expression, FormalParameter, PropertyKey,
    Statement, VariableDeclarationKind,
};
use oxc_semantic::SymbolId;
use rsvelte_svelte_semantic::compiler_syntax_tree::Snippet;
use rsvelte_svelte_semantic::evaluate::Evaluator;

use crate::lower::builder::Runtime;
use crate::lower::client::{ClientCompilationContext, Read};
use crate::lower::javascript::is_simple_expression;

pub(super) struct Parameters<'o> {
    pub(super) arguments: Vec<FormalParameter<'o>>,
    pub(super) declarations: Vec<Statement<'o>>,
    pub(super) saved_reads: Vec<(SymbolId, Option<Read>)>,
}

struct Path<'o> {
    name: &'o str,
    value: Expression<'o>,
    default: bool,
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
            match &parameter.initializer {
                Some(fallback) => self.default_path(
                    &parameter.pattern,
                    fallback,
                    value,
                    &mut result.declarations,
                    &mut paths,
                ),
                None => self.parameter_paths(
                    &parameter.pattern,
                    value,
                    false,
                    &mut result.declarations,
                    &mut paths,
                ),
            }
            for path in paths {
                let mut value = b.thunk(path.value);
                if path.default {
                    value = b.runtime("derived_safe_equal", [value]);
                }
                result.declarations.push(b.let_(path.name, Some(value)));
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

    fn parameter_paths(
        &mut self,
        pattern: &'o BindingPattern<'o>,
        value: Expression<'o>,
        default: bool,
        inserts: &mut Vec<Statement<'o>>,
        paths: &mut Vec<Path<'o>>,
    ) {
        match pattern {
            BindingPattern::BindingIdentifier(identifier) => paths.push(Path {
                name: identifier.name.as_str(),
                value,
                default,
            }),
            BindingPattern::ObjectPattern(object) => {
                self.object_parameter(
                    &object.properties,
                    object.rest.as_deref(),
                    value,
                    default,
                    inserts,
                    paths,
                );
            }
            BindingPattern::ArrayPattern(array) => {
                let rest = array.rest.as_deref();
                self.array_parameter(&array.elements, rest, value, default, inserts, paths);
            }
            BindingPattern::AssignmentPattern(assignment) => {
                self.default_path(&assignment.left, &assignment.right, value, inserts, paths);
            }
        }
    }

    /// `pattern = fallback`, read from `value`.
    fn default_path(
        &mut self,
        pattern: &'o BindingPattern<'o>,
        fallback: &Expression<'_>,
        value: Expression<'o>,
        inserts: &mut Vec<Statement<'o>>,
        paths: &mut Vec<Path<'o>>,
    ) {
        let b = self.b;
        let value = if is_simple_expression(fallback) {
            b.runtime("fallback", [value, self.rewrite(fallback, true)])
        } else {
            // Upstream makes the thunk before it rewrites the fallback, so `() => f()` is `f`.
            let thunk = match fallback.get_inner_expression() {
                Expression::CallExpression(call)
                    if call.arguments.is_empty()
                        && !call.optional
                        && matches!(call.callee, Expression::Identifier(_)) =>
                {
                    self.rewrite(&call.callee, true)
                }
                fallback => b.arrow(b.params([]), self.rewrite(fallback, true)),
            };
            b.runtime("fallback", [value, thunk, b.boolean(true)])
        };
        self.parameter_paths(pattern, value, true, inserts, paths);
    }

    fn object_parameter(
        &mut self,
        properties: &'o [BindingProperty<'o>],
        rest: Option<&'o BindingRestElement<'o>>,
        value: Expression<'o>,
        default: bool,
        inserts: &mut Vec<Statement<'o>>,
        paths: &mut Vec<Path<'o>>,
    ) {
        let b = self.b;
        let excluded: Vec<_> = if rest.is_some() {
            properties.iter().map(|p| self.excluded_key(p)).collect()
        } else {
            Vec::new()
        };
        for property in properties {
            let object = b.parenthesized(value.clone_in(b.allocator()));
            let member = match &property.key {
                PropertyKey::StaticIdentifier(key) if !property.computed => {
                    b.member(object, &key.name)
                }
                key => {
                    let key = key.as_expression().expect("a computed or literal key");
                    b.computed(object, self.rewrite(key, true))
                }
            };
            self.parameter_paths(&property.value, member, default, inserts, paths);
        }
        if let Some(rest) = rest {
            let value = b.runtime("exclude_from_object", [value, b.array(excluded)]);
            self.parameter_paths(&rest.argument, value, default, inserts, paths);
        }
    }

    /// A key `exclude_from_object` leaves out of the rest: its name as a string.
    fn excluded_key(&self, property: &BindingProperty<'_>) -> Expression<'o> {
        let b = self.b;
        match &property.key {
            PropertyKey::StaticIdentifier(key) if !property.computed => b.string(&key.name),
            key @ (PropertyKey::StringLiteral(_) | PropertyKey::NumericLiteral(_)) => {
                let key = key.as_expression().expect("a literal key");
                let value = Evaluator::new(self.res).evaluate(key).value;
                b.string(&value.to_javascript_string())
            }
            key => {
                let key = key.as_expression().expect("a computed key");
                b.call(b.id("String"), [self.rewrite(key, true)])
            }
        }
    }

    fn array_parameter(
        &mut self,
        elements: &'o [Option<BindingPattern<'o>>],
        rest: Option<&'o BindingRestElement<'o>>,
        value: Expression<'o>,
        default: bool,
        inserts: &mut Vec<Statement<'o>>,
        paths: &mut Vec<Path<'o>>,
    ) {
        let b = self.b;
        #[expect(clippy::cast_precision_loss, reason = "a pattern has few elements")]
        let length = |n: usize| b.number(n as f64);
        let mut arguments = vec![value];
        if rest.is_none() {
            arguments.push(length(elements.len()));
        }
        let derived = b.runtime("derived", [b.thunk(b.runtime("to_array", arguments))]);
        let name = self.names.generate("$$array");
        inserts.push(b.declare(VariableDeclarationKind::Var, &name, Some(derived)));
        for (index, element) in elements.iter().enumerate() {
            let Some(element) = element else {
                continue;
            };
            let array = b.runtime("get", [b.id(&name)]);
            self.parameter_paths(
                element,
                b.computed(array, length(index)),
                default,
                inserts,
                paths,
            );
        }
        if let Some(rest) = rest {
            let array = b.runtime("get", [b.id(&name)]);
            let value = b.call(b.member(array, "slice"), [length(elements.len())]);
            self.parameter_paths(&rest.argument, value, default, inserts, paths);
        }
    }
}
