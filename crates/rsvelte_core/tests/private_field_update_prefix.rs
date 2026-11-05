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
