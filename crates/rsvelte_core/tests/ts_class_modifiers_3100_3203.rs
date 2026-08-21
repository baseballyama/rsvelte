//! TypeScript-only class-member modifiers, and the stage-3 `accessor` keyword,
//! in a PLAIN `<script>` (issues #3100 and #3203).
//!
//! Upstream parses a plain script with stock acorn and a `lang="ts"` one with
//! `@sveltejs/acorn-typescript` (`1-parse/acorn.js:9-10`); rsvelte parses both
//! with OXC and only switches `SourceType`, so every modifier below compiled
//! here and is a `js_parse_error` there — a component that builds under rsvelte
//! and fails under the official compiler.
//!
//! Each case carries a `|` at the offset acorn stops on, which is NOT the
//! member's key: acorn reads modifiers left to right, takes the first word it
//! cannot read as the member's name, and throws on whatever cannot follow a
//! name. Every marker was measured with `svelte.compile` against
//! `submodules/svelte`; the continuous comparison is the `class-modifier`
//! matrix family, which runs both compilers on the same product of axes.

use rsvelte_core::{
    CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module, compiler::CssMode,
};

fn component_error(src: &str) -> Option<String> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .err()
    .map(|e| format!("{e:?}"))
}

fn module_error(src: &str) -> Option<String> {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("m.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .err()
    .map(|e| format!("{e:?}"))
}

/// The three entry points a class body can reach: an instance script, a module
/// script, and `compileModule`, which parses plain JS whatever the extension.
const HOSTS: &[(&str, fn(&str) -> String, fn(&str) -> Option<String>)] = &[
    ("js-instance", instance, component_error),
    ("js-module", module_script, component_error),
    ("module-js", svelte_js, module_error),
];

fn instance(member: &str) -> String {
    format!(
        "<script>\n\tclass C {{\n\t\t{member}\n\t}}\n\tconst s = C;\n</script>\n\n<p>{{s ? 'ok' : ''}}</p>\n"
    )
}

fn module_script(member: &str) -> String {
    format!(
        "<script module>\n\tclass C {{\n\t\t{member}\n\t}}\n\texport const s = C;\n</script>\n\n<p>{{s ? 'ok' : ''}}</p>\n"
    )
}

fn svelte_js(member: &str) -> String {
    format!("class C {{\n\t{member}\n}}\n\nexport const s = C;\n")
}

/// `|` marks where acorn stops. The orderings are the point: the modifier acorn
/// cannot read is not always the last one, so the reported token is a later
/// modifier (`private |static`), a getter keyword (`private |get`), a `*`, an
/// `async`, a computed key's `[` or a `#` as often as it is the key itself.
const STOPS: &[&str] = &[
    "accessor |a = 1;",
    "static accessor |a = 1;",
    "accessor |#a = 1;",
    "accessor |[1] = 1;",
    "private |a = 1;",
    "public |a = 1;",
    "protected |a = 1;",
    "readonly |a = 1;",
    "declare |a;",
    "abstract |a;",
    "private |m() {}",
    "override |m() {}",
    "static override |m() {}",
    "private |get a() { return 1; }",
    "private |static a = 1;",
    "public |static readonly a = 1;",
    "private |['a'] = 1;",
    "private |#a = 1;",
    "private |*g() {}",
    "private |async m() {}",
    "private /* c */ |a = 1;",
];

#[test]
fn a_typescript_class_modifier_in_a_plain_script_stops_where_acorn_stops() {
    for marked in STOPS {
        let member = marked.replace('|', "");
        for (host, wrap, compile_error) in HOSTS {
            let at = wrap(marked)
                .find('|')
                .expect("the marker survives wrapping");
            let src = wrap(&member);
            let err = compile_error(&src)
                .unwrap_or_else(|| panic!("{marked:?} must not compile in {host}"));
            assert!(
                err.contains("js_parse_error"),
                "expected js_parse_error for {marked:?} in {host}, got: {err}"
            );
            assert!(
                err.contains("\"Unexpected token\""),
                "expected acorn's wording for {marked:?} in {host}, got: {err}"
            );
            assert!(
                err.contains(&format!("span: ({at}, {at})")),
                "expected the error at {at} for {marked:?} in {host}, got: {err}"
            );
        }
    }
}

/// Modifier ORDER and combination rules OXC applies on its own, before the scan
/// above can run. Both compilers refuse all four; `static private` and
/// `readonly static` agree with upstream down to the message, `accessor static`
/// agrees on the position only, and `declare accessor` on neither — OXC's
/// modifier table and acorn-typescript's are not the same table.
const REJECTED_ELSEWHERE: &[&str] = &[
    "static private a = 1;",
    "readonly static a = 1;",
    "accessor static a = 1;",
    "declare accessor a;",
];

#[test]
fn a_modifier_combination_oxc_refuses_is_still_a_parse_error() {
    for member in REJECTED_ELSEWHERE {
        for (host, wrap, compile_error) in HOSTS {
            let err = compile_error(&wrap(member))
                .unwrap_or_else(|| panic!("{member:?} must not compile in {host}"));
            assert!(
                err.contains("js_parse_error"),
                "expected js_parse_error for {member:?} in {host}, got: {err}"
            );
        }
    }
}

/// The over-rejection direction. Each of these spells a modifier keyword in a
/// position where it is an ordinary name, or is legal JS on its own — a check
/// that keys on the keyword's text rather than on the parsed member fails here.
const ACCEPTED: &[&str] = &[
    "a = 1;",
    "static a = 1;",
    "#a = 1;",
    "static { this.a = 1; }",
    "accessor = 1;",
    "accessor\n\t\ta = 1;",
    "private() {}",
    "get private() { return 1; }",
    "static readonly = 1;",
    "declare = 1;",
    "override = 1;",
    "abstract = 1;",
];

#[test]
fn a_modifier_keyword_used_as_a_name_still_compiles() {
    for member in ACCEPTED {
        for (host, wrap, compile_error) in HOSTS {
            assert!(
                compile_error(&wrap(member)).is_none(),
                "{member:?} must compile in {host}"
            );
        }
    }
}

// ── the `lang="ts"` control ────────────────────────────────────────────────

fn ts_instance(member: &str) -> String {
    format!(
        "<script lang=\"ts\">\n\tclass C {{\n\t\t{member}\n\t}}\n\tconst s = C;\n</script>\n\n<p>{{s ? 'ok' : ''}}</p>\n"
    )
}

/// Nothing above may narrow the TypeScript grammar: these are the same
/// modifiers, and acorn-typescript reads every one of them.
#[test]
fn the_same_modifiers_compile_in_a_typescript_script() {
    for member in [
        "private a = 1;",
        "public a = 1;",
        "protected a = 1;",
        "readonly a = 1;",
        "declare a: number;",
        "private m() {}",
        "private get a() { return 1; }",
        "private static a = 1;",
        "public static readonly a = 1;",
        "private ['a'] = 1;",
        "private *g() {}",
        "private async m() {}",
        "private /* c */ a = 1;",
        "private readonly a = 1;",
    ] {
        assert!(
            component_error(&ts_instance(member)).is_none(),
            "{member:?} must compile in a lang=\"ts\" script"
        );
    }
}

/// Two class-member rules acorn-typescript enforces in the PARSER while
/// TypeScript leaves them to the checker, so OXC never reports them and rsvelte
/// accepted what upstream refuses. Both are per-class and both report at the
/// member's first modifier.
#[test]
fn acorn_typescript_member_rules_are_enforced_in_a_typescript_script() {
    const ABSTRACT: &str = "Abstract methods can only appear within an abstract class.";
    const OVERRIDE: &str = "This member cannot have an 'override' modifier because its containing class does not extend another class.";

    for (member, message) in [
        ("abstract a;", ABSTRACT),
        ("abstract a: number;", ABSTRACT),
        ("abstract m(): void;", ABSTRACT),
        ("protected abstract a: number;", ABSTRACT),
        ("override m() {}", OVERRIDE),
        ("static override m() {}", OVERRIDE),
        ("protected override m() {}", OVERRIDE),
        ("override a = 1;", OVERRIDE),
    ] {
        let src = ts_instance(member);
        let err = component_error(&src).unwrap_or_else(|| panic!("{member:?} must not compile"));
        assert!(
            err.contains("js_parse_error"),
            "expected js_parse_error for {member:?}, got: {err}"
        );
        assert!(
            err.contains(message),
            "expected acorn-typescript's wording for {member:?}, got: {err}"
        );
        let at = src.find(member).expect("the member is in the source");
        assert!(
            err.contains(&format!("span: ({at}, {at})")),
            "expected the error at the member start ({at}) for {member:?}, got: {err}"
        );
    }
}

/// The other half of the same two rules: an `abstract class` and a subclass make
/// both legal, and the guards are per-class — a nested class does not inherit
/// either one.
#[test]
fn abstract_and_override_are_legal_where_acorn_typescript_allows_them() {
    for src in [
        "abstract class C {\n\t\tabstract a: number;\n\t\tabstract m(): void;\n\t}\n\tconst s = C;",
        "class B {\n\t\tm() {}\n\t}\n\tclass C extends B {\n\t\toverride m() {}\n\t}\n\tconst s = C;",
    ] {
        let wrapped =
            format!("<script lang=\"ts\">\n\t{src}\n</script>\n\n<p>{{s ? 'ok' : ''}}</p>\n");
        assert!(
            component_error(&wrapped).is_none(),
            "{src:?} must compile in a lang=\"ts\" script"
        );
    }

    // `inAbstractClass` / `constructorAllowsSuper` are saved and restored around
    // every class, so an inner class is judged on its own header.
    for (src, message) in [
        (
            "abstract class C {\n\t\tm() {\n\t\t\tclass D {\n\t\t\t\tabstract q: number;\n\t\t\t}\n\t\t\treturn D;\n\t\t}\n\t}\n\tconst s = C;",
            "Abstract methods can only appear within an abstract class.",
        ),
        (
            "class B {\n\t\tm() {}\n\t}\n\tclass C extends B {\n\t\tm() {\n\t\t\tclass D {\n\t\t\t\toverride q() {}\n\t\t\t}\n\t\t\treturn D;\n\t\t}\n\t}\n\tconst s = C;",
            "This member cannot have an 'override' modifier because its containing class does not extend another class.",
        ),
    ] {
        let wrapped =
            format!("<script lang=\"ts\">\n\t{src}\n</script>\n\n<p>{{s ? 'ok' : ''}}</p>\n");
        let err = component_error(&wrapped).unwrap_or_else(|| panic!("{src:?} must not compile"));
        assert!(
            err.contains(message),
            "expected the inner class to be judged on its own header, got: {err}"
        );
    }
}
