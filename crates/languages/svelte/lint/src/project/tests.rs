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
