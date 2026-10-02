use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_kernel::performance::measurement;
use rsvelte_vue::{Parsed, Resolved};

pub fn register(registry: &mut Registry) {
    rsvelte_vue::register(registry);
    registry.task(Lint);
}

#[derive(Debug)]
pub struct Lint;

impl Task for Lint {
    fn identifier(&self) -> &'static str {
        "vue.lint/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_vue::matches(document)
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
        let rule_context = crate::lint::RuleContext {
            c,
            source_text: context.source_text(),
            path: &context.document.path,
            res,
            javascript: rsvelte_typescript_lint::JavaScriptFacts {
                syntax_tree: &c.javascript,
                sem: &res.sem,
                parents: &parents,
            },
        };
        let findings = crate::lint::lint(&rule_context);
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
