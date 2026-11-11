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

/// Parses, analyzes and, for [`Stage::Compile`], compiles `source` on a worker's 2 MiB stack,
/// inside the room the pipeline gives a document of its length. The analysis is not `Send`, so
/// every stage runs there.
fn on_a_small_stack(source: &str, stage: Stage) {
    let source = source.to_owned();
    std::thread::Builder::new()
        .stack_size(2 << 20)
        .spawn(move || {
            rsvelte_kernel::performance::stack::for_text(source.len(), || stages(&source, stage));
        })
        .expect("spawns")
        .join()
        .expect("runs within the stack the pipeline gives it");
}

fn stages(source: &str, stage: Stage) {
    let component = rsvelte_svelte_syntax::parse::parse(source).expect("parses");
    let tree = rsvelte_svelte_semantic::compiler_syntax_tree::lower(&component, source);
    let input = CompileInput::from(rsvelte_svelte_semantic::svelte_input(
        &component,
        &tree,
        source,
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
        rsvelte_svelte_compile::compile_input(&input, &resolution, &analysis, Target::Client)
            .expect("compiles");
    }
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

/// Twice as deep as what a 2 MiB stack alone fits: it passes only through the pipeline's room.
#[test]
fn a_deeper_chain_analyzes_in_the_room_its_length_gives() {
    let chain = format!("a{}", ".b".repeat(2 * LINKS));
    on_a_small_stack(&format!("<script>{chain};</script>"), Stage::Analyze);
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

/// CPU time this thread has spent, which a busy machine does not inflate as it does wall-clock
/// time.
#[cfg(unix)]
fn thread_time() -> std::time::Duration {
    let mut now = libc::timespec {
        tv_sec: 0,
        tv_nsec: 0,
    };
    #[expect(unsafe_code, reason = "reads this thread's clock into a local")]
    // SAFETY: `now` is a valid, writable timespec, and the clock id is a constant.
    let status = unsafe { libc::clock_gettime(libc::CLOCK_THREAD_CPUTIME_ID, &raw mut now) };
    assert_eq!(status, 0, "the thread's CPU clock is readable");
    std::time::Duration::new(
        u64::try_from(now.tv_sec).expect("a non-negative time"),
        u32::try_from(now.tv_nsec).expect("nanoseconds under a second"),
    )
}

#[cfg(unix)]
#[test]
fn a_components_snippets_compile_in_time_linear_in_their_number() {
    // Checking each of a component's snippets against all its attributes and children is
    // quadratic: four times the snippets cost about sixteen times as much, and linear work four.
    let markup = |n: usize| {
        let attributes: Vec<String> = (0..n).map(|i| format!(" a{i}={{x}}")).collect();
        let snippets: Vec<String> = (0..n)
            .map(|i| format!("{{#snippet s{i}()}}<p>{{x}}</p>{{/snippet}}"))
            .collect();
        let (attributes, snippets) = (attributes.concat(), snippets.concat());
        format!(
            "<script>import C from './C.svelte'; let x = $state(0);</script><C{attributes}>{snippets}</C>"
        )
    };
    let (short, long) = (markup(1500), markup(6000));
    // Only the compile is timed: the parser's own growth is not the compiler's.
    let time = |source: &str| {
        let component = rsvelte_svelte_syntax::parse::parse(source).expect("parses");
        let tree = rsvelte_svelte_semantic::compiler_syntax_tree::lower(&component, source);
        let input = CompileInput::from(rsvelte_svelte_semantic::svelte_input(
            &component,
            &tree,
            source,
            "App.svelte",
        ));
        let resolution = rsvelte_svelte_semantic::resolve::resolve(
            &component.javascript,
            component.instance.as_ref().map(|s| s.program),
            component.module.as_ref().map(|s| s.program),
            &tree,
        );
        let analysis = rsvelte_svelte_semantic::analyze::analyze(&input.component, &resolution);
        let start = thread_time();
        rsvelte_svelte_compile::compile_input(&input, &resolution, &analysis, Target::Client)
            .expect("compiles");
        thread_time().saturating_sub(start)
    };
    // Alternating the sizes lets both meet the same machine.
    let (mut short_time, mut long_time) = (std::time::Duration::MAX, std::time::Duration::MAX);
    for _ in 0..3 {
        short_time = short_time.min(time(&short));
        long_time = long_time.min(time(&long));
    }
    assert!(
        long_time < 8 * short_time,
        "1500 snippets took {short_time:?}, 6000 took {long_time:?}"
    );
}
