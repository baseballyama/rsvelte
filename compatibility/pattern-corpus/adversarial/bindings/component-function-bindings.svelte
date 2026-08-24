<script>
  import Self from "./component-function-bindings.svelte";

  let { depth = 0, value = $bindable(0), label = $bindable("l") } = $props();

  let backing = $state(1);
  let text = $state("a");
  let node = $state(null);
  let instance = $state(null);
</script>

{#if depth === 0}
  <Self
    depth={1}
    bind:value={() => backing, (next) => (backing = next)}
    bind:label={
      () => text,
      (next) => {
        text = next;
      }
    }
    bind:this={instance}
  />
  <div bind:this={node}>{backing}{text}{instance ? 1 : 0}{node ? 1 : 0}</div>
{:else}
  <button onclick={() => (value += 1)}>{value}</button>
  <button onclick={() => (label += "!")}>{label}</button>
{/if}
