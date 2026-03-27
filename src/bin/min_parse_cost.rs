use std::time::Instant;
use svelte_compiler_rust::compiler::phases::phase1_parse::{ParseOptions, parse};

fn main() {
    let options = ParseOptions {
        modern: true,
        skip_expression_loc: true,
        defer_script_parse: true,
        ..Default::default()
    };
    let files: Vec<(&str, &str)> = vec![
        ("empty", ""),
        ("<p>hi</p>", "<p>hi</p>"),
        ("1 elem + 1 attr", "<div class=\"a\">text</div>"),
        ("script+expr", "<script>let x = 1;</script>\n<p>{x}</p>"),
        ("3 elems", "<div><span>a</span><span>b</span></div>"),
        (
            "5 attrs",
            "<div a=\"1\" b=\"2\" c=\"3\" d=\"4\" e=\"5\">x</div>",
        ),
        ("if block", "{#if true}<p>yes</p>{:else}<p>no</p>{/if}"),
    ];
    for (label, source) in &files {
        for _ in 0..2000 {
            let _ = parse(source, options.clone());
        }
        let start = Instant::now();
        let iters = 50000;
        for _ in 0..iters {
            let _ = parse(source, options.clone());
        }
        let ns = start.elapsed().as_nanos() as f64 / iters as f64;
        println!("{:30} {:6.0}ns ({:.2}µs)", label, ns, ns / 1000.0);
    }
}
