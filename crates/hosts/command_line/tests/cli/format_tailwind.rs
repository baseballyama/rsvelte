//! `rsvelte format` with `sortTailwindcss`: the project's prettier-plugin-tailwindcss sorts the
//! classes, run by Node.js. The expected texts are oxfmt 0.76's, with the same plugin and
//! Tailwind CSS 4.3.5, and `"svelte": true` added to the configuration for a Svelte file.

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

const COMPONENT: &str = r#"<script lang="ts">
  import { cn } from "./cn";
  let a = $state(true);
  let y = "x";
  const x = cn("p-4 flex p-4", `mt-2 flex ${y}p-4 block`, { "p-4 flex": a });
  const z: "p-4 flex" = "p-4 flex";
</script>

<div class="flex p-4 flex  p-4 foo{a}p-4 flex mt-2 flex">a</div>
<div class="p-4{a ? 'p-4 flex flex' : ''} flex p-4 ">b</div>
<div class="{a ? 'p-4 flex flex' : `mt-2 block p-4 ${y} flex p-4`}">c</div>
<div class={a ? "p-4 flex flex" : ["mt-2 block", { "p-4 flex": a }]}>d</div>
<div class={`p-4 flex ${a ? "mt-2 block p-4" : ""} flex`}>e</div>
<div class="p-4 flex" class:flex={a}>f</div>
<div class="  ">g</div>
<div class="">h</div>
<div class>i</div>
<div class="p-4 &quot;flex&quot; flex mt-2">j</div>
<div class={"p-4 flex" as "p-4 flex"}>k</div>
<div class="p-4	flex
  mt-2">l</div>
<svelte:element this="div" class="p-4 flex">m</svelte:element>
{#snippet s()}<i class="p-4 flex">n</i>{/snippet}
{#await a}<i class="p-4 flex">o</i>{:then v}<i class="p-4 flex">{v}</i>{/await}
<div class="p-4 block flex grid">p</div>
<div class="hover:p-4 p-4 sm:flex flex md:p-2 unknown-x p-2">q</div>

<style lang="scss">
  .a {
    @apply p-4 flex mt-2;
  }
</style>
"#;

const COMPONENT_SORTED: &str = r#"<script lang="ts">
  import { cn } from "./cn";
  let a = $state(true);
  let y = "x";
  const x = cn("flex p-4", `mt-2 flex ${y}p-4 block`, { "flex p-4": a });
  const z: "p-4 flex" = "p-4 flex";
</script>

<div class="flex p-4 foo{a}p-4 mt-2 flex">a</div>
<div class="p-4{a ? 'flex flex p-4' : ''} flex p-4">b</div>
<div class={a ? "flex flex p-4" : `mt-2 block p-4 ${y} flex p-4`}>c</div>
<div class={a ? "flex flex p-4" : ["mt-2 block", { "flex p-4": a }]}>d</div>
<div class={`flex p-4 ${a ? "mt-2 block p-4" : ""} flex`}>e</div>
<div class="flex p-4" class:flex={a}>f</div>
<div class="  ">g</div>
<div class="">h</div>
<div class>i</div>
<div class="&quot;flex&quot; mt-2 flex p-4">j</div>
<div class={"flex p-4" as "flex p-4"}>k</div>
<div
  class="mt-2 flex
  p-4"
>
  l
</div>
<svelte:element this="div" class="flex p-4">m</svelte:element>
{#snippet s()}<i class="flex p-4">n</i>{/snippet}
{#await a}<i class="flex p-4">o</i>{:then v}<i class="flex p-4">{v}</i>{/await}
<div class="block flex grid p-4">p</div>
<div class="unknown-x flex p-2 p-4 hover:p-4 sm:flex md:p-2">q</div>

<style lang="scss">
  .a {
    @apply mt-2 flex p-4;
  }
</style>
"#;

const COMPONENT_SORTED_WITH_DUPLICATES: &str = r#"<script lang="ts">
  import { cn } from "./cn";
  let a = $state(true);
  let y = "x";
  const x = cn("flex p-4 p-4", `mt-2 flex ${y}p-4 block`, { "flex p-4": a });
  const z: "p-4 flex" = "p-4 flex";
</script>

<div class="flex flex p-4 p-4 foo{a}p-4 mt-2 flex flex">a</div>
<div class="p-4{a ? 'flex flex p-4' : ''} flex p-4">b</div>
<div class={a ? "flex flex p-4" : `mt-2 block p-4 ${y} flex p-4`}>c</div>
<div class={a ? "flex flex p-4" : ["mt-2 block", { "flex p-4": a }]}>d</div>
<div class={`flex p-4 ${a ? "mt-2 block p-4" : ""} flex`}>e</div>
<div class="flex p-4" class:flex={a}>f</div>
<div class="  ">g</div>
<div class="">h</div>
<div class>i</div>
<div class="&quot;flex&quot; mt-2 flex p-4">j</div>
<div class={"flex p-4" as "flex p-4"}>k</div>
<div
  class="mt-2 flex
  p-4"
>
  l
</div>
<svelte:element this="div" class="flex p-4">m</svelte:element>
{#snippet s()}<i class="flex p-4">n</i>{/snippet}
{#await a}<i class="flex p-4">o</i>{:then v}<i class="flex p-4">{v}</i>{/await}
<div class="block flex grid p-4">p</div>
<div class="unknown-x flex p-2 p-4 hover:p-4 sm:flex md:p-2">q</div>

<style lang="scss">
  .a {
    @apply mt-2 flex p-4;
  }
</style>
"#;

#[test]
fn format_sorts_a_svelte_files_classes_as_oxfmt_with_prettier_plugin_svelte_does() {
    for (configuration, expected) in [
        (CONFIGURATION, COMPONENT_SORTED),
        (
            r#"{ "sortTailwindcss": { "stylesheet": "./app.css", "functions": ["cn"],
                 "preserveDuplicates": true, "preserveWhitespace": true } }"#,
            COMPONENT_SORTED_WITH_DUPLICATES,
        ),
    ] {
        let project = project(&[("App.svelte", COMPONENT)], true);
        std::fs::write(project.join(".oxfmtrc.json"), configuration).expect("configuration");
        let output = rsvelte_format(&project);
        assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
        let formatted = std::fs::read_to_string(project.join("App.svelte")).expect("file");
        assert_eq!(formatted, expected);
    }
}

/// A duplicate takes the whitespace one place after it in the sorted classes, which shows where
/// the whitespace holds a line break.
#[test]
fn format_drops_a_duplicate_svelte_class_with_the_whitespace_the_plugin_drops() {
    let project = project(
        &[(
            "App.svelte",
            "<div class=\"p-4 flex p-4\n  mt-2 block\n  grid\">a</div>\n<div class=\"flex\n  p-4 flex mt-2\">b</div>\n",
        )],
        true,
    );
    let output = rsvelte_format(&project);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let formatted = std::fs::read_to_string(project.join("App.svelte")).expect("file");
    assert_eq!(
        formatted,
        "<div\n  class=\"mt-2 block flex\n  grid p-4\"\n>\n  a\n</div>\n<div\n  class=\"mt-2\n  flex p-4\"\n>\n  b\n</div>\n"
    );
}

#[test]
fn format_reports_each_svelte_file_whose_classes_it_cannot_sort() {
    for (configuration, plugin, reason) in [
        (CONFIGURATION, false, "prettier-plugin-tailwindcss"),
        (
            r#"{ "sortTailwindcss": { "attributes": ["/Class$/"] } }"#,
            true,
            "/Class$/",
        ),
    ] {
        let svelte = "<p class=\"p-4 flex\">a</p>\n";
        let project = project(&[("App.svelte", svelte)], plugin);
        std::fs::write(project.join(".oxfmtrc.json"), configuration).expect("configuration");
        let output = rsvelte_format(&project);
        let report = format!("{}{}", text(&output.stdout), text(&output.stderr));
        assert_eq!(output.status.code(), Some(2), "{report}");
        assert!(
            report.contains(reason) && report.contains("App.svelte"),
            "{report}"
        );
        let formatted = std::fs::read_to_string(project.join("App.svelte")).expect("file");
        assert_eq!(formatted, svelte);
    }
}
