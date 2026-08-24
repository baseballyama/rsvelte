//! `{#each …}`'s key expression is visited INSIDE the each scope upstream
//! (`scope.js`'s `EachBlock`: `if (node.key) visit(node.key, { scope })`), so a
//! write to the item there is a write through to the collection and promotes it
//! to reactive state. rsvelte visited the key with the each bindings out of
//! scope, so the write reached nothing.
//!
//! The two write forms are separate rows because only one of them was live: the
//! `AssignmentExpression` form already produced the right output, and the
//! `UpdateExpression` form did not. A single-repro check would have read the
//! issue as fixed.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .expect("compiles")
}

const UPDATE: &str =
    "<script>\n\tlet arr = [1];\n\tvoid arr;\n</script>\n{#each arr as v, i (v++)}{i}{/each}\n";
const ASSIGN: &str = "<script>\n\tlet arr = [{ id: 1 }];\n\tvoid arr;\n</script>\n{#each arr as v, i (v = 1)}{i}{/each}\n";

/// `v` is the each item, so `v++` in the key writes through to `arr` and
/// official emits `$.mutable_source` for it.
#[test]
fn an_update_in_the_key_expression_promotes_the_collection() {
    let out = client(UPDATE);
    assert!(out.contains("let arr = $.mutable_source([1]);"), "{out}");
    assert!(out.contains("void $.get(arr);"), "{out}");
    assert!(out.contains("() => $.get(arr)"), "{out}");
}

/// The assignment form, which already worked — kept so the fix is not narrowed
/// back to the update form alone.
#[test]
fn an_assignment_in_the_key_expression_promotes_the_collection() {
    let out = client(ASSIGN);
    assert!(
        out.contains("let arr = $.mutable_source([{ id: 1 }]);"),
        "{out}"
    );
    assert!(out.contains("void $.get(arr);"), "{out}");
}

/// The control: a key that only READS must not promote anything, or the fix
/// would be "mark the collection mutated whenever there is a key".
#[test]
fn a_key_that_only_reads_promotes_nothing() {
    let src = "<script>\n\tlet arr = [{ id: 1 }];\n\tvoid arr;\n</script>\n{#each arr as v, i (v.id)}{i}{/each}\n";
    let out = client(src);
    assert!(out.contains("let arr = [{ id: 1 }];"), "{out}");
    assert!(!out.contains("$.mutable_source"), "{out}");
}
