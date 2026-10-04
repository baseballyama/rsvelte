<script>
  let key = $state(0);
  let value = $state('first');
</script>

<button onclick={() => key++}>reset</button>
{#key key}
  <input value={value} />
  <span>{key}</span>
{/key}
