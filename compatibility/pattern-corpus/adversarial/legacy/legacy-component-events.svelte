<svelte:options runes={false} />

<script>
  import { createEventDispatcher } from "svelte";
  import Self from "./legacy-component-events.svelte";

  export let depth = 0;

  const dispatch = createEventDispatcher();

  let seen = 0;

  function forward(event) {
    seen += event.detail ?? 1;
    dispatch("bubbled", event.detail);
  }
</script>

{#if depth === 0}
  <Self depth={1} on:custom={forward} on:bubbled />
  <b>{seen}</b>
{:else}
  <button on:click={() => dispatch("custom", 1)}>emit</button>
{/if}
