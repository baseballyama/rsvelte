//! The arm of this branch: the compiler `rsvelte_svelte_compile` and the formatter
//! `rsvelte_svelte_format`, each with its default options.
//!
//! The compiler arm does what the crate's `compile` does (the module and its source map, and the
//! stylesheet) and also computes the warnings, which the official `compile` returns and the
//! crate's `compile` leaves empty. One registry serves every component, as the command line's
//! does; each component gets its own document and database.

mod harness;

use harness::{Output, Task, Tool};
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task as _, TaskOutput};
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineBreaks;
use rsvelte_svelte_compile::{ScopedStylesheet, Target, Warn};

#[global_allocator]
static ALLOCATOR: harness::Allocator = harness::Allocator;

enum Experimental {
    Compile { target: Target, registry: Registry },
    Format(rsvelte_svelte_format::Options),
}

impl Experimental {
    fn compile(
        target: Target,
        registry: &Registry,
        filename: &str,
        source: &str,
    ) -> Result<Output, String> {
        let document =
            Document::new(filename.to_owned(), source.to_owned()).map_err(|e| format!("{e:?}"))?;
        let context = DocumentContext::new(&document, registry.artifacts());
        let lines = context.lines(LineBreaks::Newline);
        let javascript = rsvelte_typescript_tree::with_scratch_arena(|allocator| {
            rsvelte_svelte_compile::lower_document(&context, target, allocator)
                .map(|module| rsvelte_typescript_compile::print::print_mapped(&module, lines))
        })
        .map_err(|diagnostic| diagnostic.message)?;
        let map = javascript.source_map(lines, filename);
        let mut warnings = TaskOutput::default();
        Warn.run(&context, &mut warnings);
        if let Some(error) = warnings.diagnostics.first() {
            return Err(error.message.clone());
        }
        let mut compared = vec![("js", javascript.out)];
        // The crate's `compile` leaves out a stylesheet the module injects; the default options
        // inject none, but `<svelte:options css="injected">` does, and then this differs.
        if let Some(css) = context
            .get::<ScopedStylesheet>()
            .as_deref()
            .filter(|css| !css.is_empty())
        {
            compared.push(("css", css.to_owned()));
        }
        Ok(Output {
            compared,
            other_bytes: map.len() + warnings.files.iter().map(|f| f.text.len()).sum::<usize>(),
        })
    }
}

impl Tool for Experimental {
    const NAME: &'static str = "experimental";

    fn new(task: Task) -> Result<Self, String> {
        let compile = |target| {
            let mut registry = Registry::new();
            rsvelte_svelte_compile::register_with_configuration(
                &mut registry,
                rsvelte_svelte_compile::Configuration::default(),
            );
            Self::Compile { target, registry }
        };
        Ok(match task {
            Task::Client => compile(Target::Client),
            Task::Server => compile(Target::Server),
            Task::Format => Self::Format(rsvelte_svelte_format::Options::default()),
        })
    }

    fn run(&self, filename: &str, source: &str) -> Result<Output, String> {
        match self {
            Self::Compile { target, registry } => {
                Self::compile(*target, registry, filename, source)
            }
            Self::Format(options) => {
                let text = rsvelte_svelte_format::format(source, options)
                    .map_err(|diagnostic| diagnostic.message)?;
                Ok(Output {
                    compared: vec![("svelte", text)],
                    other_bytes: 0,
                })
            }
        }
    }
}

fn main() {
    harness::main::<Experimental>();
}
