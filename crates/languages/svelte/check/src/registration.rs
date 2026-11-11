use std::sync::Arc;

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::Parsed;
use rsvelte_svelte_typescript_projection::Printed;
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
    let svelte_html = svelte.join("svelte-html.d.ts");
    let (declarations, include) = if svelte_html.is_file() {
        (
            rsvelte_svelte_typescript_projection::SHIMS,
            vec![types.clone(), svelte_html],
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
        paths: vec![
            ("svelte", types.clone()),
            ("svelte/elements", svelte.join("elements.d.ts")),
        ],
        replaced: vec![(types, without_any_component_module(text))],
    })
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
    let component = context.get::<Parsed>().as_ref().map_err(Clone::clone)?;
    if !component
        .instance
        .as_ref()
        .is_some_and(|script| script.typescript)
    {
        return Ok(TypeScriptDocument::Unchecked);
    }
    let projection = context.get::<Printed>().as_ref().map_err(Clone::clone)?;
    let env = env
        .ok_or("svelte.check needs the svelte package")
        .and_then(|env| env.as_ref().map_err(String::as_str))
        .map_err(|why| Diagnostic::error("check_unconfigured", why, Span::new(0, 0)))?;
    Ok(TypeScriptDocument::Checked {
        projection: Emitter {
            out: projection.out.clone(),
            mappings: projection.mappings.clone(),
            atoms: projection.atoms.clone(),
        },
        map_back: Emitter::lookup_span,
        env: Arc::clone(env),
    })
}

#[cfg(test)]
mod tests;
