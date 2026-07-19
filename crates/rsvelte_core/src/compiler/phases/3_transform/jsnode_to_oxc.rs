//! Convert rsvelte's parse-phase `JsNode` AST (the ESTree-shaped representation
//! of `<script>` blocks and template expressions) into an oxc
//! [`oxc_ast::ast::Expression`] / [`oxc_ast::ast::Statement`] so Phase-3 can
//! assemble an [`oxc_ast::ast::Program`] and print it with
//! [`rsvelte_esrap::print`].
//!
//! This is a **transform-free structural conversion**: rune / prop rewriting
//! happens later, on the oxc AST. The converter only reproduces the parsed
//! shape faithfully.
//!
//! # Partial coverage is always safe
//!
//! Every sub-conversion returns `Option`, and a single unhandled node bubbles
//! `None` up via the `?` operator. Callers fall back to the existing
//! string-based codegen whenever conversion yields `None`, so this module can
//! grow its coverage one node kind at a time without ever risking incorrect
//! output.
//!
//! **CRITICAL RULE:** return `None` on ANY variant or shape that cannot be
//! faithfully reproduced — in particular [`JsNode::Null`], TypeScript-only
//! nodes, decorators, and static blocks.
//!
//! All construction patterns are lifted verbatim from the proven
//! `js_ast::to_oxc` converter (variant-complete against oxc 0.136), so the
//! nodes produced print byte-identically through esrap. All spans are the
//! dummy [`oxc_span::SPAN`]: esrap formats structurally.

use crate::ast::arena::{IdRange, JsNodeId, ParseArena};
use crate::ast::typed_expr::{JsNode, LiteralValue};
use oxc_allocator::{Allocator, ArenaBox, ArenaVec};
use oxc_ast::AstBuilder;
use oxc_ast::ast::*;
use oxc_span::SPAN;
use oxc_syntax::number::NumberBase;
use oxc_syntax::operator::{
    AssignmentOperator, BinaryOperator, LogicalOperator, UnaryOperator, UpdateOperator,
};

/// Convert a single [`JsNode`] expression into an oxc [`Expression`].
///
/// Returns `None` if `node` (or any descendant) is not faithfully convertible.
pub fn jsnode_to_oxc_expr<'a>(
    node: &JsNode,
    arena: &ParseArena,
    allocator: &'a Allocator,
) -> Option<Expression<'a>> {
    let cx = Cx {
        ab: AstBuilder::new(allocator),
        arena,
    };
    cx.expr(node)
}

/// Convert a [`JsNode::Program`] into an oxc [`oxc_ast::ast::Program`], ready
/// for [`rsvelte_esrap::print`]. Returns `None` if `node` is not a `Program`
/// or any statement is not faithfully convertible.
pub fn jsnode_to_oxc_program<'a>(
    node: &JsNode,
    arena: &ParseArena,
    allocator: &'a Allocator,
) -> Option<oxc_ast::ast::Program<'a>> {
    let JsNode::Program { body, .. } = node else {
        return None;
    };
    let cx = Cx {
        ab: AstBuilder::new(allocator),
        arena,
    };
    let stmts = cx.statements(*body)?;
    Some(Program::new(
        SPAN,
        oxc_span::SourceType::mjs(),
        "",
        ArenaVec::new_in(&cx.ab),
        None,
        ArenaVec::new_in(&cx.ab),
        stmts,
        &cx.ab,
    ))
}

/// Convert a slice of top-level [`JsNode`] statements into an oxc
/// [`oxc_ast::ast::Program`]. Returns `None` on any unhandled statement.
pub fn jsnode_stmts_to_oxc_program<'a>(
    stmts: &[JsNode],
    arena: &ParseArena,
    allocator: &'a Allocator,
) -> Option<oxc_ast::ast::Program<'a>> {
    let cx = Cx {
        ab: AstBuilder::new(allocator),
        arena,
    };
    let body: Vec<Statement<'a>> = stmts
        .iter()
        .map(|s| cx.stmt(s))
        .collect::<Option<Vec<_>>>()?;
    let body = ArenaVec::from_iter_in(body, &cx.ab);
    Some(Program::new(
        SPAN,
        oxc_span::SourceType::mjs(),
        "",
        ArenaVec::new_in(&cx.ab),
        None,
        ArenaVec::new_in(&cx.ab),
        body,
        &cx.ab,
    ))
}

/// Conversion context: holds the oxc [`AstBuilder`] and the parse arena used to
/// resolve [`JsNodeId`] / [`IdRange`] handles.
struct Cx<'a, 'arena> {
    ab: AstBuilder<'a>,
    arena: &'arena ParseArena,
}

impl<'a, 'arena> Cx<'a, 'arena> {
    /// Allocate a string into the oxc arena, yielding an `&'a str`.
    #[inline]
    fn str(&self, s: &str) -> &'a str {
        self.ab.allocator.alloc_str(s)
    }

    /// Resolve a [`JsNodeId`] and convert the pointed-to node as an expression.
    #[inline]
    fn expr_id(&self, id: JsNodeId) -> Option<Expression<'a>> {
        self.expr(self.arena.get_js_node(id))
    }

    /// Resolve a [`JsNodeId`] and convert the pointed-to node as a statement.
    #[inline]
    fn stmt_id(&self, id: JsNodeId) -> Option<Statement<'a>> {
        self.stmt(self.arena.get_js_node(id))
    }

    // -- statements ---------------------------------------------------------

    fn stmt(&self, node: &JsNode) -> Option<Statement<'a>> {
        match node {
            JsNode::ExpressionStatement { expression, .. } => {
                let expr = self.expr_id(*expression)?;
                Some(Statement::ExpressionStatement(ExpressionStatement::boxed(
                    SPAN, expr, &self.ab,
                )))
            }
            JsNode::ReturnStatement { argument, .. } => {
                let arg = match argument {
                    Some(id) => Some(self.expr_id(*id)?),
                    None => None,
                };
                Some(Statement::ReturnStatement(ReturnStatement::boxed(
                    SPAN, arg, &self.ab,
                )))
            }
            JsNode::VariableDeclaration { .. } => {
                let decl = self.variable_declaration_node(node)?;
                Some(Statement::VariableDeclaration(decl))
            }
            JsNode::BlockStatement { body, .. } => {
                let stmts = self.statements(*body)?;
                Some(Statement::BlockStatement(BlockStatement::boxed(
                    SPAN, stmts, &self.ab,
                )))
            }
            JsNode::EmptyStatement { .. } => Some(Statement::EmptyStatement(
                EmptyStatement::boxed(SPAN, &self.ab),
            )),
            JsNode::DebuggerStatement { .. } => Some(Statement::DebuggerStatement(
                DebuggerStatement::boxed(SPAN, &self.ab),
            )),
            JsNode::ThrowStatement { argument, .. } => {
                let arg = self.expr_id(*argument)?;
                Some(Statement::ThrowStatement(ThrowStatement::boxed(
                    SPAN, arg, &self.ab,
                )))
            }
            JsNode::BreakStatement { label, .. } => {
                let label = self.opt_label(label)?;
                Some(Statement::BreakStatement(BreakStatement::boxed(
                    SPAN, label, &self.ab,
                )))
            }
            JsNode::ContinueStatement { label, .. } => {
                let label = self.opt_label(label)?;
                Some(Statement::ContinueStatement(ContinueStatement::boxed(
                    SPAN, label, &self.ab,
                )))
            }
            JsNode::IfStatement {
                test,
                consequent,
                alternate,
                ..
            } => {
                let test = self.expr_id(*test)?;
                let consequent = self.stmt_id(*consequent)?;
                let alternate = match alternate {
                    Some(id) => Some(self.stmt_id(*id)?),
                    None => None,
                };
                Some(Statement::IfStatement(IfStatement::boxed(
                    SPAN, test, consequent, alternate, &self.ab,
                )))
            }
            JsNode::ImportDeclaration { .. } => self.import_declaration(node),
            JsNode::ExportNamedDeclaration { .. } => self.export_named(node),
            JsNode::ExportDefaultDeclaration { declaration, .. } => {
                self.export_default(*declaration)
            }
            JsNode::FunctionDeclaration { .. } => {
                let func = self.build_function(node, FunctionType::FunctionDeclaration)?;
                let decl = oxc_ast::ast::Declaration::FunctionDeclaration(func);
                Some(Statement::from(decl))
            }
            JsNode::ForStatement { .. } => self.for_statement(node),
            JsNode::ForOfStatement { .. } => self.for_of_statement(node, false),
            JsNode::ForInStatement { .. } => self.for_of_statement(node, true),
            JsNode::WhileStatement { test, body, .. } => {
                let test = self.expr_id(*test)?;
                let body = self.stmt_id(*body)?;
                Some(Statement::WhileStatement(WhileStatement::boxed(
                    SPAN, test, body, &self.ab,
                )))
            }
            JsNode::DoWhileStatement { test, body, .. } => {
                let body = self.stmt_id(*body)?;
                let test = self.expr_id(*test)?;
                Some(Statement::DoWhileStatement(DoWhileStatement::boxed(
                    SPAN, body, test, &self.ab,
                )))
            }
            JsNode::SwitchStatement { .. } => self.switch_statement(node),
            JsNode::LabeledStatement { label, body, .. } => {
                let name = self.identifier_name_of(*label)?;
                let label = LabelIdentifier::new(SPAN, self.str(&name), &self.ab);
                let body = self.stmt_id(*body)?;
                Some(Statement::LabeledStatement(LabeledStatement::boxed(
                    SPAN, label, body, &self.ab,
                )))
            }
            JsNode::TryStatement { .. } => self.try_statement(node),
            // Bail on opaque Raw / Null / TypeScript-only / decorators and any
            // other variant not explicitly handled above (the CRITICAL RULE).
            _ => None,
        }
    }

    /// Build an optional `LabelIdentifier` for `break label;` / `continue label;`.
    fn opt_label(
        &self,
        label: &Option<JsNodeId>,
    ) -> Option<Option<oxc_ast::ast::LabelIdentifier<'a>>> {
        match label {
            None => Some(None),
            Some(id) => {
                let name = self.identifier_name_of(*id)?;
                Some(Some(LabelIdentifier::new(SPAN, self.str(&name), &self.ab)))
            }
        }
    }

    /// Extract the bare name of an `Identifier` node behind `id`. Bails on
    /// anything else.
    fn identifier_name_of(&self, id: JsNodeId) -> Option<String> {
        match self.arena.get_js_node(id) {
            JsNode::Identifier { name, .. } => Some(name.to_string()),
            _ => None,
        }
    }

    fn for_statement(&self, node: &JsNode) -> Option<Statement<'a>> {
        let JsNode::ForStatement {
            init,
            test,
            update,
            body,
            ..
        } = node
        else {
            return None;
        };
        let init = match init {
            None => None,
            Some(id) => match self.arena.get_js_node(*id) {
                n @ JsNode::VariableDeclaration { .. } => {
                    let var_decl = self.variable_declaration_node(n)?;
                    Some(ForStatementInit::VariableDeclaration(var_decl))
                }
                _ => {
                    let expr = self.expr_id(*id)?;
                    Some(ForStatementInit::from(expr))
                }
            },
        };
        let test = match test {
            Some(id) => Some(self.expr_id(*id)?),
            None => None,
        };
        let update = match update {
            Some(id) => Some(self.expr_id(*id)?),
            None => None,
        };
        let body = self.stmt_id(*body)?;
        Some(Statement::ForStatement(ForStatement::boxed(
            SPAN, init, test, update, body, &self.ab,
        )))
    }

    /// Build `for (left of right)` / `for await (left of right)` /
    /// `for (left in right)`. The left-hand side may be a variable declaration
    /// or a plain assignment target (identifier / member); bails on others.
    fn for_of_statement(&self, node: &JsNode, is_for_in: bool) -> Option<Statement<'a>> {
        let (left_id, right_id, body_id, is_await) = match node {
            JsNode::ForOfStatement {
                left,
                right,
                body,
                r#await,
                ..
            } => (*left, *right, *body, *r#await),
            JsNode::ForInStatement {
                left, right, body, ..
            } => (*left, *right, *body, false),
            _ => return None,
        };

        let left_node = self.arena.get_js_node(left_id);
        let left = match left_node {
            JsNode::VariableDeclaration { .. } => {
                let var_decl = self.variable_declaration_node(left_node)?;
                ForStatementLeft::VariableDeclaration(var_decl)
            }
            _ => {
                let target = self.assignment_target(left_node)?;
                ForStatementLeft::from(target)
            }
        };
        let right = self.expr_id(right_id)?;
        let body = self.stmt_id(body_id)?;

        if is_for_in {
            if is_await {
                return None;
            }
            Some(Statement::ForInStatement(ForInStatement::boxed(
                SPAN, left, right, body, &self.ab,
            )))
        } else {
            Some(Statement::ForOfStatement(ForOfStatement::boxed(
                SPAN, is_await, left, right, body, &self.ab,
            )))
        }
    }

    fn switch_statement(&self, node: &JsNode) -> Option<Statement<'a>> {
        let JsNode::SwitchStatement {
            discriminant,
            cases,
            ..
        } = node
        else {
            return None;
        };
        let discriminant = self.expr_id(*discriminant)?;
        let case_nodes = self.arena.get_js_children(*cases);
        let mut out = ArenaVec::with_capacity_in(case_nodes.len(), &self.ab);
        for case in case_nodes {
            let JsNode::SwitchCase {
                test, consequent, ..
            } = case
            else {
                return None;
            };
            let test = match test {
                Some(id) => Some(self.expr_id(*id)?),
                None => None,
            };
            let consequent = self.statements(*consequent)?;
            out.push(SwitchCase::new(SPAN, test, consequent, &self.ab));
        }
        Some(Statement::SwitchStatement(SwitchStatement::boxed(
            SPAN,
            discriminant,
            out,
            &self.ab,
        )))
    }

    fn try_statement(&self, node: &JsNode) -> Option<Statement<'a>> {
        let JsNode::TryStatement {
            block,
            handler,
            finalizer,
            ..
        } = node
        else {
            return None;
        };

        let block = self.block_statement_box(*block)?;

        let handler = match handler {
            None => None,
            Some(id) => {
                let JsNode::CatchClause { param, body, .. } = self.arena.get_js_node(*id) else {
                    return None;
                };
                let catch_param = match param {
                    None => None,
                    Some(p) => {
                        let pattern = self.binding_pattern(self.arena.get_js_node(*p))?;
                        Some(CatchParameter::new(SPAN, pattern, oxc_ast::NONE, &self.ab))
                    }
                };
                let body = self.block_statement_box(*body)?;
                Some(CatchClause::new(SPAN, catch_param, body, &self.ab))
            }
        };

        let finalizer = match finalizer {
            None => None,
            Some(id) => Some(self.block_statement_box(*id)?),
        };

        Some(Statement::TryStatement(TryStatement::boxed(
            SPAN, block, handler, finalizer, &self.ab,
        )))
    }

    /// Resolve a `BlockStatement` node behind `id` into a boxed oxc block.
    fn block_statement_box(
        &self,
        id: JsNodeId,
    ) -> Option<oxc_allocator::Box<'a, oxc_ast::ast::BlockStatement<'a>>> {
        let JsNode::BlockStatement { body, .. } = self.arena.get_js_node(id) else {
            return None;
        };
        let stmts = self.statements(*body)?;
        Some(BlockStatement::boxed(SPAN, stmts, &self.ab))
    }

    /// Build a module-source `StringLiteral`, preserving the raw `'source'` /
    /// `"source"` spelling so esrap reproduces it byte-for-byte.
    fn module_source_node(&self, id: JsNodeId) -> Option<oxc_ast::ast::StringLiteral<'a>> {
        let JsNode::Literal {
            value: LiteralValue::String(s),
            raw,
            ..
        } = self.arena.get_js_node(id)
        else {
            return None;
        };
        Some(StringLiteral::new(
            SPAN,
            self.str(s),
            Some(self.str(raw).into()),
            &self.ab,
        ))
    }

    fn import_declaration(&self, node: &JsNode) -> Option<Statement<'a>> {
        let JsNode::ImportDeclaration {
            specifiers,
            source,
            import_kind,
            ..
        } = node
        else {
            return None;
        };
        // `import type … from …` is a TypeScript-only form; bail.
        if import_kind.as_deref() == Some("type") {
            return None;
        }

        let spec_nodes = self.arena.get_js_children(*specifiers);
        let specifiers = if spec_nodes.is_empty() {
            None
        } else {
            let mut specs = ArenaVec::with_capacity_in(spec_nodes.len(), &self.ab);
            for spec in spec_nodes {
                match spec {
                    JsNode::ImportDefaultSpecifier { local, .. } => {
                        let name = self.identifier_name_of(*local)?;
                        let local = BindingIdentifier::new(SPAN, self.str(&name), &self.ab);
                        specs.push(ImportDeclarationSpecifier::new_import_default_specifier(
                            SPAN, local, &self.ab,
                        ));
                    }
                    JsNode::ImportNamespaceSpecifier { local, .. } => {
                        let name = self.identifier_name_of(*local)?;
                        let local = BindingIdentifier::new(SPAN, self.str(&name), &self.ab);
                        specs.push(ImportDeclarationSpecifier::new_import_namespace_specifier(
                            SPAN, local, &self.ab,
                        ));
                    }
                    JsNode::ImportSpecifier {
                        imported,
                        local,
                        import_kind,
                        ..
                    } => {
                        if import_kind.as_deref() == Some("type") {
                            return None;
                        }
                        let imported = self.module_export_name(*imported)?;
                        let local_name = self.identifier_name_of(*local)?;
                        let local = BindingIdentifier::new(SPAN, self.str(&local_name), &self.ab);
                        specs.push(ImportDeclarationSpecifier::new_import_specifier(
                            SPAN,
                            imported,
                            local,
                            ImportOrExportKind::Value,
                            &self.ab,
                        ));
                    }
                    _ => return None,
                }
            }
            Some(specs)
        };

        let source = self.module_source_node(*source)?;
        let decl = ModuleDeclaration::new_import_declaration(
            SPAN,
            specifiers,
            source,
            None,
            oxc_ast::NONE,
            ImportOrExportKind::Value,
            &self.ab,
        );
        Some(Statement::from(decl))
    }

    /// Build a `ModuleExportName` from an `Identifier` (or string-literal)
    /// imported/exported name node.
    fn module_export_name(&self, id: JsNodeId) -> Option<oxc_ast::ast::ModuleExportName<'a>> {
        match self.arena.get_js_node(id) {
            JsNode::Identifier { name, .. } => Some(ModuleExportName::new_identifier_name(
                SPAN,
                self.str(name),
                &self.ab,
            )),
            JsNode::Literal {
                value: LiteralValue::String(s),
                ..
            } => {
                let lit = StringLiteral::new(SPAN, self.str(s), None, &self.ab);
                Some(oxc_ast::ast::ModuleExportName::StringLiteral(lit))
            }
            _ => None,
        }
    }

    fn export_named(&self, node: &JsNode) -> Option<Statement<'a>> {
        let JsNode::ExportNamedDeclaration {
            declaration,
            specifiers,
            source,
            export_kind,
            ..
        } = node
        else {
            return None;
        };
        if export_kind.as_deref() == Some("type") {
            return None;
        }
        // Re-exports (`export { x } from 'y'`) are not represented; bail.
        if source.is_some() {
            return None;
        }

        let (declaration, specs) = if let Some(decl_id) = declaration {
            let decl_node = self.arena.get_js_node(*decl_id);
            let declaration = match decl_node {
                JsNode::VariableDeclaration { .. } => {
                    let var_decl = self.variable_declaration_node(decl_node)?;
                    oxc_ast::ast::Declaration::VariableDeclaration(var_decl)
                }
                JsNode::FunctionDeclaration { .. } => {
                    let func = self.build_function(decl_node, FunctionType::FunctionDeclaration)?;
                    oxc_ast::ast::Declaration::FunctionDeclaration(func)
                }
                _ => return None,
            };
            (Some(declaration), ArenaVec::new_in(&self.ab))
        } else {
            let spec_nodes = self.arena.get_js_children(*specifiers);
            let mut out = ArenaVec::with_capacity_in(spec_nodes.len(), &self.ab);
            for spec in spec_nodes {
                let JsNode::ExportSpecifier {
                    local,
                    exported,
                    export_kind,
                    ..
                } = spec
                else {
                    return None;
                };
                if export_kind.as_deref() == Some("type") {
                    return None;
                }
                let local = self.module_export_name(*local)?;
                let exported = self.module_export_name(*exported)?;
                out.push(ExportSpecifier::new(
                    SPAN,
                    local,
                    exported,
                    ImportOrExportKind::Value,
                    &self.ab,
                ));
            }
            (None, out)
        };

        let decl = ModuleDeclaration::new_export_named_declaration(
            SPAN,
            declaration,
            specs,
            None,
            ImportOrExportKind::Value,
            oxc_ast::NONE,
            &self.ab,
        );
        Some(Statement::from(decl))
    }

    fn export_default(&self, declaration: JsNodeId) -> Option<Statement<'a>> {
        let decl_node = self.arena.get_js_node(declaration);
        let kind = match decl_node {
            JsNode::FunctionDeclaration { .. } => {
                let func = self.build_function(decl_node, FunctionType::FunctionDeclaration)?;
                oxc_ast::ast::ExportDefaultDeclarationKind::FunctionDeclaration(func)
            }
            JsNode::ClassDeclaration { .. } => return None,
            _ => {
                let expr = self.expr(decl_node)?;
                oxc_ast::ast::ExportDefaultDeclarationKind::from(expr)
            }
        };
        let decl = ModuleDeclaration::new_export_default_declaration(SPAN, kind, &self.ab);
        Some(Statement::from(decl))
    }

    /// Build a boxed `Function` from a `FunctionDeclaration` / `FunctionExpression`
    /// node. Bails (via [`Self::formal_params`] / [`Self::statements`]) on any
    /// param / body shape that cannot be reproduced.
    fn build_function(
        &self,
        node: &JsNode,
        func_type: FunctionType,
    ) -> Option<oxc_allocator::Box<'a, oxc_ast::ast::Function<'a>>> {
        let (id, params, body, generator, is_async) = match node {
            JsNode::FunctionDeclaration {
                id,
                params,
                body,
                generator,
                r#async,
                ..
            } => (id, *params, body, *generator, *r#async),
            JsNode::FunctionExpression {
                id,
                params,
                body,
                generator,
                r#async,
                ..
            } => (id, *params, body, *generator, *r#async),
            _ => return None,
        };
        let id = match id {
            Some(id) => Some(self.binding_identifier_of(*id)?),
            None => None,
        };
        let params = self.formal_params(params)?;
        // A declared-but-bodyless function (TS overload) is not reproducible.
        let body_id = (*body)?;
        let stmts = self.block_body_statements(body_id)?;
        let body = FunctionBody::new(SPAN, ArenaVec::new_in(&self.ab), stmts, &self.ab);
        Some(Function::boxed(
            SPAN,
            func_type,
            id,
            generator,
            is_async,
            false,
            oxc_ast::NONE,
            oxc_ast::NONE,
            params,
            oxc_ast::NONE,
            Some(body),
            &self.ab,
        ))
    }

    /// Build a `BindingIdentifier` from an `Identifier` node behind `id`.
    fn binding_identifier_of(&self, id: JsNodeId) -> Option<oxc_ast::ast::BindingIdentifier<'a>> {
        let name = self.identifier_name_of(id)?;
        Some(BindingIdentifier::new(SPAN, self.str(&name), &self.ab))
    }

    /// Resolve a `BlockStatement` node behind `id` and convert its body.
    fn block_body_statements(&self, id: JsNodeId) -> Option<ArenaVec<'a, Statement<'a>>> {
        let JsNode::BlockStatement { body, .. } = self.arena.get_js_node(id) else {
            return None;
        };
        self.statements(*body)
    }

    /// Convert a child range of statement nodes into an arena `Vec`.
    fn statements(&self, range: IdRange) -> Option<ArenaVec<'a, Statement<'a>>> {
        let nodes = self.arena.get_js_children(range);
        let v: Vec<Statement<'a>> = nodes
            .iter()
            .map(|s| self.stmt(s))
            .collect::<Option<Vec<_>>>()?;
        Some(ArenaVec::from_iter_in(v, &self.ab))
    }

    /// Build a boxed `VariableDeclaration` from a `VariableDeclaration` node.
    fn variable_declaration_node(
        &self,
        node: &JsNode,
    ) -> Option<oxc_allocator::Box<'a, oxc_ast::ast::VariableDeclaration<'a>>> {
        let JsNode::VariableDeclaration {
            declarations,
            kind,
            declare,
            ..
        } = node
        else {
            return None;
        };
        // `declare` is TypeScript-only.
        if *declare {
            return None;
        }
        let kind = match kind.as_str() {
            "var" => VariableDeclarationKind::Var,
            "let" => VariableDeclarationKind::Let,
            "const" => VariableDeclarationKind::Const,
            // `using` / `await using` and any other kind are not reproducible.
            _ => return None,
        };

        let decl_nodes = self.arena.get_js_children(*declarations);
        let mut declarators = ArenaVec::with_capacity_in(decl_nodes.len(), &self.ab);
        for d in decl_nodes {
            let JsNode::VariableDeclarator { id, init, .. } = d else {
                return None;
            };
            let binding = self.binding_pattern(self.arena.get_js_node(*id))?;
            let init = match init {
                Some(id) => Some(self.expr_id(*id)?),
                None => None,
            };
            declarators.push(VariableDeclarator::new(
                SPAN,
                kind,
                binding,
                oxc_ast::NONE,
                init,
                false,
                &self.ab,
            ));
        }
        Some(VariableDeclaration::boxed(
            SPAN,
            kind,
            declarators,
            false,
            &self.ab,
        ))
    }

    // -- binding patterns ---------------------------------------------------

    /// Build an oxc `BindingPattern` from a pattern node, recursing into
    /// object / array / assignment / rest sub-patterns. Bails on a non-last
    /// rest, a computed object-pattern key we cannot reconstruct, or any nested
    /// pattern that itself bails.
    fn binding_pattern(&self, pat: &JsNode) -> Option<oxc_ast::ast::BindingPattern<'a>> {
        match pat {
            JsNode::Identifier { name, .. } => Some(BindingPattern::new_binding_identifier(
                SPAN,
                self.str(name),
                &self.ab,
            )),
            JsNode::ObjectPattern { properties, .. } => {
                let prop_nodes = self.arena.get_js_children(*properties);
                let mut props = ArenaVec::with_capacity_in(prop_nodes.len(), &self.ab);
                let mut rest = None;
                let last = prop_nodes.len().saturating_sub(1);
                for (i, member) in prop_nodes.iter().enumerate() {
                    match member {
                        JsNode::Property {
                            key,
                            value,
                            computed,
                            shorthand,
                            ..
                        } => {
                            let key = self.binding_property_key(*key, *computed)?;
                            let value = self.binding_pattern(self.arena.get_js_node(*value))?;
                            props.push(BindingProperty::new(
                                SPAN, key, value, *shorthand, *computed, &self.ab,
                            ));
                        }
                        JsNode::RestElement { argument, .. } => {
                            if i != last {
                                return None;
                            }
                            let inner = self.binding_pattern(self.arena.get_js_node(*argument))?;
                            rest = Some(BindingRestElement::boxed(SPAN, inner, &self.ab));
                        }
                        _ => return None,
                    }
                }
                Some(BindingPattern::new_object_pattern(
                    SPAN, props, rest, &self.ab,
                ))
            }
            JsNode::ArrayPattern { elements, .. } => {
                let mut out = ArenaVec::with_capacity_in(elements.len(), &self.ab);
                let mut rest = None;
                let last = elements.len().saturating_sub(1);
                for (i, el) in elements.iter().enumerate() {
                    match el {
                        None => out.push(None),
                        Some(JsNode::RestElement { argument, .. }) => {
                            if i != last {
                                return None;
                            }
                            let inner = self.binding_pattern(self.arena.get_js_node(*argument))?;
                            rest = Some(BindingRestElement::boxed(SPAN, inner, &self.ab));
                        }
                        Some(el) => out.push(Some(self.binding_pattern(el)?)),
                    }
                }
                Some(BindingPattern::new_array_pattern(SPAN, out, rest, &self.ab))
            }
            JsNode::AssignmentPattern { left, right, .. } => {
                let left = self.binding_pattern(self.arena.get_js_node(*left))?;
                let right = self.expr_id(*right)?;
                Some(BindingPattern::new_assignment_pattern(
                    SPAN, left, right, &self.ab,
                ))
            }
            _ => None,
        }
    }

    /// Build an object-pattern property key. A computed key holds an arbitrary
    /// expression; a plain key is an identifier or literal.
    fn binding_property_key(&self, key: JsNodeId, computed: bool) -> Option<PropertyKey<'a>> {
        if computed {
            let expr = self.expr_id(key)?;
            Some(PropertyKey::from(expr))
        } else {
            self.property_key(self.arena.get_js_node(key))
        }
    }

    // -- expressions --------------------------------------------------------

    fn expr(&self, node: &JsNode) -> Option<Expression<'a>> {
        match node {
            JsNode::Identifier { name, .. } => {
                Some(Expression::new_identifier(SPAN, self.str(name), &self.ab))
            }
            JsNode::Literal { .. } => self.literal(node),
            JsNode::ThisExpression { .. } => Some(Expression::ThisExpression(
                ThisExpression::boxed(SPAN, &self.ab),
            )),
            JsNode::Super { .. } => Some(Expression::Super(Super::boxed(SPAN, &self.ab))),
            JsNode::MetaProperty { meta, property, .. } => {
                let meta = self.identifier_name_of(*meta)?;
                let property = self.identifier_name_of(*property)?;
                let meta = IdentifierName::new(SPAN, self.str(&meta), &self.ab);
                let property = IdentifierName::new(SPAN, self.str(&property), &self.ab);
                Some(Expression::new_meta_property(
                    SPAN, meta, property, &self.ab,
                ))
            }
            JsNode::MemberExpression { .. } => Some(Expression::from(self.member_expr(node)?)),
            JsNode::CallExpression {
                callee,
                arguments,
                optional,
                ..
            } => {
                let callee = self.expr_id(*callee)?;
                let args = self.arguments(*arguments)?;
                Some(Expression::CallExpression(CallExpression::boxed(
                    SPAN,
                    callee,
                    oxc_ast::NONE,
                    args,
                    *optional,
                    &self.ab,
                )))
            }
            JsNode::NewExpression {
                callee, arguments, ..
            } => {
                let callee = self.expr_id(*callee)?;
                let args = self.arguments(*arguments)?;
                Some(Expression::NewExpression(NewExpression::boxed(
                    SPAN,
                    callee,
                    oxc_ast::NONE,
                    args,
                    &self.ab,
                )))
            }
            JsNode::BinaryExpression {
                left,
                operator,
                right,
                ..
            } => {
                let op = binary_op(operator)?;
                let left = self.expr_id(*left)?;
                let right = self.expr_id(*right)?;
                Some(Expression::BinaryExpression(BinaryExpression::boxed(
                    SPAN, left, op, right, &self.ab,
                )))
            }
            JsNode::LogicalExpression {
                left,
                operator,
                right,
                ..
            } => {
                let op = logical_op(operator)?;
                let left = self.expr_id(*left)?;
                let right = self.expr_id(*right)?;
                Some(Expression::LogicalExpression(LogicalExpression::boxed(
                    SPAN, left, op, right, &self.ab,
                )))
            }
            JsNode::UnaryExpression {
                operator, argument, ..
            } => {
                let op = unary_op(operator)?;
                let arg = self.expr_id(*argument)?;
                Some(Expression::UnaryExpression(UnaryExpression::boxed(
                    SPAN, op, arg, &self.ab,
                )))
            }
            JsNode::ConditionalExpression {
                test,
                consequent,
                alternate,
                ..
            } => {
                let test = self.expr_id(*test)?;
                let consequent = self.expr_id(*consequent)?;
                let alternate = self.expr_id(*alternate)?;
                Some(Expression::ConditionalExpression(
                    ConditionalExpression::boxed(SPAN, test, consequent, alternate, &self.ab),
                ))
            }
            JsNode::SequenceExpression { expressions, .. } => {
                let nodes = self.arena.get_js_children(*expressions);
                let mut exprs = ArenaVec::with_capacity_in(nodes.len(), &self.ab);
                for e in nodes {
                    exprs.push(self.expr(e)?);
                }
                Some(Expression::SequenceExpression(SequenceExpression::boxed(
                    SPAN, exprs, &self.ab,
                )))
            }
            JsNode::ArrayExpression { elements, .. } => {
                let mut out = ArenaVec::with_capacity_in(elements.len(), &self.ab);
                for el in elements {
                    let element = match el {
                        None => ArrayExpressionElement::new_elision(SPAN, &self.ab),
                        Some(JsNode::SpreadElement { argument, .. }) => {
                            let inner = self.expr_id(*argument)?;
                            ArrayExpressionElement::SpreadElement(SpreadElement::boxed(
                                SPAN, inner, &self.ab,
                            ))
                        }
                        Some(e) => ArrayExpressionElement::from(self.expr(e)?),
                    };
                    out.push(element);
                }
                Some(Expression::ArrayExpression(ArrayExpression::boxed(
                    SPAN, out, &self.ab,
                )))
            }
            JsNode::ObjectExpression { .. } => self.object(node),
            JsNode::AwaitExpression { argument, .. } => {
                let arg = self.expr_id(*argument)?;
                Some(Expression::AwaitExpression(AwaitExpression::boxed(
                    SPAN, arg, &self.ab,
                )))
            }
            JsNode::ArrowFunctionExpression { .. } => self.arrow(node),
            JsNode::FunctionExpression { .. } => {
                let func = self.build_function(node, FunctionType::FunctionExpression)?;
                Some(Expression::FunctionExpression(func))
            }
            JsNode::TemplateLiteral { .. } => {
                let tpl = self.template_literal(node)?;
                Some(Expression::TemplateLiteral(ArenaBox::new_in(tpl, &self.ab)))
            }
            JsNode::TaggedTemplateExpression { tag, quasi, .. } => {
                let tag = self.expr_id(*tag)?;
                let quasi = self.template_literal(self.arena.get_js_node(*quasi))?;
                Some(Expression::TaggedTemplateExpression(
                    TaggedTemplateExpression::boxed(SPAN, tag, oxc_ast::NONE, quasi, &self.ab),
                ))
            }
            JsNode::AssignmentExpression {
                operator,
                left,
                right,
                ..
            } => {
                let op = assignment_op(operator)?;
                let left = self.assignment_target(self.arena.get_js_node(*left))?;
                let right = self.expr_id(*right)?;
                Some(Expression::AssignmentExpression(
                    AssignmentExpression::boxed(SPAN, op, left, right, &self.ab),
                ))
            }
            JsNode::UpdateExpression {
                operator,
                prefix,
                argument,
                ..
            } => {
                let op = update_op(operator)?;
                let target = self.simple_assignment_target(self.arena.get_js_node(*argument))?;
                Some(Expression::UpdateExpression(UpdateExpression::boxed(
                    SPAN, op, *prefix, target, &self.ab,
                )))
            }
            JsNode::ChainExpression { expression, .. } => self.chain(*expression),
            JsNode::ImportExpression { source, .. } => {
                let source = self.expr_id(*source)?;
                Some(Expression::ImportExpression(ImportExpression::boxed(
                    SPAN, source, None, None, &self.ab,
                )))
            }
            JsNode::YieldExpression {
                delegate, argument, ..
            } => {
                let argument = match argument {
                    Some(id) => Some(self.expr_id(*id)?),
                    None => None,
                };
                Some(Expression::YieldExpression(YieldExpression::boxed(
                    SPAN, *delegate, argument, &self.ab,
                )))
            }
            // Bail on opaque Raw / Null / ClassExpression (bodies use separate
            // ClassBody member variants we do not reproduce here) and any other
            // variant not explicitly handled above (the CRITICAL RULE).
            _ => None,
        }
    }

    fn literal(&self, node: &JsNode) -> Option<Expression<'a>> {
        let JsNode::Literal {
            value, raw, regex, ..
        } = node
        else {
            return None;
        };
        // A regex literal: build the flags bitset faithfully, preserving the
        // `/pattern/flags` raw spelling.
        if let Some(rx) = regex {
            let mut flag_bits = RegExpFlags::empty();
            for ch in rx.flags.chars() {
                flag_bits |= RegExpFlags::try_from(ch).ok()?;
            }
            let regexp = RegExp {
                pattern: RegExpPattern {
                    text: self.str(&rx.pattern).into(),
                    pattern: None,
                },
                flags: flag_bits,
            };
            return Some(Expression::new_reg_exp_literal(
                SPAN,
                regexp,
                Some(self.str(raw).into()),
                &self.ab,
            ));
        }

        match value {
            LiteralValue::String(s) => Some(Expression::new_string_literal(
                SPAN,
                self.str(s),
                Some(self.str(raw).into()),
                &self.ab,
            )),
            LiteralValue::Number(n) => Some(Expression::new_numeric_literal(
                SPAN,
                *n,
                Some(self.str(raw).into()),
                NumberBase::Decimal,
                &self.ab,
            )),
            LiteralValue::Bool(b) => Some(Expression::new_boolean_literal(SPAN, *b, &self.ab)),
            LiteralValue::Null => Some(Expression::new_null_literal(SPAN, &self.ab)),
            // Regex handled above; reaching here would be a `Regex` value with
            // no `regex` field, which is malformed — bail.
            LiteralValue::Regex(_) => None,
        }
    }

    /// Build a `MemberExpression` node from a `MemberExpression` JsNode. Shared
    /// by the expression arm, the assignment-target helper, and the chain helper.
    fn member_expr(&self, node: &JsNode) -> Option<oxc_ast::ast::MemberExpression<'a>> {
        let JsNode::MemberExpression {
            object,
            property,
            computed,
            optional,
            ..
        } = node
        else {
            return None;
        };
        let object = self.expr_id(*object)?;
        let prop_node = self.arena.get_js_node(*property);
        let member = if *computed {
            let property = self.expr(prop_node)?;
            MemberExpression::ComputedMemberExpression(ComputedMemberExpression::boxed(
                SPAN, object, property, *optional, &self.ab,
            ))
        } else {
            match prop_node {
                JsNode::Identifier { name, .. } => {
                    let property = IdentifierName::new(SPAN, self.str(name), &self.ab);
                    MemberExpression::StaticMemberExpression(StaticMemberExpression::boxed(
                        SPAN, object, property, *optional, &self.ab,
                    ))
                }
                JsNode::PrivateIdentifier { name, .. } => {
                    // The IR stores the bare name (no leading `#`); esrap adds
                    // the `#`, so pass the name verbatim.
                    let field = PrivateIdentifier::new(SPAN, self.str(name), &self.ab);
                    MemberExpression::new_private_field_expression(
                        SPAN, object, field, *optional, &self.ab,
                    )
                }
                _ => return None,
            }
        };
        Some(member)
    }

    fn template_literal(&self, node: &JsNode) -> Option<oxc_ast::ast::TemplateLiteral<'a>> {
        let JsNode::TemplateLiteral {
            quasis,
            expressions,
            ..
        } = node
        else {
            return None;
        };
        let quasi_nodes = self.arena.get_js_children(*quasis);
        let mut quasis_out = ArenaVec::with_capacity_in(quasi_nodes.len(), &self.ab);
        for q in quasi_nodes {
            let JsNode::TemplateElement { tail, value, .. } = q else {
                return None;
            };
            let val = oxc_ast::ast::TemplateElementValue {
                raw: self.str(&value.raw).into(),
                cooked: value.cooked.as_ref().map(|c| self.str(c).into()),
            };
            quasis_out.push(TemplateElement::new(SPAN, val, *tail, &self.ab));
        }
        let expr_nodes = self.arena.get_js_children(*expressions);
        let mut exprs = ArenaVec::with_capacity_in(expr_nodes.len(), &self.ab);
        for e in expr_nodes {
            exprs.push(self.expr(e)?);
        }
        Some(TemplateLiteral::new(SPAN, quasis_out, exprs, &self.ab))
    }

    /// Build a `SimpleAssignmentTarget` from an identifier / simple member node.
    fn simple_assignment_target(
        &self,
        node: &JsNode,
    ) -> Option<oxc_ast::ast::SimpleAssignmentTarget<'a>> {
        match node {
            JsNode::Identifier { name, .. } => {
                Some(SimpleAssignmentTarget::new_assignment_target_identifier(
                    SPAN,
                    self.str(name),
                    &self.ab,
                ))
            }
            JsNode::MemberExpression { optional, .. } if !*optional => {
                let member = self.member_expr(node)?;
                Some(oxc_ast::ast::SimpleAssignmentTarget::from(member))
            }
            _ => None,
        }
    }

    /// Build a full `AssignmentTarget` from a node used as an assignment /
    /// for-of left-hand side. Destructuring patterns (`[a]=` / `{a}=`) lower to
    /// the dedicated array / object assignment-target variants. The parse AST
    /// represents the destructuring LHS as `ArrayPattern` / `ObjectPattern`
    /// (the analyzer position), so accept those too.
    fn assignment_target(&self, node: &JsNode) -> Option<oxc_ast::ast::AssignmentTarget<'a>> {
        match node {
            JsNode::ArrayExpression { elements, .. } => {
                self.array_assignment_target(elements.iter().map(|e| e.as_ref()))
            }
            JsNode::ArrayPattern { elements, .. } => {
                self.array_assignment_target(elements.iter().map(|e| e.as_ref()))
            }
            JsNode::ObjectExpression { properties, .. } => {
                let nodes = self.arena.get_js_children(*properties);
                self.object_assignment_target(nodes)
            }
            JsNode::ObjectPattern { properties, .. } => {
                let nodes = self.arena.get_js_children(*properties);
                self.object_assignment_target(nodes)
            }
            JsNode::AssignmentPattern { .. } => None,
            _ => {
                let simple = self.simple_assignment_target(node)?;
                Some(oxc_ast::ast::AssignmentTarget::from(simple))
            }
        }
    }

    fn array_assignment_target<'n, I>(
        &self,
        elements: I,
    ) -> Option<oxc_ast::ast::AssignmentTarget<'a>>
    where
        I: ExactSizeIterator<Item = Option<&'n JsNode>>,
    {
        let len = elements.len();
        let mut out = ArenaVec::with_capacity_in(len, &self.ab);
        let mut rest = None;
        let last = len.saturating_sub(1);
        for (i, el) in elements.enumerate() {
            match el {
                None => out.push(None),
                Some(JsNode::SpreadElement { argument, .. })
                | Some(JsNode::RestElement { argument, .. }) => {
                    if i != last {
                        return None;
                    }
                    let target = self.assignment_target(self.arena.get_js_node(*argument))?;
                    rest = Some(AssignmentTargetRest::boxed(SPAN, target, &self.ab));
                }
                Some(e) => out.push(Some(self.assignment_target_maybe_default(e)?)),
            }
        }
        let array = ArrayAssignmentTarget::boxed(SPAN, out, rest, &self.ab);
        Some(oxc_ast::ast::AssignmentTarget::ArrayAssignmentTarget(array))
    }

    fn object_assignment_target(
        &self,
        members: &[JsNode],
    ) -> Option<oxc_ast::ast::AssignmentTarget<'a>> {
        let mut props = ArenaVec::with_capacity_in(members.len(), &self.ab);
        let mut rest = None;
        let last = members.len().saturating_sub(1);
        for (i, member) in members.iter().enumerate() {
            match member {
                JsNode::SpreadElement { argument, .. } | JsNode::RestElement { argument, .. } => {
                    if i != last {
                        return None;
                    }
                    let target = self.assignment_target(self.arena.get_js_node(*argument))?;
                    rest = Some(AssignmentTargetRest::boxed(SPAN, target, &self.ab));
                }
                JsNode::Property {
                    key,
                    value,
                    kind,
                    method,
                    shorthand,
                    computed,
                    ..
                } => {
                    if kind != "init" || *method {
                        return None;
                    }
                    let prop =
                        self.assignment_target_property(*key, *value, *shorthand, *computed)?;
                    props.push(prop);
                }
                _ => return None,
            }
        }
        let object = ObjectAssignmentTarget::boxed(SPAN, props, rest, &self.ab);
        Some(oxc_ast::ast::AssignmentTarget::ObjectAssignmentTarget(
            object,
        ))
    }

    fn assignment_target_maybe_default(
        &self,
        node: &JsNode,
    ) -> Option<oxc_ast::ast::AssignmentTargetMaybeDefault<'a>> {
        // A default is encoded as `AssignmentPattern { left, right }` (pattern
        // position) or as an `AssignmentExpression` with `=` (expression
        // position).
        if let JsNode::AssignmentPattern { left, right, .. } = node {
            let binding = self.assignment_target(self.arena.get_js_node(*left))?;
            let init = self.expr_id(*right)?;
            return Some(
                AssignmentTargetMaybeDefault::new_assignment_target_with_default(
                    SPAN, binding, init, &self.ab,
                ),
            );
        }
        if let JsNode::AssignmentExpression {
            operator,
            left,
            right,
            ..
        } = node
            && operator == "="
        {
            let binding = self.assignment_target(self.arena.get_js_node(*left))?;
            let init = self.expr_id(*right)?;
            return Some(
                AssignmentTargetMaybeDefault::new_assignment_target_with_default(
                    SPAN, binding, init, &self.ab,
                ),
            );
        }
        let target = self.assignment_target(node)?;
        Some(oxc_ast::ast::AssignmentTargetMaybeDefault::from(target))
    }

    fn assignment_target_property(
        &self,
        key: JsNodeId,
        value: JsNodeId,
        shorthand: bool,
        computed: bool,
    ) -> Option<oxc_ast::ast::AssignmentTargetProperty<'a>> {
        if shorthand && !computed {
            // `{ a }` or `{ a = default }`: the value is the bare identifier or
            // an `a = default` assignment / pattern.
            let value_node = self.arena.get_js_node(value);
            let (name, init) = match value_node {
                JsNode::Identifier { name, .. } => (name.to_string(), None),
                JsNode::AssignmentPattern { left, right, .. } => {
                    match self.arena.get_js_node(*left) {
                        JsNode::Identifier { name, .. } => {
                            (name.to_string(), Some(self.expr_id(*right)?))
                        }
                        _ => return None,
                    }
                }
                JsNode::AssignmentExpression {
                    operator,
                    left,
                    right,
                    ..
                } if operator == "=" => match self.arena.get_js_node(*left) {
                    JsNode::Identifier { name, .. } => {
                        (name.to_string(), Some(self.expr_id(*right)?))
                    }
                    _ => return None,
                },
                _ => return None,
            };
            let binding = IdentifierReference::new(SPAN, self.str(&name), &self.ab);
            return Some(
                oxc_ast::ast::AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(
                    AssignmentTargetPropertyIdentifier::boxed(SPAN, binding, init, &self.ab),
                ),
            );
        }

        let key = self.binding_property_key(key, computed)?;
        let binding = self.assignment_target_maybe_default(self.arena.get_js_node(value))?;
        Some(
            oxc_ast::ast::AssignmentTargetProperty::AssignmentTargetPropertyProperty(
                AssignmentTargetPropertyProperty::boxed(SPAN, key, binding, computed, &self.ab),
            ),
        )
    }

    fn object(&self, node: &JsNode) -> Option<Expression<'a>> {
        let JsNode::ObjectExpression { properties, .. } = node else {
            return None;
        };
        let prop_nodes = self.arena.get_js_children(*properties);
        let mut props = ArenaVec::with_capacity_in(prop_nodes.len(), &self.ab);
        for member in prop_nodes {
            match member {
                JsNode::SpreadElement { argument, .. } => {
                    let arg = self.expr_id(*argument)?;
                    props.push(ObjectPropertyKind::SpreadProperty(SpreadElement::boxed(
                        SPAN, arg, &self.ab,
                    )));
                }
                JsNode::Property { .. } => {
                    let prop = self.object_property(member)?;
                    props.push(ObjectPropertyKind::ObjectProperty(prop));
                }
                _ => return None,
            }
        }
        Some(Expression::ObjectExpression(ObjectExpression::boxed(
            SPAN, props, &self.ab,
        )))
    }

    /// Build a boxed `ObjectProperty`. Handles plain `key: value`, computed
    /// keys, method shorthand, and get / set accessors. Mirrors codegen's
    /// `auto_method` heuristic: a non-computed `init` property whose value is a
    /// (non-arrow) function expression renders as a method shorthand.
    fn object_property(
        &self,
        node: &JsNode,
    ) -> Option<oxc_allocator::Box<'a, oxc_ast::ast::ObjectProperty<'a>>> {
        let JsNode::Property {
            key,
            value,
            kind,
            method,
            shorthand,
            computed,
            ..
        } = node
        else {
            return None;
        };
        let prop_kind = match kind.as_str() {
            "init" => PropertyKind::Init,
            "get" => PropertyKind::Get,
            "set" => PropertyKind::Set,
            _ => return None,
        };

        let value_is_function = matches!(
            self.arena.get_js_node(*value),
            JsNode::FunctionExpression { .. }
        );
        let is_accessor = kind != "init";
        let auto_method = !*computed && kind == "init" && value_is_function;
        let method = *method || auto_method;

        if (is_accessor || method) && !value_is_function {
            return None;
        }

        let key = if *computed {
            let expr = self.expr_id(*key)?;
            PropertyKey::from(expr)
        } else {
            self.property_key(self.arena.get_js_node(*key))?
        };

        let value = self.expr_id(*value)?;
        Some(ObjectProperty::boxed(
            SPAN, prop_kind, key, value, method, *shorthand, *computed, &self.ab,
        ))
    }

    /// Build a non-computed `PropertyKey` from an identifier / literal node.
    fn property_key(&self, node: &JsNode) -> Option<PropertyKey<'a>> {
        match node {
            JsNode::Identifier { name, .. } => Some(PropertyKey::new_static_identifier(
                SPAN,
                self.str(name),
                &self.ab,
            )),
            JsNode::PrivateIdentifier { name, .. } => {
                let field = PrivateIdentifier::new(SPAN, self.str(name), &self.ab);
                Some(PropertyKey::PrivateIdentifier(ArenaBox::new_in(
                    field, &self.ab,
                )))
            }
            JsNode::Literal { .. } => {
                let expr = self.literal(node)?;
                Some(PropertyKey::from(expr))
            }
            _ => None,
        }
    }

    fn arrow(&self, node: &JsNode) -> Option<Expression<'a>> {
        let JsNode::ArrowFunctionExpression {
            params,
            body,
            expression,
            r#async,
            ..
        } = node
        else {
            return None;
        };
        let params = self.formal_params(*params)?;
        let body_node = self.arena.get_js_node(*body);
        let (is_expr, fn_body) = if *expression {
            // Concise-body arrow: a single implicit-return expression.
            let expr = self.expr(body_node)?;
            let stmt =
                Statement::ExpressionStatement(ExpressionStatement::boxed(SPAN, expr, &self.ab));
            let stmts = ArenaVec::from_value_in(stmt, &self.ab);
            (
                true,
                FunctionBody::new(SPAN, ArenaVec::new_in(&self.ab), stmts, &self.ab),
            )
        } else {
            let JsNode::BlockStatement { body, .. } = body_node else {
                return None;
            };
            let stmts = self.statements(*body)?;
            (
                false,
                FunctionBody::new(SPAN, ArenaVec::new_in(&self.ab), stmts, &self.ab),
            )
        };
        Some(Expression::ArrowFunctionExpression(
            ArrowFunctionExpression::boxed(
                SPAN,
                is_expr,
                *r#async,
                oxc_ast::NONE,
                params,
                oxc_ast::NONE,
                fn_body,
                &self.ab,
            ),
        ))
    }

    /// Build an optional-chaining wrapper (`a?.b`, `a?.()`).
    fn chain(&self, expression: JsNodeId) -> Option<Expression<'a>> {
        let inner = self.arena.get_js_node(expression);
        let element: ChainElement<'a> = match inner {
            JsNode::MemberExpression { .. } => {
                let member = self.member_expr(inner)?;
                ChainElement::from(member)
            }
            JsNode::CallExpression {
                callee,
                arguments,
                optional,
                ..
            } => {
                let callee = self.expr_id(*callee)?;
                let args = self.arguments(*arguments)?;
                let call =
                    CallExpression::boxed(SPAN, callee, oxc_ast::NONE, args, *optional, &self.ab);
                ChainElement::CallExpression(call)
            }
            _ => return None,
        };
        Some(Expression::ChainExpression(ChainExpression::boxed(
            SPAN, element, &self.ab,
        )))
    }

    /// Convert function parameters (a child range of pattern nodes), handling a
    /// trailing `...rest`. Bails on a non-last rest or any unhandled pattern.
    fn formal_params(&self, params: IdRange) -> Option<oxc_ast::ast::FormalParameters<'a>> {
        let nodes = self.arena.get_js_children(params);
        let mut items = ArenaVec::with_capacity_in(nodes.len(), &self.ab);
        let mut rest = None;
        let last = nodes.len().saturating_sub(1);
        for (i, p) in nodes.iter().enumerate() {
            if let JsNode::RestElement { argument, .. } = p {
                if i != last {
                    return None;
                }
                let pattern = self.binding_pattern(self.arena.get_js_node(*argument))?;
                let rest_el = BindingRestElement::new(SPAN, pattern, &self.ab);
                rest = Some(FormalParameterRest::boxed(
                    SPAN,
                    ArenaVec::new_in(&self.ab),
                    rest_el,
                    oxc_ast::NONE,
                    &self.ab,
                ));
                continue;
            }
            let pattern = self.binding_pattern(p)?;
            items.push(FormalParameter::new(
                SPAN,
                ArenaVec::new_in(&self.ab),
                pattern,
                oxc_ast::NONE,
                oxc_ast::NONE,
                false,
                None,
                false,
                false,
                &self.ab,
            ));
        }
        Some(FormalParameters::new(
            SPAN,
            FormalParameterKind::ArrowFormalParameters,
            items,
            rest,
            &self.ab,
        ))
    }

    /// Convert call / new arguments (a child range), supporting spreads.
    fn arguments(&self, args: IdRange) -> Option<ArenaVec<'a, Argument<'a>>> {
        let nodes = self.arena.get_js_children(args);
        let mut out = ArenaVec::with_capacity_in(nodes.len(), &self.ab);
        for arg in nodes {
            let argument = match arg {
                JsNode::SpreadElement { argument, .. } => {
                    let inner = self.expr_id(*argument)?;
                    Argument::new_spread_element(SPAN, inner, &self.ab)
                }
                other => Argument::from(self.expr(other)?),
            };
            out.push(argument);
        }
        Some(out)
    }
}

// -- operator mapping -------------------------------------------------------
//
// The parse AST stores operators as `CompactString` (ESTree spelling), so these
// maps go string → oxc operator, bailing (`None`) on any unrecognised spelling.

fn binary_op(op: &str) -> Option<BinaryOperator> {
    Some(match op {
        "+" => BinaryOperator::Addition,
        "-" => BinaryOperator::Subtraction,
        "*" => BinaryOperator::Multiplication,
        "/" => BinaryOperator::Division,
        "%" => BinaryOperator::Remainder,
        "**" => BinaryOperator::Exponential,
        "==" => BinaryOperator::Equality,
        "!=" => BinaryOperator::Inequality,
        "===" => BinaryOperator::StrictEquality,
        "!==" => BinaryOperator::StrictInequality,
        "<" => BinaryOperator::LessThan,
        "<=" => BinaryOperator::LessEqualThan,
        ">" => BinaryOperator::GreaterThan,
        ">=" => BinaryOperator::GreaterEqualThan,
        "&" => BinaryOperator::BitwiseAnd,
        "|" => BinaryOperator::BitwiseOR,
        "^" => BinaryOperator::BitwiseXOR,
        "<<" => BinaryOperator::ShiftLeft,
        ">>" => BinaryOperator::ShiftRight,
        ">>>" => BinaryOperator::ShiftRightZeroFill,
        "in" => BinaryOperator::In,
        "instanceof" => BinaryOperator::Instanceof,
        _ => return None,
    })
}

fn logical_op(op: &str) -> Option<LogicalOperator> {
    Some(match op {
        "&&" => LogicalOperator::And,
        "||" => LogicalOperator::Or,
        "??" => LogicalOperator::Coalesce,
        _ => return None,
    })
}

fn assignment_op(op: &str) -> Option<AssignmentOperator> {
    Some(match op {
        "=" => AssignmentOperator::Assign,
        "+=" => AssignmentOperator::Addition,
        "-=" => AssignmentOperator::Subtraction,
        "*=" => AssignmentOperator::Multiplication,
        "/=" => AssignmentOperator::Division,
        "%=" => AssignmentOperator::Remainder,
        "**=" => AssignmentOperator::Exponential,
        "<<=" => AssignmentOperator::ShiftLeft,
        ">>=" => AssignmentOperator::ShiftRight,
        ">>>=" => AssignmentOperator::ShiftRightZeroFill,
        "&=" => AssignmentOperator::BitwiseAnd,
        "|=" => AssignmentOperator::BitwiseOR,
        "^=" => AssignmentOperator::BitwiseXOR,
        "&&=" => AssignmentOperator::LogicalAnd,
        "||=" => AssignmentOperator::LogicalOr,
        "??=" => AssignmentOperator::LogicalNullish,
        _ => return None,
    })
}

fn update_op(op: &str) -> Option<UpdateOperator> {
    Some(match op {
        "++" => UpdateOperator::Increment,
        "--" => UpdateOperator::Decrement,
        _ => return None,
    })
}

fn unary_op(op: &str) -> Option<UnaryOperator> {
    Some(match op {
        "-" => UnaryOperator::UnaryNegation,
        "+" => UnaryOperator::UnaryPlus,
        "!" => UnaryOperator::LogicalNot,
        "~" => UnaryOperator::BitwiseNot,
        "typeof" => UnaryOperator::Typeof,
        "void" => UnaryOperator::Void,
        "delete" => UnaryOperator::Delete,
        _ => return None,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ast::js::Expression as RsExpression;
    use crate::compiler::phases::phase1_parse::read::expression::{
        ProgramParseParams, parse_program_with_error,
    };

    /// Parse `src` as a JS program with rsvelte's own parser, returning the
    /// `JsNode::Program` and the arena that owns its children.
    fn parse(src: &str) -> (ParseArena, JsNode) {
        use crate::compiler::phases::phase1_parse::compute_line_offsets;
        let arena = ParseArena::new();
        let line_offsets = compute_line_offsets(src, false);
        // Install the serialize arena for the whole parse: when statement
        // children are resolved via `to_value()` during parsing they need the
        // arena pointer set, mirroring `parse_module_to_estree`.
        let node = crate::ast::arena::with_serialize_arena(&arena, || {
            let (expr, err) = parse_program_with_error(
                &arena,
                ProgramParseParams {
                    content: src,
                    offset: 0,
                    line_offsets: &line_offsets,
                    is_typescript: false,
                    leading_comments: &[],
                    script_tag_start: 0,
                    script_tag_end: src.len(),
                },
            );
            assert!(err.is_none(), "parse error for {src:?}: {err:?}");
            match expr {
                RsExpression::Typed(te) => te.node,
                _ => panic!("expected typed program for {src:?}"),
            }
        });
        (arena, node)
    }

    /// Round-trip: parse `src`, convert the program to oxc, esrap-print it, and
    /// return the printed (trimmed) source. Panics if conversion bails.
    fn roundtrip(src: &str) -> String {
        let (arena, program) = parse(src);
        let allocator = Allocator::default();
        let oxc_program = jsnode_to_oxc_program(&program, &arena, &allocator)
            .unwrap_or_else(|| panic!("conversion bailed for {src:?}"));
        rsvelte_esrap::print(&oxc_program, "").trim().to_string()
    }

    /// Assert the round-trip output exactly equals `expected`.
    fn assert_rt(src: &str, expected: &str) {
        assert_eq!(roundtrip(src), expected, "round-trip mismatch for {src:?}");
    }

    #[test]
    fn identifier_and_member() {
        assert_rt("foo;", "foo;");
        assert_rt("a.b.c;", "a.b.c;");
        assert_rt("a[b];", "a[b];");
    }

    #[test]
    fn call_and_new() {
        assert_rt("f(a, b);", "f(a, b);");
        assert_rt("new Foo(1, 2);", "new Foo(1, 2);");
        assert_rt("f(...args);", "f(...args);");
    }

    #[test]
    fn binary_logical_conditional() {
        assert_rt("a + b * c;", "a + b * c;");
        assert_rt("a && b || c;", "a && b || c;");
        assert_rt("a ?? b;", "a ?? b;");
        assert_rt("a ? b : c;", "a ? b : c;");
        assert_rt("a === b;", "a === b;");
    }

    #[test]
    fn unary_and_update() {
        assert_rt("!a;", "!a;");
        assert_rt("typeof a;", "typeof a;");
        assert_rt("-a;", "-a;");
        assert_rt("i++;", "i++;");
        assert_rt("--i;", "--i;");
    }

    #[test]
    fn literals() {
        // A leading string-literal statement is a directive prologue (no body
        // node), so test the string literal in a non-directive position.
        assert_rt("let s = \"hello\";", "let s = \"hello\";");
        assert_rt("42;", "42;");
        assert_rt("1.5;", "1.5;");
        assert_rt("true;", "true;");
        assert_rt("null;", "null;");
        assert_rt("/ab+c/gi;", "/ab+c/gi;");
    }

    #[test]
    fn arrow_function() {
        // Expression-bodied arrows are typed and convert faithfully.
        assert_rt("(a, b) => a + b;", "(a, b) => a + b;");
        assert_rt("async (x) => x;", "async (x) => x;");
        // Block-bodied arrows are now typed in the parse-phase `_for_program`
        // IR and round-trip faithfully.
        assert_rt("() => { return 1; };", "() => {\n\treturn 1;\n};");
    }

    #[test]
    fn function_declaration_and_expression_convert() {
        // A top-level `FunctionDeclaration` is fully typed in the IR.
        assert_rt(
            "function add(a, b) { return a + b; }",
            "function add(a, b) {\n\treturn a + b;\n}",
        );
        // A `FunctionExpression` initializer is now typed and round-trips.
        assert_rt(
            "const f = function* () { yield 1; };",
            "const f = function* () {\n\tyield 1;\n};",
        );
    }

    #[test]
    fn object_property_shapes() {
        assert_rt("({ a: 1, b });", "({ a: 1, b });");
        assert_rt("({ ...rest });", "({ ...rest });");
        assert_rt("({ [k]: v });", "({ [k]: v });");
        // Getter / method values are now typed and round-trip faithfully.
        assert_rt(
            "({ get x() { return 1; } });",
            "({\n\tget x() {\n\t\treturn 1;\n\t}\n});",
        );
        assert_rt(
            "({ m() { return 2; } });",
            "({\n\tm() {\n\t\treturn 2;\n\t}\n});",
        );
    }

    #[test]
    fn template_literal() {
        assert_rt("`a${x}b`;", "`a${x}b`;");
        assert_rt("tag`hi ${name}`;", "tag`hi ${name}`;");
    }

    #[test]
    fn variable_declarations() {
        assert_rt("let x = 1;", "let x = 1;");
        assert_rt("const a = 1, b = 2;", "const a = 1, b = 2;");
        assert_rt("var y;", "var y;");
    }

    #[test]
    fn if_for_while() {
        assert_rt(
            "if (a) { b(); } else { c(); }",
            "if (a) {\n\tb();\n} else {\n\tc();\n}",
        );
        assert_rt(
            "for (let i = 0; i < 10; i++) { f(i); }",
            "for (let i = 0; i < 10; i++) {\n\tf(i);\n}",
        );
        assert_rt("while (a) { b(); }", "while (a) {\n\tb();\n}");
    }

    #[test]
    fn destructuring_declaration() {
        assert_rt("const { a, b } = obj;", "const { a, b } = obj;");
        assert_rt("const [x, y] = arr;", "const [x, y] = arr;");
        assert_rt("const { a, ...rest } = obj;", "const { a, ...rest } = obj;");
        assert_rt("const { a = 1 } = obj;", "const { a = 1 } = obj;");
    }

    #[test]
    fn assignments_and_destructuring_targets() {
        assert_rt("a = b;", "a = b;");
        assert_rt("a += 1;", "a += 1;");
        assert_rt("a.b = c;", "a.b = c;");
        // Destructuring assignment targets (`[a]=` / `{a}=`) are now typed in
        // the parse IR and round-trip faithfully.
        assert_rt("[a, b] = c;", "[a, b] = c;");
        assert_rt("({ a, b } = c);", "({ a, b } = c);");
    }

    #[test]
    fn control_flow_statements() {
        // esrap prints `catch(e)` with no space before the parameter list.
        assert_rt(
            "try { a(); } catch (e) { b(); } finally { c(); }",
            "try {\n\ta();\n} catch(e) {\n\tb();\n} finally {\n\tc();\n}",
        );
        assert_rt(
            "switch (x) { case 1: a(); break; default: b(); }",
            "switch (x) {\n\tcase 1:\n\t\ta();\n\t\tbreak;\n\n\tdefault:\n\t\tb();\n}",
        );
        assert_rt(
            "for (const x of xs) { f(x); }",
            "for (const x of xs) {\n\tf(x);\n}",
        );
        assert_rt(
            "for (const k in o) { f(k); }",
            "for (const k in o) {\n\tf(k);\n}",
        );
    }

    #[test]
    fn imports_and_exports() {
        assert_rt(
            "import { a, b as c } from 'mod';",
            "import { a, b as c } from 'mod';",
        );
        assert_rt("import Foo from 'mod';", "import Foo from 'mod';");
        assert_rt("import * as ns from 'mod';", "import * as ns from 'mod';");
        // `export` declarations are now typed in the parse IR and round-trip.
        assert_rt("export const x = 1;", "export const x = 1;");
    }

    #[test]
    fn await_chain_and_spread() {
        assert_rt("async () => await f();", "async () => await f();");
        assert_rt("a?.b;", "a?.b;");
        assert_rt("a?.b();", "a?.b();");
        assert_rt("[...a, b];", "[...a, b];");
    }

    #[test]
    fn typed_formerly_raw_nodes() {
        // Block-bodied arrows, IIFEs, and destructuring assignment targets are
        // now typed in the parse IR and round-trip faithfully (previously these
        // were opaque `JsNode::Raw` and the converter bailed).
        assert_rt("() => { f(); };", "() => {\n\tf();\n};");
        assert_rt("(function () {})();", "(function () {})();");
        assert_rt("[a] = b;", "[a] = b;");
    }

    #[test]
    fn single_expr_entry_point() {
        let (arena, program) = parse("a + b;");
        // Drill into the ExpressionStatement to grab the inner expression node.
        let JsNode::Program { body, .. } = &program else {
            panic!("expected program");
        };
        let stmts = arena.get_js_children(*body);
        let JsNode::ExpressionStatement { expression, .. } = &stmts[0] else {
            panic!("expected expression statement");
        };
        let expr_node = arena.get_js_node(*expression);
        let allocator = Allocator::default();
        let oxc_expr = jsnode_to_oxc_expr(expr_node, &arena, &allocator).expect("convert expr");
        // Wrap in a trivial program to print it.
        let ab = AstBuilder::new(&allocator);
        let stmt = Statement::ExpressionStatement(ExpressionStatement::boxed(SPAN, oxc_expr, &ab));
        let program = Program::new(
            SPAN,
            oxc_span::SourceType::mjs(),
            "",
            ArenaVec::new_in(&ab),
            None,
            ArenaVec::new_in(&ab),
            ArenaVec::from_value_in(stmt, &ab),
            &ab,
        );
        assert_eq!(rsvelte_esrap::print(&program, "").trim(), "a + b;");
    }
}
