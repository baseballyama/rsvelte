<script lang="ts">
  const p = Promise.resolve();
</script>

{#await p}
{:then v}
{/await}
