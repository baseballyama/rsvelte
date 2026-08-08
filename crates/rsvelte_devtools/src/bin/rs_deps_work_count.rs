//! Decomposes `extract_reactive_statement_deps`, whose `rs_deps` profile row is
//! ~half of the `reactive_stmt` stage, into the work its per-variable re-scan
//! actually performs.
//!
//! `scans / stmt` is the re-scan factor: the ceiling on what reading a retained
//! Phase-2 result instead can remove. `--runes-only` is the negative control —
//! the scan is reachable only from the legacy (non-runes) `$:` path, so a runes
//! corpus must report zero.
//!
//! ```text
//! cargo run --release -p rsvelte_devtools --bin rs_deps_work_count \
//!   --features measure-rs-deps
//! ```

#[cfg(feature = "measure-rs-deps")]
use std::fs;
#[cfg(feature = "measure-rs-deps")]
use std::path::{Path, PathBuf};

#[cfg(feature = "measure-rs-deps")]
use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[cfg(feature = "measure-rs-deps")]
fn collect(dir: &Path, files: &mut Vec<(String, String)>) {
    let Ok(entries) = fs::read_dir(dir) else {
        return;
    };
    let mut paths: Vec<PathBuf> = entries.flatten().map(|e| e.path()).collect();
    paths.sort();
    for path in paths {
        if path.is_dir() {
            if path.file_name().is_some_and(|n| n == "node_modules") {
                continue;
            }
            collect(&path, files);
        } else if path.extension().is_some_and(|e| e == "svelte")
            && let Ok(content) = fs::read_to_string(&path)
        {
            files.push((path.display().to_string(), content));
        }
    }
}

#[cfg(not(feature = "measure-rs-deps"))]
fn main() {
    eprintln!("build with --features measure-rs-deps");
    std::process::exit(2);
}

#[cfg(feature = "measure-rs-deps")]
fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let runes_only = args.iter().any(|a| a == "--runes-only");
    let roots: Vec<String> = args
        .iter()
        .filter(|a| !a.starts_with("--"))
        .cloned()
        .collect();
    let roots = if roots.is_empty() {
        vec![
            "submodules/smelte".to_string(),
            "submodules/carbon-components-svelte".to_string(),
            "submodules/open-webui".to_string(),
        ]
    } else {
        roots
    };

    let mut files = Vec::new();
    for root in &roots {
        collect(Path::new(root), &mut files);
    }

    // The negative control: `$:` is legacy-only, so a runes-only population must
    // drive the counter to zero. A non-zero here voids the main measurement.
    let mut kept = 0usize;
    rsvelte_core::measure_rs_deps::reset();
    for (_name, src) in &files {
        let is_runes = src.contains("$state") || src.contains("$derived") || src.contains("$props");
        if runes_only != is_runes {
            continue;
        }
        kept += 1;
        let opts = CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        };
        let _ = compile(src, opts);
    }

    let (
        stmts,
        ref_scans,
        assign_scans,
        prefilter_miss,
        format_allocs,
        vars,
        max_vars,
        body,
        scanned,
    ) = rsvelte_core::measure_rs_deps::snapshot();

    let scans = ref_scans + assign_scans;
    println!("roots            {}", roots.join(", "));
    println!(
        "mode             {}",
        if runes_only {
            "runes-only (negative control)"
        } else {
            "legacy"
        }
    );
    println!("files scanned    {} (of {} found)", kept, files.len());
    println!("---");
    println!("stmts            {stmts}");
    println!("ref_scans        {ref_scans}");
    println!("assign_scans     {assign_scans}");
    println!("scans            {scans}");
    if stmts > 0 {
        println!("scans / stmt     {:.1}", scans as f64 / stmts as f64);
        println!("vars / stmt      {:.1}", vars as f64 / stmts as f64);
        println!("max vars         {max_vars}");
        println!("body bytes/stmt  {:.0}", body as f64 / stmts as f64);
    }
    println!("---");
    println!(
        "prefilter_miss   {prefilter_miss} ({:.1}% of assign_scans)",
        if assign_scans > 0 {
            prefilter_miss as f64 * 100.0 / assign_scans as f64
        } else {
            0.0
        }
    );
    println!("format_allocs    {format_allocs}");
    println!("scanned bytes    {scanned}");
    println!("body bytes       {body}");
    if body > 0 {
        println!("rescan factor    {:.1}x", scanned as f64 / body as f64);
    }
}
