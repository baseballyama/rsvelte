//! Type erasure in place: what upstream's `remove_typescript_nodes` removes, on a tree that
//! [`crate::features::first_runtime_feature`] found nothing to refuse in.

use oxc_allocator::{Allocator, TakeIn, Vec as ArenaVec};
use oxc_ast::Comment;
use oxc_ast::ast::{
    ArrowFunctionExpression, CallExpression, CatchParameter, ChainElement, Class, ClassBody,
    ClassElement, CommentPosition, Declaration, ExportDeclaration, ExportDefaultDeclarationKind,
    ExportNamedDeclaration, ExportSpecifier, Expression, FormalParameter, FormalParameterRest,
    Function, FunctionBody, FunctionType, ImportDeclaration, ImportDeclarationSpecifier,
    MethodDefinition, MethodDefinitionKind, MethodDefinitionType, NewExpression, Program,
    PropertyDefinition, PropertyDefinitionType, SimpleAssignmentTarget, Statement,
    TSModuleReference, TaggedTemplateExpression, VariableDeclarator,
};
use oxc_ast::builder::AstBuilder;
use oxc_ast_visit::{Visit, VisitMut, walk, walk_mut};
use oxc_span::{GetSpan, Span};
use oxc_syntax::scope::ScopeFlags;

/// Erases the types of every node it visits.
pub struct Strip<'a> {
    allocator: &'a Allocator,
}

impl std::fmt::Debug for Strip<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Strip").finish_non_exhaustive()
    }
}

impl<'a> Strip<'a> {
    #[must_use]
    pub const fn new(allocator: &'a Allocator) -> Self {
        Self { allocator }
    }
}

/// Whether erasing types removes `statement` from its list: what TypeScript's emit removes, and
/// an import or export whose every specifier is a type, which upstream removes as well.
#[must_use]
pub fn is_type_only(statement: &Statement<'_>) -> bool {
    is_type_declaration(statement)
        || match statement {
            Statement::ImportDeclaration(d) => d.specifiers.as_ref().is_some_and(|specifiers| {
                !specifiers.is_empty() && specifiers.iter().all(is_type_import)
            }),
            Statement::ExportNamedDeclaration(d) => d.specifiers.iter().all(is_type_export),
            Statement::ExportFromDeclaration(d) => d.specifiers.iter().all(is_type_export),
            _ => false,
        }
}

/// Whether TypeScript's emit removes `statement`, which `verbatimModuleSyntax` keeps when only its
/// specifiers are types.
fn is_type_declaration(statement: &Statement<'_>) -> bool {
    if let Some(declaration) = statement.as_declaration() {
        return is_type_only_declaration(declaration);
    }
    match statement {
        Statement::TSNamespaceExportDeclaration(_) => true,
        Statement::ImportDeclaration(d) => d.import_kind.is_type(),
        Statement::ExportDeclaration(d) => {
            exports_only_types(d) || is_type_only_declaration(&d.declaration)
        }
        Statement::ExportNamedDeclaration(d) => d.export_kind.is_type(),
        Statement::ExportFromDeclaration(d) => d.export_kind.is_type(),
        Statement::ExportAllDeclaration(d) => d.export_kind.is_type(),
        Statement::ExportDefaultDeclaration(d) => matches!(
            d.declaration,
            ExportDefaultDeclarationKind::TSInterfaceDeclaration(_)
        ),
        _ => false,
    }
}

/// Whether `export` exports only types: acorn-typescript reads `export declare …` as an export of
/// types, which upstream erases whatever it declares.
#[must_use]
pub fn exports_only_types(export: &ExportDeclaration<'_>) -> bool {
    export.declaration.declare()
}

fn is_type_only_declaration(declaration: &Declaration<'_>) -> bool {
    match declaration {
        Declaration::TSTypeAliasDeclaration(_)
        | Declaration::TSInterfaceDeclaration(_)
        | Declaration::TSExternalModuleDeclaration(_)
        | Declaration::TSNamespaceDeclaration(_)
        | Declaration::TSGlobalDeclaration(_) => true,
        Declaration::VariableDeclaration(d) => d.declare,
        Declaration::FunctionDeclaration(f) => f.declare || f.body.is_none(),
        Declaration::ClassDeclaration(c) => c.declare,
        Declaration::TSEnumDeclaration(_) | Declaration::TSImportEqualsDeclaration(_) => false,
    }
}

/// Whether erasing types removes `element` from its class, as [`Strip`] does after the lowering.
fn is_type_only_element(element: &ClassElement<'_>) -> bool {
    match element {
        ClassElement::TSIndexSignature(_) => true,
        ClassElement::MethodDefinition(m) => m.value.body.is_none(),
        ClassElement::PropertyDefinition(p) => {
            p.declare || p.r#type != PropertyDefinitionType::PropertyDefinition
        }
        _ => false,
    }
}

/// Whether `statement` is one that TypeScript's emit for an ES module, which has no `require` and
/// no `module`, removes: `import A = require("a")`, exported or not, or `export = a`.
#[must_use]
pub fn is_erased_module_syntax(statement: &Statement<'_>) -> bool {
    let import = match statement {
        Statement::TSExportAssignment(_) => return true,
        Statement::TSImportEqualsDeclaration(import) => import,
        Statement::ExportDeclaration(export) => match &export.declaration {
            Declaration::TSImportEqualsDeclaration(import) => import,
            _ => return false,
        },
        _ => return false,
    };
    matches!(
        import.module_reference,
        TSModuleReference::ExternalModuleReference(_)
    )
}

/// Removes from a module what TypeScript's emit removes, so that nothing analyzes it.
///
/// That is declarations and class members without a runtime meaning, `import A = require("a")` and
/// `export =`. An expression keeps its types, and an enum, a namespace and a parameter property are
/// left to be lowered.
pub struct ModuleErasure<'a> {
    allocator: &'a Allocator,
    /// The spans of the statements and the class members it removed, when it records them.
    erased: Option<Vec<Span>>,
}

impl std::fmt::Debug for ModuleErasure<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("ModuleErasure").finish_non_exhaustive()
    }
}

impl<'a> ModuleErasure<'a> {
    #[must_use]
    pub const fn new(allocator: &'a Allocator) -> Self {
        Self {
            allocator,
            erased: None,
        }
    }

    /// An erasure that records the spans of what it removes.
    #[must_use]
    pub const fn recording(allocator: &'a Allocator) -> Self {
        Self {
            allocator,
            erased: Some(Vec::new()),
        }
    }

    /// The spans of what it removed, in the order it removed them, if it recorded them.
    #[must_use]
    pub fn erased(self) -> Vec<Span> {
        self.erased.unwrap_or_default()
    }
}

impl<'a> VisitMut<'a> for ModuleErasure<'a> {
    fn visit_statements(&mut self, it: &mut ArenaVec<'a, Statement<'a>>) {
        let erased = &mut self.erased;
        it.retain(|s| {
            let kept = !is_erased_statement(s) || is_namespace(s);
            if let (false, Some(erased)) = (kept, erased.as_mut()) {
                erased.push(s.span());
            }
            kept
        });
        walk_mut::walk_statements(self, it);
    }

    /// An import of types only is still an import.
    fn visit_import_declaration(&mut self, it: &mut ImportDeclaration<'a>) {
        if let Some(specifiers) = &mut it.specifiers {
            specifiers.retain(|s| !is_type_import(s));
        }
    }

    /// An export of types only is still an export.
    fn visit_export_named_declaration(&mut self, it: &mut ExportNamedDeclaration<'a>) {
        it.specifiers.retain(|s| !is_type_export(s));
    }

    /// A member without a runtime meaning goes, and an accessor without a body gets an empty one.
    fn visit_class_body(&mut self, it: &mut ClassBody<'a>) {
        let erased = &mut self.erased;
        it.body.retain(|element| {
            let kept = !is_type_only_element(element)
                || matches!(element, ClassElement::MethodDefinition(m) if is_bodiless_accessor(m));
            if let (false, Some(erased)) = (kept, erased.as_mut()) {
                erased.push(element.span());
            }
            kept
        });
        walk_mut::walk_class_body(self, it);
    }

    fn visit_method_definition(&mut self, it: &mut MethodDefinition<'a>) {
        if is_bodiless_accessor(it) {
            let b = AstBuilder::new(self.allocator);
            let (directives, statements) = (
                ArenaVec::new_in(&self.allocator),
                ArenaVec::new_in(&self.allocator),
            );
            it.value.r#type = FunctionType::FunctionExpression;
            it.value.body = Some(FunctionBody::boxed(it.span, directives, statements, &b));
        }
        walk_mut::walk_method_definition(self, it);
    }
}

fn is_bodiless_accessor(method: &MethodDefinition<'_>) -> bool {
    matches!(
        method.kind,
        MethodDefinitionKind::Get | MethodDefinitionKind::Set
    ) && method.value.body.is_none()
        && !method.r#type.is_abstract()
}

/// Whether `statement` is a namespace that no `declare` makes ambient.
fn is_namespace(statement: &Statement<'_>) -> bool {
    let declaration = match statement {
        Statement::ExportDeclaration(export) => Some(&export.declaration),
        statement => statement.as_declaration(),
    };
    matches!(declaration, Some(Declaration::TSNamespaceDeclaration(it)) if !it.declare)
}

/// Whether TypeScript's emit for an ES module removes `statement`, an ambient enum among them,
/// which upstream refuses in a component's script.
fn is_erased_statement(statement: &Statement<'_>) -> bool {
    is_type_declaration(statement)
        || is_erased_module_syntax(statement)
        || matches!(
            statement.as_declaration(),
            Some(Declaration::TSEnumDeclaration(it)) if it.declare
        )
}

fn is_type_import(specifier: &ImportDeclarationSpecifier<'_>) -> bool {
    matches!(specifier, ImportDeclarationSpecifier::ImportSpecifier(s) if s.import_kind.is_type())
}

fn is_type_export(specifier: &ExportSpecifier<'_>) -> bool {
    specifier.export_kind.is_type()
}

/// The expression inside `as`, `satisfies`, `!`, `<T>` and instantiation, if `e` is one of them.
fn inner<'a>(e: &mut Expression<'a>, allocator: &'a Allocator) -> Option<Expression<'a>> {
    let inner = match e {
        Expression::TSAsExpression(e) => &mut e.expression,
        Expression::TSSatisfiesExpression(e) => &mut e.expression,
        Expression::TSNonNullExpression(e) => &mut e.expression,
        Expression::TSTypeAssertion(e) => &mut e.expression,
        Expression::TSInstantiationExpression(e) => &mut e.expression,
        _ => return None,
    };
    Some(inner.take_in(&allocator))
}

impl<'a> VisitMut<'a> for Strip<'a> {
    fn visit_statements(&mut self, it: &mut ArenaVec<'a, Statement<'a>>) {
        it.retain(|s| !is_type_only(s));
        walk_mut::walk_statements(self, it);
    }

    fn visit_import_declaration_specifiers(
        &mut self,
        it: &mut ArenaVec<'a, ImportDeclarationSpecifier<'a>>,
    ) {
        it.retain(|s| !is_type_import(s));
    }

    fn visit_export_specifiers(&mut self, it: &mut ArenaVec<'a, ExportSpecifier<'a>>) {
        it.retain(|s| !is_type_export(s));
    }

    fn visit_expression(&mut self, it: &mut Expression<'a>) {
        while let Some(e) = inner(it, self.allocator) {
            *it = e;
        }
        walk_mut::walk_expression(self, it);
    }

    fn visit_simple_assignment_target(&mut self, it: &mut SimpleAssignmentTarget<'a>) {
        let expression = match it {
            SimpleAssignmentTarget::TSAsExpression(e) => &mut e.expression,
            SimpleAssignmentTarget::TSSatisfiesExpression(e) => &mut e.expression,
            SimpleAssignmentTarget::TSNonNullExpression(e) => &mut e.expression,
            SimpleAssignmentTarget::TSTypeAssertion(e) => &mut e.expression,
            _ => return walk_mut::walk_simple_assignment_target(self, it),
        };
        let mut expression = expression.take_in(&self.allocator);
        while let Some(e) = inner(&mut expression, self.allocator) {
            expression = e;
        }
        *it = match expression {
            Expression::Identifier(identifier) => {
                SimpleAssignmentTarget::AssignmentTargetIdentifier(identifier)
            }
            e if e.is_member_expression() => e.into_member_expression().into(),
            _ => unreachable!("the parser reads an assignment target"),
        };
        walk_mut::walk_simple_assignment_target(self, it);
    }

    fn visit_chain_element(&mut self, it: &mut ChainElement<'a>) {
        if let ChainElement::TSNonNullExpression(e) = it {
            let mut expression = e.expression.take_in(&self.allocator);
            while let Some(e) = inner(&mut expression, self.allocator) {
                expression = e;
            }
            *it = match expression {
                Expression::CallExpression(call) => ChainElement::CallExpression(call),
                e if e.is_member_expression() => e.into_member_expression().into(),
                _ => unreachable!("an optional chain links calls and members"),
            };
        }
        walk_mut::walk_chain_element(self, it);
    }

    fn visit_call_expression(&mut self, it: &mut CallExpression<'a>) {
        it.type_arguments = None;
        walk_mut::walk_call_expression(self, it);
    }

    fn visit_new_expression(&mut self, it: &mut NewExpression<'a>) {
        it.type_arguments = None;
        walk_mut::walk_new_expression(self, it);
    }

    fn visit_tagged_template_expression(&mut self, it: &mut TaggedTemplateExpression<'a>) {
        it.type_arguments = None;
        walk_mut::walk_tagged_template_expression(self, it);
    }

    fn visit_variable_declarator(&mut self, it: &mut VariableDeclarator<'a>) {
        it.type_annotation = None;
        it.definite = false;
        walk_mut::walk_variable_declarator(self, it);
    }

    fn visit_catch_parameter(&mut self, it: &mut CatchParameter<'a>) {
        it.type_annotation = None;
        walk_mut::walk_catch_parameter(self, it);
    }

    fn visit_function(&mut self, it: &mut Function<'a>, flags: ScopeFlags) {
        it.type_parameters = None;
        it.this_param = None;
        it.return_type = None;
        walk_mut::walk_function(self, it, flags);
    }

    fn visit_arrow_function_expression(&mut self, it: &mut ArrowFunctionExpression<'a>) {
        it.type_parameters = None;
        it.return_type = None;
        walk_mut::walk_arrow_function_expression(self, it);
    }

    fn visit_formal_parameter(&mut self, it: &mut FormalParameter<'a>) {
        it.type_annotation = None;
        it.optional = false;
        it.accessibility = None;
        it.readonly = false;
        it.r#override = false;
        walk_mut::walk_formal_parameter(self, it);
    }

    fn visit_formal_parameter_rest(&mut self, it: &mut FormalParameterRest<'a>) {
        it.type_annotation = None;
        walk_mut::walk_formal_parameter_rest(self, it);
    }

    fn visit_class(&mut self, it: &mut Class<'a>) {
        it.type_parameters = None;
        it.implements.clear();
        it.r#abstract = false;
        if let Some(heritage) = &mut it.heritage {
            heritage.type_arguments = None;
        }
        walk_mut::walk_class(self, it);
    }

    fn visit_class_elements(&mut self, it: &mut ArenaVec<'a, ClassElement<'a>>) {
        it.retain(|element| !is_type_only_element(element));
        walk_mut::walk_class_elements(self, it);
    }

    fn visit_method_definition(&mut self, it: &mut MethodDefinition<'a>) {
        it.r#type = MethodDefinitionType::MethodDefinition;
        it.accessibility = None;
        it.optional = false;
        it.r#override = false;
        walk_mut::walk_method_definition(self, it);
    }

    fn visit_property_definition(&mut self, it: &mut PropertyDefinition<'a>) {
        it.type_annotation = None;
        it.accessibility = None;
        it.optional = false;
        it.definite = false;
        it.readonly = false;
        it.r#override = false;
        walk_mut::walk_property_definition(self, it);
    }
}

/// The comments TypeScript's emit removes with the declarations it erases.
///
/// That is each comment inside one, before it back to the previous token, or after it on its
/// line. A file or a function body keeps a header: its first comments, which a blank line
/// separates from what follows.
#[derive(Debug, Default)]
pub struct ErasedComments {
    /// The erased declarations that no other erased declaration holds, in source order.
    declarations: Vec<Span>,
    /// The starts of the erased first statements of the file and of the function bodies.
    bodies: Vec<u32>,
}

impl ErasedComments {
    #[must_use]
    pub fn new(program: &Program<'_>) -> Self {
        let mut erased = Self::default();
        if program.directives.is_empty() {
            erased.body(&program.body);
        }
        erased.visit_program(program);
        erased.bodies.sort_unstable();
        erased
    }

    /// The comments of `program` that its emit keeps.
    pub fn kept<'c>(
        &self,
        program: &'c Program<'_>,
    ) -> impl Iterator<Item = &'c Comment> + use<'c, '_> {
        let text = program.source_text;
        let headers: Vec<Span> = (self.bodies.iter())
            .flat_map(|&start| header(&program.comments, text, start))
            .collect();
        (program.comments.iter()).filter(move |c| headers.contains(&c.span) || !self.erases(c))
    }

    fn erases(&self, comment: &Comment) -> bool {
        let inside = self
            .declarations
            .partition_point(|d| d.start <= comment.span.start);
        (inside > 0 && comment.span.end <= self.declarations[inside - 1].end)
            || match comment.position {
                CommentPosition::Leading => self.starts(comment.attached_to),
                CommentPosition::Trailing => (self.declarations)
                    .binary_search_by_key(&comment.attached_to, |d| d.end)
                    .is_ok(),
            }
    }

    /// Notes a body whose header TypeScript would keep: one that starts with an erased statement.
    fn body(&mut self, statements: &[Statement<'_>]) {
        if let Some(first) = statements.first().filter(|s| is_erased_statement(s)) {
            self.bodies.push(first.span().start);
        }
    }

    fn starts(&self, at: u32) -> bool {
        (self.declarations)
            .binary_search_by_key(&at, |d| d.start)
            .is_ok()
    }
}

/// TypeScript's detached comments: the leading comments of the statement at `start` up to the
/// first blank line, if a blank line follows them.
fn header(comments: &[Comment], text: &str, start: u32) -> Vec<Span> {
    let blank = |from: u32, to: u32| text[from as usize..to as usize].matches('\n').count() >= 2;
    let leading = comments
        .iter()
        .filter(|c| c.position == CommentPosition::Leading && c.attached_to == start);
    let mut group: Vec<Span> = Vec::new();
    for comment in leading {
        if group
            .last()
            .is_some_and(|last| blank(last.end, comment.span.start))
        {
            break;
        }
        group.push(comment.span);
    }
    match group.last() {
        Some(last) if blank(last.end, start) => group,
        _ => Vec::new(),
    }
}

impl<'a> Visit<'a> for ErasedComments {
    fn visit_statement(&mut self, it: &Statement<'a>) {
        if is_erased_statement(it) {
            self.declarations.push(it.span());
        } else {
            walk::walk_statement(self, it);
        }
    }

    fn visit_class_element(&mut self, it: &ClassElement<'a>) {
        if is_type_only_element(it) {
            self.declarations.push(it.span());
        } else {
            walk::walk_class_element(self, it);
        }
    }

    fn visit_function_body(&mut self, it: &FunctionBody<'a>) {
        if it.directives.is_empty() {
            self.body(&it.statements);
        }
        walk::walk_function_body(self, it);
    }
}
