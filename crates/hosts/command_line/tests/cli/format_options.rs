//! `rsvelte format` with the project's formatter configuration: the options of each file, and
//! the files it leaves.

use std::process::{Command, Output};

use rsvelte_test_harness::NodePackages;

use crate::Scratch;

struct Project(Scratch);

impl Project {
    fn new(files: &[(&str, &str)]) -> Self {
        Self(Scratch::new(files))
    }

    fn rsvelte(&self, arguments: &[&str]) -> Output {
        Command::new(env!("CARGO_BIN_EXE_rsvelte"))
            .current_dir(&self.0)
            .args(arguments)
            .output()
            .expect("run CLI")
    }
}

fn text(bytes: &[u8]) -> String {
    String::from_utf8_lossy(bytes).into_owned()
}

#[test]
fn format_follows_the_projects_formatter_configuration() {
    let project = Project::new(&[
        (".prettierrc.json", r#"{"tabWidth":4,"printWidth":100}"#),
        ("a.ts", "if (x) {\n  y(\"z\");\n}\n"),
        ("App.svelte", "<script>\n  let a = 1;\n</script>\n"),
    ]);
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "if (x) {\n    y(\"z\");\n}\n");
    assert_eq!(read("App.svelte"), "<script>\n    let a = 1;\n</script>\n");
}

#[cfg(unix)]
#[test]
fn format_sorts_tailwind_classes_with_the_projects_plugin() {
    let project = Project::new(&[
        (
            ".prettierrc.json",
            r#"{"plugins":["prettier-plugin-svelte","prettier-plugin-tailwindcss"],
                "tailwindFunctions":["cn"]}"#,
        ),
        ("a.ts", "cn(\"p-4 m-2\");\n"),
        ("App.svelte", "<div class=\"p-4 m-2\"></div>\n"),
    ]);
    let packages = NodePackages::locate();
    for package in ["prettier-plugin-tailwindcss", "tailwindcss"] {
        let link = project.0.join("node_modules").join(package);
        std::fs::create_dir_all(link.parent().expect("node_modules")).expect("directory");
        std::os::unix::fs::symlink(packages.package(package), link).expect("link");
    }
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "cn(\"m-2 p-4\");\n");
    assert_eq!(read("App.svelte"), "<div class=\"m-2 p-4\"></div>\n");
}

#[test]
fn format_without_the_tailwind_plugin_says_what_to_install() {
    let project = Project::new(&[
        (".oxfmtrc.json", r#"{"sortTailwindcss":true}"#),
        ("App.svelte", "<div class=\"p-4 m-2\"></div>\n"),
    ]);
    let output = project.rsvelte(&["format"]);
    let stderr = text(&output.stderr);
    assert_eq!(output.status.code(), Some(2), "{stderr}");
    assert!(
        stderr.contains("npm install -D prettier-plugin-tailwindcss"),
        "{stderr}"
    );
    assert_eq!(
        std::fs::read_to_string(project.0.join("App.svelte")).expect("file"),
        "<div class=\"p-4 m-2\"></div>\n"
    );
}

#[test]
fn format_leaves_svelte_files_whose_options_it_cannot_print_and_says_so() {
    let project = Project::new(&[
        (
            ".oxfmtrc.jsonc",
            r#"{
  // the house style
  "singleQuote": true,
  "ignorePatterns": ["generated/"],
}
"#,
        ),
        ("a.ts", "y(\"z\");\n"),
        ("generated/b.ts", "y(\"z\");\n"),
        ("App.svelte", "<script>\nlet   a = \"1\"\n</script>\n"),
    ]);
    let output = project.rsvelte(&["format"]);
    let stderr = text(&output.stderr);
    assert_eq!(output.status.code(), Some(2), "{stderr}");
    assert!(stderr.contains("1 file was not formatted"), "{stderr}");
    assert!(stderr.contains("`singleQuote`"), "{stderr}");
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "y('z');\n");
    assert_eq!(read("generated/b.ts"), "y(\"z\");\n");
    assert_eq!(read("App.svelte"), "<script>\nlet   a = \"1\"\n</script>\n");
}

#[test]
fn format_leaves_the_files_of_a_configuration_it_cannot_honor() {
    let project = Project::new(&[
        (
            ".prettierrc",
            r#"{"overrides":[{"files":"*.ts","options":{"semi":false}}]}"#,
        ),
        (
            "a.ts",
            "y(\"z\")
",
        ),
    ]);
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(2));
    assert!(
        text(&output.stderr).contains("`overrides`"),
        "{}",
        text(&output.stderr)
    );
    assert_eq!(
        std::fs::read_to_string(project.0.join("a.ts")).expect("file"),
        "y(\"z\")\n"
    );
}

#[test]
fn format_resolves_the_configuration_of_each_file_as_prettier_does() {
    let unformatted = "function f() {\nreturn \"x\"\n}\n";
    let project = Project::new(&[
        (".git/HEAD", "ref: refs/heads/main\n"),
        ("sub/.prettierrc", r#"{"tabWidth":4}"#),
        ("sub/a.ts", unformatted),
        ("a.ts", unformatted),
        ("tabs/.editorconfig", "[*.ts]\nindent_style = tab\n"),
        ("tabs/b.ts", unformatted),
    ]);
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "function f() {\n  return \"x\";\n}\n");
    assert_eq!(read("sub/a.ts"), "function f() {\n    return \"x\";\n}\n");
    assert_eq!(read("tabs/b.ts"), "function f() {\n\treturn \"x\";\n}\n");
}

#[test]
fn format_takes_from_rsvelte_config_the_options_it_names() {
    let project = Project::new(&[
        (".prettierrc", r#"{"semi":false}"#),
        ("rsvelte.config.json", r#"{"plugins":{"svelte.format":{}}}"#),
        ("App.svelte", "<script>\nlet   a = 1\n</script>\n"),
        ("a.ts", "y(\"z\");\n"),
    ]);
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("App.svelte"), "<script>\n  let a = 1;\n</script>\n");
    assert_eq!(read("a.ts"), "y(\"z\")\n");
}

#[test]
fn format_ignores_an_unknown_option_and_says_so() {
    let project = Project::new(&[
        (".prettierrc", r#"{"svelteStrictMode":true,"tabWidth":4}"#),
        ("a.ts", "if (x) {\n  y(\"z\");\n}\n"),
    ]);
    let output = project.rsvelte(&["format"]);
    let stderr = text(&output.stderr);
    assert_eq!(output.status.code(), Some(0), "{stderr}");
    assert!(
        stderr.contains("ignored unknown option `svelteStrictMode`"),
        "{stderr}"
    );
    assert_eq!(
        std::fs::read_to_string(project.0.join("a.ts")).expect("file"),
        "if (x) {\n    y(\"z\");\n}\n"
    );
}

#[test]
fn format_reads_nothing_for_a_file_oxfmt_leaves_and_skips_a_package_json_that_does_not_parse() {
    let unformatted = "const a = [1,2];\n";
    let formatted = "const a = [1, 2];\n";
    let project = Project::new(&[
        (
            ".oxfmtrc.json",
            r#"{"ignorePatterns":["vendor/**","fixtures/**","big"]}"#,
        ),
        ("a.ts", unformatted),
        ("vendor/.prettierrc.yaml", "semi: false\n"),
        ("vendor/x.ts", unformatted),
        ("fixtures/bad/package.json", "{ broken\n"),
        ("fixtures/bad/x.ts", unformatted),
        ("big/y.ts", unformatted),
        ("big/sub/.oxfmtrc.json", "{}"),
        ("big/sub/x.ts", unformatted),
        ("prettier/fixtures/package.json", "{ broken\n"),
        ("prettier/.prettierrc", "{}"),
        ("prettier/fixtures/x.ts", unformatted),
    ]);
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), formatted);
    assert_eq!(read("vendor/x.ts"), unformatted);
    assert_eq!(read("fixtures/bad/x.ts"), unformatted);
    assert_eq!(read("big/y.ts"), unformatted);
    assert_eq!(read("big/sub/x.ts"), formatted);
    assert_eq!(read("prettier/fixtures/x.ts"), formatted);
}

#[test]
fn format_leaves_the_files_one_configuration_refuses_and_formats_the_others() {
    let unformatted = "const a = [1,2];\n";
    let project = Project::new(&[
        (".git/HEAD", "ref: refs/heads/main\n"),
        ("a.ts", unformatted),
        ("sub/.prettierrc", "semi: false\n"),
        ("sub/b.ts", unformatted),
        ("sub/App.svelte", "<script>\nlet   a = 1\n</script>\n"),
    ]);
    let output = project.rsvelte(&["format"]);
    let stderr = text(&output.stderr);
    assert_eq!(output.status.code(), Some(2), "{stderr}");
    assert!(stderr.contains("2 files were not formatted"), "{stderr}");
    assert!(stderr.contains(".prettierrc"), "{stderr}");
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "const a = [1, 2];\n");
    assert_eq!(read("sub/b.ts"), unformatted);
    assert_eq!(read("sub/App.svelte"), "<script>\nlet   a = 1\n</script>\n");
}

#[test]
fn format_leaves_the_files_of_options_a_formatter_cannot_read_and_formats_the_others() {
    let unformatted = "const   x = [1,2]\n";
    let project = Project::new(&[
        (".oxfmtrc.json", "{}"),
        ("a.ts", unformatted),
        ("sub/.oxfmtrc.json", r#"{ "printWidth": "x" }"#),
        ("sub/b.ts", unformatted),
    ]);
    let output = project.rsvelte(&["format"]);
    let stderr = text(&output.stderr);
    assert_eq!(output.status.code(), Some(2), "{stderr}");
    assert!(stderr.contains("1 file was not formatted"), "{stderr}");
    assert!(stderr.contains("`printWidth`"), "{stderr}");
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "const x = [1, 2];\n");
    assert_eq!(read("sub/b.ts"), unformatted);
}

#[test]
fn format_leaves_every_file_of_a_configuration_a_formatter_cannot_read() {
    let unformatted = "const   x = [1,2]\n";
    let svelte = "<script lang=\"ts\">\nlet   y = [2]\n</script>\n";
    let project = Project::new(&[
        (".oxfmtrc.json", "{}"),
        ("a.ts", unformatted),
        ("sub/.oxfmtrc.json", r#"{ "svelte": { "sortOrder": 3 } }"#),
        ("sub/b.ts", unformatted),
        ("sub/B.svelte", svelte),
    ]);
    let output = project.rsvelte(&["format"]);
    let stderr = text(&output.stderr);
    assert_eq!(output.status.code(), Some(2), "{stderr}");
    assert!(stderr.contains("2 files were not formatted"), "{stderr}");
    assert!(stderr.contains("`svelte.sortOrder`"), "{stderr}");
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "const x = [1, 2];\n");
    assert_eq!(read("sub/b.ts"), unformatted);
    assert_eq!(read("sub/B.svelte"), svelte);
}

#[test]
fn format_reads_null_as_an_option_left_unset() {
    let project = Project::new(&[
        (".oxfmtrc.json", r#"{ "semi": null, "printWidth": null }"#),
        ("a.ts", "const   x = [1,2]\n"),
    ]);
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "const x = [1, 2];\n");
}

#[test]
fn format_leaves_the_files_of_an_oxfmt_value_oxfmt_does_not_load() {
    let unformatted = "const   x = [1,2]\n";
    for (name, value) in [
        ("endOfLine", r#""auto""#),
        ("printWidth", "321"),
        ("tabWidth", "25"),
    ] {
        let project = Project::new(&[
            (".oxfmtrc.json", "{}"),
            ("a.ts", unformatted),
            ("sub/.oxfmtrc.json", &format!(r#"{{ "{name}": {value} }}"#)),
            ("sub/b.ts", unformatted),
        ]);
        let output = project.rsvelte(&["format"]);
        let stderr = text(&output.stderr);
        assert_eq!(output.status.code(), Some(2), "{name}: {stderr}");
        assert!(
            stderr.contains(&format!("oxfmt does not load this `{name}` value")),
            "{stderr}"
        );
        let read = |file: &str| std::fs::read_to_string(project.0.join(file)).expect("file");
        assert_eq!(read("a.ts"), "const x = [1, 2];\n", "{name}");
        assert_eq!(read("sub/b.ts"), unformatted, "{name}");
    }
}

#[test]
fn format_leaves_every_file_of_a_width_neither_formatter_prints() {
    let unformatted = "const   x = [1,2]\n";
    let svelte = "<script>\nlet   y = [2]\n</script>\n";
    let project = Project::new(&[
        (".git/HEAD", "ref: refs/heads/main\n"),
        ("a.ts", unformatted),
        ("sub/.prettierrc", r#"{"printWidth":1000}"#),
        ("sub/b.ts", unformatted),
        ("sub/B.svelte", svelte),
    ]);
    let output = project.rsvelte(&["format"]);
    let stderr = text(&output.stderr);
    assert_eq!(output.status.code(), Some(2), "{stderr}");
    assert!(stderr.contains("2 files were not formatted"), "{stderr}");
    assert!(
        stderr.contains("does not print this `printWidth` value"),
        "{stderr}"
    );
    let read = |file: &str| std::fs::read_to_string(project.0.join(file)).expect("file");
    assert_eq!(read("a.ts"), "const x = [1, 2];\n");
    assert_eq!(read("sub/b.ts"), unformatted);
    assert_eq!(read("sub/B.svelte"), svelte);
}

#[test]
fn format_reads_an_editorconfig_under_oxfmt_as_oxfmt_loads_it() {
    let source = "function f() {\nreturn 1\n}\n";
    for (properties, code, expected) in [
        ("indent_size = 0", 0, "function f() {\nreturn 1;\n}\n"),
        ("indent_size = tab", 0, "function f() {\n  return 1;\n}\n"),
        ("max_line_length = 0", 2, source),
        ("tab_width = 25", 2, source),
    ] {
        let project = Project::new(&[
            (".oxfmtrc.json", "{}"),
            (".editorconfig", &format!("[*]\n{properties}\n")),
            ("a.ts", source),
        ]);
        let output = project.rsvelte(&["format"]);
        let stderr = text(&output.stderr);
        assert_eq!(output.status.code(), Some(code), "{properties}: {stderr}");
        let read = std::fs::read_to_string(project.0.join("a.ts")).expect("file");
        assert_eq!(read, expected, "{properties}");
    }
}

#[test]
fn format_loads_option_values_as_prettier_loads_them() {
    let source = "function f() {\nreturn 1\n}\n";
    for (options, code, expected) in [
        (
            r#"{"printWidth":80.0}"#,
            0,
            "function f() {\n  return 1;\n}\n",
        ),
        (
            r#"{"tabWidth":4.0}"#,
            0,
            "function f() {\n    return 1;\n}\n",
        ),
        (r#"{"tabWidth":256}"#, 2, source),
        (r#"{"printWidth":null}"#, 2, source),
    ] {
        let project = Project::new(&[
            (".git/HEAD", "ref: refs/heads/main\n"),
            (".prettierrc", options),
            ("a.ts", source),
        ]);
        let output = project.rsvelte(&["format"]);
        let stderr = text(&output.stderr);
        assert_eq!(output.status.code(), Some(code), "{options}: {stderr}");
        let read = std::fs::read_to_string(project.0.join("a.ts")).expect("file");
        assert_eq!(read, expected, "{options}");
    }
}

#[test]
fn format_loads_the_value_a_configuration_leaves_after_editorconfig() {
    const NUMBERS: &str = "1111111111, 2222222222, 3333333333, 4444444444, 5555555555, 6666666666";
    let source = format!("if (x) {{\nx\n}}\nconst   aaaaaaaaaa = [{NUMBERS}]\n");
    let one_line = format!("if (x) {{\n  x;\n}}\nconst aaaaaaaaaa = [{NUMBERS}];\n");
    let width_80 = format!("if (x) {{\n  x;\n}}\nconst aaaaaaaaaa = [\n  {NUMBERS},\n];\n");
    let width_40 = concat!(
        "if (x) {\n  x;\n}\nconst aaaaaaaaaa = [\n",
        "  1111111111, 2222222222, 3333333333,\n",
        "  4444444444, 5555555555, 6666666666,\n];\n",
    );
    let tab_4 = format!("if (x) {{\n    x;\n}}\nconst aaaaaaaaaa = [\n    {NUMBERS},\n];\n");
    for (file, options, properties, code, expected) in [
        (
            ".oxfmtrc.json",
            r#"{"tabWidth":2}"#,
            "indent_size = 30",
            0,
            one_line.as_str(),
        ),
        (
            ".oxfmtrc.json",
            r#"{"printWidth":80}"#,
            "max_line_length = 0",
            0,
            &width_80,
        ),
        (
            ".oxfmtrc.json",
            r#"{"tabWidth":30}"#,
            "indent_size = 2",
            2,
            &source,
        ),
        (
            ".prettierrc",
            r#"{"printWidth":40}"#,
            "max_line_length = 400",
            0,
            width_40,
        ),
        (
            ".prettierrc",
            r#"{"printWidth":40}"#,
            "max_line_length = off",
            0,
            width_40,
        ),
        (
            ".prettierrc",
            r#"{"tabWidth":4}"#,
            "indent_size = 30",
            0,
            &tab_4,
        ),
    ] {
        let cell = format!("{options} {properties}");
        let project = Project::new(&[
            (".git/HEAD", "ref: refs/heads/main\n"),
            (file, options),
            (
                ".editorconfig",
                &format!("root = true\n[*]\n{properties}\n"),
            ),
            ("a.ts", &source),
        ]);
        let output = project.rsvelte(&["format"]);
        let stderr = text(&output.stderr);
        assert_eq!(output.status.code(), Some(code), "{cell}: {stderr}");
        let read = std::fs::read_to_string(project.0.join("a.ts")).expect("file");
        assert_eq!(read, expected, "{cell}");
    }
}

#[test]
fn format_names_the_editorconfig_property_it_refuses() {
    let source = "function f() {\nreturn 1\n}\n";
    for (configuration, properties, reason) in [
        (
            ".oxfmtrc.json",
            "indent_size = 30",
            "oxfmt does not load this `indent_size` value",
        ),
        (
            ".oxfmtrc.json",
            "tab_width = 25",
            "oxfmt does not load this `tab_width` value",
        ),
        (
            ".oxfmtrc.json",
            "max_line_length = 0",
            "oxfmt does not load this `max_line_length` value",
        ),
        (
            ".prettierrc",
            "max_line_length = off",
            "rsvelte does not print this `max_line_length` value yet",
        ),
        (
            ".prettierrc",
            "indent_size = 30",
            "rsvelte does not print this `indent_size` value yet",
        ),
        (
            ".prettierrc",
            "indent_style = space\nindent_size = tab\ntab_width = 30",
            "rsvelte does not print this `tab_width` value yet",
        ),
    ] {
        let project = Project::new(&[
            (".git/HEAD", "ref: refs/heads/main\n"),
            (configuration, "{}"),
            (
                ".editorconfig",
                &format!("root = true\n[*]\n{properties}\n"),
            ),
            ("a.ts", source),
        ]);
        let output = project.rsvelte(&["format"]);
        let stderr = text(&output.stderr);
        assert_eq!(output.status.code(), Some(2), "{properties}: {stderr}");
        let editorconfig = project.0.join(".editorconfig");
        let expected = format!("{}: {reason}", editorconfig.display());
        assert!(stderr.contains(&expected), "{properties}: {stderr}");
        let read = std::fs::read_to_string(project.0.join("a.ts")).expect("file");
        assert_eq!(read, source, "{properties}");
    }
}
