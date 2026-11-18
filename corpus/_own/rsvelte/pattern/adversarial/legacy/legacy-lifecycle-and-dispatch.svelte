<svelte:options runes={false} accessors />

<script>
  import {
    createEventDispatcher,
    onMount,
    onDestroy,
    beforeUpdate,
    afterUpdate,
    tick,
  } from "svelte";

  export let value = 1;
  export const readOnly = "r";

  const dispatch = createEventDispatcher();

  let mounted = false;

  onMount(() => {
    mounted = true;
    return () => {
      mounted = false;
    };
  });

  onDestroy(() => {});
  beforeUpdate(() => {});
  afterUpdate(async () => {
    await tick();
  });

  function emit() {
    dispatch("change", { value });
  }
</script>

<button on:click={emit}>{value}{mounted}</button>
