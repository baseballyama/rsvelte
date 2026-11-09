//! A plugin that counts a component's top-level elements: the smallest whole plugin, as the
//! site's plugin guide walks through it.

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::source::document::Document;
use rsvelte_plugin_interface::Extension;
use rsvelte_svelte::Parsed;
use rsvelte_svelte::syntax::syntax_tree::TemplateNode;

#[derive(Debug)]
pub struct ElementCount;

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
pub struct CountElements;

impl Task for CountElements {
    fn identifier(&self) -> &'static str {
        "example.count_elements/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        if let Err(diagnostic) = rsvelte_svelte::fully_parsed(context) {
            out.diagnostics.push(diagnostic.clone());
            return;
        }
        let count = context
            .get::<ElementCount>()
            .expect("a parsed component has an element count");
        out.file("elements.txt", count.to_string());
    }
}

pub static PLUGIN: Plugin = Plugin {
    identifier: "example.count_elements",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "svelte",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_svelte::register(registry);
    registry.artifact::<ElementCount>().task(CountElements);
}

/// How a host installs the plugin. It takes no options.
pub static EXTENSION: Extension = Extension {
    identifier: "example.count_elements",
    install: |registry, _| {
        register(registry);
        Ok(())
    },
};

#[cfg(test)]
mod tests;
