//! A host that installs the plugin and runs its task on one component.
//!
//! `cargo run -p rsvelte_svelte_example_plugin --example host`

use std::sync::Arc;

use rsvelte_kernel::computation::pipeline::{Registry, RunOptions, Sharing, run};
use rsvelte_plugin_interface::{NoFunctions, Selection, Settings};

#[expect(clippy::print_stdout, reason = "This example prints the task output.")]
fn main() -> Result<(), String> {
    let tasks = ["example.count_elements/default"];
    let mut settings = Settings::new(
        Selection::Named(tasks.map(String::from).to_vec()),
        Arc::new(NoFunctions),
    );
    let mut registry = Registry::new();
    rsvelte_plugin_interface::install(
        &mut registry,
        &[&rsvelte_svelte_example_plugin::EXTENSION],
        &mut settings,
    )
    .map_err(|error| error.0)?;
    let document = registry
        .document("App.svelte", "<main><p>Hello</p></main>")
        .map_err(|error| format!("invalid document: {error:?}"))?;
    let results = run(
        &registry,
        &[document],
        &RunOptions {
            tasks: &tasks,
            sharing: Sharing::Shared,
            threads: None,
        },
    )
    .map_err(|error| error.to_string())?;
    for result in results {
        if let Some(panic) = result.panic {
            return Err(panic);
        }
        for (_, output) in result.outputs {
            if let Some(diagnostic) = output.diagnostics.first() {
                return Err(format!("{diagnostic:?}"));
            }
            for file in output.files {
                println!("{}: {}", file.name, file.text);
            }
        }
    }
    Ok(())
}
