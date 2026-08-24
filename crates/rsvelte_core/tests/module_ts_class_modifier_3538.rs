//! A class-member modifier is TypeScript, and OXC parses it in a plain-JS
//! source without reporting anything — acorn instead reads the modifier as the
//! member's *name* and throws on the token after it. So `compileModule`, whose
//! parse is always `typescript: false`, accepted `class K { private a = 1 }`
//! and copied the keyword straight into the emitted `.js`, which no JavaScript
//! parser accepts (issue #3538).
//!
//! The entry point is an axis here, not a detail: a plain `<script>` gets the
//! same `typescript: false` parse and accepted the same members. A template
//! expression is the third such entry point and is NOT fixed here — it reaches
//! this check and then re-parses itself as TypeScript when the check fails,
//! which is a defect of its own.
//!
//! Every expectation below is measured against `svelte@5.56.9`. `lang="ts"` is
//! the control that keeps this off the parser's general TypeScript support —
//! the same members must still compile there — and the legal rows are the
//! control an over-broad fix breaks: `private` is a modifier only when the next
//! token is on the SAME line and can follow one, so `private\n\ta = 1;` is two
//! ordinary fields and `private = 1;` is a field named `private`.

use rsvelte_core::{
    CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module, compiler::CssMode,
};

fn module_source(member: &str) -> String {
    format!(
        "class B {{\n\tm() {{\n\t\treturn 1;\n\t}}\n}}\n\nclass K extends B {{\n\t{member}\n}}\n\nconst r = new K().m();\n\nexport {{ r }};\n"
    )
}

fn component_source(member: &str, ts: bool) -> String {
    let lang = if ts { " lang=\"ts\"" } else { "" };
    format!(
        "<script{lang}>\nclass B {{\n\tm() {{\n\t\treturn 1;\n\t}}\n}}\n\nclass K extends B {{\n\t{member}\n}}\n\nconst r = new K().m();\n</script>\n<p>{{r}}</p>\n"
    )
}

/// `(code, start)` of the rejection, or `None` when it compiled.
fn module_error(member: &str) -> Option<(String, u32)> {
    diagnose(compile_module(
        &module_source(member),
        ModuleCompileOptions {
            filename: Some("A.svelte.ts".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    ))
}

fn component_error(member: &str, ts: bool) -> Option<(String, u32)> {
    source_error(&component_source(member, ts))
}

fn source_error(source: &str) -> Option<(String, u32)> {
    diagnose(compile(
        source,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    ))
}

fn diagnose<T>(result: Result<T, rsvelte_core::compiler::CompileError>) -> Option<(String, u32)> {
    result.err().map(|e| {
        let d = e.diagnostic();
        (d.code.unwrap_or_default(), d.span.unwrap_or_default().0)
    })
}

fn js_parse_error(at: u32) -> Option<(String, u32)> {
    Some(("js_parse_error".to_string(), at))
}

/// Every member whose TypeScript is a bare modifier keyword and which OXC
/// therefore parses silently. The offset is official's: the token that could
/// not follow the modifier acorn just read as a property name.
///
/// The plain-`<script>` offset is 9 higher throughout — `<script>\n` is that
/// much text ahead of the same class.
const MODIFIER_MEMBERS: [(&str, u32); 17] = [
    ("private a = 1;", 64),
    ("public a = 1;", 63),
    ("protected a = 1;", 66),
    ("readonly a = 1;", 65),
    ("static readonly a = 1;", 72),
    ("accessor a = 1;", 65),
    ("static accessor a = 1;", 72),
    ("override accessor a = 1;", 65),
    ("override m() {}", 65),
    ("private m() {}", 64),
    ("private constructor() {}", 64),
    ("private static a = 1;", 64),
    ("private get a() { return 1; }", 64),
    ("protected set a(v) {}", 66),
    ("private #a = 1;", 64),
    ("private ['x'] = 1;", 64),
    ("private /* c */ a = 1;", 72),
];

/// Members OXC already rejects with a diagnostic of its own, so they never
/// reach the check above and must not move. Official rejects them too, at the
/// offsets in the third column: OXC's diagnostic wins over an acorn-only
/// violation regardless of position, which is why three of the five differ.
/// That ordering predates this file and governs every TS *annotation* too.
const ALREADY_REJECTED: [(&str, u32, u32); 5] = [
    ("readonly m() {}", 56, 65),
    ("declare m(): void;", 56, 64),
    ("declare a = 1;", 68, 64),
    ("abstract m();", 66, 65),
    ("abstract a = 1;", 65, 65),
];

/// Members official's `compileModule`, a plain `<script>` and a `lang="ts"`
/// script all compile. Each one puts a modifier keyword in the source without
/// it BEING a modifier.
const LEGAL_MEMBERS: [&str; 26] = [
    "a = 1;",
    "#a = 1;",
    "static { }",
    "static m() {}",
    "async m() {}",
    "static async *m() {}",
    "['private'] = 1;",
    // ASI: a modifier cannot cross a line, so these are two ordinary fields.
    "private\n\ta = 1;",
    "public\n\ta = 1;",
    "protected\n\ta = 1;",
    "readonly\n\ta = 1;",
    "accessor\n\ta = 1;",
    "override\n\ta = 1;",
    "declare\n\ta = 1;",
    "abstract\n\ta = 1;",
    "static\n\ta = 1;",
    // A line comment ends the line the same way.
    "private // c\n\ta = 1;",
    // A member named like a modifier: the next token cannot follow one.
    "private = 1;",
    "readonly = 1;",
    "accessor = 1;",
    "override = 1;",
    "private() { return 1; }",
    "accessor() { return 1; }",
    "static private = 1;",
    "get private() { return 1; }",
    "#private = 1;",
];

#[test]
fn compile_module_rejects_a_typescript_class_member_modifier() {
    for (member, at) in MODIFIER_MEMBERS {
        assert_eq!(
            module_error(member),
            js_parse_error(at),
            "compileModule should reject `{member}` where official does"
        );
    }
}

#[test]
fn a_plain_script_rejects_it_at_the_same_offsets() {
    for (member, at) in MODIFIER_MEMBERS {
        assert_eq!(
            component_error(member, false),
            js_parse_error(at + 9),
            "a plain `<script>` should reject `{member}` where official does"
        );
    }
}

#[test]
fn a_member_oxc_already_rejects_does_not_move() {
    for (member, at, _official_at) in ALREADY_REJECTED {
        assert_eq!(
            module_error(member),
            js_parse_error(at),
            "module `{member}`"
        );
        assert_eq!(
            component_error(member, false),
            js_parse_error(at + 9),
            "plain `<script>` `{member}`"
        );
    }
}

#[test]
fn a_lang_ts_script_still_compiles_them() {
    // The subset official's `<script lang="ts">` accepts. The rest are rejected
    // there too, but by acorn-typescript's own grammar rules rather than by
    // this check, so they belong to whatever raises them.
    for member in [
        "private a = 1;",
        "public a = 1;",
        "protected a = 1;",
        "readonly a = 1;",
        "static readonly a = 1;",
        "override m() {}",
        "private m() {}",
        "private constructor() {}",
        "private static a = 1;",
        "private get a() { return 1; }",
        "protected set a(v) {}",
        "private ['x'] = 1;",
        "private /* c */ a = 1;",
    ] {
        assert_eq!(
            component_error(member, true),
            None,
            "`<script lang=\"ts\">` must keep compiling `{member}`"
        );
    }
}

#[test]
fn a_keyword_that_is_not_a_modifier_still_compiles() {
    for member in LEGAL_MEMBERS {
        for (entry, error) in [
            ("compileModule", module_error(member)),
            ("plain <script>", component_error(member, false)),
            ("<script lang=\"ts\">", component_error(member, true)),
        ] {
            assert_eq!(error, None, "{entry} must keep compiling `{member}`");
        }
    }
}
