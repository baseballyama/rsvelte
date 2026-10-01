use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::pipeline::{
    Document, Registry, RunOptions, Sharing, Task, TaskOutput, run,
};
use rsvelte_svelte::Parsed;
use rsvelte_svelte::syntax::syntax_tree::TemplateNode;

#[derive(Debug)]
struct ElementCount;

impl Artifact for ElementCount {
    type Output = Option<usize>;

    const NAME: &'static str = "example.element_count";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let component = context.get::<Parsed>().as_ref().ok()?;
        Some(
            component
                .nodes
                .iter()
                .filter(|node| matches!(node, TemplateNode::Element { .. }))
                .count(),
        )
    }
}

#[derive(Debug)]
struct CountElements;

impl Task for CountElements {
    fn identifier(&self) -> &'static str {
        "example.count_elements/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        if let Err(diagnostic) = context.get::<Parsed>() {
            out.diagnostics.push(diagnostic.clone());
            return;
        }
        let count = context
            .get::<ElementCount>()
            .expect("a parsed component has an element count");
        out.file("elements.txt", count.to_string());
    }
}

fn register(registry: &mut Registry) {
    registry
        .artifact::<Parsed>()
        .artifact::<ElementCount>()
        .task(CountElements);
}

#[expect(clippy::print_stdout, reason = "This example prints the task output.")]
fn main() -> Result<(), String> {
    let mut registry = Registry::new();
    register(&mut registry);
    let document = registry
        .document("App.svelte", "<main><p>Hello</p></main>")
        .map_err(|error| format!("invalid document: {error:?}"))?;
    let results = run(
        &registry,
        &[document],
        &RunOptions {
            tasks: &["example.count_elements/default"],
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn counts_elements_reports_parse_errors_and_skips_other_languages() {
        let mut registry = Registry::new();
        rsvelte_svelte::register(&mut registry, &rsvelte_svelte::Configuration::default());
        register(&mut registry);
        let documents = [
            registry
                .document("App.svelte", "<main><p>Hello</p></main>")
                .expect("valid size"),
            registry
                .document("Broken.svelte", "<p>")
                .expect("valid size"),
            registry
                .document("Other.vue", "<p>Hello</p>")
                .expect("valid size"),
        ];
        let results = run(
            &registry,
            &documents,
            &RunOptions {
                tasks: &["svelte.format/default", "example.count_elements/default"],
                sharing: Sharing::Shared,
                threads: None,
            },
        )
        .expect("registered tasks");
        assert!(results.iter().all(|result| result.panic.is_none()));
        let (_, counted) = &results[0].outputs[1];
        assert_eq!(counted.files[0].text, "2");
        assert!(counted.diagnostics.is_empty());
        let (_, broken) = &results[1].outputs[1];
        assert!(broken.files.is_empty());
        assert_eq!(broken.diagnostics.len(), 1);
        assert!(results[2].outputs.is_empty());
    }
}
