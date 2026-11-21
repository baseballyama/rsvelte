//! `rsvelte format` with `sortTailwindcss`: the project's prettier-plugin-tailwindcss sorts the
//! classes, run by Node.js. The expected texts are oxfmt 0.76's, with the same plugin and
//! Tailwind CSS 4.3.5.

use std::process::{Command, Output};

use rsvelte_test_harness::NodePackages;

use crate::Scratch;

const CONFIGURATION: &str =
    r#"{ "sortTailwindcss": { "stylesheet": "./app.css", "functions": ["cn"] } }"#;

/// A project holding `files`, and the plugin and Tailwind CSS unless `plugin` is false.
fn project(files: &[(&str, &str)], plugin: bool) -> Scratch {
    let mut all = vec![
        (".oxfmtrc.json", CONFIGURATION),
        ("app.css", "@import \"tailwindcss\";\n"),
    ];
    all.extend_from_slice(files);
    let project = Scratch::new(&all);
    if plugin {
        let packages = NodePackages::locate();
        std::fs::create_dir_all(project.join("node_modules")).expect("node_modules");
        for name in ["tailwindcss", "prettier-plugin-tailwindcss"] {
            symlink(
                &packages.package(name),
                &project.join("node_modules").join(name),
            );
        }
    }
    project
}

#[cfg(unix)]
fn symlink(target: &std::path::Path, link: &std::path::Path) {
    std::os::unix::fs::symlink(target, link).expect("link");
}

#[cfg(windows)]
fn symlink(target: &std::path::Path, link: &std::path::Path) {
    std::os::windows::fs::symlink_dir(target, link).expect("link");
}

fn rsvelte_format(project: &Scratch) -> Output {
    Command::new(env!("CARGO_BIN_EXE_rsvelte"))
        .current_dir(project)
        .arg("format")
        .output()
        .expect("run CLI")
}

fn text(bytes: &[u8]) -> String {
    String::from_utf8_lossy(bytes).into_owned()
}

#[test]
fn format_sorts_the_classes_of_each_file_oxfmt_formats_as_oxfmt_does() {
    let project = project(
        &[
            (
                "a.tsx",
                "export const A = () => <div className=\"p-4 flex  text-red-500 mt-2\">\
                 {cn(\"p-4 flex\", \"mt-2 block\")}</div>;\n",
            ),
            ("b.css", ".a {\n  @apply p-4 flex mt-2;\n}\n"),
            ("c.html", "<div class=\"p-4 flex mt-2\">a</div>\n"),
            (
                "d.vue",
                "<template>\n  <div class=\"p-4 flex mt-2\" :class=\"{ 'p-4 flex': a }\">a</div>\n\
                 </template>\n",
            ),
            (
                "e.md",
                "# T\n\n```tsx\n<div className=\"p-4 flex mt-2\" />;\n```\n",
            ),
        ],
        true,
    );
    let output = rsvelte_format(&project);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.join(name)).expect("file");
    assert_eq!(
        read("a.tsx"),
        "export const A = () => (\n  <div className=\"mt-2 flex p-4 text-red-500\">\
         {cn(\"flex p-4\", \"mt-2 block\")}</div>\n);\n"
    );
    assert_eq!(read("b.css"), ".a {\n  @apply mt-2 flex p-4;\n}\n");
    assert_eq!(read("c.html"), "<div class=\"mt-2 flex p-4\">a</div>\n");
    assert_eq!(
        read("d.vue"),
        "<template>\n  <div class=\"mt-2 flex p-4\" :class=\"{ 'flex p-4': a }\">a</div>\n\
         </template>\n"
    );
    assert_eq!(
        read("e.md"),
        "# T\n\n```tsx\n<div className=\"mt-2 flex p-4\" />\n```\n"
    );
}

#[test]
fn format_reports_each_file_whose_classes_it_cannot_sort_and_formats_the_others() {
    let classes = "<div className=\"p-4 flex\" />;\n";
    let project = project(&[("a.tsx", classes), ("b.ts", "const a  = 1\n")], false);
    let output = rsvelte_format(&project);
    let report = format!("{}{}", text(&output.stdout), text(&output.stderr));
    assert_eq!(output.status.code(), Some(2), "{report}");
    assert!(
        report.contains("prettier-plugin-tailwindcss") && report.contains("a.tsx"),
        "{report}"
    );
    let read = |name: &str| std::fs::read_to_string(project.join(name)).expect("file");
    assert_eq!(read("a.tsx"), classes);
    assert_eq!(read("b.ts"), "const a = 1;\n");
}
