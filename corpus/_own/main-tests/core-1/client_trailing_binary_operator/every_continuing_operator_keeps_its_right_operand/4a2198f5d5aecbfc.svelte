<script>
  export let item;
  export let width = 1;
  $: kind =
    item.a **
    item.b;
  function toggle() { width = 2; }
</script>

<button on:click={toggle}>{kind}{width}</button>
