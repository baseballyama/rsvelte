//! Benchmark runner binary for measuring compiler performance.
//!
//! This binary is called by the Node.js benchmark script to measure
//! the Rust compiler's performance in single-threaded and multi-threaded modes.

use std::env;
use std::fs;
use std::io::{self, BufRead};
use std::time::Instant;

#[cfg(feature = "native")]
use rayon::prelude::*;

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

#[derive(Debug)]
struct Config {
    mode: String,
    files_path: String,
    iterations: usize,
    warmup: usize,
}

fn parse_args() -> Result<Config, String> {
    let args: Vec<String> = env::args().collect();
    let mut mode = String::from("single");
    let mut files_path = String::new();
    let mut iterations = 5;
    let mut warmup = 2;

    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            "--mode" => {
                i += 1;
                if i < args.len() {
                    mode = args[i].clone();
                }
            }
            "--files" => {
                i += 1;
                if i < args.len() {
                    files_path = args[i].clone();
                }
            }
            "--iterations" => {
                i += 1;
                if i < args.len() {
                    iterations = args[i].parse().unwrap_or(5);
                }
            }
            "--warmup" => {
                i += 1;
                if i < args.len() {
                    warmup = args[i].parse().unwrap_or(2);
                }
            }
            _ => {}
        }
        i += 1;
    }

    if files_path.is_empty() {
        return Err("--files argument is required".to_string());
    }

    Ok(Config {
        mode,
        files_path,
        iterations,
        warmup,
    })
}

fn load_files(files_path: &str) -> io::Result<Vec<(String, String)>> {
    let file = fs::File::open(files_path)?;
    let reader = io::BufReader::new(file);
    let mut files = Vec::new();

    for line in reader.lines() {
        let path = line?;
        if path.is_empty() {
            continue;
        }
        if let Ok(content) = fs::read_to_string(&path) {
            files.push((path, content));
        }
    }

    Ok(files)
}

fn compile_file(source: &str, filename: &str) {
    let options = CompileOptions {
        name: Some(filename.to_string()),
        generate: GenerateMode::Client,
        ..Default::default()
    };
    // Ignore compilation errors for benchmark
    let _ = compile(source, options);
}

fn run_single_threaded(files: &[(String, String)]) {
    for (path, content) in files {
        compile_file(content, path);
    }
}

#[cfg(feature = "native")]
fn run_multi_threaded(files: &[(String, String)]) {
    files.par_iter().for_each(|(path, content)| {
        compile_file(content, path);
    });
}

#[cfg(not(feature = "native"))]
fn run_multi_threaded(files: &[(String, String)]) {
    // Fallback to single-threaded if rayon is not available
    run_single_threaded(files);
}

fn main() {
    let config = match parse_args() {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    };

    let files = match load_files(&config.files_path) {
        Ok(f) => f,
        Err(e) => {
            eprintln!("Error loading files: {}", e);
            std::process::exit(1);
        }
    };

    eprintln!(
        "Loaded {} files, mode: {}, iterations: {}, warmup: {}",
        files.len(),
        config.mode,
        config.iterations,
        config.warmup
    );

    let is_multi = config.mode == "multi";

    // Warmup
    for _ in 0..config.warmup {
        if is_multi {
            run_multi_threaded(&files);
        } else {
            run_single_threaded(&files);
        }
    }

    // Benchmark
    let mut times = Vec::with_capacity(config.iterations);

    for _ in 0..config.iterations {
        let start = Instant::now();

        if is_multi {
            run_multi_threaded(&files);
        } else {
            run_single_threaded(&files);
        }

        let elapsed = start.elapsed();
        times.push(elapsed.as_secs_f64() * 1000.0); // Convert to milliseconds
    }

    // Output as JSON
    let times_json: Vec<String> = times.iter().map(|t| format!("{:.4}", t)).collect();
    println!("{{\"times\": [{}]}}", times_json.join(", "));
}
