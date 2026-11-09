//! The `SvelteKit` rules on a project on disk: what they read from the files around a document, as
//! `eslint-plugin-svelte` does.

use std::path::PathBuf;
use std::process::Command;
use std::sync::atomic::{AtomicUsize, Ordering};

struct Project(PathBuf);

impl Project {
    fn new(files: &[(&str, &str)]) -> Self {
        static NEXT: AtomicUsize = AtomicUsize::new(0);
        let root = std::env::temp_dir().join(format!(
            "rsvelte-cli-kit-{}-{}",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::Relaxed)
        ));
        for (name, text) in files {
            let path = root.join(name);
            std::fs::create_dir_all(path.parent().expect("a file has a directory"))
                .expect("test directory");
            std::fs::write(path, text).expect("test file");
        }
        Self(root)
    }

    /// The rules that report on `file`, linted from `directory` with `rules` on.
    fn rules(&self, directory: &str, file: &str, rules: &[&str]) -> Vec<String> {
        let options = format!(
            r#"{{"rules":{{{}}}}}"#,
            rules
                .iter()
                .map(|rule| format!(r#""svelte/{rule}":"error""#))
                .collect::<Vec<_>>()
                .join(",")
        );
        let output = Command::new(env!("CARGO_BIN_EXE_rsvelte"))
            .current_dir(self.0.join(directory))
            .args(["run", file, "--task", "svelte.lint/default"])
            .args(["--options", "svelte.lint", &options])
            .output()
            .expect("run CLI");
        let stdout = String::from_utf8(output.stdout).expect("UTF-8");
        assert!(
            output.status.success(),
            "{stdout}{}",
            String::from_utf8_lossy(&output.stderr)
        );
        let start = stdout
            .find('{')
            .unwrap_or_else(|| panic!("no report: {stdout}"));
        let report: serde_json::Value =
            serde_json::from_str(&stdout[start..]).expect("the report is JSON");
        report["findings"]
            .as_array()
            .expect("findings")
            .iter()
            .map(|finding| finding["rule"].as_str().expect("a rule").to_owned())
            .collect()
    }
}

impl Drop for Project {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.0).expect("remove project");
    }
}

const KIT_2: &str = r#"{"devDependencies":{"@sveltejs/kit":"^2.0.0"}}"#;
const PROP: &str = "<script>export let foo;</script>";
const VALID_PROPS: &str = "valid-prop-names-in-kit-pages";

#[test]
fn the_routes_directory_comes_from_svelte_config() {
    let project = Project::new(&[
        ("package.json", KIT_2),
        (
            "svelte.config.js",
            "export default { kit: { files: { routes: 'src/pages' } } };",
        ),
        ("src/pages/x/+page.svelte", PROP),
        ("src/routes/x/+page.svelte", PROP),
    ]);
    assert_eq!(
        project.rules(".", "src/pages/x/+page.svelte", &[VALID_PROPS]),
        [format!("svelte/{VALID_PROPS}")]
    );
    assert_eq!(
        project.rules(".", "src/routes/x/+page.svelte", &[VALID_PROPS]),
        [""; 0]
    );
}

/// A `kit.files` with code in it is dropped whole, so the routes are the default.
#[test]
fn files_with_code_in_them_leave_the_default_routes() {
    let project = Project::new(&[
        ("package.json", KIT_2),
        (
            "svelte.config.js",
            "export default { kit: { files: { routes: 'src/pages', lib: process.env.LIB } } };",
        ),
        ("src/routes/+page.svelte", PROP),
    ]);
    assert_eq!(
        project.rules(".", "src/routes/+page.svelte", &[VALID_PROPS]),
        [format!("svelte/{VALID_PROPS}")]
    );
}

/// `ESLint` names a document by its absolute path, so an absolute argument is the same document.
#[test]
fn an_absolute_path_is_the_same_document() {
    let project = Project::new(&[("package.json", KIT_2), ("src/routes/+page.svelte", PROP)]);
    let absolute = project.0.join("src/routes/+page.svelte");
    let absolute = absolute.to_str().expect("UTF-8 path");
    assert_eq!(
        project.rules(".", absolute, &[VALID_PROPS]),
        [format!("svelte/{VALID_PROPS}")]
    );
    assert_eq!(
        project.rules("src", "routes/+page.svelte", &[VALID_PROPS]),
        [format!("svelte/{VALID_PROPS}")]
    );
}

/// The routes are under the nearest `package.json`'s directory, wherever the command runs.
#[test]
fn routes_start_at_the_nearest_package_json() {
    let project = Project::new(&[
        ("package.json", KIT_2),
        ("apps/web/package.json", KIT_2),
        ("apps/web/src/routes/+page.svelte", PROP),
        ("apps/web/src/lib/+page.svelte", PROP),
        // Upstream compares text, so `src/routes2` is under `src/routes`.
        ("src/routes2/+page.svelte", PROP),
    ]);
    assert_eq!(
        project.rules(".", "apps/web/src/routes/+page.svelte", &[VALID_PROPS]),
        [format!("svelte/{VALID_PROPS}")]
    );
    assert_eq!(
        project.rules(".", "apps/web/src/lib/+page.svelte", &[VALID_PROPS]),
        [""; 0]
    );
    assert_eq!(
        project.rules("apps", "../src/routes2/+page.svelte", &[VALID_PROPS]),
        [format!("svelte/{VALID_PROPS}")]
    );
}
