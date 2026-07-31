use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn run(source: &str) -> String {
    svelte2tsx(source, Svelte2TsxOptions::default())
        .expect("compile")
        .code
}

#[test]
fn let_destructure_preserves_source_order_and_expressions() {
    let output = run("<Component let:first let:second={renamed}>\
         <span>{first}{renamed}</span>\
         </Component>");

    assert!(
        output.contains(",first,second:renamed,} = $$_tnenopmoC0.$$slot_def.default"),
        "got:\n{output}"
    );
}

#[test]
fn many_let_directives_stream_into_one_destructure() {
    let attributes = (0..128)
        .map(|index| format!("let:p{index}"))
        .collect::<Vec<_>>()
        .join(" ");
    let expected = (0..128)
        .map(|index| format!("p{index},"))
        .collect::<String>();
    let output = run(&format!("<Component {attributes}/>"));

    assert!(
        output.contains(&format!(",{expected}}} = $$_tnenopmoC0.$$slot_def.default")),
        "got:\n{output}"
    );
}
