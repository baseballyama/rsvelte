//! A plain private field whose name starts with the name of a `$state` field
//! (`#historyGeneration` next to `history = $state(...)`) must be left alone by
//! the class transform. The `$state` field compiles to the private backing field
//! `#history`, and the text rewrites of `++this.#history` / `--this.#history`
//! used to match that name as a prefix of the longer one, emitting
//! `$.update_pre(this.#history)Generation`.

use rsvelte_core::{GenerateMode, compile_module, compiler::ModuleCompileOptions};

fn compile(src: &str, ssr: bool) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("desk.svelte.js".to_string()),
            generate: if ssr {
                GenerateMode::Server
            } else {
                GenerateMode::Client
            },
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile_module should succeed")
    .js
    .code
}

fn assert_untouched(out: &str, ctx: &str) {
    assert!(
        !out.contains("$.update_pre(this.#history)")
            && !out.contains("$.update_pre(this.#history,"),
        "{ctx}: `#historyGeneration` was rewritten as an update of the `history` state field:\n{out}"
    );
    assert!(
        !out.contains("$.get(this.#history)Generation"),
        "{ctx}: the longer private name was corrupted:\n{out}"
    );
}

#[test]
fn prefix_update_in_a_method_is_left_alone() {
    let src = "export class Desk {
	history = $state([]);
	#historyGeneration = 0;
	bump() {
		++this.#historyGeneration;
		--this.#historyGeneration;
		return ++this.#historyGeneration;
	}
	drop() {
		return --this.#historyGeneration;
	}
}
";
    for ssr in [false, true] {
        let out = compile(src, ssr);
        assert_untouched(&out, &format!("method ssr={ssr}"));
        assert!(
            out.contains("return ++this.#historyGeneration;")
                && out.contains("return --this.#historyGeneration;")
                && out.contains("\t\t++this.#historyGeneration;")
                && out.contains("\t\t--this.#historyGeneration;"),
            "method ssr={ssr}: the plain private updates must survive verbatim:\n{out}"
        );
    }
}

#[test]
fn prefix_update_statement_in_a_constructor_is_left_alone() {
    let src = "export class Desk {
	history = $state([]);
	#historyGeneration = 0;
	constructor() {
		++this.#historyGeneration;
		--this.#historyGeneration;
	}
}
";
    for ssr in [false, true] {
        let out = compile(src, ssr);
        assert_untouched(&out, &format!("constructor ssr={ssr}"));
        assert!(
            out.contains("\t\t++this.#historyGeneration;")
                && out.contains("\t\t--this.#historyGeneration;"),
            "constructor ssr={ssr}: the plain private updates must survive verbatim:\n{out}"
        );
    }
}

#[test]
fn prefix_read_in_a_constructor_derived_is_left_alone() {
    let src = "export class Desk {
	history = $state(1);
	#historyGeneration = 2;
	constructor() {
		this.total = $derived(this.#historyGeneration + this.history);
	}
}
";
    let out = compile(src, false);
    assert_untouched(&out, "constructor derived");
    assert!(
        out.contains("$.derived(() => this.#historyGeneration + this.history)"),
        "the derived must read the plain private field as written:\n{out}"
    );
}

#[test]
fn state_field_updates_still_become_update_calls() {
    let src = "export class Counter {
	count = $state(0);
	#total = $state(0);
	inc() {
		++this.#total;
		--this.#total;
		return ++this.#total;
	}
}
";
    let out = compile(src, false);
    assert!(
        out.contains("$.update_pre(this.#total)") && out.contains("$.update_pre(this.#total, -1)"),
        "updates of a real private `$state` field must still be rewritten:\n{out}"
    );
}

fn compile_component(src: &str) -> String {
    rsvelte_core::compile(
        &format!("<script>\n{src}</script>\n"),
        rsvelte_core::CompileOptions {
            filename: Some("Desk.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile should succeed")
    .js
    .code
}

/// Every line of `expected` (the official compiler's output for the same
/// input) appears, trimmed, as a line of `out`.
fn assert_lines(out: &str, expected: &[&str], ctx: &str) {
    let lines: Vec<&str> = out.lines().map(str::trim).collect();
    for want in expected {
        assert!(lines.contains(want), "{ctx}: missing `{want}` in:\n{out}");
    }
}

fn assert_lines_both_entries(src: &str, expected: &[&str]) {
    assert_lines(&compile(src, false), expected, "compileModule");
    assert_lines(
        &compile_component(&src.replacen("export ", "", 1)),
        expected,
        "component <script>",
    );
}

#[test]
fn update_text_in_strings_comments_and_templates_is_left_alone() {
    assert_lines_both_entries(
        "export class C {
	#count = $state(0);
	m() {
		const a = '++this.#count';
		const b = \"--this.#count\";
		const c = `++this.#count ${this.#count}`;
		// ++this.#count in a comment
		/* --this.#count */
		const d = 'this.#count++ this.#count--';
		++this.#count;
		return [a, b, c, d];
	}
}
",
        &[
            "const a = '++this.#count';",
            "const b = \"--this.#count\";",
            "const c = `++this.#count ${$.get(this.#count)}`;",
            "// ++this.#count in a comment",
            "/* --this.#count */",
            "const d = 'this.#count++ this.#count--';",
            "$.update_pre(this.#count);",
        ],
    );
}

#[test]
fn constructor_update_text_in_strings_and_comments_is_left_alone() {
    assert_lines_both_entries(
        "export class C {
	#count = $state(0);
	constructor(other) {
		const s = '++other.#count --other.#count';
		// ++other.#count
		++other.#count;
	}
}
",
        &[
            "const s = '++other.#count --other.#count';",
            "// ++other.#count",
            "$.update_pre(other.#count);",
        ],
    );
}

#[test]
fn non_ascii_and_dollar_continue_the_private_name() {
    assert_lines_both_entries(
        "export class C {
	#count = $state(0);
	#countÉ = 0;
	#count$ = 0;
	m() {
		++this.#countÉ;
		--this.#countÉ;
		++this.#count$;
		return this.#countÉ + this.#count$;
	}
}
",
        &[
            "++this.#countÉ;",
            "--this.#countÉ;",
            "++this.#count$;",
            "return this.#countÉ + this.#count$;",
        ],
    );
}

#[test]
fn prefix_update_of_a_member_updates_the_member() {
    assert_lines_both_entries(
        "export class C {
	#n = $state({ v: 1 });
	m() {
		++this.#n.v;
		--this.#n[0];
	}
}
",
        &["++$.get(this.#n).v;", "--$.get(this.#n)[0];"],
    );
}

#[test]
fn an_odd_operator_run_is_a_postfix_update_of_the_left_operand() {
    assert_lines_both_entries(
        "export class C {
	#count = $state(0);
	m(a) {
		const x = a+++this.#count;
		const y = a---this.#count;
		return x + y;
	}
}
",
        &[
            "const x = a++ + $.get(this.#count);",
            "const y = a-- - $.get(this.#count);",
        ],
    );
}

#[test]
fn derived_reads_in_strings_are_left_alone() {
    assert_lines_both_entries(
        "export class C {
	#count = $state(0);
	#countÉ = 1;
	d = $derived(`this.#count ${this.#count}` + this.#countÉ + 'this.#count');
}
",
        &[
            "#d = $.derived(() => `this.#count ${$.get(this.#count)}` + this.#countÉ + 'this.#count');",
        ],
    );
    assert_lines_both_entries(
        "export class C {
	#count = $state(0);
	#countX = 0;
	constructor() {
		this.d = $derived(this.#countX + this.#count + '-this.#count');
	}
}
",
        &["this.#d = $.derived(() => this.#countX + $.get(this.#count) + '-this.#count');"],
    );
}
