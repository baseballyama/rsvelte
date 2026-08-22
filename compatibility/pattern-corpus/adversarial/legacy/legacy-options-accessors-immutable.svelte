<svelte:options runes={false} accessors immutable />

<script>
  export let value = 0;
  export let rows = [];

  $: doubled = value * 2;

  function bump() {
    value += 1;
    rows = [...rows, value];
  }
</script>

<b>{value}{doubled}{rows.length}</b>
<button on:click={bump}>go</button>
