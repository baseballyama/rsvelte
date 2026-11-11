<script>
	import { writable } from 'svelte/store';
	import Child from './Child.svelte';

	export let x;
	const y = writable(1);
</script>

<input bind:value={$x} />
<input bind:group={$x} />
<div bind:clientWidth={$x}></div>
<Child bind:v={$x} />
<input bind:value={$y} />
