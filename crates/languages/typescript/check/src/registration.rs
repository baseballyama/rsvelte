use std::path::Path;
use std::sync::Arc;

use rsvelte_kernel::computation::plugins::Plugin;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;
use rsvelte_plugin_interface::installed_version;
use rsvelte_typescript_tree::{Parsed, is_typescript, matches};

use crate::{CheckedDocument, TypeScriptDocument, TypeScriptEnv, TypeScriptView, kit};

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
    registry.artifact::<Parsed>();
    registry.provide::<TypeScriptView>("typescript", matches, move |context| {
        if !is_typescript(context.document) {
            return Ok(TypeScriptDocument::Unchecked);
        }
        let source = context.source_text();
        let (insertions, imports) = context.get::<Parsed>().as_ref().map_or_else(
            |_| (Vec::new(), Vec::new()),
            |script| {
                let document = context.document;
                let path = document
                    .file
                    .as_deref()
                    .unwrap_or_else(|| Path::new(&document.path));
                let program = script.tree.get_program(script.root);
                (
                    kit::insertions(path, source, program, || hooks_module(path)),
                    crate::imports(program),
                )
            },
        );
        let mut projection = Emitter::default();
        let mut inserted = Vec::with_capacity(insertions.len());
        let mut from = 0;
        for insertion in &insertions {
            projection.copy(source, Span::new(from, insertion.at));
            // A finding that ends in the insertion ends where it is inserted.
            projection.mark(insertion.at);
            let start = projection.out.len() as u32;
            let original = Span::new(insertion.at, next_character_end(source, insertion.at));
            projection.atom(&insertion.text, original);
            inserted.push((Span::new(start, projection.out.len() as u32), original));
            from = insertion.at;
        }
        projection.copy(source, Span::new(from, source.len() as u32));
        Ok(TypeScriptDocument::Checked(Arc::new(CheckedDocument {
            projection: Arc::new(projection),
            map_back: Emitter::lookup_overlap,
            env: Arc::clone(&env),
            extension: ".ts",
            imports,
            store_reads: Vec::new(),
            hidden: Vec::new(),
            drops_unmapped: false,
            inserted,
        })))
    });
}

/// svelte-check reports a finding in an insertion at the character it is inserted before, on
/// that line.
fn next_character_end(source: &str, at: u32) -> u32 {
    match source[at as usize..].chars().next() {
        Some(c) if c != '\n' && c != '\r' => at + c.len_utf8() as u32,
        _ => at,
    }
}

/// svelte2tsx's `getKitTypeImportPath`: the module of the hook types, which `SvelteKit` 3 moved.
fn hooks_module(path: &Path) -> &'static str {
    let version = path
        .parent()
        .and_then(|directory| installed_version("@sveltejs/kit", directory).ok().flatten())
        .and_then(|version| version.split('.').next()?.parse::<u32>().ok());
    match version {
        Some(major) if major >= 3 => "@sveltejs/kit/hooks",
        _ => "@sveltejs/kit",
    }
}
