use std::path::PathBuf;
use std::sync::atomic::{AtomicUsize, Ordering};

use super::svelte_config_near;

/// A directory of files that is removed when dropped.
pub(super) struct Directory(pub(super) PathBuf);

impl Directory {
    pub(super) fn new(files: &[(&str, &str)]) -> Self {
        static NEXT: AtomicUsize = AtomicUsize::new(0);
        let root = std::env::temp_dir().join(format!(
            "rsvelte-lint-project-{}-{}",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::Relaxed)
        ));
        for (name, text) in files {
            let path = root.join(name);
            std::fs::create_dir_all(path.parent().expect("a file has a directory"))
                .expect("a test directory");
            std::fs::write(path, text).expect("a test file");
        }
        Self(root)
    }

    pub(super) fn path(&self, name: &str) -> PathBuf {
        self.0.join(name)
    }
}

impl Drop for Directory {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.0).expect("remove the test directory");
    }
}

fn routes(directory: &Directory, document: &str) -> Option<String> {
    svelte_config_near(&directory.path(document))
        .expect("the configuration reads")
        .kit
        .and_then(|kit| kit.files.routes)
}

#[test]
fn the_nearest_svelte_config_is_read() {
    let directory = Directory::new(&[
        (
            "svelte.config.js",
            "export default { kit: { files: { routes: 'src/pages' } } };",
        ),
        (
            "inner/svelte.config.js",
            "export default { kit: { files: { routes: 'inner/pages' } } };",
        ),
        ("src/pages/+page.svelte", ""),
        ("inner/src/+page.svelte", ""),
    ]);
    assert_eq!(
        routes(&directory, "src/pages/+page.svelte").as_deref(),
        Some("src/pages")
    );
    assert_eq!(
        routes(&directory, "inner/src/+page.svelte").as_deref(),
        Some("inner/pages")
    );
}

#[test]
fn a_config_that_does_not_parse_is_an_error() {
    let directory = Directory::new(&[("svelte.config.js", "export default {"), ("a.svelte", "")]);
    let error = svelte_config_near(&directory.path("a.svelte")).expect_err("does not parse");
    assert!(error.contains("svelte.config.js"), "{error}");
}

#[test]
fn a_document_is_located_from_the_nearest_package_json() {
    use super::{Location, svelte_kit_project};

    let directory = Directory::new(&[
        ("package.json", "{}"),
        ("apps/web/package.json", "{}"),
        // Not an object, so not a package.
        ("apps/web/src/package.json", "[]"),
        ("apps/web/src/routes/+page.svelte", ""),
    ]);
    let document = directory.path("apps/web/src/./x/../routes/+page.svelte");
    assert_eq!(
        svelte_kit_project(&document).location,
        Location::InProject("src/routes/+page.svelte".to_owned())
    );
}

#[test]
fn the_kit_version_is_the_installed_one_then_the_declared_one() {
    use super::svelte_kit_project;

    let directory = Directory::new(&[
        (
            "package.json",
            r#"{"dependencies":{"@sveltejs/kit":"~1.0.0-next.580"}}"#,
        ),
        (
            "a/package.json",
            r#"{"devDependencies":{"@sveltejs/kit":"workspace:*"}}"#,
        ),
        ("a/x.svelte", ""),
        (
            "b/package.json",
            r#"{"devDependencies":{"@sveltejs/kit":"^3.1.0"}}"#,
        ),
        (
            "b/node_modules/@sveltejs/kit/package.json",
            r#"{"version":"2.5.0"}"#,
        ),
        ("b/x.svelte", ""),
        ("c/package.json", r#"{"name":"eslint-plugin-svelte"}"#),
        ("c/x.svelte", ""),
    ]);
    let version = |name: &str| svelte_kit_project(&directory.path(name)).version;
    assert_eq!(version("a/x.svelte").as_deref(), Some("1.0.0-next"));
    assert_eq!(version("b/x.svelte").as_deref(), Some("2"));
    assert_eq!(version("c/x.svelte").as_deref(), Some("2"));
}

#[test]
fn a_kit_version_is_a_major_version() {
    use super::kit_version;

    assert_eq!(kit_version("^2.5.0").as_deref(), Some("2"));
    assert_eq!(kit_version("2.0.0-next.3").as_deref(), Some("2"));
    assert_eq!(kit_version("1.0.0-next.1").as_deref(), Some("1.0.0-next"));
    assert_eq!(kit_version("3"), None);
    assert_eq!(kit_version(">=2.0.0"), None);
}
