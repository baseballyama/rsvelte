<script lang="ts">
  let count = $state(0);
  const doubled = $derived(count * 2);
</script>

<button on:click="{() => count++}">
  {doubled}
</button>

<p>{count} doubled is {doubled}</p>
