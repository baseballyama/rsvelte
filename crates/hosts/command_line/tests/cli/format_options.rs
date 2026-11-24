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
fn format_gives_svelte_files_every_option_value_oxfmt_takes() {
    let project = Project::new(&[
        (
            ".oxfmtrc.json",
            r#"{ "quoteProps": "preserve", "trailingComma": "none",
                 "bracketSpacing": false, "arrowParens": "avoid" }"#,
        ),
        (
            "App.svelte",
            "<script>\nconst o = { \"a\": 1, b: [1, 2,], f: (x) => x };\n</script>\n\n\
             <Comp style={{ \"color\": \"red\", b: 1 }} on:x={(e) => f({ \"a\": e })} />\n\
             {#each items as { \"a\": first, b }}\n  \
             {@const c = { \"a\": first, \"b\": b }}\n  {c}\n{/each}\n",
        ),
    ]);
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    // Expected output from oxfmt 0.75.0 with `"svelte": true`.
    assert_eq!(
        read("App.svelte"),
        "<script>\n  const o = {\"a\": 1, b: [1, 2], f: x => x};\n</script>\n\n\
         <Comp style={{\"color\": \"red\", b: 1}} on:x={e => f({\"a\": e})} />\n\
         {#each items as { \"a\": first, b }}\n  \
         {@const c = {\"a\": first, \"b\": b}}\n  {c}\n{/each}\n"
    );
}

#[test]
fn format_gives_svelte_files_the_script_options() {
    let project = Project::new(&[
        (".oxfmtrc.json", r#"{ "semi": false, "singleQuote": true }"#),
        (
            "App.svelte",
            "<script>\nlet   a = \"1\";\n</script>\n<p>{f(\"x\")}</p>\n",
        ),
    ]);
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(
        read("App.svelte"),
        "<script>\n  let a = '1'\n</script>\n\n<p>{f('x')}</p>\n"
    );
}

#[test]
fn format_reads_a_typescript_configuration_with_node() {
    let project = Project::new(&[
        (
            "oxfmt.config.ts",
            "const semi: boolean = false;\nconsole.log('loaded');\n\
             export default { semi, singleQuote: true };\n",
        ),
        ("a.ts", "y(\"z\");\n"),
        ("App.svelte", "<script>\nlet   a = \"1\";\n</script>\n"),
    ]);
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "y('z')\n");
    assert_eq!(read("App.svelte"), "<script>\n  let a = '1'\n</script>\n");
}

#[test]
fn format_reports_a_typescript_configuration_without_an_object() {
    let project = Project::new(&[
        ("oxfmt.config.ts", "export default 1;\n"),
        ("a.ts", "y(\"z\");\n"),
    ]);
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(1), "{}", text(&output.stderr));
    let printed = format!("{}{}", text(&output.stdout), text(&output.stderr));
    assert!(
        printed.contains("must have a default export that is an object"),
        "{printed}"
    );
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
  }}
>
  a
</button>

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

/// The expected texts are oxfmt 0.76's, with `"svelte": true` added to the configuration, except
/// for the elements, which are laid out as prettier-plugin-svelte 4.2.0 lays them out. The
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

/// Files finish on parallel workers, and the report still prints the same on every run.
#[test]
fn format_reports_the_files_it_cannot_format_in_file_order() {
    let names: Vec<String> = (0..40).map(|i| format!("src/E{i:02}.svelte")).collect();
    let files: Vec<(&str, &str)> = (names.iter())
        .map(|name| (name.as_str(), "<svelte:options>x</svelte:options>\n"))
        .collect();
    let project = Project::new(&files);
    let output = project.rsvelte(&["format", "--check", "--threads=8"]);
    assert_eq!(output.status.code(), Some(2));
    let stderr = text(&output.stderr);
    let at: Vec<usize> = (names.iter())
        .map(|name| {
            stderr
                .find(&format!("/{name}]"))
                .unwrap_or_else(|| panic!("{name}: {stderr}"))
        })
        .collect();
    assert!(at.is_sorted(), "{stderr}");
}
