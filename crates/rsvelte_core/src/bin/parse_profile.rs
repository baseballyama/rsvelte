//! Targeted parser profiler - measures where parse time is spent.
//!
//! Usage: cargo run --release --bin parse_profile

// Use mimalloc as the global allocator (A/B-measured faster than jemalloc;
// performance. Defined per-bin rather than once in the lib because the lib
// is built as both rlib and cdylib, and a lib-level `#[global_allocator]`
// is duplicated across both outputs at link time — cargo issue
// rust-lang/cargo#6313.
use std::fmt::Write as _;
#[cfg(all(
    feature = "mimalloc-alloc",
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

use std::fs;
use std::path::PathBuf;
use std::time::Instant;

use rsvelte_core::compiler::phases::phase1_parse::{ParseOptions, parse};

fn main() {
    let large = create_large_file();
    let medium = create_medium_file();
    let small_expr = create_expression_heavy_file();

    let files = [
        ("large (38KB)", &large),
        ("medium (1.7KB)", &medium),
        ("expr-heavy", &small_expr),
    ];

    let warmup = 20;
    let iterations = 100;

    // Template-only benchmarks (no script, no style, minimal OXC calls)
    println!("=== Template-only benchmarks (no OXC) ===");
    let template_only_files = [
        ("plain-html", create_plain_html_file()),
        ("html-attrs", create_html_with_attributes()),
        ("deep-nesting", create_deeply_nested()),
        ("many-text", create_many_text_nodes()),
        ("simple-exprs", create_simple_expr_file()),
    ];

    let tpl_warmup = 100;
    let tpl_iterations = 500;
    for (name, content) in &template_only_files {
        for _ in 0..tpl_warmup {
            let _ = parse(
                content,
                ParseOptions {
                    modern: true,
                    skip_expression_loc: true,
                    defer_script_parse: true,
                    ..Default::default()
                },
            );
        }
        let mut times = Vec::with_capacity(tpl_iterations);
        for _ in 0..tpl_iterations {
            let start = Instant::now();
            let _ = parse(
                content,
                ParseOptions {
                    modern: true,
                    skip_expression_loc: true,
                    defer_script_parse: true,
                    ..Default::default()
                },
            );
            times.push(start.elapsed().as_nanos() as u64);
        }
        times.sort();
        let median = times[tpl_iterations / 2];
        let min = times[0];
        let throughput = content.len() as f64 / (median as f64 / 1_000_000_000.0) / 1_000_000.0;
        println!(
            "  {}: median={:.2}µs min={:.2}µs ({} bytes, {:.1} MB/s)",
            name,
            median as f64 / 1000.0,
            min as f64 / 1000.0,
            content.len(),
            throughput
        );
    }
    println!();

    // Also benchmark real Svelte test files
    let real_files = collect_real_files();
    if !real_files.is_empty() {
        let total_bytes: usize = real_files.iter().map(|(_, c)| c.len()).sum();
        println!(
            "=== Real Svelte test files ({} files, {} bytes total) ===",
            real_files.len(),
            total_bytes
        );

        // Separate files by whether they have <script> tags
        let files_with_script: Vec<_> = real_files
            .iter()
            .filter(|(_, c)| c.contains("<script"))
            .collect();
        let files_without_script: Vec<_> = real_files
            .iter()
            .filter(|(_, c)| !c.contains("<script"))
            .collect();

        // Warmup
        for _ in 0..5 {
            for (_, content) in &real_files {
                let _ = parse(
                    content,
                    ParseOptions {
                        modern: true,
                        skip_expression_loc: true,
                        defer_script_parse: true,
                        ..Default::default()
                    },
                );
            }
        }

        // Measure total time for all files
        let mut total_times = Vec::with_capacity(30);
        for _ in 0..30 {
            let start = Instant::now();
            for (_, content) in &real_files {
                let _ = parse(
                    content,
                    ParseOptions {
                        modern: true,
                        skip_expression_loc: true,
                        defer_script_parse: true,
                        ..Default::default()
                    },
                );
            }
            total_times.push(start.elapsed().as_nanos() as u64);
        }
        total_times.sort();
        let median = total_times[total_times.len() / 2];
        let throughput = total_bytes as f64 / (median as f64 / 1_000_000_000.0) / 1_000_000.0;
        println!(
            "All files: median={:.2}ms throughput={:.1} MB/s",
            median as f64 / 1_000_000.0,
            throughput
        );

        // Measure files with script vs without
        let measure_subset = |files: &[&(String, String)], label: &str| {
            if files.is_empty() {
                return;
            }
            let bytes: usize = files.iter().map(|(_, c)| c.len()).sum();
            let mut times = Vec::with_capacity(20);
            for _ in 0..20 {
                let start = Instant::now();
                for (_, content) in files {
                    let _ = parse(
                        content,
                        ParseOptions {
                            modern: true,
                            skip_expression_loc: true,
                            defer_script_parse: true,
                            ..Default::default()
                        },
                    );
                }
                times.push(start.elapsed().as_nanos() as u64);
            }
            times.sort();
            let median = times[times.len() / 2];
            let throughput = bytes as f64 / (median as f64 / 1_000_000_000.0) / 1_000_000.0;
            println!(
                "  {}: {} files, {} bytes, median={:.2}ms, {:.1} MB/s",
                label,
                files.len(),
                bytes,
                median as f64 / 1_000_000.0,
                throughput
            );
        };

        measure_subset(&files_with_script, "with <script>");
        measure_subset(&files_without_script, "without <script>");
        println!();
    }

    for (name, content) in &files {
        // Warmup
        for _ in 0..warmup {
            let _ = parse(
                content,
                ParseOptions {
                    modern: true,
                    skip_expression_loc: true,
                    defer_script_parse: true,
                    ..Default::default()
                },
            );
        }

        // Measure
        let mut times = Vec::with_capacity(iterations);
        for _ in 0..iterations {
            let start = Instant::now();
            let _ = parse(
                content,
                ParseOptions {
                    modern: true,
                    skip_expression_loc: true,
                    defer_script_parse: true,
                    ..Default::default()
                },
            );
            times.push(start.elapsed().as_nanos() as u64);
        }

        times.sort();
        let median = times[iterations / 2];
        let min = times[0];
        let p95 = times[(iterations as f64 * 0.95) as usize];
        let mean: u64 = times.iter().sum::<u64>() / iterations as u64;

        println!(
            "{}: median={:.2}µs min={:.2}µs mean={:.2}µs p95={:.2}µs ({} bytes)",
            name,
            median as f64 / 1000.0,
            min as f64 / 1000.0,
            mean as f64 / 1000.0,
            p95 as f64 / 1000.0,
            content.len(),
        );
    }

    // Now measure with skip_expression_loc=false to see loc overhead
    println!("\n--- With loc computation enabled ---");
    for (name, content) in &files {
        for _ in 0..warmup {
            let _ = parse(
                content,
                ParseOptions {
                    modern: true,
                    skip_expression_loc: false,
                    defer_script_parse: true,
                    ..Default::default()
                },
            );
        }
        let mut times = Vec::with_capacity(iterations);
        for _ in 0..iterations {
            let start = Instant::now();
            let _ = parse(
                content,
                ParseOptions {
                    modern: true,
                    skip_expression_loc: false,
                    defer_script_parse: true,
                    ..Default::default()
                },
            );
            times.push(start.elapsed().as_nanos() as u64);
        }
        times.sort();
        let median = times[iterations / 2];
        println!(
            "{}: median={:.2}µs ({} bytes)",
            name,
            median as f64 / 1000.0,
            content.len()
        );
    }
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

    for i in 0..50 {
        let _ = write!(
            s,
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
        );
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

fn create_medium_file() -> String {
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
        {#each items as item}
            {#if count > item}
                <li class="active">Item {item}</li>
            {:else}
                <li>Item {item}</li>
            {/if}
        {/each}
    </ul>
</div>

<style>
    .container { padding: 1rem; }
    .active { font-weight: bold; }
</style>"#
        .to_string()
}

fn create_expression_heavy_file() -> String {
    let mut s = String::from("<script>\n    let x = $state(0);\n</script>\n\n");
    // Many expressions of varying complexity
    for i in 0..100 {
        let _ = writeln!(s, "<p>{{x + {i}}}</p>");
    }
    for i in 0..50 {
        let _ = writeln!(s, "<p>{{x > {i} ? 'yes' : 'no'}}</p>");
    }
    for _ in 0..50 {
        s.push_str("<p>{x}</p>\n");
    }
    s
}

fn create_plain_html_file() -> String {
    let mut s = String::new();
    for i in 0..200 {
        let _ = writeln!(s, r#"<div class="item-{i}"><span>text {i}</span></div>"#);
    }
    s
}

fn create_html_with_attributes() -> String {
    let mut s = String::new();
    for i in 0..100 {
        let _ = write!(
            s,
            r#"<div id="el-{i}" class="foo bar baz" data-index="{i}" data-active="true" role="listitem" aria-label="Item {i}">
    <input type="text" name="field-{i}" placeholder="Enter..." />
</div>
"#
        );
    }
    s
}

fn create_deeply_nested() -> String {
    let mut s = String::new();
    for _ in 0..50 {
        s.push_str("<div><ul><li><span><a href=\"#\">");
    }
    s.push_str("content");
    for _ in 0..50 {
        s.push_str("</a></span></li></ul></div>");
    }
    s
}

fn create_many_text_nodes() -> String {
    let mut s = String::new();
    for i in 0..500 {
        let _ = writeln!(
            s,
            "<p>This is paragraph number {i} with some text content that is reasonably long.</p>"
        );
    }
    s
}

fn create_simple_expr_file() -> String {
    // Only simple expressions (identifiers, member expressions) - all fast path
    let mut s = String::new();
    for _ in 0..200 {
        s.push_str("<p>{name}</p>\n<p>{item.title}</p>\n<p>{data.nested.value}</p>\n");
    }
    s
}

fn collect_real_files() -> Vec<(String, String)> {
    let base = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let dirs = [
        "submodules/svelte/packages/svelte/tests/runtime-runes/samples",
        "submodules/svelte/packages/svelte/tests/runtime-legacy/samples",
    ];

    let mut files = Vec::new();
    for dir in &dirs {
        let path = base.join(dir);
        if !path.exists() {
            continue;
        }
        for entry in fs::read_dir(&path).unwrap().flatten() {
            let input = entry.path().join("input.svelte");
            if let Ok(content) = fs::read_to_string(&input) {
                files.push((entry.file_name().to_string_lossy().to_string(), content));
            }
            // Also check _x.svelte files (component imports)
            for sub_entry in fs::read_dir(entry.path()).into_iter().flatten().flatten() {
                let sub_path = sub_entry.path();
                if sub_path.extension().is_some_and(|e| e == "svelte")
                    && sub_path != entry.path().join("input.svelte")
                    && let Ok(content) = fs::read_to_string(&sub_path)
                {
                    files.push((sub_path.display().to_string(), content));
                }
            }
        }
    }
    files
}
