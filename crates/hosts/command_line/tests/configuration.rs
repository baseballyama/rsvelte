use std::path::PathBuf;
use std::process::Command;
use std::sync::atomic::{AtomicUsize, Ordering};

struct Project(PathBuf);

impl Project {
    fn new() -> Self {
        static NEXT: AtomicUsize = AtomicUsize::new(0);
        let path = std::env::temp_dir().join(format!(
            "rsvelte-cli-config-{}-{}",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::Relaxed)
        ));
        std::fs::create_dir_all(&path).expect("test directory");
        std::fs::write(
            path.join("Input.svelte"),
            concat!(
                "<script>let unused = 1;</script>",
                "<button>Hi</button><style>button { color: red; }</style>"
            ),
        )
        .expect("component");
        Self(path)
    }

    fn write(&self, name: &str, text: &str) {
        std::fs::write(self.0.join(name), text).expect("configuration");
    }

    fn run(&self, arguments: &[&str]) -> std::process::Output {
        Command::new(env!("CARGO_BIN_EXE_rsvelte"))
            .current_dir(&self.0)
            .args(["run", "Input.svelte"])
            .args(arguments)
            .output()
            .expect("run CLI")
    }

    fn run_without_runtime(&self, arguments: &[&str]) -> std::process::Output {
        Command::new(env!("CARGO_BIN_EXE_rsvelte"))
            .current_dir(&self.0)
            .env("PATH", "")
            .args(["run", "Input.svelte"])
            .args(arguments)
            .output()
            .expect("run CLI without runtime on PATH")
    }
}

impl Drop for Project {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.0).expect("remove project");
    }
}

#[test]
fn discovers_json_and_applies_lint_configuration_without_node() {
    let project = Project::new();
    project.write(
        "rsvelte.config.json",
        r#"{
        "plugins": {"svelte.lint": {"rules": {
            "no-unused-vars": "off", "svelte/button-has-type": "warn"
        }}}
    }"#,
    );
    let output = project.run_without_runtime(&["--task", "svelte.lint/default"]);
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    let output = String::from_utf8(output.stdout).expect("UTF-8");
    assert!(output.contains("svelte/button-has-type"));
    assert!(!output.contains("never used"));
    project.write("requires-runtime.mjs", "export default {};");
    let output = project.run_without_runtime(&[
        "--config",
        "requires-runtime.mjs",
        "--task",
        "svelte.lint/default",
    ]);
    assert!(!output.status.success());
    assert!(String::from_utf8_lossy(&output.stderr).contains("node:"));
}

#[test]
fn node_config_callbacks_reach_client_server_and_css_output() {
    let project = Project::new();
    project.write(
        "config.mjs",
        "
        export default {plugins: {'svelte.compile': {cssHash: ({name, css}) => {
            if (!css.includes('color: red')) throw Error('CSS input');
            return 'js-' + name;
        }}}};
    ",
    );
    let output = project.run(&[
        "--config",
        "config.mjs",
        "--config-loader",
        "node",
        "--task",
        "svelte.compile/client",
        "--task",
        "svelte.compile/server",
    ]);
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    let output = String::from_utf8(output.stdout).expect("UTF-8");
    assert!(output.contains("svelte.compile/client"));
    assert!(output.contains("svelte.compile/server"));
    assert!(output.matches("js-Input").count() >= 4, "{output}");
}

#[test]
fn invalid_configuration_fails_before_compilation() {
    let project = Project::new();
    for text in [
        r#"{"plugins":{"missing.plugin":{}}}"#,
        r#"{"plugins":{"svelte.compile":{"unknown":true}}}"#,
        r#"{"plugins":{"svelte.lint":{"rules":{"missing-rule":"off"}}}}"#,
        r#"{"plugins":{"svelte.lint":{"rules":{"no-unused-vars":"typo"}}}}"#,
        r#"{"plugins":{"svelte.lint":{"rules":{
            "svelte/button-has-type":["error",{"typo":true}]
        }}}}"#,
    ] {
        project.write("config.json", text);
        let output = project.run(&["--config", "config.json", "--task", "svelte.compile/client"]);
        assert!(!output.status.success(), "{text}");
        assert!(output.stdout.is_empty(), "{text}");
    }
}

#[cfg(feature = "lint-typed")]
#[test]
fn typed_lint_configuration_enables_and_disables_its_rule() {
    let project = Project::new();
    project.write("Input.svelte", "<script>if (true) console.log(1);</script>");
    for (level, expected) in [("error", true), ("off", false)] {
        project.write(
            "config.json",
            &format!(
                r#"{{
            "plugins": {{"svelte.lint.typed": {{"rules": {{
                "svelte/@typescript-eslint/no-unnecessary-condition": "{level}"
            }}}}}}
        }}"#
            ),
        );
        let output = project.run_without_runtime(&[
            "--config",
            "config.json",
            "--task",
            "svelte.lint.typed/default",
        ]);
        assert!(
            output.status.success(),
            "{}",
            String::from_utf8_lossy(&output.stderr)
        );
        assert_eq!(
            String::from_utf8_lossy(&output.stdout).contains("always truthy"),
            expected
        );
    }
}

#[test]
fn discovery_reports_ambiguity_and_explicit_config_resolves_it() {
    let project = Project::new();
    project.write("rsvelte.config.json", "{}");
    project.write("rsvelte.config.mjs", "export default {};");
    let output = project.run(&["--task", "svelte.lint/default"]);
    assert!(!output.status.success());
    assert!(String::from_utf8_lossy(&output.stderr).contains("multiple configuration files"));
    assert!(
        project
            .run(&[
                "--config",
                "rsvelte.config.json",
                "--task",
                "svelte.lint/default"
            ])
            .status
            .success()
    );
}

#[cfg(unix)]
#[test]
fn json_config_calls_a_native_css_hash_without_node() {
    let project = Project::new();
    let source = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../config/tests/native.c");
    let output = Command::new("cc")
        .args(["-shared", "-fPIC", "-o"])
        .arg(project.0.join("hash.so"))
        .arg(source)
        .output()
        .expect("C compiler");
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    project.write(
        "config.json",
        r#"{
        "plugins": {"svelte.compile": {"cssHash": {
            "backend": "native", "library": "hash.so", "symbol": "css_hash"
        }}}
    }"#,
    );
    let output = project.run_without_runtime(&[
        "--config",
        "config.json",
        "--task",
        "svelte.compile/client",
    ]);
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(String::from_utf8_lossy(&output.stdout).contains("native-Input"));
}
