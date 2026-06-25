//! `compile_both` must be byte-for-byte identical to two separate `compile`
//! calls (one Client, one Server). This is the correctness contract behind the
//! mold-P5 "share one parse+analyze across both transforms" optimization — it is
//! only a valid speedup if the shared analysis produces the exact same output as
//! re-analyzing per mode.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compile_both};

/// A spread of component shapes that exercise distinct analyze/transform paths:
/// runes state/derived, legacy reactive, scoped CSS, control-flow blocks,
/// snippets, event handlers with local function scopes, and await.
const SAMPLES: &[(&str, &str)] = &[
    (
        "runes-state",
        r#"<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
  function inc() { let step = 1; count += step; }
</script>
<button onclick={inc}>{count} / {doubled}</button>
<style>button { color: red; }</style>"#,
    ),
    (
        "legacy-reactive",
        r#"<script>
  let count = 0;
  $: doubled = count * 2;
  function inc() { count += 1; }
</script>
<button on:click={inc}>{count} {doubled}</button>"#,
    ),
    (
        "blocks-and-snippet",
        r#"<script>
  let items = $state([1, 2, 3]);
</script>
{#snippet row(x)}
  <li>{x}</li>
{/snippet}
{#if items.length}
  <ul>
    {#each items as item}
      {@render row(item)}
    {/each}
  </ul>
{:else}
  <p>empty</p>
{/if}"#,
    ),
    (
        "callback-scope",
        r#"<script>
  let total = $state(0);
  const handler = (e) => { const bar = e; total = bar; };
</script>
<input oninput={handler} />
{total}"#,
    ),
];

fn opts(generate: GenerateMode) -> CompileOptions {
    CompileOptions {
        generate,
        ..Default::default()
    }
}

#[test]
fn compile_both_matches_two_separate_compiles() {
    for (name, src) in SAMPLES {
        let client = compile(src, opts(GenerateMode::Client))
            .unwrap_or_else(|e| panic!("[{name}] client compile failed: {e:?}"));
        let server = compile(src, opts(GenerateMode::Server))
            .unwrap_or_else(|e| panic!("[{name}] server compile failed: {e:?}"));

        // `generate` on the passed options is ignored by compile_both.
        let (both_client, both_server) = compile_both(src, opts(GenerateMode::Client))
            .unwrap_or_else(|e| panic!("[{name}] compile_both failed: {e:?}"));

        assert_eq!(
            both_client.js.code, client.js.code,
            "[{name}] client JS mismatch between compile_both and compile"
        );
        assert_eq!(
            both_server.js.code, server.js.code,
            "[{name}] server JS mismatch between compile_both and compile"
        );
        assert_eq!(
            both_client.css.as_ref().map(|c| &c.code),
            client.css.as_ref().map(|c| &c.code),
            "[{name}] client CSS mismatch"
        );
        assert_eq!(
            both_server.css.as_ref().map(|c| &c.code),
            server.css.as_ref().map(|c| &c.code),
            "[{name}] server CSS mismatch"
        );
        assert_eq!(
            both_client.warnings.len(),
            client.warnings.len(),
            "[{name}] client warning count mismatch"
        );
        assert_eq!(
            both_server.warnings.len(),
            server.warnings.len(),
            "[{name}] server warning count mismatch"
        );
    }
}
