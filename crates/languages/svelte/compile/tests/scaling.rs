use rsvelte_kernel::performance::measurement::{CountingAllocator, thread_allocations};
use rsvelte_svelte_compile::{CompileInput, Target};

#[global_allocator]
static ALLOCATOR: CountingAllocator = CountingAllocator;

/// Allocations on this thread to parse, analyze and compile `script` for the client.
fn allocations(script: &str) -> u64 {
    let source = format!("<script>{script}</script>");
    let (before, _) = thread_allocations();
    let component = rsvelte_svelte_syntax::parse::parse(&source).expect("parses");
    let tree = rsvelte_svelte_semantic::compiler_syntax_tree::lower(&component, &source);
    let input = CompileInput::from(rsvelte_svelte_semantic::svelte_input(
        &component,
        &tree,
        &source,
        "App.svelte",
    ));
    let resolution = rsvelte_svelte_semantic::resolve::resolve(
        &component.javascript,
        component.instance.as_ref().map(|s| s.program),
        component.module.as_ref().map(|s| s.program),
        &tree,
    );
    let analysis = rsvelte_svelte_semantic::analyze::analyze(&input.component, &resolution);
    rsvelte_svelte_compile::compile_input(&input, &resolution, &analysis, Target::Client)
        .expect("compiles");
    thread_allocations().0 - before
}

/// Parses, analyzes and, for [`Stage::Compile`], compiles `source` on a worker's 2 MiB stack.
/// The analysis is not `Send`, so every stage runs on that one stack.
fn on_a_small_stack(source: &str, stage: Stage) {
    let source = source.to_owned();
    std::thread::Builder::new()
        .stack_size(2 << 20)
        .spawn(move || {
            let component = rsvelte_svelte_syntax::parse::parse(&source).expect("parses");
            let tree = rsvelte_svelte_semantic::compiler_syntax_tree::lower(&component, &source);
            let input = CompileInput::from(rsvelte_svelte_semantic::svelte_input(
                &component,
                &tree,
                &source,
                "App.svelte",
            ));
            let resolution = rsvelte_svelte_semantic::resolve::resolve(
                &component.javascript,
                component.instance.as_ref().map(|s| s.program),
                component.module.as_ref().map(|s| s.program),
                &tree,
            );
            let analysis = rsvelte_svelte_semantic::analyze::analyze(&input.component, &resolution);
            if stage == Stage::Compile {
                rsvelte_svelte_compile::compile_input(
                    &input,
                    &resolution,
                    &analysis,
                    Target::Client,
                )
                .expect("compiles");
            }
        })
        .expect("spawns")
        .join()
        .expect("runs within a 2 MiB stack");
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Stage {
    Analyze,
    Compile,
}

const LINKS: usize = 20_000;

#[test]
fn long_chains_analyze_on_a_small_stack() {
    for chain in [
        format!("a{}", ".b".repeat(LINKS)),
        format!("f{}", "()".repeat(LINKS)),
        format!("a{}", " + a".repeat(LINKS)),
    ] {
        on_a_small_stack(
            &format!("<script>let a = {{}};</script>{{{chain}}}"),
            Stage::Analyze,
        );
        on_a_small_stack(&format!("<script>{chain};</script>"), Stage::Analyze);
    }
}

#[test]
fn a_call_chain_in_markup_is_judged_pure_once_per_link() {
    // Purity does not allocate, so this bounds time: linear takes about a second even
    // unoptimized, while judging every link per enclosing call takes minutes.
    const BUDGET: std::time::Duration = std::time::Duration::from_secs(30);
    let source = format!(
        "<script>let f = () => f;</script>{{f{}}}",
        "()".repeat(100_000)
    );
    let elapsed = std::thread::scope(|scope| {
        std::thread::Builder::new()
            .stack_size(1 << 30)
            .spawn_scoped(scope, || {
                let component = rsvelte_svelte_syntax::parse::parse(&source).expect("parses");
                let tree =
                    rsvelte_svelte_semantic::compiler_syntax_tree::lower(&component, &source);
                let input =
                    rsvelte_svelte_semantic::svelte_input(&component, &tree, &source, "App.svelte");
                let resolution = rsvelte_svelte_semantic::resolve::resolve(
                    &component.javascript,
                    component.instance.as_ref().map(|s| s.program),
                    component.module.as_ref().map(|s| s.program),
                    &tree,
                );
                let start = std::time::Instant::now();
                let _analysis = rsvelte_svelte_semantic::analyze::analyze(&input, &resolution);
                start.elapsed()
            })
            .expect("spawns")
            .join()
            .expect("analyzes")
    });
    assert!(elapsed < BUDGET, "analysis took {elapsed:?}");
}

#[test]
fn long_chains_compile_on_a_small_stack() {
    for chain in [
        format!("a{}", ".b".repeat(LINKS)),
        format!("f{}", "()".repeat(LINKS)),
        format!("a{}", " + a".repeat(LINKS)),
    ] {
        on_a_small_stack(&format!("<script>{chain};</script>"), Stage::Compile);
    }
}

#[test]
fn a_call_chain_compiles_in_allocations_linear_in_its_length() {
    // Allocation counts are deterministic; a quadratic pass makes the doubled input cost ~4x.
    let chain = |n: usize| format!("f{};", "()".repeat(n));
    // Unoptimized builds recurse with large frames; the chain's depth is not what is measured.
    let (short, long) = std::thread::Builder::new()
        .stack_size(256 << 20)
        .spawn(move || (allocations(&chain(1000)), allocations(&chain(2000))))
        .expect("spawns")
        .join()
        .expect("compiles");
    assert!(long < 3 * short, "{short} allocations, then {long}");
}
