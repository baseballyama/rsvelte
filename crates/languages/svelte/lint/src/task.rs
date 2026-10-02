use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_kernel::performance::measurement;
use rsvelte_svelte::{Normalized, Parsed, Resolved};

pub fn register(registry: &mut Registry) {
    rsvelte_svelte::register(registry);
    registry.task(Lint);
}

#[derive(Debug)]
pub struct Lint;

impl Task for Lint {
    fn identifier(&self) -> &'static str {
        "svelte.lint/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let c = match context.get::<Parsed>() {
            Ok(c) => c,
            Err(e) => {
                out.diagnostics.push(e.clone());
                return;
            }
        };
        let res = context
            .get::<Resolved>()
            .as_ref()
            .expect("a parsed component is resolved");
        let parents = {
            let _p = measurement::phase("js.parents");
            c.javascript.parents()
        };
        let compiler_syntax_tree = context
            .get::<Normalized>()
            .as_ref()
            .expect("a parsed component is lowered");
        let early = crate::lint::SyntaxTreeContext {
            c,
            source_text: context.source_text(),
            javascript: rsvelte_typescript_lint::JavaScriptFacts {
                syntax_tree: &c.javascript,
                sem: &res.sem,
                parents: &parents,
            },
        };
        let late = crate::lint::CompilerSyntaxTreeContext {
            compiler_syntax_tree,
            res,
            source_text: context.source_text(),
        };
        let findings = crate::lint::lint(&early, &late);
        let rules: Vec<&str> = crate::lint::rule_identifiers().collect();
        out.file(
            "lint.json",
            rsvelte_kernel::diagnostics::rules::render_json(
                context.line_index(),
                &rules,
                &findings,
            ),
        );
    }
}
