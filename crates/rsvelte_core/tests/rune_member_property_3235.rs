//! Issue #3235: a rune's name used as a member property or as a method name is
//! not the rune. `o.$derived(1)` is a call on an object that happens to have a
//! `$derived` key, and `class C { $derived(v) {} }` declares a method — upstream
//! confuses neither, because `get_rune` walks the callee node.
//!
//! Both directions are asserted: the shapes that must be left alone, and the
//! shapes in the same lexical neighbourhood that must still lower.

use rsvelte_core::{CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module};

fn module(src: &str, generate: GenerateMode) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("m.svelte.js".into()),
            generate,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

fn component(src: &str, generate: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

/// Every shape the issue reports, in a module and in an instance script, for
/// both targets. The property call has to survive verbatim.
#[test]
fn a_rune_name_after_a_member_access_is_left_alone() {
    for (decl, call) in [
        ("$derived: (v) => v", "o.$derived(1)"),
        ("$state: (v) => v", "o.$state(1)"),
        ("$effect: (f) => f", "o.$effect(() => {})"),
        ("$inspect: (v) => v", "o.$inspect(1)"),
        ("$derived: (v) => v", "o?.$derived(1)"),
        ("$derived: (v) => v", "o\n\t.$derived(1)"),
    ] {
        let body = format!("const o = {{ {decl} }};\nexport const a = {call};");
        let expected = call.replace("\n\t", "");
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let out = module(&body, generate);
            assert!(
                out.contains(&expected),
                "module {call}: property call was rewritten:\n{out}"
            );
        }

        let component_src = format!(
            "<script>\n\tconst o = {{ {decl} }};\n\tconst a = {call};\n</script>\n<b>{{a}}</b>\n"
        );
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let out = component(&component_src, generate);
            assert!(
                out.contains(&expected),
                "instance {call}: property call was rewritten:\n{out}"
            );
        }
    }
}

/// A member whose NAME is a rune is a declaration, not a call. Before the fix
/// the declaration itself was rewritten (`$.derived(() => v) { return v; }`),
/// which no JS parser accepts.
#[test]
fn a_method_named_like_a_rune_keeps_its_declaration() {
    for rune in ["$derived", "$state", "$effect", "$inspect"] {
        let body = format!(
            "class C {{\n\t{rune}(v) {{ return v; }}\n\tm() {{ return this.{rune}(1); }}\n}}\nexport const a = new C().m();"
        );
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let out = module(&body, generate);
            assert!(
                out.contains(&format!("{rune}(v)")),
                "{rune}: the method declaration was rewritten:\n{out}"
            );
            assert!(
                out.contains(&format!("this.{rune}(1)")),
                "{rune}: the method call was rewritten:\n{out}"
            );
        }
    }

    let out = module(
        "const o = {\n\t$derived(v) { return v; }\n};\nexport const a = o.$derived(1);",
        GenerateMode::Client,
    );
    assert!(
        out.contains("$derived(v)"),
        "object method rewritten:\n{out}"
    );
}

/// A rune name that only *ends* an identifier is that identifier.
#[test]
fn a_rune_name_at_the_tail_of_an_identifier_is_left_alone() {
    let out = module(
        "const x$derived = (v) => v;\nexport const a = x$derived(1);",
        GenerateMode::Client,
    );
    assert!(
        out.contains("x$derived(1)"),
        "identifier tail was rewritten:\n{out}"
    );
}

/// The other direction: none of the above may stop a real rune from lowering,
/// including one that follows a property call of the same name.
#[test]
fn a_real_rune_still_lowers_next_to_a_property_of_the_same_name() {
    let out = module(
        "const o = { $state: (v) => v };\nconst ignored = o.$state(1);\nlet a = $state(2);\nexport function bump() { a += 1; }",
        GenerateMode::Client,
    );
    assert!(out.contains("o.$state(1)"), "property rewritten:\n{out}");
    assert!(
        out.contains("$.state(2)"),
        "the real rune after a property did not lower:\n{out}"
    );
}

/// A spread's operand is preceded by a `.` too, and it is an expression.
#[test]
fn a_spread_operand_still_lowers() {
    let out = module(
        "export let a = [...$state([1])];\nexport function bump() { a = []; }",
        GenerateMode::Client,
    );
    assert!(
        !out.contains("...$state("),
        "the spread operand did not lower:\n{out}"
    );
}
