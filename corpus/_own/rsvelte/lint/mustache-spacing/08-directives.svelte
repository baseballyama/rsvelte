<script>
	import { fade } from 'svelte/transition';
	let v = '';
	let color = 'red';
	const h = () => {};
</script>

<input bind:value={ v } />
<button on:click="{ h }">quoted directive braces</button>
<div style:color={ color }>a</div>
<div transition:fade={{ duration: 100 }}>object arg is not a spacing violation</div>
