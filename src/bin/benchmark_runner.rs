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

use svelte_compiler_rust::svelte2tsx::{
    Svelte2TsxMode, Svelte2TsxNamespace, Svelte2TsxOptions, SvelteVersion, svelte2tsx,
};
use svelte_compiler_rust::{CompileOptions, GenerateMode, ParseOptions, compile, parse};

#[derive(Debug, Clone, PartialEq)]
enum Task {
    CompileClient,
    CompileServer,
    Parse,
    Svelte2Tsx,
}

#[derive(Debug)]
struct Config {
    mode: String,
    task: Task,
    files_path: String,
    iterations: usize,
    warmup: usize,
}

fn parse_args() -> Result<Config, String> {
    let args: Vec<String> = env::args().collect();
    let mut mode = String::from("single");
    let mut task = Task::CompileClient;
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
            "--task" => {
                i += 1;
                if i < args.len() {
                    task = match args[i].as_str() {
                        "compile-client" => Task::CompileClient,
                        "compile-server" => Task::CompileServer,
                        "parse" => Task::Parse,
                        "svelte2tsx" => Task::Svelte2Tsx,
                        other => return Err(format!("Unknown task: {}", other)),
                    };
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
                    match args[i].parse() {
                        Ok(n) => iterations = n,
                        Err(_) => eprintln!(
                            "warning: invalid --iterations value '{}', using default {}",
                            args[i], iterations
                        ),
                    }
                }
            }
            "--warmup" => {
                i += 1;
                if i < args.len() {
                    match args[i].parse() {
                        Ok(n) => warmup = n,
                        Err(_) => eprintln!(
                            "warning: invalid --warmup value '{}', using default {}",
                            args[i], warmup
                        ),
                    }
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
        task,
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

fn process_file(source: &str, filename: &str, task: &Task) {
    match task {
        Task::CompileClient => {
            let options = CompileOptions {
                name: Some(filename.to_string()),
                generate: GenerateMode::Client,
                enable_sourcemap: false,
                ..Default::default()
            };
            let _ = compile(source, options);
        }
        Task::CompileServer => {
            let options = CompileOptions {
                name: Some(filename.to_string()),
                generate: GenerateMode::Server,
                enable_sourcemap: false,
                ..Default::default()
            };
            let _ = compile(source, options);
        }
        Task::Parse => {
            let options = ParseOptions {
                modern: true,
                skip_expression_loc: true,
                defer_script_parse: true,
                ..Default::default()
            };
            let _ = parse(source, options);
        }
        Task::Svelte2Tsx => {
            let options = Svelte2TsxOptions {
                filename: filename.to_string(),
                is_ts_file: false,
                mode: Svelte2TsxMode::Ts,
                accessors: false,
                namespace: Svelte2TsxNamespace::Html,
                version: SvelteVersion::V5,
                runes: None,
                emit_jsdoc: false,
                rewrite_external_imports: None,
            };
            let _ = svelte2tsx(source, options);
        }
    }
}

fn run_single_threaded(files: &[(String, String)], task: &Task) {
    match task {
        Task::Parse => {
            // Reuse parser instance across files for reduced per-file overhead
            let dummy_source = "";
            let mut parser = svelte_compiler_rust::compiler::phases::phase1_parse::Parser::new(
                dummy_source,
                ParseOptions {
                    modern: true,
                    skip_expression_loc: true,
                    defer_script_parse: true,
                    ..Default::default()
                },
            );
            let options = ParseOptions {
                modern: true,
                skip_expression_loc: true,
                defer_script_parse: true,
                ..Default::default()
            };
            for (_path, content) in files {
                let _ = svelte_compiler_rust::compiler::phases::phase1_parse::parse_reuse(
                    &mut parser,
                    content,
                    options,
                );
            }
        }
        _ => {
            for (path, content) in files {
                process_file(content, path, task);
            }
        }
    }
}

#[cfg(feature = "native")]
fn run_multi_threaded(files: &[(String, String)], task: &Task) {
    files.par_iter().for_each(|(path, content)| {
        process_file(content, path, task);
    });
}

#[cfg(not(feature = "native"))]
fn run_multi_threaded(files: &[(String, String)], task: &Task) {
    run_single_threaded(files, task);
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
        "Loaded {} files, mode: {}, task: {:?}, iterations: {}, warmup: {}",
        files.len(),
        config.mode,
        config.task,
        config.iterations,
        config.warmup
    );

    let is_multi = config.mode == "multi";

    // Warmup
    for _ in 0..config.warmup {
        if is_multi {
            run_multi_threaded(&files, &config.task);
        } else {
            run_single_threaded(&files, &config.task);
        }
    }

    // Benchmark
    let mut times = Vec::with_capacity(config.iterations);

    for _ in 0..config.iterations {
        let start = Instant::now();

        if is_multi {
            run_multi_threaded(&files, &config.task);
        } else {
            run_single_threaded(&files, &config.task);
        }

        let elapsed = start.elapsed();
        times.push(elapsed.as_secs_f64() * 1000.0);
    }

    // Output as JSON
    let times_json: Vec<String> = times.iter().map(|t| format!("{:.4}", t)).collect();
    println!("{{\"times\": [{}]}}", times_json.join(", "));
}
