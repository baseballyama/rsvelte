//! Count how many OXC calls happen during parsing and measure their cost.

// Use jemalloc as the global allocator for better multi-threaded
// performance. Defined per-bin rather than once in the lib because the lib
// is built as both rlib and cdylib, and a lib-level `#[global_allocator]`
// is duplicated across both outputs at link time — cargo issue
// rust-lang/cargo#6313.
#[cfg(all(
    feature = "jemalloc",
    not(feature = "napi"),
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: tikv_jemallocator::Jemalloc = tikv_jemallocator::Jemalloc;

use std::fs;
use std::path::PathBuf;
use std::time::Instant;

fn main() {
    let files = collect_files();
    let total_bytes: usize = files.iter().map(|(_, c)| c.len()).sum();
    println!("Files: {}, Total: {} bytes\n", files.len(), total_bytes);

    // Count expressions by scanning for { in template context
    let mut total_template_exprs = 0u64;
    let mut scripts_count = 0u64;

    for (_, content) in &files {
        if content.contains("<script") {
            scripts_count += 1;
        }
        // Count template expressions (outside script blocks)
        let stripped = strip_scripts(content);
        let bytes = stripped.as_bytes();
        let mut i = 0;
        while i < bytes.len() {
            if bytes[i] == b'{' && i + 1 < bytes.len() {
                let next = bytes[i + 1];
                if next != b'#' && next != b'/' && next != b':' && next != b'@' {
                    total_template_exprs += 1;
                    // Skip to closing }
                    let mut depth = 1u32;
                    i += 1;
                    while i < bytes.len() && depth > 0 {
                        match bytes[i] {
                            b'{' => depth += 1,
                            b'}' => depth -= 1,
                            _ => {}
                        }
                        i += 1;
                    }
                    continue;
                }
            }
            i += 1;
        }
    }

    println!("Files with <script>: {}", scripts_count);
    println!("Template expressions: {}", total_template_exprs);
    println!(
        "Avg expressions/file: {:.1}",
        total_template_exprs as f64 / files.len() as f64
    );
    println!();

    // Now measure parse time breakdown
    use svelte_compiler_rust::compiler::phases::phase1_parse::{ParseOptions, parse};

    // Warmup
    for _ in 0..3 {
        for (_, content) in &files {
            let _ = parse(
                content,
                ParseOptions {
                    modern: true,
                    skip_expression_loc: true,
                    ..Default::default()
                },
            );
        }
    }

    // Measure per-expression cost by comparing files with different expression counts
    let files_no_expr: Vec<_> = files
        .iter()
        .filter(|(_, c)| !strip_scripts(c).contains('{'))
        .collect();
    let files_many_expr: Vec<_> = files
        .iter()
        .filter(|(_, c)| {
            let s = strip_scripts(c);
            s.matches('{').count() > 5
        })
        .collect();

    let bench_subset = |files: &[&(String, String)], label: &str| {
        if files.is_empty() {
            return 0.0;
        }
        let bytes: usize = files.iter().map(|(_, c)| c.len()).sum();
        let mut times = Vec::with_capacity(10);
        for _ in 0..10 {
            let start = Instant::now();
            for (_, content) in files {
                let _ = parse(
                    content,
                    ParseOptions {
                        modern: true,
                        skip_expression_loc: true,
                        ..Default::default()
                    },
                );
            }
            times.push(start.elapsed().as_secs_f64() * 1000.0);
        }
        times.sort_by(|a, b| a.partial_cmp(b).unwrap());
        let median = times[times.len() / 2];
        let per_file = median / files.len() as f64 * 1000.0;
        println!(
            "{:30} {} files, {:.2}ms total, {:.2}µs/file, {:.1} MB/s",
            label,
            files.len(),
            median,
            per_file,
            bytes as f64 / (median / 1000.0) / 1_000_000.0
        );
        median
    };

    bench_subset(&files.iter().collect::<Vec<_>>(), "All files");
    bench_subset(&files_no_expr, "No template expressions");
    bench_subset(&files_many_expr, "Many expressions (>5)");
}

fn strip_scripts(source: &str) -> String {
    let mut result = String::with_capacity(source.len());
    let mut i = 0;
    let bytes = source.as_bytes();
    while i < bytes.len() {
        if i + 7 < bytes.len()
            && &bytes[i..i + 7] == b"<script"
            && let Some(end) = source[i..].find("</script>")
        {
            i += end + 9;
            continue;
        }
        if i < bytes.len() {
            result.push(bytes[i] as char);
        }
        i += 1;
    }
    result
}

fn collect_files() -> Vec<(String, String)> {
    let base = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let test_dir = base.join("submodules/svelte/packages/svelte/tests");
    let categories = [
        "parser-modern/samples",
        "snapshot/samples",
        "css/samples",
        "runtime-runes/samples",
        "runtime-legacy/samples",
        "runtime-browser/samples",
        "hydration/samples",
        "server-side-rendering/samples",
        "validator/samples",
    ];
    let mut files = Vec::new();
    for cat in &categories {
        let dir = test_dir.join(cat);
        if !dir.exists() {
            continue;
        }
        collect_svelte_files(&dir, &mut files);
    }
    files
}

fn collect_svelte_files(dir: &std::path::Path, files: &mut Vec<(String, String)>) {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                collect_svelte_files(&path, files);
            } else if path.extension().is_some_and(|e| e == "svelte")
                && let Ok(content) = fs::read_to_string(&path)
            {
                files.push((path.display().to_string(), content));
            }
        }
    }
}
