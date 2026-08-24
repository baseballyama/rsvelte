//! A `{@const}` at an invalid placement whose name collides with a script
//! declaration must report the PLACEMENT error, not the collision (issue #3375).
//!
//! The cause is not check ordering: upstream builds the root fragment with
//! `create_fragment()` and gives every `Fragment` a `scope.child(...)`, so a
//! top-level `{@const}` declares one level BELOW the instance script. rsvelte
//! declared it INTO the instance script's scope, so the duplicate fired first.
//! `<div>` already agreed because `visit_element` already pushed a scope.
//!
//! Every expected code and offset here is the official compiler's own output.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_err(src: &str) -> Option<String> {
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

#[track_caller]
fn assert_code(src: &str, code: &str) {
    let err =
        compile_err(src).unwrap_or_else(|| panic!("expected {code}, but it compiled:\n{src}"));
    assert!(
        err.contains(code),
        "expected {code}, got: {err}\nsource:\n{src}"
    );
}

#[track_caller]
fn assert_compiles(src: &str) {
    if let Some(err) = compile_err(src) {
        panic!("expected this to compile, got: {err}\nsource:\n{src}");
    }
}

/// `let nm = 1;` in the instance script — the collision partner in every case
/// below. 32 bytes, so the `{@const}` that follows starts at 32 at the root.
const LET_NM: &str = "<script>\n\tlet nm = 1;\n</script>\n";

#[test]
fn a_root_const_colliding_with_an_instance_let_reports_the_placement() {
    assert_code(
        &format!("{LET_NM}{{@const nm = 1}}\n"),
        "const_tag_invalid_placement",
    );
}

#[test]
fn a_head_const_colliding_with_an_instance_let_reports_the_placement() {
    assert_code(
        &format!("{LET_NM}<svelte:head>{{@const nm = 1}}</svelte:head>\n"),
        "const_tag_invalid_placement",
    );
}

/// `<svelte:body>` and its siblings raise a different code from `<svelte:head>`
/// — the issue only listed the head, and the two hosts are not interchangeable.
#[test]
fn a_body_const_colliding_with_an_instance_let_reports_the_meta_content_error() {
    assert_code(
        &format!("{LET_NM}<svelte:body>{{@const nm = 1}}</svelte:body>\n"),
        "svelte_meta_invalid_content",
    );
}

#[test]
fn a_window_const_colliding_with_an_instance_let_reports_the_meta_content_error() {
    assert_code(
        &format!("{LET_NM}<svelte:window>{{@const nm = 1}}</svelte:window>\n"),
        "svelte_meta_invalid_content",
    );
}

#[test]
fn a_document_const_colliding_with_an_instance_let_reports_the_meta_content_error() {
    assert_code(
        &format!("{LET_NM}<svelte:document>{{@const nm = 1}}</svelte:document>\n"),
        "svelte_meta_invalid_content",
    );
}

/// The collision partner does not have to be a `let`: an `import`, a
/// module-script `const` and a `function` all reached the same wrong code.
#[test]
fn the_placement_wins_over_every_collision_kind() {
    for decl in [
        "<script>\n\timport nm from './nm.js';\n</script>\n",
        "<script module>\n\texport const nm = 1;\n</script>\n",
        "<script>\n\tfunction nm() {}\n</script>\n",
        "<script>\n\texport let nm;\n</script>\n",
        "<script>\n\tlet nm = $state([1]);\n</script>\n",
    ] {
        assert_code(
            &format!("{decl}{{@const nm = 1}}\n"),
            "const_tag_invalid_placement",
        );
    }
}

// ---------------------------------------------------------------------------
// Negative controls
// ---------------------------------------------------------------------------

/// Two `{@const}`s of one name AT the root share the root fragment's scope, so
/// they must still collide. Fails if the scope exists without `Scope.declare`'s
/// own duplicate test.
#[test]
fn two_root_consts_of_one_name_still_collide() {
    assert_code("{@const q = 1}{@const q = 2}\n", "declaration_duplicate");
}

/// A top-level snippet's name is checked against the INSTANCE script's
/// declarations (upstream `SnippetBlock.js:32`) — its own scope does not hold
/// them, so without that half this error would not fire at all.
#[test]
fn a_top_level_snippet_still_collides_with_an_instance_let() {
    assert_code(
        "<script>\n\tlet row = 1;\n</script>\n{#snippet row()}<b>x</b>{/snippet}\n",
        "declaration_duplicate",
    );
}

#[test]
fn a_top_level_snippet_still_collides_with_an_instance_function() {
    assert_code(
        "<script>\n\tfunction row() {}\n</script>\n{#snippet row()}<b>x</b>{/snippet}\n{@render row()}\n",
        "declaration_duplicate",
    );
}

#[test]
fn a_top_level_declaration_tag_collides_with_an_instance_let() {
    assert_code(
        "<script>\n\tlet foo = 'bar';\n</script>\n\n{let foo = 'baz'}\n",
        "declaration_duplicate",
    );
}

/// A module-script declaration is NOT in `instance.scope.declarations`, which is
/// the only set upstream's top-level snippet check consults.
#[test]
fn a_top_level_snippet_may_shadow_a_module_script_const() {
    assert_compiles(
        "<script module>\n\texport const row = 1;\n</script>\n{#snippet row()}<b>b</b>{/snippet}\n{@render row()}\n",
    );
}

/// Two top-level snippets of one name are a plain same-scope duplicate.
#[test]
fn two_top_level_snippets_of_one_name_still_collide() {
    assert_code(
        "{#snippet s()}<b>1</b>{/snippet}\n{#snippet s()}<b>2</b>{/snippet}\n",
        "declaration_duplicate",
    );
}

/// The issue's own sharpest control: `<div>` took a different path and already
/// agreed, so it must not move.
#[test]
fn a_div_const_with_a_collision_is_unchanged() {
    assert_code(
        &format!("{LET_NM}<div>{{@const nm = 1}}</div>\n"),
        "const_tag_invalid_placement",
    );
}

/// No collision at all — the placement error was already right here, and the
/// scope must not turn it into something else.
#[test]
fn a_root_const_without_a_collision_is_unchanged() {
    assert_code(
        "{@const fresh = 1}\n<p>{fresh}</p>\n",
        "const_tag_invalid_placement",
    );
}

/// `<title>` may hold only text and expression tags, so no declaration can ever
/// reach a title scope — it is deliberately NOT materialised, and this pins the
/// error that fires instead.
#[test]
fn a_title_const_still_reports_the_title_content_error() {
    assert_code(
        &format!("{LET_NM}<svelte:head><title>{{@const nm = 1}}{{'t'}}</title></svelte:head>\n"),
        "title_invalid_content",
    );
}

/// A legal placement with a collision must keep compiling: the `{#if}` fragment
/// has always had its own scope and the root fragment's must not shadow it.
#[test]
fn a_legal_const_shadowing_an_instance_let_still_compiles() {
    assert_compiles(&format!(
        "{LET_NM}{{#if nm}}{{@const nm = 2}}<p>{{nm}}</p>{{/if}}\n"
    ));
}

/// `<svelte:head>` now enters its own scope on the server path; a root-level
/// snippet rendered from inside it must still resolve.
#[test]
fn a_head_may_render_a_root_level_snippet() {
    assert_compiles(
        "{#snippet s()}<meta name=\"a\" content=\"b\" />{/snippet}\n<svelte:head>{@render s()}</svelte:head>\n",
    );
}

/// A top-level snippet's binding lives below the instance scope, so `$name`
/// against it is a scoped subscription — which is what upstream rejects here.
#[test]
fn a_store_subscription_on_a_top_level_snippet_name_is_rejected() {
    assert_code(
        "<script>\n\tlet n = 0;\n</script>\n{#snippet count()}<b>{n}</b>{/snippet}\n<p>{$count}</p>\n",
        "store_invalid_scoped_subscription",
    );
}
