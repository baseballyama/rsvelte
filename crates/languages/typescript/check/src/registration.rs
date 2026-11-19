use std::sync::Arc;

use rsvelte_kernel::computation::plugins::Plugin;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::{is_typescript, matches};

use crate::{
    Annotations, CheckedDocument, TypeScriptAnnotations, TypeScriptDocument, TypeScriptEnv,
    TypeScriptView,
};

pub static PLUGIN: Plugin = Plugin {
    identifier: "typescript.check",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[],
};

pub fn register_service(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
}

pub fn register(registry: &mut Registry) {
    register_service(registry);
    let env = Arc::new(TypeScriptEnv::default());
    registry.provide::<TypeScriptView>("typescript", matches, move |context| {
        if !is_typescript(context.document) {
            return Ok(TypeScriptDocument::Unchecked);
        }
        let annotations = context.facet::<TypeScriptAnnotations>();
        Ok(TypeScriptDocument::Checked(Arc::new(CheckedDocument {
            projection: Arc::new(annotated(context.source_text(), annotations)),
            map_back: Emitter::lookup_overlap,
            env: Arc::clone(&env),
            extension: ".ts",
            imports: Vec::new(),
            store_reads: Vec::new(),
            hidden: Vec::new(),
            drops_unmapped: false,
            inserted_finding: annotations.map(|a| a.inserted_finding),
        })))
    });
}

/// `source` with each annotation inserted as an atom of the character it goes before, so that a
/// finding in it is reported there.
fn annotated(source: &str, annotations: Option<&Annotations>) -> Emitter {
    let inserted = annotations.map_or(&[][..], |a| &a.inserted);
    let mut projection = Emitter::with_capacity(
        source.len() + inserted.iter().map(|(_, text)| text.len()).sum::<usize>(),
        inserted.len() + 1,
        inserted.len(),
    );
    let mut copied = 0;
    for (at, text) in inserted {
        if *at > copied {
            projection.copy(source, Span::new(copied, *at));
            copied = *at;
        }
        let character = source[*at as usize..]
            .chars()
            .next()
            .map_or(0, |c| c.len_utf8() as u32);
        projection.atom(text, Span::new(*at, *at + character));
    }
    projection.copy(source, Span::new(copied, source.len() as u32));
    projection
}

#[cfg(test)]
mod tests;
