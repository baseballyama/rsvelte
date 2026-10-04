#![expect(clippy::print_stdout, reason = "reports measured workload counters")]

use std::hint::black_box;
use std::path::Path;
use std::time::Instant;

use rsvelte_kernel::performance::measurement::{CountingAllocator, thread_allocations};
use rsvelte_svelte_parser::parse::parse;

#[global_allocator]
static ALLOCATOR: CountingAllocator = CountingAllocator;

#[path = "support/inputs.rs"]
mod input;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let arguments: Vec<_> = std::env::args().skip(1).collect();
    if arguments.len() != 2 {
        return Err("expected <fixture root> <positive rounds>".into());
    }
    let rounds: u32 = arguments[1].parse()?;
    if rounds == 0 {
        return Err("rounds must be positive".into());
    }
    let files = input::inputs(Path::new(&arguments[0]))?;
    if files.is_empty() {
        return Err("the input population is empty".into());
    }
    let mut population = 0;
    let mut parse_errors = 0;
    let mut unsupported = 0;
    let mut output_bytes = 0;
    let mut allocations = 0;
    let mut bytes = 0;
    let mut elapsed_ns = 0;
    let mut maximum_heap_bytes = 0;
    for file in &files {
        let source = std::fs::read_to_string(file)?;
        let Ok(component) = parse(&source) else {
            parse_errors += 1;
            continue;
        };
        if !component
            .instance
            .as_ref()
            .is_some_and(|script| script.typescript)
        {
            continue;
        }
        population += 1;
        let start = Instant::now();
        let (allocations_before, bytes_before) = thread_allocations();
        for _ in 0..rounds {
            match rsvelte_svelte_typescript_projection::lower(
                black_box(&component),
                black_box(&source),
            ) {
                Ok(tree) => {
                    maximum_heap_bytes = maximum_heap_bytes.max(tree.heap_bytes());
                    output_bytes +=
                        black_box(rsvelte_svelte_typescript_projection::emit(&tree, &source))
                            .out
                            .len();
                }
                Err(_) => unsupported += 1,
            }
        }
        let (allocations_after, bytes_after) = thread_allocations();
        allocations += allocations_after - allocations_before;
        bytes += bytes_after - bytes_before;
        elapsed_ns += start.elapsed().as_nanos();
    }
    if population == 0 {
        return Err("no parsed TypeScript components in the population".into());
    }
    let mut report = rsvelte_kernel::output::structured_data::StructuredDataWriter::new(false);
    report
        .begin_object()
        .key("documents")
        .write_number(files.len() as u64)
        .key("population")
        .write_number(population)
        .key("parse_errors")
        .write_number(parse_errors)
        .key("rounds")
        .write_number(rounds)
        .key("unsupported")
        .write_number(unsupported)
        .key("output_bytes")
        .write_number(output_bytes as u64)
        .key("allocations")
        .write_number(allocations)
        .key("allocated_bytes")
        .write_number(bytes)
        .key("projection_ns")
        .write_number(elapsed_ns as u64)
        .key("maximum_ast_heap_bytes")
        .write_number(maximum_heap_bytes as u64)
        .end_object();
    println!("{}", report.finish());
    Ok(())
}
