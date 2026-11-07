<script lang="ts">
  let count = $state(0);
  let name = $state();
</script>

<button on:click="{() => count++}">
  clicks: {count}
</button>
