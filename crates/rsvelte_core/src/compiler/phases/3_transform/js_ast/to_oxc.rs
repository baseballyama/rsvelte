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
use oxc_allocator::{ArenaBox, ArenaVec};
use oxc_ast::AstBuilder;
use oxc_ast::ast::*;
use oxc_span::{GetSpanMut, SPAN, Span};
use oxc_syntax::number::{BigintBase, NumberBase};
use oxc_syntax::operator::{
    AssignmentOperator, BinaryOperator, LogicalOperator, UnaryOperator, UpdateOperator,
};

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

    // Collect, flattening multi-statement `Raw` blobs inline. A single None
    // (parse failure / unhandled node) bails the whole program.
    let mut body: Vec<Statement<'a>> = Vec::with_capacity(program.body.len());
    for s in &program.body {
        body.extend(cx.expand_stmt(s)?);
    }

    let body = ArenaVec::from_iter_in(body, &ab);
    Some(Program::new(
        SPAN,
        oxc_span::SourceType::mjs(),
        "",
        ArenaVec::new_in(&ab),
        None,
        ArenaVec::new_in(&ab),
        body,
        &ab,
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
                Some(Statement::ExpressionStatement(ExpressionStatement::boxed(
                    SPAN, expr, &self.ab,
                )))
            }
            JsStatement::Return(r) => {
                let arg = match r.argument {
                    Some(id) => Some(self.expr_id(id)?),
                    None => None,
                };
                Some(Statement::ReturnStatement(ReturnStatement::boxed(
                    SPAN, arg, &self.ab,
                )))
            }
            JsStatement::VariableDeclaration(decl) => self.variable_declaration(decl),
            JsStatement::Block(b) => {
                let stmts = self.statements(&b.body)?;
                Some(Statement::BlockStatement(BlockStatement::boxed(
                    SPAN, stmts, &self.ab,
                )))
            }
            JsStatement::Empty => Some(Statement::EmptyStatement(EmptyStatement::boxed(
                SPAN, &self.ab,
            ))),
            JsStatement::Debugger => Some(Statement::DebuggerStatement(DebuggerStatement::boxed(
                SPAN, &self.ab,
            ))),
            JsStatement::Throw(id) => {
                let arg = self.expr_id(*id)?;
                Some(Statement::ThrowStatement(ThrowStatement::boxed(
                    SPAN, arg, &self.ab,
                )))
            }
            JsStatement::Break(label) => {
                let label = self.label(label.as_deref());
                Some(Statement::BreakStatement(BreakStatement::boxed(
                    SPAN, label, &self.ab,
                )))
            }
            JsStatement::Continue(label) => {
                let label = self.label(label.as_deref());
                Some(Statement::ContinueStatement(ContinueStatement::boxed(
                    SPAN, label, &self.ab,
                )))
            }
            JsStatement::If(if_stmt) => {
                let test = self.expr_id(if_stmt.test)?;
                let consequent = self.stmt(self.arena.get_stmt(if_stmt.consequent))?;
                let alternate = match if_stmt.alternate {
                    Some(id) => Some(self.stmt(self.arena.get_stmt(id))?),
                    None => None,
                };
                Some(Statement::IfStatement(IfStatement::boxed(
                    SPAN, test, consequent, alternate, &self.ab,
                )))
            }
            JsStatement::Import(import) => self.import_declaration(import),
            JsStatement::ExportNamed(export) => self.export_named(export),
            JsStatement::ExportDefault(export) => self.export_default(export),
            JsStatement::FunctionDeclaration(func) => {
                let func = self.build_function(func, FunctionType::FunctionDeclaration)?;
                let decl = oxc_ast::ast::Declaration::FunctionDeclaration(func);
                Some(Statement::from(decl))
            }
            JsStatement::For(for_stmt) => self.for_statement(for_stmt),
            JsStatement::ForOf(for_of) => self.for_of_statement(for_of),
            JsStatement::While(w) => {
                let test = self.expr_id(w.test)?;
                let body = self.stmt(self.arena.get_stmt(w.body))?;
                Some(Statement::WhileStatement(WhileStatement::boxed(
                    SPAN, test, body, &self.ab,
                )))
            }
            JsStatement::DoWhile(d) => {
                let body = self.stmt(self.arena.get_stmt(d.body))?;
                let test = self.expr_id(d.test)?;
                Some(Statement::DoWhileStatement(DoWhileStatement::boxed(
                    SPAN, body, test, &self.ab,
                )))
            }
            JsStatement::Switch(s) => self.switch_statement(s),
            JsStatement::Labeled(l) => {
                let label = LabelIdentifier::new(SPAN, self.str(&l.label), &self.ab);
                let body = self.stmt(self.arena.get_stmt(l.body))?;
                Some(Statement::LabeledStatement(LabeledStatement::boxed(
                    SPAN, label, body, &self.ab,
                )))
            }
            JsStatement::Try(t) => self.try_statement(t),
            // `Raw`/`RawMapped` at a SINGLE-statement site (if / while / for
            // body): parse the text; a lone statement is returned directly, a
            // multi-statement blob is wrapped in a block. (Statement-LIST sites
            // use `expand_stmt` instead, which flattens inline.)
            JsStatement::Raw(code) => self.raw_single_statement(code),
            JsStatement::RawMapped { code, .. } => self.raw_single_statement(code),
        }
    }

    /// Convert a `Raw` statement at a single-statement position: one parsed
    /// statement is returned as-is; several are wrapped in a `{ … }` block.
    fn raw_single_statement(&self, code: &str) -> Option<Statement<'a>> {
        let stmts = self.parse_raw_statements(code)?;
        if stmts.len() == 1 {
            stmts.into_iter().next()
        } else {
            Some(Statement::BlockStatement(BlockStatement::boxed(
                SPAN,
                ArenaVec::from_iter_in(stmts, &self.ab),
                &self.ab,
            )))
        }
    }

    /// Build a `for (init; test; update) body` statement. Bails on init forms
    /// that cannot be faithfully mapped (e.g. destructuring var-decl bindings).
    fn for_statement(&self, for_stmt: &JsForStatement) -> Option<Statement<'a>> {
        let init = match &for_stmt.init {
            None => None,
            Some(JsForInit::Variable(decl)) => {
                let var_decl = self.variable_declaration_node(decl)?;
                Some(ForStatementInit::VariableDeclaration(var_decl))
            }
            Some(JsForInit::Expression(id)) => {
                let expr = self.expr_id(*id)?;
                Some(ForStatementInit::from(expr))
            }
        };
        let test = match for_stmt.test {
            Some(id) => Some(self.expr_id(id)?),
            None => None,
        };
        let update = match for_stmt.update {
            Some(id) => Some(self.expr_id(id)?),
            None => None,
        };
        let body = self.stmt(self.arena.get_stmt(for_stmt.body))?;
        Some(Statement::ForStatement(ForStatement::boxed(
            SPAN, init, test, update, body, &self.ab,
        )))
    }

    /// Build a `for (left of right)` / `for await (left of right)` statement,
    /// or a `for (left in right)` statement when `is_for_in` is set. Bails on
    /// destructuring / complex left-hand sides.
    fn for_of_statement(&self, for_of: &JsForOfStatement) -> Option<Statement<'a>> {
        let left = match &for_of.left {
            JsForOfLeft::Variable(decl) => {
                let mut var_decl = self.variable_declaration_node(decl)?;
                // A `for (… in/of …)` binding cannot carry an initializer. The IR
                // declarator may hold a spurious `null` init (which the string
                // codegen drops in this position); strip it so we emit
                // `for (const k in obj)`, not `for (const k = null in obj)`.
                for d in var_decl.declarations.iter_mut() {
                    d.init = None;
                }
                ForStatementLeft::VariableDeclaration(var_decl)
            }
            JsForOfLeft::Pattern(pattern) => {
                // Only a plain identifier / simple member assignment target is
                // representable; reuse the assignment-target helper which bails
                // on anything else.
                let target = match pattern {
                    JsPattern::Identifier(name) => {
                        SimpleAssignmentTarget::new_assignment_target_identifier(
                            SPAN,
                            self.str(name),
                            &self.ab,
                        )
                    }
                    _ => return None,
                };
                let assignment_target = oxc_ast::ast::AssignmentTarget::from(target);
                ForStatementLeft::from(assignment_target)
            }
        };
        let right = self.expr_id(for_of.right)?;
        let body = self.stmt(self.arena.get_stmt(for_of.body))?;
        if for_of.is_for_in {
            // `for await (… in …)` is not valid syntax; bail if it appears.
            if for_of.is_await {
                return None;
            }
            Some(Statement::ForInStatement(ForInStatement::boxed(
                SPAN, left, right, body, &self.ab,
            )))
        } else {
            Some(Statement::ForOfStatement(ForOfStatement::boxed(
                SPAN,
                for_of.is_await,
                left,
                right,
                body,
                &self.ab,
            )))
        }
    }

    /// Build a `switch (disc) { case … }` statement.
    fn switch_statement(&self, s: &JsSwitchStatement) -> Option<Statement<'a>> {
        let discriminant = self.expr_id(s.discriminant)?;
        let mut cases = ArenaVec::with_capacity_in(s.cases.len(), &self.ab);
        for case in &s.cases {
            let test = match case.test {
                Some(id) => Some(self.expr_id(id)?),
                None => None,
            };
            let consequent = self.statements(&case.consequent)?;
            cases.push(SwitchCase::new(SPAN, test, consequent, &self.ab));
        }
        Some(Statement::SwitchStatement(SwitchStatement::boxed(
            SPAN,
            discriminant,
            cases,
            &self.ab,
        )))
    }

    /// Build a `try { } catch (e) { } finally { }` statement. Bails on a
    /// destructuring catch parameter.
    fn try_statement(&self, t: &JsTryStatement) -> Option<Statement<'a>> {
        let block_stmts = self.statements(&t.block.body)?;
        let block = BlockStatement::boxed(SPAN, block_stmts, &self.ab);

        let handler = match &t.handler {
            None => None,
            Some(catch) => {
                let param = match &catch.param {
                    None => None,
                    Some(pat) => {
                        let pattern = self.binding_pattern(pat)?;
                        Some(CatchParameter::new(SPAN, pattern, oxc_ast::NONE, &self.ab))
                    }
                };
                let body_stmts = self.statements(&catch.body.body)?;
                let body = BlockStatement::boxed(SPAN, body_stmts, &self.ab);
                Some(CatchClause::new(SPAN, param, body, &self.ab))
            }
        };

        let finalizer = match &t.finalizer {
            None => None,
            Some(block) => {
                let stmts = self.statements(&block.body)?;
                Some(BlockStatement::boxed(SPAN, stmts, &self.ab))
            }
        };

        Some(Statement::TryStatement(TryStatement::boxed(
            SPAN, block, handler, finalizer, &self.ab,
        )))
    }

    /// Build a module-source `StringLiteral`. Codegen emits the source verbatim
    /// between single quotes with **no escaping** (see `emit_import` /
    /// `emit_export_named`), so we set `raw` to the exact `'source'` spelling to
    /// make esrap reproduce it byte-for-byte regardless of quote options.
    fn module_source(&self, source: &str) -> oxc_ast::ast::StringLiteral<'a> {
        let raw = self.str(&format!("'{source}'"));
        StringLiteral::new(SPAN, self.str(source), Some(raw.into()), &self.ab)
    }

    /// Build a `ModuleExportName::IdentifierName` from a plain name.
    fn module_export_name(&self, name: &str) -> oxc_ast::ast::ModuleExportName<'a> {
        ModuleExportName::new_identifier_name(SPAN, self.str(name), &self.ab)
    }

    fn import_declaration(&self, import: &JsImportDeclaration) -> Option<Statement<'a>> {
        // A bare side-effect import (`import 'x'`) has no specifiers section.
        // Codegen treats the specifier list as empty when it is empty OR its
        // first entry is `SideEffect`; mirror that to decide `None` vs `Some`.
        let has_specifiers = !import.specifiers.is_empty()
            && !matches!(import.specifiers[0], JsImportSpecifier::SideEffect);

        let specifiers = if has_specifiers {
            let mut specs = ArenaVec::with_capacity_in(import.specifiers.len(), &self.ab);
            for spec in &import.specifiers {
                match spec {
                    JsImportSpecifier::Default(name) => {
                        let local = BindingIdentifier::new(SPAN, self.str(name), &self.ab);
                        specs.push(ImportDeclarationSpecifier::new_import_default_specifier(
                            SPAN, local, &self.ab,
                        ));
                    }
                    JsImportSpecifier::Namespace(name) => {
                        let local = BindingIdentifier::new(SPAN, self.str(name), &self.ab);
                        specs.push(ImportDeclarationSpecifier::new_import_namespace_specifier(
                            SPAN, local, &self.ab,
                        ));
                    }
                    JsImportSpecifier::Named { imported, local } => {
                        let imported = self.module_export_name(imported);
                        let local = BindingIdentifier::new(SPAN, self.str(local), &self.ab);
                        specs.push(ImportDeclarationSpecifier::new_import_specifier(
                            SPAN,
                            imported,
                            local,
                            ImportOrExportKind::Value,
                            &self.ab,
                        ));
                    }
                    // A `SideEffect` specifier alongside real ones would mean
                    // `has_specifiers` is true but a bare side-effect entry is
                    // present; that mixed shape is not representable, so bail.
                    JsImportSpecifier::SideEffect => return None,
                }
            }
            Some(specs)
        } else {
            None
        };

        let source = self.module_source(&import.source);
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

    fn export_named(&self, export: &JsExportNamed) -> Option<Statement<'a>> {
        // The declaration form (`export const/let/var …`) and the specifier
        // form (`export { a, b as c }`) are mutually exclusive in the IR (only
        // a variable declaration is representable as the declaration form).
        let (declaration, specifiers) = if let Some(decl) = &export.declaration {
            let var_decl = self.variable_declaration_node(decl)?;
            let declaration = oxc_ast::ast::Declaration::VariableDeclaration(var_decl);
            (Some(declaration), ArenaVec::new_in(&self.ab))
        } else {
            let mut specs = ArenaVec::with_capacity_in(export.specifiers.len(), &self.ab);
            for spec in &export.specifiers {
                let local = self.module_export_name(&spec.local);
                let exported = self.module_export_name(&spec.exported);
                specs.push(ExportSpecifier::new(
                    SPAN,
                    local,
                    exported,
                    ImportOrExportKind::Value,
                    &self.ab,
                ));
            }
            (None, specs)
        };

        // The IR has no re-export source (`export { x } from 'y'`); always None.
        let decl = ModuleDeclaration::new_export_named_declaration(
            SPAN,
            declaration,
            specifiers,
            None,
            ImportOrExportKind::Value,
            oxc_ast::NONE,
            &self.ab,
        );
        Some(Statement::from(decl))
    }

    fn export_default(&self, export: &JsExportDefault) -> Option<Statement<'a>> {
        let kind = match &export.declaration {
            JsExportDefaultDeclaration::Function(func) => {
                let func = self.build_function(func, FunctionType::FunctionDeclaration)?;
                oxc_ast::ast::ExportDefaultDeclarationKind::FunctionDeclaration(func)
            }
            JsExportDefaultDeclaration::Expression(id) => {
                let expr = self.expr_id(*id)?;
                oxc_ast::ast::ExportDefaultDeclarationKind::from(expr)
            }
        };
        let decl = ModuleDeclaration::new_export_default_declaration(SPAN, kind, &self.ab);
        Some(Statement::from(decl))
    }

    /// Build a boxed `Function` node from an IR function declaration. Shared by
    /// the `FunctionDeclaration` statement arm and the `export default function`
    /// path. Reuses [`formal_params`] (which bails on destructuring) and
    /// [`statements`] for the body, mirroring the [`function`] expression helper.
    fn build_function(
        &self,
        func: &JsFunctionDeclaration,
        func_type: FunctionType,
    ) -> Option<oxc_allocator::Box<'a, oxc_ast::ast::Function<'a>>> {
        let id = func
            .id
            .as_ref()
            .map(|name| BindingIdentifier::new(SPAN, self.str(name), &self.ab));
        let params = self.formal_params(&func.params)?;
        let stmts = self.statements(&func.body.body)?;
        let body = FunctionBody::new(SPAN, ArenaVec::new_in(&self.ab), stmts, &self.ab);
        Some(Function::boxed(
            SPAN,
            func_type,
            id,
            func.is_generator,
            func.is_async,
            false,
            oxc_ast::NONE,
            oxc_ast::NONE,
            params,
            oxc_ast::NONE,
            Some(body),
            &self.ab,
        ))
    }

    /// Convert a slice of IR statements into an arena `Vec`, bailing on any
    /// unhandled statement.
    fn statements(&self, body: &[JsStatement]) -> Option<ArenaVec<'a, Statement<'a>>> {
        let mut v: Vec<Statement<'a>> = Vec::with_capacity(body.len());
        for s in body {
            v.extend(self.expand_stmt(s)?);
        }
        Some(ArenaVec::from_iter_in(v, &self.ab))
    }

    /// Build an optional `LabelIdentifier` for `break`/`continue` labels.
    fn label(&self, name: Option<&str>) -> Option<oxc_ast::ast::LabelIdentifier<'a>> {
        name.map(|n| LabelIdentifier::new(SPAN, self.str(n), &self.ab))
    }

    fn variable_declaration(&self, decl: &JsVariableDeclaration) -> Option<Statement<'a>> {
        let var_decl = self.variable_declaration_node(decl)?;
        Some(Statement::VariableDeclaration(var_decl))
    }

    /// Build a boxed [`VariableDeclaration`] node from the IR. Shared by the
    /// `VariableDeclaration` statement arm, the `ExportNamed` declaration path,
    /// and the `for (let … ; …)` / `for (… of …)` loop initializers. Bails on
    /// destructuring binding patterns (only plain identifiers handled here).
    fn variable_declaration_node(
        &self,
        decl: &JsVariableDeclaration,
    ) -> Option<oxc_allocator::Box<'a, oxc_ast::ast::VariableDeclaration<'a>>> {
        let kind = match decl.kind {
            JsVariableKind::Var => VariableDeclarationKind::Var,
            JsVariableKind::Let => VariableDeclarationKind::Let,
            JsVariableKind::Const => VariableDeclarationKind::Const,
        };

        let mut declarators = ArenaVec::with_capacity_in(decl.declarations.len(), &self.ab);
        for d in &decl.declarations {
            // Identifier or destructuring binding pattern; `binding_pattern`
            // bails on anything it cannot faithfully reproduce.
            let binding = self.binding_pattern(&d.id)?;
            let init = match d.init {
                Some(id) => Some(self.expr_id(id)?),
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

    /// Build an oxc [`BindingPattern`] from an IR [`JsPattern`], recursing into
    /// object / array / assignment / rest sub-patterns. Returns `None` (so the
    /// whole conversion falls back to string codegen) on anything that cannot be
    /// faithfully reproduced: a top-level bare `Rest` (only valid nested inside
    /// an object / array, handled there), a rest property/element that is not
    /// last, or any computed object-pattern key (which we cannot reconstruct
    /// structurally).
    fn binding_pattern(&self, pat: &JsPattern) -> Option<oxc_ast::ast::BindingPattern<'a>> {
        match pat {
            JsPattern::Identifier(name) => Some(BindingPattern::new_binding_identifier(
                SPAN,
                self.str(name),
                &self.ab,
            )),
            JsPattern::Object(obj) => {
                let mut props = ArenaVec::with_capacity_in(obj.properties.len(), &self.ab);
                let mut rest: Option<oxc_allocator::Box<'a, oxc_ast::ast::BindingRestElement<'a>>> =
                    None;
                let last = obj.properties.len().saturating_sub(1);
                for (i, member) in obj.properties.iter().enumerate() {
                    match member {
                        JsObjectPatternProperty::Property {
                            key,
                            value,
                            computed,
                            shorthand,
                        } => {
                            let key = if *computed {
                                // A computed key holds an arbitrary expression;
                                // only `JsPropertyKey::Computed` is meaningful.
                                match key {
                                    JsPropertyKey::Computed(id) => {
                                        let expr = self.expr_id(*id)?;
                                        PropertyKey::from(expr)
                                    }
                                    _ => return None,
                                }
                            } else {
                                self.property_key(key)?
                            };
                            let value = self.binding_pattern(value)?;
                            props.push(BindingProperty::new(
                                SPAN, key, value, *shorthand, *computed, &self.ab,
                            ));
                        }
                        JsObjectPatternProperty::Rest(inner) => {
                            // A rest property must be the last entry.
                            if i != last {
                                return None;
                            }
                            let inner = self.binding_pattern(inner)?;
                            rest = Some(BindingRestElement::boxed(SPAN, inner, &self.ab));
                        }
                    }
                }
                Some(BindingPattern::new_object_pattern(
                    SPAN, props, rest, &self.ab,
                ))
            }
            JsPattern::Array(arr) => {
                let mut elements = ArenaVec::with_capacity_in(arr.elements.len(), &self.ab);
                let mut rest: Option<oxc_allocator::Box<'a, oxc_ast::ast::BindingRestElement<'a>>> =
                    None;
                let last = arr.elements.len().saturating_sub(1);
                for (i, el) in arr.elements.iter().enumerate() {
                    match el {
                        None => elements.push(None),
                        Some(JsPattern::Rest(inner)) => {
                            // A rest element must be the last element.
                            if i != last {
                                return None;
                            }
                            let inner = self.binding_pattern(inner)?;
                            rest = Some(BindingRestElement::boxed(SPAN, inner, &self.ab));
                        }
                        Some(el) => elements.push(Some(self.binding_pattern(el)?)),
                    }
                }
                Some(BindingPattern::new_array_pattern(
                    SPAN, elements, rest, &self.ab,
                ))
            }
            JsPattern::Assignment(JsAssignmentPattern { left, right }) => {
                let left = self.binding_pattern(left)?;
                let right = self.expr_id(*right)?;
                Some(BindingPattern::new_assignment_pattern(
                    SPAN, left, right, &self.ab,
                ))
            }
            // A bare `Rest` only ever appears nested inside an object / array
            // pattern (handled above) or as the last function parameter (handled
            // in `formal_params`); reaching it directly is not representable.
            JsPattern::Rest(_) => None,
        }
    }

    // -- expressions --------------------------------------------------------

    fn expr(&self, expr: &JsExpr) -> Option<Expression<'a>> {
        match expr {
            JsExpr::Identifier(name) => {
                Some(Expression::new_identifier(SPAN, self.str(name), &self.ab))
            }
            JsExpr::OpaqueIdentifier(name) => {
                Some(Expression::new_identifier(SPAN, self.str(name), &self.ab))
            }
            JsExpr::Literal(lit) => self.literal(lit),
            JsExpr::This => Some(Expression::ThisExpression(ThisExpression::boxed(
                SPAN, &self.ab,
            ))),
            JsExpr::Super => Some(Expression::Super(Super::boxed(SPAN, &self.ab))),
            JsExpr::MetaProperty(meta, _property) => {
                // oxc 0.141 split `MetaProperty` into `ImportMeta` / `NewTarget`;
                // the meta keyword (`import` vs `new`) selects the variant.
                Some(if meta.as_str() == "new" {
                    Expression::new_new_target(SPAN, &self.ab)
                } else {
                    Expression::new_import_meta(SPAN, &self.ab)
                })
            }
            JsExpr::Member(m) => self.member(m),
            JsExpr::Call(c) => {
                let callee = self.expr_id(c.callee)?;
                let args = self.arguments(&c.arguments)?;
                Some(Expression::CallExpression(CallExpression::boxed(
                    SPAN,
                    callee,
                    oxc_ast::NONE,
                    args,
                    c.optional,
                    &self.ab,
                )))
            }
            JsExpr::New(n) => {
                let callee = self.expr_id(n.callee)?;
                let args = self.arguments(&n.arguments)?;
                Some(Expression::NewExpression(NewExpression::boxed(
                    SPAN,
                    callee,
                    oxc_ast::NONE,
                    args,
                    &self.ab,
                )))
            }
            JsExpr::Binary(b) => {
                let left = self.expr_id(b.left)?;
                let right = self.expr_id(b.right)?;
                Some(Expression::BinaryExpression(BinaryExpression::boxed(
                    SPAN,
                    left,
                    binary_op(b.operator),
                    right,
                    &self.ab,
                )))
            }
            JsExpr::Logical(l) => {
                let left = self.expr_id(l.left)?;
                let right = self.expr_id(l.right)?;
                Some(Expression::LogicalExpression(LogicalExpression::boxed(
                    SPAN,
                    left,
                    logical_op(l.operator),
                    right,
                    &self.ab,
                )))
            }
            JsExpr::Unary(u) => {
                let arg = self.expr_id(u.argument)?;
                Some(Expression::UnaryExpression(UnaryExpression::boxed(
                    SPAN,
                    unary_op(u.operator),
                    arg,
                    &self.ab,
                )))
            }
            JsExpr::Conditional(c) => {
                let test = self.expr_id(c.test)?;
                let consequent = self.expr_id(c.consequent)?;
                let alternate = self.expr_id(c.alternate)?;
                Some(Expression::ConditionalExpression(
                    ConditionalExpression::boxed(SPAN, test, consequent, alternate, &self.ab),
                ))
            }
            JsExpr::Sequence(s) => {
                let mut exprs = ArenaVec::with_capacity_in(s.expressions.len(), &self.ab);
                for e in &s.expressions {
                    exprs.push(self.expr(e)?);
                }
                Some(Expression::SequenceExpression(SequenceExpression::boxed(
                    SPAN, exprs, &self.ab,
                )))
            }
            JsExpr::Array(a) => {
                let mut elements = ArenaVec::with_capacity_in(a.elements.len(), &self.ab);
                for el in &a.elements {
                    let element = match el {
                        None => ArrayExpressionElement::new_elision(SPAN, &self.ab),
                        Some(JsExpr::Spread(inner)) => {
                            // `[...x]` — spread element inside an array.
                            let inner = self.expr_id(*inner)?;
                            ArrayExpressionElement::SpreadElement(SpreadElement::boxed(
                                SPAN, inner, &self.ab,
                            ))
                        }
                        Some(e) => ArrayExpressionElement::from(self.expr(e)?),
                    };
                    elements.push(element);
                }
                Some(Expression::ArrayExpression(ArrayExpression::boxed(
                    SPAN, elements, &self.ab,
                )))
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
                Some(Expression::AwaitExpression(AwaitExpression::boxed(
                    SPAN, arg, &self.ab,
                )))
            }
            JsExpr::Void(id) => {
                let arg = self.expr_id(*id)?;
                Some(Expression::UnaryExpression(UnaryExpression::boxed(
                    SPAN,
                    UnaryOperator::Void,
                    arg,
                    &self.ab,
                )))
            }
            JsExpr::Arrow(arrow) => self.arrow(arrow),
            JsExpr::TemplateLiteral(tpl) => {
                let tpl = self.template_literal(tpl)?;
                Some(Expression::TemplateLiteral(ArenaBox::new_in(tpl, &self.ab)))
            }
            JsExpr::TaggedTemplate(t) => {
                let tag = self.expr_id(t.tag)?;
                let quasi = self.template_literal(&t.quasi)?;
                Some(Expression::TaggedTemplateExpression(
                    TaggedTemplateExpression::boxed(SPAN, tag, oxc_ast::NONE, quasi, &self.ab),
                ))
            }
            JsExpr::Assignment(a) => {
                let left = self.assignment_target(self.arena.get_expr(a.left))?;
                let right = self.expr_id(a.right)?;
                Some(Expression::AssignmentExpression(
                    AssignmentExpression::boxed(
                        SPAN,
                        assignment_op(a.operator),
                        left,
                        right,
                        &self.ab,
                    ),
                ))
            }
            JsExpr::Update(u) => {
                let target = self.simple_assignment_target(self.arena.get_expr(u.argument))?;
                Some(Expression::UpdateExpression(UpdateExpression::boxed(
                    SPAN,
                    update_op(u.operator),
                    u.prefix,
                    target,
                    &self.ab,
                )))
            }
            JsExpr::Chain(chain) => self.chain(chain),
            JsExpr::ImportExpression { source, options } => {
                let source = self.expr_id(*source)?;
                let options = match options {
                    Some(id) => Some(self.expr_id(*id)?),
                    None => None,
                };
                // `phase` (`import.defer` / `import.source`) is not represented
                // in the IR; pass `None`.
                Some(Expression::ImportExpression(ImportExpression::boxed(
                    SPAN, source, options, None, &self.ab,
                )))
            }
            JsExpr::Function(func) => self.function(func),
            JsExpr::Yield(y) => {
                let argument = match y.argument {
                    Some(id) => Some(self.expr_id(id)?),
                    None => None,
                };
                Some(Expression::YieldExpression(YieldExpression::boxed(
                    SPAN, y.delegate, argument, &self.ab,
                )))
            }
            JsExpr::Class(class) => self.class(class),
            // `Spanned` wraps a real inner expression with the original-source
            // byte span (start, end). Convert the inner expression and stamp its
            // span so esrap's `print_with_map` maps it back to the user source.
            JsExpr::Spanned(inner, start, end) => {
                let mut e = self.expr_id(*inner)?;
                *e.span_mut() = Span::new(*start, *end);
                Some(e)
            }
            // `Raw` carries opaque JS expression text. Parse it into a real oxc
            // expression so esrap can print it canonically (the text is
            // semantically what the official compiler emits, so the round-trip is
            // byte-identical after esrap normalization).
            JsExpr::Raw(code) => self.parse_raw_expression(code),
        }
    }

    /// Parse a raw JS expression source string into an oxc [`Expression`].
    /// Wraps in `( … )` so a leading `{`/`function` parses as an expression, then
    /// strips the synthetic parens. Returns `None` on a parse error.
    fn parse_raw_expression(&self, code: &str) -> Option<Expression<'a>> {
        let wrapped = format!("({})", code.trim());
        let owned = self.ab.allocator.alloc_str(&wrapped);
        let ret =
            oxc_parser::Parser::new(self.ab.allocator, owned, oxc_span::SourceType::mjs()).parse();
        // Bail on any comment-bearing chunk: re-printing a parsed AST drops the
        // comments (esrap places them by source line, which a reassembled program
        // has no unified coordinate for). Falling back to the verbatim string
        // codegen for these preserves the comments exactly. (KNOWN GAP: AST-side
        // comment preservation.)
        if !ret.diagnostics.is_empty() || !ret.program.comments.is_empty() {
            return None;
        }
        for stmt in ret.program.body {
            if let Statement::ExpressionStatement(es) = stmt {
                let mut e = es.unbox().expression;
                while let Expression::ParenthesizedExpression(p) = e {
                    e = p.unbox().expression;
                }
                return Some(e);
            }
        }
        None
    }

    /// Parse a raw JS statement source string into a vec of oxc [`Statement`]s
    /// (`Raw` may hold several statements). Returns `None` on a parse error.
    fn parse_raw_statements(&self, code: &str) -> Option<Vec<Statement<'a>>> {
        let owned = self.ab.allocator.alloc_str(code.trim());
        let ret =
            oxc_parser::Parser::new(self.ab.allocator, owned, oxc_span::SourceType::mjs()).parse();
        // Bail on comments so the verbatim string codegen preserves them (see
        // `parse_raw_expression`).
        if !ret.diagnostics.is_empty() || !ret.program.comments.is_empty() {
            return None;
        }
        Some(ret.program.body.into_iter().collect())
    }

    /// Expand one IR statement into its oxc statements — a `Raw`/`RawMapped`
    /// expands to (possibly several) parsed statements, every other variant to a
    /// single converted statement. Used at statement-LIST sites (program body,
    /// block bodies) so a multi-statement `Raw` flattens inline.
    fn expand_stmt(&self, stmt: &JsStatement) -> Option<Vec<Statement<'a>>> {
        match stmt {
            JsStatement::Raw(code) => self.parse_raw_statements(code),
            JsStatement::RawMapped {
                code,
                source_offset,
            } => {
                let mut stmts = self.parse_raw_statements(code)?;
                // Stamp each statement with the original-source offset so esrap's
                // `print_with_map` maps the (transformed) instance-script lines
                // back to the user source — mirroring the text codegen's
                // per-block `source_offset` line mapping.
                let sp = Span::new(*source_offset, *source_offset);
                for s in &mut stmts {
                    *s.span_mut() = sp;
                }
                Some(stmts)
            }
            other => Some(vec![self.stmt(other)?]),
        }
    }

    /// Build a `class … { … }` expression from the IR. Mirrors codegen's
    /// [`emit_class_expression`] / [`emit_class_member`] exactly so the esrap
    /// output stays byte-identical.
    ///
    /// Handles the `id`, `extends` (super class), method members (constructor /
    /// method / getter / setter, static or instance, computed or plain keys),
    /// and field members (`static`/instance, computed or plain, with or without
    /// an initializer). **Bails** (`None`) on static blocks (codegen emits them
    /// but the structural printer cannot reproduce them faithfully here) and on
    /// any computed key shape or member value that cannot be faithfully mapped.
    fn class(&self, class: &JsClassExpression) -> Option<Expression<'a>> {
        use oxc_ast::ast::{
            ClassType, MethodDefinitionKind, MethodDefinitionType, PropertyDefinitionType,
        };

        let id = class
            .id
            .as_ref()
            .map(|name| BindingIdentifier::new(SPAN, self.str(name), &self.ab));

        let super_class = match class.super_class {
            Some(id) => Some(self.expr_id(id)?),
            None => None,
        };

        let mut elements = ArenaVec::with_capacity_in(class.body.body.len(), &self.ab);
        for member in &class.body.body {
            match member {
                JsClassMember::Method(method) => {
                    let kind = match method.kind {
                        JsMethodKind::Constructor => MethodDefinitionKind::Constructor,
                        JsMethodKind::Method => MethodDefinitionKind::Method,
                        JsMethodKind::Get => MethodDefinitionKind::Get,
                        JsMethodKind::Set => MethodDefinitionKind::Set,
                    };
                    let key = self.class_member_key(&method.key, method.computed)?;
                    // The method value is a (non-arrow) function expression; build
                    // a boxed `Function` with `FunctionType::FunctionExpression`,
                    // bailing on any param / body shape that cannot be reproduced.
                    let value = self.method_function(&method.value)?;
                    elements.push(ClassElement::new_method_definition(
                        SPAN,
                        MethodDefinitionType::MethodDefinition,
                        ArenaVec::new_in(&self.ab),
                        key,
                        value,
                        kind,
                        method.computed,
                        method.is_static,
                        false,
                        false,
                        None,
                        &self.ab,
                    ));
                }
                JsClassMember::Property(prop) => {
                    let key = self.class_member_key(&prop.key, prop.computed)?;
                    let value = match prop.value {
                        Some(id) => Some(self.expr_id(id)?),
                        None => None,
                    };
                    elements.push(ClassElement::new_property_definition(
                        SPAN,
                        PropertyDefinitionType::PropertyDefinition,
                        ArenaVec::new_in(&self.ab),
                        key,
                        oxc_ast::NONE,
                        value,
                        prop.computed,
                        prop.is_static,
                        false,
                        false,
                        false,
                        false,
                        false,
                        None,
                        &self.ab,
                    ));
                }
                // Static blocks (and any future member kind) are not reproducible
                // by the structural printer; bail the whole class.
                JsClassMember::StaticBlock(_) => return None,
            }
        }

        let body = ClassBody::new(SPAN, elements, &self.ab);
        Some(Expression::ClassExpression(Class::boxed(
            SPAN,
            ClassType::ClassExpression,
            ArenaVec::new_in(&self.ab),
            id,
            oxc_ast::NONE,
            super_class,
            oxc_ast::NONE,
            ArenaVec::new_in(&self.ab),
            body,
            false,
            false,
            &self.ab,
        )))
    }

    /// Build a class member's [`PropertyKey`]. A computed key holds an arbitrary
    /// expression (only `JsPropertyKey::Computed` is meaningful there); a plain
    /// key reuses [`property_key`] (identifier / literal). Bails on a computed
    /// shape that is not a `Computed` expression.
    fn class_member_key(&self, key: &JsPropertyKey, computed: bool) -> Option<PropertyKey<'a>> {
        if computed {
            match key {
                JsPropertyKey::Computed(id) => {
                    let expr = self.expr_id(*id)?;
                    Some(PropertyKey::from(expr))
                }
                _ => None,
            }
        } else {
            self.property_key(key)
        }
    }

    /// Build a boxed `Function` from an IR [`JsFunctionExpression`] used as a
    /// class method value. Mirrors [`function`] but returns the boxed node the
    /// method-definition builder expects. Bails (via [`formal_params`] /
    /// [`statements`]) on any param or body shape that cannot be reproduced.
    fn method_function(
        &self,
        func: &JsFunctionExpression,
    ) -> Option<oxc_allocator::Box<'a, oxc_ast::ast::Function<'a>>> {
        let id = func
            .id
            .as_ref()
            .map(|name| BindingIdentifier::new(SPAN, self.str(name), &self.ab));
        let params = self.formal_params(&func.params)?;
        let stmts = self.statements(&func.body.body)?;
        let body = FunctionBody::new(SPAN, ArenaVec::new_in(&self.ab), stmts, &self.ab);
        Some(Function::boxed(
            SPAN,
            FunctionType::FunctionExpression,
            id,
            func.is_generator,
            func.is_async,
            false,
            oxc_ast::NONE,
            oxc_ast::NONE,
            params,
            oxc_ast::NONE,
            Some(body),
            &self.ab,
        ))
    }

    fn literal(&self, lit: &JsLiteral) -> Option<Expression<'a>> {
        match lit {
            JsLiteral::String(s) => Some(Expression::new_string_literal(
                SPAN,
                self.str(s),
                None,
                &self.ab,
            )),
            JsLiteral::Number(n) => Some(Expression::new_numeric_literal(
                SPAN,
                *n,
                None,
                NumberBase::Decimal,
                &self.ab,
            )),
            JsLiteral::RawString { value, raw } => Some(Expression::new_string_literal(
                SPAN,
                self.str(value),
                Some(self.str(raw).into()),
                &self.ab,
            )),
            JsLiteral::RawNumber { value, raw } => Some(Expression::new_numeric_literal(
                SPAN,
                *value,
                Some(self.str(raw).into()),
                NumberBase::Decimal,
                &self.ab,
            )),
            JsLiteral::BigInt(raw) => {
                // The IR stores the raw source spelling including the trailing
                // `n` (e.g. `123n`). esrap prints from the raw text, but the
                // builder's `value` field expects base-10 digits with no
                // suffix; strip the trailing `n` for the value.
                let value = raw.strip_suffix('n').unwrap_or(raw);
                Some(Expression::new_big_int_literal(
                    SPAN,
                    self.str(value),
                    None,
                    BigintBase::Decimal,
                    &self.ab,
                ))
            }
            JsLiteral::Boolean(b) => Some(Expression::new_boolean_literal(SPAN, *b, &self.ab)),
            JsLiteral::Null => Some(Expression::new_null_literal(SPAN, &self.ab)),
            JsLiteral::Undefined => Some(Expression::new_identifier(SPAN, "undefined", &self.ab)),
            JsLiteral::Regex { pattern, flags } => {
                // Build the flags bitset faithfully from the source spelling;
                // bail on any unrecognised flag character so we never guess.
                let mut flag_bits = RegExpFlags::empty();
                for ch in flags.chars() {
                    flag_bits |= RegExpFlags::try_from(ch).ok()?;
                }
                let regex = RegExp {
                    pattern: RegExpPattern {
                        text: self.str(pattern).into(),
                        pattern: None,
                    },
                    flags: flag_bits,
                };
                // esrap prints `raw` verbatim when present, so emit the exact
                // `/pattern/flags` source spelling.
                let raw = self.str(&format!("/{pattern}/{flags}"));
                Some(Expression::new_reg_exp_literal(
                    SPAN,
                    regex,
                    Some(raw.into()),
                    &self.ab,
                ))
            }
        }
    }

    fn member(&self, m: &JsMemberExpression) -> Option<Expression<'a>> {
        Some(Expression::from(self.member_expr(m)?))
    }

    /// Build a [`MemberExpression`] node from the IR member expression. Shared
    /// by the `Member` expression arm and the assignment-target helper.
    fn member_expr(&self, m: &JsMemberExpression) -> Option<oxc_ast::ast::MemberExpression<'a>> {
        let object = self.expr_id(m.object)?;
        let member = match &m.property {
            JsMemberProperty::Identifier(name) => {
                let property = IdentifierName::new(SPAN, self.str(name), &self.ab);
                MemberExpression::StaticMemberExpression(StaticMemberExpression::boxed(
                    SPAN, object, property, m.optional, &self.ab,
                ))
            }
            JsMemberProperty::Expression(id) => {
                let property = self.expr_id(*id)?;
                MemberExpression::ComputedMemberExpression(ComputedMemberExpression::boxed(
                    SPAN, object, property, m.optional, &self.ab,
                ))
            }
            JsMemberProperty::PrivateIdentifier(name) => {
                // The IR stores the bare name (no leading `#`, matching the
                // ESTree `PrivateIdentifier.name` convention); codegen and the
                // esrap printer both add the `#`, so pass the name verbatim.
                let field = PrivateIdentifier::new(SPAN, self.str(name), &self.ab);
                MemberExpression::new_private_field_expression(
                    SPAN, object, field, m.optional, &self.ab,
                )
            }
        };
        Some(member)
    }

    /// Build a [`TemplateLiteral`] node from the IR template literal. Shared by
    /// the `TemplateLiteral` and `TaggedTemplate` expression arms.
    fn template_literal(
        &self,
        tpl: &JsTemplateLiteral,
    ) -> Option<oxc_ast::ast::TemplateLiteral<'a>> {
        let mut quasis = ArenaVec::with_capacity_in(tpl.quasis.len(), &self.ab);
        for q in &tpl.quasis {
            let value = oxc_ast::ast::TemplateElementValue {
                raw: self.str(&q.raw).into(),
                cooked: Some(self.str(&q.cooked).into()),
            };
            quasis.push(TemplateElement::new(SPAN, value, q.tail, &self.ab));
        }
        let mut expressions = ArenaVec::with_capacity_in(tpl.expressions.len(), &self.ab);
        for e in &tpl.expressions {
            expressions.push(self.expr(e)?);
        }
        Some(TemplateLiteral::new(SPAN, quasis, expressions, &self.ab))
    }

    /// Build a [`SimpleAssignmentTarget`] from an IR expression used as an
    /// assignment / update target. Only a plain identifier or a simple
    /// (non-optional) member expression are supported; bail on anything else.
    fn simple_assignment_target(
        &self,
        expr: &JsExpr,
    ) -> Option<oxc_ast::ast::SimpleAssignmentTarget<'a>> {
        match expr {
            JsExpr::Identifier(name) => {
                Some(SimpleAssignmentTarget::new_assignment_target_identifier(
                    SPAN,
                    self.str(name),
                    &self.ab,
                ))
            }
            JsExpr::Member(m) if !m.optional => {
                let member = self.member_expr(m)?;
                Some(oxc_ast::ast::SimpleAssignmentTarget::from(member))
            }
            _ => None,
        }
    }

    /// Build a full [`AssignmentTarget`] from an IR expression used as an
    /// assignment / for-of left-hand side. This is a SEPARATE type system from
    /// binding patterns: identifiers and members reuse [`simple_assignment_target`],
    /// while `[a, b] = …` / `{ a } = …` destructuring lowers to the dedicated
    /// `ArrayAssignmentTarget` / `ObjectAssignmentTarget` pattern variants.
    ///
    /// The IR represents the destructuring LHS as a `JsExpr::Array` /
    /// `JsExpr::Object` used in pattern position (codegen just `emit_expression`s
    /// it), with holes as `None` array elements, rest as `JsExpr::Spread`, and
    /// defaults as a nested `JsExpr::Assignment`. **Bails** (`None`) on anything
    /// that cannot be faithfully reproduced: a non-last rest, a spread inside an
    /// object target, a computed object-pattern key we cannot reconstruct, a
    /// getter / setter / method object member, or any nested target shape that
    /// itself bails.
    fn assignment_target(&self, expr: &JsExpr) -> Option<oxc_ast::ast::AssignmentTarget<'a>> {
        match expr {
            JsExpr::Array(arr) => {
                let mut elements = ArenaVec::with_capacity_in(arr.elements.len(), &self.ab);
                let mut rest: Option<
                    oxc_allocator::Box<'a, oxc_ast::ast::AssignmentTargetRest<'a>>,
                > = None;
                let last = arr.elements.len().saturating_sub(1);
                for (i, el) in arr.elements.iter().enumerate() {
                    match el {
                        None => elements.push(None),
                        Some(JsExpr::Spread(inner)) => {
                            // A rest element must be the last element.
                            if i != last {
                                return None;
                            }
                            let target = self.assignment_target(self.arena.get_expr(*inner))?;
                            rest = Some(AssignmentTargetRest::boxed(SPAN, target, &self.ab));
                        }
                        Some(e) => elements.push(Some(self.assignment_target_maybe_default(e)?)),
                    }
                }
                let array = ArrayAssignmentTarget::boxed(SPAN, elements, rest, &self.ab);
                Some(oxc_ast::ast::AssignmentTarget::ArrayAssignmentTarget(array))
            }
            JsExpr::Object(obj) => {
                let mut props = ArenaVec::with_capacity_in(obj.properties.len(), &self.ab);
                let mut rest: Option<
                    oxc_allocator::Box<'a, oxc_ast::ast::AssignmentTargetRest<'a>>,
                > = None;
                let last = obj.properties.len().saturating_sub(1);
                for (i, member) in obj.properties.iter().enumerate() {
                    match member {
                        JsObjectMember::SpreadElement(id) => {
                            // A rest property must be the last entry.
                            if i != last {
                                return None;
                            }
                            let target = self.assignment_target(self.arena.get_expr(*id))?;
                            rest = Some(AssignmentTargetRest::boxed(SPAN, target, &self.ab));
                        }
                        JsObjectMember::Property(p) => {
                            // Only plain `key: value` / shorthand `{ key }` /
                            // `{ key = default }` are representable as object
                            // assignment targets — never get/set/method.
                            if !matches!(p.kind, JsPropertyKind::Init) || p.method {
                                return None;
                            }
                            let prop = self.assignment_target_property(p)?;
                            props.push(prop);
                        }
                    }
                }
                let object = ObjectAssignmentTarget::boxed(SPAN, props, rest, &self.ab);
                Some(oxc_ast::ast::AssignmentTarget::ObjectAssignmentTarget(
                    object,
                ))
            }
            // Plain identifier / simple member: reuse the simple-target helper.
            _ => {
                let simple = self.simple_assignment_target(expr)?;
                Some(oxc_ast::ast::AssignmentTarget::from(simple))
            }
        }
    }

    /// Build an [`AssignmentTargetMaybeDefault`] for an array element or object
    /// property value. A nested `JsExpr::Assignment` with the plain `=` operator
    /// is a default (`[a = 1] = …`); anything else is a bare nested target.
    fn assignment_target_maybe_default(
        &self,
        expr: &JsExpr,
    ) -> Option<oxc_ast::ast::AssignmentTargetMaybeDefault<'a>> {
        if let JsExpr::Assignment(a) = expr
            && matches!(a.operator, JsAssignmentOp::Assign)
        {
            let binding = self.assignment_target(self.arena.get_expr(a.left))?;
            let init = self.expr_id(a.right)?;
            return Some(
                AssignmentTargetMaybeDefault::new_assignment_target_with_default(
                    SPAN, binding, init, &self.ab,
                ),
            );
        }
        let target = self.assignment_target(expr)?;
        Some(oxc_ast::ast::AssignmentTargetMaybeDefault::from(target))
    }

    /// Build an [`AssignmentTargetProperty`] from an IR object property used in
    /// an object assignment target. Shorthand `{ a }` / `{ a = 1 }` lowers to
    /// `AssignmentTargetPropertyIdentifier`; an explicit `key: value` (with an
    /// optional default on the value) lowers to `AssignmentTargetPropertyProperty`.
    /// Bails on a computed key that is not a `Computed` expression.
    fn assignment_target_property(
        &self,
        p: &JsProperty,
    ) -> Option<oxc_ast::ast::AssignmentTargetProperty<'a>> {
        // Shorthand: `{ a }` or `{ a = default }`. The IR value is the bare
        // identifier (or an `a = default` assignment) and the key matches it.
        if p.shorthand && !p.computed {
            let value = self.arena.get_expr(p.value);
            let (name, init) = match value {
                JsExpr::Identifier(name) => (name.as_str(), None),
                JsExpr::Assignment(a) if matches!(a.operator, JsAssignmentOp::Assign) => {
                    match self.arena.get_expr(a.left) {
                        JsExpr::Identifier(name) => (name.as_str(), Some(self.expr_id(a.right)?)),
                        _ => return None,
                    }
                }
                _ => return None,
            };
            let binding = IdentifierReference::new(SPAN, self.str(name), &self.ab);
            return Some(
                oxc_ast::ast::AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(
                    AssignmentTargetPropertyIdentifier::boxed(SPAN, binding, init, &self.ab),
                ),
            );
        }

        // Explicit `key: value` (value may carry a default).
        let key = self.class_member_key(&p.key, p.computed)?;
        let binding = self.assignment_target_maybe_default(self.arena.get_expr(p.value))?;
        Some(
            oxc_ast::ast::AssignmentTargetProperty::AssignmentTargetPropertyProperty(
                AssignmentTargetPropertyProperty::boxed(SPAN, key, binding, p.computed, &self.ab),
            ),
        )
    }

    fn object(&self, o: &JsObjectExpression) -> Option<Expression<'a>> {
        let mut props = ArenaVec::with_capacity_in(o.properties.len(), &self.ab);
        for member in &o.properties {
            match member {
                JsObjectMember::SpreadElement(id) => {
                    let arg = self.expr_id(*id)?;
                    props.push(ObjectPropertyKind::SpreadProperty(SpreadElement::boxed(
                        SPAN, arg, &self.ab,
                    )));
                }
                JsObjectMember::Property(p) => {
                    let prop = self.object_property(p)?;
                    props.push(ObjectPropertyKind::ObjectProperty(prop));
                }
            }
        }
        Some(Expression::ObjectExpression(ObjectExpression::boxed(
            SPAN, props, &self.ab,
        )))
    }

    /// Build a boxed [`ObjectProperty`] from an IR [`JsProperty`].
    ///
    /// Handles plain `key: value`, computed keys (`[expr]: value`), method
    /// shorthand (`key() {}`), and getter / setter accessors (`get key() {}` /
    /// `set key() {}`). Mirrors codegen's [`emit_object_member`] exactly so the
    /// esrap output stays byte-identical: in particular codegen's `auto_method`
    /// heuristic treats any non-computed `Init` property whose value is a
    /// (non-arrow) function expression as a method shorthand, so we set
    /// `method: true` for that shape too — without it esrap would print
    /// `key: function() {}` instead of the `key() {}` codegen emits.
    fn object_property(
        &self,
        p: &JsProperty,
    ) -> Option<oxc_allocator::Box<'a, oxc_ast::ast::ObjectProperty<'a>>> {
        let kind = match p.kind {
            JsPropertyKind::Init => PropertyKind::Init,
            JsPropertyKind::Get => PropertyKind::Get,
            JsPropertyKind::Set => PropertyKind::Set,
        };

        // A getter / setter / method renders from `kind` + `method` + a bare
        // function value (esrap emits the concise method form, not `key:
        // function(){}`). For all of these the value MUST be a non-arrow
        // function expression; bail otherwise. Additionally, mirror codegen's
        // `auto_method`: a non-computed `Init` property with a function value is
        // emitted as a method shorthand even when `method` is false.
        let value_is_function = matches!(self.arena.get_expr(p.value), JsExpr::Function(_));
        let is_accessor = !matches!(p.kind, JsPropertyKind::Init);
        let auto_method =
            !p.computed && matches!(p.kind, JsPropertyKind::Init) && value_is_function;
        let method = p.method || auto_method;

        if (is_accessor || method) && !value_is_function {
            // `get`/`set`/method shape requires a function value to be faithful.
            return None;
        }

        let key = if p.computed {
            match &p.key {
                JsPropertyKey::Computed(id) => {
                    let expr = self.expr_id(*id)?;
                    PropertyKey::from(expr)
                }
                // A computed key that is structurally an identifier or literal
                // (`[name]: …` / `[0]: …`): build the key from that expression.
                JsPropertyKey::Identifier(name) => {
                    let expr = Expression::new_identifier(SPAN, self.str(name), &self.ab);
                    PropertyKey::from(expr)
                }
                JsPropertyKey::Literal(lit) => {
                    let expr = self.literal(lit)?;
                    PropertyKey::from(expr)
                }
            }
        } else {
            self.property_key(&p.key)?
        };

        let value = self.expr_id(p.value)?;

        Some(ObjectProperty::boxed(
            SPAN,
            kind,
            key,
            value,
            method,
            p.shorthand,
            p.computed,
            &self.ab,
        ))
    }

    fn property_key(&self, key: &JsPropertyKey) -> Option<PropertyKey<'a>> {
        match key {
            JsPropertyKey::Identifier(name) => Some(PropertyKey::new_static_identifier(
                SPAN,
                self.str(name),
                &self.ab,
            )),
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
                let stmt = Statement::ExpressionStatement(ExpressionStatement::boxed(
                    SPAN, expr, &self.ab,
                ));
                let stmts = ArenaVec::from_value_in(stmt, &self.ab);
                (
                    true,
                    FunctionBody::new(SPAN, ArenaVec::new_in(&self.ab), stmts, &self.ab),
                )
            }
            JsArrowBody::Block(block) => {
                let stmts = self.statements(&block.body)?;
                (
                    false,
                    FunctionBody::new(SPAN, ArenaVec::new_in(&self.ab), stmts, &self.ab),
                )
            }
        };

        Some(Expression::ArrowFunctionExpression(
            ArrowFunctionExpression::boxed(
                SPAN,
                is_expr,
                arrow.is_async,
                oxc_ast::NONE,
                params,
                oxc_ast::NONE,
                body,
                &self.ab,
            ),
        ))
    }

    /// Build an optional-chaining wrapper (`a?.b`, `a?.()`). The inner IR
    /// expression must be a member or call expression (one of which carries the
    /// `optional: true` somewhere in the chain); bail on anything else.
    fn chain(&self, chain: &JsChainExpression) -> Option<Expression<'a>> {
        let inner = self.arena.get_expr(chain.expression);
        let element: ChainElement<'a> = match inner {
            JsExpr::Member(m) => {
                let member = self.member_expr(m)?;
                ChainElement::from(member)
            }
            JsExpr::Call(c) => {
                let callee = self.expr_id(c.callee)?;
                let args = self.arguments(&c.arguments)?;
                let call =
                    CallExpression::boxed(SPAN, callee, oxc_ast::NONE, args, c.optional, &self.ab);
                ChainElement::CallExpression(call)
            }
            _ => return None,
        };
        Some(Expression::ChainExpression(ChainExpression::boxed(
            SPAN, element, &self.ab,
        )))
    }

    /// Build a function expression. Reuses [`formal_params`] (which bails on
    /// destructuring params) and [`statements`] for the body.
    fn function(&self, func: &JsFunctionExpression) -> Option<Expression<'a>> {
        let id = func
            .id
            .as_ref()
            .map(|name| BindingIdentifier::new(SPAN, self.str(name), &self.ab));
        let params = self.formal_params(&func.params)?;
        let stmts = self.statements(&func.body.body)?;
        let body = FunctionBody::new(SPAN, ArenaVec::new_in(&self.ab), stmts, &self.ab);
        Some(Expression::FunctionExpression(Function::boxed(
            SPAN,
            FunctionType::FunctionExpression,
            id,
            func.is_generator,
            func.is_async,
            false,
            oxc_ast::NONE,
            oxc_ast::NONE,
            params,
            oxc_ast::NONE,
            Some(body),
            &self.ab,
        )))
    }

    /// Convert function parameters, handling destructuring patterns and a
    /// trailing rest param (`...args`). Bails (via `binding_pattern`) on any
    /// pattern that cannot be faithfully reproduced, or on a rest param that is
    /// not the last parameter.
    fn formal_params(&self, params: &[JsPattern]) -> Option<oxc_ast::ast::FormalParameters<'a>> {
        let mut items = ArenaVec::with_capacity_in(params.len(), &self.ab);
        let mut rest: Option<oxc_allocator::Box<'a, oxc_ast::ast::FormalParameterRest<'a>>> = None;
        let last = params.len().saturating_sub(1);
        for (i, p) in params.iter().enumerate() {
            if let JsPattern::Rest(inner) = p {
                // A rest parameter must be the last parameter and lives in the
                // dedicated `rest` slot, not the `items` list.
                if i != last {
                    return None;
                }
                let pattern = self.binding_pattern(inner)?;
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

    /// Convert call/new arguments, supporting spread arguments (`f(...x)`).
    fn arguments(&self, args: &[JsExpr]) -> Option<ArenaVec<'a, Argument<'a>>> {
        let mut out = ArenaVec::with_capacity_in(args.len(), &self.ab);
        for arg in args {
            let argument = match arg {
                JsExpr::Spread(inner) => {
                    let inner = self.expr_id(*inner)?;
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

fn assignment_op(op: JsAssignmentOp) -> AssignmentOperator {
    match op {
        JsAssignmentOp::Assign => AssignmentOperator::Assign,
        JsAssignmentOp::AddAssign => AssignmentOperator::Addition,
        JsAssignmentOp::SubAssign => AssignmentOperator::Subtraction,
        JsAssignmentOp::MulAssign => AssignmentOperator::Multiplication,
        JsAssignmentOp::DivAssign => AssignmentOperator::Division,
        JsAssignmentOp::ModAssign => AssignmentOperator::Remainder,
        JsAssignmentOp::PowAssign => AssignmentOperator::Exponential,
        JsAssignmentOp::ShlAssign => AssignmentOperator::ShiftLeft,
        JsAssignmentOp::ShrAssign => AssignmentOperator::ShiftRight,
        JsAssignmentOp::UShrAssign => AssignmentOperator::ShiftRightZeroFill,
        JsAssignmentOp::BitAndAssign => AssignmentOperator::BitwiseAnd,
        JsAssignmentOp::BitOrAssign => AssignmentOperator::BitwiseOR,
        JsAssignmentOp::BitXorAssign => AssignmentOperator::BitwiseXOR,
        JsAssignmentOp::AndAssign => AssignmentOperator::LogicalAnd,
        JsAssignmentOp::OrAssign => AssignmentOperator::LogicalOr,
        JsAssignmentOp::NullishAssign => AssignmentOperator::LogicalNullish,
    }
}

fn update_op(op: JsUpdateOp) -> UpdateOperator {
    match op {
        JsUpdateOp::Increment => UpdateOperator::Increment,
        JsUpdateOp::Decrement => UpdateOperator::Decrement,
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
