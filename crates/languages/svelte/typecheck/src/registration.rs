use std::sync::Arc;

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::Registry;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_parser::Parsed;
use rsvelte_svelte_typescript_projection::Printed;
use rsvelte_typescript_check::{Check, Tsc, TypeScriptDocument, TypeScriptEnv, TypeScriptView};

use crate::Configuration;

pub static PLUGIN: Plugin = Plugin {
    identifier: "svelte.typecheck",
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
        matches: rsvelte_svelte_parser::matches,
        tsc: config.check.as_ref().map(|c| Tsc {
            binary: c.tsc.clone(),
            tsconfig: c.tsconfig.clone(),
        }),
    });
    let env = config
        .check
        .as_ref()
        .map(|c| Arc::new(typescript_env(&c.svelte, &c.content_mapper)));
    reg.provide::<TypeScriptView>("svelte", rsvelte_svelte_parser::matches, move |context| {
        typescript_view(context, env.as_ref())
    });
}

/// What svelte-check adds to the project: its JSX shim and the svelte package's types.
fn typescript_env(svelte: &std::path::Path, content_mapper: &std::path::Path) -> TypeScriptEnv {
    TypeScriptEnv {
        mapped_extension: Some(".svelte"),
        content_mapper: Some(content_mapper.to_owned()),
        declarations: vec![rsvelte_svelte_typescript_projection::DECLARATIONS],
        include: vec![svelte.join("types/index.d.ts")],
        paths: vec![
            ("svelte", svelte.join("types/index.d.ts")),
            ("svelte/elements", svelte.join("elements.d.ts")),
        ],
    }
}

fn typescript_view(
    context: &DocumentContext<'_>,
    env: Option<&Arc<TypeScriptEnv>>,
) -> Result<TypeScriptDocument, Diagnostic> {
    let component = context.get::<Parsed>().as_ref().map_err(Clone::clone)?;
    if !component
        .instance
        .as_ref()
        .is_some_and(|script| script.typescript)
    {
        return Ok(TypeScriptDocument::Unchecked);
    }
    let projection = context.get::<Printed>().as_ref().map_err(Clone::clone)?;
    let env = env.ok_or_else(|| {
        Diagnostic::error(
            "check_unconfigured",
            "svelte.check needs the svelte package",
            Span::new(0, 0),
        )
    })?;
    Ok(TypeScriptDocument::Checked {
        projection: Emitter {
            out: projection.out.clone(),
            mappings: projection.mappings.clone(),
        },
        map_back: Emitter::lookup_span,
        env: Arc::clone(env),
    })
}
