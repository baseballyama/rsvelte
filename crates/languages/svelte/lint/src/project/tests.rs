use std::path::PathBuf;
use std::sync::atomic::{AtomicUsize, Ordering};

use rsvelte_kernel::computation::file_facts::FileFacts;

use super::{Location, svelte_config_near, svelte_kit_project};

/// A directory of files that is removed when dropped.
struct Directory(PathBuf);

impl Directory {
    fn new(files: &[(&str, &str)]) -> Self {
        static NEXT: AtomicUsize = AtomicUsize::new(0);
        let root = std::env::temp_dir().join(format!(
            "rsvelte-lint-project-{}-{}",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::Relaxed)
        ));
        let directory = Self(root);
        for (name, text) in files {
            directory.write(name, text);
        }
        directory
    }

    fn path(&self, name: &str) -> PathBuf {
        self.0.join(name)
    }

    fn write(&self, name: &str, text: &str) {
        let path = self.path(name);
        std::fs::create_dir_all(path.parent().expect("a file has a directory"))
            .expect("a test directory");
        std::fs::write(path, text).expect("a test file");
    }
}

impl Drop for Directory {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.0).expect("remove the test directory");
    }
}

fn routes(files: &FileFacts, directory: &Directory, document: &str) -> Option<String> {
    svelte_config_near(files, &directory.path(document))
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
    let files = FileFacts::default();
    assert_eq!(
        routes(&files, &directory, "src/pages/+page.svelte").as_deref(),
        Some("src/pages")
    );
    assert_eq!(
        routes(&files, &directory, "inner/src/+page.svelte").as_deref(),
        Some("inner/pages")
    );
}

#[test]
fn a_config_that_does_not_parse_is_an_error() {
    let directory = Directory::new(&[("svelte.config.js", "export default {"), ("a.svelte", "")]);
    let error = svelte_config_near(&FileFacts::default(), &directory.path("a.svelte"))
        .expect_err("does not parse");
    assert!(error.contains("svelte.config.js"), "{error}");
}

#[test]
fn a_svelte_config_is_read_once_until_it_changes() {
    const PAGES: &str = "export default { kit: { files: { routes: 'pages' } } };";
    let directory = Directory::new(&[
        ("svelte.config.js", PAGES),
        ("a.svelte", ""),
        ("b.svelte", ""),
    ]);
    let files = FileFacts::default();
    assert_eq!(
        routes(&files, &directory, "a.svelte").as_deref(),
        Some("pages")
    );
    directory.write(
        "svelte.config.js",
        "export default { kit: { files: { routes: 'views' } } };",
    );
    // Another document of the run shares the answer.
    assert_eq!(
        routes(&files, &directory, "b.svelte").as_deref(),
        Some("pages")
    );
    files.invalidate(&directory.path("a.svelte"));
    assert_eq!(
        routes(&files, &directory, "b.svelte").as_deref(),
        Some("pages")
    );
    files.invalidate(&directory.path("svelte.config.js"));
    assert_eq!(
        routes(&files, &directory, "b.svelte").as_deref(),
        Some("views")
    );
}

#[test]
fn a_new_svelte_config_is_found_once_its_path_is_invalidated() {
    let directory = Directory::new(&[
        ("svelte.config.js", "export default {};"),
        ("src/a.svelte", ""),
    ]);
    let files = FileFacts::default();
    assert_eq!(routes(&files, &directory, "src/a.svelte"), None);
    directory.write(
        "src/svelte.config.js",
        "export default { kit: { files: { routes: 'near' } } };",
    );
    files.invalidate(&directory.path("src/svelte.config.js"));
    assert_eq!(
        routes(&files, &directory, "src/a.svelte").as_deref(),
        Some("near")
    );
}

#[test]
fn a_document_is_located_from_the_nearest_package_json() {
    let directory = Directory::new(&[
        ("package.json", "{}"),
        ("apps/web/package.json", "{}"),
        // Not an object, so not a package.
        ("apps/web/src/package.json", "[]"),
        ("apps/web/src/routes/+page.svelte", ""),
    ]);
    let document = directory.path("apps/web/src/./x/../routes/+page.svelte");
    assert_eq!(
        svelte_kit_project(&FileFacts::default(), &document).location,
        Location::InProject("src/routes/+page.svelte".to_owned())
    );
}

#[test]
fn the_kit_version_is_the_installed_one_then_the_declared_one() {
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
    let files = FileFacts::default();
    let version = |name: &str| svelte_kit_project(&files, &directory.path(name)).version;
    assert_eq!(version("a/x.svelte").as_deref(), Some("1.0.0-next"));
    assert_eq!(version("b/x.svelte").as_deref(), Some("2"));
    assert_eq!(version("c/x.svelte").as_deref(), Some("2"));
}

#[test]
fn a_package_json_is_read_once_until_it_changes() {
    let directory = Directory::new(&[
        (
            "package.json",
            r#"{"devDependencies":{"@sveltejs/kit":"^2.0.0"}}"#,
        ),
        ("src/a.svelte", ""),
        ("src/b.svelte", ""),
    ]);
    let files = FileFacts::default();
    let version = |name: &str| svelte_kit_project(&files, &directory.path(name)).version;
    assert_eq!(version("src/a.svelte").as_deref(), Some("2"));
    directory.write(
        "package.json",
        r#"{"devDependencies":{"@sveltejs/kit":"^3.0.0"}}"#,
    );
    assert_eq!(version("src/b.svelte").as_deref(), Some("2"));
    files.invalidate(&directory.path("package.json"));
    assert_eq!(version("src/b.svelte").as_deref(), Some("3"));
    // Installing Kit changes a directory below the project's, which drops what was read there.
    directory.write(
        "node_modules/@sveltejs/kit/package.json",
        r#"{"version":"2.9.0"}"#,
    );
    files.invalidate(&directory.path("node_modules"));
    assert_eq!(version("src/b.svelte").as_deref(), Some("2"));
}

#[test]
fn without_files_a_document_is_in_a_kit_2_project_by_its_name() {
    use rsvelte_kernel::computation::database::DocumentContext;
    use rsvelte_kernel::computation::registry::Registry;
    use rsvelte_kernel::source::document::Document;

    use crate::computation::{SvelteConfiguration, SvelteKit};

    let mut registry = Registry::new();
    super::register_without_files(&mut registry);
    let document = Document::new("/missing/src/routes/+page.svelte".to_owned(), String::new())
        .expect("document");
    let context = DocumentContext::new(&document, registry.artifacts());
    let kit = context.facet::<SvelteKit>().expect("answered");
    assert_eq!(kit.version.as_deref(), Some("2"));
    assert_eq!(kit.location, Location::NameOnly);
    assert!(
        context
            .facet::<SvelteConfiguration>()
            .expect("answered")
            .is_ok()
    );
}
