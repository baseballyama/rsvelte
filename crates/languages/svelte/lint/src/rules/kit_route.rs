//! `SvelteKit` route components, as `eslint-plugin-svelte` recognizes them.

use crate::LintSettings;
use crate::computation::SvelteConfiguration;
use crate::rule::File;

#[cfg(test)]
mod tests;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub(super) enum RouteFile {
    Page,
    Layout,
    Error,
}

/// The route component `file` is: a `+page.svelte`, `+layout.svelte` or `+error.svelte` under the
/// routes directory of `settings` and the file's `svelte.config.js`.
pub(super) fn route_file(settings: &LintSettings, file: &File<'_>) -> Option<RouteFile> {
    let kind = route_file_name(file.path())?;
    let routes = settings.routes(file.context.facet::<SvelteConfiguration>());
    under(routes, file.path()).then_some(kind)
}

fn route_file_name(path: &str) -> Option<RouteFile> {
    Some(match path.rsplit(['/', '\\']).next()? {
        "+page.svelte" => RouteFile::Page,
        "+layout.svelte" => RouteFile::Layout,
        "+error.svelte" => RouteFile::Error,
        _ => return None,
    })
}

/// Whether `path` is under `routes`; both are paths from the project's root, as the host names
/// documents.
fn under(routes: &str, path: &str) -> bool {
    let routes = normalize(routes);
    // `eslint-plugin-svelte` compares text, so `src/routes2` is under `src/routes` too.
    routes.is_empty() || normalize(path).starts_with(&routes)
}

/// `path.join`'s normalization: no `.` or empty segments, `..` resolved where it can be.
fn normalize(path: &str) -> String {
    let mut segments: Vec<&str> = Vec::new();
    for segment in path.split(['/', '\\']) {
        match segment {
            "" | "." => {}
            ".." if segments.last().is_some_and(|last| *last != "..") => {
                segments.pop();
            }
            _ => segments.push(segment),
        }
    }
    let mut out = segments.join("/");
    if path.starts_with('/') {
        out.insert(0, '/');
    }
    if path.ends_with('/') && !segments.is_empty() {
        out.push('/');
    }
    out
}
