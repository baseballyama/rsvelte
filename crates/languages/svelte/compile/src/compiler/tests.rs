use rsvelte_kernel::computation::pipeline::{RunOptions, Sharing, run};

use super::*;

const BUTTON: &str = "<button>Hi</button><style>button { color: red; }</style>";

/// The task's files for one target, run the way the command line runs them.
fn task_files(source: &str, target: Target) -> Vec<(String, String)> {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document = registry.document("Button.svelte", source).expect("small");
    let identifier = match target {
        Target::Client => "svelte.compile/client",
        Target::Server => "svelte.compile/server",
    };
    let result = run(
        &registry,
        &[document],
        &RunOptions {
            tasks: &[identifier],
            sharing: Sharing::Shared,
            threads: Some(1),
        },
    )
    .expect("valid plugins")
    .remove(0);
    let (_, output) = result.outputs.into_iter().next().expect("one task ran");
    output
        .files
        .into_iter()
        .map(|f| (f.name.clone(), f.text))
        .collect()
}

#[test]
fn compile_gives_what_the_task_writes() {
    for generate in [Target::Client, Target::Server] {
        let options = CompileOptions {
            filename: "Button.svelte".to_owned(),
            generate,
            ..CompileOptions::default()
        };
        let result = compile(BUTTON, &options).expect("compiles");
        let mut files = vec![("js".to_owned(), result.js.code)];
        files.extend(result.css.map(|stylesheet| ("css".to_owned(), stylesheet)));
        assert_eq!(files, task_files(BUTTON, generate), "{generate:?}");
        assert!(
            result.js.map.starts_with("{\"version\":3"),
            "{}",
            result.js.map
        );
    }
}

#[test]
fn the_filename_names_the_component_even_without_a_svelte_extension() {
    let named = |filename: &str| {
        let options = CompileOptions {
            filename: filename.to_owned(),
            ..CompileOptions::default()
        };
        compile("<p>hi</p>", &options).expect("compiles").js.code
    };
    assert!(named("Card.svelte").contains("function Card("));
    assert!(named("(unknown)").contains("function _unknown_("));
}

#[test]
fn the_version_is_the_oracle_of_the_corpus() {
    let oracles = include_str!("../../../../../../corpus/_registry/oracles.json");
    let compile = oracles
        .split("\"svelte.compile\"")
        .nth(1)
        .expect("the corpus records svelte.compile");
    assert!(
        compile.contains(&format!("\"svelte\": \"{VERSION}\"")),
        "VERSION {VERSION} is not the corpus oracle"
    );
}
