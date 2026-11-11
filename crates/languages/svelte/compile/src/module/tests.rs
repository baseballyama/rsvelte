use rsvelte_kernel::computation::pipeline::{RunOptions, Sharing, run};
use rsvelte_kernel::computation::registry::Registry;

use super::*;

/// What the task writes for `path`, or its first diagnostic's code.
fn compile(path: &str, source: &str, target: Target) -> String {
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
    let (_, mut output) = result.outputs.into_iter().next().expect("the task ran");
    match output.files.pop() {
        Some(file) => file.text,
        None => format!("{:?}", output.diagnostics),
    }
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
