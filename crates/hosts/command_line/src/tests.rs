use rsvelte_kernel::computation::pipeline::{RunOptions, Sharing};

use super::*;

/// Every plugin, installed without options for a run of the document tasks.
fn installed() -> Registry {
    let mut settings = rsvelte_plugin_interface::Settings::new(
        rsvelte_plugin_interface::Selection::DocumentTasks,
        std::sync::Arc::new(rsvelte_plugin_interface::NoFunctions),
    );
    let mut reg = Registry::new();
    rsvelte_plugin_interface::install(&mut reg, EXTENSIONS, &mut settings).unwrap();
    reg
}

#[test]
fn plugin_declarations_cover_the_registered_languages_and_tasks() {
    let reg = installed();
    assert_eq!(reg.validate_plugins(), Ok(()));
    let plugins: Vec<_> = reg.plugins().map(|plugin| plugin.identifier).collect();
    let expected = [
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
    assert_eq!(plugins, expected);
}

#[test]
fn plugin_tasks_and_type_views_select_their_own_documents() {
    let reg = installed();
    for (path, task_identifiers, has_typescript_view) in [
        (
            "a.svelte",
            vec![
                "svelte.compile/client",
                "svelte.compile/server",
                "svelte.compile.warnings",
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
        assert_eq!(identifiers, task_identifiers, "{path}");
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
