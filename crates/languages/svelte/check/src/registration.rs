use std::sync::Arc;

use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::{Registry, ReplacedFile, ReplacedFiles};
use rsvelte_typescript_check::{
    Check, Documents, MappedLanguage, MappedLanguages, TypeScriptDocument, TypeScriptStandIn,
    TypeScriptView,
};

use crate::Configuration;

pub(crate) const TASK: &str = "svelte.check/default";

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
        identifier: TASK,
        documents: Documents::Matching(rsvelte_svelte_syntax::matches),
        tsc: config.check.as_ref().map(|c| c.tsc.clone()),
        stand_in: Some(rsvelte_svelte_typescript_projection::STAND_IN),
        imported: Some(is_script),
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
        // svelte-check reads a component svelte2tsx throws on as its bare script, which declares
        // globals for the whole project when it neither imports nor exports.
        if let Some(Ok(TypeScriptDocument::Rejected { .. })) = context.facet::<TypeScriptView>() {
            return Some(bare_script(&context.document.text));
        }
        let own = rsvelte_svelte_typescript_projection::read(context)
            .ok()
            .and_then(|read| {
                rsvelte_svelte_typescript_projection::stand_in(
                    read.component,
                    &context.document.text,
                )
            });
        Some(own.unwrap_or_else(|| rsvelte_svelte_typescript_projection::STAND_IN.to_owned()))
    });
}

/// svelte-check's text of a component svelte2tsx throws on: its instance script, else its module
/// script.
fn bare_script(source_text: &str) -> String {
    rsvelte_svelte_syntax::parse::parse_without_scripts(source_text)
        .ok()
        .and_then(|component| {
            let script = component.instance.as_ref().or(component.module.as_ref())?;
            Some(script.content.text(source_text).to_owned())
        })
        .unwrap_or_default()
}

/// A script a component may import, such as a `.svelte.ts` module.
fn is_script(document: &rsvelte_kernel::source::document::Document) -> bool {
    [".ts", ".mts", ".cts", ".js", ".mjs", ".cjs"]
        .iter()
        .any(|extension| document.path.ends_with(extension))
}

mod environment;
use environment::typescript_env;
mod view;
use view::typescript_view;

#[cfg(test)]
mod tests;
