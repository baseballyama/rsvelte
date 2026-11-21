use super::*;
use crate::commands::files::Prune as _;

struct Directory(PathBuf);

impl Directory {
    fn new(name: &str, files: &[(&str, &str)]) -> Self {
        let root =
            std::env::temp_dir().join(format!("rsvelte-formatting-{name}-{}", std::process::id()));
        drop(std::fs::remove_dir_all(&root));
        // A project root, so that no `.editorconfig` above the temporary directory counts.
        std::fs::create_dir_all(root.join(".git")).expect("directory");
        for (file, text) in files {
            let path = root.join(file);
            std::fs::create_dir_all(path.parent().expect("a parent")).expect("directory");
            std::fs::write(path, text).expect("file");
        }
        Self(root)
    }

    fn resolver(&self) -> Resolver {
        Resolver::new(self.0.clone(), true)
    }
}

impl Drop for Directory {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.0).expect("remove");
    }
}

fn formatted(resolution: Resolution) -> Resolved {
    match resolution {
        Resolution::Formatted(resolved) => resolved,
        Resolution::Ignored => panic!("ignored"),
    }
}

#[test]
fn an_oxfmtrc_with_comments_sets_both_formats_with_oxfmt_defaults() {
    let d = Directory::new(
        "oxfmt",
        &[(
            ".oxfmtrc.jsonc",
            r#"{
  // the house style
  "$schema": "x",
  "singleQuote": true,
  "svelte": { "sortOrder": "none" },
  "ignorePatterns": ["**/dist/"],
}
"#,
        )],
    );
    let files = d.resolver();
    let resolved = formatted(files.resolve(Path::new("src/a/b.ts")));
    assert_eq!(
        resolved.svelte(),
        r#"{"printWidth":100,"singleQuote":true,"svelteSortOrder":"none"}"#
    );
    assert_eq!(
        resolved.typescript(),
        r#"{"printWidth":100,"singleQuote":true}"#
    );
    assert_eq!(
        resolved.origin("printWidth"),
        Some(&Origin::Default(Formatter::Oxfmt))
    );
    assert_eq!(
        resolved.origin("singleQuote").map(ToString::to_string),
        Some(d.0.join(".oxfmtrc.jsonc").display().to_string())
    );
    assert_eq!(
        files.resolve(Path::new("src/dist/b.ts")),
        Resolution::Ignored
    );
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
    let resolved = formatted(d.resolver().resolve(Path::new("a.ts")));
    assert_eq!(resolved.svelte(), r#"{"semi":false}"#);
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
    let resolved = formatted(d.resolver().resolve(Path::new("app/a.ts")));
    assert_eq!(resolved.typescript(), r#"{"tabWidth":4}"#);
}

#[test]
fn each_file_takes_its_nearest_configuration_alone() {
    let d = Directory::new(
        "nearest",
        &[
            (".prettierrc", r#"{"semi":false}"#),
            ("sub/.prettierrc", r#"{"tabWidth":4}"#),
        ],
    );
    let files = d.resolver();
    let root = formatted(files.resolve(Path::new("a.ts")));
    let sub = formatted(files.resolve(Path::new("sub/a.ts")));
    assert_eq!(root.typescript(), r#"{"semi":false}"#);
    assert_eq!(sub.typescript(), r#"{"tabWidth":4}"#);
}

#[test]
fn an_editorconfig_gives_what_the_configuration_does_not() {
    let d = Directory::new(
        "editorconfig",
        &[
            (
                ".editorconfig",
                concat!(
                    "[*]\nindent_style = tab\nindent_size = 8\nquote_type = single\n",
                    "[*.svelte]\nmax_line_length = 120\n",
                ),
            ),
            (".prettierrc", r#"{"useTabs":false}"#),
        ],
    );
    let files = d.resolver();
    let typescript = formatted(files.resolve(Path::new("a.ts")));
    assert_eq!(
        typescript.typescript(),
        r#"{"singleQuote":true,"tabWidth":8,"useTabs":false}"#
    );
    assert_eq!(
        typescript.origin("tabWidth").map(ToString::to_string),
        Some(d.0.join(".editorconfig").display().to_string())
    );
    let svelte = formatted(files.resolve(Path::new("src/App.svelte")));
    assert!(
        svelte.svelte().contains(r#""printWidth":120"#),
        "{}",
        svelte.svelte()
    );
}

#[test]
fn a_nearer_editorconfig_wins_and_one_with_root_stops_the_search() {
    let d = Directory::new(
        "editorconfig-root",
        &[
            (
                ".editorconfig",
                "[*]\nindent_style = tab\nend_of_line = crlf\n",
            ),
            (
                "a/.editorconfig",
                "[*]\nindent_size = 4\nindent_style = space\n",
            ),
            ("b/.editorconfig", "root = true\n[*]\nindent_size = 3\n"),
        ],
    );
    let files = d.resolver();
    let a = formatted(files.resolve(Path::new("a/x.ts")));
    assert_eq!(
        a.typescript(),
        r#"{"endOfLine":"crlf","tabWidth":4,"useTabs":false}"#
    );
    let b = formatted(files.resolve(Path::new("b/x.ts")));
    assert_eq!(b.typescript(), r#"{"tabWidth":3}"#);
}

#[test]
fn an_unknown_option_is_ignored_with_a_warning() {
    let d = Directory::new(
        "unknown",
        &[(".prettierrc", r#"{"svelteStrictMode":true,"tabWidth":4}"#)],
    );
    let files = d.resolver();
    let resolved = formatted(files.resolve(Path::new("a.ts")));
    assert_eq!(resolved.svelte(), r#"{"tabWidth":4}"#);
    let warnings = files.warnings();
    assert_eq!(warnings.len(), 1);
    assert!(warnings[0].ends_with("ignored unknown option `svelteStrictMode`"));
}

#[test]
fn an_option_one_formatter_has_is_unknown_to_the_other() {
    let d = Directory::new(
        "per-formatter",
        &[(".oxfmtrc.json", r#"{"experimentalTernaries":true}"#)],
    );
    let files = d.resolver();
    let resolved = formatted(files.resolve(Path::new("a.ts")));
    assert_eq!(resolved.svelte(), r#"{"printWidth":100}"#);
    assert_eq!(files.warnings().len(), 1);
}

#[test]
fn what_rsvelte_cannot_honor_is_a_refusal_named_by_its_source() {
    for (name, file, text) in [
        ("yaml", ".prettierrc", "semi: false\n"),
        ("js", "prettier.config.js", "export default {};\n"),
        (
            "plugin",
            ".prettierrc.json",
            r#"{"plugins":["prettier-plugin-organize-imports"]}"#,
        ),
        (
            "overrides",
            ".prettierrc.json",
            r#"{"overrides":[{"files":"*.ts","options":{}}]}"#,
        ),
        ("sort", ".oxfmtrc.json", r#"{"sortImports":true}"#),
        ("patterns", ".oxfmtrc.json", r#"{"ignorePatterns":"dist"}"#),
        (
            "shared",
            "package.json",
            r#"{"prettier":"@company/prettier"}"#,
        ),
        ("off", ".editorconfig", "[*]\nmax_line_length = off\n"),
    ] {
        let d = Directory::new(name, &[(file, text)]);
        let resolved = formatted(d.resolver().resolve(Path::new("a.ts")));
        let refused = resolved.refused().expect(name);
        assert_eq!(
            refused.origin,
            Origin::File(d.0.join(file).into()),
            "{name}"
        );
    }
}

#[test]
fn an_unlimited_line_is_dropped_under_oxfmt_as_oxfmt_drops_it() {
    let d = Directory::new(
        "off-oxfmt",
        &[
            (".oxfmtrc.json", "{}"),
            (".editorconfig", "[*]\nmax_line_length = off\n"),
        ],
    );
    let resolved = formatted(Resolver::new(d.0.clone(), true).resolve(Path::new("a.ts")));
    assert_eq!(resolved.refused(), None);
    assert_eq!(resolved.typescript(), r#"{"printWidth":100}"#);
}

#[test]
fn a_package_json_that_does_not_parse_is_no_configuration() {
    let d = Directory::new(
        "broken-package",
        &[
            (".prettierrc", r#"{"semi":false}"#),
            ("fixtures/bad/package.json", "{ broken\n"),
        ],
    );
    let resolved = formatted(d.resolver().resolve(Path::new("fixtures/bad/x.ts")));
    assert_eq!(resolved.typescript(), r#"{"semi":false}"#);
    assert_eq!(resolved.refused(), None);
}

#[test]
fn a_file_its_oxfmt_configuration_leaves_reads_nothing_else() {
    let d = Directory::new(
        "left",
        &[
            (
                ".oxfmtrc.json",
                r#"{"ignorePatterns":["vendor/**", "fixtures/**"]}"#,
            ),
            ("vendor/.prettierrc.yaml", "semi: false\n"),
            ("fixtures/bad/package.json", "{ broken\n"),
        ],
    );
    let files = d.resolver();
    assert_eq!(files.resolve(Path::new("vendor/x.ts")), Resolution::Ignored);
    assert_eq!(
        files.resolve(Path::new("fixtures/bad/x.ts")),
        Resolution::Ignored
    );
}

#[test]
fn a_nested_oxfmt_configuration_takes_its_files_back_and_stops_the_pruning() {
    let d = Directory::new(
        "nested-oxfmt",
        &[
            (".oxfmtrc.json", r#"{"ignorePatterns":["vendor", "big"]}"#),
            ("vendor/sub/.oxfmtrc.json", "{}"),
            ("big/pkg/.keep", ""),
        ],
    );
    let files = d.resolver();
    assert_eq!(files.resolve(Path::new("vendor/y.ts")), Resolution::Ignored);
    assert!(matches!(
        files.resolve(Path::new("vendor/sub/x.ts")),
        Resolution::Formatted(_)
    ));
    assert!(!files.prunes(Path::new("vendor")));
    assert!(files.prunes(Path::new("big")));
    assert!(!files.prunes(Path::new("vendor/sub")));
}

#[test]
fn without_plugins_to_configure_only_ignore_patterns_are_read() {
    let d = Directory::new(
        "no-options",
        &[
            (
                ".oxfmtrc.json",
                r#"{"sortImports":true,"ignorePatterns":["gen/"]}"#,
            ),
            ("sub/.prettierrc", "semi: false\n"),
        ],
    );
    let files = Resolver::new(d.0.clone(), false);
    assert_eq!(
        files.resolve(Path::new("a.ts")),
        Resolution::Formatted(Resolved::default())
    );
    assert_eq!(files.resolve(Path::new("gen/a.ts")), Resolution::Ignored);
    assert_eq!(
        files.resolve(Path::new("sub/a.ts")),
        Resolution::Formatted(Resolved::default())
    );
}

#[test]
fn every_printed_option_is_one_the_svelte_formatter_takes() {
    for name in configuration::printed_names() {
        assert!(
            rsvelte_svelte_format::options::NAMES.contains(&name),
            "{name}"
        );
    }
}

#[test]
fn oxfmts_sort_tailwindcss_is_given_with_its_paths_from_the_configuration() {
    let d = Directory::new(
        "tailwind-oxfmt",
        &[(
            ".oxfmtrc.json",
            r#"{"sortTailwindcss":{"stylesheet":"src/app.css","functions":["cn"],"x":1}}"#,
        )],
    );
    let files = d.resolver();
    let resolved = formatted(files.resolve(Path::new("a.svelte")));
    let expected = format!(
        r#"{{"printWidth":100,"sortTailwindcss":{{"functions":["cn"],"stylesheet":{}}}}}"#,
        Value::from(d.0.join("src/app.css").to_string_lossy())
    );
    assert_eq!(resolved.svelte(), expected);
    assert_eq!(resolved.typescript(), expected);
    assert_eq!(files.warnings().len(), 1, "{:?}", files.warnings());
    for (value, svelte) in [
        ("true", r#"{"printWidth":100,"sortTailwindcss":{}}"#),
        ("false", r#"{"printWidth":100}"#),
    ] {
        let d = Directory::new(
            &format!("tailwind-{value}"),
            &[(
                ".oxfmtrc.json",
                &format!(r#"{{"experimentalTailwindcss":{value}}}"#),
            )],
        );
        let resolved = formatted(d.resolver().resolve(Path::new("a.svelte")));
        assert_eq!(resolved.svelte(), svelte, "{value}");
    }
}

#[test]
fn prettiers_tailwind_options_count_with_the_plugin_only() {
    let options = r#""tailwindStylesheet":"app.css","tailwindFunctions":["cn"]"#;
    let plugins = r#""plugins":["prettier-plugin-svelte","prettier-plugin-tailwindcss"]"#;
    let d = Directory::new(
        "tailwind-prettier",
        &[(".prettierrc.json", &format!("{{{plugins},{options}}}"))],
    );
    let resolved = formatted(d.resolver().resolve(Path::new("a.svelte")));
    assert_eq!(
        resolved.svelte(),
        format!(
            r#"{{"sortTailwindcss":{{"functions":["cn"],"stylesheet":{}}}}}"#,
            Value::from(d.0.join("app.css").to_string_lossy())
        )
    );
    let d = Directory::new(
        "tailwind-prettier-without",
        &[(".prettierrc.json", &format!("{{{options}}}"))],
    );
    let files = d.resolver();
    let resolved = formatted(files.resolve(Path::new("a.svelte")));
    assert_eq!(resolved.svelte(), "{}");
    assert_eq!(files.warnings().len(), 2, "{:?}", files.warnings());
}
