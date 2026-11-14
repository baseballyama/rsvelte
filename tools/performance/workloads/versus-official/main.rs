//! The arm of `main`: the compiler `rsvelte_core::compile` and the formatter
//! `rsvelte_formatter::format`, each with the options its command line uses by default.
//!
//! The compiler builds the source map, as the official `compile` does. The formatter formats
//! `<style>` with `oxc_formatter_css`, as `rsvelte-fmt` does; its library default leaves the
//! stylesheet as written.

mod harness;

use harness::{Output, Task, Tool};
use rsvelte_core::{CompileOptions, GenerateMode};
use rsvelte_formatter::{
    CssFormatOptions, CssTrailingCommas, FormatOptions, IndentStyle, IndentWidth, JsFormatOptions,
    LineWidth,
};

#[global_allocator]
static ALLOCATOR: harness::Allocator = harness::Allocator;

enum Main {
    Compile(GenerateMode),
    Format(FormatOptions),
}

/// `rsvelte-fmt`'s options with no configuration file: two spaces and 80 columns.
fn format_options() -> FormatOptions {
    let indent_width = IndentWidth::try_from(2).expect("2 is an indent width");
    let line_width = LineWidth::try_from(80).expect("80 is a line width");
    let js = JsFormatOptions {
        indent_style: IndentStyle::Space,
        indent_width,
        line_width,
        ..JsFormatOptions::default()
    };
    let css = CssFormatOptions {
        indent_style: IndentStyle::Space,
        indent_width,
        line_width,
        trailing_commas: CssTrailingCommas::Always,
        ..CssFormatOptions::default()
    };
    FormatOptions {
        js,
        style_formatter: Some(rsvelte_formatter::native_style_formatter(css)),
        ..FormatOptions::default()
    }
}

impl Tool for Main {
    const NAME: &'static str = "main";

    fn new(task: Task) -> Result<Self, String> {
        Ok(match task {
            Task::Client => Self::Compile(GenerateMode::Client),
            Task::Server => Self::Compile(GenerateMode::Server),
            Task::Format => Self::Format(format_options()),
        })
    }

    fn run(&self, filename: &str, source: &str) -> Result<Output, String> {
        match self {
            Self::Compile(generate) => {
                let options = CompileOptions {
                    filename: Some(filename.to_owned()),
                    generate: *generate,
                    runes: Some(true),
                    ..CompileOptions::default()
                };
                let result = rsvelte_core::compile(source, options).map_err(|e| e.to_string())?;
                let mut compared = vec![("js", result.js.code)];
                // An empty stylesheet is no stylesheet, as the official `css` is then null.
                compared.extend(
                    result
                        .css
                        .filter(|css| !css.code.is_empty())
                        .map(|css| ("css", css.code)),
                );
                let other_bytes = result.js.map.as_ref().map_or(0, String::len)
                    + result
                        .warnings
                        .iter()
                        .map(|w| w.message.len())
                        .sum::<usize>();
                Ok(Output {
                    compared,
                    other_bytes,
                })
            }
            Self::Format(options) => {
                let text = rsvelte_formatter::format(source, options).map_err(|e| e.to_string())?;
                Ok(Output {
                    compared: vec![("svelte", text)],
                    other_bytes: 0,
                })
            }
        }
    }
}

fn main() {
    harness::main::<Main>();
}
