//! `rsvelte format`: oxfmt's native formatters, with Svelte files formatted natively where
//! oxfmt would call Prettier.

use std::process::ExitCode;

use oxfmt::{HostFormatter, HostFormatters, Language};
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
    let hosts = HostFormatters::default().with(Language::Svelte, Svelte);
    let result = oxfmt::cli::WalkRunner::new(command).with_hosts(hosts).run();
    ExitCode::from(result.exit_code())
}

struct Svelte;

impl HostFormatter for Svelte {
    fn format(&self, source_text: &str, options: &Value) -> Result<String, String> {
        let options = svelte_options(options)?;
        if let Some(name) = rsvelte_svelte_format::unported(&options) {
            return Err(format!(
                "the Svelte formatter does not print this `{name}` value yet"
            ));
        }
        rsvelte_svelte_format::format(source_text, &options).map_err(|diagnostic| {
            let before = &source_text[..diagnostic.span.start_offset as usize];
            let line = before.matches('\n').count() + 1;
            let column = before.len() - before.rfind('\n').map_or(0, |i| i + 1) + 1;
            format!("{} ({line}:{column})", diagnostic.message)
        })
    }
}

/// The options Prettier would give prettier-plugin-svelte, without Prettier's plumbing
/// (`parser`, `filepath`) and the other plugins' payloads.
fn svelte_options(prettier: &Value) -> Result<Options, String> {
    let Value::Object(options) = prettier else {
        return Err(format!("the options are not an object: {prettier}"));
    };
    let known = (options.iter())
        .filter(|(name, _)| NAMES.contains(&name.as_str()))
        .map(|(name, value)| (name.clone(), value.clone()))
        .collect();
    serde_json::from_value(Value::Object(known)).map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests;
