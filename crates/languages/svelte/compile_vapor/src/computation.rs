use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::performance::measurement;
use rsvelte_kernel::source::document::Document;

use crate::script;

/// [`check`] on the Svelte plugin's artifacts, shared by both targets.
#[derive(Debug)]
pub struct Checked;

impl Artifact for Checked {
    type Output = R<script::Plan>;

    const NAME: &'static str = "vuelte.check";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let c = context
            .get::<rsvelte_svelte_syntax::Parsed>()
            .as_ref()
            .map_err(Clone::clone)?;
        let compiler_syntax_tree = context
            .get::<rsvelte_svelte_semantic::Lowered>()
            .as_ref()
            .expect("a parsed component is lowered to HIR");
        let resolution = context
            .get::<rsvelte_svelte_semantic::Resolved>()
            .as_ref()
            .expect("a parsed component is resolved");
        let _p = measurement::phase("vuelte.check");
        check(c, compiler_syntax_tree, resolution, context.source_text())
    }
}

pub static PLUGIN: Plugin = Plugin {
    identifier: "vuelte",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "svelte.semantic",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

/// Registers vuelte's tasks on `.svelte` documents, and the Svelte plugin's artifacts they read
/// (which [`rsvelte_svelte_semantic::register`] registers too; a second registration is a no-op).
pub fn register(reg: &mut Registry) {
    reg.plugin(&PLUGIN);
    rsvelte_svelte_semantic::register(reg);
    reg.artifact::<Checked>()
        .task(Compile { server: false })
        .task(Compile { server: true });
}

/// The module the behavioural oracle mounts with `createVaporApp` (client) or renders with
/// `renderToString(createSSRApp(…))` (server).
#[derive(Debug)]
pub struct Compile {
    pub server: bool,
}

impl Compile {
    fn module(&self, context: &DocumentContext<'_>) -> R<(String, Option<String>)> {
        let plan = context.get::<Checked>().as_ref().map_err(Clone::clone)?;
        let c = context
            .get::<rsvelte_svelte_syntax::Parsed>()
            .as_ref()
            .map_err(Clone::clone)?;
        let compiler_syntax_tree = context
            .get::<rsvelte_svelte_semantic::Lowered>()
            .as_ref()
            .expect("a parsed component is lowered to HIR");
        let resolution = context
            .get::<rsvelte_svelte_semantic::Resolved>()
            .as_ref()
            .expect("a parsed component is resolved");
        let analysis = context
            .get::<rsvelte_svelte_semantic::Analyzed>()
            .as_ref()
            .expect("a parsed component is analysed");
        let t = {
            let _p = measurement::phase("vuelte.translate");
            translate(
                c,
                compiler_syntax_tree,
                resolution,
                analysis,
                plan,
                context.source_text(),
                self.server,
                &context.document.path,
            )?
        };
        let _p = measurement::phase("vuelte.vapor");
        let javascript = compile(&t, context.source_text(), &context.document.path)?;
        let external_stylesheet =
            t.css_mode == crate::template::CssMode::External && t.custom_element.is_none();
        Ok((
            javascript,
            external_stylesheet.then_some(t.stylesheet).flatten(),
        ))
    }
}

impl Task for Compile {
    fn identifier(&self) -> &'static str {
        if self.server {
            "vuelte.compile/server"
        } else {
            "vuelte.compile/client"
        }
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte_syntax::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        match self.module(context) {
            Ok((javascript, stylesheet)) => {
                out.file("js", javascript);
                if let Some(stylesheet) = stylesheet {
                    out.file("css", stylesheet);
                }
            }
            Err(d) => out.diagnostics.push(d),
        }
    }
}

#[cfg(test)]
mod tests;

use crate::compilation::{R, check, compile, translate};
