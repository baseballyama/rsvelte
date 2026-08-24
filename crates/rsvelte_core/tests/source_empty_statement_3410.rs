//! esrap's `body()` skips every `EmptyStatement` child, so a `;` the user
//! wrote never reaches the official compiler's output. rsvelte's client
//! pipeline printed the whole accumulated script text, and a bare `;` line
//! survived it.
//!
//! The same printer filter is what carries the `;;` a removed non-dev
//! `$inspect(…)` leaves, which is upstream's `b.empty` rather than a source
//! semicolon — so the two are separated by a sentinel span, and the controls
//! below pin that half.
//!
//! Every expectation is the official compiler's recorded output for the same
//! input (svelte 5.56.9, `submodules/svelte` @ `20b341f1`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_to(source: &str, dev: bool) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

#[test]
fn a_lone_source_semicolon_pair_is_dropped_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet q = 1;\n\t;;\n</script>\n<p>{q}</p>\n",
            false
        ),
        "import 'svelte/internal/disclose-version';\nimport 'svelte/internal/flags/legacy';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<p></p>`);\n\nexport default function C($$anchor) {\n\tlet q = 1;\n\tvar p = root();\n\n\tp.textContent = '1';\n\t$.append($$anchor, p);\n}"
    );
}

#[test]
fn a_lone_source_semicolon_pair_is_dropped_dev() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet q = 1;\n\t;;\n</script>\n<p>{q}</p>\n",
            true
        ),
        "import 'svelte/internal/disclose-version';\nimport 'svelte/internal/flags/legacy';\n\nC[$.FILENAME] = 'C.svelte';\n\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.add_locations($.from_html(`<p></p>`), C[$.FILENAME], [[5, 0]]);\n\nexport default function C($$anchor, $$props) {\n\t$.check_target(new.target);\n\t$.push($$props, false, C);\n\n\tlet q = 1;\n\tvar $$exports = { ...$.legacy_api() };\n\tvar p = root();\n\n\tp.textContent = '1';\n\t$.append($$anchor, p);\n\n\treturn $.pop($$exports);\n}"
    );
}

#[test]
fn a_single_source_semicolon_is_dropped_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet q = 1;\n\t;\n</script>\n<p>{q}</p>\n",
            false
        ),
        "import 'svelte/internal/disclose-version';\nimport 'svelte/internal/flags/legacy';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<p></p>`);\n\nexport default function C($$anchor) {\n\tlet q = 1;\n\tvar p = root();\n\n\tp.textContent = '1';\n\t$.append($$anchor, p);\n}"
    );
}

#[test]
fn a_single_source_semicolon_is_dropped_dev() {
    assert_eq!(
        compile_to("<script>\n\tlet q = 1;\n\t;\n</script>\n<p>{q}</p>\n", true),
        "import 'svelte/internal/disclose-version';\nimport 'svelte/internal/flags/legacy';\n\nC[$.FILENAME] = 'C.svelte';\n\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.add_locations($.from_html(`<p></p>`), C[$.FILENAME], [[5, 0]]);\n\nexport default function C($$anchor, $$props) {\n\t$.check_target(new.target);\n\t$.push($$props, false, C);\n\n\tlet q = 1;\n\tvar $$exports = { ...$.legacy_api() };\n\tvar p = root();\n\n\tp.textContent = '1';\n\t$.append($$anchor, p);\n\n\treturn $.pop($$exports);\n}"
    );
}

#[test]
fn source_semicolons_after_a_reactive_block_is_dropped_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet q;\n\t$: q = 1;\n\t;;\n</script>\n<p>{q}</p>\n",
            false
        ),
        "import 'svelte/internal/disclose-version';\nimport 'svelte/internal/flags/legacy';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<p> </p>`);\n\nexport default function C($$anchor, $$props) {\n\t$.push($$props, false);\n\n\tlet q = $.mutable_source();\n\n\t$.legacy_pre_effect(() => {}, () => {\n\t\t$.set(q, 1);\n\t});\n\n\t$.legacy_pre_effect_reset();\n\n\tvar p = root();\n\tvar text = $.child(p, true);\n\n\t$.reset(p);\n\t$.template_effect(() => $.set_text(text, $.get(q)));\n\t$.append($$anchor, p);\n\t$.pop();\n}"
    );
}

#[test]
fn source_semicolons_after_a_reactive_block_is_dropped_dev() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet q;\n\t$: q = 1;\n\t;;\n</script>\n<p>{q}</p>\n",
            true
        ),
        "import 'svelte/internal/disclose-version';\nimport 'svelte/internal/flags/legacy';\n\nC[$.FILENAME] = 'C.svelte';\n\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.add_locations($.from_html(`<p> </p>`), C[$.FILENAME], [[6, 0]]);\n\nexport default function C($$anchor, $$props) {\n\t$.check_target(new.target);\n\t$.push($$props, false, C);\n\n\tlet q = $.tag($.mutable_source(), 'q');\n\n\t$.legacy_pre_effect(() => {}, () => {\n\t\t$.set(q, 1);\n\t});\n\n\t$.legacy_pre_effect_reset();\n\n\tvar $$exports = { ...$.legacy_api() };\n\tvar p = root();\n\tvar text = $.child(p, true);\n\n\t$.reset(p);\n\t$.template_effect(() => $.set_text(text, $.get(q)));\n\t$.append($$anchor, p);\n\n\treturn $.pop($$exports);\n}"
    );
}

#[test]
fn source_semicolons_before_other_code_is_dropped_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet q = 1;\n\t;;\n\tconsole.log(q);\n</script>\n<p>{q}</p>\n",
            false
        ),
        "import 'svelte/internal/disclose-version';\nimport 'svelte/internal/flags/legacy';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<p></p>`);\n\nexport default function C($$anchor) {\n\tlet q = 1;\n\n\tconsole.log(q);\n\n\tvar p = root();\n\n\tp.textContent = '1';\n\t$.append($$anchor, p);\n}"
    );
}

#[test]
fn source_semicolons_before_other_code_is_dropped_dev() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet q = 1;\n\t;;\n\tconsole.log(q);\n</script>\n<p>{q}</p>\n",
            true
        ),
        "import 'svelte/internal/disclose-version';\nimport 'svelte/internal/flags/legacy';\n\nC[$.FILENAME] = 'C.svelte';\n\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.add_locations($.from_html(`<p></p>`), C[$.FILENAME], [[6, 0]]);\n\nexport default function C($$anchor, $$props) {\n\t$.check_target(new.target);\n\t$.push($$props, false, C);\n\n\tlet q = 1;\n\n\tconsole.log(q);\n\n\tvar $$exports = { ...$.legacy_api() };\n\tvar p = root();\n\n\tp.textContent = '1';\n\t$.append($$anchor, p);\n\n\treturn $.pop($$exports);\n}"
    );
}

#[test]
fn source_semicolons_in_runes_mode_is_dropped_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet q = $state(1);\n\t;;\n</script>\n<p>{q}</p>\n",
            false
        ),
        "import 'svelte/internal/disclose-version';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<p></p>`);\n\nexport default function C($$anchor) {\n\tlet q = 1;\n\tvar p = root();\n\n\tp.textContent = '1';\n\t$.append($$anchor, p);\n}"
    );
}

#[test]
fn source_semicolons_in_runes_mode_is_dropped_dev() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet q = $state(1);\n\t;;\n</script>\n<p>{q}</p>\n",
            true
        ),
        "import 'svelte/internal/disclose-version';\n\nC[$.FILENAME] = 'C.svelte';\n\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.add_locations($.from_html(`<p></p>`), C[$.FILENAME], [[5, 0]]);\n\nexport default function C($$anchor, $$props) {\n\t$.check_target(new.target);\n\t$.push($$props, true, C);\n\n\tlet q = 1;\n\tvar $$exports = { ...$.legacy_api() };\n\tvar p = root();\n\n\tp.textContent = '1';\n\t$.append($$anchor, p);\n\n\treturn $.pop($$exports);\n}"
    );
}

#[test]
fn a_source_semicolon_inside_a_function_is_dropped_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet q = 1;\n\tfunction f() { ;; }\n\tf();\n</script>\n<p>{q}</p>\n",
            false
        ),
        "import 'svelte/internal/disclose-version';\nimport 'svelte/internal/flags/legacy';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<p></p>`);\n\nexport default function C($$anchor) {\n\tlet q = 1;\n\n\tfunction f() {}\n\n\tf();\n\n\tvar p = root();\n\n\tp.textContent = '1';\n\t$.append($$anchor, p);\n}"
    );
}

#[test]
fn a_source_semicolon_inside_a_function_is_dropped_dev() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet q = 1;\n\tfunction f() { ;; }\n\tf();\n</script>\n<p>{q}</p>\n",
            true
        ),
        "import 'svelte/internal/disclose-version';\nimport 'svelte/internal/flags/legacy';\n\nC[$.FILENAME] = 'C.svelte';\n\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.add_locations($.from_html(`<p></p>`), C[$.FILENAME], [[6, 0]]);\n\nexport default function C($$anchor, $$props) {\n\t$.check_target(new.target);\n\t$.push($$props, false, C);\n\n\tlet q = 1;\n\n\tfunction f() {}\n\n\tf();\n\n\tvar $$exports = { ...$.legacy_api() };\n\tvar p = root();\n\n\tp.textContent = '1';\n\t$.append($$anchor, p);\n\n\treturn $.pop($$exports);\n}"
    );
}

// Controls: the `;;` standing in for a removed `$inspect(…)` is not a source
// semicolon and must survive the same filter.

#[test]
fn a_removed_inspect_at_the_top_level_survives_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\t$inspect(a);\n</script>\n<b>{a}</b>\n",
            false
        ),
        "import 'svelte/internal/disclose-version';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<b></b>`);\n\nexport default function C($$anchor) {\n\tlet a = 1;\n\n\t;;\n\n\tvar b = root();\n\n\tb.textContent = '1';\n\t$.append($$anchor, b);\n}"
    );
}

#[test]
fn a_removed_inspect_inside_a_function_survives_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\tfunction f() { $inspect(a); }\n\tf();\n</script>\n<b>{a}</b>\n",
            false
        ),
        "import 'svelte/internal/disclose-version';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<b></b>`);\n\nexport default function C($$anchor) {\n\tlet a = 1;\n\n\tfunction f() {\n\t\t;;\n\t}\n\n\tf();\n\n\tvar b = root();\n\n\tb.textContent = '1';\n\t$.append($$anchor, b);\n}"
    );
}

#[test]
fn a_removed_inspect_inside_a_block_survives_prod() {
    assert_eq!(
        compile_to(
            "<script>\n\tlet a = $state(1);\n\t{ $inspect(a); }\n</script>\n<b>{a}</b>\n",
            false
        ),
        "import 'svelte/internal/disclose-version';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<b></b>`);\n\nexport default function C($$anchor) {\n\tlet a = 1;\n\n\t{\n\t\t;;\n\t}\n\n\tvar b = root();\n\n\tb.textContent = '1';\n\t$.append($$anchor, b);\n}"
    );
}
