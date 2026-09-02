//! The same rule as `assign_dev_global_root.rs`, in the other port.
//!
//! `build_assignment` is ported twice — the settled-script pass
//! (`client/assign_dev_ast.rs`) and the template-expression converter
//! (`visitors/expression_converter.rs`) — and a grid that puts every assignment
//! in a `<script>` function reaches only the first. The carrier that reported
//! this class writes into an `on:click={() => (document.body.onfocus = …)}`.
//!
//! The host axis is not decoration: a modern `onclick={…}` inline handler is
//! never instrumented on either side, so the two template hosts answer
//! differently and only the legacy directive reaches this port.
//!
//! Upstream stops twice on the way to the root — `if (object.type !==
//! 'Identifier') return null` then `if (!binding) return null`
//! (`visitors/AssignmentExpression.js:104-118`) — so `this.q` and `g().q` are
//! left alone as well. Those two rows are controls this defect's report does not
//! mention; they were found by adding them.
//!
//! Every expectation is the official compiler's own count for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const HOSTS: &[(&str, &str)] = &[
    (
        "script fn",
        "<script>\n{head}function f(t){ return ({expr} = s.v); }\n</script>{f({})}",
    ),
    (
        "template onclick",
        "<script>\n{head}let t = {};\n</script><button onclick={() => ({expr} = s.v)}>x</button>",
    ),
    (
        "template on:click",
        "<script>\n{head}let t = {};\n</script><button on:click={() => ({expr} = s.v)}>x</button>",
    ),
];

/// `(root shape, script fn, template onclick, template on:click)`
const CELLS: &[(&str, &str, usize, usize, usize)] = &[
    ("global document", "document.body.q", 0, 0, 0),
    ("global window", "window.location.q", 0, 0, 0),
    ("undeclared", "someGlobal.x.q", 0, 0, 0),
    ("this member", "this.q", 0, 0, 0),
    ("call root", "g().q", 0, 0, 0),
    ("fn-local", "t.q", 1, 0, 1),
    ("import", "imp.q", 1, 0, 1),
    ("state member", "o.q", 1, 0, 1),
    ("shadowed global", "document.q", 1, 0, 1),
];

fn assign_calls(host: &str, expr: &str) -> usize {
    let mut head = String::from(
        "import imp from './i.js';\nlet o = $state({});\nlet s = {};\nfunction g(){ return {}; }\n",
    );
    if expr == "document.q" {
        head.push_str("let document = {};\n");
    }
    let template = HOSTS.iter().find(|(n, _)| *n == host).expect("host").1;
    let src = template.replace("{head}", &head).replace("{expr}", expr);
    compile(
        &src,
        CompileOptions {
            filename: Some("P.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
    .matches("$.assign(")
    .count()
}

fn check(host: &str, pick: fn(&(&str, &str, usize, usize, usize)) -> usize) {
    let mut failures = Vec::new();
    for cell in CELLS {
        let expected = pick(cell);
        let got = assign_calls(host, cell.1);
        if got != expected {
            failures.push(format!(
                "{host}/{}: official {expected}, rsvelte {got}",
                cell.0
            ));
        }
    }
    assert!(failures.is_empty(), "\n{}", failures.join("\n"));
}

#[test]
fn a_script_function_agrees_with_the_oracle() {
    check("script fn", |c| c.2);
}

/// All-zero on both sides — a modern inline handler is never instrumented. A
/// weak control (a blanket "never wrap here" would also pass it), kept because a
/// change that starts wrapping here is a regression this grid should report.
#[test]
fn a_modern_inline_handler_agrees_with_the_oracle() {
    check("template onclick", |c| c.3);
}

#[test]
fn a_legacy_event_directive_agrees_with_the_oracle() {
    check("template on:click", |c| c.4);
}
