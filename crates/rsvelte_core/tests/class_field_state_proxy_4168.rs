//! A class field's `$state` initializer must resolve an identifier through its
//! binding, not sniff the text.
//!
//! Upstream `should_proxy(node, scope)` recurses into `binding.initial` for an
//! `Identifier`, so `const D = 5; #a = $state(D)` emits `$.state(D)`. rsvelte's
//! class-field lowering calls the scope-less `expression_needs_proxy`, which
//! sees an identifier, cannot resolve it, and wraps every one in `$.proxy`.
//!
//! `class_transforms.rs` has six `expression_needs_proxy` call sites across
//! three functions, and a fix that reaches the reported one reads exactly like
//! a fix that reaches all six — so the grid below carries one cell per site.
//! `ident-nonproxy` / `ident-proxy` are the discriminating pair (identical as
//! text, opposite under binding resolution); the two literal rows are controls
//! that a scope-less sniff already gets right, and `method-compound` is the
//! control that cannot move at all, because a compound assignment's value is a
//! BinaryExpression upstream and never proxies.
//!
//! Every expectation is the byte-exact output of the official compiler
//! (`submodules/svelte`, v5.56.10).

use rsvelte_core::{GenerateMode, ModuleCompileOptions, compile_module};

fn emit(source: &str) -> String {
    compile_module(
        source,
        ModuleCompileOptions {
            filename: Some("p.svelte.js".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn state_lines(code: &str) -> Vec<String> {
    code.lines()
        .map(|l| l.trim().to_string())
        .filter(|l| l.contains("$.state(") || l.contains("$.set("))
        .collect()
}

type Cell = (&'static str, &'static str, &'static [&'static str]);

const CELLS: &[Cell] = &[
    (
        "field-init/ident-nonproxy",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\t#a = $state(D);\n\tget a() { return this.#a; }\n}\n",
        &["#a = $.state(D);"],
    ),
    (
        "field-init/ident-proxy",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\t#a = $state(OBJ);\n\tget a() { return this.#a; }\n}\n",
        &["#a = $.state($.proxy(OBJ));"],
    ),
    (
        "field-init/literal",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\t#a = $state(1);\n\tget a() { return this.#a; }\n}\n",
        &["#a = $.state(1);"],
    ),
    (
        "field-init/object",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\t#a = $state({ z: 1 });\n\tget a() { return this.#a; }\n}\n",
        &["#a = $.state($.proxy({ z: 1 }));"],
    ),
    (
        "method-compound/ident-nonproxy",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\t#a = $state(0);\n\tm() { this.#a += D; }\n}\n",
        &["#a = $.state(0);", "$.set(this.#a, $.get(this.#a) + D);"],
    ),
    (
        "method-compound/ident-proxy",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\t#a = $state(0);\n\tm() { this.#a += OBJ; }\n}\n",
        &["#a = $.state(0);", "$.set(this.#a, $.get(this.#a) + OBJ);"],
    ),
    (
        "method-compound/literal",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\t#a = $state(0);\n\tm() { this.#a += 1; }\n}\n",
        &["#a = $.state(0);", "$.set(this.#a, $.get(this.#a) + 1);"],
    ),
    (
        "method-compound/object",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\t#a = $state(0);\n\tm() { this.#a += { z: 1 }; }\n}\n",
        &[
            "#a = $.state(0);",
            "$.set(this.#a, $.get(this.#a) + { z: 1 });",
        ],
    ),
    (
        "method-assign/ident-nonproxy",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\t#a = $state(0);\n\tm() { this.#a = D; }\n}\n",
        &["#a = $.state(0);", "$.set(this.#a, D);"],
    ),
    (
        "method-assign/ident-proxy",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\t#a = $state(0);\n\tm() { this.#a = OBJ; }\n}\n",
        &["#a = $.state(0);", "$.set(this.#a, OBJ, true);"],
    ),
    (
        "method-assign/literal",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\t#a = $state(0);\n\tm() { this.#a = 1; }\n}\n",
        &["#a = $.state(0);", "$.set(this.#a, 1);"],
    ),
    (
        "method-assign/object",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\t#a = $state(0);\n\tm() { this.#a = { z: 1 }; }\n}\n",
        &["#a = $.state(0);", "$.set(this.#a, { z: 1 }, true);"],
    ),
    (
        "ctor-rune/ident-nonproxy",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\tconstructor() { this.a = $state(D); }\n}\n",
        &["$.set(this.#a, value, true);", "this.#a = $.state(D);"],
    ),
    (
        "ctor-rune/ident-proxy",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\tconstructor() { this.a = $state(OBJ); }\n}\n",
        &[
            "$.set(this.#a, value, true);",
            "this.#a = $.state($.proxy(OBJ));",
        ],
    ),
    (
        "ctor-rune/literal",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\tconstructor() { this.a = $state(1); }\n}\n",
        &["$.set(this.#a, value, true);", "this.#a = $.state(1);"],
    ),
    (
        "ctor-rune/object",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\tconstructor() { this.a = $state({ z: 1 }); }\n}\n",
        &[
            "$.set(this.#a, value, true);",
            "this.#a = $.state($.proxy({ z: 1 }));",
        ],
    ),
    (
        "ctor-logical/ident-nonproxy",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\t#a = $state(0);\n\tconstructor() { this.#a ||= D; }\n}\n",
        &["#a = $.state(0);", "this.#a.v || $.set(this.#a, D);"],
    ),
    (
        "ctor-logical/ident-proxy",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\t#a = $state(0);\n\tconstructor() { this.#a ||= OBJ; }\n}\n",
        &[
            "#a = $.state(0);",
            "this.#a.v || $.set(this.#a, OBJ, true);",
        ],
    ),
    (
        "ctor-logical/literal",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\t#a = $state(0);\n\tconstructor() { this.#a ||= 1; }\n}\n",
        &["#a = $.state(0);", "this.#a.v || $.set(this.#a, 1);"],
    ),
    (
        "ctor-logical/object",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\t#a = $state(0);\n\tconstructor() { this.#a ||= { z: 1 }; }\n}\n",
        &[
            "#a = $.state(0);",
            "this.#a.v || $.set(this.#a, { z: 1 }, true);",
        ],
    ),
    (
        "ctor-assign/ident-nonproxy",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\t#a = $state(0);\n\tconstructor() { this.#a = D; }\n}\n",
        &["#a = $.state(0);", "$.set(this.#a, D);"],
    ),
    (
        "ctor-assign/ident-proxy",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\t#a = $state(0);\n\tconstructor() { this.#a = OBJ; }\n}\n",
        &["#a = $.state(0);", "$.set(this.#a, OBJ, true);"],
    ),
    (
        "ctor-assign/literal",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\t#a = $state(0);\n\tconstructor() { this.#a = 1; }\n}\n",
        &["#a = $.state(0);", "$.set(this.#a, 1);"],
    ),
    (
        "ctor-assign/object",
        "const D = 5;\nconst OBJ = { a: 1 };\nexport class K {\n\t#a = $state(0);\n\tconstructor() { this.#a = { z: 1 }; }\n}\n",
        &["#a = $.state(0);", "$.set(this.#a, { z: 1 }, true);"],
    ),
];

#[test]
fn every_call_site_resolves_an_identifier_through_its_binding() {
    let mut diffs = Vec::new();
    for (name, src, expect) in CELLS {
        let got = state_lines(&emit(src));
        let want: Vec<String> = expect.iter().map(|s| s.to_string()).collect();
        if got == want {
            println!("EQ   {name}");
        } else {
            println!("DIFF {name}\n  want {want:?}\n  got  {got:?}");
            diffs.push(*name);
        }
    }
    println!("EQ {} | DIFF {}", CELLS.len() - diffs.len(), diffs.len());
    assert!(diffs.is_empty(), "diverging cells: {diffs:?}");
}
