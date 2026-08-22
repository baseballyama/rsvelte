<script>
  import Self from "./component-callback-props.svelte";

  let {
    depth = 0,
    onclick,
    onSelect,
    on_snake,
    onchange = () => {},
    handlers = {},
  } = $props();

  let n = $state(0);

  function bump() {
    n += 1;
  }
</script>

{#if depth === 0}
  <Self
    depth={1}
    onclick={bump}
    onSelect={bump}
    on_snake={bump}
    onchange={() => bump()}
    handlers={{ extra: bump }}
  />
  <b>{n}</b>
{:else}
  <button {onclick}>a</button>
  <button onclick={() => onSelect?.()}>b</button>
  <button onclick={on_snake}>c</button>
  <button onclick={onchange}>d</button>
  <button onclick={handlers.extra}>e</button>
{/if}
