<script lang="ts">
  let count = $state(0);
  let message = $state("hello");

  $inspect(count, message); // will console.log when `count` or `message` change
</script>

<button onclick="{() => count++}">Increment</button>
<input bind:value="{message}" />
