<script>
  import Self from "./component-spread-and-event-precedence.svelte";

  let { depth = 0, a = 0, b = 0, onaction } = $props();

  const first = { a: 1, b: 1, onaction: () => {} };
  const second = { b: 2 };
</script>

{#if depth === 0}
  <Self depth={1} a={9} {...first} />
  <Self depth={1} {...first} a={9} />
  <Self depth={1} {...first} {...second} />
  <Self depth={1} {...first} b={9} {...second} />
{:else}
  <button onclick={() => onaction?.()}>{a}{b}</button>
{/if}
