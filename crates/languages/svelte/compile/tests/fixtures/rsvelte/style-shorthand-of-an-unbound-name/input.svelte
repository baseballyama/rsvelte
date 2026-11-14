<script>
	import { writable } from 'svelte/store';

	const store = writable('v');
	const color = 'red';
	let { size } = $props();
</script>

<div style:$store>x</div>
<p style:color style:size style:width>y</p>
