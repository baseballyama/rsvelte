use super::*;

#[test]
fn disabled_plugins_and_empty_operations_run_nothing() {
    for (plugins, tasks) in [("", "format"), ("svelte", ""), ("vue", "format")] {
        let json = run("<p>Hello</p>", "App.svelte", plugins, tasks, true);
        assert!(json.contains(r#""steps":[]"#), "{json}");
    }
}

#[test]
fn real_plugins_compile_each_language() {
    for (file, source, plugin, artifact) in [
        ("App.svelte", "<p>Hello</p>", "svelte", "svelte.parse"),
        (
            "App.vue",
            "<template><p>Hello</p></template>",
            "vue",
            "vue.parse",
        ),
        (
            "App.vue",
            "<template><p>Hello</p></template>",
            "svue",
            "svue.translate.client",
        ),
        ("App.svelte", "<p>Hello</p>", "vuelte", "vuelte.check"),
    ] {
        let json = run(source, file, plugin, "compile-client", true);
        assert!(json.contains(r#""name":"js""#), "{json}");
        assert!(json.contains(artifact), "{json}");
    }
}

#[test]
fn snapshots_stop_at_the_character_limit() {
    let long = "日".repeat(MAX_SNAPSHOT_CHARS);
    let text = bounded_debug(&long);
    let (kept, note) = text.split_once('\n').expect("a truncation note");
    assert_eq!(kept.chars().count(), MAX_SNAPSHOT_CHARS);
    assert_eq!(note, "[Snapshot truncated after 80000 characters]");
    assert_eq!(bounded_debug(&"short"), "\"short\"");
}

#[test]
fn input_errors_are_reported() {
    let json = run("<p>", "App.svelte", "svelte", "format", true);
    assert!(json.contains(r#""diagnostics":[{"code":"#), "{json}");
    let json = run("", "App.svelte", "unknown", "format", true);
    assert!(json.contains(r#""ok":false"#), "{json}");
}
