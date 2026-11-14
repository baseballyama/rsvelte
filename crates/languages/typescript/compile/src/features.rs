//! The TypeScript that has a runtime value, which erasing types cannot compile.

use oxc_ast::ast::{
    AccessorProperty, Decorator, ExportDeclaration, ExportDefaultDeclaration, MethodDefinition,
    MethodDefinitionKind, Program, Statement, TSEnumDeclaration, TSExportAssignment,
    TSExternalModuleDeclaration, TSGlobalDeclaration, TSImportEqualsDeclaration, TSModuleBlock,
    TSNamespaceDeclaration, TSNamespaceDeclarationBody,
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
    find(program, false)
}

/// [`first_runtime_feature`] as Svelte's `remove_typescript_nodes` sees it: it keeps an import
/// equals inside a namespace as a value, so it refuses the namespace instead.
#[must_use]
pub fn first_svelte_runtime_feature(program: &Program<'_>) -> Option<(Feature, Span)> {
    find(program, true)
}

fn find(program: &Program<'_>, svelte: bool) -> Option<(Feature, Span)> {
    let mut finder = Finder {
        found: None,
        svelte,
        namespaces: 0,
    };
    finder.visit_program(program);
    finder.found
}

struct Finder {
    found: Option<(Feature, Span)>,
    svelte: bool,
    /// How many namespace bodies the walk is in.
    namespaces: u32,
}

impl Finder {
    fn found(&mut self, feature: Feature, span: Span) {
        self.found.get_or_insert((feature, span));
    }

    /// A module block the walk has entered, refused once its statements are walked.
    fn module_block(&mut self, block: &TSModuleBlock<'_>, span: Span) {
        if block.body.iter().any(|s| !crate::strip::is_type_only(s)) {
            self.found(Feature::NamespaceWithValues, span);
        }
    }
}

impl<'a> Visit<'a> for Finder {
    fn visit_statement(&mut self, it: &Statement<'a>) {
        if self.found.is_none() {
            walk::walk_statement(self, it);
        }
    }

    // acorn-typescript reads `export declare …` as an export of types, which upstream erases.
    fn visit_export_declaration(&mut self, it: &ExportDeclaration<'a>) {
        if !it.declaration.declare() {
            walk::walk_export_declaration(self, it);
        }
    }

    // Upstream's visitor keeps a default export as it is, without visiting what it holds.
    fn visit_export_default_declaration(&mut self, _: &ExportDefaultDeclaration<'a>) {}

    fn visit_ts_enum_declaration(&mut self, it: &TSEnumDeclaration<'a>) {
        self.found(Feature::Enum, it.span);
    }

    fn visit_ts_namespace_declaration(&mut self, it: &TSNamespaceDeclaration<'a>) {
        // Svelte 5.57.3 refuses a value here too, though erasing the types leaves nothing.
        if it.declare {
            return;
        }
        self.namespaces += 1;
        walk::walk_ts_namespace_declaration(self, it);
        self.namespaces -= 1;
        if let TSNamespaceDeclarationBody::TSModuleBlock(block) = &it.body {
            self.module_block(block, it.span);
        }
    }

    // Always ambient, so it holds no value.
    fn visit_ts_external_module_declaration(&mut self, _: &TSExternalModuleDeclaration<'a>) {}

    fn visit_ts_global_declaration(&mut self, _: &TSGlobalDeclaration<'a>) {}

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
        // Svelte keeps it as a value, so the namespace around it is what it refuses.
        if self.svelte && self.namespaces > 0 {
            return;
        }
        self.found(Feature::ImportEquals, it.span);
    }

    fn visit_ts_export_assignment(&mut self, it: &TSExportAssignment<'a>) {
        self.found(Feature::ExportAssignment, it.span);
    }
}
