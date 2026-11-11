//! The TypeScript that has a runtime value, which erasing types cannot compile.

use oxc_ast::ast::{
    AccessorProperty, Decorator, MethodDefinition, MethodDefinitionKind, Program, Statement,
    TSEnumDeclaration, TSExportAssignment, TSImportEqualsDeclaration, TSNamespaceDeclaration,
    TSNamespaceDeclarationBody,
};
use oxc_ast_visit::{Visit, walk};
use oxc_span::Span;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Feature {
    Enum,
    NamespaceWithValues,
    Decorator,
    Accessor,
    ParameterProperty,
    ImportEquals,
    ExportAssignment,
}

/// The first construct with a runtime value in `program`, in the order upstream's
/// `remove_typescript_nodes` meets them: a namespace's body before the namespace.
#[must_use]
pub fn first_runtime_feature(program: &Program<'_>) -> Option<(Feature, Span)> {
    let mut finder = Finder(None);
    finder.visit_program(program);
    finder.0
}

struct Finder(Option<(Feature, Span)>);

impl Finder {
    fn found(&mut self, feature: Feature, span: Span) {
        self.0.get_or_insert((feature, span));
    }
}

impl<'a> Visit<'a> for Finder {
    fn visit_statement(&mut self, it: &Statement<'a>) {
        if self.0.is_none() {
            walk::walk_statement(self, it);
        }
    }

    fn visit_ts_enum_declaration(&mut self, it: &TSEnumDeclaration<'a>) {
        self.found(Feature::Enum, it.span);
    }

    fn visit_ts_namespace_declaration(&mut self, it: &TSNamespaceDeclaration<'a>) {
        if it.declare {
            return;
        }
        walk::walk_ts_namespace_declaration(self, it);
        if has_values(&it.body) {
            self.found(Feature::NamespaceWithValues, it.span);
        }
    }

    fn visit_decorator(&mut self, it: &Decorator<'a>) {
        self.found(Feature::Decorator, it.span);
    }

    fn visit_accessor_property(&mut self, it: &AccessorProperty<'a>) {
        self.found(Feature::Accessor, it.span);
    }

    fn visit_method_definition(&mut self, it: &MethodDefinition<'a>) {
        if it.kind == MethodDefinitionKind::Constructor
            && let Some(parameter) =
                (it.value.params.items.iter()).find(|p| p.readonly || p.accessibility.is_some())
        {
            self.found(Feature::ParameterProperty, parameter.span);
        }
        walk::walk_method_definition(self, it);
    }

    fn visit_ts_import_equals_declaration(&mut self, it: &TSImportEqualsDeclaration<'a>) {
        self.found(Feature::ImportEquals, it.span);
    }

    fn visit_ts_export_assignment(&mut self, it: &TSExportAssignment<'a>) {
        self.found(Feature::ExportAssignment, it.span);
    }
}

/// Whether a namespace keeps a statement once its types are erased.
fn has_values(body: &TSNamespaceDeclarationBody<'_>) -> bool {
    match body {
        // A nested namespace with values was refused when the walk met it.
        TSNamespaceDeclarationBody::TSNamespaceDeclaration(_) => false,
        TSNamespaceDeclarationBody::TSModuleBlock(block) => {
            block.body.iter().any(|s| !crate::strip::is_type_only(s))
        }
    }
}
