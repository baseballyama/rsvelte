<script>
  export let items = [];
  let label = "ready";

  $: console.log(items);
  $: console.log(label);
</script>

<button on:click={() => items.push(1)}>{label}</button>
