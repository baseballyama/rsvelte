<svelte:options runes={false} />

<script>
  import { afterUpdate, beforeUpdate, tick } from "svelte";

  export let value = 0;

  let before = 0;
  let after = 0;

  beforeUpdate(() => {
    before += 1;
  });

  afterUpdate(() => {
    after += 1;
  });

  afterUpdate(async () => {
    await tick();
  });

  function bump() {
    value += 1;
  }
</script>

<b>{value}{before}{after}</b>
<button on:click={bump}>go</button>
