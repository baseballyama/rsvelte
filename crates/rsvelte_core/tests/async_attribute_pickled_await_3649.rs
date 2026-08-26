//! A non-tail `await` in any attribute-like reactive expression must be
//! pickled through `$.save`. Otherwise state read after the suspension is not
//! re-taken when the promise resolves (issue #3649).

use rsvelte_core::{CompileOptions, ExperimentalOptions, GenerateMode, compile};

const PREAMBLE: &str = "<script>\n\timport Comp from './Comp.svelte';\n\tlet foo = $state('foo');\n\tconst p = Promise.resolve('v');\n</script>\n\n";

fn client(markup: &str) -> String {
    compile(
        &format!("{PREAMBLE}{markup}"),
        CompileOptions {
            generate: GenerateMode::Client,
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        },
    )
    .unwrap_or_else(|error| panic!("compile failed for {markup}: {error:?}"))
    .js
    .code
}

#[test]
fn every_attribute_expression_path_pickles_a_non_tail_await() {
    let cases = [
        "<div data-x={(await p) + foo}></div>",
        "<div class={(await p) + foo}></div>",
        "<div style={(await p) + foo}></div>",
        "<div style:color={(await p) + foo}></div>",
        "<div class:x={(await p) + foo}></div>",
        "<div {...{ 'data-x': (await p) + foo }}></div>",
        "<Comp x={(await p) + foo} />",
        "<Comp {...{ x: (await p) + foo }} />",
    ];

    for markup in cases {
        let output = client(markup);
        assert!(
            output.contains("(await $.save(p))()"),
            "expected the non-tail await to be pickled for {markup}:\n{output}"
        );
    }
}

#[test]
fn a_tail_await_is_not_pickled() {
    let output = client("<div data-x={await p}></div>");
    assert!(
        !output.contains("$.save(p)"),
        "a last-evaluated await must stay bare:\n{output}"
    );
}
