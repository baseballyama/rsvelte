use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{BindingPattern, Expression, Statement};
use oxc_ast_visit::VisitMut;
use oxc_span::SPAN;
use rsvelte_typescript_compile::strip::Strip;

use super::{
    CompilerNodeIdentifier, DirectiveExpression, DirectiveName, Helper, LoopExpression, NodeKind,
    Span, Template, directive, vue,
};
use crate::script::runes;

impl<'t> Template<'_, '_, 't> {
    /// `{ value }`: the cell Vue's template reads a plain declaration through.
    fn declaration_cell(&self, value: Expression<'t>) -> Expression<'t> {
        self.b.object([self.b.init("value", value)])
    }

    /// The `{let}` and `{const}` tags of a fragment as one `$$Scope`: a `v-for` whose source runs
    /// the declarations and whose parameters are the names they bind.
    pub(super) fn declarations(
        &mut self,
        nodes: &[CompilerNodeIdentifier],
        parent: Option<vue::CompilerNodeIdentifier>,
        span: Span,
    ) -> Option<vue::CompilerNodeIdentifier> {
        let b = self.b;
        let mut statements = Vec::new();
        let mut parameters = Vec::new();
        for &node in nodes {
            let NodeKind::Declaration { declaration } = self.i.compiler_syntax_tree.node(node).kind
            else {
                continue;
            };
            let declaration = self.i.component.javascript.get_declaration(declaration);
            for declarator in &declaration.declarations {
                let names = declarator.id.get_binding_identifiers();
                parameters.extend(
                    names
                        .iter()
                        .map(|name| b.parameter(b.binding_at(&name.name, name.span))),
                );
                let rune = declarator
                    .init
                    .as_ref()
                    .and_then(|init| self.i.resolution.rune(init));
                let value_rune = rune.is_some_and(|(name, _)| runes::value(name));
                if let Some(init) = &declarator.init
                    && !self.i.server
                    && crate::compilation::asynchronous::has_await(init)
                {
                    self.helpers.insert(Helper::Async);
                }
                if value_rune && !declarator.id.is_binding_identifier() {
                    statements.push(self.rune_pattern(declarator));
                    continue;
                }
                let mut value = declarator
                    .init
                    .as_ref()
                    .map_or_else(|| b.id("undefined"), |init| self.rewrite(init));
                let mut pattern = self.pattern(&declarator.id);
                if !value_rune {
                    if declarator.id.is_binding_identifier() {
                        value = self.declaration_cell(value);
                    } else {
                        let cells = names
                            .iter()
                            .map(|name| self.declaration_cell(b.id(&name.name)));
                        let body = [
                            b.declaration(declaration.kind, [b.declarator(pattern, Some(value))]),
                            b.return_(Some(b.array(cells))),
                        ];
                        value = b.call(b.arrow_block(b.parameters([]), body, false), []);
                        let elements = names.iter().map(|name| Some(b.binding(&name.name)));
                        pattern = BindingPattern::new_array_pattern(SPAN, b.vec(elements), None, b);
                    }
                }
                statements
                    .push(b.declaration(declaration.kind, [b.declarator(pattern, Some(value))]));
            }
        }
        if statements.is_empty() {
            return None;
        }
        let source = b.arrow_block(b.parameters([]), statements, false);
        let parameters = b.formal_parameters(parameters);
        let parameters = self.tree.keep_parameters(parameters.unbox());
        let source = self.keep(source);
        let property = directive(
            DirectiveName::For,
            None,
            DirectiveExpression::For(LoopExpression { parameters, source }),
            span,
        );
        let node = self.template_node("$$Scope", span, vec![property], parent);
        self.scopes.insert(node);
        Some(node)
    }

    /// `let { a, b } = $state(v)`: a cell per name, as the script lowers it.
    fn rune_pattern(&self, declarator: &oxc_ast::ast::VariableDeclarator<'_>) -> Statement<'t> {
        let b = self.b;
        let tracking = !self.i.server && self.i.plan.auxiliary.contains_key("$effect.tracking");
        let Some(Expression::CallExpression(call)) = &declarator.init else {
            unreachable!("a rune is a call")
        };
        let (rune, _) = self
            .i
            .resolution
            .rune(declarator.init.as_ref().expect("a rune initialiser"))
            .expect("a checked rune");
        let argument = call
            .arguments
            .first()
            .map(|argument| self.rewrite(argument.to_expression()));
        let value = crate::script::rune_value(b, rune, argument, tracking)
            .expect("a checked rune has a value");
        // The lowering rewrites the defaults itself.
        let mut pattern = declarator.id.clone_in_with_semantic_ids(b.allocator());
        Strip::new(b.allocator()).visit_binding_pattern(&mut pattern);
        let declarators = crate::script::patterns::declarators(
            b,
            &mut self.rewriter(),
            pattern,
            value,
            rune,
            tracking,
        );
        b.declaration(oxc_ast::ast::VariableDeclarationKind::Const, declarators)
    }
}
