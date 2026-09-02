//! An insertion that lands on the script's last byte is discarded by upstream,
//! so the prop widener disappears when a declaration ends at `</script>`.
//!
//! `preprendStr` (`utils/magic-string.ts:7-17`) does not append — it
//! `overwrite`s the single character at the insertion point with
//! `text + thatCharacter`. `propTypeAssertToUserDefined` inserts
//! `;x = __sveltets_2_any(x);` at `declaration.end`, and when the declaration is
//! the last thing in the script that character is the `<` of `</script>`, which
//! the script-tag removal overwrites afterwards — taking the insertion with it.
//! One trailing byte of any kind (space, tab, comment, `;`, newline) moves the
//! insertion point off that character and the widener survives.
//!
//! The same position carries the SvelteKit `import('./$types.js')` annotation
//! when `nameEnd === end`, so that is lost too; `export const snapshot`, whose
//! annotation goes on the name rather than on the declaration end, is not.
//!
//! Every expectation is the pinned `submodules/language-tools` svelte2tsx's own
//! output on the same source, with the options
//! `scripts/compat-corpus/svelte2tsx-compile.mjs` passes.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

/// For each name, `name` if `__sveltets_2_any(name)` is emitted and `!name` if
/// not, plus `KIT` when a `./$types.js` annotation reached the output.
fn injected(src: &str, filename: &str, is_ts_file: bool, names: &[&str]) -> String {
    let code = svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: filename.to_string(),
            is_ts_file,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code;
    let mut parts: Vec<String> = names
        .iter()
        .map(|name| {
            if code.contains(&format!("__sveltets_2_any({name})")) {
                (*name).to_string()
            } else {
                format!("!{name}")
            }
        })
        .collect();
    if code.contains("import('./$types.js')") {
        parts.push("KIT".to_string());
    }
    parts.join(",")
}

#[test]
fn a_widener_at_the_script_end_is_discarded() {
    let mut failures = Vec::new();
    for (label, filename, is_ts, src, names, expected) in [
        (
            "at the script end",
            "T.svelte",
            true,
            "<script lang=\"ts\">export let answer: number</script>",
            &["answer"][..],
            "!answer",
        ),
        (
            "one trailing space",
            "T.svelte",
            true,
            "<script lang=\"ts\">export let answer: number </script>",
            &["answer"][..],
            "answer",
        ),
        (
            "one trailing tab",
            "T.svelte",
            true,
            "<script lang=\"ts\">export let answer: number\t</script>",
            &["answer"][..],
            "answer",
        ),
        (
            "trailing block comment",
            "T.svelte",
            true,
            "<script lang=\"ts\">export let answer: number/*c*/</script>",
            &["answer"][..],
            "answer",
        ),
        (
            "semicolon terminated",
            "T.svelte",
            true,
            "<script lang=\"ts\">export let answer: number;</script>",
            &["answer"][..],
            "answer",
        ),
        (
            "newline before the tag",
            "T.svelte",
            true,
            "<script lang=\"ts\">export let answer: number\n</script>",
            &["answer"][..],
            "answer",
        ),
        (
            "markup follows the script",
            "T.svelte",
            true,
            "<script lang=\"ts\">export let answer: number</script>\n<p>x</p>",
            &["answer"][..],
            "!answer",
        ),
        (
            "no type annotation",
            "T.svelte",
            true,
            "<script lang=\"ts\">export let answer</script>",
            &["answer"][..],
            "!answer",
        ),
        (
            "boolean initializer",
            "T.svelte",
            true,
            "<script lang=\"ts\">export let answer = true</script>",
            &["answer"][..],
            "!answer",
        ),
        (
            "non-boolean initializer",
            "T.svelte",
            true,
            "<script lang=\"ts\">export let answer = 1</script>",
            &["answer"][..],
            "!answer",
        ),
        (
            "second statement is last",
            "T.svelte",
            true,
            "<script lang=\"ts\">export let a: number;export let answer: number</script>",
            &["a", "answer"][..],
            "a,!answer",
        ),
        (
            "last of a comma list",
            "T.svelte",
            true,
            "<script lang=\"ts\">export let a: number, answer: number</script>",
            &["a", "answer"][..],
            "a,!answer",
        ),
        (
            "plain JS script",
            "T.svelte",
            false,
            "<script>export let answer</script>",
            &["answer"][..],
            "!answer",
        ),
        (
            "kit data, ts, at the end",
            "+page.svelte",
            true,
            "<script lang=\"ts\">export let data</script>",
            &["data"][..],
            "!data",
        ),
        (
            "kit data, ts, one space",
            "+page.svelte",
            true,
            "<script lang=\"ts\">export let data </script>",
            &["data"][..],
            "data,KIT",
        ),
        (
            "kit data, js, at the end",
            "+page.svelte",
            false,
            "<script>export let data</script>",
            &["data"][..],
            "!data",
        ),
        (
            "kit data, js, one space",
            "+page.svelte",
            false,
            "<script>export let data </script>",
            &["data"][..],
            "data,KIT",
        ),
        (
            "kit snapshot const at the end",
            "+page.svelte",
            true,
            "<script lang=\"ts\">export const snapshot = 1</script>",
            &["snapshot"][..],
            "!snapshot,KIT",
        ),
        (
            "module script, const at the end",
            "T.svelte",
            true,
            "<script context=\"module\" lang=\"ts\">export const a: number = 1</script>",
            &["a"][..],
            "!a",
        ),
    ] {
        let actual = injected(src, filename, is_ts, names);
        if actual != expected {
            failures.push(format!("{label}: expected {expected:?}, got {actual:?}"));
        }
    }
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}
