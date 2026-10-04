<script>
  import Child from '../component-child/input.svelte';
  import Other from '../component-svg-child/input.svelte';
  let UI = $state.raw({ Button: Child, nested: { Button: Child } });
  let value = $state(1);
  let items = $state.raw([{ id: 1, component: Child }, { id: 2, component: Child }]);
</script>
<button id="change" onclick={() => { value++; UI = { Button: Other, nested: { Button: Child } }; }}>change</button>
<UI.Button count={value} label="member" />
<UI.nested.Button count={value} label="nested" />
{#each items as item (item.id)}
  <item.component count={value} label={`item:${item.id}`} />
  {@const Local = item.component}
  <Local count={value} label={`local:${item.id}`} />
{/each}
