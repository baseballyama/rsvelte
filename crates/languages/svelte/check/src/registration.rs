use std::sync::Arc;

use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::{Registry, ReplacedFile, ReplacedFiles};
use rsvelte_svelte_typescript_projection::{Unprojected, unprojected};
use rsvelte_typescript_check::{
    Check, Documents, MappedLanguage, MappedLanguages, TypeScriptDocument, TypeScriptStandIn,
    TypeScriptView,
};

use crate::Configuration;

pub(crate) const TASK: &str = "svelte.check/default";

static PLUGIN: Plugin = Plugin {
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
        identifier: TASK,
        documents: Documents::Matching(rsvelte_svelte_syntax::matches),
        tsc: config.check.as_ref().map(|c| c.tsc.clone()),
        stand_in: Some(rsvelte_svelte_typescript_projection::STAND_IN),
        imported: Some(rsvelte_typescript_tree::matches),
    });
    if let Some(check) = &config.check {
        reg.contribute::<MappedLanguages>(MappedLanguage {
            extension: ".svelte",
            content_mapper: check.content_mapper.clone(),
        });
    }
    let env = config
        .check
        .as_ref()
        .map(|c| typescript_env(&c.svelte, &c.content_mapper).map(Arc::new));
    for (path, text) in (env.iter().flatten()).flat_map(|env| &env.replaced) {
        reg.contribute::<ReplacedFiles>(ReplacedFile {
            tasks: &[TASK, rsvelte_typescript_check::TASK],
            path: path.clone(),
            text: text.clone(),
        });
    }
    reg.provide::<TypeScriptView>("svelte", rsvelte_svelte_syntax::matches, move |context| {
        typescript_view(context, env.as_ref())
    });
    reg.provide::<TypeScriptStandIn>("svelte", rsvelte_svelte_syntax::matches, |context| {
        let rejected = matches!(
            context.facet::<TypeScriptView>(),
            Some(Ok(TypeScriptDocument::Rejected { .. }))
        );
        let why = match rsvelte_svelte_typescript_projection::read(context) {
            Ok(read) if !rejected => Unprojected::Unsupported(read.component),
            _ => Unprojected::Thrown,
        };
        Some(unprojected(&context.document.text, why))
    });
}

mod environment;
use environment::typescript_env;
mod view;
use view::typescript_view;

#[cfg(test)]
mod tests;
