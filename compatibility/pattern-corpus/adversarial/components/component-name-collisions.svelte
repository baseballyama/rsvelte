<script>
  import Root from "./component-name-collisions.svelte";

  let { depth = 0, text = 0, node = 0 } = $props();

  const fragment = { Root };
</script>

{#if depth === 0}
  <Root depth={1} text={1} node={2} />
  <fragment.Root depth={1} text={3} node={4} />
{:else}
  <b>{text}{node}</b>
{/if}
