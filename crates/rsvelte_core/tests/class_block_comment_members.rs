//! A class body is split into member blocks line by line, and a `/* … */`
//! spanning several lines was one member per line. Its opening `/**` then
//! joined the block above, so the AST assignment pass could not parse that
//! block and every rewrite it owns — here the `??=` lowering of a private
//! `$state.raw` field — was silently skipped, emitting text no JS parser
//! accepts. Reproduced from sveltekit's `remote-functions/query/instance`.

use rsvelte_core::{GenerateMode, ModuleCompileOptions, compile_module};

fn module(src: &str) -> String {
    module_for(src, GenerateMode::Client)
}

fn module_for(src: &str, generate: GenerateMode) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("T.svelte.js".into()),
            generate,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

const BODY: &str = "\t#promise = $state.raw(null);\n\n\t#run() {\n\t\treturn Promise.resolve();\n\t}\n\n\t#get_promise() {\n\t\tvoid (this.#promise ??= this.#run());\n\t\treturn this.#promise;\n\t}\n";

#[test]
fn a_multiline_block_comment_does_not_split_the_class_member_before_it() {
    // The comment is placed *after* the `??=` method: only then does its
    // opening line land on the block that carries the assignment.
    let out = module(&format!(
        "export class Q {{\n{BODY}\n\t/**\n\t * text\n\t */\n\tzzz() {{}}\n}}\n"
    ));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("$.get(this.#promise) ?? $.set(this.#promise, this.#run())"),
        "{out}"
    );
    assert!(!out.contains("??="), "{out}");
}

/// The control: with the comment *before* the method the split was harmless,
/// so this shape has always been lowered and must stay lowered.
#[test]
fn a_block_comment_before_the_member_keeps_lowering_the_assignment() {
    let out = module(&format!(
        "export class Q {{\n\t/**\n\t * text\n\t */\n{BODY}}}\n"
    ));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("$.get(this.#promise) ?? $.set(this.#promise, this.#run())"),
        "{out}"
    );
}

/// A template literal's interior lines are not members either, and here the
/// split is not a parse failure but a *value* change: the member blocks are
/// re-emitted with esrap's margins, so a blank line landed inside the string.
#[test]
fn a_multiline_template_literal_keeps_its_own_line_breaks() {
    let out = module(&format!(
        "export class Q {{\n{BODY}\n\tmsg = `a ${{ 1 }} b\nc ${{ 2 }} d`;\n}}\n"
    ));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("`a ${1} b\nc ${2} d`"), "{out}");
}

/// The server splits the same class body with its own line loop, so the client
/// fix left this half untouched: it emitted the continuation line as a member of
/// its own and the emitter's `\t\t` prefix landed inside the string.
#[test]
fn the_server_keeps_a_multiline_template_literal_too() {
    let out = module_for(
        &format!("export class Q {{\n{BODY}\n\tmsg = `a ${{ 1 }} b\nc ${{ 2 }} d`;\n}}\n"),
        GenerateMode::Server,
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("`a ${1} b\nc ${2} d`"), "{out}");
}

/// A template nested in another template's `${}` closes two literals on one
/// line, which is what separates reading the predicate from counting backticks.
#[test]
fn the_server_keeps_a_nested_multiline_template_literal() {
    let out = module_for(
        &format!(
            "export class Q {{\n{BODY}\n\ttpl = `outer ${{ `inner\nstill inner` }} end`;\n}}\n"
        ),
        GenerateMode::Server,
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("`inner\nstill inner`"), "{out}");
}

/// The over-reach direction. A bracketed initializer spanning lines is code, so
/// its continuation lines must keep going through the existing accumulator and
/// come back re-indented; a block comment likewise stays one comment member.
#[test]
fn the_server_still_reindents_a_multiline_code_initializer() {
    let out = module_for(
        &format!("export class Q {{\n{BODY}\n\tcfg = build({{\n\t\ta: 1\n\t}});\n}}\n"),
        GenerateMode::Server,
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("cfg = build({"), "{out}");
    let out = module_for(
        &format!("export class Q {{\n{BODY}\n\t/**\n\t * text\n\t */\n\tzzz() {{}}\n}}\n"),
        GenerateMode::Server,
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains(" * text"), "{out}");
}
