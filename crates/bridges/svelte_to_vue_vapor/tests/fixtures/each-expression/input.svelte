<script>
  let count = $state(2);
  function items() { return Array.from({length: count}, (_, index) => index); }
</script>
<button onclick={() => count = count === 0 ? 3 : count - 1}>change</button>
{#each items() as item}<p>{item}</p>{:else}<p>empty</p>{/each}
{#each items()}<i>repeat</i>{/each}
