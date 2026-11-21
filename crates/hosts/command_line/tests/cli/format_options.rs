//! `rsvelte format`: oxfmt with its options and configuration, and the Svelte formatter for
//! `.svelte` files.

use std::process::{Command, Output};

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
fn format_formats_what_oxfmt_formats_natively_and_svelte() {
    let project = Project::new(&[
        ("a.ts", "const   a = [1,2]\n"),
        ("b.json", "{\"a\":1}\n"),
        ("c.css", "a{color:red}\n"),
        ("d.md", "* a\n"),
        (
            "E.vue",
            "<template>\n<p   class=\"x\">{{ a }}</p>\n</template>\n",
        ),
        (
            "F.svelte",
            "<script>\nlet   a=1\n</script>\n<p   class=\"x\">{a}</p>\n",
        ),
        ("G.astro", "---\n---\n<p   class=\"x\">a</p>\n"),
    ]);
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "const a = [1, 2];\n");
    assert_eq!(read("b.json"), "{ \"a\": 1 }\n");
    assert_eq!(read("c.css"), "a {\n  color: red;\n}\n");
    assert_eq!(read("d.md"), "- a\n");
    assert_eq!(
        read("E.vue"),
        "<template>\n  <p class=\"x\">{{ a }}</p>\n</template>\n"
    );
    assert_eq!(
        read("F.svelte"),
        "<script>\n  let a = 1;\n</script>\n\n<p class=\"x\">{a}</p>\n"
    );
    assert_eq!(read("G.astro"), "---\n---\n<p   class=\"x\">a</p>\n");
}

#[test]
fn format_takes_oxfmts_options_and_configuration_for_svelte_too() {
    let project = Project::new(&[
        (
            ".oxfmtrc.json",
            r#"{ "tabWidth": 4, "svelte": { "indentScriptAndStyle": false } }"#,
        ),
        ("a.ts", "if (x) {\n  y(\"z\");\n}\n"),
        (
            "App.svelte",
            "<script>\n  let a = 1;\n</script>\n\n<p>{#if a}\n<b>a</b>\n{/if}</p>\n",
        ),
    ]);
    let check = project.rsvelte(&["format", "--list-different"]);
    assert_eq!(check.status.code(), Some(1), "{}", text(&check.stderr));
    let listed = text(&check.stdout);
    assert!(
        listed.contains("a.ts") && listed.contains("App.svelte"),
        "{listed}"
    );
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "if (x) {\n    y(\"z\");\n}\n");
    assert_eq!(
        read("App.svelte"),
        "<script>\nlet a = 1;\n</script>\n\n<p>\n    {#if a}\n        <b>a</b>\n    {/if}\n</p>\n"
    );
    let help = project.rsvelte(&["format", "--help"]);
    assert!(
        text(&help.stdout).contains("Usage: rsvelte format"),
        "{}",
        text(&help.stdout)
    );
}

#[test]
fn format_reports_each_svelte_file_whose_options_it_cannot_print_and_formats_the_others() {
    let svelte = "<script>\nlet   a = \"1\"\n</script>\n";
    let project = Project::new(&[
        (".oxfmtrc.json", r#"{ "singleQuote": true }"#),
        ("a.ts", "y(\"z\");\n"),
        ("App.svelte", svelte),
    ]);
    let output = project.rsvelte(&["format"]);
    let report = format!("{}{}", text(&output.stdout), text(&output.stderr));
    assert_eq!(output.status.code(), Some(2), "{report}");
    assert!(
        report.contains("`singleQuote`") && report.contains("App.svelte"),
        "{report}"
    );
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "y('z');\n");
    assert_eq!(read("App.svelte"), svelte);
}

#[test]
fn format_leaves_svelte_files_a_configuration_turns_off() {
    let svelte = "<script>\nlet   a = 1\n</script>\n";
    let project = Project::new(&[
        (".oxfmtrc.json", r#"{ "svelte": false }"#),
        ("a.ts", "y(\"z\")\n"),
        ("App.svelte", svelte),
    ]);
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "y(\"z\");\n");
    assert_eq!(read("App.svelte"), svelte);
}

#[test]
fn format_reads_an_editorconfig_for_svelte_files_as_oxfmt_does() {
    let project = Project::new(&[
        (".editorconfig", "[*]\nindent_style = tab\n"),
        ("a.ts", "if (x) {\n  y(\"z\");\n}\n"),
        ("App.svelte", "<script>\n  let a = 1;\n</script>\n"),
    ]);
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "if (x) {\n\ty(\"z\");\n}\n");
    assert_eq!(read("App.svelte"), "<script>\n\tlet a = 1;\n</script>\n");
}

#[test]
fn format_reports_each_svelte_file_whose_classes_tailwind_would_sort() {
    let svelte = "<p class=\"p-4 flex\">a</p>\n";
    let project = Project::new(&[
        (".oxfmtrc.json", r#"{ "sortTailwindcss": {} }"#),
        ("a.ts", "y(\"z\")\n"),
        ("App.svelte", svelte),
    ]);
    let output = project.rsvelte(&["format"]);
    let report = format!("{}{}", text(&output.stdout), text(&output.stderr));
    assert_eq!(output.status.code(), Some(2), "{report}");
    assert!(
        report.contains("App.svelte") && report.contains("`sortTailwindcss`"),
        "{report}"
    );
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "y(\"z\");\n");
    assert_eq!(read("App.svelte"), svelte);
}

const APP: &str = "\
<script module>
import z from \"z\";
import a from \"a\";
</script>

<script>
import y from \"y\";
import b from \"b\";
/**
 * @param {string} x   the x
 */
function f(x) {}
</script>

<p>{f(\"a\")}</p>
";

const TEMPLATE: &str = "\
<button
  onclick={() => {
    /**
     * @param {string} x   the x
     */
    function g(x) {}
  }}>a</button
>

{#if a}
  {@const b = /** @type {any}   cast */ (y)}
  <p>{b}</p>
{/if}
";

const MARKDOWN: &str = "\
# T

- item

  ```svelte
  <p   class=\"x\">{a}</p>
  ```

```svelte
<script>
import z from \"z\";
import a from \"a\";
/**
 * @param {string} x   the x
 */
function f(x) {}
const o = { aaaaaaaa: 1, bbbbbbbbb: 2, ccccccccc: 3 };
</script>
```
";

const APP_FORMATTED: &str = "\
<script module>
  import a from \"a\";
  import z from \"z\";
</script>

<script>
  import b from \"b\";
  import y from \"y\";
  /** @param {string} x The x */
  function f(x) {}
</script>

<p>{f(\"a\")}</p>
";

const TEMPLATE_FORMATTED: &str = "\
<button
  onclick={() => {
    /**
     * @param {string} x   the x
     */
    function g(x) {}
  }}>a</button
>

{#if a}
  {@const b =
    /** @type {any}   cast */ (y)}
  <p>{b}</p>
{/if}
";

const MARKDOWN_FORMATTED: &str = "\
# T

- item

  ```svelte
  <p class=\"x\">{a}</p>
  ```

```svelte
<script>
  import z from \"z\";
  import a from \"a\";
  /**
   * @param {string} x   the x
   */
  function f(x) {}
  const o = {
    aaaaaaaa: 1,
    bbbbbbbbb: 2,
    ccccccccc: 3,
  };
</script>
```
";

/// The expected texts are oxfmt 0.76's, with `"svelte": true` added to the configuration. The
/// template's code is Prettier's, so its comments stay as written.
#[test]
fn format_sorts_each_scripts_imports_and_formats_jsdoc_as_oxfmt_does() {
    let project = Project::new(&[
        (
            ".oxfmtrc.json",
            r#"{ "sortImports": {}, "jsdoc": {}, "printWidth": 40 }"#,
        ),
        ("App.svelte", APP),
        ("B.svelte", TEMPLATE),
        ("a.md", MARKDOWN),
    ]);
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("App.svelte"), APP_FORMATTED);
    assert_eq!(read("B.svelte"), TEMPLATE_FORMATTED);
    assert_eq!(read("a.md"), MARKDOWN_FORMATTED);
}
