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
//! faithfully reproduced — in particular [`JsNode::Raw`] (opaque JSON the
//! structural esrap printer cannot reconstruct), [`JsNode::Null`], BigInt
//! literals (parsed as `Raw`), TypeScript-only nodes, decorators, and static
//! blocks.
//!
//! All construction patterns are lifted verbatim from the proven
//! `js_ast::to_oxc` converter (variant-complete against oxc 0.136), so the
//! nodes produced print byte-identically through esrap. All spans are the
//! dummy [`oxc_span::SPAN`]: esrap formats structurally.

use crate::ast::arena::{IdRange, JsNodeId, ParseArena};
use crate::ast::typed_expr::{JsNode, LiteralValue};
use oxc_allocator::{Allocator, Vec as ArenaVec};
use oxc_ast::AstBuilder;
use oxc_ast::ast::{
    Argument, ArrayExpressionElement, ChainElement, Expression, ForStatementInit, ForStatementLeft,
    FormalParameterKind, FunctionType, ImportOrExportKind, ObjectPropertyKind, PropertyKey,
    PropertyKind, RegExp, RegExpFlags, RegExpPattern, Statement, VariableDeclarationKind,
};
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
    Some(cx.ab.program(
        SPAN,
        oxc_span::SourceType::mjs(),
        "",
        cx.ab.vec(),
        None,
        cx.ab.vec(),
        stmts,
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
    let body = cx.ab.vec_from_iter(body);
    Some(cx.ab.program(
        SPAN,
        oxc_span::SourceType::mjs(),
        "",
        cx.ab.vec(),
        None,
        cx.ab.vec(),
        body,
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
                Some(self.ab.statement_expression(SPAN, expr))
            }
            JsNode::ReturnStatement { argument, .. } => {
                let arg = match argument {
                    Some(id) => Some(self.expr_id(*id)?),
                    None => None,
                };
                Some(self.ab.statement_return(SPAN, arg))
            }
            JsNode::VariableDeclaration { .. } => {
                let decl = self.variable_declaration_node(node)?;
                Some(Statement::VariableDeclaration(decl))
            }
            JsNode::BlockStatement { body, .. } => {
                let stmts = self.statements(*body)?;
                Some(self.ab.statement_block(SPAN, stmts))
            }
            JsNode::EmptyStatement { .. } => Some(self.ab.statement_empty(SPAN)),
            JsNode::DebuggerStatement { .. } => Some(self.ab.statement_debugger(SPAN)),
            JsNode::ThrowStatement { argument, .. } => {
                let arg = self.expr_id(*argument)?;
                Some(self.ab.statement_throw(SPAN, arg))
            }
            JsNode::BreakStatement { label, .. } => {
                let label = self.opt_label(label)?;
                Some(self.ab.statement_break(SPAN, label))
            }
            JsNode::ContinueStatement { label, .. } => {
                let label = self.opt_label(label)?;
                Some(self.ab.statement_continue(SPAN, label))
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
                Some(self.ab.statement_if(SPAN, test, consequent, alternate))
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
                Some(self.ab.statement_while(SPAN, test, body))
            }
            JsNode::DoWhileStatement { test, body, .. } => {
                let body = self.stmt_id(*body)?;
                let test = self.expr_id(*test)?;
                Some(self.ab.statement_do_while(SPAN, body, test))
            }
            JsNode::SwitchStatement { .. } => self.switch_statement(node),
            JsNode::LabeledStatement { label, body, .. } => {
                let name = self.identifier_name_of(*label)?;
                let label = self.ab.label_identifier(SPAN, self.str(&name));
                let body = self.stmt_id(*body)?;
                Some(self.ab.statement_labeled(SPAN, label, body))
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
                Some(Some(self.ab.label_identifier(SPAN, self.str(&name))))
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
        Some(self.ab.statement_for(SPAN, init, test, update, body))
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
            Some(self.ab.statement_for_in(SPAN, left, right, body))
        } else {
            Some(self.ab.statement_for_of(SPAN, is_await, left, right, body))
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
        let mut out = self.ab.vec_with_capacity(case_nodes.len());
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
            out.push(self.ab.switch_case(SPAN, test, consequent));
        }
        Some(self.ab.statement_switch(SPAN, discriminant, out))
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
                        Some(self.ab.catch_parameter(SPAN, pattern, oxc_ast::NONE))
                    }
                };
                let body = self.block_statement_box(*body)?;
                Some(self.ab.catch_clause(SPAN, catch_param, body))
            }
        };

        let finalizer = match finalizer {
            None => None,
            Some(id) => Some(self.block_statement_box(*id)?),
        };

        Some(self.ab.statement_try(SPAN, block, handler, finalizer))
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
        Some(self.ab.alloc_block_statement(SPAN, stmts))
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
        Some(
            self.ab
                .string_literal(SPAN, self.str(s), Some(self.str(raw).into())),
        )
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
            let mut specs = self.ab.vec_with_capacity(spec_nodes.len());
            for spec in spec_nodes {
                match spec {
                    JsNode::ImportDefaultSpecifier { local, .. } => {
                        let name = self.identifier_name_of(*local)?;
                        let local = self.ab.binding_identifier(SPAN, self.str(&name));
                        specs.push(
                            self.ab
                                .import_declaration_specifier_import_default_specifier(SPAN, local),
                        );
                    }
                    JsNode::ImportNamespaceSpecifier { local, .. } => {
                        let name = self.identifier_name_of(*local)?;
                        let local = self.ab.binding_identifier(SPAN, self.str(&name));
                        specs.push(
                            self.ab
                                .import_declaration_specifier_import_namespace_specifier(
                                    SPAN, local,
                                ),
                        );
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
                        let local = self.ab.binding_identifier(SPAN, self.str(&local_name));
                        specs.push(self.ab.import_declaration_specifier_import_specifier(
                            SPAN,
                            imported,
                            local,
                            ImportOrExportKind::Value,
                        ));
                    }
                    _ => return None,
                }
            }
            Some(specs)
        };

        let source = self.module_source_node(*source)?;
        let decl = self.ab.module_declaration_import_declaration(
            SPAN,
            specifiers,
            source,
            None,
            oxc_ast::NONE,
            ImportOrExportKind::Value,
        );
        Some(Statement::from(decl))
    }

    /// Build a `ModuleExportName` from an `Identifier` (or string-literal)
    /// imported/exported name node.
    fn module_export_name(&self, id: JsNodeId) -> Option<oxc_ast::ast::ModuleExportName<'a>> {
        match self.arena.get_js_node(id) {
            JsNode::Identifier { name, .. } => Some(
                self.ab
                    .module_export_name_identifier_name(SPAN, self.str(name)),
            ),
            JsNode::Literal {
                value: LiteralValue::String(s),
                ..
            } => {
                let lit = self.ab.string_literal(SPAN, self.str(s), None);
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
            (Some(declaration), self.ab.vec())
        } else {
            let spec_nodes = self.arena.get_js_children(*specifiers);
            let mut out = self.ab.vec_with_capacity(spec_nodes.len());
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
                out.push(self.ab.export_specifier(
                    SPAN,
                    local,
                    exported,
                    ImportOrExportKind::Value,
                ));
            }
            (None, out)
        };

        let decl = self.ab.module_declaration_export_named_declaration(
            SPAN,
            declaration,
            specs,
            None,
            ImportOrExportKind::Value,
            oxc_ast::NONE,
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
        let decl = self
            .ab
            .module_declaration_export_default_declaration(SPAN, kind);
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
        let body = self.ab.function_body(SPAN, self.ab.vec(), stmts);
        Some(self.ab.alloc_function(
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
        ))
    }

    /// Build a `BindingIdentifier` from an `Identifier` node behind `id`.
    fn binding_identifier_of(&self, id: JsNodeId) -> Option<oxc_ast::ast::BindingIdentifier<'a>> {
        let name = self.identifier_name_of(id)?;
        Some(self.ab.binding_identifier(SPAN, self.str(&name)))
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
        Some(self.ab.vec_from_iter(v))
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
        let mut declarators = self.ab.vec_with_capacity(decl_nodes.len());
        for d in decl_nodes {
            let JsNode::VariableDeclarator { id, init, .. } = d else {
                return None;
            };
            let binding = self.binding_pattern(self.arena.get_js_node(*id))?;
            let init = match init {
                Some(id) => Some(self.expr_id(*id)?),
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
        Some(
            self.ab
                .alloc_variable_declaration(SPAN, kind, declarators, false),
        )
    }

    // -- binding patterns ---------------------------------------------------

    /// Build an oxc `BindingPattern` from a pattern node, recursing into
    /// object / array / assignment / rest sub-patterns. Bails on a non-last
    /// rest, a computed object-pattern key we cannot reconstruct, or any nested
    /// pattern that itself bails.
    fn binding_pattern(&self, pat: &JsNode) -> Option<oxc_ast::ast::BindingPattern<'a>> {
        match pat {
            JsNode::Identifier { name, .. } => Some(
                self.ab
                    .binding_pattern_binding_identifier(SPAN, self.str(name)),
            ),
            JsNode::ObjectPattern { properties, .. } => {
                let prop_nodes = self.arena.get_js_children(*properties);
                let mut props = self.ab.vec_with_capacity(prop_nodes.len());
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
                            props.push(
                                self.ab
                                    .binding_property(SPAN, key, value, *shorthand, *computed),
                            );
                        }
                        JsNode::RestElement { argument, .. } => {
                            if i != last {
                                return None;
                            }
                            let inner = self.binding_pattern(self.arena.get_js_node(*argument))?;
                            rest = Some(self.ab.alloc_binding_rest_element(SPAN, inner));
                        }
                        _ => return None,
                    }
                }
                Some(self.ab.binding_pattern_object_pattern(SPAN, props, rest))
            }
            JsNode::ArrayPattern { elements, .. } => {
                let mut out = self.ab.vec_with_capacity(elements.len());
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
                            rest = Some(self.ab.alloc_binding_rest_element(SPAN, inner));
                        }
                        Some(el) => out.push(Some(self.binding_pattern(el)?)),
                    }
                }
                Some(self.ab.binding_pattern_array_pattern(SPAN, out, rest))
            }
            JsNode::AssignmentPattern { left, right, .. } => {
                let left = self.binding_pattern(self.arena.get_js_node(*left))?;
                let right = self.expr_id(*right)?;
                Some(
                    self.ab
                        .binding_pattern_assignment_pattern(SPAN, left, right),
                )
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
                Some(self.ab.expression_identifier(SPAN, self.str(name)))
            }
            JsNode::Literal { .. } => self.literal(node),
            JsNode::ThisExpression { .. } => Some(self.ab.expression_this(SPAN)),
            JsNode::Super { .. } => Some(Expression::Super(self.ab.alloc_super(SPAN))),
            JsNode::MetaProperty { meta, property, .. } => {
                let meta = self.identifier_name_of(*meta)?;
                let property = self.identifier_name_of(*property)?;
                let meta = self.ab.identifier_name(SPAN, self.str(&meta));
                let property = self.ab.identifier_name(SPAN, self.str(&property));
                Some(self.ab.expression_meta_property(SPAN, meta, property))
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
                Some(
                    self.ab
                        .expression_call(SPAN, callee, oxc_ast::NONE, args, *optional),
                )
            }
            JsNode::NewExpression {
                callee, arguments, ..
            } => {
                let callee = self.expr_id(*callee)?;
                let args = self.arguments(*arguments)?;
                Some(self.ab.expression_new(SPAN, callee, oxc_ast::NONE, args))
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
                Some(self.ab.expression_binary(SPAN, left, op, right))
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
                Some(self.ab.expression_logical(SPAN, left, op, right))
            }
            JsNode::UnaryExpression {
                operator, argument, ..
            } => {
                let op = unary_op(operator)?;
                let arg = self.expr_id(*argument)?;
                Some(self.ab.expression_unary(SPAN, op, arg))
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
                Some(
                    self.ab
                        .expression_conditional(SPAN, test, consequent, alternate),
                )
            }
            JsNode::SequenceExpression { expressions, .. } => {
                let nodes = self.arena.get_js_children(*expressions);
                let mut exprs = self.ab.vec_with_capacity(nodes.len());
                for e in nodes {
                    exprs.push(self.expr(e)?);
                }
                Some(self.ab.expression_sequence(SPAN, exprs))
            }
            JsNode::ArrayExpression { elements, .. } => {
                let mut out = self.ab.vec_with_capacity(elements.len());
                for el in elements {
                    let element = match el {
                        None => self.ab.array_expression_element_elision(SPAN),
                        Some(JsNode::SpreadElement { argument, .. }) => {
                            let inner = self.expr_id(*argument)?;
                            ArrayExpressionElement::SpreadElement(
                                self.ab.alloc_spread_element(SPAN, inner),
                            )
                        }
                        Some(e) => ArrayExpressionElement::from(self.expr(e)?),
                    };
                    out.push(element);
                }
                Some(self.ab.expression_array(SPAN, out))
            }
            JsNode::ObjectExpression { .. } => self.object(node),
            JsNode::AwaitExpression { argument, .. } => {
                let arg = self.expr_id(*argument)?;
                Some(self.ab.expression_await(SPAN, arg))
            }
            JsNode::ArrowFunctionExpression { .. } => self.arrow(node),
            JsNode::FunctionExpression { .. } => {
                let func = self.build_function(node, FunctionType::FunctionExpression)?;
                Some(Expression::FunctionExpression(func))
            }
            JsNode::TemplateLiteral { .. } => {
                let tpl = self.template_literal(node)?;
                Some(Expression::TemplateLiteral(self.ab.alloc(tpl)))
            }
            JsNode::TaggedTemplateExpression { tag, quasi, .. } => {
                let tag = self.expr_id(*tag)?;
                let quasi = self.template_literal(self.arena.get_js_node(*quasi))?;
                Some(
                    self.ab
                        .expression_tagged_template(SPAN, tag, oxc_ast::NONE, quasi),
                )
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
                Some(self.ab.expression_assignment(SPAN, op, left, right))
            }
            JsNode::UpdateExpression {
                operator,
                prefix,
                argument,
                ..
            } => {
                let op = update_op(operator)?;
                let target = self.simple_assignment_target(self.arena.get_js_node(*argument))?;
                Some(self.ab.expression_update(SPAN, op, *prefix, target))
            }
            JsNode::ChainExpression { expression, .. } => self.chain(*expression),
            JsNode::ImportExpression { source, .. } => {
                let source = self.expr_id(*source)?;
                Some(self.ab.expression_import(SPAN, source, None, None))
            }
            JsNode::YieldExpression {
                delegate, argument, ..
            } => {
                let argument = match argument {
                    Some(id) => Some(self.expr_id(*id)?),
                    None => None,
                };
                Some(self.ab.expression_yield(SPAN, *delegate, argument))
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
            return Some(self.ab.expression_reg_exp_literal(
                SPAN,
                regexp,
                Some(self.str(raw).into()),
            ));
        }

        match value {
            LiteralValue::String(s) => Some(self.ab.expression_string_literal(
                SPAN,
                self.str(s),
                Some(self.str(raw).into()),
            )),
            LiteralValue::Number(n) => Some(self.ab.expression_numeric_literal(
                SPAN,
                *n,
                Some(self.str(raw).into()),
                NumberBase::Decimal,
            )),
            LiteralValue::Bool(b) => Some(self.ab.expression_boolean_literal(SPAN, *b)),
            LiteralValue::Null => Some(self.ab.expression_null_literal(SPAN)),
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
            self.ab
                .member_expression_computed(SPAN, object, property, *optional)
        } else {
            match prop_node {
                JsNode::Identifier { name, .. } => {
                    let property = self.ab.identifier_name(SPAN, self.str(name));
                    self.ab
                        .member_expression_static(SPAN, object, property, *optional)
                }
                JsNode::PrivateIdentifier { name, .. } => {
                    // The IR stores the bare name (no leading `#`); esrap adds
                    // the `#`, so pass the name verbatim.
                    let field = self.ab.private_identifier(SPAN, self.str(name));
                    self.ab
                        .member_expression_private_field_expression(SPAN, object, field, *optional)
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
        let mut quasis_out = self.ab.vec_with_capacity(quasi_nodes.len());
        for q in quasi_nodes {
            let JsNode::TemplateElement { tail, value, .. } = q else {
                return None;
            };
            let val = oxc_ast::ast::TemplateElementValue {
                raw: self.str(&value.raw).into(),
                cooked: value.cooked.as_ref().map(|c| self.str(c).into()),
            };
            quasis_out.push(self.ab.template_element(SPAN, val, *tail));
        }
        let expr_nodes = self.arena.get_js_children(*expressions);
        let mut exprs = self.ab.vec_with_capacity(expr_nodes.len());
        for e in expr_nodes {
            exprs.push(self.expr(e)?);
        }
        Some(self.ab.template_literal(SPAN, quasis_out, exprs))
    }

    /// Build a `SimpleAssignmentTarget` from an identifier / simple member node.
    fn simple_assignment_target(
        &self,
        node: &JsNode,
    ) -> Option<oxc_ast::ast::SimpleAssignmentTarget<'a>> {
        match node {
            JsNode::Identifier { name, .. } => Some(
                self.ab
                    .simple_assignment_target_assignment_target_identifier(SPAN, self.str(name)),
            ),
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
        let mut out = self.ab.vec_with_capacity(len);
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
                    rest = Some(self.ab.alloc_assignment_target_rest(SPAN, target));
                }
                Some(e) => out.push(Some(self.assignment_target_maybe_default(e)?)),
            }
        }
        let array = self.ab.alloc_array_assignment_target(SPAN, out, rest);
        Some(oxc_ast::ast::AssignmentTarget::ArrayAssignmentTarget(array))
    }

    fn object_assignment_target(
        &self,
        members: &[JsNode],
    ) -> Option<oxc_ast::ast::AssignmentTarget<'a>> {
        let mut props = self.ab.vec_with_capacity(members.len());
        let mut rest = None;
        let last = members.len().saturating_sub(1);
        for (i, member) in members.iter().enumerate() {
            match member {
                JsNode::SpreadElement { argument, .. } | JsNode::RestElement { argument, .. } => {
                    if i != last {
                        return None;
                    }
                    let target = self.assignment_target(self.arena.get_js_node(*argument))?;
                    rest = Some(self.ab.alloc_assignment_target_rest(SPAN, target));
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
        let object = self.ab.alloc_object_assignment_target(SPAN, props, rest);
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
                self.ab
                    .assignment_target_maybe_default_assignment_target_with_default(
                        SPAN, binding, init,
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
                self.ab
                    .assignment_target_maybe_default_assignment_target_with_default(
                        SPAN, binding, init,
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
            let binding = self.ab.identifier_reference(SPAN, self.str(&name));
            return Some(
                oxc_ast::ast::AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(
                    self.ab
                        .alloc_assignment_target_property_identifier(SPAN, binding, init),
                ),
            );
        }

        let key = self.binding_property_key(key, computed)?;
        let binding = self.assignment_target_maybe_default(self.arena.get_js_node(value))?;
        Some(
            oxc_ast::ast::AssignmentTargetProperty::AssignmentTargetPropertyProperty(
                self.ab
                    .alloc_assignment_target_property_property(SPAN, key, binding, computed),
            ),
        )
    }

    fn object(&self, node: &JsNode) -> Option<Expression<'a>> {
        let JsNode::ObjectExpression { properties, .. } = node else {
            return None;
        };
        let prop_nodes = self.arena.get_js_children(*properties);
        let mut props = self.ab.vec_with_capacity(prop_nodes.len());
        for member in prop_nodes {
            match member {
                JsNode::SpreadElement { argument, .. } => {
                    let arg = self.expr_id(*argument)?;
                    props.push(ObjectPropertyKind::SpreadProperty(
                        self.ab.alloc_spread_element(SPAN, arg),
                    ));
                }
                JsNode::Property { .. } => {
                    let prop = self.object_property(member)?;
                    props.push(ObjectPropertyKind::ObjectProperty(prop));
                }
                _ => return None,
            }
        }
        Some(self.ab.expression_object(SPAN, props))
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
        Some(
            self.ab
                .alloc_object_property(SPAN, prop_kind, key, value, method, *shorthand, *computed),
        )
    }

    /// Build a non-computed `PropertyKey` from an identifier / literal node.
    fn property_key(&self, node: &JsNode) -> Option<PropertyKey<'a>> {
        match node {
            JsNode::Identifier { name, .. } => {
                Some(self.ab.property_key_static_identifier(SPAN, self.str(name)))
            }
            JsNode::PrivateIdentifier { name, .. } => {
                let field = self.ab.private_identifier(SPAN, self.str(name));
                Some(PropertyKey::PrivateIdentifier(self.ab.alloc(field)))
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
            let stmt = self.ab.statement_expression(SPAN, expr);
            let stmts = self.ab.vec1(stmt);
            (true, self.ab.function_body(SPAN, self.ab.vec(), stmts))
        } else {
            let JsNode::BlockStatement { body, .. } = body_node else {
                return None;
            };
            let stmts = self.statements(*body)?;
            (false, self.ab.function_body(SPAN, self.ab.vec(), stmts))
        };
        Some(self.ab.expression_arrow_function(
            SPAN,
            is_expr,
            *r#async,
            oxc_ast::NONE,
            params,
            oxc_ast::NONE,
            fn_body,
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
                    self.ab
                        .alloc_call_expression(SPAN, callee, oxc_ast::NONE, args, *optional);
                ChainElement::CallExpression(call)
            }
            _ => return None,
        };
        Some(self.ab.expression_chain(SPAN, element))
    }

    /// Convert function parameters (a child range of pattern nodes), handling a
    /// trailing `...rest`. Bails on a non-last rest or any unhandled pattern.
    fn formal_params(&self, params: IdRange) -> Option<oxc_ast::ast::FormalParameters<'a>> {
        let nodes = self.arena.get_js_children(params);
        let mut items = self.ab.vec_with_capacity(nodes.len());
        let mut rest = None;
        let last = nodes.len().saturating_sub(1);
        for (i, p) in nodes.iter().enumerate() {
            if let JsNode::RestElement { argument, .. } = p {
                if i != last {
                    return None;
                }
                let pattern = self.binding_pattern(self.arena.get_js_node(*argument))?;
                let rest_el = self.ab.binding_rest_element(SPAN, pattern);
                rest = Some(self.ab.alloc_formal_parameter_rest(
                    SPAN,
                    self.ab.vec(),
                    rest_el,
                    oxc_ast::NONE,
                ));
                continue;
            }
            let pattern = self.binding_pattern(p)?;
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
            rest,
        ))
    }

    /// Convert call / new arguments (a child range), supporting spreads.
    fn arguments(&self, args: IdRange) -> Option<ArenaVec<'a, Argument<'a>>> {
        let nodes = self.arena.get_js_children(args);
        let mut out = self.ab.vec_with_capacity(nodes.len());
        for arg in nodes {
            let argument = match arg {
                JsNode::SpreadElement { argument, .. } => {
                    let inner = self.expr_id(*argument)?;
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
    use crate::compiler::phases::phase1_parse::read::expression::parse_program_with_error;

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
            let (expr, err) =
                parse_program_with_error(&arena, src, 0, &line_offsets, false, &[], 0, src.len());
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
        let stmt = ab.statement_expression(SPAN, oxc_expr);
        let program = ab.program(
            SPAN,
            oxc_span::SourceType::mjs(),
            "",
            ab.vec(),
            None,
            ab.vec(),
            ab.vec1(stmt),
        );
        assert_eq!(rsvelte_esrap::print(&program, "").trim(), "a + b;");
    }
}
