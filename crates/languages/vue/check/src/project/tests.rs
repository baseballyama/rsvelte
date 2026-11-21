use rsvelte_vue_semantic::compiler_syntax_tree::lower;
use rsvelte_vue_semantic::resolve::resolve;
use rsvelte_vue_syntax::parse::parse;

use super::{Projection, project};

fn projected(source_text: &str) -> String {
    let component = parse(source_text).expect("parses");
    let lowered = lower(&component, source_text);
    let resolution = resolve(
        &component.javascript,
        component.program,
        None,
        lowered.as_ref(),
    );
    match project(&component, source_text, &resolution).expect("projects") {
        Projection::TypeScript(emitter) => emitter.out,
        Projection::JavaScript => panic!("not type-checked"),
    }
}

#[test]
fn exposed_names_follow_the_first_read_in_the_template_once_each() {
    let out = projected(
        "<script setup lang=\"ts\">\nconst a = 1;\nconst b = 2;\nconst unused = 3;\n</script>\n\
         <template><p>{{ b }} {{ a }} {{ b }}</p></template>\n",
    );
    assert!(
        out.contains("ShallowUnwrapRef<{\nb: typeof b;\na: typeof a;\n}>"),
        "{out}"
    );
}
