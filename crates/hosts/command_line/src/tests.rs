use rsvelte_kernel::computation::pipeline::{RunOptions, Sharing};

use super::*;

fn configuration(
    directory: &str,
    text: &str,
) -> (std::path::PathBuf, rsvelte_config::LoadedConfiguration) {
    let dir = std::env::temp_dir().join(format!("rsvelte-cli-{directory}-{}", std::process::id()));
    std::fs::create_dir_all(&dir).unwrap();
    let path = dir.join("rsvelte.config.json");
    std::fs::write(&path, text).unwrap();
    let loaded = rsvelte_config::Loader::load(&rsvelte_config::JsonLoader, &path).unwrap();
    (path, loaded)
}

#[test]
fn the_command_line_type_checker_wins_over_the_configuration_file() {
    let file = configuration(
        "type-checker",
        r#"{ "typeChecker": { "command": ["node_modules/.bin/tsrs", "--fast"] } }"#,
    );
    let from_file = type_checker(None, Vec::new(), Some(&file))
        .unwrap()
        .unwrap();
    assert_eq!(
        from_file.program,
        file.0.with_file_name("node_modules/.bin/tsrs"),
        "a relative program is relative to the configuration file"
    );
    assert_eq!(from_file.arguments, ["--fast"]);
    let given = type_checker(
        Some("tsc".into()),
        vec!["--singleThreaded".into()],
        Some(&file),
    )
    .unwrap()
    .unwrap();
    assert_eq!(
        given,
        rsvelte_typescript_check::TypeChecker {
            program: "tsc".into(),
            arguments: vec!["--singleThreaded".into()],
        }
    );
    type_checker(None, vec!["--fast".into()], Some(&file)).unwrap_err();
    assert_eq!(type_checker(None, Vec::new(), None), Ok(None));
    std::fs::remove_dir_all(file.0.parent().unwrap()).unwrap();
}

#[test]
fn a_type_checker_command_needs_a_program_and_a_bare_name_is_looked_up() {
    let bare = configuration("bare", r#"{ "typeChecker": { "command": ["tsrs"] } }"#);
    let checker = type_checker(None, Vec::new(), Some(&bare))
        .unwrap()
        .unwrap();
    assert_eq!(
        checker.program,
        Path::new("tsrs"),
        "not installed: looked up in PATH"
    );
    let bin = bare.0.with_file_name("node_modules/.bin");
    std::fs::create_dir_all(&bin).unwrap();
    std::fs::write(bin.join("tsrs"), "").unwrap();
    let checker = type_checker(None, Vec::new(), Some(&bare))
        .unwrap()
        .unwrap();
    assert_eq!(
        checker.program,
        std::path::absolute(bin.join("tsrs")).unwrap(),
        "the project's own copy comes first"
    );
    let empty = configuration("empty", r#"{ "typeChecker": { "command": [] } }"#);
    type_checker(None, Vec::new(), Some(&empty)).unwrap_err();
    for f in [bare, empty] {
        std::fs::remove_dir_all(f.0.parent().unwrap()).unwrap();
    }
}

#[test]
fn plugin_declarations_cover_the_registered_languages_and_tasks() {
    let reg = registry(
        &rsvelte_svelte_typecheck::Configuration::default(),
        &rsvelte_vue_check::Configuration::default(),
    );
    assert_eq!(reg.validate_plugins(), Ok(()));
    let plugins: Vec<_> = reg.plugins().map(|plugin| plugin.identifier).collect();
    let mut expected = vec![
        "svelte",
        "svelte.compile",
        "svelte.format",
        "svelte.lint",
        "svelte.parser",
        "svelte.typecheck",
        "svelte.typescript_projection",
        "svue",
        "typescript",
        "typescript.check",
        "typescript.compile",
        "typescript.format",
        "typescript.lint",
        "vue",
        "vue.check",
        "vue.compile",
        "vue.format",
        "vue.lint",
        "vuelte",
    ];
    if cfg!(feature = "lint-typed") {
        expected.push("svelte.lint.typed");
    }
    expected.sort_unstable();
    assert_eq!(plugins, expected);
}

#[test]
fn plugin_tasks_and_type_views_select_their_own_documents() {
    let reg = registry(
        &rsvelte_svelte_typecheck::Configuration::default(),
        &rsvelte_vue_check::Configuration::default(),
    );
    for (path, task_identifiers, has_typescript_view) in [
        (
            "a.svelte",
            vec![
                "svelte.compile/client",
                "svelte.compile/server",
                "svelte.format/default",
                "svelte.lint/default",
                "svelte.typescript_projection/default",
                "vuelte.compile/client",
                "vuelte.compile/server",
            ],
            true,
        ),
        (
            "a.vue",
            vec![
                "vue.compile/default",
                "vue.format/default",
                "vue.lint/default",
                "svue.compile/client",
                "svue.compile/server",
            ],
            true,
        ),
        (
            "a.ts",
            vec!["ts.compile/default", "ts.format/default", "ts.lint/default"],
            true,
        ),
        (
            "a.mts",
            vec!["ts.compile/default", "ts.format/default", "ts.lint/default"],
            true,
        ),
        (
            "a.cts",
            vec!["ts.compile/default", "ts.format/default", "ts.lint/default"],
            true,
        ),
        ("README", vec![], false),
    ] {
        let document = reg.document(path, "").expect("valid text");
        assert_eq!(
            reg.artifacts()
                .provides::<rsvelte_typescript_check::TypeScriptView>(&document),
            has_typescript_view,
            "{path}"
        );
        let result = rsvelte_kernel::computation::pipeline::run(
            &reg,
            &[document],
            &RunOptions {
                tasks: &reg.document_task_identifiers(),
                sharing: Sharing::Shared,
                threads: Some(1),
            },
        )
        .expect("known tasks");
        assert!(result[0].panic.is_none(), "{path}: {:?}", result[0].panic);
        let identifiers: Vec<_> = result[0]
            .outputs
            .iter()
            .map(|(identifier, _)| *identifier)
            .collect();
        let mut expected = task_identifiers;
        if cfg!(feature = "lint-typed") && path.ends_with(".svelte") {
            expected.insert(4, "svelte.lint.typed/default");
        }
        assert_eq!(identifiers, expected, "{path}");
    }
}

/// Names that sort around the separator (`-` and `.` below `/`, a letter and a non-ASCII byte
/// above), nested three deep under a source directory, one unit in each: the walk yields them
/// in `Path::cmp` order, with paths relative to the source and the `~` escape undone.
#[test]
fn units_come_in_path_order_relative_to_their_source() {
    let root = std::env::temp_dir().join(format!("rsvelte-units-{}", std::process::id()));
    let source = root.join("family").join("source");
    let names = ["a", "a-b", "a.b", "ab", "é", "~x"];
    let mut dirs = vec![source.clone()];
    for _ in 0..3 {
        let last = std::mem::take(&mut dirs);
        dirs = last
            .iter()
            .flat_map(|d| names.iter().map(|n| d.join(n)))
            .collect();
        for d in &dirs {
            std::fs::create_dir_all(d.join("actual")).unwrap();
            std::fs::write(d.join("input.svelte"), "").unwrap();
            std::fs::write(d.join("actual").join("input.svelte"), "").unwrap();
        }
    }
    std::fs::create_dir_all(root.join("_registry")).unwrap();
    let got = input::units(&root.join("family"));
    std::fs::remove_dir_all(&root).unwrap();
    assert_eq!(got.len(), 6 + 36 + 216);
    assert!(got.is_sorted_by(|a, b| a.input < b.input));
    for u in &got {
        let rel = u.dir.strip_prefix(&source).unwrap();
        let want = rel.to_str().unwrap().replace('~', "");
        assert_eq!(u.path, want, "{}", u.input.display());
        assert_eq!(u.input.parent(), Some(u.dir.as_path()));
    }
}
