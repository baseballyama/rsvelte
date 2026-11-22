//! `rsvelte format`: oxfmt's native formatters, with Svelte files formatted natively where
//! oxfmt would call Prettier.

use std::any::Any;
use std::panic::AssertUnwindSafe;
use std::process::ExitCode;
use std::sync::Arc;

use oxc_formatter::JsFormatOptions;
use oxfmt::{HostFormatter, HostFormatters, Language};
use rsvelte_kernel::performance::stack;
use rsvelte_kernel::source::positions::LineIndex;
use rsvelte_svelte_format::Options;
use rsvelte_svelte_format::options::NAMES;
use serde_json::Value;

/// Runs oxfmt's command line over `arguments`, the words after `format`.
pub(crate) fn format(arguments: &[String]) -> ExitCode {
    let arguments: Vec<&str> = arguments.iter().map(String::as_str).collect();
    let command = match oxfmt::cli::format_command()
        .run_inner(bpaf::Args::from(arguments.as_slice()).set_name("rsvelte format"))
    {
        Ok(command) => command,
        Err(failure) => {
            failure.print_message(100);
            return ExitCode::from(u8::try_from(failure.exit_code()).unwrap_or(2));
        }
    };
    oxfmt::cli::init_tracing();
    oxfmt::cli::init_rayon(command.runtime_options.threads);
    let tailwind = tailwind::Tailwind::default();
    let hosts = HostFormatters::default()
        .with(Language::Svelte, Svelte(tailwind.clone()))
        .with_tailwind_sorter(tailwind)
        .with_config_loader(configuration::Node);
    let result = oxfmt::cli::WalkRunner::new(command).with_hosts(hosts).run();
    ExitCode::from(result.exit_code())
}

struct Svelte(tailwind::Tailwind);

impl HostFormatter for Svelte {
    fn format(
        &self,
        source_text: &str,
        options: &Value,
        javascript: &JsFormatOptions,
    ) -> Result<String, String> {
        let prettier = options;
        let mut options = svelte_options(prettier)?;
        options.sort_imports.clone_from(&javascript.sort_imports);
        options.jsdoc.clone_from(&javascript.jsdoc);
        if let Some(sort) = &javascript.sort_tailwindcss {
            let sorter = tailwind::ForFile {
                tailwind: self.0.clone(),
                options: prettier.clone(),
            };
            options.tailwind = Some(rsvelte_svelte_format::tailwind::Tailwind::new(
                Arc::clone(sort),
                prettier["tailwindPreserveDuplicates"] == true,
                Arc::new(sorter),
            ));
        }
        if let Some(name) = rsvelte_svelte_format::unported(&options) {
            return Err(unprinted(&format!("this `{name}` value")));
        }
        // oxfmt runs a host on its own rayon workers, which neither catch a panic nor have the
        // stack oxc's passes need for deeply nested text.
        let formatted = std::panic::catch_unwind(AssertUnwindSafe(|| {
            stack::for_text(source_text.len(), || {
                rsvelte_svelte_format::format(source_text, &options)
            })
        }))
        .map_err(|panic| format!("the Svelte formatter panicked: {}", panic_message(&*panic)))?;
        formatted.map_err(|diagnostic| {
            let at = LineIndex::new(source_text).line_column(diagnostic.span.start_offset);
            format!("{} ({}:{})", diagnostic.message, at.line, at.column + 1)
        })
    }
}

/// What oxfmt gives a host that changes nothing in a Svelte file's output.
const PLUMBING: &[&str] = &[
    "parser",
    "filepath",
    "_useSveltePlugin",
    "vueIndentScriptAndStyle",
];

/// What oxfmt gives a host for `sortTailwindcss`, which the host reads from the JavaScript options
/// and its sorter reads from these.
const TAILWIND: &[&str] = &[
    "_useTailwindPlugin",
    "tailwindConfig",
    "tailwindStylesheet",
    "tailwindFunctions",
    "tailwindAttributes",
    "tailwindPreserveWhitespace",
    "tailwindPreserveDuplicates",
];

/// The options Prettier would give prettier-plugin-svelte, or the first option oxfmt would apply
/// to a Svelte file that the Svelte formatter does not.
fn svelte_options(prettier: &Value) -> Result<Options, String> {
    let Value::Object(options) = prettier else {
        return Err(format!("the options are not an object: {prettier}"));
    };
    let mut known = serde_json::Map::new();
    for (name, value) in options {
        if NAMES.contains(&name.as_str()) {
            known.insert(name.clone(), value.clone());
        } else if !PLUMBING.contains(&name.as_str()) && !TAILWIND.contains(&name.as_str()) {
            return Err(unprinted(&format!("`{name}`")));
        }
    }
    serde_json::from_value(Value::Object(known)).map_err(|error| error.to_string())
}

fn unprinted(what: &str) -> String {
    format!("the Svelte formatter does not print {what} yet")
}

fn panic_message(panic: &(dyn Any + Send)) -> &str {
    (panic.downcast_ref::<String>().map(String::as_str))
        .or_else(|| panic.downcast_ref::<&str>().copied())
        .unwrap_or("a payload that is not a string")
}

mod configuration;
mod tailwind;

#[cfg(test)]
mod tests;
