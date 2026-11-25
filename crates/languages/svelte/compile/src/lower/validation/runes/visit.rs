//! The walk over a script, which sees it as upstream's analysis does: once its types are erased.

use oxc_ast::AstKind;
use oxc_ast::ast::{
    Class, ExportDeclaration, Expression, Function, FunctionType, MethodDefinition,
    MethodDefinitionType, PropertyDefinition, Statement, TSClassImplements,
    TSExternalModuleDeclaration, TSGlobalDeclaration, TSInterfaceDeclaration,
    TSNamespaceDeclaration, TSThisParameter, TSType, TSTypeAliasDeclaration, TSTypeAnnotation,
    TSTypeParameterDeclaration, TSTypeParameterInstantiation, VariableDeclaration,
};
use oxc_ast_visit::{Visit, walk};
use oxc_syntax::scope::ScopeFlags;
use rsvelte_kernel::performance::stack::grow;
use rsvelte_typescript_compile::strip::exports_only_types;

use super::places::place_of;
use super::{Frame, RuneWalk};
use crate::lower::class_fields::{ClassFields, class_fields};

impl<'a> Visit<'a> for RuneWalk<'a> {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        // Upstream analyzes a class body before what it holds.
        if let AstKind::ClassBody(body) = kind {
            let fields = class_fields(self.res, body, self.unit).unwrap_or_else(|error| {
                self.error.get_or_insert(error);
                ClassFields::default()
            });
            self.classes.push(fields);
        }
        let (place, parent) = match self.frames.last() {
            Some(frame) => (place_of(frame, kind), Some(frame.kind)),
            None => (self.root, None),
        };
        let rune = if self.error.is_none() {
            self.check(kind, parent, place).unwrap_or_else(|error| {
                self.error = Some(error);
                None
            })
        } else {
            None
        };
        self.frames.push(Frame { kind, place, rune });
    }

    fn leave_node(&mut self, kind: AstKind<'a>) {
        if matches!(kind, AstKind::ClassBody(_)) {
            self.classes.pop();
        }
        if let AstKind::ExportDeclaration(export) = kind
            && self.error.is_none()
            && let Err(error) = self.check_export(export)
        {
            self.error = Some(error);
        }
        if let AstKind::ExportNamedDeclaration(export) = kind
            && self.error.is_none()
            && let Err(error) = self.check_specifiers(export)
        {
            self.error = Some(error);
        }
        self.frames.pop();
    }

    // Expressions nest thousands deep in real input.
    fn visit_expression(&mut self, it: &Expression<'a>) {
        if self.error.is_none() {
            grow(|| walk::walk_expression(self, it));
        }
    }

    fn visit_statement(&mut self, it: &Statement<'a>) {
        if self.error.is_none() {
            grow(|| walk::walk_statement(self, it));
        }
    }

    // Upstream analyzes the script once `remove_typescript_nodes` has erased its types. One arm
    // per kind its visitors erase, in their order:
    // `_`: typeAnnotation, typeParameters, typeArguments, returnType; the type of an `as`,
    // `satisfies`, `<T>` or instantiation expression;
    fn visit_ts_type(&mut self, _: &TSType<'a>) {}

    fn visit_ts_type_annotation(&mut self, _: &TSTypeAnnotation<'a>) {}

    fn visit_ts_type_parameter_declaration(&mut self, _: &TSTypeParameterDeclaration<'a>) {}

    fn visit_ts_type_parameter_instantiation(&mut self, _: &TSTypeParameterInstantiation<'a>) {}

    // TSInterfaceDeclaration, TSTypeAliasDeclaration;
    fn visit_ts_interface_declaration(&mut self, _: &TSInterfaceDeclaration<'a>) {}

    fn visit_ts_type_alias_declaration(&mut self, _: &TSTypeAliasDeclaration<'a>) {}

    // FunctionExpression and FunctionDeclaration: the `this` parameter; TSDeclareFunction;
    fn visit_ts_this_parameter(&mut self, _: &TSThisParameter<'a>) {}

    fn visit_function(&mut self, it: &Function<'a>, flags: ScopeFlags) {
        if it.r#type != FunctionType::TSDeclareFunction {
            walk::walk_function(self, it, flags);
        }
    }

    // ClassBody: a `declare` field; ClassDeclaration: a `declare` class, and `implements` in
    // a class declaration or expression;
    fn visit_property_definition(&mut self, it: &PropertyDefinition<'a>) {
        if !it.declare {
            walk::walk_property_definition(self, it);
        }
    }

    fn visit_class(&mut self, it: &Class<'a>) {
        if !it.declare {
            walk::walk_class(self, it);
        }
    }

    fn visit_ts_class_implements(&mut self, _: &TSClassImplements<'a>) {}

    // ExportNamedDeclaration: an `export declare …`, which acorn-typescript reads as an export of
    // types. ImportDeclaration's and the specifiers' type-only filters need no arm: an `arguments`
    // they would erase is already acorn's strict-mode error.
    fn visit_export_declaration(&mut self, it: &ExportDeclaration<'a>) {
        if !exports_only_types(it) {
            walk::walk_export_declaration(self, it);
        }
    }

    // MethodDefinition: an abstract method, its key too;
    fn visit_method_definition(&mut self, it: &MethodDefinition<'a>) {
        if it.r#type != MethodDefinitionType::TSAbstractMethodDefinition {
            walk::walk_method_definition(self, it);
        }
    }

    // VariableDeclaration: a `declare` one;
    fn visit_variable_declaration(&mut self, it: &VariableDeclaration<'a>) {
        if !it.declare {
            walk::walk_variable_declaration(self, it);
        }
    }

    // TSModuleDeclaration: every namespace, module and global, once a value in one is refused.
    fn visit_ts_namespace_declaration(&mut self, _: &TSNamespaceDeclaration<'a>) {}

    fn visit_ts_external_module_declaration(&mut self, _: &TSExternalModuleDeclaration<'a>) {}

    fn visit_ts_global_declaration(&mut self, _: &TSGlobalDeclaration<'a>) {}
}
