//! Svelte to a source-mapped TypeScript AST.

mod buffers;
pub mod content_mapper;
mod lower;
mod syntax_tree;
pub use lower::{Refusal, Resolve, lower, lower_alone, store_reads};
pub use syntax_tree::SyntaxTree;
mod emit;
pub use emit::emit;
mod computation;
mod read;
pub use computation::{
    EmittedProjection, ProjectionTree, TASK, THROWN, register, register_artifacts,
};
pub use read::{Read, cut_short_at, read, read_alone};

/// The helpers' declarations without the element types, for a project that reads them from
/// svelte's own `svelte-html.d.ts`, as svelte-check does when the package has one.
pub const SHIMS: (&str, &str) = (
    "svelte-shims-v4.d.ts",
    concat!(
        include_str!("../vendor/svelte-shims-v4.d.ts"),
        "\n",
        include_str!("../projection.d.ts")
    ),
);

pub const DECLARATIONS: (&str, &str) = (
    "svelte-jsx-v4.d.ts",
    concat!(
        include_str!("../vendor/svelte-jsx-v4.d.ts"),
        "\n",
        include_str!("../vendor/svelte-shims-v4.d.ts"),
        "\n",
        include_str!("../projection.d.ts")
    ),
);

/// What an import of a component that is not projected reads: a component of any props whose
/// instance is `any`, since neither its props nor its exports are known.
///
/// The props stay a record of `any`, so a callback passed to it reads its parameters as `any`
/// rather than implicitly. Its name is the projection's own, so a module script before it binds
/// none of it.
pub const STAND_IN: &str = "declare const __rsvelte_stand_in: {\n\
    (internals: any, props: Record<string, any>): any;\n\
    new (options: any): any;\n\
    };\n\
    type __rsvelte_stand_in = any;\n\
    export default __rsvelte_stand_in;\n";

/// Why a component has no projection.
#[derive(Clone, Copy, Debug)]
pub enum Unprojected<'a> {
    /// svelte2tsx throws, on the markup or on a script.
    Thrown,
    /// The projection does not cover the component.
    Unsupported(&'a rsvelte_svelte_syntax::syntax_tree::Component),
}

/// What the checker reads for a component that has no projection.
///
/// When svelte2tsx throws, svelte-check reads the bare instance script, else the module script.
/// One that neither imports nor exports it reads as a global script, which declares its names for
/// the whole project; that is not followed here, so such a script reads as an empty file, which is
/// equally not a module. Otherwise it is [`STAND_IN`] after the module script, so an import still
/// reads the module's exports with their types.
#[must_use]
pub fn unprojected(source: &str, why: Unprojected<'_>) -> String {
    match why {
        // svelte-check reads the scripts whether or not Svelte's parser accepts the component.
        Unprojected::Thrown => {
            let script =
                (rsvelte_svelte_syntax::parse::checked_scripts(source).content).unwrap_or_default();
            // The marker keeps the script a module where TypeScript's recovery reads it otherwise.
            if is_module(script) {
                format!("{script}\n;\nexport {{}};\n")
            } else {
                String::new()
            }
        }
        // The `;` ends a module whose last statement has none.
        Unprojected::Unsupported(component) => component.module.as_ref().map_or_else(
            || STAND_IN.to_owned(),
            |module| format!("{}\n;\n{STAND_IN}", module.content.text(source)),
        ),
    }
}

/// Whether TypeScript reads `script` as a module (`isExternalModule`): a top-level import or
/// export declaration other than `export as namespace`, an `import … = require(…)`, or an
/// `import.meta` anywhere. A top-level `await` alone does not make one. A script oxc cannot
/// parse is not one here.
fn is_module(script: &str) -> bool {
    use oxc_ast::ast::{ModuleDeclaration, Statement, TSModuleReference};
    let allocator = oxc_allocator::Allocator::default();
    let parsed = oxc_parser::Parser::new(&allocator, script, oxc_span::SourceType::ts()).parse();
    // oxc keeps nothing of a script that does not parse, where TypeScript's recovery reads on.
    if !parsed.diagnostics.is_empty() && parsed.program.body.is_empty() {
        return false;
    }
    !parsed.module_record.import_metas.is_empty()
        || parsed.program.body.iter().any(|statement| match statement {
            Statement::TSImportEqualsDeclaration(declaration) => matches!(
                declaration.module_reference,
                TSModuleReference::ExternalModuleReference(_)
            ),
            _ => statement
                .as_module_declaration()
                .is_some_and(|declaration| {
                    !matches!(
                        declaration,
                        ModuleDeclaration::TSNamespaceExportDeclaration(_)
                    )
                }),
        })
}

/// Takes no options.
pub static EXTENSION: rsvelte_plugin_interface::Extension = rsvelte_plugin_interface::Extension {
    identifier: "svelte.typescript_projection",
    install: |registry, _| {
        register(registry);
        Ok(())
    },
};

#[cfg(test)]
mod tests;
