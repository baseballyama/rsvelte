//! The arm of this branch: the compile and format tasks the command line registers, each run on a
//! fresh document context, and the parser alone for parse.

mod harness;

use std::sync::{Arc, Mutex};

use harness::{Arm, Runner, Task};
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task as DocumentTask, TaskOutput};
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;

struct Experimental;

/// A registered task, kept so the arm can run it on one document at a time.
struct Kept(Arc<dyn DocumentTask>);

impl DocumentTask for Kept {
    fn identifier(&self) -> &'static str {
        self.0.identifier()
    }

    fn applies(&self, document: &Document) -> bool {
        self.0.applies(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        self.0.run(context, out);
    }
}

struct Documents {
    documents: Vec<Document>,
    registry: Registry,
    /// `None` for parse.
    task: Option<Arc<dyn DocumentTask>>,
}

impl Runner for Documents {
    fn run(&self, index: usize) -> Result<usize, String> {
        let document = &self.documents[index];
        let Some(task) = &self.task else {
            let component = rsvelte_svelte_syntax::parse::parse(&document.text)
                .map_err(|error| error.message)?;
            std::hint::black_box(&component);
            return Ok(0);
        };
        let context = DocumentContext::new(document, self.registry.artifacts());
        let mut out = TaskOutput::default();
        rsvelte_kernel::performance::stack::for_text(document.text.len(), || {
            task.run(&context, &mut out);
        });
        if let Some(error) = (out.diagnostics.iter()).find(|d| d.severity == Severity::Error) {
            return Err(format!("{}: {}", error.code, error.message));
        }
        Ok(out.files.iter().map(|file| file.text.len()).sum())
    }
}

impl Arm for Experimental {
    const NAME: &'static str = "experimental";

    fn runner(task: Task, files: Vec<(String, String)>) -> Result<Box<dyn Runner>, String> {
        let mut registry = Registry::new();
        rsvelte_svelte_compile::register(&mut registry);
        rsvelte_svelte_format::register(&mut registry);
        let kept = Mutex::new(Vec::new());
        registry.wrap_document_tasks(|task| {
            let task: Arc<dyn DocumentTask> = Arc::from(task);
            kept.lock().expect("one thread").push(Arc::clone(&task));
            Box::new(Kept(task))
        });
        let identifier = match task {
            Task::Parse => None,
            Task::Client => Some("svelte.compile/client"),
            Task::Server => Some("svelte.compile/server"),
            Task::Format => Some("svelte.format/default"),
        };
        let task = match identifier {
            None => None,
            Some(identifier) => Some(
                kept.into_inner()
                    .expect("one thread")
                    .into_iter()
                    .find(|task| task.identifier() == identifier)
                    .ok_or_else(|| format!("no task {identifier}"))?,
            ),
        };
        let documents = files
            .into_iter()
            .map(|(path, source)| Document::new(path, source).map_err(|e| format!("{e:?}")))
            .collect::<Result<_, _>>()?;
        Ok(Box::new(Documents {
            documents,
            registry,
            task,
        }))
    }
}

fn main() {
    harness::main::<Experimental>();
}
