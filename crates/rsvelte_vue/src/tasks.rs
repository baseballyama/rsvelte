//! The tasks this plugin offers. A task identifier is also the fixture path of its expected output
//! (`vue.lint/default` → `expected/vue.lint/default.*`).

use std::sync::Arc;

use rsvelte_javascript::check::{Check, Tsc, TypeScriptDocument, TypeScriptEnv, TypeScriptView};
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::performance::measurement;
use rsvelte_kernel::source::positions::Span;

use crate::project::Projection;
use crate::{Configuration, Parsed, Resolved};

pub fn register(reg: &mut Registry, config: &Configuration) {
    reg.task(Compile)
        .task(Format)
        .task(Lint)
        .project_task(Check {
            identifier: "vue.check/default",
            matches: crate::matches,
            tsc: config.check.as_ref().map(|c| Tsc {
                binary: c.tsc.clone(),
                tsconfig: c.tsconfig.clone(),
            }),
        });
    let env = config
        .check
        .as_ref()
        .map(|c| Arc::new(typescript_env(&c.vue)));
    reg.provide::<TypeScriptView>("vue", crate::matches, move |context| {
        typescript_view(context, env.as_ref())
    });
}

/// `@vitejs/plugin-vue`'s production output ([`crate::compile`]).
#[derive(Debug)]
pub struct Compile;

impl Task for Compile {
    fn identifier(&self) -> &'static str {
        "vue.compile/default"
    }

    fn applies(&self, document: &Document) -> bool {
        crate::matches(document)
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
        let compiled = {
            let _p = measurement::phase("vue.compile");
            crate::compile::compile(c, context.source_text(), res, &context.document.path)
        };
        match compiled {
            Ok(o) => {
                out.file("js", o.javascript);
                if let Some(stylesheet) = o.stylesheet {
                    out.file("css", stylesheet);
                }
            }
            Err(u) => out.diagnostics.push(Diagnostic::error(
                "compile_unsupported",
                format!("not supported yet: {}", u.what),
                u.span(),
            )),
        }
    }
}

/// prettier with its HTML printer ([`crate::format`]). A construct the port does not cover is
/// reported, not approximated: the task then writes no file.
#[derive(Debug)]
pub struct Format;

impl Task for Format {
    fn identifier(&self) -> &'static str {
        "vue.format/default"
    }

    fn applies(&self, document: &Document) -> bool {
        crate::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let c = match context.get::<Parsed>() {
            Ok(c) => c,
            Err(e) => {
                out.diagnostics.push(e.clone());
                return;
            }
        };
        let formatted = {
            let _p = measurement::phase("vue.format");
            crate::format::format(c, context.source_text(), context.line_index())
        };
        match formatted {
            Ok(text) => out.file("vue", text),
            Err(u) => out.diagnostics.push(Diagnostic::error(
                "format_unsupported",
                format!("not supported by the formatter yet: {}", u.what),
                u.span(),
            )),
        }
    }
}

/// `ESLint` with eslint-plugin-vue, the rules of [`crate::lint::lint`].
#[derive(Debug)]
pub struct Lint;

impl Task for Lint {
    fn identifier(&self) -> &'static str {
        "vue.lint/default"
    }

    fn applies(&self, document: &Document) -> bool {
        crate::matches(document)
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
            javascript: rsvelte_javascript::lint::JavaScriptFacts {
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

const HELPERS: (&str, &str) = (
    "template-helpers.d.ts",
    include_str!("../vendor/template-helpers.d.ts"),
);

/// What vue-tsc adds to the project: @vue/language-core's template helpers and the vue package.
fn typescript_env(vue: &std::path::Path) -> TypeScriptEnv {
    TypeScriptEnv {
        declarations: vec![HELPERS],
        include: Vec::new(),
        paths: vec![
            ("vue", vue.join("dist/vue.d.mts")),
            ("vue/jsx-runtime", vue.join("jsx-runtime/index.d.ts")),
        ],
    }
}

/// The component as vue-tsc's checker sees it ([`TypeScriptView`]): @vue/language-core's virtual
/// code ([`crate::project`]), mapped back with Volar's rule.
fn typescript_view(
    context: &DocumentContext<'_>,
    env: Option<&Arc<TypeScriptEnv>>,
) -> Result<TypeScriptDocument, Diagnostic> {
    let c = context.get::<Parsed>().as_ref().map_err(Clone::clone)?;
    let res = context
        .get::<Resolved>()
        .as_ref()
        .expect("a parsed component is resolved");
    match crate::project::project(c, context.source_text(), res) {
        Err(u) => Err(Diagnostic::error(
            "check_unsupported",
            format!("not supported by the type-check projection yet: {}", u.what),
            u.span(),
        )),
        Ok(Projection::JavaScript) => Ok(TypeScriptDocument::Unchecked),
        Ok(Projection::TypeScript(projection)) => {
            let env = env.ok_or_else(|| {
                Diagnostic::error(
                    "check_unconfigured",
                    "vue.check needs the vue package",
                    Span::new(0, 0),
                )
            })?;
            Ok(TypeScriptDocument::Checked {
                projection,
                map_back: Emitter::lookup_overlap,
                env: Arc::clone(env),
            })
        }
    }
}
