use rsvelte_kernel::computation::pipeline::{RunOptions, Sharing, run};
use rsvelte_kernel::computation::registry::Registry;

use super::*;

/// What the task writes for `path`, or its diagnostics when it writes nothing.
fn compile(path: &str, source: &str, target: Target) -> String {
    let mut output = output(path, source, target);
    match output.files.pop() {
        Some(file) => file.text,
        None => format!("{:?}", output.diagnostics),
    }
}

fn output(path: &str, source: &str, target: Target) -> TaskOutput {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document = registry.document(path, source).expect("small");
    let task = CompileModule { target };
    let result = run(
        &registry,
        &[document],
        &RunOptions {
            tasks: &[task.identifier()],
            sharing: Sharing::Shared,
            threads: Some(1),
        },
    )
    .expect("valid plugins")
    .remove(0);
    let (_, output) = result.outputs.into_iter().next().expect("the task ran");
    output
}

const COUNTER: &str = "export class Counter {\n\tcount = $state(0);\n}\n";

#[test]
fn a_module_lowers_its_runes_for_each_target() {
    assert_eq!(
        compile("counter.svelte.js", COUNTER, Target::Client),
        "import * as $ from \"svelte/internal/client\";\nexport class Counter {\n\t#count = \
         $.state(0);\n\tget count() {\n\t\treturn $.get(this.#count);\n\t}\n\tset \
         count(value) {\n\t\t$.set(this.#count, value, true);\n\t}\n}\n"
    );
    assert_eq!(
        compile("counter.svelte.js", COUNTER, Target::Server),
        "import * as $ from \"svelte/internal/server\";\nexport class Counter {\n\tcount = \
         0;\n}\n"
    );
}

#[test]
fn a_typescript_module_keeps_what_typescript_emits() {
    let compiled = |source| compile("a.svelte.ts", source, Target::Client);
    // An import of types only is still an import, for its side effects.
    assert_eq!(
        compiled("import { type A } from './a.js';\nlet a: A = $state(1);\nexport { a };\n"),
        "import * as $ from \"svelte/internal/client\";\nimport \"./a.js\";\nlet a = 1;\n\
         export { a };\n"
    );
    // A module whose exports are types stays a module.
    assert_eq!(
        compiled("import type { A } from './a.js';\nexport { type A };\nlet a = 1;\n"),
        "import * as $ from \"svelte/internal/client\";\nexport {};\nlet a = 1;\n"
    );
    assert_eq!(
        compiled("import type { A } from './a.js';\nlet a: A = 1;\n"),
        "import * as $ from \"svelte/internal/client\";\nlet a = 1;\nexport {};\n"
    );
    // A parameter property is a field the constructor sets.
    assert_eq!(
        compiled("export class A {\n\tconstructor(public x: number) {}\n}\n"),
        "import * as $ from \"svelte/internal/client\";\nexport class A {\n\tx;\n\tconstructor(x) \
         {\n\t\tthis.x = x;\n\t}\n}\n"
    );
    // A script is strict.
    assert_eq!(
        compiled("let a: number = 1;\n"),
        "import * as $ from \"svelte/internal/client\";\n\"use strict\";\nlet a = 1;\n"
    );
}

#[test]
fn a_javascript_module_is_read_as_written() {
    let compiled = compile("a.svelte.js", "let a = 1;\n", Target::Client);
    assert_eq!(
        compiled,
        "import * as $ from \"svelte/internal/client\";\nlet a = 1;\n"
    );
}

#[test]
fn a_modules_destructured_derived_takes_names_from_the_module() {
    let source = "let obj = $state({ a: 1, b: [2] });\nconst { a, b: [c] } = \
                  $derived(obj);\nlet { x } = $derived.by(() => obj);\nexport function read() { \
                  return a + c + x; }\n";
    let compiled = compile("a.svelte.js", source, Target::Client);
    assert!(
        compiled.contains(
            "const $$array = $.derived(() => $.to_array(obj.b, 1)), a = $.derived(() => obj.a), c \
             = $.derived(() => $.get($$array)[0]);\nlet $$d = $.derived(() => obj), x = \
             $.derived(() => $.get($$d).x);\n"
        ),
        "{compiled}"
    );
    let compiled = compile("a.svelte.js", source, Target::Server);
    assert!(
        compiled.contains(
            "const $$derived_array = $.derived(() => $.to_array(obj.b, 1)), a = $.derived(() => \
             obj.a), c = $.derived(() => $$derived_array()[0]);\nlet $$d = $.derived(() => obj), \
             x = $.derived(() => $$d().x);\n"
        ),
        "{compiled}"
    );
}

#[test]
fn a_module_exports_no_derived_and_no_state_it_reassigns() {
    let compiled = |source| compile("a.svelte.js", source, Target::Client);
    let derived = compiled("let obj = $state({ a: 1 });\nexport const { a } = $derived(obj);\n");
    assert!(derived.contains("derived_invalid_export"), "{derived}");
    let state = compiled("export let a = $state(1);\nexport function f() { a = 2; }\n");
    assert!(state.contains("state_invalid_export"), "{state}");
    let mutated =
        compiled("export const a = $state({ b: 1 });\nexport function f() { a.b = 2; }\n");
    assert!(mutated.starts_with("import"), "{mutated}");
}

#[test]
fn a_functions_destructured_derived_is_split_as_at_the_top_level() {
    let source = "export function f(x) {\n\tconst { a, b: [c] } = $derived(x());\n\tconst { d } = \
                  $derived(x), e = $derived(1);\n\treturn () => a + c + d + e;\n}\n";
    let compiled = compile("a.svelte.js", source, Target::Client);
    assert!(
        compiled.contains(
            "const $$d = $.derived(x), $$array = $.derived(() => $.to_array($.get($$d).b, 1)), a = \
             $.derived(() => $.get($$d).a), c = $.derived(() => $.get($$array)[0]);\n\tconst d = \
             $.derived(() => x.d), e = $.derived(() => 1);\n\treturn () => $.get(a) + $.get(c) + \
             $.get(d) + $.get(e);"
        ),
        "{compiled}"
    );
    let compiled = compile("a.svelte.js", source, Target::Server);
    assert!(
        compiled.contains(
            "const $$d = $.derived(x), $$derived_array = $.derived(() => $.to_array($$d().b, 1)), \
             a = $.derived(() => $$d().a), c = $.derived(() => $$derived_array()[0]);\n\tconst d = \
             $.derived(() => x.d), e = $.derived(() => 1);\n\treturn () => a() + c() + d() + e();"
        ),
        "{compiled}"
    );
}

#[test]
fn a_module_reports_the_warnings_upstream_shows() {
    let codes = |source| {
        let output = output("a.svelte.js", source, Target::Client);
        assert!(!output.files.is_empty(), "{:?}", output.diagnostics);
        (output.diagnostics.iter())
            .map(|d| (d.code.to_string(), d.span.start_offset))
            .collect::<Vec<_>>()
    };
    assert_eq!(
        codes("let a = $state(0);\nexport const b = { a };\n"),
        [("state_referenced_locally".to_owned(), 38)]
    );
    assert_eq!(codes("export const b = $state(0);\n"), []);
}

#[test]
fn a_destructuring_assignment_writes_each_path_through_its_transform() {
    let source = "let a = $state(1);\nlet o = $state({});\nexport function f(x) {\n\treturn ({ a, b: \
                  o.b = 2, ...o.c } = x);\n}\nexport function g(x) {\n\t[a, [o.d]] = [1, \
                  [2]];\n\t[o.e] = x;\n}\n";
    let compiled = compile("a.svelte.js", source, Target::Client);
    assert!(
        compiled.contains(
            "return $.set(a, x.a, true), o.b = $.fallback(x.b, 2), o.c = \
             $.exclude_from_object(x, [\"a\", \"b\"]);"
        ),
        "{compiled}"
    );
    assert!(
        compiled.contains(
            "(($$value) => {\n\t\tvar $$array = $.to_array($$value, 2);\n\t\tvar $$array_1 = \
             $.to_array($$array[1], 1);\n\t\t$.set(a, $$array[0], true);\n\t\to.d = \
             $$array_1[0];\n\t})([1, [2]]);\n\t[o.e] = x;"
        ),
        "{compiled}"
    );
    let compiled = compile("a.svelte.js", source, Target::Server);
    assert!(compiled.contains("[a, [o.d]] = [1, [2]];"), "{compiled}");
}

#[test]
fn a_module_reads_a_rune_beside_a_binding_of_its_store_name() {
    let compiled = compile(
        "a.svelte.js",
        "let effect = {};\n$effect.root(() => {});\n",
        Target::Client,
    );
    assert!(compiled.contains("$.effect_root(() => {})"), "{compiled}");
}

#[test]
fn a_declaration_file_is_no_module_to_compile() {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let task = CompileModule {
        target: Target::Client,
    };
    let applies = |path| task.applies(&registry.document(path, "export {};\n").expect("small"));
    assert!(applies("a.svelte.ts"));
    assert!(!applies("a.d.svelte.ts"));
}
