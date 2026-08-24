<script>
  import Self from "./attribute-names-that-are-keywords.svelte";

  let { depth = 0, slot: slotProp = "s", key = "k", value = "v" } = $props();

  let node = $state(null);
</script>

{#if depth === 0}
  <Self depth={1} key="a" value="b" />
  <div data-slot="x" data-key="y">a</div>
  <div bind:this={node} data-this="z">b</div>
  <input name="key" value="c" />
  <div class="const" id="let" title="function">c</div>
  <div data-bind="1" data-use="2" data-on="3" data-transition="4">d</div>
{:else}
  <b>{slotProp}{key}{value}</b>
{/if}
