//! The arm of this branch's lint crate, `rsvelte_svelte_lint`. `rules <candidates.txt>` prints
//! each candidate this crate has, with `ok` or why it does not configure with default options.

mod harness;

use harness::{Arm, Mode};
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;
use rsvelte_svelte_lint::{Configuration, LintSettings};

#[global_allocator]
static ALLOCATOR: harness::Allocator = harness::Allocator;

struct Experimental;

struct Linter {
    documents: Vec<Document>,
    registry: Registry,
    configuration: Configuration,
}

impl harness::Linter for Linter {
    fn count(&self, index: usize) -> usize {
        let context = DocumentContext::new(&self.documents[index], self.registry.artifacts());
        rsvelte_svelte_lint::lint(&context, &self.configuration)
            .map_or_else(|error| panic!("{}", error.message), |found| found.len())
    }

    fn codes(&self, index: usize) -> Result<Vec<String>, String> {
        let context = DocumentContext::new(&self.documents[index], self.registry.artifacts());
        let found = rsvelte_svelte_lint::lint(&context, &self.configuration)
            .map_err(|error| error.message)?;
        Ok(found
            .into_iter()
            .map(|finding| finding.diagnostic.code.into_owned())
            .collect())
    }
}

impl Arm for Experimental {
    type Linter = Linter;
    const NAME: &'static str = "experimental";

    fn rules(arguments: &[String]) {
        let candidates = std::fs::read_to_string(&arguments[0]).expect("candidates");
        for name in candidates.lines().filter(|line| !line.is_empty()) {
            if rsvelte_svelte_lint::definition(name, &[]).is_none() {
                continue;
            }
            let mut configuration = Configuration::new(LintSettings::default());
            match configuration.rule(name, Severity::Error, &[], &[]) {
                Ok(_) => println!("{name}\tok"),
                Err(error) => println!("{name}\t{}", error.replace(['\n', '\t'], " ")),
            }
        }
    }

    fn linter(
        _: Mode,
        rules: &[String],
        files: Vec<(String, String)>,
    ) -> Result<Linter, String> {
        let mut configuration = Configuration::new(LintSettings::default());
        for name in rules {
            configuration.rule(name, Severity::Error, &[], &[])?;
        }
        let mut registry = Registry::new();
        rsvelte_svelte_lint::register_artifacts(&mut registry);
        // The project facts from the files around each one, as the command line reads them.
        rsvelte_svelte_lint::project::register_file_system(&mut registry);
        let documents = files
            .into_iter()
            .map(|(path, source)| Document::new(path, source).map_err(|e| format!("{e:?}")))
            .collect::<Result<_, _>>()?;
        Ok(Linter {
            documents,
            registry,
            configuration,
        })
    }
}

fn main() {
    harness::main::<Experimental>();
}
