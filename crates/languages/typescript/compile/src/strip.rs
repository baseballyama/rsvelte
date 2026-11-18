//! Type erasure in place: what upstream's `remove_typescript_nodes` removes, on a tree that
//! [`crate::features::first_runtime_feature`] found nothing to refuse in.

use oxc_allocator::{Allocator, TakeIn, Vec as ArenaVec};
use oxc_ast::ast::{
    ArrowFunctionExpression, CallExpression, CatchParameter, ChainElement, Class, ClassElement,
    Declaration, ExportDefaultDeclarationKind, ExportSpecifier, Expression, FormalParameter,
    FormalParameterRest, Function, ImportDeclarationSpecifier, MethodDefinition,
    MethodDefinitionType, NewExpression, PropertyDefinition, PropertyDefinitionType,
    SimpleAssignmentTarget, Statement, TaggedTemplateExpression, VariableDeclarator,
};
use oxc_ast_visit::{VisitMut, walk_mut};
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

/// Whether erasing types removes `statement` from its list.
#[must_use]
pub fn is_type_only(statement: &Statement<'_>) -> bool {
    match statement {
        Statement::TSTypeAliasDeclaration(_)
        | Statement::TSInterfaceDeclaration(_)
        | Statement::TSExternalModuleDeclaration(_)
        | Statement::TSNamespaceDeclaration(_)
        | Statement::TSGlobalDeclaration(_)
        | Statement::TSNamespaceExportDeclaration(_) => true,
        Statement::VariableDeclaration(d) => d.declare,
        Statement::FunctionDeclaration(f) => f.declare || f.body.is_none(),
        Statement::ClassDeclaration(c) => c.declare,
        Statement::ImportDeclaration(d) => {
            d.import_kind.is_type()
                || d.specifiers.as_ref().is_some_and(|specifiers| {
                    !specifiers.is_empty() && specifiers.iter().all(is_type_import)
                })
        }
        Statement::ExportDeclaration(d) => is_type_only_declaration(&d.declaration),
        Statement::ExportNamedDeclaration(d) => {
            d.export_kind.is_type() || d.specifiers.iter().all(is_type_export)
        }
        Statement::ExportFromDeclaration(d) => {
            d.export_kind.is_type() || d.specifiers.iter().all(is_type_export)
        }
        Statement::ExportAllDeclaration(d) => d.export_kind.is_type(),
        Statement::ExportDefaultDeclaration(d) => matches!(
            d.declaration,
            ExportDefaultDeclarationKind::TSInterfaceDeclaration(_)
        ),
        _ => false,
    }
}

fn is_type_only_declaration(declaration: &Declaration<'_>) -> bool {
    match declaration {
        Declaration::VariableDeclaration(d) => d.declare,
        Declaration::FunctionDeclaration(f) => f.declare || f.body.is_none(),
        Declaration::ClassDeclaration(c) => c.declare,
        _ => true,
    }
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
        it.retain(|element| match element {
            ClassElement::TSIndexSignature(_) => false,
            ClassElement::MethodDefinition(m) => m.value.body.is_some(),
            ClassElement::PropertyDefinition(p) => {
                !p.declare && p.r#type == PropertyDefinitionType::PropertyDefinition
            }
            _ => true,
        });
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
