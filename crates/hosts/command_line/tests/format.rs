use std::path::PathBuf;
use std::process::Command;
use std::sync::atomic::{AtomicUsize, Ordering};

const UNFORMATTED: &str = "<script>\nlet   a=1\n</script>\n<p   class=\"x\">{a}</p>\n";
const FORMATTED: &str = "<script>\n  let a = 1;\n</script>\n\n<p class=\"x\">{a}</p>\n";

struct Project(PathBuf);

impl Project {
    fn new() -> Self {
        static NEXT: AtomicUsize = AtomicUsize::new(0);
        let path = std::env::temp_dir().join(format!(
            "rsvelte-cli-format-{}-{}",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::Relaxed)
        ));
        for (name, text) in [
            ("src/A.svelte", UNFORMATTED),
            ("src/Clean.svelte", FORMATTED),
            ("node_modules/x/X.svelte", UNFORMATTED),
            (".git/HEAD", "ref: refs/heads/main\n"),
            (".gitignore", "/build/\n"),
            ("build/B.svelte", UNFORMATTED),
            (".prettierignore", "src/generated.svelte\n"),
            ("src/generated.svelte", UNFORMATTED),
        ] {
            let file = path.join(name);
            std::fs::create_dir_all(file.parent().expect("a parent")).expect("directory");
            std::fs::write(file, text).expect("file");
        }
        Self(path)
    }

    fn format(&self, arguments: &[&str]) -> std::process::Output {
        Command::new(env!("CARGO_BIN_EXE_rsvelte-dev"))
            .current_dir(&self.0)
            .arg("format")
            .args(arguments)
            .output()
            .expect("run CLI")
    }

    fn read(&self, name: &str) -> String {
        std::fs::read_to_string(self.0.join(name)).expect("file")
    }
}

impl Drop for Project {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.0).expect("remove project");
    }
}

#[test]
fn check_lists_the_files_to_format_and_writes_nothing() {
    let project = Project::new();
    let output = project.format(&["--check"]);
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert_eq!(output.status.code(), Some(1), "{stdout}");
    assert_eq!(
        stdout,
        "[warn] src/A.svelte\n[warn] 1 of 2 files need formatting.\n"
    );
    assert_eq!(project.read("src/A.svelte"), UNFORMATTED);
}

#[test]
fn format_writes_the_files_that_change_and_skips_node_modules() {
    let project = Project::new();
    let output = project.format(&[]);
    assert_eq!(output.status.code(), Some(0));
    assert_eq!(String::from_utf8_lossy(&output.stdout), "src/A.svelte\n");
    assert_eq!(project.read("src/A.svelte"), FORMATTED);
    assert_eq!(project.read("node_modules/x/X.svelte"), UNFORMATTED);
    let again = project.format(&["--check"]);
    assert_eq!(again.status.code(), Some(0));
}

#[test]
fn an_enclosing_repositorys_excludes_do_not_reach_a_nested_repository() {
    let project = Project::new();
    for (name, text) in [
        (".git/info/exclude", "fixtures\n"),
        ("nested/.git/HEAD", "ref: refs/heads/main\n"),
        ("nested/tests/fixtures/F.svelte", UNFORMATTED),
    ] {
        let file = project.0.join(name);
        std::fs::create_dir_all(file.parent().expect("a parent")).expect("directory");
        std::fs::write(file, text).expect("file");
    }
    let output = Command::new(env!("CARGO_BIN_EXE_rsvelte-dev"))
        .current_dir(project.0.join("nested"))
        .args(["format", "--check"])
        .output()
        .expect("run CLI");
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("tests/fixtures/F.svelte"), "{stdout}");
}
