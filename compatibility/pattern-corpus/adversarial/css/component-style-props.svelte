<script>
  import Self from "./component-style-props.svelte";

  let { depth = 0 } = $props();

  let size = $state(4);
</script>

{#if depth === 0}
  <Self depth={1} --gap="8px" --color="red" />
  <Self depth={1} --gap="{size}px" />
  <Self depth={1} --gap={`${size}px`} style="display: block" />
{:else}
  <div class="inner">a</div>
{/if}

<style>
  .inner {
    gap: var(--gap);
    color: var(--color, blue);
  }
</style>
