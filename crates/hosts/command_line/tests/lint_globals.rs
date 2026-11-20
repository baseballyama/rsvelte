use std::path::PathBuf;
use std::process::Command;
use std::sync::atomic::{AtomicUsize, Ordering};

struct Project(PathBuf);

impl Project {
    fn new() -> Self {
        static NEXT: AtomicUsize = AtomicUsize::new(0);
        let path = std::env::temp_dir().join(format!(
            "rsvelte-cli-lint-globals-{}-{}",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::Relaxed)
        ));
        std::fs::create_dir_all(&path).expect("test directory");
        Self(path)
    }

    /// The `rule`'s findings on `source` under `languageOptions.globals`, as `"rule" line:column`.
    fn findings(&self, rule: &str, source: &str, globals: &str) -> Vec<String> {
        let configuration = format!(
            r#"{{"plugins": {{"svelte.lint": {{
                "rules": {{"{rule}": "error"}},
                "languageOptions": {{"globals": {globals}}}
            }}}}}}"#
        );
        std::fs::write(self.0.join("rsvelte.config.json"), configuration).expect("configuration");
        let component = format!("<script>\n{source}\n</script>\n");
        std::fs::write(self.0.join("Input.svelte"), component).expect("component");
        let output = Command::new(env!("CARGO_BIN_EXE_rsvelte-dev"))
            .current_dir(&self.0)
            .env("PATH", "")
            .args(["run", "Input.svelte", "--task", "svelte.lint/default"])
            .output()
            .expect("run CLI without runtime on PATH");
        assert!(
            matches!(output.status.code(), Some(0 | 1)),
            "{}",
            String::from_utf8_lossy(&output.stderr)
        );
        let stdout = String::from_utf8(output.stdout).expect("UTF-8");
        let json = stdout.split_once('\n').expect("a header line").1;
        let report: serde_json::Value = serde_json::from_str(json).expect("JSON");
        (report["findings"].as_array().expect("findings").iter())
            .map(|finding| {
                let start = &finding["start"];
                format!("{} {}:{}", finding["rule"], start["line"], start["column"])
            })
            .collect()
    }
}

impl Drop for Project {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.0).expect("remove project");
    }
}

/// `ESLint` 10.14.0's findings with eslint-plugin-svelte 3.23.1 and @typescript-eslint/parser
/// 8.72.1. A name no configuration declares is not a global a rule tracks, a `/* global */`
/// comment sets the file's globals over the configuration's, and typescript-eslint declares
/// `Map` whatever `ESLint`'s globals say.
#[test]
fn language_options_and_global_comments_declare_the_globals_that_rules_track() {
    let project = Project::new();
    let browser = "svelte/no-top-level-browser-globals";
    let reactivity = "svelte/prefer-svelte-reactivity";
    let location = "  location.href;";
    let commented = "  /* global location */\n  location.href;";
    let off = "  /* global location:off */\n  location.href;";
    let readonly = r#"{"location": "readonly"}"#;
    let map = "const m = new Map(); m.set(1, 1);";
    let map_off = format!("/* global Map:off */\n{map}");
    let cells: [(&str, &str, &str, Option<&str>); 7] = [
        (browser, location, "{}", None),
        (browser, location, readonly, Some("2:3")),
        (browser, location, r#"{"location": "off"}"#, None),
        (browser, commented, "{}", Some("3:3")),
        (browser, off, readonly, None),
        (reactivity, map, r#"{"Map": "off"}"#, Some("2:11")),
        (reactivity, &map_off, "{}", Some("3:11")),
    ];
    for (rule, source, globals, at) in cells {
        let expected: Vec<String> = at
            .map(|at| format!("\"{rule}\" {at}"))
            .into_iter()
            .collect();
        let found = project.findings(rule, source, globals);
        assert_eq!(found, expected, "{source} {globals}");
    }
}
