use super::*;

struct Directory(PathBuf);

impl Directory {
    fn new(name: &str, files: &[(&str, &str)]) -> Self {
        let root =
            std::env::temp_dir().join(format!("rsvelte-formatting-{name}-{}", std::process::id()));
        for (file, text) in files {
            let path = root.join(file);
            std::fs::create_dir_all(path.parent().expect("a parent")).expect("directory");
            std::fs::write(path, text).expect("file");
        }
        Self(root)
    }
}

impl Drop for Directory {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.0).expect("remove");
    }
}

#[test]
fn an_oxfmtrc_with_comments_sets_both_formats_with_oxfmt_defaults() {
    let d = Directory::new(
        "oxfmt",
        &[
            (
                ".oxfmtrc.jsonc",
                r#"{
  // the house style
  "$schema": "x",
  "singleQuote": true,
  "svelte": { "svelteSortOrder": "none" },
  "ignorePatterns": ["**/dist/"],
}
"#,
            ),
            ("src/a/.keep", ""),
        ],
    );
    let found = find(&d.0.join("src/a")).expect("read").expect("found");
    assert_eq!(found.source, d.0.join(".oxfmtrc.jsonc"));
    assert_eq!(
        found.svelte,
        r#"{"printWidth":100,"singleQuote":true,"svelteSortOrder":"none"}"#
    );
    assert_eq!(found.typescript, r#"{"printWidth":100,"singleQuote":true}"#);
    assert_eq!(found.ignore_patterns, ["**/dist/"]);
}

#[test]
fn a_prettier_configuration_keeps_prettiers_defaults() {
    let d = Directory::new(
        "prettier",
        &[(
            ".prettierrc",
            r#"{"semi":false,"plugins":["prettier-plugin-svelte"]}"#,
        )],
    );
    let found = find(&d.0).expect("read").expect("found");
    assert_eq!(found.svelte, r#"{"semi":false}"#);
}

#[test]
fn package_json_prettier_counts_and_a_package_json_without_it_does_not() {
    let d = Directory::new(
        "package",
        &[
            ("package.json", r#"{"name":"x","prettier":{"tabWidth":4}}"#),
            ("app/package.json", r#"{"name":"app"}"#),
        ],
    );
    let found = find(&d.0.join("app")).expect("read").expect("found");
    assert_eq!(found.typescript, r#"{"tabWidth":4}"#);
}

#[test]
fn what_rsvelte_cannot_honor_is_refused() {
    for (name, file, text) in [
        ("yaml", ".prettierrc", "semi: false\n"),
        ("js", "prettier.config.js", "export default {};\n"),
        (
            "plugin",
            ".prettierrc.json",
            r#"{"plugins":["prettier-plugin-tailwindcss"]}"#,
        ),
        (
            "overrides",
            ".prettierrc.json",
            r#"{"overrides":[{"files":"*.ts","options":{}}]}"#,
        ),
        ("sort", ".oxfmtrc.json", r#"{"sortImports":true}"#),
    ] {
        let d = Directory::new(name, &[(file, text)]);
        assert!(find(&d.0).is_err(), "{name}");
    }
}

#[test]
fn nothing_found_is_none() {
    let d = Directory::new("none", &[("package.json", "{}")]);
    // The search goes on above the directory, where a configuration may be; only one below
    // a configuration-free root is certain to find nothing.
    let found = find(&d.0).expect("read");
    assert!(found.is_none_or(|f| !f.source.starts_with(&d.0)));
}
