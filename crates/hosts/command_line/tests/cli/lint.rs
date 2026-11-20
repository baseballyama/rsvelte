use crate::Scratch;

struct Project(Scratch);

impl Project {
    fn new() -> Self {
        Self(Scratch::new(&[
            ("src/App.svelte", "<script>\n  let unused = 1;\n</script>\n"),
            ("src/Clean.svelte", "<p>Hi</p>\n"),
            (
                "node_modules/x/X.svelte",
                "<script>let ignored = 1;</script>\n",
            ),
            ("notes.txt", "not a component\n"),
        ]))
    }

    fn lint(&self, arguments: &[&str]) -> std::process::Output {
        crate::rsvelte_dev(&self.0)
            .arg("lint")
            .args(arguments)
            .output()
            .expect("run CLI")
    }
}

#[test]
fn lint_reports_the_files_below_the_directory_as_eslint_does() {
    let project = Project::new();
    let output = project.lint(&[]);
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert_eq!(output.status.code(), Some(1), "{stdout}");
    assert!(stdout.contains("App.svelte\n"), "{stdout}");
    assert!(
        stdout.contains("2:7  error  'unused' is assigned a value but never used  no-unused-vars"),
        "{stdout}"
    );
    assert!(stdout.contains("no-unused-vars"), "{stdout}");
    assert!(
        !stdout.contains("ignored"),
        "node_modules is skipped: {stdout}"
    );
    assert!(!stdout.contains("Clean.svelte"), "{stdout}");
    assert!(
        stdout.ends_with("\u{2716} 1 problem (1 error, 0 warnings)\n\n"),
        "{stdout}"
    );
}

#[test]
fn lint_of_a_clean_file_prints_nothing() {
    let project = Project::new();
    let output = project.lint(&["src/Clean.svelte"]);
    assert_eq!(output.status.code(), Some(0));
    assert_eq!(String::from_utf8_lossy(&output.stdout), "");
}

#[test]
fn lint_orders_files_and_aligns_positions_as_stylish_does() {
    let project = Project::new();
    let file = project.0.join("src-a/Two.svelte");
    std::fs::create_dir_all(file.parent().expect("a parent")).expect("directory");
    let text = "<script>\n  let a = 1;\n\n\n\n\n\n\n\n        let bb = 2;\n</script>\n";
    std::fs::write(file, text).expect("file");
    let output = project.lint(&[]);
    let stdout = String::from_utf8_lossy(&output.stdout);
    let two = stdout
        .find("src-a/Two.svelte")
        .expect("Two.svelte is listed");
    let app = stdout.find("src/App.svelte").expect("App.svelte is listed");
    assert!(two < app, "`-` sorts before `/`: {stdout}");
    assert!(stdout.contains("\n   2:7   error  "), "{stdout}");
    assert!(stdout.contains("\n  10:13  error  "), "{stdout}");
}

#[test]
fn lint_prints_an_unused_directive_without_a_rule_and_counts_it_fixable() {
    let project = Project::new();
    let text = concat!(
        "<script>\n",
        "  // eslint-disable-next-line no-unused-vars\n",
        "  export const used = 1;\n",
        "</script>\n",
    );
    std::fs::write(project.0.join("src/Clean.svelte"), text).expect("file");
    let output = project.lint(&["src/Clean.svelte"]);
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("(no problems were reported from 'no-unused-vars')\n"),
        "the row ends at its message: {stdout}"
    );
    assert!(
        stdout.ends_with(concat!(
            "\u{2716} 1 problem (0 errors, 1 warning)\n",
            "  0 errors and 1 warning potentially fixable with the `--fix` option.\n\n",
        )),
        "{stdout}"
    );
}

#[test]
fn lint_counts_lines_and_columns_as_eslint_does() {
    let project = Project::new();
    // Each expected row is what `eslint --format stylish` prints for the same file.
    for (name, text, rows) in [
        (
            "Bom.svelte",
            "\u{feff}<script>let unused = 1;</script>\n",
            &["1:13  error"][..],
        ),
        (
            "Cr.svelte",
            "<script>\r  let unused = 1;\r</script>\r",
            &["2:7  error"][..],
        ),
        (
            "Separator.svelte",
            "<script>\n  const s = '\u{2028}';\n  let unused = 1;\n</script>\n",
            &["2:9  error", "4:7  error"][..],
        ),
    ] {
        std::fs::write(project.0.join("src").join(name), text).expect("file");
        let output = project.lint(&[&format!("src/{name}")]);
        let stdout = String::from_utf8_lossy(&output.stdout);
        for row in rows {
            assert!(stdout.contains(&format!("\n  {row}  ")), "{name}: {stdout}");
        }
    }
}

#[test]
fn lint_prints_a_parse_error_as_eslint_does() {
    let project = Project::new();
    // Each expected row is what `eslint --format stylish` prints with svelte-eslint-parser.
    for (name, text, row) in [
        (
            "Block.svelte",
            "<script>\n  let unused = 1;\n</script>\n\n<div>\n  {#if x}\n</div>\n",
            concat!(
                "  7:0  error  Parsing error: `</div>` attempted to close an element that was not ",
                "open\nhttps://svelte.dev/e/element_invalid_closing_tag\n",
            ),
        ),
        (
            "Bom.svelte",
            "\u{feff}<p>{</p>\n",
            "  1:4  error  Parsing error: Unexpected token\nhttps://svelte.dev/e/js_parse_error\n",
        ),
    ] {
        std::fs::write(project.0.join("src").join(name), text).expect("file");
        let output = project.lint(&[&format!("src/{name}")]);
        let stdout = String::from_utf8_lossy(&output.stdout);
        assert!(stdout.contains(&format!("\n{row}")), "{name}: {stdout}");
    }
}
