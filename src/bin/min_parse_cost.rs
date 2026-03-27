use std::time::Instant;
use svelte_compiler_rust::compiler::phases::phase1_parse::{
    ParseOptions, Parser, parse, parse_reuse,
};

fn main() {
    let options = ParseOptions {
        modern: true,
        skip_expression_loc: true,
        defer_script_parse: true,
        ..Default::default()
    };

    println!("=== Per-file parse cost ===");
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
    let iters = 50000;
    for (label, source) in &files {
        for _ in 0..2000 {
            let _ = parse(source, options);
        }
        let start = Instant::now();
        for _ in 0..iters {
            let _ = parse(source, options);
        }
        let ns = start.elapsed().as_nanos() as f64 / iters as f64;
        println!("{:30} {:6.0}ns ({:.2}µs)", label, ns, ns / 1000.0);
    }

    // Compare: parse_reuse (skip Parser::new overhead)
    println!("\n=== With Parser reuse (skip new()) ===");
    let mut parser = Parser::new("", options);
    for (label, source) in &files {
        for _ in 0..2000 {
            let _ = parse_reuse(&mut parser, source, options);
        }
        let start = Instant::now();
        for _ in 0..iters {
            let _ = parse_reuse(&mut parser, source, options);
        }
        let ns = start.elapsed().as_nanos() as f64 / iters as f64;
        println!("{:30} {:6.0}ns ({:.2}µs)", label, ns, ns / 1000.0);
    }

    // Measure Parser::new() cost alone
    println!("\n=== Parser::new() cost ===");
    for _ in 0..1000 {
        let _ = Parser::new("", options);
    }
    let start = Instant::now();
    for _ in 0..iters {
        let _p = Parser::new("", options);
    }
    let ns = start.elapsed().as_nanos() as f64 / iters as f64;
    println!(
        "Parser::new(empty):            {:6.0}ns ({:.2}µs)",
        ns,
        ns / 1000.0
    );

    let big = "<script lang=\"ts\">let x = 1;</script><div class=\"foo\">hello</div>";
    for _ in 0..1000 {
        let _ = Parser::new(big, options);
    }
    let start = Instant::now();
    for _ in 0..iters {
        let _p = Parser::new(big, options);
    }
    let ns = start.elapsed().as_nanos() as f64 / iters as f64;
    println!(
        "Parser::new(67B with script):  {:6.0}ns ({:.2}µs)",
        ns,
        ns / 1000.0
    );
}
