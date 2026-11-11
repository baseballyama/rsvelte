<script>
  /* eslint svelte/consistent-selector-style: ["warn", { "style": ["id", "class"] }] */
</script>

{#snippet chip()}
  <mark class="chip">chip</mark>
{/snippet}
{@render chip()}
{@render chip()}

<style>
  .chip {
    color: red;
  }
</style>
