//! Official svelte2tsx parses with TypeScript, whose parser is error-tolerant,
//! so a component whose instance script does not parse still gets every script
//! transform. The expected strings below are official svelte2tsx's byte-exact
//! output for the same source (`filename: "Test.svelte"`, `mode: 'ts'`,
//! `namespace: 'html'`, `version: '5'`).

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn convert(source: &str) -> String {
    let options = Svelte2TsxOptions {
        filename: "Test.svelte".to_string(),
        ..Svelte2TsxOptions::default()
    };
    svelte2tsx(source, options)
        .expect("an unparseable instance script is not an error")
        .code
}

#[test]
fn export_is_blanked_when_the_instance_script_does_not_parse() {
    let source =
        "<script>\n\texport let a = 1;\n\tlet b = 1 let c = 2\n</script>\n\n<b>{a}{b}{c}</b>\n";

    assert_eq!(
        convert(source),
        "///<reference types=\"svelte\" />\n;function $$render() {\n\n\t let a = 1;\n\tlet b = 1 let c = 2\n;\nasync () => {\n\n { svelteHTML.createElement(\"b\", {});a;b;c; }\n};\nreturn { props: {a: a}, exports: {}, bindings: \"\", slots: {}, events: {} }}\nconst Test__SvelteComponent_ = __sveltets_2_isomorphic_component(__sveltets_2_partial(['a'], __sveltets_2_with_any_event($$render())));\n/*Ωignore_startΩ*/type Test__SvelteComponent_ = InstanceType<typeof Test__SvelteComponent_>;\n/*Ωignore_endΩ*/export default Test__SvelteComponent_;"
    );
}

#[test]
fn reactive_block_is_wrapped_when_its_body_does_not_parse() {
    let source = "<script>\n\texport let a = 1;\n\tlet d = 0;\n\t$: {\n\t\td = a d += 1\n\t}\n</script>\n\n<b>{d}</b>\n";

    assert_eq!(
        convert(source),
        "///<reference types=\"svelte\" />\n;function $$render() {\n\n\t let a = 1;\n\tlet d = 0;\n\t;() => {$: {\n\t\td = a d += 1\n\t}}\n;\nasync () => {\n\n { svelteHTML.createElement(\"b\", {});d; }\n};\nreturn { props: {a: a}, exports: {}, bindings: \"\", slots: {}, events: {} }}\nconst Test__SvelteComponent_ = __sveltets_2_isomorphic_component(__sveltets_2_partial(['a'], __sveltets_2_with_any_event($$render())));\n/*Ωignore_startΩ*/type Test__SvelteComponent_ = InstanceType<typeof Test__SvelteComponent_>;\n/*Ωignore_endΩ*/export default Test__SvelteComponent_;"
    );
}

#[test]
fn every_unterminated_statement_in_one_script_is_recovered() {
    // The repair is applied one missing semicolon at a time, so a script with
    // several has to keep re-parsing until none is left.
    let source = "<script>\n\texport let a = 1;\n\tlet b = 1 let c = 2\n\tlet d = 3 let e = 4\n\t$: {\n\t\tb = a c = b\n\t}\n</script>\n\n<b>{a}{b}{c}{d}{e}</b>\n";

    assert_eq!(
        convert(source),
        "///<reference types=\"svelte\" />\n;function $$render() {\n\n\t let a = 1;\n\tlet b = 1 let c = 2\n\tlet d = 3 let e = 4\n\t;() => {$: {\n\t\tb = a c = b\n\t}}\n;\nasync () => {\n\n { svelteHTML.createElement(\"b\", {});a;b;c;d;e; }\n};\nreturn { props: {a: a}, exports: {}, bindings: \"\", slots: {}, events: {} }}\nconst Test__SvelteComponent_ = __sveltets_2_isomorphic_component(__sveltets_2_partial(['a'], __sveltets_2_with_any_event($$render())));\n/*Ωignore_startΩ*/type Test__SvelteComponent_ = InstanceType<typeof Test__SvelteComponent_>;\n/*Ωignore_endΩ*/export default Test__SvelteComponent_;"
    );
}

#[test]
fn an_unrepairable_script_still_converts() {
    // No horizontal whitespace where the semicolon belongs, so the recovery
    // declines; the fallback must stay "emit the script verbatim", not a panic.
    let source = "<script>\n\tlet a = {\n</script>\n\n<b>x</b>\n";

    assert!(convert(source).contains("let a = {"));
}
