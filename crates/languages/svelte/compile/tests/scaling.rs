use rsvelte_kernel::performance::measurement::{CountingAllocator, thread_allocations};
use rsvelte_svelte_compile::{CompileInput, Target};

#[global_allocator]
static ALLOCATOR: CountingAllocator = CountingAllocator;

/// Allocations on this thread to parse, analyze and compile `script` for the client.
fn allocations(script: &str) -> u64 {
    let source = format!("<script>{script}</script>");
    let (before, _) = thread_allocations();
    let component = rsvelte_svelte::syntax::parse::parse(&source).expect("parses");
    let tree = rsvelte_svelte::compilation::compiler_syntax_tree::lower(&component, &source);
    let input = CompileInput::from(rsvelte_svelte::svelte_input(
        &component,
        &tree,
        &source,
        "App.svelte",
    ));
    let resolution = rsvelte_svelte::semantic::resolve::resolve(
        &component.javascript,
        &source,
        component.program,
        &tree,
    );
    let analysis = rsvelte_svelte::semantic::analyze::analyze(&input.component, &resolution);
    rsvelte_svelte_compile::compile(&input, &resolution, &analysis, Target::Client)
        .expect("compiles");
    thread_allocations().0 - before
}

#[test]
fn a_member_chain_in_markup_analyzes_on_a_small_stack() {
    let source = format!("<script>let a = {{}};</script>{{a{}}}", ".b".repeat(20_000));
    let component = rsvelte_svelte::syntax::parse::parse(&source).expect("parses");
    let tree = rsvelte_svelte::compilation::compiler_syntax_tree::lower(&component, &source);
    let input = rsvelte_svelte::svelte_input(&component, &tree, &source, "App.svelte");
    let resolution = std::thread::scope(|scope| {
        std::thread::Builder::new()
            .stack_size(1 << 30)
            .spawn_scoped(scope, || {
                rsvelte_svelte::semantic::resolve::resolve(
                    &component.javascript,
                    &source,
                    component.program,
                    &tree,
                )
            })
            .expect("spawns")
            .join()
            .expect("resolves on a large stack")
    });
    std::thread::scope(|scope| {
        std::thread::Builder::new()
            .stack_size(1 << 20)
            .spawn_scoped(scope, || {
                let _analysis = rsvelte_svelte::semantic::analyze::analyze(&input, &resolution);
            })
            .expect("spawns")
            .join()
            .expect("analyzes within a 1 MiB stack");
    });
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
