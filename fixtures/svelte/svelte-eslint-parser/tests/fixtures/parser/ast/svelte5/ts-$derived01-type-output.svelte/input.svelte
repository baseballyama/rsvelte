<script lang="ts">
  let count = $state(0); // count: number, $state(0): 0
  const doubled = $derived(count * 2); // doubled: number, $derived(count * 2): number
</script>

<button on:click="{() => count++}"> <!-- count: number -->
  {doubled} <!-- doubled: number -->
</button>

<p>{count} doubled is {doubled}</p> <!-- count: number, doubled: number -->
