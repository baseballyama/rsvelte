<script>
  import Self from "./component-directive-mix.svelte";

  let { depth = 0, value = $bindable(1) } = $props();

  let instance = $state(null);
  const extra = { title: "t" };
</script>

{#if depth === 0}
  <Self
    bind:this={instance}
    bind:value
    depth={1}
    {...extra}
    --custom-prop="red"
    class="wrapper"
  />
  <b>{instance ? 1 : 0}{value}</b>
{:else}
  <b>leaf {value}</b>
{/if}
