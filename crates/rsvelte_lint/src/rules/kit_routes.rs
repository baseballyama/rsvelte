//! The `SvelteKit` route-file gate shared by the `*-in-kit-pages` rules.
//!
//! Upstream (`utils/svelte-context.ts`) does not test for a `src/routes`
//! segment anywhere in the path: it anchors at **`projectRootDir`** — the
//! directory of the nearest `package.json` walking up from the linted file —
//! joins the configured routes directory onto it (default `src/routes`), and
//! then takes a plain string prefix. A `+page.svelte` that lives under some
//! *other* `src/routes` inside the project is not a route file, and every rule
//! gated on `svelteKitFileTypes` stays silent for it.

use std::path::{Path, PathBuf};

use crate::context::LintContext;

/// The `SvelteKit` route file types the `*-in-kit-pages` rules gate on.
const ROUTE_FILE_NAMES: [&str; 3] = ["+page.svelte", "+layout.svelte", "+error.svelte"];

/// The route-file type of the linted file, or `None` when it is not a route
/// file of *this* project.
///
/// With no filesystem path (wasm / in-memory linting, and the fixture harness,
/// which passes a bare name) upstream's `path.resolve` anchoring has nothing to
/// work with, so the filename alone decides — the same fallback the rules used
/// before the anchoring landed.
#[must_use]
pub fn route_file_type(ctx: &LintContext) -> Option<&'static str> {
    let name = Path::new(ctx.filename())
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or(ctx.filename());
    let kind = ROUTE_FILE_NAMES.into_iter().find(|&r| r == name)?;
    let path = ctx.path()?;
    if path.parent().is_none_or(|p| p == Path::new("")) {
        return Some(kind);
    }
    is_under_project_routes(path).then_some(kind)
}

fn is_under_project_routes(path: &Path) -> bool {
    let absolute = if path.is_absolute() {
        path.to_path_buf()
    } else {
        std::env::current_dir().unwrap_or_default().join(path)
    };
    // `getProjectRootDir` returning null degrades to a bare `src/routes`
    // prefix, which an absolute path never matches.
    let Some(root) = project_root_dir(&absolute) else {
        return false;
    };
    let routes = root.join("src").join("routes");
    absolute
        .to_string_lossy()
        .starts_with(routes.to_string_lossy().as_ref())
}

/// The directory of the nearest `package.json` at or above `file`.
fn project_root_dir(file: &Path) -> Option<PathBuf> {
    let mut dir = file.parent()?.to_path_buf();
    loop {
        if dir.join("package.json").is_file() {
            return Some(dir);
        }
        if !dir.pop() {
            return None;
        }
    }
}
