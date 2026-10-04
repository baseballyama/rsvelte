#![expect(clippy::print_stdout, reason = "reports measured workload counters")]

use std::hint::black_box;
use std::path::Path;

use rsvelte_kernel::performance::measurement::{CountingAllocator, thread_allocations};

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
    let sources: Vec<_> = input::inputs(Path::new(&arguments[0]))?
        .iter()
        .map(std::fs::read_to_string)
        .collect::<Result<_, _>>()?;
    if sources.is_empty() {
        return Err("the input population is empty".into());
    }
    let (mut outputs, mut output_bytes) = (0u64, 0u64);
    let (initial_allocations, initial_bytes) = thread_allocations();
    for _ in 0..rounds {
        for source in &sources {
            let component = rsvelte_svelte_parser::parse::parse(black_box(source))
                .map_err(|diagnostic| diagnostic.message)?;
            let tree = rsvelte_svelte_typescript_projection::lower(&component, source)
                .map_err(|unsupported| unsupported.what)?;
            let output = rsvelte_svelte_typescript_projection::emit(&tree, source);
            outputs += 1;
            output_bytes += black_box(output).out.len() as u64;
        }
    }
    let (allocations, bytes) = thread_allocations();
    println!(
        "{{\"documents\":{},\"rounds\":{rounds},\"outputs\":{outputs}, \
         \"output_bytes\":{output_bytes}, \
         \"allocations\":{},\"allocated_bytes\":{}}}",
        sources.len(),
        allocations - initial_allocations,
        bytes - initial_bytes,
    );
    Ok(())
}
