#![expect(
    clippy::print_stdout,
    reason = "reports the measured fixture population"
)]

use std::fmt::Write as _;
use std::path::Path;

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;

#[path = "support/inputs.rs"]
mod input;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let root = std::env::args().nth(1).ok_or("expected <fixture root>")?;
    let files = input::inputs(Path::new(&root))?;
    if files.is_empty() {
        return Err("the input population is empty".into());
    }
    let (mut parsed, mut projected, mut invalid, mut unsupported) = (0, 0, 0, 0);
    let mut report = String::new();
    for file in &files {
        let source = std::fs::read_to_string(file)?;
        let Ok(component) = rsvelte_svelte_parser::parse::parse(&source) else {
            continue;
        };
        parsed += 1;
        let Ok(tree) = rsvelte_svelte_typescript_projection::lower(&component, &source) else {
            unsupported += 1;
            continue;
        };
        projected += 1;
        let output = rsvelte_svelte_typescript_projection::emit(&tree, &source);
        let allocator = Allocator::default();
        let result = Parser::new(&allocator, &output.out, SourceType::ts()).parse();
        if !result.diagnostics.is_empty() {
            invalid += 1;
            writeln!(report, "{}: {:?}", file.display(), result.diagnostics)?;
        }
    }
    println!(
        "documents={}, parsed={parsed}, projected={projected}, \
         unsupported={unsupported}, invalid={invalid}",
        files.len()
    );
    if invalid > 0 {
        return Err(report.into());
    }
    Ok(())
}
