<script>
  let items = $state([1, 2]);
  let currentChain = [];
  let binaryCondition = 1;
  let fieldDropdown = 2;
  let onSelectField = 3;
</script>

{#snippet drilldown(arg1, arg2, arg3, arg4, arg5)}
  {#each items as nested}
    {@render drilldown(
      nested,
      currentChain,
      binaryCondition,
      fieldDropdown,
      onSelectField,
    )}
  {/each}
{/snippet}

{@render drilldown(0, 1, 2, 3, 4)}