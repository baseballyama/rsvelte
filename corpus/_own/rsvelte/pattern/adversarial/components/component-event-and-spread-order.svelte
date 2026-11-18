<script>
  import Self from "./component-event-and-spread-order.svelte";

  let { depth = 0, onaction } = $props();

  const spread = { onaction: () => {}, title: "t" };
</script>

{#if depth === 0}
  <Self depth={1} onaction={() => {}} {...spread} />
  <Self depth={1} {...spread} onaction={() => {}} />
  <Self depth={1} {...spread} {...spread} />
{:else}
  <button onclick={() => onaction?.()}>leaf</button>
{/if}
