//! `SvelteKit` route components, as `eslint-plugin-svelte` recognizes them.

use rsvelte_lint_runner::rule::Reporter;

use crate::LintSettings;
use crate::project::Location;
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
/// routes directory of `settings` and the file's `svelte.config.js`. Without the host's
/// `svelte.config.js`, the rule fails instead of guessing the routes directory.
pub(super) fn route_file(
    settings: &LintSettings,
    file: &File<'_>,
    reporter: &mut Reporter<'_>,
) -> Option<RouteFile> {
    let kind = route_file_name(file.path())?;
    let svelte_config = match file.svelte_config() {
        Some(Ok(config)) => config,
        Some(Err(why)) => {
            reporter.fail(why);
            return None;
        }
        None => {
            reporter.fail("no host provides the document's svelte.config.js");
            return None;
        }
    };
    let Some(project) = file.svelte_kit() else {
        reporter.fail("no host provides the document's SvelteKit project");
        return None;
    };
    let routes = settings.routes(Some(svelte_config));
    match &project.location {
        Location::InProject(path) => under(routes, path).then_some(kind),
        Location::NoProject => None,
        Location::NameOnly => Some(kind),
    }
}

fn route_file_name(path: &str) -> Option<RouteFile> {
    Some(match path.rsplit(['/', '\\']).next()? {
        "+page.svelte" => RouteFile::Page,
        "+layout.svelte" => RouteFile::Layout,
        "+error.svelte" => RouteFile::Error,
        _ => return None,
    })
}

/// Whether `path` is under `routes`, both from the project's root: upstream's
/// `filePath.startsWith(path.join(root, routes))`.
fn under(routes: &str, path: &str) -> bool {
    let routes = normalize(routes.trim_start_matches('/'));
    // `eslint-plugin-svelte` compares text, so `src/routes2` is under `src/routes` too; routes
    // above the root hold no file of the project.
    !routes.starts_with("..") && path.starts_with(&routes)
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
