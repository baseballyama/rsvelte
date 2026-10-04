use std::hint::black_box;
use std::io::Write;
use std::time::Instant;

use rsvelte_kernel::computation::pipeline::{self, Document, Registry, RunOptions, Sharing};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let arguments: Vec<_> = std::env::args().skip(1).collect();
    if arguments.len() != 2 {
        return Err("expected <input-directory> <rounds>".into());
    }
    let rounds: usize = arguments[1].parse()?;
    let mut entries = std::fs::read_dir(&arguments[0])?.collect::<Result<Vec<_>, _>>()?;
    entries.sort_by_key(std::fs::DirEntry::path);
    let documents = entries
        .iter()
        .map(|entry| {
            Document::new(
                entry.file_name().to_string_lossy().into_owned(),
                std::fs::read_to_string(entry.path().join("input.svelte"))?,
            )
            .map_err(|error| std::io::Error::other(format!("{error:?}")))
        })
        .collect::<std::io::Result<Vec<_>>>()?;
    let mut registry = Registry::new();
    rsvelte_svelte_compile::register(&mut registry);
    let options = RunOptions {
        tasks: &["svelte.compile/client"],
        sharing: Sharing::Shared,
        threads: Some(1),
    };
    let run = || {
        let results =
            pipeline::run(&registry, &documents, &options).map_err(|error| error.to_string())?;
        let mut bytes = 0;
        for result in &results {
            if result.panic.is_some()
                || result
                    .outputs
                    .iter()
                    .any(|(_, output)| !output.diagnostics.is_empty())
            {
                return Err("every benchmark document must compile".into());
            }
            bytes += result
                .outputs
                .iter()
                .flat_map(|(_, output)| &output.files)
                .map(|file| file.text.len())
                .sum::<usize>();
        }
        black_box(results);
        Ok::<_, Box<dyn std::error::Error>>(bytes)
    };
    for _ in 0..20 {
        run()?;
    }
    let start = Instant::now();
    let mut bytes = 0;
    for _ in 0..rounds {
        bytes += run()?;
    }
    writeln!(
        std::io::stdout().lock(),
        "{{\"documents\":{},\"rounds\":{},\"elapsed_ns\":{},\"output_bytes\":{}}}",
        documents.len(),
        rounds,
        start.elapsed().as_nanos(),
        bytes
    )?;
    Ok(())
}
