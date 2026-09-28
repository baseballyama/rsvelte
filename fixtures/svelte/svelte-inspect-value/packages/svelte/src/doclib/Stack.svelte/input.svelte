<script lang="ts">
  const { children } = $props()
</script>

<div class="stack">
  {@render children?.()}
</div>

<style>
  .stack {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 1em;
    width: 100%;
  }

  @media (min-width: 1024px) {
    .stack {
      flex-direction: row;
      flex-wrap: nowrap;
      justify-content: flex-start;
      align-items: flex-start;
    }
  }
</style>
