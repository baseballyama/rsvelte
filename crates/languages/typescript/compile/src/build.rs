//! Short constructors for the output tree, in the output's own arena. Every node they build is
//! synthetic: its span is empty, so the source map leaves it out.

use oxc_allocator::{Allocator, ArenaBox, ArenaVec, GetAllocator};
use oxc_ast::ast;
use oxc_ast::ast::{
    Argument, ArrayExpressionElement, AssignmentOperator, AssignmentTarget, BinaryOperator,
    BindingIdentifier, BindingPattern, Expression, FormalParameters, IdentifierName,
    ImportDeclarationSpecifier, ImportOrExportKind, LogicalOperator, ModuleExportName,
    ObjectPropertyKind, PropertyKey, PropertyKind, SimpleAssignmentTarget, Statement,
    StringLiteral, TemplateElement, TemplateElementValue, UnaryOperator, VariableDeclarationKind,
    VariableDeclarator,
};
use oxc_ast::builder::{AstBuilder, GetAstBuilder};
use oxc_span::{SPAN, Span};
use rsvelte_typescript_tree::is_valid_identifier;

mod functions;

/// A thin layer over [`AstBuilder`] for the nodes compilers write most.
pub struct Builder<'o> {
    nodes: AstBuilder<'o>,
}

impl std::fmt::Debug for Builder<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Builder").finish_non_exhaustive()
    }
}

impl<'o> GetAstBuilder<'o> for Builder<'o> {
    type Builder = AstBuilder<'o>;

    fn builder(&self) -> &AstBuilder<'o> {
        &self.nodes
    }
}

impl<'o> GetAllocator<'o> for Builder<'o> {
    fn allocator(&self) -> &'o Allocator {
        self.nodes.allocator()
    }
}

impl<'o> Builder<'o> {
    #[must_use]
    pub fn new(allocator: &'o Allocator) -> Self {
        Self {
            nodes: AstBuilder::new(allocator),
        }
    }

    #[must_use]
    pub fn str(&self, s: &str) -> &'o str {
        self.allocator().alloc_str(s)
    }

    pub fn vec<T>(&self, items: impl IntoIterator<Item = T>) -> ArenaVec<'o, T> {
        ArenaVec::from_iter_in(items, self)
    }

    pub fn alloc<T>(&self, value: T) -> ArenaBox<'o, T> {
        ArenaBox::new_in(value, self)
    }

    #[must_use]
    pub fn id(&self, name: &str) -> Expression<'o> {
        Expression::new_identifier(SPAN, self.str(name), self)
    }

    /// An identifier read at `span`, which the source map points back to.
    #[must_use]
    pub fn id_at(&self, name: &str, span: Span) -> Expression<'o> {
        Expression::new_identifier(span, self.str(name), self)
    }

    #[must_use]
    pub fn string(&self, value: &str) -> Expression<'o> {
        Expression::new_string_literal(SPAN, self.str(value), None, self)
    }

    #[must_use]
    pub fn number(&self, value: f64) -> Expression<'o> {
        Expression::new_numeric_literal(SPAN, value, None, self)
    }

    #[must_use]
    pub fn boolean(&self, value: bool) -> Expression<'o> {
        Expression::new_boolean_literal(SPAN, value, self)
    }

    #[must_use]
    pub fn null(&self) -> Expression<'o> {
        Expression::new_null_literal(SPAN, self)
    }

    /// `void 0`, upstream's `undefined`.
    #[must_use]
    pub fn void0(&self) -> Expression<'o> {
        self.unary(UnaryOperator::Void, self.number(0.0))
    }

    #[must_use]
    pub fn this(&self) -> Expression<'o> {
        Expression::new_this_expression(SPAN, self)
    }

    #[must_use]
    pub fn member(&self, object: Expression<'o>, property: &str) -> Expression<'o> {
        let property = IdentifierName::new(SPAN, self.str(property), self);
        Expression::new_static_member_expression(SPAN, object, property, false, self)
    }

    #[must_use]
    pub fn computed(&self, object: Expression<'o>, property: Expression<'o>) -> Expression<'o> {
        Expression::new_computed_member_expression(SPAN, object, property, false, self)
    }

    /// `object.name`, or `object["name"]` when `name` is no identifier.
    #[must_use]
    pub fn member_key(&self, object: Expression<'o>, name: &str) -> Expression<'o> {
        if is_valid_identifier(name) {
            self.member(object, name)
        } else {
            self.computed(object, self.string(name))
        }
    }

    pub fn call(
        &self,
        callee: Expression<'o>,
        arguments: impl IntoIterator<Item = Expression<'o>>,
    ) -> Expression<'o> {
        let arguments = self.vec(arguments.into_iter().map(Argument::from));
        Expression::new_call_expression(SPAN, callee, None, arguments, false, self)
    }

    /// `b.call`: trailing missing arguments are dropped, inner ones are `void 0`.
    #[must_use]
    pub fn call_some(
        &self,
        callee: Expression<'o>,
        mut arguments: Vec<Option<Expression<'o>>>,
    ) -> Expression<'o> {
        while matches!(arguments.last(), Some(None)) {
            arguments.pop();
        }
        self.call(
            callee,
            arguments
                .into_iter()
                .map(|a| a.unwrap_or_else(|| self.void0())),
        )
    }

    pub fn new_(
        &self,
        callee: Expression<'o>,
        arguments: impl IntoIterator<Item = Expression<'o>>,
    ) -> Expression<'o> {
        let arguments = self.vec(arguments.into_iter().map(Argument::from));
        Expression::new_new_expression(SPAN, callee, None, arguments, self)
    }

    pub fn array(&self, elements: impl IntoIterator<Item = Expression<'o>>) -> Expression<'o> {
        let elements = self.vec(elements.into_iter().map(ArrayExpressionElement::from));
        Expression::new_array_expression(SPAN, elements, self)
    }

    pub fn object(
        &self,
        properties: impl IntoIterator<Item = ObjectPropertyKind<'o>>,
    ) -> Expression<'o> {
        Expression::new_object_expression(SPAN, self.vec(properties), self)
    }

    /// `b.key`: an identifier key when `name` is one, a string key otherwise.
    #[must_use]
    pub fn key(&self, name: &str) -> PropertyKey<'o> {
        self.key_by(name, is_valid_identifier)
    }

    /// `name` as a property key, bare where `is_bare` accepts it and quoted otherwise.
    #[must_use]
    pub fn key_by(&self, name: &str, is_bare: fn(&str) -> bool) -> PropertyKey<'o> {
        if is_bare(name) {
            PropertyKey::new_static_identifier(SPAN, self.str(name), self)
        } else {
            PropertyKey::new_static_string_literal(SPAN, self.str(name), None, self)
        }
    }

    /// What `object[key]` reads for `key`: a name or a literal as that literal, a computed key's
    /// own expression.
    #[must_use]
    pub fn key_expression(&self, key: PropertyKey<'o>) -> Expression<'o> {
        match key {
            PropertyKey::StaticIdentifier(name) => self.string(&name.name),
            PropertyKey::StaticStringLiteral(literal) => Expression::StringLiteral(literal),
            PropertyKey::StaticNumericLiteral(literal) => Expression::NumericLiteral(literal),
            PropertyKey::StaticBigIntLiteral(literal) => Expression::BigIntLiteral(literal),
            key => key.into_expression(),
        }
    }

    #[must_use]
    pub fn property(&self, key: PropertyKey<'o>, value: Expression<'o>) -> ObjectPropertyKind<'o> {
        ObjectPropertyKind::new_object_property(
            SPAN,
            PropertyKind::Init,
            key,
            value,
            false,
            false,
            self,
        )
    }

    /// `b.init(name, value)`: `{ name }` when the value is that identifier.
    #[must_use]
    pub fn init(&self, name: &str, value: Expression<'o>) -> ObjectPropertyKind<'o> {
        let shorthand = matches!(&value, Expression::Identifier(v) if v.name == name)
            && is_valid_identifier(name);
        ObjectPropertyKind::new_object_property(
            SPAN,
            PropertyKind::Init,
            self.key(name),
            value,
            false,
            shorthand,
            self,
        )
    }

    #[must_use]
    pub fn spread_property(&self, argument: Expression<'o>) -> ObjectPropertyKind<'o> {
        ObjectPropertyKind::new_spread_property(SPAN, argument, self)
    }

    /// `get name() { … }` or `set name(…) { … }`, as `kind` says.
    pub fn accessor(
        &self,
        kind: PropertyKind,
        name: &str,
        parameters: ArenaBox<'o, FormalParameters<'o>>,
        body: impl IntoIterator<Item = Statement<'o>>,
    ) -> ObjectPropertyKind<'o> {
        let function = self.function_expression(None, parameters, body, false);
        ObjectPropertyKind::new_object_property(
            SPAN,
            kind,
            self.key(name),
            function,
            false,
            false,
            self,
        )
    }

    /// `get name() { return value; }`
    #[must_use]
    pub fn getter(&self, name: &str, value: Expression<'o>) -> ObjectPropertyKind<'o> {
        self.accessor(
            PropertyKind::Get,
            name,
            self.parameters([]),
            [self.return_(Some(value))],
        )
    }

    /// `name(…) { … }`, from a function expression.
    #[must_use]
    pub fn method(&self, name: &str, function: Expression<'o>) -> ObjectPropertyKind<'o> {
        ObjectPropertyKind::new_object_property(
            SPAN,
            PropertyKind::Init,
            self.key(name),
            function,
            true,
            false,
            self,
        )
    }

    #[must_use]
    pub fn unary(&self, operator: UnaryOperator, argument: Expression<'o>) -> Expression<'o> {
        Expression::new_unary_expression(SPAN, operator, argument, self)
    }

    #[must_use]
    pub fn binary(
        &self,
        left: Expression<'o>,
        operator: BinaryOperator,
        right: Expression<'o>,
    ) -> Expression<'o> {
        Expression::new_binary_expression(SPAN, left, operator, right, self)
    }

    #[must_use]
    pub fn logical(
        &self,
        left: Expression<'o>,
        operator: LogicalOperator,
        right: Expression<'o>,
    ) -> Expression<'o> {
        Expression::new_logical_expression(SPAN, left, operator, right, self)
    }

    #[must_use]
    pub fn conditional(
        &self,
        test: Expression<'o>,
        consequent: Expression<'o>,
        alternate: Expression<'o>,
    ) -> Expression<'o> {
        Expression::new_conditional_expression(SPAN, test, consequent, alternate, self)
    }

    pub fn sequence(
        &self,
        expressions: impl IntoIterator<Item = Expression<'o>>,
    ) -> Expression<'o> {
        Expression::new_sequence_expression(SPAN, self.vec(expressions), self)
    }

    #[must_use]
    pub fn assign(
        &self,
        operator: AssignmentOperator,
        target: AssignmentTarget<'o>,
        value: Expression<'o>,
    ) -> Expression<'o> {
        Expression::new_assignment_expression(SPAN, operator, target, value, self)
    }

    /// `name = value`.
    #[must_use]
    pub fn assign_name(&self, name: &str, value: Expression<'o>) -> Expression<'o> {
        self.assign_name_at(name, SPAN, value)
    }

    /// `name = value`, with `name` read at `span` as [`Self::id_at`] reads it.
    #[must_use]
    pub fn assign_name_at(&self, name: &str, span: Span, value: Expression<'o>) -> Expression<'o> {
        let target =
            SimpleAssignmentTarget::new_assignment_target_identifier(span, self.str(name), self);
        self.assign(AssignmentOperator::Assign, target.into(), value)
    }

    /// `object.property = value` for a member `target`.
    #[must_use]
    pub fn assign_member(&self, target: Expression<'o>, value: Expression<'o>) -> Expression<'o> {
        let target = SimpleAssignmentTarget::from(target.into_member_expression());
        self.assign(AssignmentOperator::Assign, target.into(), value)
    }

    /// A template literal of cooked `quasis` with `expressions` between them.
    pub fn template<'q>(
        &self,
        quasis: impl IntoIterator<Item = &'q str>,
        expressions: impl IntoIterator<Item = Expression<'o>>,
    ) -> Expression<'o> {
        let mut quasis: Vec<TemplateElement<'o>> = quasis
            .into_iter()
            .map(|q| {
                let raw = self.str(&sanitize_template_string(q));
                let value = TemplateElementValue {
                    raw: raw.into(),
                    cooked: Some(self.str(q).into()),
                };
                TemplateElement::new(SPAN, value, false, self)
            })
            .collect();
        if let Some(last) = quasis.last_mut() {
            last.tail = true;
        }
        Expression::new_template_literal(SPAN, self.vec(quasis), self.vec(expressions), self)
    }

    /// `expression;`. A string is put in parentheses, as esrap prints a statement that is not a
    /// directive, so that it does not read as one.
    #[must_use]
    pub fn statement(&self, expression: Expression<'o>) -> Statement<'o> {
        let expression = match expression {
            Expression::StringLiteral(_) => {
                Expression::new_parenthesized_expression(SPAN, expression, self)
            }
            expression => expression,
        };
        Statement::new_expression_statement(SPAN, expression, self)
    }

    /// The directive `'raw';`, `raw` being its text between the quotes.
    #[must_use]
    pub fn directive(&self, span: Span, raw: &str) -> ast::Directive<'o> {
        let raw = self.str(raw);
        ast::Directive::new(span, StringLiteral::new(span, raw, None, self), raw, self)
    }

    pub fn block(&self, body: impl IntoIterator<Item = Statement<'o>>) -> Statement<'o> {
        Statement::new_block_statement(SPAN, self.vec(body), self)
    }

    #[must_use]
    pub fn return_(&self, argument: Option<Expression<'o>>) -> Statement<'o> {
        Statement::new_return_statement(SPAN, argument, self)
    }

    /// `export default value`.
    #[must_use]
    pub fn export_default(&self, value: Expression<'o>) -> Statement<'o> {
        Statement::new_export_default_declaration(SPAN, value.into(), self)
    }

    /// `import { imported as local, … } from "source"`.
    pub fn import<'n>(
        &self,
        specifiers: impl IntoIterator<Item = (&'n str, &'n str)>,
        source: &str,
    ) -> Statement<'o> {
        let specifiers = specifiers.into_iter().map(|(imported, local)| {
            ImportDeclarationSpecifier::new_import_specifier(
                SPAN,
                ModuleExportName::new_identifier_name(SPAN, self.str(imported), self),
                BindingIdentifier::new(SPAN, self.str(local), self),
                ImportOrExportKind::Value,
                self,
            )
        });
        Statement::new_import_declaration(
            SPAN,
            Some(self.vec(specifiers)),
            StringLiteral::new(SPAN, self.str(source), None, self),
            None,
            None,
            ImportOrExportKind::Value,
            self,
        )
    }

    #[must_use]
    pub fn if_(
        &self,
        test: Expression<'o>,
        consequent: Statement<'o>,
        alternate: Option<Statement<'o>>,
    ) -> Statement<'o> {
        Statement::new_if_statement(SPAN, test, consequent, alternate, self)
    }

    #[must_use]
    pub fn declarator(
        &self,
        pattern: BindingPattern<'o>,
        init: Option<Expression<'o>>,
    ) -> VariableDeclarator<'o> {
        VariableDeclarator::new(SPAN, pattern, None, init, false, self)
    }

    pub fn declaration(
        &self,
        kind: VariableDeclarationKind,
        declarators: impl IntoIterator<Item = VariableDeclarator<'o>>,
    ) -> Statement<'o> {
        Statement::new_variable_declaration(SPAN, kind, self.vec(declarators), false, self)
    }

    /// `kind name = init;`
    #[must_use]
    pub fn declare(
        &self,
        kind: VariableDeclarationKind,
        name: &str,
        init: Option<Expression<'o>>,
    ) -> Statement<'o> {
        self.declaration(kind, [self.declarator(self.binding(name), init)])
    }

    #[must_use]
    pub fn var(&self, name: &str, init: Expression<'o>) -> Statement<'o> {
        self.declare(VariableDeclarationKind::Var, name, Some(init))
    }

    #[must_use]
    pub fn let_(&self, name: &str, init: Option<Expression<'o>>) -> Statement<'o> {
        self.declare(VariableDeclarationKind::Let, name, init)
    }

    #[must_use]
    pub fn const_(&self, name: &str, init: Expression<'o>) -> Statement<'o> {
        self.declare(VariableDeclarationKind::Const, name, Some(init))
    }

    /// `callee?.(arguments)`.
    pub fn optional_call(
        &self,
        callee: Expression<'o>,
        arguments: impl IntoIterator<Item = Expression<'o>>,
    ) -> Expression<'o> {
        let arguments = self.vec(arguments.into_iter().map(Argument::from));
        let call = ast::CallExpression::boxed(SPAN, callee, None, arguments, true, self);
        Expression::new_chain_expression(SPAN, ast::ChainElement::CallExpression(call), self)
    }

    /// `object?.method(arguments)`.
    pub fn optional_method_call(
        &self,
        object: Expression<'o>,
        method: &str,
        arguments: impl IntoIterator<Item = Expression<'o>>,
    ) -> Expression<'o> {
        let property = IdentifierName::new(SPAN, self.str(method), self);
        let callee = Expression::new_static_member_expression(SPAN, object, property, true, self);
        let arguments = self.vec(arguments.into_iter().map(Argument::from));
        let call = ast::CallExpression::boxed(SPAN, callee, None, arguments, false, self);
        Expression::new_chain_expression(SPAN, ast::ChainElement::CallExpression(call), self)
    }

    /// `(e)`, kept where upstream's printer keeps the parentheses.
    #[must_use]
    pub fn parenthesized(&self, e: Expression<'o>) -> Expression<'o> {
        Expression::new_parenthesized_expression(SPAN, e, self)
    }
}

/// The raw text of a template literal part whose cooked value is `s`.
#[must_use]
pub fn sanitize_template_string(s: &str) -> std::borrow::Cow<'_, str> {
    if !s.contains(['`', '\\']) && !s.contains("${") {
        return std::borrow::Cow::Borrowed(s);
    }
    let mut out = String::with_capacity(s.len() + 4);
    let b = s.as_bytes();
    for (i, ch) in s.char_indices() {
        if ch == '`' || ch == '\\' || (ch == '$' && b.get(i + 1) == Some(&b'{')) {
            out.push('\\');
        }
        out.push(ch);
    }
    std::borrow::Cow::Owned(out)
}

#[cfg(test)]
mod tests;
