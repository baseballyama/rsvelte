use std::sync::Arc;

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::Registry;
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte::Parsed;
use rsvelte_typescript_check::{Check, Tsc, TypeScriptDocument, TypeScriptEnv, TypeScriptView};

use crate::Configuration;
use crate::project::Projection;

pub fn register(reg: &mut Registry, config: &Configuration) {
    rsvelte_svelte::register(reg);
    reg.finish_task(Check {
        identifier: "svelte.check/default",
        matches: rsvelte_svelte::matches,
        tsc: config.check.as_ref().map(|c| Tsc {
            binary: c.tsc.clone(),
            tsconfig: c.tsconfig.clone(),
        }),
    });
    let env = config
        .check
        .as_ref()
        .map(|c| Arc::new(typescript_env(&c.svelte)));
    reg.provide::<TypeScriptView>("svelte", rsvelte_svelte::matches, move |context| {
        typescript_view(context, env.as_ref())
    });
}

const SHIM: (&str, &str) = (
    "svelte-jsx-v4.d.ts",
    include_str!("../vendor/svelte-jsx-v4.d.ts"),
);

/// What svelte-check adds to the project: its JSX shim and the svelte package's types.
fn typescript_env(svelte: &std::path::Path) -> TypeScriptEnv {
    TypeScriptEnv {
        declarations: vec![SHIM],
        include: vec![svelte.join("types/index.d.ts")],
        paths: vec![
            ("svelte", svelte.join("types/index.d.ts")),
            ("svelte/elements", svelte.join("elements.d.ts")),
        ],
    }
}

/// The component as svelte-check's type checker sees it ([`TypeScriptView`]): svelte2tsx's
/// projection, mapped back through its source map.
fn typescript_view(
    context: &DocumentContext<'_>,
    env: Option<&Arc<TypeScriptEnv>>,
) -> Result<TypeScriptDocument, Diagnostic> {
    let c = context.get::<Parsed>().as_ref().map_err(Clone::clone)?;
    match crate::project::project(c, context.source_text()) {
        Err(u) => Err(Diagnostic::error(
            "check_unsupported",
            format!("not supported by the type-check projection yet: {}", u.what),
            u.span(),
        )),
        Ok(Projection::JavaScript) => Ok(TypeScriptDocument::Unchecked),
        Ok(Projection::TypeScript(projection)) => {
            let env = env.ok_or_else(|| {
                Diagnostic::error(
                    "check_unconfigured",
                    "svelte.check needs the svelte package",
                    Span::new(0, 0),
                )
            })?;
            Ok(TypeScriptDocument::Checked {
                projection,
                map_back: Emitter::lookup_span,
                env: Arc::clone(env),
            })
        }
    }
}
