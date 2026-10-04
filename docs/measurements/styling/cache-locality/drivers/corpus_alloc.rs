use rsvelte_kernel::performance::measurement::CountingAllocator;
#[global_allocator]
static ALLOCATOR: CountingAllocator = CountingAllocator;
use std::hint::black_box;
use std::io::{Read, Write};
use std::time::Instant;

use rsvelte_svelte::compilation::compiler_syntax_tree::{self, CompilerSyntaxTree};
use rsvelte_svelte::semantic::{analyze::{self, Analysis}, resolve::{self, Resolution}};
use rsvelte_svelte::syntax::syntax_tree::Component;
use rsvelte_svelte_compile::{OutputIdentity, stylesheet};

const WARMUP_ROUNDS: usize = 20;

struct Input {
    filename: String,
    source: String,
    expected: String,
}

struct Ready {
    component: Component,
    hir: Option<CompilerSyntaxTree>,
    resolution: Option<Resolution>,
    analysis: Option<Analysis>,
    identity: Option<OutputIdentity>,
}

fn parsed(input: &Input) -> Result<Component, Box<dyn std::error::Error>> {
    rsvelte_svelte::syntax::parse::parse(&input.source)
        .map_err(|error| format!("{}: {error:?}", input.filename).into())
}

fn resolved(component: &Component, hir: &CompilerSyntaxTree) -> Resolution {
    resolve::resolve_with_module(
        &component.javascript, component.program,
        component.module.as_ref().map(|script| script.program), hir,
    )
}

fn total(input: &Input, check: bool) -> Result<usize, Box<dyn std::error::Error>> {
    let component = parsed(input)?;
    let hir = compiler_syntax_tree::lower(&component, &input.source);
    let input_view = rsvelte_svelte::svelte_input(&component, &hir, &input.source, &input.filename);
    let resolution = resolved(&component, &hir);
    let analysis = analyze::analyze(&input_view, &resolution);
    let identity = OutputIdentity::build(&input_view);
    let css = stylesheet::scoped_stylesheet(&input_view, &analysis, &identity)
        .expect("every benchmark unit has CSS");
    if check && css != input.expected {
        return Err(format!("{}: CSS differs", input.filename).into());
    }
    let bytes = css.len();
    black_box(css);
    Ok(bytes)
}

fn prepare(input: &Input, phase: &str) -> Result<Ready, Box<dyn std::error::Error>> {
    let component = parsed(input)?;
    let mut ready = Ready {component, hir: None, resolution: None, analysis: None, identity: None};
    if phase == "hir" { return Ok(ready); }
    ready.hir = Some(compiler_syntax_tree::lower(&ready.component, &input.source));
    let hir = ready.hir.as_ref().expect("HIR was prepared");
    if phase == "resolve" || phase == "identity" { return Ok(ready); }
    ready.resolution = Some(resolved(&ready.component, hir));
    if phase == "analyze" { return Ok(ready); }
    let input_view = rsvelte_svelte::svelte_input(&ready.component, hir, &input.source, &input.filename);
    ready.analysis = Some(analyze::analyze(&input_view, ready.resolution.as_ref().expect("resolution was prepared")));
    ready.identity = Some(OutputIdentity::build(&input_view));
    Ok(ready)
}

fn run(inputs: &[Input], ready: &[Ready], phase: &str) -> Result<usize, Box<dyn std::error::Error>> {
    let mut checksum = 0;
    for (index, input) in inputs.iter().enumerate() {
        if phase == "total" {
            checksum += total(input, false)?;
            continue;
        }
        if phase == "parse" {
            black_box(parsed(input)?);
            checksum += 1;
            continue;
        }
        let ready = &ready[index];
        if phase == "hir" {
            black_box(compiler_syntax_tree::lower(&ready.component, &input.source));
            checksum += 1;
            continue;
        }
        let hir = ready.hir.as_ref().expect("HIR was prepared");
        if phase == "resolve" {
            black_box(resolved(&ready.component, hir));
            checksum += 1;
            continue;
        }
        let input_view = rsvelte_svelte::svelte_input(&ready.component, hir, &input.source, &input.filename);
        match phase {
            "analyze" => {black_box(analyze::analyze(&input_view, ready.resolution.as_ref().expect("resolution was prepared"))); checksum += 1;}
            "identity" => {black_box(OutputIdentity::build(&input_view)); checksum += 1;}
            "emit" => {
                let css = stylesheet::scoped_stylesheet(&input_view,
                    ready.analysis.as_ref().expect("analysis was prepared"),
                    ready.identity.as_ref().expect("identity was prepared"))
                    .expect("every benchmark unit has CSS");
                checksum += css.len(); black_box(css);
            }
            _ => unreachable!("the phase was validated"),
        }
    }
    Ok(checksum)
}

fn gate() -> std::io::Result<()> {
    writeln!(std::io::stdout().lock(), "RSVELTE_CYCLE_GATE")?;
    std::io::stdout().flush()?;
    std::io::stdin().read_exact(&mut [0])
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<_> = std::env::args().skip(1).collect();
    if args.len() != 3 { return Err("expected <manifest.tsv> <phase> <rounds>".into()); }
    let phase = &args[1];
    if !matches!(phase.as_str(), "total" | "parse" | "hir" | "resolve" | "analyze" | "identity" | "emit") {
        return Err("unknown phase".into());
    }
    let rounds: usize = args[2].parse()?;
    let mut inputs = Vec::new();
    for line in std::fs::read_to_string(&args[0])?.lines() {
        let fields: Vec<_> = line.split('\t').collect();
        if fields.len() != 3 { return Err("manifest rows need three fields".into()); }
        inputs.push(Input {filename: fields[0].to_owned(), source: std::fs::read_to_string(fields[1])?, expected: std::fs::read_to_string(fields[2])?});
    }
    if inputs.is_empty() { return Err("the population is empty".into()); }
    for input in &inputs { total(input, true)?; }
    let ready = if phase == "parse" || phase == "total" {Vec::new()} else {
        inputs.iter().map(|input| prepare(input, phase)).collect::<Result<Vec<_>, _>>()?
    };
    for _ in 0..WARMUP_ROUNDS { run(&inputs, &ready, phase)?; }
    rsvelte_kernel::performance::measurement::track_global(true);
    let start = Instant::now();
    let mut checksum = 0;
    for _ in 0..rounds {checksum += run(&inputs, &ready, phase)?;}
    let elapsed = start.elapsed();
    let allocation = rsvelte_kernel::performance::measurement::global();
    rsvelte_kernel::performance::measurement::track_global(false);
    writeln!(std::io::stderr().lock(), "allocations={} bytes={} peak_live_growth={}", allocation.allocations, allocation.bytes, allocation.peak_live_growth)?;
    writeln!(std::io::stdout().lock(), "{{\"documents\":{},\"rounds\":{},\"phase\":\"{}\",\"elapsed_ns\":{},\"checksum\":{}}}", inputs.len(), rounds, phase, elapsed.as_nanos(), checksum)?;
    Ok(())
}
