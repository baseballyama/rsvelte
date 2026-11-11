<script lang="ts">
  let 値: string = '';
  const kind = 'input';
</script>
<svelte:element this={kind} bind:value={値} />