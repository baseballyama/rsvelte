//! The tsconfig the check writes over the project's: its roots, its `paths` and the content
//! mappers that read the documents.

use std::collections::HashSet;
use std::path::{Path, PathBuf};

use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::paths;
use rsvelte_typescript_api::Layer;

use super::untyped::{self, UntypedJavaScript};
use super::{BaseProject, CheckRequest, MAPPER_PACKAGE, script_module};

/// The overlay's roots: the project's own, then each of the documents at `paths` the project
/// does not reach, the stand-ins of script modules, the declarations and the included files; and
/// whether any of them is not one of the project's own.
pub(super) fn overlay_roots(
    req: &CheckRequest<'_>,
    (root, paths): (&Path, &[PathBuf]),
    own: &mut BaseProject,
    declarations: Vec<PathBuf>,
    (overlay, layer): (&Path, &mut Layer),
) -> (Vec<PathBuf>, bool) {
    let mut roots = std::mem::take(&mut own.roots);
    let own_roots = roots.len();
    own.script_modules = own.node_resolution && script_module::add(layer, &roots, paths, req);
    if own.untyped == UntypedJavaScript::All {
        let declaration = untyped::options_declaration(overlay);
        roots.push(declaration.0.clone());
        layer.files.insert(declaration.0, declaration.1);
    }
    // A document is a root only where the project does not reach it.
    roots.extend(
        (paths.iter())
            .filter(|path| !own.selected.reached.contains(*path))
            .cloned(),
    );
    // Upstream's project holds every component, so one that is not checked still declares its
    // globals.
    roots.extend(req.stand_ins(root).map(|(path, _)| path).filter(|path| {
        (req.env.script_modules.iter())
            .any(|extension| path.as_os_str().to_string_lossy().ends_with(extension))
    }));
    roots.extend(declarations);
    roots.extend(req.env.include.iter().cloned());
    let (own_part, added) = roots.split_at(own_roots);
    let own_part: HashSet<&PathBuf> = own_part.iter().collect();
    let adds = added.iter().any(|root| !own_part.contains(root));
    (roots, adds)
}

/// The overlay's text: `noEmit` and the `paths` over the tsconfig `base`, the mappers of the
/// `store`, and `roots` as its files.
pub(super) fn tsconfig_json(
    base: Option<&Path>,
    req: &CheckRequest<'_>,
    own: &BaseProject,
    roots: &[PathBuf],
    store: Option<&Path>,
) -> String {
    let mut w = StructuredDataWriter::new(true);
    w.begin_object();
    if let Some(base) = base {
        w.key("extends").write_string(&paths::typescript(base));
    }
    w.key("compilerOptions")
        .begin_object()
        .key("noEmit")
        .write_boolean(true);
    if own.script_modules {
        // A script module's declaration has the name of a document, such as `x.d.svelte.ts`.
        w.key("allowArbitraryExtensions").write_boolean(true);
    }
    w.key("paths").begin_object();
    for (spec, targets) in &own.paths {
        if req.env.paths.iter().any(|(own, _)| own == spec) {
            continue;
        }
        w.key(spec).begin_array();
        for target in targets {
            w.write_string(&paths::typescript(target));
        }
        w.end_array();
    }
    for (spec, file) in &req.env.paths {
        w.key(spec)
            .begin_array()
            .write_string(&paths::typescript(file))
            .end_array();
    }
    w.end_object().end_object();
    if let Some(store) = store {
        req.write_mapper_config(&mut w, MAPPER_PACKAGE, store);
    }
    w.key("files").begin_array();
    let mut listed = HashSet::new();
    for p in roots {
        if listed.insert(p) {
            w.write_string(&paths::typescript(p));
        }
    }
    w.end_array().end_object();
    w.finish()
}
