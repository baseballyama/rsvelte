use rsvelte_kernel::computation::pipeline::{RunOptions, Sharing};
use rsvelte_kernel::source::document::Document;

use super::*;

/// Every plugin, installed without options for a run of the document tasks.
fn installed() -> Registry {
    let mut settings = rsvelte_plugin_interface::Settings::new(
        Selection::DocumentTasks,
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
        "svelte.check",
        "svelte.compile",
        "svelte.format",
        "svelte.lint",
        "svelte.semantic",
        "svelte.syntax",
        "svelte.typescript_projection",
        "svue",
        "typescript.check",
        "typescript.compile",
        "typescript.format",
        "typescript.lint",
        "typescript.semantic",
        "typescript.tree",
        "vue.check",
        "vue.compile",
        "vue.format",
        "vue.lint",
        "vue.semantic",
        "vue.syntax",
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
                "svelte.compile.sourcemap/client",
                "svelte.compile.sourcemap/server",
                "svelte.compile.warnings",
                "svelte.format/default",
                "svelte.lint/default",
                rsvelte_svelte_typescript_projection::TASK,
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
        let document = Document::new(path, "").expect("valid text");
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
