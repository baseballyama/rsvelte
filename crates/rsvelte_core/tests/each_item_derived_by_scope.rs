use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn try_compile(src: &str) -> Result<(), String> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .map(|_| ())
    .map_err(|e| format!("{e:?}"))
}

/// Regression for #1224: a `for`-loop variable inside a `$derived.by` callback
/// that shares its name with an `{#each}` item must NOT trip the runes-mode
/// `each_item_invalid_assignment` validation. Official svelte@5.56.3 compiles
/// this cleanly.
#[test]
fn each_item_shadowed_by_for_loop_in_derived_by() {
    let src = r#"<script>
  let { rows } = $props();

  const grid = $derived.by(() => {
    const result = [];
    for (let day = 1; day <= 31; day++) {
      day = day + 1;
      result.push(day);
    }
    return result;
  });
</script>

{#each rows as day}
  <span>{day}</span>
{/each}
"#;
    assert!(
        try_compile(src).is_ok(),
        "should compile cleanly: {:?}",
        try_compile(src)
    );
}

/// Same shape but with a plain function declaration in the instance script.
#[test]
fn each_item_shadowed_by_for_loop_in_function() {
    let src = r#"<script>
  let { rows } = $props();
  function build() {
    for (let day = 0; day < 10; day++) {
      day = day + 2;
    }
  }
</script>
{#each rows as day}<span>{day}</span>{/each}
"#;
    assert!(try_compile(src).is_ok(), "{:?}", try_compile(src));
}

/// Guard must NOT suppress the real error: directly reassigning an each item in
/// runes mode is still invalid.
#[test]
fn real_each_item_reassignment_still_errors() {
    let src = r#"<script>
  let { rows } = $props();
</script>
{#each rows as day}
  <button onclick={() => day = day + 1}>{day}</button>
{/each}
"#;
    let err = try_compile(src).expect_err("each-item reassignment must still error");
    assert!(
        err.contains("each_item_invalid_assignment"),
        "expected each_item_invalid_assignment, got: {err}"
    );
}

/// The three official `compiler-errors` fixtures that must keep erroring:
/// `bind:value` on an each item, a `+=` mutation of an each item inside a
/// handler, and `bind:this` on a destructured each item.
#[test]
fn official_each_item_error_fixtures_still_error() {
    let bind_value = r#"<script>
	let arr = $state([1,2,3]);
</script>

{#each arr as value}
	<input bind:value>
{/each}
"#;
    let mutation = r#"<script>
	let arr = $state([1,2,3]);
</script>

{#each arr as value}
	<button onclick={() => value += 1}>click</button>
{/each}
"#;
    let bind_this = r#"<script lang="ts">
	let array: Array<{ id: number; element: HTMLElement | null }> = $state([
		{ id: 1, element: null }
	]);
</script>

{#each array as { id, element } (id)}
	<input bind:this={element} />
{/each}
"#;
    for (name, src) in [
        ("bind:value", bind_value),
        ("mutation", mutation),
        ("bind:this destructured", bind_this),
    ] {
        let err = try_compile(src)
            .err()
            .unwrap_or_else(|| panic!("{name}: expected each_item_invalid_assignment"));
        assert!(
            err.contains("each_item_invalid_assignment"),
            "{name}: expected each_item_invalid_assignment, got: {err}"
        );
    }
}
