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
    find(program, Host::Printer, |_| true)
}

/// [`first_runtime_feature`] for a caller that erases with [`crate::strip::Strip`], which removes
/// an ambient enum as TypeScript's emit does.
#[must_use]
pub fn first_erasure_feature(program: &Program<'_>) -> Option<(Feature, Span)> {
    find(program, Host::Erasure, |_| true)
}

/// [`first_runtime_feature`] among the features `wanted` keeps, as Svelte's
/// `remove_typescript_nodes` sees it: it keeps an import equals inside a namespace as a value, so
/// it refuses the namespace instead.
#[must_use]
pub fn first_svelte_runtime_feature_where(
    program: &Program<'_>,
    wanted: fn(Feature) -> bool,
) -> Option<(Feature, Span)> {
    find(program, Host::Svelte, wanted)
}

/// What reads the program once the finder accepts it.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Host {
    /// Svelte's `remove_typescript_nodes`, which refuses any enum.
    Svelte,
    /// [`crate::strip::Strip`], which removes an ambient enum and the namespaces that emit nothing.
    Erasure,
    /// A printer that keeps what the program declares, ambient or not.
    Printer,
}

fn find(program: &Program<'_>, host: Host, wanted: fn(Feature) -> bool) -> Option<(Feature, Span)> {
    let mut finder = Finder {
        found: None,
        host,
        namespaces: 0,
        wanted,
    };
    finder.visit_program(program);
    finder.found
}

struct Finder {
    found: Option<(Feature, Span)>,
    host: Host,
    /// How many namespace bodies the walk is in.
    namespaces: u32,
    wanted: fn(Feature) -> bool,
}

impl Finder {
    fn found(&mut self, feature: Feature, span: Span) {
        if (self.wanted)(feature) {
            self.found.get_or_insert((feature, span));
        }
    }

    /// A namespace, module or global declaration at `span`: `walk` walks what it holds, and
    /// it is refused once that is walked if its block holds a value.
    fn namespace(
        &mut self,
        span: Span,
        block: Option<&TSModuleBlock<'_>>,
        walk: impl FnOnce(&mut Self),
    ) {
        self.namespaces += 1;
        walk(self);
        self.namespaces -= 1;
        // TypeScript emits a namespace that holds an ambient value, which erasing it cannot.
        let value = match self.host {
            Host::Erasure => crate::strip::instantiates_namespace,
            Host::Svelte | Host::Printer => |s: &Statement<'_>| !crate::strip::is_type_only(s),
        };
        if block.is_some_and(|block| block.body.iter().any(value)) {
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

    fn visit_export_declaration(&mut self, it: &ExportDeclaration<'a>) {
        if !crate::strip::exports_only_types(it) {
            walk::walk_export_declaration(self, it);
        }
    }

    // Upstream's visitor keeps a default export as it is, without visiting what it holds.
    fn visit_export_default_declaration(&mut self, _: &ExportDefaultDeclaration<'a>) {}

    // TypeScript's emit removes an ambient enum, and Svelte's `remove_typescript_nodes` refuses it.
    fn visit_ts_enum_declaration(&mut self, it: &TSEnumDeclaration<'a>) {
        if !it.declare || self.host != Host::Erasure {
            self.found(Feature::Enum, it.span);
        }
    }

    // An ambient declaration holds no value once types are erased, but Svelte's
    // `remove_typescript_nodes` refuses one with a value like any namespace.
    fn visit_ts_namespace_declaration(&mut self, it: &TSNamespaceDeclaration<'a>) {
        if it.declare && self.host != Host::Svelte {
            return;
        }
        let block = match &it.body {
            TSNamespaceDeclarationBody::TSModuleBlock(block) => Some(&**block),
            TSNamespaceDeclarationBody::TSNamespaceDeclaration(_) => None,
        };
        self.namespace(it.span, block, |this| {
            walk::walk_ts_namespace_declaration(this, it);
        });
    }

    fn visit_ts_external_module_declaration(&mut self, it: &TSExternalModuleDeclaration<'a>) {
        if self.host == Host::Svelte {
            self.namespace(it.span, it.body.as_deref(), |this| {
                walk::walk_ts_external_module_declaration(this, it);
            });
        }
    }

    fn visit_ts_global_declaration(&mut self, it: &TSGlobalDeclaration<'a>) {
        if self.host == Host::Svelte {
            self.namespace(it.span, Some(&it.body), |this| {
                walk::walk_ts_global_declaration(this, it);
            });
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
        // Svelte keeps it as a value, so the namespace around it is what it refuses.
        if self.host == Host::Svelte && self.namespaces > 0 {
            return;
        }
        self.found(Feature::ImportEquals, it.span);
    }

    fn visit_ts_export_assignment(&mut self, it: &TSExportAssignment<'a>) {
        self.found(Feature::ExportAssignment, it.span);
    }
}
