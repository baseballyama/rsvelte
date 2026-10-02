<script lang="ts">
  let count = $state(0); // count: number, $state(0): 0
  let name = $state(); // name: unknown, $state(): unknown
</script>

<button on:click="{() => count++}"> <!-- count: number -->
  clicks: {count} <!-- count: number -->
</button>
