//! Profiler binary for measuring compiler performance with detailed metrics.
//!
//! Usage:
//!
//! ```text
//! cargo run --release --bin profiler -- [OPTIONS]
//!
//! Options:
//!   --file <PATH>       Single file to profile
//!   --dir <PATH>        Directory of .svelte files to profile
//!   --iterations <N>    Number of iterations (default: 10)
//!   --warmup <N>        Number of warmup iterations (default: 3)
//!   --phase <PHASE>     Phase to profile: parse, analyze, transform, all (default: all)
//!   --mode <MODE>       Generation mode: client, server (default: client)
//!   --output <FORMAT>   Output format: text, json (default: text)
//! ```

use rustc_hash::FxHashMap;
use std::env;
use std::fs;
use std::path::PathBuf;
use std::time::{Duration, Instant};

use svelte_compiler_rust::compiler::phases::phase1_parse::{ParseOptions, parse};
use svelte_compiler_rust::compiler::phases::phase2_analyze::analyze_component;
use svelte_compiler_rust::compiler::phases::phase3_transform::transform_component;
use svelte_compiler_rust::{CompileOptions, GenerateMode};

#[derive(Debug, Clone)]
struct Config {
    file: Option<String>,
    dir: Option<String>,
    iterations: usize,
    warmup: usize,
    phase: String,
    mode: GenerateMode,
    output: String,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            file: None,
            dir: None,
            iterations: 10,
            warmup: 3,
            phase: "all".to_string(),
            mode: GenerateMode::Client,
            output: "text".to_string(),
        }
    }
}

#[derive(Debug, Clone)]
struct PhaseMetrics {
    #[allow(dead_code)]
    name: String,
    times_ns: Vec<u64>,
    success_count: usize,
    error_count: usize,
}

impl PhaseMetrics {
    fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            times_ns: Vec::new(),
            success_count: 0,
            error_count: 0,
        }
    }

    fn add_time(&mut self, duration: Duration, success: bool) {
        self.times_ns.push(duration.as_nanos() as u64);
        if success {
            self.success_count += 1;
        } else {
            self.error_count += 1;
        }
    }

    fn mean_ns(&self) -> f64 {
        if self.times_ns.is_empty() {
            return 0.0;
        }
        self.times_ns.iter().sum::<u64>() as f64 / self.times_ns.len() as f64
    }

    fn median_ns(&self) -> f64 {
        if self.times_ns.is_empty() {
            return 0.0;
        }
        let mut sorted = self.times_ns.clone();
        sorted.sort();
        let mid = sorted.len() / 2;
        if sorted.len() & 1 == 0 {
            (sorted[mid - 1] + sorted[mid]) as f64 / 2.0
        } else {
            sorted[mid] as f64
        }
    }

    fn min_ns(&self) -> u64 {
        *self.times_ns.iter().min().unwrap_or(&0)
    }

    fn max_ns(&self) -> u64 {
        *self.times_ns.iter().max().unwrap_or(&0)
    }

    fn std_dev_ns(&self) -> f64 {
        if self.times_ns.len() < 2 {
            return 0.0;
        }
        let mean = self.mean_ns();
        let variance = self
            .times_ns
            .iter()
            .map(|&x| {
                let diff = x as f64 - mean;
                diff * diff
            })
            .sum::<f64>()
            / (self.times_ns.len() - 1) as f64;
        variance.sqrt()
    }
}

#[derive(Debug)]
struct FileMetrics {
    filename: String,
    size_bytes: usize,
    parse: PhaseMetrics,
    analyze: PhaseMetrics,
    transform: PhaseMetrics,
    total: PhaseMetrics,
}

impl FileMetrics {
    fn new(filename: &str, size: usize) -> Self {
        Self {
            filename: filename.to_string(),
            size_bytes: size,
            parse: PhaseMetrics::new("parse"),
            analyze: PhaseMetrics::new("analyze"),
            transform: PhaseMetrics::new("transform"),
            total: PhaseMetrics::new("total"),
        }
    }
}

fn parse_args() -> Config {
    let args: Vec<String> = env::args().collect();
    let mut config = Config::default();

    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            "--file" => {
                i += 1;
                if i < args.len() {
                    config.file = Some(args[i].clone());
                }
            }
            "--dir" => {
                i += 1;
                if i < args.len() {
                    config.dir = Some(args[i].clone());
                }
            }
            "--iterations" => {
                i += 1;
                if i < args.len() {
                    config.iterations = args[i].parse().unwrap_or(10);
                }
            }
            "--warmup" => {
                i += 1;
                if i < args.len() {
                    config.warmup = args[i].parse().unwrap_or(3);
                }
            }
            "--phase" => {
                i += 1;
                if i < args.len() {
                    config.phase = args[i].clone();
                }
            }
            "--mode" => {
                i += 1;
                if i < args.len() {
                    config.mode = match args[i].as_str() {
                        "server" => GenerateMode::Server,
                        _ => GenerateMode::Client,
                    };
                }
            }
            "--output" => {
                i += 1;
                if i < args.len() {
                    config.output = args[i].clone();
                }
            }
            _ => {}
        }
        i += 1;
    }

    config
}

fn load_files(config: &Config) -> Vec<(String, String)> {
    let mut files = Vec::new();

    if let Some(ref path) = config.file
        && let Ok(content) = fs::read_to_string(path)
    {
        files.push((path.clone(), content));
    }

    if let Some(ref dir) = config.dir {
        let dir_path = PathBuf::from(dir);
        if dir_path.exists() {
            for entry in walkdir::WalkDir::new(&dir_path)
                .into_iter()
                .filter_map(|e| e.ok())
            {
                let path = entry.path();
                if path.extension().is_some_and(|ext| ext == "svelte")
                    && let Ok(content) = fs::read_to_string(path)
                {
                    files.push((path.display().to_string(), content));
                }
            }
        }
    }

    // Default: use synthetic test cases if no files specified
    if files.is_empty() {
        files.push(("small.svelte".to_string(), create_small_file()));
        files.push(("medium.svelte".to_string(), create_medium_file()));
        files.push(("large.svelte".to_string(), create_large_file()));
    }

    files
}

fn create_small_file() -> String {
    r#"<script>
    let name = $state("World");
</script>

<h1>Hello, {name}!</h1>"#
        .to_string()
}

fn create_medium_file() -> String {
    let mut s = String::from(
        r#"<script>
    let count = $state(0);
    let items = $state([1, 2, 3, 4, 5]);
    let doubled = $derived(count * 2);

    function increment() { count++; }
    function decrement() { count--; }
</script>

<div class="container">
    <h1>Counter: {count}</h1>
    <p>Doubled: {doubled}</p>
    <button onclick={increment}>+</button>
    <button onclick={decrement}>-</button>

    <ul>
"#,
    );

    for i in 0..10 {
        s.push_str(&format!(
            r#"        {{#if count > {i}}}
            <li class="active">Item {i}</li>
        {{:else}}
            <li>Item {i}</li>
        {{/if}}
"#
        ));
    }

    s.push_str(
        r#"    </ul>
</div>

<style>
    .container { padding: 1rem; }
    .active { font-weight: bold; }
</style>"#,
    );

    s
}

fn create_large_file() -> String {
    let mut s = String::from(
        r#"<script>
    let count = $state(0);
    let items = $state([]);
    let filter = $state("");
    let sortOrder = $state("asc");

    let filteredItems = $derived(
        items.filter(item => item.name.includes(filter))
    );

    let sortedItems = $derived(
        [...filteredItems].sort((a, b) =>
            sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        )
    );

    function addItem() {
        items = [...items, { id: items.length, name: `Item ${items.length}` }];
    }

    function removeItem(id) {
        items = items.filter(i => i.id !== id);
    }
</script>

<div class="app">
    <header>
        <h1>Item Manager ({count} clicks)</h1>
        <button onclick={() => count++}>Click me</button>
    </header>

    <nav>
        <input bind:value={filter} placeholder="Filter..." />
        <select bind:value={sortOrder}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
        </select>
        <button onclick={addItem}>Add Item</button>
    </nav>

    <main>
"#,
    );

    // Add many elements
    for i in 0..50 {
        s.push_str(&format!(
            r#"        <section class="section-{i}">
            <h2>Section {i}</h2>
            {{#if count > {i}}}
                <div class="content active">
                    <p>Content for section {i}</p>
                    {{#each sortedItems as item}}
                        <div class="item" class:selected={{item.id === {i}}}>
                            <span>{{item.name}}</span>
                            <button onclick={{() => removeItem(item.id)}}>Delete</button>
                        </div>
                    {{/each}}
                </div>
            {{:else}}
                <div class="content inactive">
                    <p>Click {i} times to activate this section</p>
                </div>
            {{/if}}
        </section>
"#
        ));
    }

    s.push_str(
        r#"    </main>

    <footer>
        <p>Total items: {items.length}</p>
        <p>Filtered items: {filteredItems.length}</p>
    </footer>
</div>

<style>
    .app { max-width: 1200px; margin: 0 auto; }
    header { padding: 1rem; background: #f0f0f0; }
    nav { display: flex; gap: 1rem; padding: 1rem; }
    main { padding: 1rem; }
    section { margin-bottom: 1rem; border: 1px solid #ccc; padding: 1rem; }
    .active { background: #e0ffe0; }
    .inactive { background: #ffe0e0; }
    .item { display: flex; justify-content: space-between; padding: 0.5rem; }
    .selected { background: #ffff00; }
    footer { padding: 1rem; background: #f0f0f0; }
</style>"#,
    );

    s
}

fn profile_file(config: &Config, filename: &str, content: &str) -> FileMetrics {
    let mut metrics = FileMetrics::new(filename, content.len());

    let parse_options = ParseOptions {
        modern: true,
        loose: false,
        filename: Some(filename.to_string()),
        skip_expression_loc: true,
    };

    let compile_options = CompileOptions {
        generate: config.mode,
        filename: Some(filename.to_string()),
        enable_sourcemap: false,
        ..Default::default()
    };

    let total_iterations = config.warmup + config.iterations;

    // For transform-only or analyze-only profiling, parse once and reuse
    if config.phase == "transform" || config.phase == "analyze" {
        // Parse once
        let parse_result = parse(content, parse_options.clone());
        if parse_result.is_err() {
            for _ in 0..total_iterations {
                metrics.total.add_time(Duration::ZERO, false);
            }
            return metrics;
        }
        let mut ast = parse_result.unwrap();

        // Analyze once (always needed for transform)
        let analyze_result = analyze_component(&mut ast, content, &compile_options);
        if analyze_result.is_err() {
            for _ in 0..total_iterations {
                metrics.total.add_time(Duration::ZERO, false);
            }
            return metrics;
        }
        let analysis = analyze_result.unwrap();

        for i in 0..total_iterations {
            let is_warmup = i < config.warmup;

            if config.phase == "analyze" {
                // Re-parse each time for analyze profiling since analyze mutates ast
                let parse_result = parse(content, parse_options.clone());
                if let Ok(mut ast2) = parse_result {
                    let analyze_start = Instant::now();
                    let analyze_result = analyze_component(&mut ast2, content, &compile_options);
                    let analyze_duration = analyze_start.elapsed();
                    if !is_warmup {
                        metrics
                            .analyze
                            .add_time(analyze_duration, analyze_result.is_ok());
                        metrics
                            .total
                            .add_time(analyze_duration, analyze_result.is_ok());
                    }
                }
            } else {
                // Transform only
                let transform_start = Instant::now();
                let transform_result =
                    transform_component(&analysis, &ast, content, &compile_options);
                let transform_duration = transform_start.elapsed();

                if !is_warmup {
                    metrics
                        .transform
                        .add_time(transform_duration, transform_result.is_ok());
                    metrics
                        .total
                        .add_time(transform_duration, transform_result.is_ok());
                }
            }
        }
    } else {
        // Original behavior for "all" and "parse" phases
        for i in 0..total_iterations {
            let is_warmup = i < config.warmup;

            // Phase 1: Parse
            let parse_start = Instant::now();
            let parse_result = parse(content, parse_options.clone());
            let parse_duration = parse_start.elapsed();

            if !is_warmup {
                metrics.parse.add_time(parse_duration, parse_result.is_ok());
            }

            if parse_result.is_err() {
                if !is_warmup {
                    metrics.total.add_time(parse_duration, false);
                }
                continue;
            }
            let mut ast = parse_result.unwrap();

            // Phase 2: Analyze
            let analyze_start = Instant::now();
            let analyze_result = analyze_component(&mut ast, content, &compile_options);
            let analyze_duration = analyze_start.elapsed();

            if !is_warmup {
                metrics
                    .analyze
                    .add_time(analyze_duration, analyze_result.is_ok());
            }

            if analyze_result.is_err() {
                if !is_warmup {
                    metrics
                        .total
                        .add_time(parse_duration + analyze_duration, false);
                }
                continue;
            }
            let analysis = analyze_result.unwrap();

            // Phase 3: Transform
            let transform_start = Instant::now();
            let transform_result = transform_component(&analysis, &ast, content, &compile_options);
            let transform_duration = transform_start.elapsed();

            if !is_warmup {
                metrics
                    .transform
                    .add_time(transform_duration, transform_result.is_ok());
            }

            // Total
            let total_duration = parse_duration + analyze_duration + transform_duration;
            if !is_warmup {
                metrics
                    .total
                    .add_time(total_duration, transform_result.is_ok());
            }
        }
    }

    metrics
}

fn format_ns(ns: f64) -> String {
    if ns >= 1_000_000_000.0 {
        format!("{:.2}s", ns / 1_000_000_000.0)
    } else if ns >= 1_000_000.0 {
        format!("{:.2}ms", ns / 1_000_000.0)
    } else if ns >= 1_000.0 {
        format!("{:.2}µs", ns / 1_000.0)
    } else {
        format!("{:.0}ns", ns)
    }
}

fn format_throughput(bytes: usize, ns: f64) -> String {
    if ns <= 0.0 {
        return "N/A".to_string();
    }
    let bytes_per_sec = (bytes as f64) / (ns / 1_000_000_000.0);
    if bytes_per_sec >= 1_000_000.0 {
        format!("{:.2} MB/s", bytes_per_sec / 1_000_000.0)
    } else if bytes_per_sec >= 1_000.0 {
        format!("{:.2} KB/s", bytes_per_sec / 1_000.0)
    } else {
        format!("{:.0} B/s", bytes_per_sec)
    }
}

fn print_phase_metrics(name: &str, metrics: &PhaseMetrics, size_bytes: usize) {
    if metrics.times_ns.is_empty() {
        return;
    }

    println!("  {}:", name);
    println!("    Mean:       {}", format_ns(metrics.mean_ns()));
    println!("    Median:     {}", format_ns(metrics.median_ns()));
    println!("    Min:        {}", format_ns(metrics.min_ns() as f64));
    println!("    Max:        {}", format_ns(metrics.max_ns() as f64));
    println!("    Std Dev:    {}", format_ns(metrics.std_dev_ns()));
    println!(
        "    Throughput: {}",
        format_throughput(size_bytes, metrics.mean_ns())
    );
    println!(
        "    Success:    {}/{}",
        metrics.success_count,
        metrics.success_count + metrics.error_count
    );
}

fn print_text_output(config: &Config, all_metrics: &[FileMetrics]) {
    println!("\n{}", "=".repeat(70));
    println!("SVELTE COMPILER PROFILER RESULTS");
    println!("{}", "=".repeat(70));
    println!("Mode: {:?}", config.mode);
    println!("Phase: {}", config.phase);
    println!(
        "Iterations: {} (+ {} warmup)",
        config.iterations, config.warmup
    );
    println!();

    for metrics in all_metrics {
        println!("{}", "-".repeat(70));
        println!("File: {} ({} bytes)", metrics.filename, metrics.size_bytes);
        println!("{}", "-".repeat(70));

        if config.phase == "all" || config.phase == "parse" {
            print_phase_metrics("Parse", &metrics.parse, metrics.size_bytes);
        }
        if config.phase == "all" || config.phase == "analyze" {
            print_phase_metrics("Analyze", &metrics.analyze, metrics.size_bytes);
        }
        if config.phase == "all" || config.phase == "transform" {
            print_phase_metrics("Transform", &metrics.transform, metrics.size_bytes);
        }
        if config.phase == "all" {
            print_phase_metrics("Total", &metrics.total, metrics.size_bytes);
        }
        println!();
    }

    // Summary
    if all_metrics.len() > 1 {
        println!("{}", "=".repeat(70));
        println!("SUMMARY");
        println!("{}", "=".repeat(70));

        let total_bytes: usize = all_metrics.iter().map(|m| m.size_bytes).sum();
        let total_time_ns: f64 = all_metrics.iter().map(|m| m.total.mean_ns()).sum();

        println!("Total files: {}", all_metrics.len());
        println!("Total size:  {} bytes", total_bytes);
        println!(
            "Total time:  {} (mean per iteration)",
            format_ns(total_time_ns)
        );
        println!(
            "Throughput:  {}",
            format_throughput(total_bytes, total_time_ns)
        );
    }
}

fn print_json_output(config: &Config, all_metrics: &[FileMetrics]) {
    let mut output = FxHashMap::default();
    output.insert("mode", format!("{:?}", config.mode));
    output.insert("phase", config.phase.clone());
    output.insert("iterations", config.iterations.to_string());

    let files: Vec<serde_json::Value> = all_metrics
        .iter()
        .map(|m| {
            serde_json::json!({
                "filename": m.filename,
                "size_bytes": m.size_bytes,
                "parse": {
                    "mean_ns": m.parse.mean_ns(),
                    "median_ns": m.parse.median_ns(),
                    "min_ns": m.parse.min_ns(),
                    "max_ns": m.parse.max_ns(),
                    "std_dev_ns": m.parse.std_dev_ns(),
                },
                "analyze": {
                    "mean_ns": m.analyze.mean_ns(),
                    "median_ns": m.analyze.median_ns(),
                    "min_ns": m.analyze.min_ns(),
                    "max_ns": m.analyze.max_ns(),
                    "std_dev_ns": m.analyze.std_dev_ns(),
                },
                "transform": {
                    "mean_ns": m.transform.mean_ns(),
                    "median_ns": m.transform.median_ns(),
                    "min_ns": m.transform.min_ns(),
                    "max_ns": m.transform.max_ns(),
                    "std_dev_ns": m.transform.std_dev_ns(),
                },
                "total": {
                    "mean_ns": m.total.mean_ns(),
                    "median_ns": m.total.median_ns(),
                    "min_ns": m.total.min_ns(),
                    "max_ns": m.total.max_ns(),
                    "std_dev_ns": m.total.std_dev_ns(),
                },
            })
        })
        .collect();

    let result = serde_json::json!({
        "config": {
            "mode": format!("{:?}", config.mode),
            "phase": config.phase,
            "iterations": config.iterations,
            "warmup": config.warmup,
        },
        "files": files,
    });

    println!("{}", serde_json::to_string_pretty(&result).unwrap());
}

fn main() {
    let config = parse_args();
    let files = load_files(&config);

    if files.is_empty() {
        eprintln!("No files to profile");
        std::process::exit(1);
    }

    eprintln!(
        "Profiling {} file(s) with {} iterations ({} warmup)...",
        files.len(),
        config.iterations,
        config.warmup
    );

    let mut all_metrics = Vec::new();

    for (filename, content) in &files {
        eprintln!("  Processing: {} ({} bytes)", filename, content.len());
        let metrics = profile_file(&config, filename, content);
        all_metrics.push(metrics);
    }

    match config.output.as_str() {
        "json" => print_json_output(&config, &all_metrics),
        _ => print_text_output(&config, &all_metrics),
    }
}
