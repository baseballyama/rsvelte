use std::sync::Arc;

use rsvelte_kernel::computation::pipeline::Registry;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript::matches;

use crate::{TypeScriptDocument, TypeScriptEnv, TypeScriptView};

pub static PLUGIN: Plugin = Plugin {
    identifier: "typescript.check",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "typescript",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register_service(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_typescript::register(registry);
}

pub fn register(registry: &mut Registry) {
    register_service(registry);
    let env = Arc::new(TypeScriptEnv::default());
    registry.provide::<TypeScriptView>("typescript", matches, move |context| {
        if !rsvelte_typescript::is_typescript(context.document) {
            return Ok(TypeScriptDocument::Unchecked);
        }
        let mut projection = Emitter::new();
        projection.copy(
            context.source_text(),
            Span::new(0, context.source_text().len() as u32),
        );
        Ok(TypeScriptDocument::Checked {
            projection,
            map_back: Emitter::lookup_overlap,
            env: Arc::clone(&env),
        })
    });
}
