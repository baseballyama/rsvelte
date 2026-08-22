<svelte:options runes={false} />

<script>
  export let value = 0;
  export let table = { count: 0 };

  let mirror = 0;

  $: value = Math.max(value, 0);
  $: table.count = value + 1;
  $: mirror = value * 2;
  $: if (value > 5) {
    value = 5;
  }

  function bump() {
    value += 1;
    table = { ...table, count: table.count + 1 };
  }
</script>

<b>{value}{table.count}{mirror}</b>
<button on:click={bump}>go</button>
