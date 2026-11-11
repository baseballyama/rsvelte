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
fn node_config_callbacks_reach_client_server_and_stylesheet_output() {
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
fn a_node_function_is_a_lint_rule_with_options_and_utf16_ranges() {
    let project = Project::new();
    // JavaScript counts the emoji as two code units and Rust as four bytes.
    project.write("Input.svelte", "<p>😀Hi</p>");
    project.write(
        "config.mjs",
        "
        export default {plugins: {'svelte.lint': {
            plugins: {project: {'no-word': ({path, source, options}) => {
                const [{word}] = JSON.parse(options);
                const start = source.indexOf(word);
                return JSON.stringify([{
                    message: `${word} in ${path}`,
                    range: [start, start + word.length],
                }]);
            }}},
            rules: {'project/no-word': ['warn', {word: 'Hi'}]},
        }}};
    ",
    );
    let output = project.run(&[
        "--config",
        "config.mjs",
        "--config-loader",
        "node",
        "--task",
        "svelte.lint/default",
    ]);
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    let output = String::from_utf8(output.stdout).expect("UTF-8");
    assert!(output.contains(r#""rule": "project/no-word""#), "{output}");
    // The function sees an absolute path, as an `ESLint` rule sees `context.filename`.
    let message = output
        .lines()
        .find_map(|line| line.trim().strip_prefix(r#""message": "Hi in "#))
        .expect("the rule's message");
    assert!(
        message.starts_with('/') && message.ends_with(r#"/Input.svelte","#),
        "{output}"
    );
    // `Hi` starts at UTF-16 column 6 and ends at 8.
    let compact: String = output.split_whitespace().collect();
    assert!(
        compact.contains(r#""start":{"line":1,"column":6},"end":{"line":1,"column":8}"#),
        "{output}"
    );
}

#[test]
fn a_throwing_lint_function_fails_the_document_instead_of_reporting() {
    let project = Project::new();
    project.write(
        "config.mjs",
        "
        export default {plugins: {'svelte.lint': {
            plugins: {project: {broken: () => { throw new Error('boom'); }}},
            rules: {'project/broken': 'error'},
        }}};
    ",
    );
    let output = project.run(&[
        "--config",
        "config.mjs",
        "--config-loader",
        "node",
        "--task",
        "svelte.lint/default",
    ]);
    let all = format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    // The CLI prints a document's diagnostics, as it does a parse error.
    assert!(all.contains("svelte.lint/default diagnostics"), "{all}");
    assert!(all.contains(r#""code": "rule_failed""#), "{all}");
    assert!(
        all.contains("rule `project/broken` failed: Error: boom"),
        "{all}"
    );
    assert!(
        !all.contains(r#""rule": "project/broken""#),
        "no finding: {all}"
    );
}

#[test]
fn command_line_options_replace_a_plugins_options_from_the_file() {
    let project = Project::new();
    project.write(
        "rsvelte.config.json",
        r#"{"plugins": {"svelte.lint": {"rules": {"no-unused-vars": "off"}}}}"#,
    );
    let lint = |extra: &[&str]| {
        let mut arguments = vec!["--task", "svelte.lint/default"];
        arguments.extend(extra);
        let output = project.run_without_runtime(&arguments);
        assert!(
            output.status.success(),
            "{}",
            String::from_utf8_lossy(&output.stderr)
        );
        String::from_utf8(output.stdout).expect("UTF-8")
    };
    assert!(
        !lint(&[]).contains("never used"),
        "the file turns the rule off"
    );
    let replaced = lint(&["--options", "svelte.lint", "{}"]);
    assert!(replaced.contains("never used"), "{replaced}");
}

#[test]
fn an_off_rule_is_not_validated_as_eslint_does_not() {
    let project = Project::new();
    project.write(
        "config.json",
        r#"{"plugins":{"svelte.lint":{"rules":{
            "svelte/not-ported-yet":"off",
            "svelte/button-has-type":["off",{"typo":true}],
            "no-unused-vars":"error"
        }}}}"#,
    );
    let output = project.run(&["--config", "config.json", "--task", "svelte.lint/default"]);
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(String::from_utf8_lossy(&output.stdout).contains("never used"));
}

#[test]
fn invalid_configuration_fails_before_compilation() {
    let project = Project::new();
    for text in [
        r#"{"plugins":{"missing.plugin":{}}}"#,
        r#"{"plugins":{"svelte.compile":{"unknown":true}}}"#,
        r#"{"plugins":{"svelte.lint":{"rules":{"missing-rule":"error"}}}}"#,
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

#[test]
fn a_type_aware_rule_is_configured_as_any_other_rule() {
    let project = Project::new();
    project.write("Input.svelte", "<script>if (true) console.log(1);</script>");
    for (level, expected) in [("error", true), ("off", false)] {
        project.write(
            "config.json",
            &format!(
                r#"{{
            "plugins": {{"svelte.lint": {{"rules": {{
                "svelte/@typescript-eslint/no-unnecessary-condition": "{level}"
            }}}}}}
        }}"#
            ),
        );
        let output = project.run_without_runtime(&[
            "--config",
            "config.json",
            "--task",
            "svelte.lint/default",
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

#[test]
fn json_config_refuses_a_native_function() {
    let project = Project::new();
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
    assert!(!output.status.success());
    assert!(String::from_utf8_lossy(&output.stderr).contains("unknown variant `native`"));
}
