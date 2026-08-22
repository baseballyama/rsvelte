//! Upstream reaches a `$inspect(…)` from a tree-wide `CallExpression` visitor,
//! so the residue it leaves cannot depend on how deeply the call is nested.
//! rsvelte's server transform answered that only for a top-level statement:
//! everything below one was deleted outright, losing the non-dev `;;` and — the
//! part that is not a byte difference — the dev `console.log` call.
//!
//! Every expectation is the official compiler's recorded output for the same
//! input (svelte 5.56.9, `submodules/svelte` @ `20b341f1`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_to(source: &str, generate: GenerateMode, dev: bool) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate,
            dev,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

#[test]
fn a_nested_inspect_in_a_function_body_on_server_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tfunction f() { $inspect(a); }\n\tf();\n</script>\n<b>{a}</b>\n",
            GenerateMode::Server,
            false
        ),
        "import * as $ from 'svelte/internal/server';\n\nexport default function C($$renderer) {\n\tlet a = 1;\n\n\tfunction f() {\n\t\t;;\n\t}\n\n\tf();\n\t$$renderer.push(`<b>1</b>`);\n}"
    );
}

#[test]
fn a_nested_inspect_in_a_function_body_on_server_dev() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tfunction f() { $inspect(a); }\n\tf();\n</script>\n<b>{a}</b>\n",
            GenerateMode::Server,
            true
        ),
        "C[$.FILENAME] = 'C.svelte';\n\nimport * as $ from 'svelte/internal/server';\n\nfunction C($$renderer, $$props) {\n\t$$renderer.component(\n\t\t($$renderer) => {\n\t\t\tlet a = 1;\n\n\t\t\tfunction f() {\n\t\t\t\tconsole.log('$inspect(', a, ')');\n\t\t\t}\n\n\t\t\tf();\n\t\t\t$$renderer.push(`<b>`);\n\t\t\t$.push_element($$renderer, 'b', 6, 0);\n\t\t\t$$renderer.push(`1</b>`);\n\t\t\t$.pop_element();\n\t\t},\n\t\tC\n\t);\n}\n\nC.render = function () {\n\tthrow new Error('Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information');\n};\n\nexport default C;"
    );
}

#[test]
fn a_nested_inspect_in_an_arrow_body_on_server_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tconst f = () => { $inspect(a); };\n\tf();\n</script>\n<b>{a}</b>\n",
            GenerateMode::Server,
            false
        ),
        "import * as $ from 'svelte/internal/server';\n\nexport default function C($$renderer) {\n\tlet a = 1;\n\n\tconst f = () => {\n\t\t;;\n\t};\n\n\tf();\n\t$$renderer.push(`<b>1</b>`);\n}"
    );
}

#[test]
fn a_nested_inspect_in_an_arrow_body_on_server_dev() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tconst f = () => { $inspect(a); };\n\tf();\n</script>\n<b>{a}</b>\n",
            GenerateMode::Server,
            true
        ),
        "C[$.FILENAME] = 'C.svelte';\n\nimport * as $ from 'svelte/internal/server';\n\nfunction C($$renderer, $$props) {\n\t$$renderer.component(\n\t\t($$renderer) => {\n\t\t\tlet a = 1;\n\n\t\t\tconst f = () => {\n\t\t\t\tconsole.log('$inspect(', a, ')');\n\t\t\t};\n\n\t\t\tf();\n\t\t\t$$renderer.push(`<b>`);\n\t\t\t$.push_element($$renderer, 'b', 6, 0);\n\t\t\t$$renderer.push(`1</b>`);\n\t\t\t$.pop_element();\n\t\t},\n\t\tC\n\t);\n}\n\nC.render = function () {\n\tthrow new Error('Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information');\n};\n\nexport default C;"
    );
}

#[test]
fn a_nested_inspect_in_a_bare_block_on_server_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\t{ $inspect(a); }\n</script>\n<b>{a}</b>\n",
            GenerateMode::Server,
            false
        ),
        "import * as $ from 'svelte/internal/server';\n\nexport default function C($$renderer) {\n\tlet a = 1;\n\n\t{\n\t\t;;\n\t}\n\n\t$$renderer.push(`<b>1</b>`);\n}"
    );
}

#[test]
fn a_nested_inspect_in_a_bare_block_on_server_dev() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\t{ $inspect(a); }\n</script>\n<b>{a}</b>\n",
            GenerateMode::Server,
            true
        ),
        "C[$.FILENAME] = 'C.svelte';\n\nimport * as $ from 'svelte/internal/server';\n\nfunction C($$renderer, $$props) {\n\t$$renderer.component(\n\t\t($$renderer) => {\n\t\t\tlet a = 1;\n\n\t\t\t{\n\t\t\t\tconsole.log('$inspect(', a, ')');\n\t\t\t}\n\n\t\t\t$$renderer.push(`<b>`);\n\t\t\t$.push_element($$renderer, 'b', 5, 0);\n\t\t\t$$renderer.push(`1</b>`);\n\t\t\t$.pop_element();\n\t\t},\n\t\tC\n\t);\n}\n\nC.render = function () {\n\tthrow new Error('Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information');\n};\n\nexport default C;"
    );
}

#[test]
fn a_nested_inspect_in_a_class_method_on_server_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tclass K { m() { $inspect(a); } }\n\tnew K();\n</script>\n<b>{a}</b>\n",
            GenerateMode::Server,
            false
        ),
        "import * as $ from 'svelte/internal/server';\n\nexport default function C($$renderer, $$props) {\n\t$$renderer.component(($$renderer) => {\n\t\tlet a = 1;\n\n\t\tclass K {\n\t\t\tm() {\n\t\t\t\t;;\n\t\t\t}\n\t\t}\n\n\t\tnew K();\n\t\t$$renderer.push(`<b>1</b>`);\n\t});\n}"
    );
}

#[test]
fn a_nested_inspect_in_a_class_method_on_server_dev() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tclass K { m() { $inspect(a); } }\n\tnew K();\n</script>\n<b>{a}</b>\n",
            GenerateMode::Server,
            true
        ),
        "C[$.FILENAME] = 'C.svelte';\n\nimport * as $ from 'svelte/internal/server';\n\nfunction C($$renderer, $$props) {\n\t$$renderer.component(\n\t\t($$renderer) => {\n\t\t\tlet a = 1;\n\n\t\t\tclass K {\n\t\t\t\tm() {\n\t\t\t\t\tconsole.log('$inspect(', a, ')');\n\t\t\t\t}\n\t\t\t}\n\n\t\t\tnew K();\n\t\t\t$$renderer.push(`<b>`);\n\t\t\t$.push_element($$renderer, 'b', 6, 0);\n\t\t\t$$renderer.push(`1</b>`);\n\t\t\t$.pop_element();\n\t\t},\n\t\tC\n\t);\n}\n\nC.render = function () {\n\tthrow new Error('Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information');\n};\n\nexport default C;"
    );
}

#[test]
fn a_nested_inspect_in_a_module_script_function_on_server_prod() {
    assert_eq!(
        compile_to(
            "<script module>\n\tlet m = 1;\n\tfunction g() { $inspect(m); }\n\tg();\n</script>\n<script>\n\tlet a = $state(1);\n</script>\n<b>{a}</b>\n",
            GenerateMode::Server,
            false
        ),
        "import * as $ from 'svelte/internal/server';\n\nlet m = 1;\n\nfunction g() {\n\t;;\n}\n\ng();\n\nexport default function C($$renderer) {\n\tlet a = 1;\n\n\t$$renderer.push(`<b>1</b>`);\n}"
    );
}

#[test]
fn a_nested_inspect_in_a_module_script_function_on_server_dev() {
    assert_eq!(
        compile_to(
            "<script module>\n\tlet m = 1;\n\tfunction g() { $inspect(m); }\n\tg();\n</script>\n<script>\n\tlet a = $state(1);\n</script>\n<b>{a}</b>\n",
            GenerateMode::Server,
            true
        ),
        "C[$.FILENAME] = 'C.svelte';\n\nimport * as $ from 'svelte/internal/server';\n\nlet m = 1;\n\nfunction g() {\n\tconsole.log('$inspect(', m, ')');\n}\n\ng();\n\nfunction C($$renderer, $$props) {\n\t$$renderer.component(\n\t\t($$renderer) => {\n\t\t\tlet a = 1;\n\n\t\t\t$$renderer.push(`<b>`);\n\t\t\t$.push_element($$renderer, 'b', 9, 0);\n\t\t\t$$renderer.push(`1</b>`);\n\t\t\t$.pop_element();\n\t\t},\n\t\tC\n\t);\n}\n\nC.render = function () {\n\tthrow new Error('Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information');\n};\n\nexport default C;"
    );
}

#[test]
fn a_nested_inspect_in_a_function_body_over_three_lines_on_server_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tfunction f() {\n\t\t$inspect(a);\n\t}\n\tf();\n</script>\n<b>{a}</b>\n",
            GenerateMode::Server,
            false
        ),
        "import * as $ from 'svelte/internal/server';\n\nexport default function C($$renderer) {\n\tlet a = 1;\n\n\tfunction f() {\n\t\t;;\n\t}\n\n\tf();\n\t$$renderer.push(`<b>1</b>`);\n}"
    );
}

#[test]
fn a_nested_inspect_in_a_function_body_over_three_lines_on_server_dev() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tfunction f() {\n\t\t$inspect(a);\n\t}\n\tf();\n</script>\n<b>{a}</b>\n",
            GenerateMode::Server,
            true
        ),
        "C[$.FILENAME] = 'C.svelte';\n\nimport * as $ from 'svelte/internal/server';\n\nfunction C($$renderer, $$props) {\n\t$$renderer.component(\n\t\t($$renderer) => {\n\t\t\tlet a = 1;\n\n\t\t\tfunction f() {\n\t\t\t\tconsole.log('$inspect(', a, ')');\n\t\t\t}\n\n\t\t\tf();\n\t\t\t$$renderer.push(`<b>`);\n\t\t\t$.push_element($$renderer, 'b', 8, 0);\n\t\t\t$$renderer.push(`1</b>`);\n\t\t\t$.pop_element();\n\t\t},\n\t\tC\n\t);\n}\n\nC.render = function () {\n\tthrow new Error('Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information');\n};\n\nexport default C;"
    );
}

// The client instance script fills the same slot from its own (text) pipeline,
// so it needs its own rows rather than inheriting the server's.

#[test]
fn a_nested_inspect_in_a_function_body_on_client_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tfunction f() { $inspect(a); }\n\tf();\n</script>\n<b>{a}</b>\n",
            GenerateMode::Client,
            false
        ),
        "import 'svelte/internal/disclose-version';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<b></b>`);\n\nexport default function C($$anchor) {\n\tlet a = 1;\n\n\tfunction f() {\n\t\t;;\n\t}\n\n\tf();\n\n\tvar b = root();\n\n\tb.textContent = '1';\n\t$.append($$anchor, b);\n}"
    );
}

#[test]
fn a_nested_inspect_in_an_arrow_body_on_client_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tconst f = () => { $inspect(a); };\n\tf();\n</script>\n<b>{a}</b>\n",
            GenerateMode::Client,
            false
        ),
        "import 'svelte/internal/disclose-version';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<b></b>`);\n\nexport default function C($$anchor) {\n\tlet a = 1;\n\n\tconst f = () => {\n\t\t;;\n\t};\n\n\tf();\n\n\tvar b = root();\n\n\tb.textContent = '1';\n\t$.append($$anchor, b);\n}"
    );
}

#[test]
fn a_nested_inspect_in_a_bare_block_on_client_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\t{ $inspect(a); }\n</script>\n<b>{a}</b>\n",
            GenerateMode::Client,
            false
        ),
        "import 'svelte/internal/disclose-version';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<b></b>`);\n\nexport default function C($$anchor) {\n\tlet a = 1;\n\n\t{\n\t\t;;\n\t}\n\n\tvar b = root();\n\n\tb.textContent = '1';\n\t$.append($$anchor, b);\n}"
    );
}

#[test]
fn a_nested_inspect_in_a_class_method_on_client_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tclass K { m() { $inspect(a); } }\n\tnew K();\n</script>\n<b>{a}</b>\n",
            GenerateMode::Client,
            false
        ),
        "import 'svelte/internal/disclose-version';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<b></b>`);\n\nexport default function C($$anchor, $$props) {\n\t$.push($$props, true);\n\n\tlet a = 1;\n\n\tclass K {\n\t\tm() {\n\t\t\t;;\n\t\t}\n\t}\n\n\tnew K();\n\n\tvar b = root();\n\n\tb.textContent = '1';\n\t$.append($$anchor, b);\n\t$.pop();\n}"
    );
}

#[test]
fn a_nested_inspect_in_a_function_body_over_three_lines_on_client_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tfunction f() {\n\t\t$inspect(a);\n\t}\n\tf();\n</script>\n<b>{a}</b>\n",
            GenerateMode::Client,
            false
        ),
        "import 'svelte/internal/disclose-version';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<b></b>`);\n\nexport default function C($$anchor) {\n\tlet a = 1;\n\n\tfunction f() {\n\t\t;;\n\t}\n\n\tf();\n\n\tvar b = root();\n\n\tb.textContent = '1';\n\t$.append($$anchor, b);\n}"
    );
}

#[test]
fn an_inspect_sharing_its_line_with_what_follows_on_client_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\t$inspect(a); let z = 1;\n\tconsole.log(z);\n</script>\n<b>{a}</b>\n",
            GenerateMode::Client,
            false
        ),
        "import 'svelte/internal/disclose-version';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<b></b>`);\n\nexport default function C($$anchor) {\n\tlet a = 1;\n\n\t;;\n\n\tlet z = 1;\n\n\tconsole.log(z);\n\n\tvar b = root();\n\n\tb.textContent = '1';\n\t$.append($$anchor, b);\n}"
    );
}

#[test]
fn an_inspect_sharing_its_line_with_what_precedes_on_client_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tlet z = 1; $inspect(a);\n\tconsole.log(z);\n</script>\n<b>{a}</b>\n",
            GenerateMode::Client,
            false
        ),
        "import 'svelte/internal/disclose-version';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<b></b>`);\n\nexport default function C($$anchor) {\n\tlet a = 1;\n\tlet z = 1;\n\n\t;;\n\tconsole.log(z);\n\n\tvar b = root();\n\n\tb.textContent = '1';\n\t$.append($$anchor, b);\n}"
    );
}

// Controls: the top-level arm, which was already right, must not move.

#[test]
fn an_inspect_at_the_script_top_level_on_server_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\t$inspect(a);\n</script>\n<b>{a}</b>\n",
            GenerateMode::Server,
            false
        ),
        "import * as $ from 'svelte/internal/server';\n\nexport default function C($$renderer) {\n\tlet a = 1;\n\n\t;;\n\t$$renderer.push(`<b>1</b>`);\n}"
    );
}

#[test]
fn an_inspect_at_the_script_top_level_on_server_dev() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\t$inspect(a);\n</script>\n<b>{a}</b>\n",
            GenerateMode::Server,
            true
        ),
        "C[$.FILENAME] = 'C.svelte';\n\nimport * as $ from 'svelte/internal/server';\n\nfunction C($$renderer, $$props) {\n\t$$renderer.component(\n\t\t($$renderer) => {\n\t\t\tlet a = 1;\n\n\t\t\tconsole.log('$inspect(', a, ')');\n\t\t\t$$renderer.push(`<b>`);\n\t\t\t$.push_element($$renderer, 'b', 5, 0);\n\t\t\t$$renderer.push(`1</b>`);\n\t\t\t$.pop_element();\n\t\t},\n\t\tC\n\t);\n}\n\nC.render = function () {\n\tthrow new Error('Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information');\n};\n\nexport default C;"
    );
}
