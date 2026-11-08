//! Browser execution of language tasks.

use std::fmt::{self, Debug, Write as _};
use std::sync::{Arc, Mutex};

use rsvelte_kernel::computation::database::{ArtifactAccess, DocumentContext};
use rsvelte_kernel::computation::pipeline::{self, RunOptions, Sharing};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::{Diagnostic, Severity};
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineIndex;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = runPipeline)]
#[must_use]
pub fn run_pipeline(
    source: &str,
    filename: &str,
    plugins: &str,
    tasks: &str,
    shared: bool,
) -> String {
    run(source, filename, plugins, tasks, shared)
}

const MAX_INPUT_BYTES: usize = 64 * 1024;
const MAX_SNAPSHOT_CHARS: usize = 80_000;
const PLUGINS: &[&str] = &["svelte", "vue", "svue", "vuelte"];
const OPERATIONS: &[&str] = &["compile-client", "compile-server", "format", "lint"];

struct Observation {
    identifier: &'static str,
    accesses: Vec<ArtifactAccess>,
    artifacts: Vec<(&'static str, String)>,
}

struct ObservedTask {
    task: Box<dyn Task>,
    observations: Arc<Mutex<Vec<Observation>>>,
}

impl Task for ObservedTask {
    fn identifier(&self) -> &'static str {
        self.task.identifier()
    }

    fn applies(&self, document: &Document) -> bool {
        self.task.applies(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let before = context.accesses().len();
        let computed_before = context.computed().len();
        self.task.run(context, out);
        let accesses = context.accesses()[before..].to_vec();
        let artifacts = context.computed()[computed_before..]
            .iter()
            .filter_map(|&name| snapshot(context, name).map(|text| (name, text)))
            .collect();
        self.observations
            .lock()
            .expect("the observation lock contains no plugin code")
            .push(Observation {
                identifier: self.task.identifier(),
                accesses,
                artifacts,
            });
    }
}

fn snapshot(context: &DocumentContext<'_>, name: &str) -> Option<String> {
    use rsvelte_svue::{Client, Server};
    Some(match name {
        "svelte.parse" => bounded_debug(context.get::<rsvelte_svelte::Parsed>()),
        "svelte.resolve" => bounded_debug(context.get::<rsvelte_svelte::Resolved>()),
        "svelte.compiler_syntax_tree" => bounded_debug(context.get::<rsvelte_svelte::Normalized>()),
        "svelte.analyze" => bounded_debug(context.get::<rsvelte_svelte::Analyzed>()),
        "svelte.css" => bounded_debug(context.get::<rsvelte_svelte_compile::ScopedStylesheet>()),
        "vue.parse" => bounded_debug(context.get::<rsvelte_vue::Parsed>()),
        "vue.compiler_syntax_tree" => bounded_debug(context.get::<rsvelte_vue::Lowered>()),
        "vue.resolve" => bounded_debug(context.get::<rsvelte_vue::Resolved>()),
        "svue.translate.client" => bounded_debug(context.get::<rsvelte_svue::Translated<Client>>()),
        "svue.resolve.client" => bounded_debug(context.get::<rsvelte_svue::Resolved<Client>>()),
        "svue.analyze.client" => bounded_debug(context.get::<rsvelte_svue::Analyzed<Client>>()),
        "svue.translate.server" => bounded_debug(context.get::<rsvelte_svue::Translated<Server>>()),
        "svue.resolve.server" => bounded_debug(context.get::<rsvelte_svue::Resolved<Server>>()),
        "svue.analyze.server" => bounded_debug(context.get::<rsvelte_svue::Analyzed<Server>>()),
        "vuelte.check" => bounded_debug(context.get::<rsvelte_svelte_compile_vapor::Checked>()),
        _ => return None,
    })
}

/// `{:#?}` of `value`, cut after [`MAX_SNAPSHOT_CHARS`] characters.
fn bounded_debug(value: &impl Debug) -> String {
    struct Bounded {
        text: String,
        room: usize,
    }
    impl fmt::Write for Bounded {
        fn write_str(&mut self, s: &str) -> fmt::Result {
            for ch in s.chars() {
                if self.room == 0 {
                    // Stops the formatter, so a large tree is not formatted only to be cut.
                    return Err(fmt::Error);
                }
                self.room -= 1;
                self.text.push(ch);
            }
            Ok(())
        }
    }
    let mut out = Bounded {
        text: String::new(),
        room: MAX_SNAPSHOT_CHARS,
    };
    if write!(out, "{value:#?}").is_err() {
        write!(
            out.text,
            "\n[Snapshot truncated after {MAX_SNAPSHOT_CHARS} characters]"
        )
        .expect("writing to a String does not fail");
    }
    out.text
}

fn registry(plugins: &[&str]) -> Registry {
    let mut reg = Registry::new();
    for plugin in plugins {
        match *plugin {
            "svelte" => {
                rsvelte_svelte_compile::register(&mut reg);
                rsvelte_svelte_format::register(&mut reg);
                rsvelte_svelte_lint::register(&mut reg);
                rsvelte_svelte_typecheck::register(
                    &mut reg,
                    &rsvelte_svelte_typecheck::Configuration::default(),
                );
            }
            "vue" => {
                rsvelte_vue_compile::register(&mut reg);
                rsvelte_vue_format::register(&mut reg);
                rsvelte_vue_lint::register(&mut reg);
                rsvelte_vue_check::register(&mut reg, &rsvelte_vue_check::Configuration::default());
            }
            "svue" => rsvelte_svue::register(&mut reg),
            "vuelte" => rsvelte_svelte_compile_vapor::register(&mut reg),
            _ => unreachable!("plugin names were validated at the boundary"),
        }
    }
    reg
}

fn operation(identifier: &str) -> Option<&'static str> {
    if identifier.ends_with(".compile/client") || identifier.ends_with(".compile/default") {
        Some("compile-client")
    } else if identifier.ends_with(".compile/server") {
        Some("compile-server")
    } else if identifier.ends_with(".format/default") {
        Some("format")
    } else if identifier.ends_with(".lint/default") {
        Some("lint")
    } else {
        None
    }
}

fn selections<'a>(input: &'a str, known: &[&str]) -> Result<Vec<&'a str>, String> {
    let mut selected = Vec::new();
    for name in input.split(',').filter(|name| !name.is_empty()) {
        if !known.contains(&name) {
            return Err(format!("unknown selection: {name}"));
        }
        if !selected.contains(&name) {
            selected.push(name);
        }
    }
    Ok(selected)
}

fn run(source: &str, filename: &str, plugins: &str, tasks: &str, shared: bool) -> String {
    match execute(source, filename, plugins, tasks, shared) {
        Ok(json) => json,
        Err(message) => {
            let mut json = StructuredDataWriter::new(false);
            json.begin_object()
                .key("ok")
                .write_boolean(false)
                .key("message")
                .write_string(&message)
                .end_object();
            json.finish()
        }
    }
}

fn execute(
    source: &str,
    filename: &str,
    plugins: &str,
    tasks: &str,
    shared: bool,
) -> Result<String, String> {
    if source.len() > MAX_INPUT_BYTES {
        return Err(format!("source exceeds {MAX_INPUT_BYTES} bytes"));
    }
    let plugins = selections(plugins, PLUGINS)?;
    let operations = selections(tasks, OPERATIONS)?;
    let mut reg = registry(&plugins);
    let registered = reg.document_task_identifiers();
    let selected: Vec<&str> = registered
        .iter()
        .copied()
        .filter(|identifier| operation(identifier).is_some_and(|op| operations.contains(&op)))
        .collect();
    let observations = Arc::new(Mutex::new(Vec::new()));
    reg.wrap_document_tasks(|task| {
        Box::new(ObservedTask {
            task,
            observations: Arc::clone(&observations),
        })
    });
    let document = reg
        .document(filename, source)
        .map_err(|e| format!("invalid document: {e:?}"))?;
    let mut json = StructuredDataWriter::new(false);
    json.begin_object()
        .key("ok")
        .write_boolean(true)
        .key("registeredTasks")
        .begin_array();
    for identifier in registered {
        json.write_string(identifier);
    }
    json.end_array().key("steps").begin_array();
    if !selected.is_empty() {
        let options = RunOptions {
            tasks: &selected,
            sharing: if shared {
                Sharing::Shared
            } else {
                Sharing::Isolated
            },
            threads: Some(1),
        };
        let results = pipeline::run(&reg, std::slice::from_ref(&document), &options)
            .map_err(|e| e.to_string())?;
        let result = results
            .into_iter()
            .next()
            .ok_or_else(|| "the scheduler did not return the input document".to_owned())?;
        if let Some(message) = result.panic {
            return Err(message);
        }
        let observations = observations
            .lock()
            .map_err(|e| format!("cannot read pipeline observations: {e}"))?;
        if result.outputs.len() != observations.len()
            || result
                .outputs
                .iter()
                .zip(observations.iter())
                .any(|((identifier, _), observed)| *identifier != observed.identifier)
        {
            return Err("task outputs and observations do not match".to_owned());
        }
        let index = LineIndex::new(&document.text);
        for ((identifier, out), observed) in result.outputs.iter().zip(observations.iter()) {
            step_json(&mut json, identifier, out, observed, &index);
        }
    }
    json.end_array().end_object();
    Ok(json.finish())
}

fn step_json(
    json: &mut StructuredDataWriter,
    identifier: &str,
    out: &TaskOutput,
    observed: &Observation,
    index: &LineIndex,
) {
    json.begin_object()
        .key("id")
        .write_string(identifier)
        .key("accesses")
        .begin_array();
    for access in &observed.accesses {
        json.begin_object()
            .key("name")
            .write_string(access.name)
            .key("cached")
            .write_boolean(access.cached)
            .end_object();
    }
    json.end_array().key("artifacts").begin_array();
    for (name, text) in &observed.artifacts {
        json.begin_object()
            .key("name")
            .write_string(name)
            .key("text")
            .write_string(text)
            .end_object();
    }
    json.end_array().key("files").begin_array();
    for file in &out.files {
        json.begin_object()
            .key("name")
            .write_string(&file.name)
            .key("text")
            .write_string(&file.text)
            .end_object();
    }
    json.end_array().key("diagnostics").begin_array();
    for diagnostic in &out.diagnostics {
        diagnostic_json(json, diagnostic, index);
    }
    json.end_array().end_object();
}

fn diagnostic_json(json: &mut StructuredDataWriter, diagnostic: &Diagnostic, index: &LineIndex) {
    let at = index.line_column(diagnostic.span.start_offset);
    json.begin_object()
        .key("code")
        .write_string(&diagnostic.code)
        .key("message")
        .write_string(&diagnostic.message)
        .key("severity")
        .write_string(match diagnostic.severity {
            Severity::Error => "error",
            Severity::Warning => "warning",
        })
        .key("line")
        .write_number(at.line)
        .key("column")
        .write_number(at.column + 1)
        .end_object();
}

#[cfg(test)]
mod tests;
