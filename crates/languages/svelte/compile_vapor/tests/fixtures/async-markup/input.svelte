<script>
  import Child from '../component-child/input.svelte';
  let value = $state(1);
</script>
<button id="change" onclick={() => value++}>change</button>
<p title="value:{await Promise.resolve(value)}" data-value={await Promise.resolve(value * 2)}>{value}</p>
<ul>{#each await Promise.resolve([value, value + 1]) as item (item)}<li>{item}</li>{/each}</ul>
<svelte:element this={await Promise.resolve(value % 2 ? 'em' : 'strong')}>{value}</svelte:element>
{@html await Promise.resolve(`<b>${value}</b>`)}
<Child count={await Promise.resolve(value)} label="async" />
