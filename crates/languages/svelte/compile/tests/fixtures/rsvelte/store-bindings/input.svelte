<script>
	import { writable } from 'svelte/store';
	import Child from './Child.svelte';
	const count = writable(0);
	const obj = writable({ a: 1, list: [{ v: 1 }] });
</script>
<input bind:value={$count} />
<input bind:value={$obj.a} />
<Child bind:value={$count} bind:other={$obj.a} />
{#each $obj.list as item}<input bind:value={item.v} />{/each}
<button onclick={() => { $obj.a++; $count--; ++$count; }}>x</button>
