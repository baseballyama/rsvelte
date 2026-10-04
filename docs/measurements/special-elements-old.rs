use rsvelte_core::{CompileOptions, GenerateMode};
use rsvelte_core::compiler::compile_without_ast;
fn main() {
    let mut cases: Vec<_> = std::fs::read_dir("/cases").unwrap().map(|entry| {
        let path = entry.unwrap().path().join("input.svelte");
        let source = std::fs::read_to_string(&path).unwrap();
        (path, source)
    }).collect();
    cases.sort_by(|a, b| a.0.cmp(&b.0));
    let rounds: usize = std::env::args().nth(1).unwrap().parse().unwrap();
    let mut outputs = 0;
    let mut bytes = 0;
    for _ in 0..rounds {
        for (path, source) in &cases {
            for generate in [GenerateMode::Client, GenerateMode::Server] {
                let output = compile_without_ast(source, CompileOptions { filename: Some(path.to_string_lossy().into_owned()), generate, runes: Some(true), ..Default::default() }).unwrap();
                bytes += std::hint::black_box(output.js.code.len());
                outputs += 1;
            }
        }
    }
    println!("documents={} outputs={outputs} bytes={bytes}", cases.len());
}
