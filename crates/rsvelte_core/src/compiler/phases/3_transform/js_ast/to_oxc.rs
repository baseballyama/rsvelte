//! Convert the internal `js_ast` IR (`JsProgram`) into an oxc
//! [`oxc_ast::ast::Program`] so it can be printed by [`rsvelte_esrap`].
//!
//! This is the foundation of the "Phase-3 Step 1+3 direct-AST" pipeline: a
//! prior experiment proved that printing the handwritten codegen output and
//! esrap-printing the same logical AST are byte-identical, so a faithful
//! converter feeding `rsvelte_esrap::print` reproduces the existing output
//! exactly.
//!
//! # Partial coverage is always safe
//!
//! The converter is intentionally incomplete. Every sub-conversion returns
//! `Option`, and a single unhandled node bubbles `None` up to the whole
//! program via the `?` operator. The caller falls back to the existing
//! string-based codegen whenever conversion yields `None`, so this module can
//! grow its coverage one node kind at a time without ever risking incorrect
//! output.
//!
//! **CRITICAL RULE:** return `None` on ANY variant not explicitly handled
//! here — in particular `JsExpr::Raw`, `JsExpr::Spanned`, `JsStatement::Raw`,
//! and `JsStatement::RawMapped`, which carry opaque source text the structural
//! esrap printer cannot reconstruct.
//!
//! All spans use the dummy [`oxc_span::SPAN`]: esrap formats structurally, so
//! spans do not affect output for comment-free programs (and these IR nodes
//! carry no comments).

use super::arena::{ExprId, JsArena};
use super::nodes::*;
use oxc_allocator::Vec as ArenaVec;
use oxc_ast::AstBuilder;
use oxc_ast::ast::{
    Argument, ArrayExpressionElement, Expression, FormalParameterKind, ObjectPropertyKind,
    PropertyKey, PropertyKind, Statement, VariableDeclarationKind,
};
use oxc_span::SPAN;
use oxc_syntax::number::{BigintBase, NumberBase};
use oxc_syntax::operator::{BinaryOperator, LogicalOperator, UnaryOperator};

/// Convert a whole [`JsProgram`] into an oxc [`oxc_ast::ast::Program`].
///
/// Returns `None` if any node in the program is not handled by this converter
/// (see the module docs). The returned program borrows `allocator`, so the
/// allocator must outlive the program (and any `rsvelte_esrap::print` of it).
pub fn program_to_oxc<'a>(
    program: &JsProgram,
    arena: &JsArena,
    allocator: &'a oxc_allocator::Allocator,
) -> Option<oxc_ast::ast::Program<'a>> {
    let ab = AstBuilder::new(allocator);
    let cx = Cx { ab, arena };

    // Collect into an Option<Vec<_>> first so a single None bails the program.
    let body: Vec<Statement<'a>> = program
        .body
        .iter()
        .map(|s| cx.stmt(s))
        .collect::<Option<Vec<_>>>()?;

    let body = ab.vec_from_iter(body);
    Some(ab.program(
        SPAN,
        oxc_span::SourceType::mjs(),
        "",
        ab.vec(),
        None,
        ab.vec(),
        body,
    ))
}

/// Conversion context: holds the oxc [`AstBuilder`] and the IR arena used to
/// resolve [`ExprId`] handles.
struct Cx<'a, 'arena> {
    ab: AstBuilder<'a>,
    arena: &'arena JsArena,
}

impl<'a, 'arena> Cx<'a, 'arena> {
    /// Allocate a string into the oxc arena and return it as an `&'a str`,
    /// which satisfies the `Into<Atom<'a>>` / `Into<Str<'a>>` bounds used by
    /// the builder helpers.
    #[inline]
    fn str(&self, s: &str) -> &'a str {
        self.ab.allocator.alloc_str(s)
    }

    /// Resolve an `ExprId` handle and convert the pointed-to expression.
    #[inline]
    fn expr_id(&self, id: ExprId) -> Option<Expression<'a>> {
        self.expr(self.arena.get_expr(id))
    }

    // -- statements ---------------------------------------------------------

    fn stmt(&self, stmt: &JsStatement) -> Option<Statement<'a>> {
        match stmt {
            JsStatement::Expression(e) => {
                let expr = self.expr_id(e.expression)?;
                Some(self.ab.statement_expression(SPAN, expr))
            }
            JsStatement::Return(r) => {
                let arg = match r.argument {
                    Some(id) => Some(self.expr_id(id)?),
                    None => None,
                };
                Some(self.ab.statement_return(SPAN, arg))
            }
            JsStatement::VariableDeclaration(decl) => self.variable_declaration(decl),
            JsStatement::Block(b) => {
                let stmts = self.statements(&b.body)?;
                Some(self.ab.statement_block(SPAN, stmts))
            }
            JsStatement::Empty => Some(self.ab.statement_empty(SPAN)),
            JsStatement::Debugger => Some(self.ab.statement_debugger(SPAN)),
            JsStatement::Throw(id) => {
                let arg = self.expr_id(*id)?;
                Some(self.ab.statement_throw(SPAN, arg))
            }
            JsStatement::Break(label) => {
                let label = self.label(label.as_deref());
                Some(self.ab.statement_break(SPAN, label))
            }
            JsStatement::Continue(label) => {
                let label = self.label(label.as_deref());
                Some(self.ab.statement_continue(SPAN, label))
            }
            JsStatement::If(if_stmt) => {
                let test = self.expr_id(if_stmt.test)?;
                let consequent = self.stmt(self.arena.get_stmt(if_stmt.consequent))?;
                let alternate = match if_stmt.alternate {
                    Some(id) => Some(self.stmt(self.arena.get_stmt(id))?),
                    None => None,
                };
                Some(self.ab.statement_if(SPAN, test, consequent, alternate))
            }
            // TODO: Import / ExportDefault / ExportNamed / FunctionDeclaration /
            // For / ForOf / While / DoWhile / Switch / Labeled / Try.
            // Bail on opaque Raw / RawMapped (the CRITICAL RULE).
            _ => None,
        }
    }

    /// Convert a slice of IR statements into an arena `Vec`, bailing on any
    /// unhandled statement.
    fn statements(&self, body: &[JsStatement]) -> Option<ArenaVec<'a, Statement<'a>>> {
        let v: Vec<Statement<'a>> = body
            .iter()
            .map(|s| self.stmt(s))
            .collect::<Option<Vec<_>>>()?;
        Some(self.ab.vec_from_iter(v))
    }

    /// Build an optional `LabelIdentifier` for `break`/`continue` labels.
    fn label(&self, name: Option<&str>) -> Option<oxc_ast::ast::LabelIdentifier<'a>> {
        name.map(|n| self.ab.label_identifier(SPAN, self.str(n)))
    }

    fn variable_declaration(&self, decl: &JsVariableDeclaration) -> Option<Statement<'a>> {
        let kind = match decl.kind {
            JsVariableKind::Var => VariableDeclarationKind::Var,
            JsVariableKind::Let => VariableDeclarationKind::Let,
            JsVariableKind::Const => VariableDeclarationKind::Const,
        };

        let mut declarators = self.ab.vec_with_capacity(decl.declarations.len());
        for d in &decl.declarations {
            // Only plain `BindingIdentifier` ids for this slice; bail on
            // destructuring patterns (TODO).
            let name = match &d.id {
                JsPattern::Identifier(name) => name,
                _ => return None,
            };
            let binding = self
                .ab
                .binding_pattern_binding_identifier(SPAN, self.str(name));
            let init = match d.init {
                Some(id) => Some(self.expr_id(id)?),
                None => None,
            };
            declarators.push(self.ab.variable_declarator(
                SPAN,
                kind,
                binding,
                oxc_ast::NONE,
                init,
                false,
            ));
        }

        let var_decl = self.ab.declaration_variable(SPAN, kind, declarators, false);
        Some(Statement::from(var_decl))
    }

    // -- expressions --------------------------------------------------------

    fn expr(&self, expr: &JsExpr) -> Option<Expression<'a>> {
        match expr {
            JsExpr::Identifier(name) => Some(self.ab.expression_identifier(SPAN, self.str(name))),
            JsExpr::Literal(lit) => self.literal(lit),
            JsExpr::This => Some(self.ab.expression_this(SPAN)),
            JsExpr::Super => Some(Expression::Super(self.ab.alloc_super(SPAN))),
            JsExpr::MetaProperty(meta, property) => {
                let meta = self.ab.identifier_name(SPAN, self.str(meta));
                let property = self.ab.identifier_name(SPAN, self.str(property));
                Some(self.ab.expression_meta_property(SPAN, meta, property))
            }
            JsExpr::Member(m) => self.member(m),
            JsExpr::Call(c) => {
                let callee = self.expr_id(c.callee)?;
                let args = self.arguments(&c.arguments)?;
                Some(
                    self.ab
                        .expression_call(SPAN, callee, oxc_ast::NONE, args, c.optional),
                )
            }
            JsExpr::New(n) => {
                let callee = self.expr_id(n.callee)?;
                let args = self.arguments(&n.arguments)?;
                Some(self.ab.expression_new(SPAN, callee, oxc_ast::NONE, args))
            }
            JsExpr::Binary(b) => {
                let left = self.expr_id(b.left)?;
                let right = self.expr_id(b.right)?;
                Some(
                    self.ab
                        .expression_binary(SPAN, left, binary_op(b.operator), right),
                )
            }
            JsExpr::Logical(l) => {
                let left = self.expr_id(l.left)?;
                let right = self.expr_id(l.right)?;
                Some(
                    self.ab
                        .expression_logical(SPAN, left, logical_op(l.operator), right),
                )
            }
            JsExpr::Unary(u) => {
                let arg = self.expr_id(u.argument)?;
                Some(self.ab.expression_unary(SPAN, unary_op(u.operator), arg))
            }
            JsExpr::Conditional(c) => {
                let test = self.expr_id(c.test)?;
                let consequent = self.expr_id(c.consequent)?;
                let alternate = self.expr_id(c.alternate)?;
                Some(
                    self.ab
                        .expression_conditional(SPAN, test, consequent, alternate),
                )
            }
            JsExpr::Sequence(s) => {
                let mut exprs = self.ab.vec_with_capacity(s.expressions.len());
                for e in &s.expressions {
                    exprs.push(self.expr(e)?);
                }
                Some(self.ab.expression_sequence(SPAN, exprs))
            }
            JsExpr::Array(a) => {
                let mut elements = self.ab.vec_with_capacity(a.elements.len());
                for el in &a.elements {
                    let element = match el {
                        None => self.ab.array_expression_element_elision(SPAN),
                        Some(JsExpr::Spread(inner)) => {
                            // `[...x]` — spread element inside an array.
                            let inner = self.expr_id(*inner)?;
                            ArrayExpressionElement::SpreadElement(
                                self.ab.alloc_spread_element(SPAN, inner),
                            )
                        }
                        Some(e) => ArrayExpressionElement::from(self.expr(e)?),
                    };
                    elements.push(element);
                }
                Some(self.ab.expression_array(SPAN, elements))
            }
            JsExpr::Object(o) => self.object(o),
            JsExpr::Spread(inner) => {
                // A bare spread expression is only valid as an array element or
                // argument, which are handled at their use sites. Reaching this
                // arm means a spread appeared in an unexpected position; bail.
                let _ = inner;
                None
            }
            JsExpr::Await(id) => {
                let arg = self.expr_id(*id)?;
                Some(self.ab.expression_await(SPAN, arg))
            }
            JsExpr::Void(id) => {
                let arg = self.expr_id(*id)?;
                Some(self.ab.expression_unary(SPAN, UnaryOperator::Void, arg))
            }
            JsExpr::Arrow(arrow) => self.arrow(arrow),
            // TODO: TemplateLiteral / TaggedTemplate / Function / Update /
            // Assignment / Yield / Class / Chain / ImportExpression.
            // Bail on opaque Raw / Spanned (the CRITICAL RULE).
            _ => None,
        }
    }

    fn literal(&self, lit: &JsLiteral) -> Option<Expression<'a>> {
        match lit {
            JsLiteral::String(s) => {
                Some(self.ab.expression_string_literal(SPAN, self.str(s), None))
            }
            JsLiteral::Number(n) => {
                Some(
                    self.ab
                        .expression_numeric_literal(SPAN, *n, None, NumberBase::Decimal),
                )
            }
            JsLiteral::BigInt(raw) => {
                // The IR stores the raw source spelling including the trailing
                // `n` (e.g. `123n`). esrap prints from the raw text, but the
                // builder's `value` field expects base-10 digits with no
                // suffix; strip the trailing `n` for the value.
                let value = raw.strip_suffix('n').unwrap_or(raw);
                Some(self.ab.expression_big_int_literal(
                    SPAN,
                    self.str(value),
                    None,
                    BigintBase::Decimal,
                ))
            }
            JsLiteral::Boolean(b) => Some(self.ab.expression_boolean_literal(SPAN, *b)),
            JsLiteral::Null => Some(self.ab.expression_null_literal(SPAN)),
            JsLiteral::Undefined => Some(self.ab.expression_identifier(SPAN, "undefined")),
            // TODO: Regex.
            JsLiteral::Regex { .. } => None,
        }
    }

    fn member(&self, m: &JsMemberExpression) -> Option<Expression<'a>> {
        let object = self.expr_id(m.object)?;
        let member = match &m.property {
            JsMemberProperty::Identifier(name) => {
                let property = self.ab.identifier_name(SPAN, self.str(name));
                self.ab
                    .member_expression_static(SPAN, object, property, m.optional)
            }
            JsMemberProperty::Expression(id) => {
                let property = self.expr_id(*id)?;
                self.ab
                    .member_expression_computed(SPAN, object, property, m.optional)
            }
            // TODO: PrivateIdentifier.
            JsMemberProperty::PrivateIdentifier(_) => return None,
        };
        Some(Expression::from(member))
    }

    fn object(&self, o: &JsObjectExpression) -> Option<Expression<'a>> {
        let mut props = self.ab.vec_with_capacity(o.properties.len());
        for member in &o.properties {
            match member {
                JsObjectMember::SpreadElement(id) => {
                    let arg = self.expr_id(*id)?;
                    props.push(ObjectPropertyKind::SpreadProperty(
                        self.ab.alloc_spread_element(SPAN, arg),
                    ));
                }
                JsObjectMember::Property(p) => {
                    // First slice: non-method, non-computed, init-kind only.
                    if p.method || p.computed {
                        return None;
                    }
                    if !matches!(p.kind, JsPropertyKind::Init) {
                        return None; // bail on getter/setter
                    }
                    let key = self.property_key(&p.key)?;
                    let value = self.expr_id(p.value)?;
                    props.push(ObjectPropertyKind::ObjectProperty(
                        self.ab.alloc_object_property(
                            SPAN,
                            PropertyKind::Init,
                            key,
                            value,
                            false,
                            p.shorthand,
                            false,
                        ),
                    ));
                }
            }
        }
        Some(self.ab.expression_object(SPAN, props))
    }

    fn property_key(&self, key: &JsPropertyKey) -> Option<PropertyKey<'a>> {
        match key {
            JsPropertyKey::Identifier(name) => {
                Some(self.ab.property_key_static_identifier(SPAN, self.str(name)))
            }
            JsPropertyKey::Literal(lit) => {
                // A literal key is the literal expression in key position.
                let expr = self.literal(lit)?;
                Some(PropertyKey::from(expr))
            }
            // Computed keys are bailed on in `object` already (non-computed
            // only), so this is unreachable for object properties, but handle
            // defensively by bailing.
            JsPropertyKey::Computed(_) => None,
        }
    }

    fn arrow(&self, arrow: &JsArrowFunction) -> Option<Expression<'a>> {
        let params = self.formal_params(&arrow.params)?;
        let (is_expr, body) = match &arrow.body {
            JsArrowBody::Expression(id) => {
                // Expression-bodied arrow: the function body is a single
                // implicit-return expression statement.
                let expr = self.expr_id(*id)?;
                let stmt = self.ab.statement_expression(SPAN, expr);
                let stmts = self.ab.vec1(stmt);
                (true, self.ab.function_body(SPAN, self.ab.vec(), stmts))
            }
            JsArrowBody::Block(block) => {
                let stmts = self.statements(&block.body)?;
                (false, self.ab.function_body(SPAN, self.ab.vec(), stmts))
            }
        };

        Some(self.ab.expression_arrow_function(
            SPAN,
            is_expr,
            arrow.is_async,
            oxc_ast::NONE,
            params,
            oxc_ast::NONE,
            body,
        ))
    }

    /// Convert function parameters. Only plain `BindingIdentifier` params are
    /// handled for this slice; bail on any complex pattern.
    fn formal_params(&self, params: &[JsPattern]) -> Option<oxc_ast::ast::FormalParameters<'a>> {
        let mut items = self.ab.vec_with_capacity(params.len());
        for p in params {
            let name = match p {
                JsPattern::Identifier(name) => name,
                _ => return None,
            };
            let pattern = self
                .ab
                .binding_pattern_binding_identifier(SPAN, self.str(name));
            items.push(self.ab.formal_parameter(
                SPAN,
                self.ab.vec(),
                pattern,
                oxc_ast::NONE,
                oxc_ast::NONE,
                false,
                None,
                false,
                false,
            ));
        }
        Some(self.ab.formal_parameters(
            SPAN,
            FormalParameterKind::ArrowFormalParameters,
            items,
            oxc_ast::NONE,
        ))
    }

    /// Convert call/new arguments, supporting spread arguments (`f(...x)`).
    fn arguments(&self, args: &[JsExpr]) -> Option<ArenaVec<'a, Argument<'a>>> {
        let mut out = self.ab.vec_with_capacity(args.len());
        for arg in args {
            let argument = match arg {
                JsExpr::Spread(inner) => {
                    let inner = self.expr_id(*inner)?;
                    self.ab.argument_spread_element(SPAN, inner)
                }
                other => Argument::from(self.expr(other)?),
            };
            out.push(argument);
        }
        Some(out)
    }
}

// -- operator mapping -------------------------------------------------------

fn binary_op(op: JsBinaryOp) -> BinaryOperator {
    match op {
        JsBinaryOp::Add => BinaryOperator::Addition,
        JsBinaryOp::Sub => BinaryOperator::Subtraction,
        JsBinaryOp::Mul => BinaryOperator::Multiplication,
        JsBinaryOp::Div => BinaryOperator::Division,
        JsBinaryOp::Mod => BinaryOperator::Remainder,
        JsBinaryOp::Pow => BinaryOperator::Exponential,
        JsBinaryOp::Eq => BinaryOperator::Equality,
        JsBinaryOp::Ne => BinaryOperator::Inequality,
        JsBinaryOp::StrictEq => BinaryOperator::StrictEquality,
        JsBinaryOp::StrictNe => BinaryOperator::StrictInequality,
        JsBinaryOp::Lt => BinaryOperator::LessThan,
        JsBinaryOp::Le => BinaryOperator::LessEqualThan,
        JsBinaryOp::Gt => BinaryOperator::GreaterThan,
        JsBinaryOp::Ge => BinaryOperator::GreaterEqualThan,
        JsBinaryOp::BitAnd => BinaryOperator::BitwiseAnd,
        JsBinaryOp::BitOr => BinaryOperator::BitwiseOR,
        JsBinaryOp::BitXor => BinaryOperator::BitwiseXOR,
        JsBinaryOp::Shl => BinaryOperator::ShiftLeft,
        JsBinaryOp::Shr => BinaryOperator::ShiftRight,
        JsBinaryOp::UShr => BinaryOperator::ShiftRightZeroFill,
        JsBinaryOp::In => BinaryOperator::In,
        JsBinaryOp::InstanceOf => BinaryOperator::Instanceof,
    }
}

fn logical_op(op: JsLogicalOp) -> LogicalOperator {
    match op {
        JsLogicalOp::And => LogicalOperator::And,
        JsLogicalOp::Or => LogicalOperator::Or,
        JsLogicalOp::NullishCoalescing => LogicalOperator::Coalesce,
    }
}

fn unary_op(op: JsUnaryOp) -> UnaryOperator {
    match op {
        JsUnaryOp::Minus => UnaryOperator::UnaryNegation,
        JsUnaryOp::Plus => UnaryOperator::UnaryPlus,
        JsUnaryOp::Not => UnaryOperator::LogicalNot,
        JsUnaryOp::BitNot => UnaryOperator::BitwiseNot,
        JsUnaryOp::TypeOf => UnaryOperator::Typeof,
        JsUnaryOp::Void => UnaryOperator::Void,
        JsUnaryOp::Delete => UnaryOperator::Delete,
    }
}
