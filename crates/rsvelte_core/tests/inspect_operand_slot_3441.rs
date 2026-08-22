//! An operand slot is the one place upstream's own `$inspect` removal does not
//! survive its own output. `transform_inspect_rune` returns `b.empty` — an
//! `EmptyStatement` — as the replacement EXPRESSION, which esrap prints as a
//! bare `;`; in a statement that is the `;;` residue every other test here
//! pins, but in `const t = $inspect(a)` it is `const t = ;;`, which no parser
//! accepts. `$inspect(a).with(fn)` reaches a different upstream defect: the
//! `VariableDeclaration` allow-list omits it, so official either drops the
//! declarator (client) or takes the outer call's first argument as the value
//! (server, `const t = console.log;`).
//!
//! rsvelte emits what the rune evaluates to instead of leaving the call in
//! place, which would throw `ReferenceError: $inspect is not defined`. The
//! divergence is recorded in `compatibility/deliberate-divergences.md` and
//! reported upstream in
//! `upstream_issues/3441-svelte-inspect-in-an-operand-slot.md`.
//!
//! Official's byte-for-byte output is quoted above each deviating case; the
//! parity cases below are compared to it directly.

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
fn a_plain_inspect_initializer_on_client_prod() {
    // official: const t = ;;
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tconst t = $inspect(a);\n</script>\n<b>x</b>\n",
            GenerateMode::Client,
            false
        ),
        "import 'svelte/internal/disclose-version';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<b>x</b>`);\n\nexport default function C($$anchor) {\n\tlet a = 1;\n\tconst t = undefined;\n\tvar b = root();\n\n\t$.append($$anchor, b);\n}"
    );
}

#[test]
fn a_plain_inspect_initializer_on_server_prod() {
    // official: const t = ;;
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tconst t = $inspect(a);\n</script>\n<b>x</b>\n",
            GenerateMode::Server,
            false
        ),
        "import * as $ from 'svelte/internal/server';\n\nexport default function C($$renderer) {\n\tlet a = 1;\n\tconst t = undefined;\n\n\t$$renderer.push(`<b>x</b>`);\n}"
    );
}

#[test]
fn an_inspect_as_an_array_element_on_client_prod() {
    // official: const o = [;];
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tconst o = [$inspect(a).with(console.log)];\n\tconsole.log(o);\n</script>\n<b>x</b>\n",
            GenerateMode::Client,
            false
        ),
        "import 'svelte/internal/disclose-version';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<b>x</b>`);\n\nexport default function C($$anchor, $$props) {\n\t$.push($$props, true);\n\n\tlet a = 1;\n\tconst o = [undefined];\n\n\tconsole.log(o);\n\n\tvar b = root();\n\n\t$.append($$anchor, b);\n\t$.pop();\n}"
    );
}

#[test]
fn an_inspect_as_an_array_element_on_server_prod() {
    // official: const o = [;];
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tconst o = [$inspect(a).with(console.log)];\n\tconsole.log(o);\n</script>\n<b>x</b>\n",
            GenerateMode::Server,
            false
        ),
        "import * as $ from 'svelte/internal/server';\n\nexport default function C($$renderer, $$props) {\n\t$$renderer.component(($$renderer) => {\n\t\tlet a = 1;\n\t\tconst o = [undefined];\n\n\t\tconsole.log(o);\n\t\t$$renderer.push(`<b>x</b>`);\n\t});\n}"
    );
}

#[test]
fn a_with_inspect_initializer_on_server_prod() {
    // official: const t = console.log;
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tconst t = $inspect(a).with(console.log);\n</script>\n<b>x</b>\n",
            GenerateMode::Server,
            false
        ),
        "import * as $ from 'svelte/internal/server';\n\nexport default function C($$renderer, $$props) {\n\t$$renderer.component(($$renderer) => {\n\t\tlet a = 1;\n\t\tconst t = undefined;\n\n\t\t$$renderer.push(`<b>x</b>`);\n\t});\n}"
    );
}

#[test]
fn a_with_inspect_initializer_on_server_dev() {
    // official: const t = console.log;
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tconst t = $inspect(a).with(console.log);\n</script>\n<b>x</b>\n",
            GenerateMode::Server,
            true
        ),
        "C[$.FILENAME] = 'C.svelte';\n\nimport * as $ from 'svelte/internal/server';\n\nfunction C($$renderer, $$props) {\n\t$$renderer.component(\n\t\t($$renderer) => {\n\t\t\tlet a = 1;\n\t\t\tconst t = console.log('init', a);\n\n\t\t\t$$renderer.push(`<b>`);\n\t\t\t$.push_element($$renderer, 'b', 5, 0);\n\t\t\t$$renderer.push(`x</b>`);\n\t\t\t$.pop_element();\n\t\t},\n\t\tC\n\t);\n}\n\nC.render = function () {\n\tthrow new Error('Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information');\n};\n\nexport default C;"
    );
}

// Parity: wherever official's own output is usable, rsvelte reproduces it.

#[test]
fn a_plain_inspect_initializer_on_server_dev() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tconst t = $inspect(a);\n</script>\n<b>x</b>\n",
            GenerateMode::Server,
            true
        ),
        "C[$.FILENAME] = 'C.svelte';\n\nimport * as $ from 'svelte/internal/server';\n\nfunction C($$renderer, $$props) {\n\t$$renderer.component(\n\t\t($$renderer) => {\n\t\t\tlet a = 1;\n\t\t\tconst t = console.log('$inspect(', a, ')');\n\n\t\t\t$$renderer.push(`<b>`);\n\t\t\t$.push_element($$renderer, 'b', 5, 0);\n\t\t\t$$renderer.push(`x</b>`);\n\t\t\t$.pop_element();\n\t\t},\n\t\tC\n\t);\n}\n\nC.render = function () {\n\tthrow new Error('Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information');\n};\n\nexport default C;"
    );
}

#[test]
fn a_plain_inspect_initializer_on_client_dev() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tconst t = $inspect(a);\n</script>\n<b>x</b>\n",
            GenerateMode::Client,
            true
        ),
        "import 'svelte/internal/disclose-version';\n\nC[$.FILENAME] = 'C.svelte';\n\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.add_locations($.from_html(`<b>x</b>`), C[$.FILENAME], [[5, 0]]);\n\nexport default function C($$anchor, $$props) {\n\t$.check_target(new.target);\n\t$.push($$props, true, C);\n\n\tlet a = 1;\n\tconst t = $.inspect(() => [a], (...$$args) => console.log(...$$args), true);\n\tvar $$exports = { ...$.legacy_api() };\n\tvar b = root();\n\n\t$.append($$anchor, b);\n\n\treturn $.pop($$exports);\n}"
    );
}

#[test]
fn an_inspect_as_an_array_element_on_server_dev() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tconst o = [$inspect(a).with(console.log)];\n\tconsole.log(o);\n</script>\n<b>x</b>\n",
            GenerateMode::Server,
            true
        ),
        "C[$.FILENAME] = 'C.svelte';\n\nimport * as $ from 'svelte/internal/server';\n\nfunction C($$renderer, $$props) {\n\t$$renderer.component(\n\t\t($$renderer) => {\n\t\t\tlet a = 1;\n\t\t\tconst o = [console.log('init', a)];\n\n\t\t\tconsole.log(o);\n\t\t\t$$renderer.push(`<b>`);\n\t\t\t$.push_element($$renderer, 'b', 6, 0);\n\t\t\t$$renderer.push(`x</b>`);\n\t\t\t$.pop_element();\n\t\t},\n\t\tC\n\t);\n}\n\nC.render = function () {\n\tthrow new Error('Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information');\n};\n\nexport default C;"
    );
}

#[test]
fn an_inspect_statement_on_client_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\t$inspect(a).with(console.log);\n</script>\n<b>x</b>\n",
            GenerateMode::Client,
            false
        ),
        "import 'svelte/internal/disclose-version';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<b>x</b>`);\n\nexport default function C($$anchor, $$props) {\n\t$.push($$props, true);\n\n\tlet a = 1;\n\n\t;;\n\n\tvar b = root();\n\n\t$.append($$anchor, b);\n\t$.pop();\n}"
    );
}

#[test]
fn an_inspect_statement_on_server_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\t$inspect(a).with(console.log);\n</script>\n<b>x</b>\n",
            GenerateMode::Server,
            false
        ),
        "import * as $ from 'svelte/internal/server';\n\nexport default function C($$renderer, $$props) {\n\t$$renderer.component(($$renderer) => {\n\t\tlet a = 1;\n\n\t\t;;\n\t\t$$renderer.push(`<b>x</b>`);\n\t});\n}"
    );
}
