//! The arm of `main`: `rsvelte_core` parses and compiles, `rsvelte_formatter` formats.
//!
//! Parse takes the options of `main`'s public `parse()` binding, in the modern tree. Format formats
//! `<style>` bodies too, as Prettier and `main`'s command line do.

mod harness;

use std::cell::RefCell;

use harness::{Arm, Runner, Task};
use rsvelte_core::{Allocator, CompileOptions, GenerateMode, ParseOptions};
use rsvelte_formatter::{Arenas, CssFormatOptions, FormatOptions};

struct Main;

struct Files {
    task: Task,
    files: Vec<(String, String)>,
    format: FormatOptions,
}

thread_local! {
    // The formatter's scratch buffers, one per worker thread, as `main`'s command line keeps them.
    static ARENAS: RefCell<Arenas> = RefCell::new(Arenas::new());
}

impl Runner for Files {
    fn run(&self, index: usize) -> Result<usize, String> {
        let (path, source) = &self.files[index];
        match self.task {
            Task::Parse => {
                let allocator = Allocator::default();
                let options = ParseOptions {
                    modern: true,
                    ..ParseOptions::public_api()
                };
                let root = rsvelte_core::parse(source, &allocator, options)
                    .map_err(|error| format!("{error:?}"))?;
                std::hint::black_box(&root);
                Ok(0)
            }
            Task::Client | Task::Server => {
                let options = CompileOptions {
                    generate: if self.task == Task::Client {
                        GenerateMode::Client
                    } else {
                        GenerateMode::Server
                    },
                    filename: Some(path.clone()),
                    runes: Some(true),
                    ..CompileOptions::default()
                };
                let result =
                    rsvelte_core::compile(source, options).map_err(|error| format!("{error:?}"))?;
                Ok(result.js.code.len()
                    + result.js.map.as_ref().map_or(0, String::len)
                    + result.css.as_ref().map_or(0, |css| css.code.len()))
            }
            Task::Format => ARENAS.with_borrow_mut(|arenas| {
                rsvelte_formatter::format_with_arenas(source, &self.format, arenas)
                    .map(|text| text.len())
                    .map_err(|error| format!("{error:?}"))
            }),
        }
    }
}

impl Arm for Main {
    const NAME: &'static str = "main";

    fn runner(task: Task, files: Vec<(String, String)>) -> Result<Box<dyn Runner>, String> {
        let format = FormatOptions::default().with_style_formatter(
            rsvelte_formatter::native_style_formatter(CssFormatOptions::default()),
        );
        Ok(Box::new(Files {
            task,
            files,
            format,
        }))
    }
}

fn main() {
    harness::main::<Main>();
}
