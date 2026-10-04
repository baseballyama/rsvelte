use std::hint::black_box;
use std::time::Instant;
use rsvelte_core::{compile, CompileOptions};
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<_> = std::env::args().skip(1).collect();
    let rounds: usize = args[1].parse()?;
    let mut entries = std::fs::read_dir(&args[0])?.collect::<Result<Vec<_>, _>>()?;
    entries.sort_by_key(std::fs::DirEntry::path);
    let inputs = entries.iter().map(|entry| {
        Ok((entry.file_name().to_string_lossy().into_owned(), std::fs::read_to_string(entry.path().join("input.svelte"))?))
    }).collect::<std::io::Result<Vec<_>>>()?;
    for _ in 0..20 {
        for (filename, source) in &inputs {
            black_box(compile(source, CompileOptions {filename: Some(filename.clone()), runes: Some(true), enable_sourcemap: false, ..Default::default()})?);
        }
    }
    cycle_gate()?;
    let start = Instant::now();
    let mut bytes = 0;
    for _ in 0..rounds {
        for (filename, source) in &inputs {
            let output = compile(source, CompileOptions {filename: Some(filename.clone()), runes: Some(true), enable_sourcemap: false, ..Default::default()})?;
            bytes += output.js.code.len() + output.css.as_ref().map_or(0, |css| css.code.len());
            black_box(output);
        }
    }
    let elapsed = start.elapsed();
    cycle_gate()?;
    println!("{{\"documents\":{},\"rounds\":{},\"elapsed_ns\":{},\"output_bytes\":{}}}", inputs.len(), rounds, elapsed.as_nanos(), bytes);
    Ok(())
}

fn cycle_gate() -> std::io::Result<()> {
    use std::io::{Read, Write};
    writeln!(std::io::stdout(), "RSVELTE_CYCLE_GATE")?;
    std::io::stdout().flush()?;
    std::io::stdin().read_exact(&mut [0])
}
