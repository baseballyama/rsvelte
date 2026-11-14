use std::sync::Arc;

use oxc_ast::ast::Statement;
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::Parsed;
use rsvelte_svelte_syntax::syntax_tree::Component;
use rsvelte_svelte_typescript_projection::{Printed, THROWN};
use rsvelte_typescript_check::{
    Check, Documents, TypeScriptDocument, TypeScriptEnv, TypeScriptStandIn, TypeScriptView,
};

use crate::Configuration;

pub static PLUGIN: Plugin = Plugin {
    identifier: "svelte.check",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[
        Dependency {
            identifier: "svelte.typescript_projection",
            requirement: concat!("=", env!("CARGO_PKG_VERSION")),
        },
        Dependency {
            identifier: "typescript.check",
            requirement: concat!("=", env!("CARGO_PKG_VERSION")),
        },
    ],
};

pub fn register(reg: &mut Registry, config: &Configuration) {
    reg.plugin(&PLUGIN);
    rsvelte_typescript_check::register_service(reg);
    rsvelte_svelte_typescript_projection::register_artifacts(reg);
    reg.finish_task(Check {
        identifier: "svelte.check/default",
        documents: Documents::Matching(rsvelte_svelte_syntax::matches),
        tsc: config.check.as_ref().map(|c| c.tsc.clone()),
        stand_in: Some(rsvelte_svelte_typescript_projection::STAND_IN),
        imported: Some(is_script),
    });
    let env = config
        .check
        .as_ref()
        .map(|c| typescript_env(&c.svelte, &c.content_mapper).map(Arc::new));
    reg.provide::<TypeScriptView>("svelte", rsvelte_svelte_syntax::matches, move |context| {
        typescript_view(context, env.as_ref())
    });
    reg.provide::<TypeScriptStandIn>("svelte", rsvelte_svelte_syntax::matches, |context| {
        let component = context.get::<Parsed>().as_ref().ok()?;
        rsvelte_svelte_typescript_projection::stand_in(component, &context.document.text)
    });
}

/// A script a component may import, such as a `.svelte.ts` module.
fn is_script(document: &rsvelte_kernel::source::document::Document) -> bool {
    [".ts", ".mts", ".cts", ".js", ".mjs", ".cjs"]
        .iter()
        .any(|extension| document.path.ends_with(extension))
}

/// What svelte-check adds to the project: its shims, the svelte package's types, and the element
/// types from the package's `svelte-html.d.ts`, or from svelte2tsx's JSX shim without one.
fn typescript_env(
    svelte: &std::path::Path,
    content_mapper: &std::path::Path,
) -> Result<TypeScriptEnv, String> {
    let types = svelte.join("types/index.d.ts");
    let text = std::fs::read_to_string(&types).map_err(|e| format!("{}: {e}", types.display()))?;
    let element_types = svelte.join("svelte-html.d.ts");
    let (declarations, include) = if element_types.is_file() {
        (
            rsvelte_svelte_typescript_projection::SHIMS,
            vec![types.clone(), element_types],
        )
    } else {
        (
            rsvelte_svelte_typescript_projection::DECLARATIONS,
            vec![types.clone()],
        )
    };
    Ok(TypeScriptEnv {
        mapped_extension: Some(".svelte"),
        content_mapper: Some(content_mapper.to_owned()),
        declarations: vec![declarations],
        include,
        paths: package_modules(&text, &types)
            .chain([("svelte/elements".to_owned(), svelte.join("elements.d.ts"))])
            .collect(),
        replaced: vec![(types, without_any_component_module(text))],
    })
}

/// Each module the package's types declare, such as `svelte/store`, read from the blanked types: a
/// module the checker found through `node_modules` would read the package's own file, whose
/// `declare module '*.svelte'` stays.
fn package_modules<'t>(
    text: &'t str,
    types: &'t std::path::Path,
) -> impl Iterator<Item = (String, std::path::PathBuf)> + 't {
    text.split("declare module '")
        .skip(1)
        .filter_map(|rest| rest.split_once('\'').map(|(name, _)| name))
        .filter(|name| *name == "svelte" || name.starts_with("svelte/"))
        .map(|name| (name.to_owned(), types.to_owned()))
}

/// svelte-check blanks the svelte package's `declare module '*.svelte'`, so an import of a
/// component that does not exist is an error instead of a component of any props.
fn without_any_component_module(mut types: String) -> String {
    let Some(start) = types.find("declare module '*.svelte' {") else {
        return types;
    };
    let end = types[start + 1..]
        .find("\n}")
        .map_or(types.len(), |at| start + 1 + at + 2);
    types.replace_range(start..end, &" ".repeat(end - start));
    types
}

fn typescript_view(
    context: &DocumentContext<'_>,
    env: Option<&Result<Arc<TypeScriptEnv>, String>>,
) -> Result<TypeScriptDocument, Diagnostic> {
    // svelte-check type-checks a component whose style sheet does not parse.
    let component = match context.get::<Parsed>() {
        Ok(component) => component,
        Err(error) => {
            if let Some(document) = script_syntax::view(&context.document.text, || env_of(env)) {
                return document;
            }
            // svelte2tsx throws Svelte's parse error, which svelte-check reports as it is.
            return Ok(TypeScriptDocument::Rejected {
                message: error.message.clone(),
                span: if error.has_end {
                    error.span
                } else {
                    Span::new(error.span.start_offset, error.span.start_offset)
                },
            });
        }
    };
    // svelte-check reads the component as TypeScript when either script is, else as JavaScript.
    let typescript = [&component.instance, &component.module]
        .into_iter()
        .flatten()
        .any(|script| script.typescript);
    let projection = match context.get::<Printed>() {
        Ok(projection) => projection,
        Err(thrown) if thrown.code == THROWN => {
            return Ok(TypeScriptDocument::Rejected {
                message: thrown.message.clone(),
                span: thrown.span,
            });
        }
        // A JavaScript component the projection does not cover stays unchecked.
        Err(_) if !typescript => return Ok(TypeScriptDocument::Unchecked),
        Err(diagnostic) => return Err(diagnostic.clone()),
    };
    let env = env_of(env)?;
    Ok(TypeScriptDocument::Checked {
        projection: Emitter {
            out: projection.out.clone(),
            mappings: projection.mappings.clone(),
            atoms: projection.atoms.clone(),
        },
        map_back: Emitter::lookup_span,
        env: Arc::clone(env),
        placement: placement::instance(component),
        extension: if typescript { ".ts" } else { ".js" },
        imports: relative_imports(component),
    })
}

/// Each relative module specifier the scripts import or re-export from, by its string literal.
fn relative_imports(component: &Component) -> Vec<(Span, String)> {
    let mut found = Vec::new();
    for script in [&component.instance, &component.module]
        .into_iter()
        .flatten()
    {
        let program = component.javascript.get_program(script.program);
        for statement in &program.body {
            let source = match statement {
                Statement::ImportDeclaration(import) => Some(&import.source),
                Statement::ExportFromDeclaration(export) => Some(&export.source),
                Statement::ExportAllDeclaration(export) => Some(&export.source),
                _ => None,
            };
            // A specifier with a lone surrogate names no file.
            let relative = source
                .and_then(|source| Some((source.span, source.value.as_str()?)))
                .filter(|(_, specifier)| specifier.starts_with('.'));
            if let Some((span, specifier)) = relative {
                found.push((Span::new(span.start, span.end), specifier.to_owned()));
            }
        }
    }
    found
}

fn env_of(
    env: Option<&Result<Arc<TypeScriptEnv>, String>>,
) -> Result<&Arc<TypeScriptEnv>, Diagnostic> {
    env.ok_or("svelte.check needs the svelte package")
        .and_then(|env| env.as_ref().map_err(String::as_str))
        .map_err(|why| Diagnostic::error("check_unconfigured", why, Span::new(0, 0)))
}

mod placement;
mod script_syntax;

#[cfg(test)]
mod tests;
