use rsvelte_lint_runner::rule::Reporter;
use serde::Deserialize;

use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

mod layout;
mod script;
mod template;

use layout::{Layout, Options, Tokens};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/indent",
    files: Files::Components,
    configure,
};

#[derive(Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct UserOptions {
    indent: Option<Size>,
    indent_script: Option<bool>,
    switch_case: Option<u32>,
    align_attributes_vertically: Option<bool>,
    /// `ESLint` selectors over `ESTree` nodes, which this crate has no engine for: a known gap, so
    /// a non-empty list is refused rather than ignored.
    #[serde(default)]
    ignored_nodes: Vec<String>,
}

#[derive(Deserialize)]
#[serde(untagged)]
enum Size {
    Spaces(u32),
    Tab(Tab),
}

#[derive(Deserialize)]
#[serde(rename_all = "lowercase")]
enum Tab {
    Tab,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let user: UserOptions = options.single()?;
    if !user.ignored_nodes.is_empty() {
        return Err("`ignoredNodes` selectors are not supported".to_owned());
    }
    let (character, size) = match user.indent {
        None => (' ', 2),
        Some(Size::Spaces(0)) => return Err("`indent` must be at least 1".to_owned()),
        Some(Size::Spaces(n)) => (' ', n),
        Some(Size::Tab(Tab::Tab)) => ('\t', 1),
    };
    Ok(Box::new(Indent(Options {
        character,
        size,
        indent_script: user.indent_script.unwrap_or(true),
        switch_case: user.switch_case.unwrap_or(1),
        align_attributes_vertically: character == ' '
            && user.align_attributes_vertically.unwrap_or(false),
    })))
}

#[derive(Debug)]
struct Indent(Options);

impl SvelteRule for Indent {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        if !file.path().ends_with(".svelte") {
            return;
        }
        let component = file.component().expect("a component rule");
        let tokens = Tokens::new(
            component,
            file.source(),
            file.context.ecmascript_line_index(),
        );
        let mut layout = Layout::new(tokens, self.0);
        template::Template {
            script: script::Script {
                layout: &mut layout,
                javascript: &component.javascript,
                parents: file.parents(),
                annotations: script::annotations(&component.javascript),
            },
            component,
        }
        .visit();
        layout.check(reporter);
    }
}

#[cfg(test)]
mod tests;
