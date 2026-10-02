//! Browser execution of language tasks.

use wasm_bindgen::prelude::*;
mod playground;

#[wasm_bindgen(js_name = runPipeline)]
#[must_use]
pub fn run_pipeline(
    source: &str,
    filename: &str,
    plugins: &str,
    tasks: &str,
    shared: bool,
) -> String {
    playground::run(source, filename, plugins, tasks, shared)
}
