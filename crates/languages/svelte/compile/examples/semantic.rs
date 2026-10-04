#![expect(clippy::print_stdout, reason = "reports benchmark measurements")]

use std::hint::black_box;
use std::time::Instant;

use rsvelte_kernel::performance::measurement::{CountingAllocator, thread_allocations};
use rsvelte_svelte::compilation::compiler_syntax_tree::{CompilerSyntaxTree, lower};
use rsvelte_svelte::semantic::evaluate::Tree;
use rsvelte_svelte::semantic::input::ComponentInput;
use rsvelte_svelte::semantic::{analyze, resolve};
use rsvelte_svelte::syntax::syntax_tree::Component;

#[global_allocator]
static ALLOCATOR: CountingAllocator = CountingAllocator;

struct Case {
    source: String,
    component: Component,
    tree: CompilerSyntaxTree,
    resolution: resolve::Resolution,
}

impl Case {
    fn input(&self) -> ComponentInput<'_> {
        ComponentInput {
            javascript: &self.component.javascript,
            program: self.component.program,
            module: self.component.module.as_ref().map(|module| module.program),
            compiler_syntax_tree: &self.tree,
            style: self.component.style.as_ref().map(|style| &style.sheet),
            template_expressions: &self.component.template_expressions,
            source_text: &self.source,
            filename: "benchmark.svelte",
        }
    }
}

fn sources() -> Vec<String> {
    let alternatives = (0..48).rev().fold("'last'".to_owned(), |rest, index| {
        format!("flag ? 'value{index}' : {rest}")
    });
    let globals = "{Math.max(n, Math.floor(3.5))}{Number.isFinite(n)}{Math.PI}".repeat(128);
    let state_reads = "<p>{n + 1}</p>".repeat(512);
    let branches = concat!(
        "<section>{#if flag}<p/>{:else}<p/>{/if}",
        "{#each items as item}<p>{item}</p>{/each}<p/></section>"
    )
    .repeat(32);
    let classes = "<p class='a'/><p class='b'/><p/>".repeat(128);
    let attribute_values = "<p class={flag ? 'one' : 'two'} data-label={'static'}/>".repeat(128);
    let interpolated_values = concat!(
        r#"<p class="pre-{flag ? 'one' : 'two'}" data-state={true}/>"#,
        "<p class={['one', {two: flag}, flag && 'three']}/>"
    )
    .repeat(64);
    let compound_classes = "<p class='common'/>".repeat(512);
    vec![
        "<script>let n = $state(1); let twice = $derived(n * 2);</script><p>{twice}</p>".into(),
        format!("<script>const n = 2;</script>{globals}"),
        format!("<script>let n = $state(0); n++;</script>{state_reads}"),
        format!(
            "{branches}<style>section > p + p, section:has(> p), p ~ p {{ color:red }}</style>"
        ),
        format!("{classes}<style>.a{{color:red}}.b{{color:blue}}.missing{{color:green}}</style>"),
        concat!(
            "{#snippet recurse(n)}<p>{@render recurse(n - 1)}</p>{/snippet}",
            "<div>{@render recurse(2)}</div><style>div p, p > p {color:red}</style>"
        )
        .into(),
        format!("{{{alternatives}}}"),
        format!(
            "{attribute_values}{}",
            concat!(
                "<style>.one{color:red}.two{color:blue}",
                "[data-label='static']{color:green}[data-label='missing']{color:red}</style>"
            )
        ),
        format!(
            "{interpolated_values}{}",
            concat!(
                "<style>.pre-one{color:red}.pre-two{color:blue}",
                ".one{color:red}.two{color:blue}.three{color:green}",
                "[data-state='true']{color:red}</style>"
            )
        ),
        format!(
            "{compound_classes}{}",
            concat!(
                "<p class='common rare'/><style>",
                ".common.rare{color:red}.common.missing{color:blue}</style>"
            )
        ),
    ]
}

fn run(case: &Case, mode: &str) {
    match mode {
        "resolve" => {
            black_box(resolve::resolve_with_module(
                &case.component.javascript,
                case.component.program,
                case.component.module.as_ref().map(|module| module.program),
                &case.tree,
            ));
        }
        "analyze" | "analyze-compound" => {
            black_box(analyze::analyze(&case.input(), &case.resolution));
        }
        "evaluate" => {
            let mut evaluator = rsvelte_svelte::semantic::evaluate::Evaluator::new(
                &case.component.javascript,
                &case.source,
                &case.resolution,
            );
            for &expression in &case.component.template_expressions {
                black_box(evaluator.evaluate(Tree::Source, expression));
            }
        }
        _ => unreachable!("the mode is validated before measurement"),
    }
}

fn dump(list: &str) -> Result<(), Box<dyn std::error::Error>> {
    let paths = std::fs::read_to_string(list)?;
    for path in paths.lines() {
        let source = std::fs::read_to_string(path)?;
        let component = match rsvelte_svelte::syntax::parse::parse(&source) {
            Ok(component) => component,
            Err(error) => {
                println!("{path}\tUNPARSED\t{error:?}");
                continue;
            }
        };
        let tree = lower(&component, &source);
        let resolution = resolve::resolve_with_module(
            &component.javascript,
            component.program,
            component.module.as_ref().map(|module| module.program),
            &tree,
        );
        let case = Case {
            source,
            component,
            tree,
            resolution,
        };
        let analysis = analyze::analyze(&case.input(), &case.resolution);
        let mut expressions: Vec<_> = analysis.expressions.iter().collect();
        expressions.sort_unstable_by_key(|&(id, _)| id);
        println!("{path}\tRESOLVED\t{:?}", case.resolution);
        println!("EXPRESSIONS\t{expressions:?}");
        println!(
            "ANALYSIS\t{:?}",
            (
                analysis.needs_context,
                analysis.root_dynamic,
                analysis.scoped.raw(),
                analysis.dynamic.raw(),
                analysis.stylesheet_used,
                analysis.stylesheet_scoped
            )
        );
        for &expression in &case.component.template_expressions {
            println!(
                "EVALUATION\t{expression:?}\t{:?}",
                case.resolution
                    .evaluate(&case.component.javascript, &case.source, expression)
            );
        }
    }
    Ok(())
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    if std::env::args().nth(1).as_deref() == Some("dump") {
        let list = std::env::args().nth(2).ok_or("expected a file list")?;
        return dump(&list);
    }
    let args: Vec<_> = std::env::args().skip(1).collect();
    let [mode, rounds] = args.as_slice() else {
        return Err("expected <resolve|analyze|evaluate> <rounds>".into());
    };
    if !matches!(
        mode.as_str(),
        "resolve" | "analyze" | "analyze-compound" | "evaluate"
    ) {
        return Err("unknown benchmark mode".into());
    }
    let rounds: usize = rounds.parse()?;
    if rounds == 0 {
        return Err("rounds must be positive".into());
    }
    let mut sources = sources();
    let compound = sources
        .pop()
        .expect("compound case follows the basic cases");
    if mode == "analyze-compound" {
        sources = vec![compound];
    }
    let cases: Vec<_> = sources
        .into_iter()
        .map(|source| {
            let component =
                rsvelte_svelte::syntax::parse::parse(&source).expect("valid benchmark source");
            let tree = lower(&component, &source);
            let resolution = resolve::resolve_with_module(
                &component.javascript,
                component.program,
                component.module.as_ref().map(|module| module.program),
                &tree,
            );
            Case {
                source,
                component,
                tree,
                resolution,
            }
        })
        .collect();
    for case in &cases {
        run(case, mode);
    }
    let before = thread_allocations();
    let started = Instant::now();
    for _ in 0..rounds {
        for case in &cases {
            run(black_box(case), mode);
        }
    }
    let elapsed = started.elapsed().as_nanos();
    let after = thread_allocations();
    println!(
        concat!(
            "{{\"mode\":\"{}\",\"rounds\":{},\"documents\":{},",
            "\"skipped\":0,\"elapsed_ns\":{},\"allocations\":{},",
            "\"allocated_bytes\":{},\"evaluation_bytes\":{},\"binding_information_bytes\":{}}}"
        ),
        mode,
        rounds,
        cases.len(),
        elapsed,
        after.0 - before.0,
        after.1 - before.1,
        size_of::<rsvelte_svelte::semantic::evaluate::Evaluation>(),
        size_of::<resolve::BindingInformation>()
    );
    Ok(())
}
