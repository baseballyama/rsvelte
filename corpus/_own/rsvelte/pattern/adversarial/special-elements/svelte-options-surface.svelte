<svelte:options namespace="html" preserveWhitespace={false} css="injected" />

<script>
  let n = $state(0);
</script>

<div>spaced text {n}</div>
<button onclick={() => (n += 1)}>go</button>

<style>
  div {
    white-space: pre;
  }
</style>
