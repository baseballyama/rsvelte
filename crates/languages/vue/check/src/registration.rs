use std::sync::Arc;

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::Registry;
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_check::{Check, Tsc, TypeScriptDocument, TypeScriptEnv, TypeScriptView};
use rsvelte_vue::{Parsed, Resolved};

use crate::Configuration;
use crate::project::Projection;

pub fn register(reg: &mut Registry, config: &Configuration) {
    rsvelte_vue::register(reg);
    reg.finish_task(Check {
        identifier: "vue.check/default",
        matches: rsvelte_vue::matches,
        tsc: config.check.as_ref().map(|c| Tsc {
            binary: c.tsc.clone(),
            tsconfig: c.tsconfig.clone(),
        }),
    });
    let env = config
        .check
        .as_ref()
        .map(|c| Arc::new(typescript_env(&c.vue)));
    reg.provide::<TypeScriptView>("vue", rsvelte_vue::matches, move |context| {
        typescript_view(context, env.as_ref())
    });
}

const HELPERS: (&str, &str) = (
    "template-helpers.d.ts",
    include_str!("../vendor/template-helpers.d.ts"),
);

/// What vue-tsc adds to the project: @vue/language-core's template helpers and the vue package.
fn typescript_env(vue: &std::path::Path) -> TypeScriptEnv {
    TypeScriptEnv {
        declarations: vec![HELPERS],
        include: Vec::new(),
        paths: vec![
            ("vue", vue.join("dist/vue.d.mts")),
            ("vue/jsx-runtime", vue.join("jsx-runtime/index.d.ts")),
        ],
    }
}

/// The component as vue-tsc's checker sees it ([`TypeScriptView`]): @vue/language-core's virtual
/// code ([`crate::project`]), mapped back with Volar's rule.
fn typescript_view(
    context: &DocumentContext<'_>,
    env: Option<&Arc<TypeScriptEnv>>,
) -> Result<TypeScriptDocument, Diagnostic> {
    let c = context.get::<Parsed>().as_ref().map_err(Clone::clone)?;
    let res = context
        .get::<Resolved>()
        .as_ref()
        .expect("a parsed component is resolved");
    match crate::project::project(c, context.source_text(), res) {
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
                    "vue.check needs the vue package",
                    Span::new(0, 0),
                )
            })?;
            Ok(TypeScriptDocument::Checked {
                projection,
                map_back: Emitter::lookup_overlap,
                env: Arc::clone(env),
            })
        }
    }
}
