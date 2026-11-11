use oxc_allocator::{Box as ArenaBox, CloneIn, GetAllocator};
use oxc_ast::ast::{BinaryOperator, BindingPattern, Expression, FormalParameters};
use oxc_semantic::SymbolId;
use oxc_span::SPAN;

use super::{Body, Emitter};

impl<'o> Emitter<'_, 'o> {
    /// `name = { value: undefined }`: a snippet's argument a render leaves out.
    fn optional(&self, name: &str) -> oxc_ast::ast::FormalParameter<'o> {
        let b = self.b;
        b.default_parameter(name, b.object([b.init("value", b.id("undefined"))]))
    }

    /// The parameters of a render function whose arguments are cells: a name stays one, a
    /// pattern becomes a cell per name it binds. Returns the names it made cells.
    pub(super) fn scope_parameters(
        &mut self,
        parameters: &FormalParameters<'_>,
        body: &mut Body<'o>,
        optional: bool,
    ) -> (ArenaBox<'o, FormalParameters<'o>>, Vec<SymbolId>) {
        let b = self.b;
        let mut output = Vec::with_capacity(parameters.items.len());
        let mut added = Vec::new();
        for parameter in &parameters.items {
            let names = parameter.pattern.get_binding_identifiers();
            if let BindingPattern::BindingIdentifier(id) = &parameter.pattern
                && parameter.initializer.is_none()
            {
                output.push(if optional {
                    self.optional(&id.name)
                } else {
                    b.parameter(b.binding_at(&id.name, id.span))
                });
            } else {
                let argument = self.name();
                output.push(if optional {
                    self.optional(&argument)
                } else {
                    b.parameter(b.binding(&argument))
                });
                let mut value = b.member(b.id(&argument), "value");
                if let Some(default) = &parameter.initializer {
                    let test = b.binary(
                        b.member(b.id(&argument), "value"),
                        BinaryOperator::StrictEquality,
                        b.id("undefined"),
                    );
                    let default = self.expression(default);
                    value = Expression::new_conditional_expression(SPAN, test, default, value, b);
                }
                let pattern = self.copy_pattern(&parameter.pattern);
                let values = names.iter().map(|name| b.id(&name.name));
                let getter = b.arrow_block(
                    b.parameters([]),
                    [
                        b.declaration(
                            oxc_ast::ast::VariableDeclarationKind::Const,
                            [b.declarator(pattern, Some(value))],
                        ),
                        b.return_(Some(b.array(values))),
                    ],
                    false,
                );
                let getter = self.tracked_callback(getter);
                let computed = self.call("computed", [getter]);
                let selected = self.declare(computed, body);
                for (index, name) in names.iter().enumerate() {
                    let index = f64::from(u32::try_from(index).expect("fewer than u32::MAX names"));
                    let value = b.computed(b.member(b.id(&selected), "value"), b.number(index));
                    let value = self.call("computed", [self.arrow(value)]);
                    body.push(b.const_(&name.name, value));
                }
            }
            added.extend(
                names
                    .iter()
                    .filter_map(|name| name.symbol_id.get())
                    .filter(|&symbol| self.cells.insert(symbol)),
            );
        }
        (b.formal_parameters(output), added)
    }

    /// A pattern copied with its defaults' names rewritten.
    pub(super) fn copy_pattern(&mut self, pattern: &BindingPattern<'_>) -> BindingPattern<'o> {
        let mut value = pattern.clone_in_with_semantic_ids(self.b.allocator());
        self.rewrite_pattern(&mut value);
        value
    }
}
