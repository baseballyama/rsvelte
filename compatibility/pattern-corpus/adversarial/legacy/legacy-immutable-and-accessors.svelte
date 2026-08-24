<svelte:options runes={false} immutable accessors />

<script>
  export let rows = [];
  export let label = "l";

  let internal = 0;

  $: count = rows.length;
  $: if (count > 0) internal = count;

  function replace() {
    rows = [...rows, count];
  }
</script>

<button on:click={replace}>{label}</button>
<b>{count}{internal}</b>
